/**
 * @file 数据源列表model
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-7-17
 */
define(['url'], function (Url) {

    return Backbone.Model.extend({

        /**
         * 加载数据源列表
         *
         * @public
         */
        loadDataSourcesList: function () {
            var that = this;

            $.ajax({
                url: Url.loadDataSourcesList(),
                success: function (data) {
                    that.set('dataSourcesList', data.data);
                }
            });
        },

        /**
         * 删除某一数据源
         *
         * @param {string} dsId 数据源id
         * @public
         */
        deleteDataSources: function (dsId) {
            var that = this;

            $.ajax({
                url: Url.deleteDataSources(dsId),
                type: 'DELETE',
                success: function (data) {
                    that.loadDataSourcesList();
                }
            });
        },

        /**
         * 加载某一数据源所含的表(在设置cube模块用到此方法)
         *
         * @param {string} dsId 数据源id
         * @param {Function} sucess(Object) 加载成功后的回调函数
         * @public
         */
        loadTables: function (dsId, success) {
            var that = this;

            $.ajax({
                url: Url.loadTables(dsId),
                success: function (data) {
                    success(data.data);
                }
            });
        }
    });

});