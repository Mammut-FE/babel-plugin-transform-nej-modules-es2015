import { transformPath } from './transform-path';

describe('transformPath', function () {
    it('transformPath is function', () => {
        expect(transformPath).toBeInstanceOf(Function);
    });

    it('JavaScript 默认去掉后缀, 其余文件保留', () => {
        expect(transformPath('', '', './util.js')).toEqual('./util');
        expect(transformPath('', '', './base/util.js')).toEqual('./base/util');
        expect(transformPath('', '', '/base/util.js')).toEqual('/base/util');

        expect(transformPath('', '', './util.html')).toEqual('./util.html');
        expect(transformPath('', '', './base/util.html')).toEqual('./base/util.html');
        expect(transformPath('', '', '/base/util.html')).toEqual('/base/util.html');
    });

    it('绝对路径直接返回', () => {
        expect(transformPath('src', '', '/base/util.js')).toEqual('/base/util');
        expect(transformPath('', '', '/base/util.html')).toEqual('/base/util.html');
    });

    it('相对路径直接返回', () => {
        expect(transformPath('', '', './util.js')).toEqual('./util');
        expect(transformPath('', '', './util.html')).toEqual('./util.html');
    });

    it('处理 nej 内部module', () => {
        expect(transformPath('' , '', 'base/util.js')).toEqual('nejm/base/util');
        expect(transformPath('' , '', 'base/element.js')).toEqual('nejm/base/element');
        expect(transformPath('' , '', 'util/ajax/xhr.js')).toEqual('nejm/util/ajax/xhr');
    });

    it('alias 语法的路径, 返回相对于 root 路径', () => {
        const root = '/usr/code/project';

        expect(transformPath(root, '/usr/code/project/src/a.js', 'src/b.js')).toEqual('./b');
        expect(transformPath(root, '/usr/code/project/src/a.js', 'src/c/b.js')).toEqual('./c/b');
        expect(transformPath(root, '/usr/code/project/src/d/a.js', 'src/b.js')).toEqual('../b');
        expect(transformPath(root, '/usr/code/project/src/d/a.js', 'src/c/b.js')).toEqual('../c/b');
    });
});
