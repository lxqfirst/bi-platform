/**
 * @file 报表的公共功能 - model
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-10-10
 */
define(['url'], function (Url) {

    return Backbone.Model.extend({
        initialize: function () {

        },

        /**
         * 发布报表
         *
         * @param {Function} success 回调函数
         * @public
         */
        publishReport: function (type, reportId, success) {
            $.ajax({
                url: Url.publishReport(reportId),
                type: type,
                success: function (data) {
                    success(data.data);
                }
            });
        }
    });

});