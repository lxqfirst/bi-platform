/**
 * xui.ui.HChart  
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    基于highcharts的js图
 *           (最早源自pl-charts.js by cxl(chenxinle))
 * @author:  sushuang(sushuang@baidu.com)
 * @depend:  xui, xutil, echarts
 */

(function () {

    var ieVersion = xutil.dom.ieVersion;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var q = xutil.dom.q;
    var domChildren = xutil.dom.children;
    var inheritsObject = xutil.object.inheritsObject;
    var formatNumber = xutil.number.formatNumber;
    var extend = xutil.object.extend;
    var XOBJECT = xui.XObject;

    var DI_ATTR_PREFIX = '\x06diA^_^';
    /**
     * 基于highcharts的JS图
     *
     * @class
     * @extends {xui.ui.Control}
     */
    var UI_E_CHART = xui.ui.EChart =
        inheritsObject(
            XOBJECT,
            function (options) {
                var el = this.el = options.el;
                this._sType = 'xui-e-chart';
                addClass(el, this._sType);
                var type = this._sType;

                el.innerHTML = [
                        '<div class="' + type + '-header">',
                        '</div>',
                        '<div class="' + type + '-content"></div>'
                ].join('');

                this._eHeader = el.childNodes[0];
                this._eContent = el.childNodes[1];
            }
        );
    var UI_E_CHART_CLASS = UI_E_CHART.prototype;

    /**
     * 初始化
     */
    UI_E_CHART_CLASS.init = function () {
    };

    /**
     * 设置数据
     *
     * @public
     * @param {Object} dataWrap 数据
     * @param {boolean=} isSilent 是否静默（不渲染），缺省则为false
     */
    UI_E_CHART_CLASS.setData = function (dataWrap, isSilent) {
        this._zoomSelectedButton = 0;
        dataWrap = dataWrap || {};

        // this._sChartType = fixChartType(dataWrap.chartType, 'line');
        this._bSeriesHasValue = null;
        this._nWidth = dataWrap.width;
        this._nHeight = dataWrap.height;
        /**
         * x轴定义
         * 例如：
         *  xAxis: [
         *      {
         *          type: 'quarter', // 或'category', 'date', 'month'等，参见EXT_AXIS_FORMAT
         *          data: ['2012-Q1', '2012-Q2']
         *      }
         *  ];
         */
        this._aXAxis = dataWrap.xAxis || [];
        this._zoomStart = 0;
        this._zoomEnd = this._aXAxis.data
            ? this._aXAxis.data.length - 1
            : 0;
        /**
         * y轴定义
         * 例如：
         *  xAxis: [
         *      {
         *          format: 'I,III.DD%', // 显示格式
         *          title: '我是y轴上的描述文字'
         *      }
         *  ];
         */
        this._aYAxis = dataWrap.yAxis || [];   
        /**
         * 系列数据
         * 例如：
         *  series: [
         *      {
         *          name: '我是系列1',
         *          data: [1234.1234, 12344.333, 57655]
         *      },
         *      {
         *          name: '我是系列2',
         *          data: [566.1234, 565, 9987]
         *      }
         *  ];
         */
        this._aSeries = dataWrap.series || [];
        /**
         * 用户自定义rangeselector的按钮
         * 例如：
         *  rangeSelector: {
         *      byAxisType: {
         *          date: {
         *              buttons: [
         *                  { type: 'thisMonth', text: '本月', by: 'max' },
         *                  { type: 'all', text: '全部' }
         *              ],
         *              selected: 0
         *          }
         *      }
         *  }
         */
        this._oRangeSelector = dataWrap.rangeSelector;
        /**
         * 用户自定义legend的模式（外观+行为）
         * 例如：
         *  legend: { 
         *      xMode: 'pl' // PL模式的legend。缺省则使用默认模式。
         *  }
         */
        this._oLegend = dataWrap.legend || {};
        /**
         * 数据为空时的html
         */
        this._sEmptyHTML = dataWrap.emptyHTML || '数据为空';
             
        !isSilent && this.render();
    };

    /**
     * 设置数据
     *
     * @protected
     */
    UI_E_CHART_CLASS.$setupSeries = function (options) {
        var series = [];
        var xAxis = this._aXAxis;
        for (var i = 0, ser, serDef; serDef = this._aSeries[i]; i ++) {
            ser = { data: [] };
            ser.name = serDef.name || '';
            ser.yAxisIndex = serDef.yAxisIndex || 0;
            ser.color = serDef.color || void 0;
            ser.format = serDef.format || void 0;
            ser.type = fixChartType(serDef.type);
            ser.symbol = 'none'; // 线图上的点的形状
            (serDef.id !== null) && (ser.id = serDef.id);
            ser.data = serDef.data;
            series.push(ser);
        }

        // series中只允许有一个饼图。
        if (this._bHasPie) {
            var targetSeries = [{}];
            for(var key in series[0]) {
                series[0].hasOwnProperty(key) && (targetSeries[0][key] = series[0][key]);
            }
            targetSeries[0].data = [];
            for (var k = 0, kser; kser = series[0].data[k]; k ++) {
                var tarData = {
                    value: kser,
                    name: xAxis.data[k]
                };
                targetSeries[0].data.push(tarData);
            }
            series = targetSeries;
        }
        options.series = series;
    };
    /**
     * 设置x轴
     *
     * @private
     */
    UI_E_CHART_CLASS.$setupXAxis = function (options) {
        var me = this;

        var xAxis =  {
            type: 'category',
            boundaryGap: me._bHasBar ? true : false,
            axisLine: {
                onZero: false
            },
            data: this._aXAxis.data
        };
        if (!this._bHasPie) {
            options.xAxis = xAxis;
        }
    }
    /**
     * 设置y轴
     * 支持多轴
     *
     * @private
     */
    UI_E_CHART_CLASS.$setupYAxis = function (options) {
        if (!this._bHasPie) {
            var yAxis = [];
            if (this._aYAxis && this._aYAxis.length > 0) {
                for (var i = 0, option; option = this._aYAxis[i]; i++) {
                    var yAxisOption = {};
                    yAxisOption.name = option.title.text;
                    yAxisOption.type = 'value';
                    yAxisOption.splitArea = { show : true };
                    yAxisOption.boundaryGap = [0.1, 0.1];
                    yAxisOption.splitNumber = 5;
//                    if (option.title.text) {
//                        yAxisOption.axisLabel = {
//                            formatter: '{value} '+ option.title.text
//                        }
//                    }
                    yAxis.push(yAxisOption);
                };
            }
            else {
                var yAxisOption = {};
                yAxisOption.type = 'value';
                yAxisOption.splitArea = { show : true };
                yAxisOption.boundaryGap = [0.1, 0.1];
                yAxisOption.splitNumber = 5;
                yAxis.push(yAxisOption);
            }
        }
        options.yAxis = yAxis;
    };
    /**
     * 设置图例
     *
     * @protected
     */
    UI_E_CHART_CLASS.$setupLegend = function (options) {
        var legend = {};
        var data = [];

        if (this._bHasPie) {
            for (var i = 0; i < this._aXAxis.data.length; i++) {
                data[i] = this._aXAxis.data[i];
            };
            legend.orient = 'vertical';
        }
        else {
            if (this._aSeries && this._aSeries.length > 0) {
                for (var i = 0; i < this._aSeries.length; i++) {
                    data[i] = this._aSeries[i].name;
                }
            }
        }

        legend.data = data;
        legend.x = 'left';
        legend.padding = 5;
        legend.itemGap = 10;
        options.legend = legend;
    };
    /**
     * 设置工具箱
     *
     * @protected
     */
    UI_E_CHART_CLASS.$setupToolBox = function (options) {
        var toolbox = {
            show: true,
            orient : 'vertical',
            y : 'center',
            feature : {
                magicType : {show: true, type: ['stack', 'tiled']}
            }
        };
        options.toolbox = toolbox;

    };
    /**
     * 设置dataRoom
     *
     * @private
     */
    UI_E_CHART_CLASS.$setupDataRoom = function (options) {
        // 此方法内只接受data中的start与end
        var dataZoom = {};
        var categories = {};

        if (this._aXAxis) {
            categories = this._aXAxis;
        }

        if(!this._bHasPie){
            dataZoom.show = false;
            var xNums = categories.data ? categories.data.length : 0;
            var enableSelectRange = false;

            enableSelectRange = (xNums > 10 && this._aXAxis.type !== 'category')
                ? true
                : enableSelectRange;
            dataZoom.show = enableSelectRange;
            setupRangSelector.call(this, options, enableSelectRange);

            dataZoom.realtime = true;
            if (this._zoomStart === 0) {
                dataZoom.start = this._zoomStart;
            }
            else {
                dataZoom.start = Math.round(101 / xNums * this._zoomStart);
            }

            if (this._zoomEnd === (xNums - 1 )) {
                dataZoom.end = 100;
            }
            else {
                dataZoom.end = Math.round(101 / xNums * this._zoomEnd);
            }
            options.dataZoom = dataZoom;
        }

    };
    function setupRangSelector(options, enabled) {
        var me = this;
        var xDatas;
        // 禁用rangeselector的情况
        if (!enabled) {
            return;
        }

        xDatas = me._aXAxis.data;
        createRangeHtml.call(me);

        me._zoomButtons.onclick = function (ev) {
            var target = ev.target;
            if (ev.target.tagName.toLowerCase() === 'span') {
                me._zoomSelectedButton = Number(target.getAttribute('selRangeIndex'));
                me._oldZoomSelectButton && removeClass(me._oldZoomSelectButton, 'zoom-button-focus');
                addClass(ev.target, 'zoom-button-focus');
                me._oldZoomSelectButton = target;
                me._zoomStart = (me._zoomSelectedButton == 0)
                    ? 0
                    : (xDatas.length - (me._zoomSelectedButton * 30));
                me._zoomStart = (me._zoomStart <= 0)
                    ? 0
                    : me._zoomStart;
                me._zoomEnd = xDatas.length - 1;
            }
            // TODO:校验，如果所选时间的长度大于当前时间存在的时间，就不重绘，没必要，因为展现的东西还是一样的
            me.render();
        };
        var oMinDate = q('zoomMin', this._zoomDateRange)[0];
        var oMaxDate = q('zoomMax', this._zoomDateRange)[0];
        // 当from to改变后，render图形
        document.onkeydown = function() {
            if (event.keyCode === 13) {
                dateRangeChange.call(me, oMinDate, oMaxDate);
            }
        };
        oMinDate.onblur = function () {
            dateRangeChange.call(me, oMinDate, oMaxDate);
        };
        oMaxDate.onblur = function () {
            dateRangeChange.call(me, oMinDate, oMaxDate);
        };

        var min = xDatas[me._zoomStart];
        var max = xDatas[me._zoomEnd];
        oMinDate.value = min;
        oMaxDate.value = max;
        me._oldMinDate = min;
        me._oldMaxDate = max;
    }
    // 创建html元素
    function createRangeHtml() {
        var buttons;
        var axisType = this._aXAxis.type;
        this._zoomSelectedButton = (this._zoomSelectedButton === undefined)
            ? 0
            : this._zoomSelectedButton;
        if (axisType === 'date') {
            buttons = [
                { type: 'month', count: 1, text: '1月' },
                { type: 'month', count: 2, text: '2月' },
                { type: 'all', count: 0, text: '全部' }
            ];
        }
        else if (axisType === 'month') {
            buttons = [
                { type: 'month', count: 6, text: '6月' },
                { type: 'year', count: 12, text: '1年' },
                { type: 'all', count: 0, text: '全部' }
            ];
        }
        else {
            buttons = [
                { type: 'all', count: 0, text: '全部' }
            ];
        }

        // zoom按钮html模板
        var buttonsHtml = [
            '<ul class="zoom-buttons">'
        ];
        for (var i = 0, len = buttons.length; i < len; i++) {
            // li模版：<li><span selRangeIndex="1" class="zoom-button-focus">1月</span></li>
            buttonsHtml.push(
                '<li>',
                '<span selRangeIndex ="', buttons[i].count, '"',
                    this._zoomSelectedButton == buttons[i].count
                    ? ' class="zoom-button-focus"'
                    : '',
                '>', buttons[i].text, '</span>',
                '</li>'
            );
        }
        buttonsHtml.push('</ul>');
        // 时间范围html模板
        var selectRangeHtml = [
            '<div class="zoom-dateRange">',
            '<span>From:</span>',
            '<input class="zoomMin" type="text">',
            '<span>To:</span>',
            '<input class="zoomMax" type="text">',
            '</div>'
        ].join('');
        this._eHeader.innerHTML = buttonsHtml.join('') + selectRangeHtml;

        this._zoomButtons = domChildren(this._eHeader)[0];
        this._oldZoomSelectButton = q('zoom-button-focus', this._zoomButtons)[0];
        this._zoomDateRange = domChildren(this._eHeader)[1];
    }
    // 当时间range改变后
    function dateRangeChange(oMinDate, oMaxDate) {
        var xDatas = this._aXAxis.data;
        var start;
        var end;
        var minDate = oMinDate.value;
        var maxDate = oMaxDate.value;
        for (var i = 0, iLen = xDatas.length; i < iLen; i++) {
            if (minDate === xDatas[i]) {
                start = i;
            }
            if (maxDate === xDatas[i]) {
                end = i;
            }
        }
        if ((start === 0 || start) && end) {
            if ((xDatas[start] === this._oldMinDate)
                && (xDatas[end] === this._oldMaxDate)
            ) {
                return;
            }
            this._zoomStart = start;
            this._zoomEnd = end;
            var oZoomSelBtn = q('zoom-button-focus', this._zoomButtons)[0];
            oZoomSelBtn && removeClass(oZoomSelBtn, 'zoom-button-focus');
            this._zoomSelectedButton = -1;
            this.render();
        }
        else {
            oMinDate.value = this._oldMinDate;
            oMaxDate.value = this._oldMaxDate;
        }
    };
    /**
     * 设置提示浮层
     *
     * @protected
     */
    UI_E_CHART_CLASS.$setupTooptip = function (options) {
        var toolTip = {};

        if (this._bHasPie) {
            toolTip.formatter = "{a} <br/>{b} : {c} ({d}%)";
            toolTip.trigger = 'item';
        }
        else {
            toolTip.trigger = 'axis';
            // 在此将提示信息的format属性加上以便方便显示
            toolTip.formatter =  function(data, ticket, callback) {
                var res = data[0][1];
                for (var i = 0, l = data.length; i < l; i++) {
                    var valueFormat = options.series[i].format;
                    var valueLable = data[i][2];
                    // 当发现图数据有配置format属性时，按format所示进行展示
                    // 当没有format的时候，展示原值
                    if (valueFormat) {
                        valueLable = formatNumber(
                            data[i][2],
                            valueFormat,
                            null,
                            null,
                            true
                        );
                    }
                    res += '<br/>' + data[i][0] + ' : ' + valueLable;
                }
                return res;
            }
        }
        options.tooltip = toolTip;
    };
    function fixChartType(rawType, defaultType) {
        return rawType || defaultType || 'line';
    }
    /**
     * 重新渲染图表
     *
     * @public
     */
    UI_E_CHART_CLASS.render = function () {
        this.$disposeChart();
        // 如果没有数据，图形显示空
        if (!this._aSeries || this._aSeries.length == 0) {
            this._eContent.innerHTML = '' 
                + '<div class="' + this._sType + '-empty">' 
                +     this._sEmptyHTML
                + '</div>';
            return;
        }
        this.$createChart(this.$initOptions());
    };

    /**
     * 创建图表
     *
     * @public
     */
    UI_E_CHART_CLASS.$createChart = function (options) {
        var start;
        var end;
        var xDatas = this._aXAxis.data;
        this._oChart = echarts.init(this._eContent);
        this._oChart.setOption(options);
//        if (!this._bHasPie) {
//            this._oChart.on(echarts.config.EVENT.DATA_ZOOM, zoomChage);
//        }
//        function zoomChage(param) {
//            start = param.zoom.xStart;
//            end = param.zoom.xEnd;
//            changeDateRange();
//        }
//        function changeDateRange() {
//            var oMinDate = q('zoomMin', this._zoomDateRange)[0];
//            var oMaxDate = q('zoomMax', this._zoomDateRange)[0];
//            oMinDate.value = xDatas[start];
//            oMaxDate.value = xDatas[end - 1];
//        }
    };

    /**
     * 构建图表参数
     *
     * @private
     */
    UI_E_CHART_CLASS.$initOptions = function () {
        var options = {
            title: { text: '' }
        };

        // 特殊判断：是否有饼图
        this._bHasPie = false;
        this._bHasBar = false;
        for (var i = 0, ser; ser = this._aSeries[i]; i ++) {
            if (fixChartType(ser.type) == 'pie') {
                this._bHasPie = true;
            }
            if (fixChartType(ser.type) == 'bar') {
                this._bHasBar = true;
            }
        }
        this.$setupToolBox(options);
        this.$setupDataRoom(options);
        this.$setupSeries(options);
        this.$setupXAxis(options);
        this.$setupYAxis(options);
        this.$setupTooptip(options);
        this.$setupLegend(options);
        return options;
    };

     /**
     * 销毁图表
     *
     * @private
     */
    UI_E_CHART_CLASS.$disposeChart = function () {
        document.onkeydown = null;
        if (this._oChart) {
            this._oChart.clear();
            this._oChart.dispose();
            this._oChart = null;
        }
        this._eContent && (this._eContent.innerHTML = '');
        this._eHeader && (this._eHeader.innerHTML = '');
    };

    /**
     * @override
     */
    UI_E_CHART_CLASS.dispose = function () {
        this.$disposeChart();
        UI_E_CHART.superClass.dispose.call(this);
    };

})();
