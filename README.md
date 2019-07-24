# babel-plugin-transform-nej-modules-es2015

>  将NEJ转换成ES6的babel插件

[![Build Status](https://travis-ci.com/Mammut-FE/babel-plugin-transform-nej-modules-es2015.svg?branch=master)](https://travis-ci.com/Mammut-FE/babel-plugin-transform-nej-modules-es2015)


## 安装

```
npm i babel-plugin-transform-nej-modules-es2015 --save-dev
```

## 使用

配置文件

```JavaScript
plugins: [
   ['babel-plugin-transform-nej-modules-es2015', {
       // 项目的根目录地址
       // 注意是项目的根目录地址， 不是源码的根目录地址
       // 用于将 define 中使用的 alias 转换成文件间的相对路径
       root: path.join(__dirname, 'src'),
       // nej alias
       alias: {
           pro: 'src/javascript'
       }
   }]
]
```


## 转换原理

转换的核心是通过 `babel` 的语法解析后，将 `define` 中的依赖通过一定的规则转换成`ES6`

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
   import _k from 'nejm/base/klass';
   import _e from 'nejm/base/element';
   import _v from 'nejm/base/event';
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

   TODO: 添加讲解

4. [NEJ注入变量](https://github.com/genify/nej/blob/master/doc/DEPENDENCY.md#define)

   转换时根据NEJ的注入规则, 在生成文件中添加对应语句.

   ```javascript
   // NEJ code
   define(function(_p, _o, _f, _r){
     // code 
   })

   // ES6 code
   let _p = {};
   let _o = {};
   let _f = function() { };
   let _r = [];


   // 如果function没有return语句
   export defalut _p;
   ```


## 示例代码

[nej-webpack-demo](https://github.com/Mammut-FE/nej-webpack-demo)

## 参与开发

1. 发现:bug:或者有需求可以在issue中提出
2. 贡献代码的话请fork后以`pull request`的方式提交

觉得这个插件不错的话请给个:star:
