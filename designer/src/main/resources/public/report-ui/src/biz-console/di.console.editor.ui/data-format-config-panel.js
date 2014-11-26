/**
 * di.console.editor.ui.DefaultDataFormatPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    设置默认的数据格式
 * @author:  xiaoming.chen(xiaoming.chen)
 * @depend:  xui, xutil
 */
$namespace('di.console.editor.ui');

(function() {

    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var AJAX = di.config.Ajax;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var textSubstr = xutil.string.textSubstr;
    var encodeHTML = xutil.string.encodeHTML;
    var htmlText = xutil.string.htmlText;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var stringifyParam = xutil.url.stringifyParam;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var ecuiCreate = UTIL.ecuiCreate;
    var $fastCreate = ecui.$fastCreate;
    var isString = xutil.lang.isString;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var strToBoolean = UTIL.strToBoolean;
    var UI_CONTROL = ecui.ui.Control;
    var alert = di.helper.Dialog.alert;
    var UI_BUTTON = ecui.ui.Button;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var DI_FACTORY;
    var COMMON_PARAM_FACTORY;

    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
    });

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 默认数据格式设置
     *
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var DATA_FORMAT_CONFIG_PANEL = $namespace().DataFormatPanel =
        inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this._mModel = options.model;
                this.DATASOURCE_ID_MAPPING = {
                    INIT: 'GET_TEMPLATE_INFO',
                    SUBMIT: 'DATA_FORMAT_SET'
                };
            }
        );
    var DATA_FORMAT_CONFIG_PANEL_CLASS = DATA_FORMAT_CONFIG_PANEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    DATA_FORMAT_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
    };

    /** 
     * @override
     */
    DATA_FORMAT_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
    };

    /** 
     * @override
     */
    DATA_FORMAT_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        // 首先dispose
        contentEl.innerHTML = ''

        var format = data.defaultFormat || 'I,III.DD';
        var html = [
                '<div class="data-format-config">',
                '<div>',
                '<label>默认数据格式:</label>',
                '<select class="data_format_select">',
                    '<option value="I,III.DD">千分位,两位小数</option>',
                    '<option value="I,III">千分位整数</option>',
                    '<option value="III">整数</option>',
                    '<option value="I.DD%">两位小数百分比</option>',
                    '<option value="HH:mm:ss">时间格式</option>',
                '</select>',
                '</div>',
                '<div><label class="data-format-config-charactor">指标信息:</label></div>',
               // '#{measureFormats}',
                '</div>',
                '<div>建议设置完模板的可选指标和维度以后再进行数据格式设置</div>'
            ].join('');
        
        contentEl.innerHTML = html;
        q('data_format_select',contentEl)[0].value = format; 

        q('data_format_select',contentEl)[0].onchange = bindDefaultFormatChange;

        bindDefaultFormatChange();
        appendChildToContent(data.measures);

        function appendChildToContent(measures){
            if(measures){
                var dataFormatDiv = q('data-format-config',contentEl)[0];
                for(var i = 0; i<measures.length;i++){
                    var measure = measures[i];
                    var divElement = document.createElement('div');
                    var divHtml = [
                        '<div class="data-format-config-item">',
                        '<label>#{MeasureName}</label>',
                        '<select class="measure-format"  name="#{uniqueName}">',
                            '<option value="I,III.DD">千分位,两位小数</option>',
                            '<option value="I,III">千分位整数</option>',
                            '<option value="I.DD%">两位小数百分比</option>',
                            '<option value="HH:mm:ss">时间格式</option>',
                            '<option value="D天 HH:mm:ss">时间格式(带天)</option>',
                        '</select>',
                        '</div>'
                    ].join('')
                    divHtml = template(
                                divHtml,
                                {
                                MeasureName : measure.name,
                                uniqueName : measure.uniqueName
                                }
                                    
                                );
                    divElement.innerHTML = divHtml;
                    if(!measure.format){
                        measure.format = format;
                    }
                    q('measure-format',divElement)[0].value = measure.format; 

                    dataFormatDiv.appendChild(divElement);
                }
                
            }
        }

        function bindDefaultFormatChange(){
            var defaultFormatEl = q('data_format_select',contentEl)[0];

            var measureFormats = q('measure-format',contentEl);
            if(measureFormats){
                for(var i=0;i<measureFormats.length; i++){
                    measureFormats[i].value = defaultFormatEl.value;
                }
            }
        }

    };

    
    /** 
     * @override
     */
    DATA_FORMAT_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var contentEl = this.getContentEl();
        var defaultFormat = q('data_format_select',contentEl)[0].value;

        var measures = q('measure-format',contentEl);

        var formatMap = {};
        if(measures){
            for(var i=0;i<measures.length;i++){
                var measure = measures[i];
                if(measure.value == defaultFormat){
                    continue;
                }else{
                    var uniqueNameList = formatMap[measure.value];
                    if(!uniqueNameList){
                        uniqueNameList = [];
                        formatMap[measure.value] = uniqueNameList;
                    }
                    uniqueNameList.push(measure.name);
                }
            }
        }


        return {
            formatDto: {
                defaultFormat:defaultFormat,
                measureFormatMap : formatMap
            }
        };
        
    };

    DATA_FORMAT_CONFIG_PANEL_CLASS.$doGetInitArgs = function(){
        return {
            key : 'DATA_FORMAT'
        };
    };


})();