/**
 * @file 数据源列表view
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-7-17
 */
define([
        'template',
        'dialog',
        'data-sources/list/main-model',
        'data-sources/list/main-template'
    ],
    function (template, dialog, MainModel, mainTemplate) {

        return Backbone.View.extend({
            // 事件
            events: {
                'click .j-add-data-sources': 'addDataSources',
                'click .j-delete-data-sources': 'deleteDataSources',
                'click .j-edit-data-sources': 'editDataSources'
            },

            /**
             * 构造函数
             *
             * @param {Object} option 初始化参数
             * @param {$HTMLElement} option.el .j-main
             * @constructor
             */
            initialize: function () {
                var that = this;

                that.model = new MainModel();
                this.listenTo(
                    this.model,
                    'change:dataSourcesList',
                    function (model, data) {
                        that.$el.html(
                            mainTemplate.render({
                                dataSourcesList: data
                            })
                        );
                    }
                );

                this.model.loadDataSourcesList();
                window.dataInsight.main = this;
            },

            /**
             * 添加数据源按钮对应的处理函数
             *
             * @public
             */
            addDataSources: function () {
                window.dataInsight.main.destroy();
                // 进数据源添加/编辑模块
                require([
                        'data-sources/create-view'
                    ],
                    function (DataSourcesCreateView) {
                        new DataSourcesCreateView({
                            el: $('.j-main'),
                            isAdd: true
                        });
                    }
                );
            },

            /**
             * 编辑数据源（调用外模块）
             *
             * @param {event} event 点击事件
             * @public
             */
            editDataSources: function (event) {
                var dataSourcesId = this.getLineId(event);
                window.dataInsight.main.destroy();

                // 进编辑模块
                require([
                        'data-sources/create-view'
                    ],
                    function (DataSourcesCreateView) {

                        new DataSourcesCreateView({
                            el: $('.j-main'),
                            id: dataSourcesId,
                            isAdd: false
                        });
                    }
                );
            },

            /**
             * 删除数据源
             *
             * @param {event} event 点击事件
             * @public
             */
            deleteDataSources: function (event) {
                var that = this;
                var dataSourcesId = this.getLineId(event);

                dialog.confirm('是否确定删除当前数据源', function () {
                    that.model.deleteDataSources(dataSourcesId);
                });
            },

            /**
             * 获取当前行的数据源id
             *
             * @param {event} event 事件
             * @public
             */
            getLineId: function (event) {
                return $(event.target).parents('.j-root-line').attr('data-id');
            },

            /**
             * 销毁当前view与其对应的model
             *
             * @public
             */
            destroy: function () {
                // 销毁 model
                this.model.clear({
                    silent: true
                });

                // 停止监听model事件
                this.stopListening();
                // 解绑jq事件
                $(this.el).unbind().empty();
            }
        });
    });