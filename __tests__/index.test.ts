import { transform } from "babel-core";
import plugin from "../src";

var example = `import { Button } from 'antd'`;

describe("index", () => {
  it("works", () => {
    const { code } = transform(example, {
      plugins: [
        [
          plugin,
          {
            libraryName: "antd",
            libraryDirectory: "es",
            style: true,
          },
        ],
      ],
    });
  });
  ``;
});
