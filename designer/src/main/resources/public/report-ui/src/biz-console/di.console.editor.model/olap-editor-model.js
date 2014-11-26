/**
 * di.console.model.OLAPEditorModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    报表编辑Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.console.editor.model');

(function() {
    
    //------------------------------------------
    // 引用
    //------------------------------------------

    var FORMATTER = di.helper.Formatter;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var URL = di.config.URL;
    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var q = xutil.dom.q;
    var g = xutil.dom.g;
    var bind = xutil.fn.bind;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var parse = baidu.json.parse;
    var stringify = baidu.json.stringify;
    var hasValue = xutil.lang.hasValue;
    var stringToDate = xutil.date.stringToDate;
    var dateToString = xutil.date.dateToString;
    var textParam = xutil.url.textParam;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var XDATASOURCE = xui.XDatasource;
    var COMMON_PARAM_FACTORY;
        
    $link(function() {
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
    });


    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * 报表编辑Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var OLAP_EDITOR_MODEL = 
            $namespace().OLAPEditorModel = 
            inheritsObject(XDATASOURCE, constructor);
    var OLAP_EDITOR_MODEL_CLASS = 
            OLAP_EDITOR_MODEL.prototype;
  
    //------------------------------------------
    // 常量
    //------------------------------------------

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造方法
     *
     * @private
     * @param {Object} options 参数
     * @param {Object} options.reportType 类型，
     *          TABLE(默认)或者CHART
     * @param {string} options.schemaName
     * @param {string} options.cubeTreeNodeName
     */
    function constructor(options) {
        this._sReportType = options.reportType || 'RTPL_OLAP_TABLE';
        this._sSchemaName = options.schemaName;
        this._sCubeTreeNodeName = options.cubeTreeNodeName;

        this._fCommonParamGetter = (new COMMON_PARAM_FACTORY()).getGetter(
            { reportTemplateId: options.reportTemplateId }
        );
    }

    /**
     * @override
     */
    OLAP_EDITOR_MODEL_CLASS.init = function() {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_EDITOR_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            INIT: URL.fn('OLAP_REPORT_INIT'),
            SAVE: URL.fn('OLAP_SAVE'),
            COL_CONFIG_GET: URL.fn('META_CONDITION_COL_CONFIG_GET'),
            COL_CONFIG_SUBMIT: URL.fn('META_CONDITION_COL_CONFIG_SUBMIT')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_EDITOR_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            INIT: function (options) { 
                var paramArr = [];
                paramArr.push('type=' + textParam(this._sReportType));
                paramArr.push('schemaName=' + textParam(this._sSchemaName));
                paramArr.push('treeNodeName=' + textParam(this._sCubeTreeNodeName));
                // 如果有reporttempateid则是打开，否则为创建
                paramArr.push('reportTemplateId=' + textParam(
                    this._fCommonParamGetter.getReportTemplateId()
                ));
                return paramArr.join('&');
            },
            SAVE: function (options) { 
                var param = [];
                param.push(
                    'reportTemplateName=' + textParam(
                        options.args.reportTemplateName
                    ),
                    'reportTemplateId=' + textParam(
                        this._fCommonParamGetter.getReportTemplateId()
                    )
                );
                return param.join('&');
            },
            COL_CONFIG_GET: function () {
                return ''; // TODO
            },
            COL_CONFIG_SUBMIT: function () {
                return ''; // TODO
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_EDITOR_MODEL_CLASS.result = new XDATASOURCE.Set(
        {
            INIT: function(data) {
                this._fCommonParamGetter.update(
                    { reportTemplateId: data ? data['reportTemplateId'] : '' }
                );
            },
            SAVE: function(data) {
                this._fCommonParamGetter.update(
                    { reportTemplateId: data ? data['reportTemplateId'] : '' }
                );
            },
            COL_CONFIG_GET: function () {
                // TODO
            },
            COL_CONFIG_SUBMIT: function () {
                // TODO
            }
        }
    );

    /**
     * @public
     */
    OLAP_EDITOR_MODEL_CLASS.getCommonParamGetter = function() {
        return this._fCommonParamGetter;
    };

})();

