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
    console.log("ProgramEnter");
    const pluginState = this.getPluginState(state);
    pluginState.specifiers = Object.create(null);
    pluginState.pateToRemove = [];
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
    console.log("CallExpression-state", state);
  }
}
