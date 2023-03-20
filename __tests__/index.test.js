import { transformFileSync, transform } from "babel-core";
import plugin from "../src";
import { join } from "path";
import { readFileSync, readdirSync } from "fs";

describe("index", () => {
  afterEach(() => {});

  const packagesDir = join(__dirname, "./packages");
  const packages = readdirSync(packagesDir);

  console.log("packages", packages);
  packages.forEach((fileName) => {
    const packageDir = join(packagesDir, fileName);
    const actualFile = join(packageDir, "actual.js");
    const expectedFile = join(packageDir, "expected.js");

    it(`work with ${fileName.split("-").join(" ")}`, () => {
      let pluginWithOpts = [];

      if (fileName === "antd-name") {
        pluginWithOpts = [
          plugin,
          {
            libraryName: "antd",
          },
        ];
      } else if (fileName === "antd-style-name") {
        pluginWithOpts = [
          plugin,
          {
            libraryName: "antd",
            style: true,
          },
        ];
      } else if (fileName === "antd-style-css-name") {
        pluginWithOpts = [
          plugin,
          {
            libraryName: "antd",
            style: "css",
          },
        ];
      } else if (fileName === "antd-library-directory") {
        pluginWithOpts = [
          plugin,
          {
            libraryName: "antd",
            libraryDirectory: "es",
          },
        ];
      } else if (fileName === "antd-custom-name") {
        pluginWithOpts = [
          plugin,
          {
            libraryName: "antd",
            customNameCB: (name, file) => {
              if (fileName) return `antd/custom-name/${name}`;
            },
          },
        ];
      }

      const actualRes = (function() {
        return transformFileSync(actualFile, {
          presets: ["@babel/preset-react"],
          plugins: [pluginWithOpts],
        }).code;
      })();
      const expectedRes = readFileSync(expectedFile, "utf-8");

      expect(actualRes.trim()).toEqual(expectedRes.trim());
    });
  });
});
