import { dirname, isAbsolute, join, relative } from 'path';

function checkIsNejModule(source: string) {
    return /^\b(base|ui|util|platform)/i.test(source);
}

/**
 * 转换依赖路径为相对文件的地址
 * @param root - 项目根目录
 * @param filePath - 文件地址
 * @param source - 依赖文件地址
 */
export function transformPath(root: string, filePath: string, source: string) {
    let relativePath = source;

    if (!(isAbsolute(source) || source.startsWith('.'))) {
        if (checkIsNejModule(source)) {
            relativePath = 'nejm/' + source;
        } else {
            const sourceAbsolutePath = join(root, source);
            relativePath = relative(dirname(filePath), sourceAbsolutePath);

            if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
            }
        }
    }


    return relativePath.replace(/\.js$/i, '');
}
