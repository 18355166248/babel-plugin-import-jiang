import Plugin from "./Plugin";

export default function () {
  let plugins = null;
  const Program = {
    // opts 是 babel 配置 plugin 的第二个参数
    enter(path, { opts = {} }: any) {
      console.log(opts);
      if (!plugins) {
        plugins = new Plugin(
          opts.libraryName,
          opts.libraryDirectory,
          opts.style
        );
      }
    },
  };

  const config = {
    visitor: {
      Program,
    },
  };

  return config;
}
