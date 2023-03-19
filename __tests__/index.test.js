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
    const expectedFile = join(packageDir, "expedted.js");

    it(`work with ${fileName.split("-").join(" ")}`, () => {
      const pluginWithOpts = [
        plugin,
        {
          libraryName: "antd",
        },
      ];
      console.log("actualFile", actualFile);
      const actualRes = (function() {
        return transformFileSync(actualFile, {
          presets: ["@babel/preset-react"],
          plugins: [pluginWithOpts],
        }).code;
      })();

      console.log("actualRes", actualRes);
    });
  });
});
