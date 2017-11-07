define([
    'util/dispatcher/regularModule',
    'regular!./search.html',
    'text!./search.css',
    'util/template/tpl',
    '{pro}store/store.js',
    '{pro}actions/managementActionsCreator.js',
    '{pro}global/util.js',
    '{components}pagination/pagination.js'
], function (_m, _tpl, _css, _t, _store, _creator, _util) {

    var _p = {};

    _t._$parseUITemplate('<textarea name="css" id="css-box">' + _css + '</textarea>');

    _p._$$ModuleManagementTableSearch = Regular.extend({
        template: _tpl,
        init: function () {
            _util.connect(this, _store, 'management');
        },
        config: function () {
            var mng = _store.getState().management;

            this.data.searchResult = mng.searchResult;
            this.data.isSearching = true;
        },
        __onRefresh: function (options) {
            var data = this.data;

            data.type = options.param.type;
            data.query = options.param.query;
            data.page = 1;
            data.count = 15;
            data.isSearching = true;

            _store.dispatch(_creator.emptyTableList());
            this.setListSum(null);
            _store.dispatch(_creator.searchTableList(
                data.type, data.query, this.setListSum._$bind(this)
            ));
        },
        setListSum: function (sum) {
            if (!sum) return;
            this.data.isSearching = false;
            _util.eventEmitter.publish('listLoaded', sum);
        }
    });

    return _m._$regist('management-table-view-search', _p._$$ModuleManagementTableSearch);
});
