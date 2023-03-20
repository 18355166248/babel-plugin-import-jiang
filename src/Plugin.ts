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
  libraryName: string;
  libraryDirectory: string;
  style: boolean | "css";
  pluginStateKey: string;
  types: any;
  customNameCB: ((name: string, file: any) => string) | undefined;
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

  getPluginState(state) {
    if (!state[this.pluginStateKey]) {
      state[this.pluginStateKey] = {};
    }

    return state[this.pluginStateKey];
  }

  ProgramEnter(path, state) {
    const pluginState = this.getPluginState(state);
    pluginState.specifiers = Object.create(null);
    pluginState.pateToRemove = []; // 待删除节点列表
    pluginState.selectedMethods = []; // 已选中(格式化)节点列表
  }

  ProgramExit(path, state) {
    this.getPluginState(state).pateToRemove.forEach(
      (p) => !p.removed && p.remove()
    );
  }

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
