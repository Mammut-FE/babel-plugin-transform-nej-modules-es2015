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
                exit: (path) => {
                    const {
                        custormModule, textModule, nejModule, fnBody: FN_BODY
                    } = fetchNEJdependences(path);

                    const IMPORT_LIST = [];

                    if (nejModule.length) {
                        const specifiers = nejModule.map(({ name, nejmName }) => {
                            return t.importSpecifier(t.Identifier(name), t.Identifier(nejmName))
                        })
                        IMPORT_LIST.unshift(t.ImportDeclaration(specifiers, t.StringLiteral('nejm')));
                    }

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
                }
            }
        }
    }
};
