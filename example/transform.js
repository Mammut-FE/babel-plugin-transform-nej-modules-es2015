const babel = require('babel-core');
const {
    join
} = require('path');
const {
    writeFileSync
} = require('fs');

// 编写 alias
const alias = {
    '{pro}actions': 'actions',
    '{pro}global': 'global',
    '{pro}store': 'stroe',
    '{pro}lib': 'lib',
    '{common}': 'common/',
    '{components}': 'components/',
    'pro/lib': 'lib',
    'pro/global': 'global'
};

// 导入组件, 使用前请使用 npm run build 生成代码
const options = {
    'plugins': [
        [join(__dirname, '../lib/index'), {
            alias,
            extName: '.es6'
        }]
    ]
};

let result;
if (process.argv.length > 2) {
    const code = `
    define([
        'base/klass',
        'base/element',
        'base/event',
        'util/template/tpl',
        '{pro}module/module.js'
    ], function (_k, _e, _v, _t0, _m, _tpl, _p) {
        var _pro;
    
        _p._$$ModuleSlothOperation = _k._$klass();
        _pro = _p._$$ModuleSlothOperation._$extend(_m._$$Module);
    
        _pro.__doBuild = function () {
            this.__body = _e._$html2node(
                _t0._$getTextTemplate('tpl-sloth-operation-view')
            );
            var _flag = _e._$getByClassName(this.__body, 'j-flag');
            this.__export = {
                parent: _flag[0]
            };
        };
    
        _m._$regist('sloth-operation-view', _p._$$ModuleSlothOperation);
    });
    `
    result = babel.transform(code, options);
} else {
    result = babel.transformFileSync(join(__dirname, 'nej-code.js'), options);
}

writeFileSync(join(__dirname, 'nej-code.out.js'), result.code);
