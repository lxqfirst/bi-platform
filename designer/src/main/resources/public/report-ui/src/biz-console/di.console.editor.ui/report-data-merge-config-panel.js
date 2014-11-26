/**
 * di.console.editor.ui.DefaultDataFormatPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    设置报表数据合并方式,不合并,行合并,列合并
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
    var REPORT_DATA_MERGE_CONFIG_PANEL = $namespace().ReportDataMergeConfigPanel =
        inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this._mModel = options.model;
                this.DATASOURCE_ID_MAPPING = {
                    INIT: 'GET_TEMPLATE_INFO',
                    SUBMIT: 'REPORT_ROWMERGE_KEY_SUBMIT'
                };
            }
        );
    var REPORT_DATA_MERGE_CONFIG_PANEL_CLASS = REPORT_DATA_MERGE_CONFIG_PANEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    REPORT_DATA_MERGE_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
    };

    /** 
     * @override
     */
    REPORT_DATA_MERGE_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
    };

    /** 
     * @override
     */
    REPORT_DATA_MERGE_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        // 首先dispose
        contentEl.innerHTML = ''

        var type = data.type || 'SIMPLE';
        var html = [
            '   <div>',
            '       <label>报表数据合并方式:</label>',
            '       <select class="merge_type">',
            '           <option value="SIMPLE">不合并</option>',
            '           <option value="ROWMERGE">行合并</option>',
            '           <option value="COLUMNMERGE">列合并</option>',
            '       </select>',
                    '<span class="row-merge-span">',
            '       <label>行合并的维度:</label>',
            '       <select class="row_merge_key">',
            '       </select>',
                    '</span>',
            '   </div>',
            '   <ul>',
            '       <li>表格数据合并说明:</li>',
            '           <li>1.不合并:直接根据设置的条件查询多维表并展现</li>',
            '           <li>2.行合并:根据制定维度,将查询出来的数据按照行进行合并,',
            '                       该方案适用于树形结构维度,但是树形的结构却随时变化或者无法构成一个树</li>',
            '           <li>3.列合并:来源于不同模型的数据合并成一张报表展示</li>',
            '   </ul>',
            '</div>'
            ].join('');
        
        contentEl.innerHTML = html;
       q('merge_type',contentEl)[0].value = type;
       var rowMergeSpan = q('row-merge-span',contentEl)[0];
       var mergeKey = q('row_merge_key',contentEl)[0];
       if(data.dimList){
                mergeKey.innerHTML = '';
                data.dimList.foreach(function(key, item, index){
                    mergeKey.add(new Option(item.caption,item.name));
               });
               
           } 
       if(type == 'ROWMERGE'){
            rowMergeSpan.style.display = '';
            mergeKey.value = data.rmKey;
       }else{
            rowMergeSpan.style.display = 'none';
       }

       

       this.$bindEvent();

    };

    REPORT_DATA_MERGE_CONFIG_PANEL_CLASS.$bindEvent = function(){
        var contentEl = this.getContentEl();
        var mergeType = q('merge_type',contentEl)[0];
        var rowMergeSpan = q('row-merge-span',contentEl)[0];

        mergeType.onchange = bind(mergeTypeChange,mergeType);
        
        
        function mergeTypeChange(){
            if(this.value == 'ROWMERGE'){
                rowMergeSpan.style.display = '';
            }else{
                rowMergeSpan.style.display = 'none';
            }
        }
    }

    
    /** 
     * @override
     */
    REPORT_DATA_MERGE_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var contentEl = this.getContentEl();
        var mergeType = q('merge_type',contentEl)[0].value;
        var  param = [];
        param.push("pivottableModelBuilderStyle,"+mergeType);
        if(mergeType == 'ROWMERGE'){
            var mergeDim =  q('row_merge_key',contentEl)[0].value;
            param.push("pivottableModelBuilderStyleRMKey," + mergeDim);
        }
        return {
            updateTemplateProperty: param
        };
        
    };

    REPORT_DATA_MERGE_CONFIG_PANEL_CLASS.$doGetInitArgs = function(){
        return {
            key : 'DATA_MERGE_TYPE'
        };
    };


})();