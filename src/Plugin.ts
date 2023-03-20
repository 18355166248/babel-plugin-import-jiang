import { addDefault, addSideEffect } from "@babel/helper-module-imports";
import { windowPath } from "./utls";
import { join } from "path";

export interface Opts_Props {
  libraryName: string;
  libraryDirectory?: string;
  style: boolean | "css";
  types: any;
  customNameCB: ((name: string, file: any) => string) | undefined;
  index?: number;
}

export default class Plugin implements Opts_Props {
  libraryName: string; // 依赖仓库的名 比如 antd
  libraryDirectory: string; // 需要自定义配置的依赖路径 默认是 lib
  style: boolean | "css"; // 自定义引入样式文件路径格式
  pluginStateKey: string;
  types: any; // [babel-types](https://babel.dev/docs/babel-types)
  customNameCB: ((name: string, file: any) => string) | undefined; // 自定义依赖路径拼接
  index?: number | undefined;

  constructor(
    libraryName: string,
    libraryDirectory: string | undefined,
    style: boolean | "css" | undefined,
    customNameCB: ((name: string, file: any) => string) | undefined,
    types: any,
    index = 0
  ) {
    this.libraryName = libraryName;
    this.libraryDirectory =
      typeof libraryDirectory === "undefined" ? "lib" : libraryDirectory;
    this.style = style || false;
    this.customNameCB = customNameCB;
    this.types = types;
    this.pluginStateKey = `pluginStateKey${index}`;
  }
  // 基于 state 维护好字典 pluginState
  getPluginState(state) {
    if (!state[this.pluginStateKey]) {
      state[this.pluginStateKey] = {};
    }

    return state[this.pluginStateKey];
  }
  // 初始化字典
  ProgramEnter(path, state) {
    const pluginState = this.getPluginState(state);
    pluginState.specifiers = Object.create(null);
    pluginState.pateToRemove = []; // 待删除节点列表
    pluginState.selectedMethods = []; // 已选中(格式化)节点列表
  }
  // 删除已经被标记需要删除的节点
  ProgramExit(path, state) {
    this.getPluginState(state).pateToRemove.forEach(
      (p) => !p.removed && p.remove()
    );
  }
  // ast import 节点编译触发的钩子
  // 这里主要就是拿到左侧的值 比如说 Button 放入字典 pluginState.specifiers 中, 后续使用, 并把该 import 节点放入 pateToRemove 中, 在节点退出的时候删除该节点
  ImportDeclaration(path, state) {
    const { node } = path; // 节点
    if (!node) return;
    const { value } = node.source;
    const { libraryName, types } = this;
    const pluginState = this.getPluginState(state);

    if (value === libraryName) {
      // 拿到左侧的值
      node.specifiers.forEach((spec) => {
        // https://babeljs.io/docs/babel-types.html
        // 判断是否是解构内的值 也就是 Button 之类的
        if (types.isImportSpecifier(spec)) {
          pluginState.specifiers[spec.local.name] = spec.imported.name;
        }
      });
      pluginState.pateToRemove.push(path);
    }
  }
  // 引入的依赖执行的时候会触发该钩子
  // 主要就是拿到对应的 pluginState, 遍历 arguments 拿到需要引入的遍历名, 触发 importMethod 用于新增 import 代码
  CallExpression(path, state) {
    const { node } = path;
    const file = path && path.hub && path.hub.file;
    const pluginState = this.getPluginState(state);

    node.arguments = node.arguments.map((arg) => {
      const { name } = arg;

      if (
        pluginState.specifiers[name] &&
        path.scope.hasBinding(name) &&
        path.scope.getBinding(name).path.type === "ImportSpecifier"
      ) {
        this.importMethod(pluginState.specifiers[name], file, pluginState);
      }

      return arg;
    });
  }
  // 新增代码
  // 通过 @babel/helper-module-imports 提供新增 ast 代码的方法 新增格式化后的代码 包括组件和组件的样式
  // 注意: 需要通过 pluginState.selectedMethods 做好缓存, 避免同一个依赖多次触发新增代码, 不然新增的代码会递增出现异常, 具体可以自己试一下
  importMethod(methodName, file, pluginState) {
    const { customNameCB, libraryDirectory, libraryName, style } = this;
    if (!pluginState.selectedMethods[methodName]) {
      const path = windowPath(
        customNameCB
          ? customNameCB(methodName, file)
          : windowPath(join(libraryName, libraryDirectory, methodName))
      );
      // 防止重复添加 复用节点
      pluginState.selectedMethods[methodName] = addDefault(file.path, path, {
        nameHint: methodName,
      });

      if (style === true) {
        addSideEffect(file.path, `${path}/style`);
      } else if (style === "css") {
        addSideEffect(file.path, `${path}/style/css`);
      }
    }

    return { ...pluginState.selectedMethods[methodName] };
  }
}
