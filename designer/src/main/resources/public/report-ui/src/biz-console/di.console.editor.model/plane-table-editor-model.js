/**
 * di.console.model.PlaneTableEditorModel
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

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * 平面报表编辑Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var PLANE_TABLE_EDITOR_MODEL = 
            $namespace().PlaneTableEditorModel = 
            inheritsObject(XDATASOURCE, constructor);
    var PLANE_TABLE_EDITOR_MODEL_CLASS = 
            PLANE_TABLE_EDITOR_MODEL.prototype;
  
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
        // this._sReportType = options.reportType || 'RTPL_OLAP_TABLE';
        // this._sSchemaName = options.schemaName;
        // this._sCubeTreeNodeName = options.cubeTreeNodeName;
        // this._sReportTemplateId;
    }

    /**
     * @override
     */
    PLANE_TABLE_EDITOR_MODEL_CLASS.init = function() {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    PLANE_TABLE_EDITOR_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            // 保存SQL
            // @param sqlString: 如：selec {a.col1}, {b.col2} from table1 as a, table2 as b where [a.col1=:col1 ] and [b.col2 =:cols2 ]
            // @param templateName
            // @param datasourceName
            // @param reportTemplateId（没有则新建，有则修改）
            // @return  { reportTemplateId: sadsafasdfasdfas }
            // sql解析错误则返回状太码：10010，页面提示错误
            // 注意：一旦sql被改动，则出了保存按钮的都禁用
            SQL_SAVE: URL('PLANE_TABLE_SQL_SAVE'),
            // 得到column信息列表，用于column设置浮层
            // @param reportTemplateId
            // columnJson=[{sqlKey: "a.col1", showName: "哈哈", paramKey: "AAAformURL“，format: "I,III", orderby: "asc", isDefaultShow: true}, { ... }, {}]
            COL_DATA: URL('PLANE_TABLE_COL_DATA'),
            // 保存column信息列表，用于column设置浮层
            // @param reportTemplateId
            // columnJson=[{sqlKey: "a.col1", showName: "哈哈", paramKey: "AAAformURL“，format: "I,III", orderby: "asc", isDefaultShow: true}, { ... }, {}]
            COL_SAVE: URL('PLANE_TABLE_COL_SAVE'),
            // 得到condition信息列表，用于condition设置浮层
            // @param reportTemplateId
            // condJson=[{sqlKey: "a.col1", paramKey: "AAAformURL“ }, { ... }, {}]
            COND_DATA: URL('PLANE_TABLE_COND_DATA'),
            // 保存condition信息列表，用于condition设置浮层
            // @param reportTemplateId
            // condJson=[{sqlKey: "a.col1", paramKey: "AAAformURL“ }, { ... }, {}]
            COND_SAVE: URL('PLANE_TABLE_COND_SAVE')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    PLANE_TABLE_EDITOR_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            SQL_SAVE: function(options) { 
            //     var paramArr = [];
            //     paramArr.push('schemaName=' + textParam(this._sSchemaName));
            //     paramArr.push('treeNodeName=' + textParam(this._sCubeTreeNodeName));
            //     return paramArr.join('&');
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    PLANE_TABLE_EDITOR_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            SQL_SAVE: function(data) {
            //     this._sReportTemplateId = data ? data['reportTemplateId'] : '';
            }
        }
    );

})();

