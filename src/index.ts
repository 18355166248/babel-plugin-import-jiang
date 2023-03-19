import Plugin from "./Plugin";

export default function ({ types }) {
  let plugins: any = null;

  function applyInstance(method, args, context) {
    for (const plugin of plugins) {
      if (plugin[method]) {
        plugin[method].apply(plugin, [...args, context]);
      }
    }
  }

  const Program = {
    // opts 是 babel 配置 plugin 的第二个参数
    enter(path, { opts = {} }: any) {
      if (!plugins) {
        plugins = [
          new Plugin(
            opts.libraryName,
            opts.libraryDirectory,
            opts.style,
            types
          ),
        ];
      }

      applyInstance("ProgramEnter", arguments, this);
    },
    exit() {},
  };
  // babel会自动触发的方法
  const methods = ["ImportDeclaration", "CallExpression"];

  const config = {
    visitor: {
      Program,
    },
  };

  for (const method of methods) {
    config.visitor[method] = (...args) => {
      applyInstance(method, args, config.visitor);
    };
  }

  return config;
}
