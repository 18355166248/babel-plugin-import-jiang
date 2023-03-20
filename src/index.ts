import Plugin, { Opts_Props } from "./Plugin";

export type Partial_Opts_Props = Omit<Partial<Opts_Props>, "libraryName"> & {
  libraryName: string;
};

export default function({ types }) {
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
    enter(path, { opts }: { opts: Partial_Opts_Props }) {
      if (!plugins) {
        plugins = [
          // 初始化 plugin
          new Plugin(
            opts.libraryName,
            opts.libraryDirectory,
            opts.style,
            opts.customNameCB,
            types
          ),
        ];
      }
      // 触发 自定义 ProgramEnter 事件 初始化 pluginState 参数
      applyInstance("ProgramEnter", arguments, this);
    },
    exit() {
      // 触发 自定义 ProgramExit 事件 删除已经标记需要删除的节点
      applyInstance("ProgramExit", arguments, this);
    },
  };
  // babel会自动触发的方法
  const methods = ["ImportDeclaration", "CallExpression"];
  // 自定义 plugin 入口要是以 visitor 格式暴露给 babel, 里面放的就是各个 ast 节点的回调, 有 enter 和 exit 两个声明周期 官方是这么说的
  // 当我们向下遍历这颗树的每一个分支时我们最终会走到尽头，于是我们需要往上遍历回去从而获取到下一个节点。 向下遍历这棵树我们进入每个节点，向上遍历回去时我们退出每个节点。
  const config = {
    visitor: {
      Program,
    },
  };

  for (const method of methods) {
    // 动态注册 visitor 事件 处罚 plugin 下的方法
    config.visitor[method] = (...args) => {
      applyInstance(method, args, config.visitor);
    };
  }

  return config;
}
