var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/Plugin.ts
var Plugin_exports = {};
__export(Plugin_exports, {
  default: () => Plugin
});
module.exports = __toCommonJS(Plugin_exports);
var import_helper_module_imports = require("@babel/helper-module-imports");
var import_utls = require("./utls");
var import_path = require("path");
var Plugin = class {
  constructor(libraryName, libraryDirectory, style, customNameCB, types, index = 0) {
    this.libraryName = libraryName;
    this.libraryDirectory = typeof libraryDirectory === "undefined" ? "lib" : libraryDirectory;
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
    pluginState.specifiers = /* @__PURE__ */ Object.create(null);
    pluginState.pateToRemove = [];
    pluginState.selectedMethods = [];
  }
  ProgramExit(path, state) {
    this.getPluginState(state).pateToRemove.forEach(
      (p) => !p.removed && p.remove()
    );
  }
  ImportDeclaration(path, state) {
    const { node } = path;
    if (!node)
      return;
    const { value } = node.source;
    const { libraryName, types } = this;
    const pluginState = this.getPluginState(state);
    if (value === libraryName) {
      node.specifiers.forEach((spec) => {
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
      if (pluginState.specifiers[name] && path.scope.hasBinding(name) && path.scope.getBinding(name).path.type === "ImportSpecifier") {
        this.importMethod(pluginState.specifiers[name], file, pluginState);
      }
      return arg;
    });
  }
  importMethod(methodName, file, pluginState) {
    const { customNameCB, libraryDirectory, libraryName, style } = this;
    if (!pluginState.selectedMethods[methodName]) {
      const path = (0, import_utls.windowPath)(
        customNameCB ? customNameCB(methodName, file) : (0, import_utls.windowPath)((0, import_path.join)(libraryName, libraryDirectory, methodName))
      );
      pluginState.selectedMethods[methodName] = (0, import_helper_module_imports.addDefault)(file.path, path, {
        nameHint: methodName
      });
      if (style === true) {
        (0, import_helper_module_imports.addSideEffect)(file.path, `${path}/style`);
      } else if (style === "css") {
        (0, import_helper_module_imports.addSideEffect)(file.path, `${path}/style/css`);
      }
    }
    return { ...pluginState.selectedMethods[methodName] };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
