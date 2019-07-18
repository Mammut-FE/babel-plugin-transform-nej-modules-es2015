import * as template from '@babel/template';
import {
    generatorNejDependencies,
    generatorNejInjects,
    nejCodeParser,
    transformReturnToExport
} from 'babel-helper-nej-transforms';
import {BabelConfig} from './interfaces/babel-config.interface';
import {NodePath} from '@babel/traverse';
import {Program} from '@babel/types';

const buildWrapper = template.statements(`
    IMPORT_LIST

    NEJ_INJECT

    FN_BODY
`);

export default function () {
    return {
        visitor: {
            Program: {
                exit: (program: NodePath<Program>, babelConfig: BabelConfig) => {
                    const {
                        fnBody, dependencies, nejInject
                    } = nejCodeParser(program, babelConfig.opts);

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
