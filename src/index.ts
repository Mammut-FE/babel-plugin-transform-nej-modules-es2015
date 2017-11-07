import template from 'babel-template';

const buildCommonjs = template(`
    IMPORT_LIST
`)

export default function ({ types: t }) {
    return {
        visitor: {
            Program: {
                exit: (path) => {
                    let deps;
                    let alias;

                    path.traverse({
                        CallExpression: ({ node }) => {
                            if (node.callee.name === 'define') {
                                deps = node.arguments[0].elements.map(dep => {
                                    return dep.value;
                                });

                                if (t.isFunctionExpression(node.arguments[1])) {
                                    alias = node.arguments[1].params.map(param => {
                                        return param.name;
                                    });
                                }
                            }
                        }
                    })

                    const IMPORT_LIST = deps.map((dep, i) => {
                        const specifiers = [];
                        if (alias[i]) {
                            specifiers.push(t.ImportDefaultSpecifier(t.Identifier(alias[i])));
                        }
                        return t.ImportDeclaration(specifiers, t.StringLiteral(dep))
                    });

                    const { body, directives } = path.node;

                    path.node.directives = [];
                    path.node.body = [];

                    path.pushContainer("body",
                        buildCommonjs({
                            IMPORT_LIST
                        })
                    );
                }
            }
        }
    }
};
