/**
 * di.console.shared.ui.ChartConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    图设置面板
 * @author:  sushuang(sushuang)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.console.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var URL = di.config.URL;
    var DIALOG = di.helper.Dialog;
    var UTIL = di.helper.Util;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var q = xutil.dom.q;
    var inheritsObject = xutil.object.inheritsObject;
    var template = xutil.string.template;
    var XVIEW = xui.XView;
    var UI_TEXTAREA = ecui.ui.Textarea;
    var UI_INPUT = ecui.ui.Input;
    var UI_FORM = ecui.ui.Form;
    var UI_BUTTON = ecui.ui.Button;
    var UI_IND_TREE = ecui.ui.IndTree;
    var UI_CALENDAR = ecui.ui.IstCalendar;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var CHART_CONFIG_MODEL;

    $link(function() {
        CHART_CONFIG_MODEL = di.console.shared.model.ChartConfigModel;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 图设置
     * 单例，直接使用CHART_CONFIG_PANEL()可得到实例
     * 
     * @class
     * @extends di.shared.ui.BaseConfigPanel
     */
    var CHART_CONFIG_PANEL = $namespace().ChartConfigPanel = 
            inheritsObject(BASE_CONFIG_PANEL, constructor);
    var CHART_CONFIG_PANEL_CLASS = CHART_CONFIG_PANEL.prototype;

    /**
     * 标题
     */
    CHART_CONFIG_PANEL_CLASS.PANEL_TITLE = '图设置';

    //------------------------------------------
    // override方法 
    //------------------------------------------

    function constructor() {
        this.DATASOURCE_ID_MAPPING = {
            INIT: 'CHART_CONFIG_INIT',
            SUBMIT: 'CHART_CONFIG_SUBMIT'
        };
    }

    /** 
     * @override
     */
    CHART_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
        // 需要unbind？
    };

    /** 
     * @override
     */
    CHART_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
    };

    /** 
     * @override
     */
    CHART_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        var css = 'chart-config-panel';
        var html = [];
        var series = data.series || {};
        var index4Selected = data.index4Selected || [];
        var gDefs = DICT.GRAPH_DEFS;

        this._data = data;

        // TODO
        // 设置轴上的单位

        var tplTypeSel = [
                '<div data-series-group="#{serKey}">',
                    '<span>系列组&nbsp;#{serKey}：</span>',
                    '<span>类型&nbsp;</span>',
                    '<select class="#{css}-graph-type-sel">',
                        '#{typeOpt}',
                    '</select>',
                    '<span>左右轴&nbsp;</span>',
                    '<select class="#{css}-graph-axis-sel">',
                        '#{axisOpt}',
                    '</select>',
                '</div>'
            ].join('');
        var tplTypeSelOpt = [
                '<option value="#{value}" #{sel}>#{text}（#{value}）</option>'
            ].join('');

        html.push('<div>');

        // 每个系列的图形类型、左右轴设置
        for (var i = 0, serKey, ser; serKey = index4Selected[i]; i ++) {
            if (serKey.indexOf('COLUMN') < 0 || !(ser = series[serKey])) {
                continue; 
            }

            var htmlTypeOpt = [];
            for (var j = 0, sj; sj = gDefs[j]; j ++) {
                htmlTypeOpt.push(
                    template(
                        tplTypeSelOpt, 
                        { 
                            text: gDefs[j].text, 
                            value: gDefs[j].name,
                            sel: gDefs[j].name == ser.type 
                                ? 'selected="selected"' : ''
                        }
                    )
                );
            }

            // 先不做联动了，pie也显示这个，但是无效
            var htmlAxisOpt = [
                template(
                    tplTypeSelOpt, 
                    { 
                        text: '左轴', 
                        value: 'left', 
                        sel: ser.yAxisName == 'left' ? 'selected="selected"' : ''
                    }
                ),
                template(
                    tplTypeSelOpt, 
                    { 
                        text: '右轴', 
                        value: 'right',
                        sel: ser.yAxisName == 'right' ? 'selected="selected"' : ''
                    }
                )
            ];

            html.push(
                template(
                    tplTypeSel,
                    { 
                        serKey: serKey,
                        css: css,
                        typeOpt: htmlTypeOpt.join(''),
                        axisOpt: htmlAxisOpt.join('')
                    }
                )
            );
        }

        html.push('</div>');

        contentEl.innerHTML = html.join('');
    };

    /** 
     * @override
     */
    CHART_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var css = 'chart-config-panel';
        var contentEl = this.getContentEl();
        var data = this._data;
        var series = data.series || (data.series = {});
        var yAxises = data.yAxises || (data.yAxises = {});
        var els = contentEl.getElementsByTagName('DIV');

        for (var i = 0, el; el = els[i]; i ++) {
            var serKey = el.getAttribute('data-series-group');
            if (serKey) {
                var sel;
                sel = q(css + '-graph-type-sel', el)[0];
                series[serKey].type = (
                    sel.options[sel.selectedIndex] || {}
                ).value;
                sel = q(css + '-graph-axis-sel', el)[0];
                series[serKey].yAxisName = (
                    sel.options[sel.selectedIndex] || {}
                ).value;
            }
        }

        return { series: series, yAxises: yAxises };
    };

    function fmtInput(value) {
        if (value == null) {
            return '';
        }
        return trim(String(value));
    }

})();