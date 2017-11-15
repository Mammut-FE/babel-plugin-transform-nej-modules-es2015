# babel-plugin-transform-nej-modules-es2015

将NEJ转换成ES6的babel插件



## 安装

```Node
npm i babel-plugin-transform-nej-modules-es2015 --save-dev
```



## 使用

1. 编写`.babelrc`文件

   ```json
   {
     plugins: ['transform-nej-modules-es2015']
   }
   ```

2. 添加可选配置

   ```typescript
   export interface Options {
       /**
        * 移除文本文件前面的标志(text! regular! json!)
        *
        * @default true
        */
       replaceTextModule?: boolean;
       /**
        * 为了能够将源码存放在现有的项目文件夹, 同时又需要使用 .js 后缀而做的妥协
        *
        * @default ""
        *
        * @example
        * extName: '.es6'
        * inFileName: store.js
        * outFileName: store.es6.js
        */
       extName?: string;
       /**
        * 处理nej的依赖管理, 转换成 es6 的模块管理
        * 详细信息: https://medium.com/@davidjwoody/how-to-use-absolute-paths-in-react-native-6b06ae3f65d1
        *
        * 转换成如下的方式进行模块的导入
        * import Thing from ‘AwesomeApp/app/some/thing’
        * create 'AwesomeApp/app/package.json' ==> { “name”: “app” } (注意name的值需要和文件夹的名称相同)
        * import Thing from ‘app/some/thing’
        *
        * @example
        * alias = {
        *     '{pro}lib': 'lib',
        *     '{common}': 'common/'
        * }
        *
        * {pro}lib/redux/redux.js ==> lib/redux/redux
        * /pro/lib/redux/redux    ==> lib/redux/redux
        * {common}tree/tree.js    ==> common/tree/tree
        * /common/tree/tree.js    ==> common/tree/tree
        */
       alias?: {
           [key: string]: string;
       };
   }
   ```



## 转换规则

转换的核心是通过`babel`的语法解析后，将`define`中的依赖通过一定的规则转换成`ES6`

>事先约定: define([source1, sorurce2, …], functuin(nam1, name2, ….) {});

转换规则如下

1. NEJ 的内置模块

   ```javascript
   // NEJ code
   define([
      'base/klass',
      'base/element',
      'base/event'
   ], function (_k, _e, _v) {
     // code
   })

   // ES6 code
   import {
       klass as _k,
       element as _e,
       event as _v
   } from 'nejm';
   ```

2. 文本模块

   ```javascript
   // NEJ code
   define([
       'text!./jobLeftBar.html',
       'text!./jobLeftBar.css'
   ], function (_tpl, _css) {
     // code
   })

   // ES6 code
   import * as _tpl from './jobLeftBar.html';
   import * as _css from './jobLeftBar.css';
   ```

3. 自定义模块

   ```javascript
   // NEJ code
   define([
       './createFolderWin/createFolderWin.js',
       'components/contextMenu/contextMenu',
       'components/explorer/explorer'
   ], function (_createFolderWin, _contextMenu) {
     // code
   })

   // ES6 code
   import _createFolderWin from './createFolderWin/createFolderWin';
   import _contextMenu from 'components/contextMenu/contextMenu';
   import 'components/explorer/explorer'
   ```

4. 支持[NEJ自定义路径](https://github.com/genify/nej/blob/master/doc/DEPENDENCY.md#自定义路径)

   > 转换的最大阻碍来源于NEJ的自定义路径如何转换成**合法**的ES6语法

   下图来源于我们的实际项目, 根据实际需求添加了`components, common, pro, lib`等自定义路径

   ```
   .src
   ├── components    					=>  component
   │   ├── treeList
   │   ├── treeListWithCheck
   │   └── validation
   ├── css
   ├── html
   │   ├── common						=>  common
   │   │   ├── editNode
   │   │   └── svgGraph
   │   ├── module
   │   │   ├── develop
   │   │   └── versions
   │   ├── operation
   │   │   └── log
   │   └── userinfo
   │       └── log
   ├── javascript						=> pro
   │   ├── actions
   │   ├── global
   │   │   └── datastruct
   │   ├── lib							=> lib
   │   │   ├── bluebird
   │   │   ├── redux
   │   │   └── sql-formatter
   │   ├── module
   │   ├── reducers
   │   ├── route
   │   └── store

   ```

   在使用中, 我们有如下的使用方法

   ```javascript
   define([
       '{commonponents}treeList/treeList.js',
     	'{common}editNode/editNode.js',
     	'{pro}action/developActions.js',
     	'pro/global/util'					// 注意这里对 pro 路径的引用
   ], function(...) {
     // code
   });
   ```

   理想的转换是变成如下的情况

   ```javascript
   import treeList from 'commonponents/treeList/treeList';
   import editNode from 'common/editNode/editNode';
   import developActions from 'action/developActions';
   import util from 'global/util';
   ```

   这时候需要配置`alias`

   ```javascript
   alias = {
     '{commonponents}': 'commonponents/',
     '{common}': 'common/',
     '{pro}action': 'action',
     'pro/global': 'global'
   }

   // 转换核心是将 '{common}' => /^\{common\}/ 来进行匹配
   ```

   然后通过 [How to Use Absolute Paths in React Native](https://medium.com/@davidjwoody/how-to-use-absolute-paths-in-react-native-6b06ae3f65d1) 这篇文章来完成模块的引用

5. [NEJ注入变量](https://github.com/genify/nej/blob/master/doc/DEPENDENCY.md#define)

   转换时根据NEJ的注入规则, 在生成文件中添加对应语句.

   ```javascript
   // NEJ code
   define(function(_p, _o, _f, _r){
     // code 
   })

   // ES6 code
   let _p = {};
   let _o = {};
   let _f = function() {return false};
   let _r = [];


   // 如果function没有return语句
   export defalut _p;
   ```

   ​

## 示例代码

1. clone项目到本地

   `git clone git@github.com:Mammut-FE/babel-plugin-transform-nej-modules-es2015.git `

2. 安装依赖并编译

   `npm i & npm run build`

3. 进入`example`文件夹运行`transform.js`

   ```Shell
   cd example

   node transform.js			// 转换目录下的nej-code.js文件
   node transform.js code      // 转换 transform.js 中 code 对应的文本
   ```



## 参与开发

1. 发现:bug:或者有需求可以在issue中提出
2. 贡献代码的话请fork后以`pull request`的方式提交



觉得这个插件不错的话请给个:star: