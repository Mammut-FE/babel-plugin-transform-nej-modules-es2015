import template from '@babel/template';
import fetchNEJdependences from 'babel-helper-nej-transforms';

const buildWrapper = template(`
    IMPORT_LIST
    FN_BODY
`);

export default function ({ types: t }) {
    return {
        visitor: {
            Program: {
                exit: (path, { opts }) => {
                    const {
                        custormModule, textModule, nejModule, fnBody: FN_BODY
                    } = fetchNEJdependences(path, opts);

                    const IMPORT_LIST = [];

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
                        const specifiers = nejModule.map(({ name, nejmName }) => {
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

                    const { directives } = path.node;

                    // 处理 return
                    let lastFnbody = FN_BODY[FN_BODY.length - 1];
                    if (t.isReturnStatement(lastFnbody)) {
                        FN_BODY[FN_BODY.length - 1] = t.exportDefaultDeclaration(lastFnbody.argument);
                    }

                    path.node.directives = [];
                    path.node.body = [];

                    path.pushContainer("body",
                        buildWrapper({
                            IMPORT_LIST,
                            FN_BODY
                        })
                    );

                    path.pushContainer("directives", directives);
                }
            }
        }
    }
};
