define([
    'base/util',
    '{util}ajax/xhr.js',
    'util/template/tpl',
    'regular!./template.html',
    'text!/styles/style.css',
    'pro/global/constant',
    '{pro}global/util.js',
    'pro/service/managementServices',
    './header/header.js'
], function (_u, _j, _t, _tpl, _css, _cns, _util, _service, _header, _p) {
    _t._$parseUITemplate('<textarea name="css" id="css-box">' + _css + '</textarea>');

    _p.component = Regular.extend({
        template: _tpl,
        config: function () {
            this.data.cns = _cns;
        },
        init: function () {
            _service.fetch('test').then(function (res) {
                _util.transform(res);
            });
        }
    });

    _p.component.component('Header', _header);
});
