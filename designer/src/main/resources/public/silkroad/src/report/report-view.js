/**
 * @file 报表的公共功能 - view
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-10-10
 */
define([
        'template',
        'dialog',
        'report/report-model',
        'report/publish-report-dialog-template'
    ],
    function (
        template,
        dialog,
        ReportModel,
        publishReportDialogTemplate
    ) {
        return Backbone.View.extend({

            /**
             * 构造函数
             *
             * @constructor
             */
            initialize: function () {
                var that = this;

                that.model = new ReportModel({
                    id: that.id
                });
            },

            /**
             * 发布报表
             *
             * @public
             */
            publishReport: function (type, reportId) {
                // 列表调用需要动态传递id
                reportId = reportId || this.id;

                this.model.publishReport(type, reportId, function (data) {
                    var renderData = {
                        url: data,
                        type: type
                    };

                    dialog.showDialog({
                        content: publishReportDialogTemplate.render(renderData),
                        title: '报表发布成功',
                        dialog: {
                            height: 500,
                            width: 810,
                            open: function () {
                                var $this = $(this);

                                // 弹框内的dom事件绑定
                                $this.find('.j-report-list').click(function () {
                                    $this.dialog('close');
                                    require(['report/list/main-view'], function (ReportListView) {
                                        window.dataInsight.main.destroy();
                                        new ReportListView({el: $('.j-main')});
                                    });
                                });

                                $this.find('.j-report-edit').click(function () {
                                    $this.dialog('close');
                                    require(
                                        ['report/edit/main-view'],
                                        function (EditReportView) {
                                            window.dataInsight.main.destroy();
                                            new EditReportView({
                                                el: $('.j-main'),
                                                id: reportId,
                                                isEdit: true
                                            });
                                        }
                                    );
                                });
                            },
                            buttons: {
                                '确定': function () {
                                    $(this).dialog('close');
                                }
                            }
                        }
                    });

                });
            }
        });
    }
);