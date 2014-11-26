/**
 * @file 报表cube设置的view
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-7-17
 */
define([
        'template',
        'dialog',
        'report/set-cube/cube-model',
        'report/set-cube/main-template',
        'report/set-cube/cube-list-template'
    ],
    function (
        template,
        dialog,
        CubeModel,
        mainTemplate,
        cubeListTemplate
    ) {

        return Backbone.View.extend({
            events: {
                'click .j-root-data-sources-list .j-item': 'loadFactTableList',
                'click .j-con-cube-list .j-item': 'selectCubes',
                'click .j-root-set-group .j-set-group': 'addFormLine',
                'click .j-root-set-group .j-delete': 'deleteFormLine',
                'click .j-create-data-sources-link': 'enterCreateDataSources',
                'click .j-submit': 'submit',
                'click .j-cancel': 'cancel'
            },

            /**
             * 构造函数
             * @param {$HTMLElement} option.el view的顶层DOM：.j-main
             * @param {string} option.id 报表id
             * @constructor
             */
            initialize: function (option) {
                var that = this;

                this.model = new CubeModel({id: this.id});
                this.listenTo(
                    this.model,
                    'change:dataSourcesList',
                    function (model, data) {
                        var html = mainTemplate.render({dataSourcesList: data});
                        that.$el.html(html);
                    }
                );
                this.listenTo(
                    this.model,
                    'change:factTableList',
                    function (model, data) {
                        // 其中包括factTables、prefixs两项数据
                        var html = cubeListTemplate.render(data);
                        that.$el.find('.j-con-cube-list').html(html);
                    }
                );

                if (option.edit === true) {
                    that.model.loadSelectedDataSources(function () {
                        that.model.dataSourcesModel.loadDataSourcesList();

                        // 由于只有在编辑状态下 且 刚进来时需要还原
                        // 所以在这里用参数的方式来还原数据
                        that.model.loadFactTableList(true);
                    });
                }
                else {
                    that.model.dataSourcesModel.loadDataSourcesList();
                }

                window.dataInsight.main = this;
            },

            /**
             * 加载实体表（附带选中被点击数据源的功能）
             * @param {event} event 点击左边数据源产生的事件
             * @public
             */
            loadFactTableList: function (event) {
                var $target = $(event.target);
                var dsId = $target.attr('data-id');
                var selector = '.j-root-data-sources-list .j-item.selected';
                this.$el.find(selector).removeClass('selected');
                $target.addClass('selected');

                this.model.selectedDsId = dsId;
                this.model.loadFactTableList();
            },

            /**
             * 点击选中和取消选中cube操作
             * @param {event} event 点击事件
             * @public
             */
            selectCubes: function (event) {
                var $target = $(event.target);

                if ($target.hasClass('selected')) {
                    $target.removeClass('selected');
                }
                else {
                    $target.addClass('selected');
                }
            },

            /**
             * 点击“添加分表匹配规则”添加一规则输入行
             * @param {event} event 点击事件
             * @public
             */
            addFormLine: function (event) {
                var $target = $(event.target);
                var selector = '.j-root-set-group .j-template';
                var $formLine = this.$el.find(selector).clone();
                var $dom = $formLine.removeClass('hide j-template');
                $target.after($dom.addClass('j-item'));
            },

            /**
             * 删除一规则输入行
             * @param {event} event 点击事件
             * @public
             */
            deleteFormLine: function (event) {
                var $target = $(event.target);

                $target.parents('.j-item').remove();
            },

            /**
             * 当没有数据源时提供便捷入口 — 直接添加数据源
             * @public
             */
            enterCreateDataSources: function () {
                // 进数据源添加/编辑模块
                require(
                    [
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
             * 提交cube设置
             * @public
             */
            submit: function () {
                var that = this;
                var selector = '.j-con-cube-list .j-item.selected';
                var $selectedTables = this.$el.find(selector);
                var $regexps = this.$el.find('.j-root-set-group .j-item input');
                var data = {};

                if ($selectedTables.length == 0) {
                    dialog.error('至少需要选择一个实体表作为cube');
                    return;
                }

                selector = '.j-root-data-sources-list .j-item.selected';
                data.dataSourceId = this.$el.find(selector).attr('data-id');

                data.selectedTables = [];
                $selectedTables.each(function () {
                    data.selectedTables.push($(this).attr('data-id'));
                });
                data.selectedTables = data.selectedTables.join(',');
                data.regexps = [];
                $regexps.each(function () {
                    var val = $(this).val().trim();
                    if (val !== '') {
                        data.regexps.push(val);
                    }
                });
                data.regexps = data.regexps.join(',');

                this.model.submit(data, function () {
                    // 提交成功
                    window.dataInsight.main.destroy();

                    require(['report/dim-set/view'], function (DimSetView) {
                        new DimSetView({
                            el: $('.j-main'),
                            id: that.id
                        });
                    });
                });
            },

            /**
             * 取消当前操作，跳转到报表列表页面
             * @public
             */
            cancel: function () {
                window.dataInsight.main.destroy();
                require(['report/list/main-view'], function (ReportListView) {
                    new ReportListView({el: $('.j-main')});
                });
            },

            /**
             * 销毁当前view
             * @public
             */
            destroy: function () {
                // 销毁 model
                this.model.clear({silent: true});
                // 停止监听model事件
                this.stopListening();
                // 解绑jq事件
                this.$el.unbind().empty();
            }
        });
    }
);