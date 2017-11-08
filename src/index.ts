import template from 'babel-template';

const buildCommonjs = template(`
    IMPORT_LIST
    FN_BODY
`)

export default function ({ types: t }) {
    return {
        visitor: {
            Program: {
                exit: (path) => {
                    let deps;
                    let alias;
                    let fnBody: any[];

                    path.traverse({
                        CallExpression: (_path) => {
                            const { node } = _path;

                            if (node.callee.name === 'define') {
                                deps = node.arguments[0].elements.map(dep => {
                                    return dep.value;
                                });

                                if (t.isFunctionExpression(node.arguments[1])) {
                                    fnBody = node.arguments[1].body.body;

                                    alias = node.arguments[1].params.map(param => {
                                        return param.name;
                                    });
                                }
                            }
                        }
                    });

                    let lastFnbody = fnBody[fnBody.length - 1];

                    if (t.isReturnStatement(lastFnbody)) {
                        fnBody[fnBody.length - 1] = t.exportDefaultDeclaration(lastFnbody.argument);
                    }

                    const IMPORT_LIST = deps.map((dep, i) => {
                        const specifiers = [];
                        if (alias[i]) {
                            specifiers.push(t.ImportDefaultSpecifier(t.Identifier(alias[i])));
                        }
                        return t.ImportDeclaration(specifiers, t.StringLiteral(dep))
                    });

                    const { directives } = path.node;

                    path.node.directives = [];
                    path.node.body = [];

                    path.pushContainer("body",
                        buildCommonjs({
                            IMPORT_LIST,
                            FN_BODY: fnBody
                        })
                    );
                }
            }
        }
    }
};
