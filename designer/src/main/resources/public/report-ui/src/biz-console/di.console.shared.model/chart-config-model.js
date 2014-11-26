/**
 * di.console.shared.model.ChartConfigModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    图设置Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.console.shared.model');

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
     * 图设置Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var CHART_CONFIG_MODEL = $namespace().ChartConfigModel = 
            inheritsObject(XDATASOURCE, constructor);
    var CHART_CONFIG_MODEL_CLASS = 
            CHART_CONFIG_MODEL.prototype;
  
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
     */
    function constructor(options) {
    }

    /**
     * @override
     */
    CHART_CONFIG_MODEL_CLASS.init = function() {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    CHART_CONFIG_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            INIT: URL.fn('OLAP_CHART_BASE_CONFIG_INIT'),
            SUBMIT: URL.fn('OLAP_CHART_BASE_CONFIG_INIT')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    CHART_CONFIG_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            INIT: function(options) { 
                return '';
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    CHART_CONFIG_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            INIT: function(data) {
            }
        }
    );

})();

