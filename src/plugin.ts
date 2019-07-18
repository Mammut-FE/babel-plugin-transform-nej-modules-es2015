import * as template from '@babel/template';
import { NodePath } from '@babel/traverse';
import { Program } from '@babel/types';
import {
    generatorNejDependencies,
    generatorNejInjects,
    nejCodeParser,
    transformReturnToExport
} from 'babel-helper-nej-transforms';
import { BabelConfig } from './interfaces/babel-config.interface';
import { transformPath } from './transform-path';

const buildWrapper = template.statements(`
    IMPORT_LIST

    NEJ_INJECT

    FN_BODY
`);

export function transformPlugin() {
    return {
        visitor: {
            Program: {
                exit: (program: NodePath<Program>, babelConfig: BabelConfig) => {
                    const {filename, opts} = babelConfig;
                    const {
                        fnBody, dependencies, nejInject
                    } = nejCodeParser(program, opts);


                    dependencies.forEach(dep => {
                        dep.source = transformPath(opts.root, filename, dep.source);
                    });

                    const IMPORT_LIST = generatorNejDependencies(dependencies);
                    const NEJ_INJECT = generatorNejInjects(nejInject);
                    const FN_BODY = transformReturnToExport(fnBody, nejInject);

                    program.node.body = buildWrapper({
                        IMPORT_LIST,
                        NEJ_INJECT,
                        FN_BODY
                    });
                }
            }
        }
    };
};
