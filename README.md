# babel插件

实现解析 import Button from 'antd'

[如何写自定义babel plugin](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/README.md)

[在线代码解析ast](https://astexplorer.net/)

参考项目[babel-plugin-import](https://www.npmjs.com/package/babel-plugin-import)

## 在哪里使用

- [babelrc](https://babeljs.io/docs/usage/babelrc/)
- [babel-loader](https://github.com/babel/babel-loader)

## 例子

### { libraryName: "antd" }

```ts
import { Button } from "antd";

ReactDom.render(
  <div>
    <Button />
  </div>
);

      ↓ ↓ ↓ ↓ ↓ ↓

import _Button from "antd/lib/Button";
ReactDom.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, null)));
```

### {libraryName: "antd", style: true }

```ts
import { Button } from "antd";

ReactDom.render(
  <div>
    <Button></Button>
  </div>
);

      ↓ ↓ ↓ ↓ ↓ ↓

import "antd/lib/Button/style";
import _Button from "antd/lib/Button";
ReactDom.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, null)));


```

### { libraryName: "antd", style: "css"}

```ts
import { Button } from "antd";

ReactDom.render(
  <div>
    <Button></Button>
  </div>
);

      ↓ ↓ ↓ ↓ ↓ ↓

import "antd/lib/Button/style/css";
import _Button from "antd/lib/Button";
ReactDom.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, null)));


```

### { libraryName: "antd", libraryDirectory: "es"  }

```ts
import { Button } from "antd";

ReactDom.render(
  <div>
    <Button />
  </div>
);

      ↓ ↓ ↓ ↓ ↓ ↓

import _Button from "antd/es/Button";
ReactDom.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, null)));
```

### { libraryName: "antd",  customNameCB: (name, file) => { if (fileName) return `antd/custom-name/${name}` }}

```ts
import { Button } from "antd";

ReactDom.render(
  <div>
    <Button />
  </div>
);

      ↓ ↓ ↓ ↓ ↓ ↓

import _Button from "antd/custom-name/Button";
ReactDom.render( /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, null)));
```
