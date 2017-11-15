define([
    'base/klass',
    'base/element',
    'base/event',
    'util/template/tpl',
    '{pro}module/module.js'
], function (_k, _e, _v, _t0, _m, _tpl, _p) {
    var _pro;

    _p._$$ModuleSlothOperation = _k._$klass();
    _pro = _p._$$ModuleSlothOperation._$extend(_m._$$Module);

    _pro.__doBuild = function () {
        this.__body = _e._$html2node(
            _t0._$getTextTemplate('tpl-sloth-operation-view')
        );
        var _flag = _e._$getByClassName(this.__body, 'j-flag');
        this.__export = {
            parent: _flag[0]
        };
    };

    _m._$regist('sloth-operation-view', _p._$$ModuleSlothOperation);
});
