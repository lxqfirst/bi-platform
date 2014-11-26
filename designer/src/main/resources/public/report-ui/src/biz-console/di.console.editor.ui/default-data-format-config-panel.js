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
    var DEFAULT_DATA_FORMAT_CONFIG_PANEL = $namespace().DefaultDataFormatPanel =
        inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this._mModel = options.model;
                this.DATASOURCE_ID_MAPPING = {
                    INIT: 'GET_TEMPLATE_INFO',
                    SUBMIT: 'DEFAULT_DATA_FORMAT_SUBMIT'
                };
            }
        );
    var DEFAULT_DATA_FORMAT_CONFIG_PANEL_CLASS = DEFAULT_DATA_FORMAT_CONFIG_PANEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    DEFAULT_DATA_FORMAT_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
    };

    /** 
     * @override
     */
    DEFAULT_DATA_FORMAT_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
    };

    /** 
     * @override
     */
    DEFAULT_DATA_FORMAT_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        // 首先dispose
        contentEl.innerHTML = ''

        var format = data.format || 'I,III.DD';
        var html = [
                '<label>默认数据格式:</label>',
                '<select class="data_format_select">',
                    '<option value="I,III.DD">千分位,两位小数</option>',
                    '<option value="I,III">千分位整数</option>',
                    '<option value="I.DD%">两位小数百分比</option>',
                '</select>',
                '<div></div>',
                '<div></div>'
            ].join('');
        
        contentEl.innerHTML = html;
        q('data_format_select',contentEl)[0].value = format; 

    };

    
    /** 
     * @override
     */
    DEFAULT_DATA_FORMAT_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var contentEl = this.getContentEl();
        var defaultFormat = q('data_format_select',contentEl)[0].value;
        return {
            format: defaultFormat
        };
        
    };

    DEFAULT_DATA_FORMAT_CONFIG_PANEL_CLASS.$doGetInitArgs = function(){
        return {
            key : 'DEFAULT_DATA_KEY'
        };
    };


})();