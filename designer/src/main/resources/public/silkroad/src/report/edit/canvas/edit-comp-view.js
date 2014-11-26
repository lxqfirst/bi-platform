/**
 * @file 编辑某一组件的相关操作，包括：
 *       删除某一组件
 *       打开组件配置器
 *       接收数据项
<<<<<<< HEAD
 * @author 赵晓强(longze_xq@163.com)
=======
 * @author 赵晓强(v_zhaoxiaoqiang)
>>>>>>> branch 'master' of https://github.com/Baidu-ecom/bi-platform.git
 * @date 2014-8-14
 */
define([
        'template',
        'dialog',
        'constant',
        'report/edit/canvas/edit-comp-model',
        'report/edit/canvas/comp-setting-default-template',
        'report/edit/canvas/comp-setting-time-template',
        'report/edit/canvas/comp-setting-liteolap-template',
        'report/edit/canvas/default-selected-time-setting-template',
        'report/edit/canvas/data-format-setting-template',
        'common/float-window',
        'report/edit/canvas/chart-icon-list-template'
    ],
    function (
        template,
        dialog,
        Constant,
        EditCompModel,
        compSettingDefaultTemplate,
        compSettingTimeTemplate,
        compSettingLITEOLAPTemplate,
        defaultSelectedTimeSettingTemplate,
        dataFormatSettingTemplate,
        FloatWindow,
        indMenuTemplate
    ) {

        return Backbone.View.extend({
            events: {
                'click .j-comp-setting .j-delete': 'deleteCompAxis',
                'click .j-report': 'removeCompEditBar',
                'click .j-set-default-time': 'openTimeSettingDialog',
                'click .j-set-data-format': 'getDataFormatList',
                'click .item .j-icon-chart': 'showChartList'
            },

            /**
             * 报表组件的编辑模块 初始化函数
             *
             * @param {$HTMLElement} option.el
             *        .j-canvas（包括配置栏、工具箱、报表展示区） 与canvas的el相同
             * @param {string} option.reportId 报表的id
             * @param {Object} option.canvasView 画布的view
             * @constructor
             */
            initialize: function (option) {
                this.model = new EditCompModel({
                    canvasModel: option.canvasView.model,
                    reportId: option.reportId
                });
                this.canvasView = option.canvasView;
                this.$conCompSetting = this.$el.find('.j-con-comp-setting');
            },

            /**
             * 初始化组件配置区
             *
             * @param {event} event 点击事件（报表组件上的编辑按钮）
             * @public
             */
            initCompConfigBar: function (event) {
                var that = this;
                var $target = $(event.target);

                var $shell = $target.parents('.j-component-item');
                var compId = $shell.attr('data-comp-id');
                var compType = $shell.attr('data-component-type');

                that.model.compId = compId;
                that.model.compType = compType;

                // 需要先处理一下之前可能存在的编辑条与active状态
                that.hideEditBar();

                // 还原组件配置信息
                that.model.getCompAxis(compId, function (data) {
                    data.compId = compId;
                    var template = that._adapterEditCompTemplate(compType);
                    data.compType = compType;
                    var html = template.render(data);

                    data.compId = compId;
                    that.$el.find('.j-con-comp-setting').html(html);
                    that.initLineAccept(compType);
                    $shell.addClass('active').mouseout();
                    // 初始化横轴和纵轴数据项的顺序调整
                    that.initSortingItem();

                    // 调整画布大小
                    that.canvasView.parentView.ueView.setSize();
                });
            },

            /**
             * 适配组件的编辑模板
             *
             * @param {string} type 组件类型
             * @privite
             */
            _adapterEditCompTemplate: function (type) {
                var template;

                switch (type) {
                    case 'TIME_COMP' :
                        template = compSettingTimeTemplate;
                        break ;
                    case 'LITEOLAP' :
                        template = compSettingLITEOLAPTemplate;
                        break ;
                    default :
                        template = compSettingDefaultTemplate;
                        break;
                }

                return template;
            },

            /**
             * 初始化接收拖拽进来的维度和指标 的功能
             *
             * @param {string} type 组件的类型
             * @public
             */
            initLineAccept: function (type) {
                var that = this;
                var selector;
                var dStr = '.j-olap-element';
                var tStr = '.j-time-dim';
                switch (type) {
                    case 'TIME_COMP' :
                        selector = tStr;
                        break ;
                    case 'LITEOLAP' :
                        selector = dStr;
                        break ;
                    default :
                        selector = dStr;
                        break;
                }

                $('.j-comp-setting-line', this.el).droppable({
                    accept: selector,
                    drop: function (event, ui) {
                        var $this = $(this);
                        that.addCompAxis(ui, $this, type);
                        $this.removeClass('active');
                    },
                    out: function (event, ui) {
                        $(this).removeClass('active');
                    },
                    over: function (event, ui) {
                        $(this).addClass('active');
                    },
                    helper: "clone"
                });
            },

            /**
             * 初始化横轴和纵轴数据项的顺序调整
             *
             * @public
             */
            initSortingItem: function () {
                var that = this;
                // 向后台提交的数据
                var data = { };

                $('.j-line-x,.j-line-y', this.el).sortable({
                    items: ".j-root-line,.j-cal-ind,.j-group-title",
                    axis: 'x',
                    start: function (event, ui) {
                        ui.placeholder.height(0);
                        data.source = ui.item.parent().find('[data-id]').index(ui.item);
                    },
                    stop: function (event, ui) {
                        var $parent = ui.item.parent();
                        var compId = $parent.parent().attr('data-comp-id');
                        data.target = $parent.find('[data-id]').index(ui.item);
                        data.type = $parent.attr('data-axis-type');
                        if (data.source != data.target) {
                            that.model.sortingCompDataItem(compId, data, function () {
                                that.canvasView.showReport();
                            });
                        }
                    }
                });
            },

            /**
             * 删除 指标或维度（从数据轴中）
             *
             * @param {event} event 点击事件
             * @public
             */
            deleteCompAxis: function (event) {
                var that = this;
                var $target = $(event.target);
                var data = {};
                var selector;
                var attr;

                selector = '.j-comp-setting';
                var $compSetting = $target.parents(selector);
                var compId = $compSetting.attr('data-comp-id');
                var compType = $compSetting.attr('data-comp-type');

                selector = '.j-comp-setting-line';
                attr = 'data-axis-type';
                var axisType = $target.parents(selector).attr(attr);

                attr = 'data-id';
                var olapId = $target.parent().attr(attr);
                that.model.deleteCompAxis(
                    compId,
                    axisType,
                    olapId,
                    function () {
                        var $item = $target.parent();
                        var oLapElementId = $item.attr('data-id');

                        $target.parent().remove();
                        that.afterDeleteCompAxis({
                            oLapElementId: oLapElementId,
                            compType: compType,
                            axisType: axisType,
                            $item: $target.parent()
                        });
                        // 调整画布大小
                        // that.canvasView.parentView.ueView.setSize();
                        // 重新渲染报表
                        that.canvasView.showReport();
                        // 还原指标和维度的可互拖
                        if(that.$el.find('[data-id=' + oLapElementId + ']').length == 0) {
                            var str = ' .j-root-line[data-id=' + oLapElementId + ']';
                            $('.j-con-org-ind' + str).addClass('j-can-to-dim');
                            $('.j-con-org-dim' + str).addClass('j-can-to-ind');
                        }
                    }
                );
            },

            /**
             * 删除完成数据项之后要做的特殊dom处理
             *
             * @param {Object} option 配置参数
             * @param {string} option.oLapElemenId 数据项id
             * @param {string} option.compType 组件类型
             * @param {string} option.axisType 轴类型
             * @public
             */
            afterDeleteCompAxis: function (option) {
                // 容错
                if (option.compType === undefined) {
                    return ;
                }

                var compType = this._switchCompTypeWord(option.compType);
                this['afterDelete' + compType + 'CompAxis'](option);
            },

            /**
             * 删除完成LiteOlap组件的数据项之后要做的特殊dom处理
             *
             * @param {Object} option 配置参数
             * @public
             */
            afterDeleteLiteOlapCompAxis: function (option) {
                var that = this;
                var $compSetting = that.$el.find('.j-comp-setting');
                var axisType = option.axisType;
                var isXYS = 'xys'.indexOf(axisType) > -1;

                var selector = '[data-id=' + option.oLapElementId + ']';
                // 数据项
                var $items = $compSetting.find(selector);
                // 备选区有当前删掉的数据项
                selector = '.j-delete';
                var html = '<span class="icon-letter j-delete">×</span>';
                if ($items.length == 1 && $items.find(selector).length == 0) {
                    $items.append(html);
                }
            },

            /**
             * 删除完成LiteOlap组件的数据项之后要做的特殊dom处理
             *
             * @param {Object} option 配置参数
             * @public
             */
            afterDeleteTimeCompAxis: function (option) {
                var compBoxModel = this.model.canvasModel.compBoxModel;
                var calendarModel = compBoxModel.getComponentData('TIME_COMP');
                var compId = this.getActiveCompId();
                var editCompModel = this.canvasView.editCompView.model;
                var json = editCompModel.getCompDataById(compId)[0];
                var name = option.$item.attr('data-name');
                var letter = calendarModel.switchLetter(name);

                // 分别删除
                var list = json.dataSetOpt.timeTypeList;
                for (var i = 0,len = list.length; i < len; i++) {
                    if (letter == list[i].value) {
                        list.splice(i, 1);
                        break;
                    }
                }
                delete json.dataSetOpt.timeTypeOpt[letter];
                delete json.dateKey[letter];
                json.name = json.dateKey[json.dataSetOpt.timeTypeList[0].value];
                this.model.canvasModel.saveReport();
            },

            /**
             * 添加组件的数据关联配置（指标 或 维度）
             *
             * @param {Object} ui 被拖拽的对象（里面包含被拖拽的本体元素）
             * @param {$HTMLElement} $acceptUi 接收拖拽元素的元素
             * @public
             */
            addCompAxis: function (ui, $acceptUi) {
                var $draggedUi = ui.helper;
                var that = this;
                var selector;
                var str;
                var cubeId;
                var oLapElemenType;

                selector = '.j-comp-setting';
                var $root = $acceptUi.parents(selector);
                var compId = $root.attr('data-comp-id');
                var compType = $root.attr('data-comp-type');
                var $item = $draggedUi.clone().attr('style', '');


                var $spans = $item.find('span');
                // 维度组
                if ($item.hasClass('j-group-title')) {
                    $item.addClass('item');
                }
                // 普通指标和维度
                else {
                    $spans.eq(1).remove();
                }

                // 使维度指标不能互换 - 因为维度或指标被使用了
                ui.draggable.removeClass('j-can-to-dim j-can-to-ind');

                // 采用非维度 即 指标 的策略
                selector = '.j-data-sources-setting-con-ind';
                oLapElemenType = ui.draggable.parents(selector);
                oLapElemenType = oLapElemenType.length ? 'ind' : 'dim';

                // 维度与指标项的样式不一样，分别添加
                var str;
                // 指标
                if (oLapElemenType === 'ind') {
                    if (compType !== 'TABLE') {
                        str = '<span class="icon-chart bar j-icon-chart" chart-type="bar" ></span>';
                        $item.prepend(str);
                    }

                }
                str = '<span class="icon hide j-delete" title="删除">×</span>';
                $item.append(str);
                $($item.find('.j-item-text')).removeClass('ellipsis').addClass('icon-font');
                // TODO:需要判断下两个饼图

                cubeId = that.canvasView.parentView.model.get('currentCubeId');
                var data = {
                    cubeId: cubeId,
                    oLapElementId: $item.attr('data-id'),
                    axisType: $acceptUi.attr('data-axis-type')
                };

                // 避免调顺序产生拖入的干扰
                $item.removeClass('j-olap-element').addClass('c-m');
                that.model.addCompAxis(compId, data, function () {
                    // 去除时间维度的接收拖拽与调序的冲突
                    $item.removeClass('j-time-dim');
                    // 成功后再添加
                    $acceptUi.append($item);
                    that.afterAddCompAxis({
                        compType: compType,
                        oLapElemenType: oLapElemenType,
                        oLapElementId: data.oLapElementId,
                        axisType: data.axisType,
                        $item: $item
                    });
                    // 刷新报表展示
                    that.canvasView.showReport();
                    // 调整画布大小
                    that.canvasView.parentView.ueView.setSize();
                });
            },
            /**
             * 显示图形列表
             *
             * @param {Object} ui 被拖拽的对象（里面包含被拖拽的本体元素）
             * @param {$HTMLElement} $acceptUi 接收拖拽元素的元素
             * @public
             */
            showChartList: function (event) {
                var that = this;
                var $target = $(event.target);
                var selector = '.j-comp-setting';
                var $compSetting = $target.parents(selector);
                var compId = $compSetting.attr('data-comp-id');
                var olapId = $target.parent().attr('data-id');
                var oldChartType = $target.attr('chart-type');

                var chartTypes = Constant.CHART_TYPES;
                for (var key in chartTypes) {
                    chartTypes[key] = false;
                }
                chartTypes[oldChartType] = true;
                if(!that.chartList) {
                    that.chartList = new FloatWindow({
                        direction: 'vertical',
                        content: indMenuTemplate.render(chartTypes)
                    });
                }
                else {
                    that.chartList.redraw(indMenuTemplate.render(chartTypes));
                }
                // FIXME:这块的实现不是很好，需要修改
                $('.comp-setting-charticons span').unbind();
                $('.comp-setting-charticons span').click(function () {
                    var $this =  $(this);
                    var selectedChartType = $this.attr('chart-type');
                    // 如果是饼图的话，比较麻烦，不能同时选择两个饼图
                    if (selectedChartType === 'pie') {
                        var $chartTypes = $target.parent().siblings('div');
                        var flag = false;
                        $chartTypes.each(function () {
                            var $chartType = $($(this).find('span')[0]);
                            if ($chartType.attr('chart-type') === 'pie') {
                                alert('不能选择两个饼图');
                                flag = true;
                            }
                        });
                        if (flag) {
                            return;
                        }
                    }

                    that.model.changeCompItemChartType(
                        compId,
                        olapId,
                        selectedChartType,
                        function () {
                            $target.removeClass(oldChartType).addClass(selectedChartType);
                            $target.attr('chart-type', selectedChartType);
                            that.chartList.hide();
                            that.canvasView.showReport();
                        }
                    );
                });
                that.chartList.show($(event.target).parent());
            },
            /**
             * 添加完成数据项之后要做的特殊dom处理
             *
             * @param {Object} option 配置参数
             * @param {string} option.compType 组件类型
             * @param {string} option.oLapElemenType 数据项类型
             * @param {string} option.oLapElemenId 数据项id
             * @param {string} option.axisType 轴类型
             * @param {$HTMLElement} option.$item 数据项dom
             * @public
             */
            afterAddCompAxis: function(option) {
                // 容错
                if (option.compType === undefined) {
                    return ;
                }
                var compType = this._switchCompTypeWord(option.compType);
                this['afterAdd' + compType + 'CompAxis'](option);
            },

            /**
             * 添加完成 LITEOLAP组件的 数据项之后要做的特殊dom处理
             *
             * @param {Object} option 配置参数
             * @param {string} option.compType 组件类型
             * @param {string} option.oLapElemenType 数据项类型
             * @param {string} option.oLapElemenId 数据项id
             * @param {string} option.axisType 轴类型
             * @param {$HTMLElement} option.$item 数据项dom
             * @public
             */
            afterAddLiteOlapCompAxis: function (option) {
                var that = this;
                var $compSetting = that.$el.find('.j-comp-setting');
                var isXYS = 'xys'.indexOf(option.axisType) > -1;

                // 如果拖到轴区
                if (isXYS) {
                    processCand();
                }

                // 处理候选区
                function processCand () {
                    var oLapElementId = option.oLapElementId;
                    var selector = '[data-id=' + oLapElementId + ']';
                    // 数据项
                    var $items = $compSetting.find(selector);

                    // 备选区没有当前拖进来的数据项
                    if ($items.length == 1) {
                        if (option.oLapElemenType == 'ind') {
                            selector = '.j-line-cand-ind';
                        }
                        else {
                            selector = '.j-line-cand-dim';
                        }
                        var $itemClone = option.$item.clone();
                        $itemClone.find('.j-delete').remove();
                        $compSetting.find(selector).append($itemClone);
                    }
                    // 备选区已有当前拖进来的数据项
                    else if ($items.length == 2) {
                        // 移除删除图标
                        var $delete = $items.eq(1).find('.j-delete');
                        if ($delete.length == 1 ) {
                            $delete.remove();
                        }
                    }
                }
            },

            afterAddChartCompAxis: function (option){

            },

            /**
             * 添加完成 时间控件 数据项之后要 特别处理json（采用了拼字符串的方式调用）
             *
             * @param {Object} option 配置参数
             * @public
             */
            afterAddTimeCompAxis: function (option) {
                var compBoxModel = this.model.canvasModel.compBoxModel;
                var calendarModel = compBoxModel.getComponentData('TIME_COMP');
                var compId = this.getActiveCompId();
                var editCompModel = this.canvasView.editCompView.model;
                var json = editCompModel.getCompDataById(compId)[0];
                // 数据项的name和id
                var name = option.$item.attr('data-name');
                var id = option.$item.attr('data-id');
                var calendarConfig = calendarModel.config;
                // 获取两个设置，分别push
                var timeTypeListConfig;
                var timeTypeOptConfig;
                var letter = calendarModel.switchLetter(name);

                timeTypeListConfig = calendarConfig.timeTypeListConfig[letter];
                timeTypeOptConfig = calendarConfig.timeTypeOptConfig[letter];
                // TODO （先不注意顺序，后续需要对顺序做处理）
                json.dataSetOpt.timeTypeList.push(timeTypeListConfig);
                json.dataSetOpt.timeTypeOpt[letter] = timeTypeOptConfig;
                json.dateKey[letter] = id;
                json.name = json.dateKey[json.dataSetOpt.timeTypeList[0].value];
                this.model.canvasModel.saveJsonVm();
                this.model.canvasModel.saveReport();
            },

            /**
             * 类型转换
             *
             * @param {string} oldType 转换前的类型
             * @private
             * @return {string} newType 转换后的类型
             */
            _switchCompTypeWord: function (oldType) {
                var newType;

                switch (oldType) {
                    case 'LITEOLAP':
                        newType = 'LiteOlap';
                        break;
                    case 'TIME_COMP':
                        newType = 'Time';
                        break;
                    case 'CHART':
                        newType = 'Chart';
                        break;
                }
                return newType;
            },

            /**
             * 获取组建编辑区和编辑区所对应的组件
             *
             * @private
             */
            _getEditBarAndActiveComp: function () {
                var $compSetting = this.$el.find('.j-comp-setting');
                var compId;
                var selector;
                var result = {};

                // 设置区不存在就不做任何操作
                if ($compSetting.length === 0) {
                    return result;
                }
                else {
                    result.$compSetting = $compSetting;
                }
                compId = $compSetting.attr('data-comp-id');

                // 去除组件的活动状态样式
                selector = '.j-component-item[data-comp-id=' + compId + ']';
                result.$activeComp = this.$el.find(selector);

                return result;
            },

            /**
             * 去除报表组件配置区（去除组件的活动状态样式）
             *
             * @public
             */
            hideEditBar: function () {
                var elements = this._getEditBarAndActiveComp();

                // 去除报表组件配置
                if (elements.$compSetting !== undefined) {
                    elements.$compSetting.remove();
                }

                // 去除组件的活动状态样式
                if (elements.$activeComp !== undefined) {
                    elements.$activeComp.removeClass('active');
                }
                // 调整画布大小
                this.canvasView.parentView.ueView.setSize();
            },

            /**
             * 激活正在编辑的组件（由于报表渲染之后会丢失此状态，所以需要另作处理）
             *
             * @public
             */
            activeComp: function () {
                var elements = this._getEditBarAndActiveComp();

                // 添加组件的活动状态样式
                if (elements.$activeComp !== undefined) {
                    elements.$activeComp.addClass('active');
                }
            },

            /**
             * 点击画布的空白区域隐藏组件编辑区
             *
             * @param {event} event 点击事件
             * @public
             */
            removeCompEditBar: function (event) {
                var that = this;

                if ($(event.target).parent().hasClass('j-report')) {
                    that.hideEditBar();
                }
            },

            /**
             * 打开默认时间设置弹框
             *
             * @param {event} event 点击事件
             * @public
             */
            openTimeSettingDialog: function (event) {
                var that = this;
                var compBoxModel = that.model.canvasModel.compBoxModel;
                var compId = that.getActiveCompId();
                var compData = that.model.getCompDataById(compId);
                // 可做逻辑拆分，将部分代码拆分到model中
                var deSwitchConfig = compBoxModel.getComponentData('TIME_COMP').deSwitchConfig;
                var renderTemplateData = deSwitchConfig(compData[0].dataSetOpt.timeTypeOpt);
                var html = defaultSelectedTimeSettingTemplate.render({
                    list: renderTemplateData
                });

                /**
                 * 从表单中提取配置数据
                 *
                 * @param {$HTMLElement} $dialog 弹框内容区
                 * @return {Object} 配置参数
                 */
                function getDataFromForm ($dialog) {
                    var arr = [];
                    var $item = $dialog.find('.j-item');
                    $item.each(function () {
                        var data = {};
                        var $this = $(this);
                        // 粒度
                        var particleSize = $this.attr('data-type');
                        // 相对时间的单位
                        var unit = $this.find('select').val();
                        // 相对值
                        var val = $this.find('input').val();

                        data.type = particleSize;
                        // 默认时间，单个可能是单选
                        data.date = [val + unit];
                        arr.push(data);
                    });

                    return arr;
                }

                dialog.showDialog({
                    title: '默认选中时间设置',
                    content: html,
                    dialog: {
                        width: 300,
                        height: 249,
                        open: function () {
                            // TODO 翻译选项的功能
                        },
                        buttons: [
                            {
                                text: '提交',
                                click: function () {
                                    var $this = $(this);
                                    // 提取表单数据
                                    var data = getDataFromForm($this);
                                    // 处理并回填json
                                    that.model.updateCalendarJson(
                                        data,
                                        function () {
                                            $this.dialog('close');
                                            that.canvasView.showReport();
                                        }
                                    );
                                }
                            },
                            {
                                text: '取消',
                                click: function () {
                                    $(this).dialog('close');
                                }
                            }
                        ]
                    }
                });
            },
            /**
             * 获取数据格式信息，并弹框展现
             *
             * @param {event} event 点击事件
             * @public
             */
            getDataFormatList: function (event) { //TODO:实现业务逻辑
                var that = this;
                var compId = that.getActiveCompId();

                that.model.getDataFormatList(compId, openDataFormatDialog);

                /**
                 * 打开数据格式设置弹框
                 */
                function openDataFormatDialog(data) {
                    var html;
                    if (!data) {
                        dialog.alert('没有指标');
                        return;
                    }

                    html = dataFormatSettingTemplate.render(
                        data
                    );
                    dialog.showDialog({
                        title: '数据格式',
                        content: html,
                        dialog: {
                            width: 340,
                            height: 400,
                            resizable: false,
                            buttons: [
                                {
                                    text: '提交',
                                    click: function() {
                                        saveDataFormInfo($(this));
                                    }
                                },
                                {
                                    text: '取消',
                                    click: function () {
                                        $(this).dialog('close');
                                    }
                                }
                            ]
                        }
                    });
                }
                /**
                 * 保存数据格式
                 */
                function saveDataFormInfo($dialog) {
                    var selects = $('.data-format').find('select');
                    var data = {};

                    selects.each(function () {
                        var $this = $(this);
                        var name = $this.attr('name');
                        data[name] = $this.val();
                    });
                    that.model.saveDataFormatInfo(compId, data, function () {
                        $dialog.dialog('close');
                        that.canvasView.showReport();
                    });
                }
            },

            /**
             * 获取活动状态的组件的id
             *
             * @public
             * @return {string} 组件id
             */
            getActiveCompId: function () {
                var $compSetting = this.$conCompSetting.find('.j-comp-setting');
                return $compSetting.attr('data-comp-id');
            }
        });
    }
);
