import { addDefault } from "@babel/helper-module-import";

export default class Plugin {
  libraryName: string;
  libraryDirectory: string;
  style: boolean;
  pluginStateKey: string;
  types: any;
  constructor(libraryName, libraryDirectory, style, types, index = 0) {
    this.libraryName = libraryName;
    this.libraryDirectory =
      typeof libraryDirectory === "undefined" ? "lib" : libraryDirectory;
    this.style = style || false;
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
    pluginState.pateToRemove = [];
    pluginState.selectedMethods = [];
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

    node.arguments.map((arg) => {
      const { name } = arg;

      if (
        pluginState.specifiers[name] &&
        path.scope.hasBinding(name) &&
        path.scope.getBinding(name).path.type === "ImportSpecifier"
      ) {
        this.importMethod(pluginState.specifiers[name], file, pluginState);
      }
    });
  }

  importMethod(methodName, file, pluginState) {
    if (!pluginState.selectedMethods[methodName]) {
      console.log("methodName", methodName);
      addDefault(file.path)
    }

    return pluginState.selectedMethods[methodName];
  }
}
