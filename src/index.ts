import * as template from '@babel/template';
import * as types from '@babel/types';
import { fetchNejDependence } from 'babel-helper-nej-transforms';

const buildWrapper = template(`
    IMPORT_LIST

    NEJ_INJECT

    FN_BODY
`);

export default function () {
    return {
        visitor: {
            Program: {
                exit: (path, {opts}) => {
                    const {
                        custormModule, textModule, nejModule, nejInject, fnBody: FN_BODY
                    } = fetchNejDependence(path, opts);

                    const IMPORT_LIST = [];
                    const NEJ_INJECT = [];

                    /**
                     * 处理 nej 依赖, 转换成依赖 nejm https://github.com/lleohao/nejm
                     *
                     * @example
                     * in:
                     * define(['base/klass','base/util','util/template/tpl','util/dispatcher/regularModule'], function(_k, _u, _t, _m){
                     *     // code ...
                     * });
                     * out:
                     * import { klass as _k, util as _u, utilTemplateTpl as _t, utilRegularModule as _m } from "nejm";
                     */
                    if (nejModule.length) {
                        const specifiers = nejModule.map(({name, nejmName, source}) => {
                            if (!name) {
                                throw path.buildCodeFrameError(`${source} 被引入, 但为被使用!`);
                            }
                            return types.importSpecifier(types.identifier(name), types.identifier(nejmName));
                        });
                        IMPORT_LIST.unshift(types.importDeclaration(specifiers, types.stringLiteral('nejm')));
                    }

                    /**
                     * 处理文本依赖
                     *
                     * @example
                     * in:
                     * defint(['regular!./tpl.html', 'text!./style.css', 'json!./data.json'], function(_tpl, _css, _data) {
                     *      // code ...
                     * });
                     * out:
                     * import * as _tpl from "./tpl.html";
                     * import * as _css from "./style.css";
                     * import * as _data from "./data.json";
                     */
                    if (textModule.length) {
                        textModule.forEach(({source, name}) => {
                            if (!name) {
                                throw path.buildCodeFrameError(`${source} 被引入, 但为被使用!`);
                            }
                            const specifiers = [types.importNamespaceSpecifier(types.identifier(name))];
                            IMPORT_LIST.push(types.importDeclaration(specifiers, types.stringLiteral(source)));
                        });
                    }

                    if (custormModule.length) {
                        custormModule.forEach(({source, name}) => {
                            const specifiers = [];

                            if (name) {
                                specifiers.push(types.importDefaultSpecifier(types.identifier(name)));
                            }

                            IMPORT_LIST.push(types.importDeclaration(specifiers, types.stringLiteral(source)));
                        });
                    }

                    if (nejInject.length) {
                        if (nejInject.length > 4) {
                            throw path.buildCodeFrameError(`NEJ 的注入变量超过了4个!`);
                        }
                        const injects = [
                            types.objectExpression([]),
                            types.objectExpression([]),
                            types.functionExpression(null, [], types.blockStatement([types.returnStatement((types.booleanLiteral(false)))])),
                            types.arrayExpression([])
                        ];

                        // nejInject.forEach(name => {
                        //     nejInject.push(types.variableDeclaration('var', [types.variableDeclarator(types.identifier(name), injects.shift())]));
                        // });
                    }

                    const {directives} = path.node;

                    // 处理 return
                    let lastFnbody = FN_BODY[FN_BODY.length - 1];
                    if (types.isReturnStatement(lastFnbody)) {
                        FN_BODY[FN_BODY.length - 1] = types.exportDefaultDeclaration(lastFnbody.argument);
                    } else if (nejInject.length) { // 没有导出时, 并且通过nej注入了 _p, 则默认抛出 _p
                        FN_BODY.push(types.exportDefaultDeclaration(types.identifier(nejInject[0])));
                    }

                    path.node.directives = [];
                    path.node.body = [];

                    path.pushContainer('body',
                        buildWrapper({
                            IMPORT_LIST,
                            NEJ_INJECT,
                            FN_BODY
                        })
                    );

                    path.pushContainer('directives', directives);
                }
            }
        }
    };
};
