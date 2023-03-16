export default class Plugin {
  libraryName: string;
  libraryDirectory: string;
  style: boolean;
  pluginStateKey: string;
  constructor(libraryName, libraryDirectory, style, index = 0) {
    console.log(libraryName, libraryDirectory, style);
    this.libraryName = libraryName;
    this.libraryDirectory =
      typeof libraryDirectory === "undefined" ? "lib" : libraryDirectory;
    this.style = style || false;
    this.pluginStateKey = `pluginStateKey${index}`;
  }
}
