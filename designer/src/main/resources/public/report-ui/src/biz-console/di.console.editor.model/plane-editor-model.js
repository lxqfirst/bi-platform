/**
 * di.console.model.PlaneEditorModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    平面表编辑Model
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
     * 平面报表编辑Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var PLANE_EDITOR_MODEL = $namespace().PlaneEditorModel = 
        inheritsObject(XDATASOURCE, constructor);
    var PLANE_EDITOR_MODEL_CLASS = PLANE_EDITOR_MODEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    function constructor(options) {
        options = options || {};
        this._fCommonParamGetter = (new COMMON_PARAM_FACTORY()).getGetter();
        this._sDatasourceName = options.datasourceName;
        this._sReportTemplateId = options.reportTemplateId;
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    PLANE_EDITOR_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            INIT: URL.fn('PLANE_TABLE_INIT'),
            // 保存SQL
            // @param sqlString: 如：selec {a.col1}, {b.col2} from table1 as a, table2 as b where [a.col1=:col1 ] and [b.col2 =:cols2 ]
            // @param templateName
            // @param datasourceName
            // @param reportTemplateId（没有则新建，有则修改）
            // @return  { reportTemplateId: sadsafasdfasdfas }
            // sql解析错误则返回状太码：10010，页面提示错误
            // 注意：一旦sql被改动，则出了保存按钮的都禁用
            SQL_SAVE: URL.fn('PLANE_TABLE_SQL_SAVE'),
            // 得到column信息列表，用于column设置浮层
            // @param reportTemplateId
            // @return [{sqlKey: "a.col1", showName: "哈哈", paramKey: "AAAformURL“，format: "I,III", orderby: "asc", isDefaultShow: true}, { ... }, {}]
            COL_DATA: URL.fn('PLANE_TABLE_COL_DATA'),
            // 保存column信息列表，用于column设置浮层
            // @param reportTemplateId
            // @param columnJson=[{sqlKey: "a.col1", showName: "哈哈", paramKey: "AAAformURL“，format: "I,III", orderby: "asc", isDefaultShow: true}, { ... }, {}]
            COL_SAVE: URL.fn('PLANE_TABLE_COL_SAVE'),
            // 得到condition信息列表，用于condition设置浮层
            // @param reportTemplateId
            // @return [{sqlKey: "a.col1", paramKey: "AAAformURL“ }, { ... }, {}]
            COND_DATA: URL.fn('PLANE_TABLE_COND_DATA'),
            // 保存condition信息列表，用于condition设置浮层
            // @param reportTemplateId
            // @param condJson=[{sqlKey: "a.col1", paramKey: "AAAformURL“ }, { ... }, {}]
            COND_SAVE: URL.fn('PLANE_TABLE_COND_SAVE'),
            PREVIEW_DATA: URL.fn('PLANE_TABLE_PREVIEW_DATA')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    PLANE_EDITOR_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            INIT: function (options) {
                // 如果有reporttempateid则是打开，否则为创建
                return 'reportTemplateId=' + textParam(this._sReportTemplateId);
            },
            SQL_SAVE: function (options) {
                var param = [];
                param.push('sqlString=' + textParam(options.args.sqlString));
                param.push('reportTemplateName=' + textParam(options.args.reportTemplateName));
                param.push('reportTemplateId=' + textParam(this._sReportTemplateId));
                param.push('datasourceName=' + textParam(this._sDatasourceName));
                return param.join('&');
            },
            COL_DATA: handleDataParam,
            COL_SAVE: handleSaveParam,
            COND_DATA: handleDataParam,
            COND_SAVE: handleSaveParam,
            PREVIEW_DATA: handleDataParam
        }
    );

    function handleDataParam() {
        return 'reportTemplateId=' + textParam(this._sReportTemplateId);
    }

    function handleSaveParam() {
        var param = [];
        param.push('reportTemplateId=' + textParam(this._sReportTemplateId));
        param.push('columnJson=' + textParam(stringify(this._oMappingConfig)));
        return param.join('&');
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    PLANE_EDITOR_MODEL_CLASS.result = new XDATASOURCE.Set(
        {
            INIT: handleInitResult,
            SQL_SAVE: handleSubmitResult,
            COL_DATA: handleDataResult,
            COL_SAVE: handleSubmitResult,
            COND_DATA: handleDataResult,
            COND_SAVE: handleSubmitResult,
            PREVIEW_DATA: handlePreviewResult
        }
    );

    function handleInitResult(data) {
        var datasourceName = data.datasourceName;
        if (datasourceName) {
            this._sDatasourceName = datasourceName;
        }
    }

    function handleSubmitResult(data) {
        var reportTemplateId = data.reportTemplateId;
        if (reportTemplateId) {
            this._sReportTemplateId = reportTemplateId;
            this._fCommonParamGetter.update(
                { reportTemplateId: reportTemplateId }
            );
        }
    }

    function handleDataResult(data) {
        this._sReportTemplateId = data.reportTemplateId;
        this._oMappingConfig = data.columnJson || [];
    }

    function handlePreviewResult(data) {
        this._oMappingConfig = data.condJson || [];
        this._oColShow = data.columnJson || [];
    }

    PLANE_EDITOR_MODEL_CLASS.getMappingConfig = function () {
        return this._oMappingConfig;
    };

    PLANE_EDITOR_MODEL_CLASS.getColShow = function () {
        return this._oColShow;
    };

    PLANE_EDITOR_MODEL_CLASS.getCommonParamGetter = function() {
        return this._fCommonParamGetter;
    };

})();

