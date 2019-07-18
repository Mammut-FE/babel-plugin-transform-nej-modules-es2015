import { transformFileSync, TransformOptions } from '@babel/core';
import * as path from 'path';
import { transformPlugin } from '../src/plugin';
import { expectCodeEqual } from './test.util';


describe('plugin', () => {
    it('transformPlugin is function', () => {
        expect(transformPlugin).toBeInstanceOf(Function);
    });


    describe('测试转换文件', () => {
        const options: TransformOptions = {
            plugins: [
                [path.join(__dirname, '../dist/index'), {
                    root: path.join(__dirname, 'project'),
                    alias: {
                        pro: 'src/javascript'
                    }
                }]
            ]
        };

        function getTransformCode(filename: string) {
            return transformFileSync(path.join(__dirname, `project/src/${filename}`), options).code;
        }

        it('转换没有 return 语句的 nej 文件', () => {
            expectCodeEqual(getTransformCode('nej-code-without-return.js'), `
                import _u from "nejm/base/util";
                import _j from "nejm/util/ajax/xhr";
                import _t from "nejm/util/template/tpl";
                import * as _tpl from "./template.html";
                import * as _css from "/styles/style.css";
                import _cns from "./javascript/global/constant";
                import _util from "./javascript/global/util";
                import _service from "./javascript/service/managementServices";
                import _header from "./header/header";
                
                var _p = {};
                
                _t._$parseUITemplate('<textarea name="css" id="css-box">' + _css + '</textarea>');

                _p.component = Regular.extend({
                    template: _tpl,
                    config: function () {
                        this.data.cns = _cns;
                    },
                    init: function () {
                        _service.fetch('test').then(function (res) {
                            _util.transform(res);
                        });
                    }
                });
            
                _p.component.component('Header', _header);
                
                export default _p;
            `);
        });

        it('转换带有 return 语句的 nej 文件', () => {
            expectCodeEqual(getTransformCode('folder/nej-code-with-return.js'), `
                import _u from "nejm/base/util";
                import _j from "nejm/util/ajax/xhr";
                import _t from "nejm/util/template/tpl";
                import * as _tpl from "./template.html";
                import * as _css from "/styles/style.css";
                import _cns from "../javascript/global/constant";
                import _util from "../javascript/global/util";
                import _service from "../javascript/service/managementServices";
                import _header from "./header/header";
                
                _t._$parseUITemplate('<textarea name="css" id="css-box">' + _css + '</textarea>');

                export default Regular.extend({
                    template: _tpl,
                    config: function () {
                        this.data.cns = _cns;
                    },
                    init: function () {
                        _service.fetch('test').then(function (res) {
                            _util.transform(res);
                        });
                    }
                }).component('Header', _header);
            `);
        });
    });
});
