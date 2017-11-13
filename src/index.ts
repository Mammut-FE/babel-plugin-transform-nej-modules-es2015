import * as template from 'babel-template';
import { fetchNejDependence } from 'babel-helper-nej-transforms';
import { ReturnStatement } from '../../babel-helper-nej-transforms/node_modules/@types/babel-types';

const buildWrapper = template(`
    IMPORT_LIST

    NEJ_INJECT

    FN_BODY
`);

export default function ({ types: t }) {
    return {
        visitor: {
            Program: {
                exit: (path, { opts }) => {
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
                        const specifiers = nejModule.map(({ name, nejmName, source }) => {
                            if (!name) {
                                throw path.buildCodeFrameError(`${source} 被引入, 但为被使用!`);
                            }
                            return t.importSpecifier(t.Identifier(name), t.Identifier(nejmName))
                        })
                        IMPORT_LIST.unshift(t.ImportDeclaration(specifiers, t.StringLiteral('nejm')));
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
                        textModule.forEach(({ source, name }) => {
                            if (!name) {
                                throw path.buildCodeFrameError(`${source} 被引入, 但为被使用!`);
                            }
                            const specifiers = [t.ImportNamespaceSpecifier(t.Identifier(name))];
                            IMPORT_LIST.push(t.ImportDeclaration(specifiers, t.StringLiteral(source)));
                        });
                    }

                    if (custormModule.length) {
                        custormModule.forEach(({ source, name }) => {
                            const specifiers = [];

                            if (name) {
                                specifiers.push(t.ImportDefaultSpecifier(t.Identifier(name)));
                            }

                            IMPORT_LIST.push(t.ImportDeclaration(specifiers, t.StringLiteral(source)));
                        });
                    }

                    if (nejInject.length) {
                        if (nejInject.length > 4) {
                            throw path.buildCodeFrameError(`NEJ 的注入变量超过了4个!`);
                        }
                        const injects = [
                            t.objectExpression([]),
                            t.objectExpression([]),
                            t.functionExpression(null, [], t.blockStatement([t.returnStatement((t.booleanLiteral(false)))])),
                            t.arrayExpression([])
                        ];

                        nejInject.forEach(name => {
                            NEJ_INJECT.push(t.variableDeclaration('const', [t.variableDeclarator(t.identifier(name), injects.shift())]));
                        });
                    }

                    const { directives } = path.node;

                    // 处理 return
                    let lastFnbody = FN_BODY[FN_BODY.length - 1];
                    if (t.isReturnStatement(lastFnbody)) {
                        FN_BODY[FN_BODY.length - 1] = t.ExportDefaultDeclaration((lastFnbody as ReturnStatement).argument);
                    } else if (nejInject.length) { // 没有导出时, 并且通过nej注入了 _p, 则默认抛出 _p
                        FN_BODY.push(t.ExportDefaultDeclaration(t.Identifier(nejInject[0])));
                    }

                    path.node.directives = [];
                    path.node.body = [];

                    path.pushContainer("body",
                        buildWrapper({
                            IMPORT_LIST,
                            NEJ_INJECT,
                            FN_BODY
                        })
                    );

                    path.pushContainer("directives", directives);
                }
            }
        }
    }
};
