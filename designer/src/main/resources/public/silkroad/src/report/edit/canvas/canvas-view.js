/**
 * @file
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-8-5
 */
define([
        'template',
        'dialog',
        'report/edit/canvas/canvas-model',
        'report/report-view',
        'report/edit/component-box/main-view',
        'report/edit/canvas/edit-comp-view',
        'report/edit/canvas/edit-btns-template',
        'report/edit/canvas/guides-template'
    ],
    function (
        template,
        dialog,
        MainModel,
        ReportView,
        ComponentBoxView,
        EditCompView,
        editBtnsTemplate,
        guidesTemplate
    ) {

        return Backbone.View.extend({
            events: {
                'click .j-con-edit-btns .j-setting': 'initCompConfigBar',
                'click .j-con-edit-btns .j-delete': 'deleteComp',
                'click .j-button-save-report': 'saveReport',
                'click .j-button-publish-report': 'publishReport'
            },

            /**
             * 构造函数
             *
             * @param {$HTMLElement} option.el .j-canvas
             * @param {string} option.id 报表id
             * @constructor
             */
            initialize: function (option) {
                var that = this;

                // 初始化工具箱
                that.compBoxView = new ComponentBoxView({
                    el: that.el,
                    id: that.id,
                    canvasView: that
                });

                this.model = new MainModel({
                    id: that.id,
                    parentModel: option.parentView.model,
                    compBoxModel: that.compBoxView.model
                });
                that.parentView = option.parentView;

                // 初始化组件设置模块
                that.editCompView = new EditCompView({
                    el: that.el,
                    reportId: that.id,
                    canvasView: that
                });

                // 初始化报表公共功能模块
                that.reportView = new ReportView({id: that.id});

                // 初始化json与vm文件
                that.model.initJson(function () {
                    that.model.initVm(function () {
                        that.showReport();
                    });
                });
            },

            /**
             * 初始化画布可接受组件
             *
             * @public
             */
            initAcceptComp: function () {
                var that = this;
                var compBoxModel = that.compBoxView.model;
                var acceptAbleClass = 'active';
                var acceptDisableClass = 'disable';


                // 定义可接收从组件箱拖出的东西
                $('.j-report', that.el).droppable({
                    accept: ".j-con-component-box .j-component-item",
                    // 焦点在里面才算里面
                    // intersect 50%在里面才算在里面(默认)
                    // touch 有接触
                    // pointer 鼠标坐标
                    // fit 全部在里面
                    tolerance: 'intersect',
                    drop: function (event, ui) {
                        var $report = $(this);
                        var $realComp = ui.helper.clone().html('<div class="ta-c">组件占位，配置数据后展示组件</div>');
                        var compType = $realComp.attr('data-component-type');
                        var compData = compBoxModel.getComponentData(compType);

                        $realComp.removeClass(compData.class + ' active');
                        $realComp.addClass(compData.renderClass);
                        $realComp.css({'cursor': 'auto'});
                        $report.removeClass('active');
                        var defaultWidth = $realComp.attr('data-default-width');
                        $realComp.css({
                            width: defaultWidth + 'px',
                            height: $realComp.attr('data-default-height') + 'px'
                        });

                        // 越界拉回
                        var leftPosition = parseInt($realComp.css('left'));
                        var reportWidth = $report.width();
                        if (leftPosition/1 + defaultWidth/1 > reportWidth) {
                            $realComp.css('left', (reportWidth - defaultWidth - 3) + 'px');
                        }
                        if ( parseInt($realComp.css('left')) < 2) {
                            $realComp.css('left', '3px');
                        }
                        if (parseInt($realComp.css('top')) < 2) {
                            $realComp.css('top', '3px');
                        }
                        that.addComp(compData, compType, $realComp);
                    },
                    helper: "clone",
                    out: function (event, ui) {
                        $(this).removeClass(acceptAbleClass);
                        ui.helper.removeClass(acceptAbleClass).addClass(acceptDisableClass);
                        ui.helper.html('<div class="ta-c">已超出画布区</div>');
                    },
                    over: function (event, ui) {
                        $(this).addClass(acceptAbleClass);
                        ui.helper.removeClass(acceptDisableClass).addClass(acceptAbleClass);
                        ui.helper.html('<div class="ta-c">组件占位，配置数据后展示组件</div>');
                    }
                });
            },

            /**
             * 添加一个组件(提交后台获取id，并在vm与json中添加相关数据)
             *
             * @param {Object} compData 组件的配置数据
             * @param {string} compType 组件类型
             * @param {$HTMLElement} $realComp 被拖到画布上的组件的$DOM对象
             * @public
             */
            addComp: function (compData, compType, $realComp) {
                var that = this;

                that.model.addComp(
                    compData,
                    compType,
                    // 创建组件的外壳
                    function (id) {
                        $realComp.attr('data-comp-id', id);
                        return $realComp.clone();
                    },
                    // 已经拖入后初始化编辑功能
                    function () {
                        that.$el.find('[data-o_o-di="snpt"]').append($realComp);
                        that.initDrag($realComp);
                        that.initResize($realComp);
                        that.addEditBtns($realComp);
                        that.editCompView.hideEditBar();
                    }
                );
            },

            /**
             * 从报表中删除一个组件
             *
             * @param {event} event 点击删除按钮触发的事件
             * @public
             */
            deleteComp: function (event) {
                var that = this;
                var $target = $(event.target);
                var $comp = $target.parents('.j-component-item');
                var compId = $comp.attr('data-comp-id');

                this.model.deleteComp(compId, function () {
                    $comp.remove();
                    that.editCompView.hideEditBar();
                    // 刷新报表展示
                    that.showReport();
                });
            },

            /**
             * 初始化组件可被拖拽调整位置
             *
             * @param {$HTMLElement} $component 组件的$DOM对象（可以是多个或一个）
             * @public
             */
            initDrag: function ($component) {
                var that = this;

                $component.draggable({
                    helper: "original",
                    scroll: true,
                    containment: this.$el.find('.j-report'),
                    opacity: 0.8, // 被拖拽元素的透明度
                    handle: ".j-drag", // 拖拽触发点
                    start: function (event, ui) {
                        //that.addGuides(ui.helper);
                    },
                    stop: function (event, ui) {
                        //that.removeGuides(ui.helper);
                        that.updateCompPositing(ui.helper);
                        that.initSnptHeight();
                    }
                });
            },

            /**
             * 初始化组件可被调整大小
             *
             * @param {$HTMLElement} $component 组件的$DOM对象（可以是多个或一个）
             * @public
             */
            initResize: function ($component) {
                var that = this;

                $component.resizable({
                    stop: function (event, resizeObj) {
                        var paramObj = resizeObj.size;
                        paramObj.compId = $(this).attr('data-comp-id');

                        that.model.resizeComp(paramObj);
                        that.showReport(true);
                    }
                });
                // 去除左右和上线单独调整大小的相应区，有此区域会影响滚动条的呈现
                $component.find('.ui-resizable-e,.ui-resizable-s').remove();
                // 对表格组件设置拖拽的最小高度
                // 上下小零件的总高度94（=40+19+35），一行数据加表头的高度70
                $component.filter('[data-component-type="TABLE"]').resizable("option", "minHeight", 204);
            },

            /**
             * 组件拖动后，更新vm中组件的位置信息
             *
             * @param {$HTMLElement} ui 组件外壳
             * @public
             */
            updateCompPositing: function(ui) {
                var compId = ui.attr('data-comp-id');
                var left = ui.css('left');
                var top = ui.css('top');

                this.model.updateCompPositing(compId, left, top);
            },

            /**
             * 添加组件拖拽参考线
             *
             * @param {$HTMLElement} $component 组件的外壳
             * @public
             */
            addGuides: function ($component) {
                $component.append(guidesTemplate.render());
            },

            /**
             * 移除组件拖拽参考线
             *
             * @param {$HTMLElement} $component 组件的外壳
             * @public
             */
            removeGuides: function ($component) {
                $component.find('.j-guide-line').remove();
            },

            /**
             * 添加编辑组件操作条
             *
             * @param {$HTMLElement} $component 组件的外壳
             * @public
             */
            addEditBtns: function ($component) {
                $component.append(editBtnsTemplate.render());
                $component.find('.j-fold').click(function () {
                    var $conBtn = $(this).parent();
                    if ($conBtn.width() < 20) {
                        $conBtn.width('auto');
                        $conBtn.height('auto');
                        $(this).html('－');
                    }
                    else {
                        $conBtn.width(1);
                        $conBtn.height(1);
                        $(this).html('+');
                    }
                });
            },

            /**
             * 保存报表
             *
             * @public
             */
            saveReport: function () {
                this.model.saveReport(function () {
                    dialog.success('报表保存成功。');
                });
            },

            /**
             * 发布报表
             *
             * @public
             */
            publishReport: function () {
                this.reportView.publishReport('POST');
            },

            /**
             * 初始化组件配置区
             *
             * @param {event} event 点击事件（报表组件上的编辑按钮）
             * @public
             */
            initCompConfigBar: function (event) {
                this.editCompView.initCompConfigBar(event);
            },

            /**
             * 初始化报表的高度
             *
             * @public
             */
            initSnptHeight: function () {
                var $snpt = this.$el.find('[data-o_o-di="snpt"]');
                var addHeight = 200; // 组件高度之外的附加高度，为了供调整大小方便
                var $compItems = this.$el.find('.report .j-component-item');

                var height = 0;
                $compItems.each(function (item) {
                    var $this = $(this);
                    var bottomPosition = $this.height() + parseInt($this.css('top'));
                    height = bottomPosition > height ? bottomPosition: height;
                });
                $snpt.height(height + addHeight);
            },

            /**
             * 销毁当前view及附带的model
             *
             * @public
             */
            destroy: function () {
                // 销毁 model
                this.model.clear({silent: true});
                // 停止监听model事件
                this.stopListening();
                // 解绑jq事件
                this.$el.unbind().empty();
                if (this._component) {
                    this._component.dispose();
                }
            },

            /**
             * 渲染报表
             *
             * @public
             */
            showReport: function () {
                var that = this;

                if (that.model.reportJson.entityDefs.length < 2) {
                    var html = that.model.$reportVm.prop('outerHTML');
                    that.$el.find('.j-report').html(html);
                    that.initAcceptComp();
                    return ;
                }
                var options = {
                    parentEl: that.$el.find('.j-report')[0],
                    reportId: that.id,
                    rptHtml: that.model.$reportVm.prop('outerHTML'),
                    rptJson: that.model.reportJson
                };

                that._firstShowReport = false;
                if (that._component === undefined) {
                    require(
                        ['report/component-combination/enter'],
                        function (component) {
                            that._component = component;
                            component.start(options);
                        }
                    );
                }
                else {
                    that._component.dispose();
                    that._component.start(options);
                }

                // 没有回调的支持用延时函数做简单的hack
                window.setTimeout(function () {
                    var $report = that.$el.find('.j-report');
                    var $ComponentItem = $report.find('.j-component-item');
                    that.initDrag($ComponentItem);
                    that.initResize($ComponentItem);
                    that.addEditBtns($ComponentItem);
                    that.initAcceptComp();
                    that.editCompView.activeComp();
                    that.initSnptHeight();
                }, 2000);
            }
        });
    }
);