/**
 * di.console.editor.ui.DefaultDataFormatPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    点击查询按钮输入查询参数
 * @author:  xiaoming.chen(xiaoming.chen@baidu.com)
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
    var parseParam = xutil.url.parseParam;
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
    var QUERY_PARAM_FIX_PANEL = $namespace().QueryParamFix =
        inheritsObject(
            BASE_CONFIG_PANEL
        );
    var QUERY_PARAM_FIX_PANEL_CLASS = QUERY_PARAM_FIX_PANEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    QUERY_PARAM_FIX_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
    };



    QUERY_PARAM_FIX_PANEL_CLASS.$doOpen = function(mode, options) {
        this._uDIData = options.data;
    };

    /** 
     * @override
     */
    QUERY_PARAM_FIX_PANEL_CLASS.$doRender = function(contentEl, data) {
        // 首先dispose
        contentEl.innerHTML = ''

        var html = [
            '<span>报表查询参数：<span>',
            '<div>',
                '<textarea class="query-extend-param"></textarea>',
            '</div>',
            '<div>',
                '多个参数之间用&连接，如有参数param1和param2,对应的值分别是 param1V 和 param2V，<br>',
                '还有个数组类型的参数paramArray值为paramArrayV1、paramArrayV2,那么拼接成的参数如下：<br>',
                '<font color="red">param1</font>=',
                '<font color="green">param1v</font>',
                '<font color="blue">&amp;</font>',
                '<font color="red">param2</font>=',
                '<font color="green">param2v</font>',
                '<font color="blue">&amp;</font>',
                '<font color="red">paramArray</font>=',
                '<font color="green">paramArrayV1</font>',
                '<font color="blue">&amp;</font>',
                '<font color="red">paramArray</font>=',
                '<font color="green">paramArrayV2</font>',
            '</div>'
        ].join('');
        contentEl.innerHTML = html;
    };

   QUERY_PARAM_FIX_PANEL_CLASS.$doSubmit = function(){
        var args = this.$doGetSubmitArgs();
       
        
        this.$handleSubmitSuccess(null, null, null);
        cmptSync4Console(DI_FACTORY(), this._uDIData,args);
        
   }

   /** 
    * @override
    */
   QUERY_PARAM_FIX_PANEL_CLASS.$doGetSubmitArgs = function() {
       var contentEl = this.getContentEl();
       var extendParam = q('query-extend-param',contentEl)[0].value;

       return parseParam(extendParam);
   };



})();