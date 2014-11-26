/**
 * di.shared.model.DIPlaneTableModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    DI 平面表模型组件
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.model');

(function () {
    
    //------------------------------------------
    // 引用
    //------------------------------------------

    var URL = di.config.URL;
    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var logError = UTIL.logError;
    var getUID = xutil.uid.getUID;
    var XDATASOURCE = xui.XDatasource;

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * DI 表模型组件
     *
     * @class
     * @extends xui.XDatasource
     * @param {Function=} options.commonParamGetter      
     */
    var DI_PLANE_TABLE_MODEL = 
            $namespace().DIPlaneTableModel = 
            inheritsObject(XDATASOURCE, constructor);
    var DI_PLANE_TABLE_MODEL_CLASS = 
            DI_PLANE_TABLE_MODEL.prototype;

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
        /**
         * 得到公用的请求参数
         *
         * @type {Function}
         * @private
         */
        this._fCommonParamGetter = options.commonParamGetter;
    }

    /**
     * @override
     */
    DI_PLANE_TABLE_MODEL_CLASS.init = function () {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_PLANE_TABLE_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            DATA: URL.fn('PLANE_TABLE_DATA'),
            CHECK: URL.fn('PLANE_TABLE_CHECK'),
            SELECT: URL.fn('PLANE_TABLE_SELECT'),
            OFFLINE_DOWNLOAD: URL.fn('PLANE_TABLE_OFFLINE_DOWNLOAD')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_PLANE_TABLE_MODEL_CLASS.businessKey = new XDATASOURCE.Set(
        {
            DATA: 'DI_PLANE_TABLE_MODEL_DATA_' + getUID(),
            CHECK: 'DI_PLANE_TABLE_MODEL_CHECK_' + getUID(),
            SELECT: 'DI_PLANE_TABLE_MODEL_SELECT_' + getUID(),
            OFFLINE_DOWNLOAD: 'DI_TABLE_OFFLINE_DOWNLOAD_' + getUID()
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_PLANE_TABLE_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            DATA: function (options) {
                return this._fCommonParamGetter(options.args.param);
            },
            CHECK: function (options) {
                return this._fCommonParamGetter(
                    // TODO
                    // 参数名未定
                    { uniqueName: options.args.param.uniqueName }
                );
            },
            SELECT: function (options) {
                return this._fCommonParamGetter(
                    // TODO
                    // 参数名未定
                    { uniqueName: options.args.param.uniqueName }
                );
            },
            OFFLINE_DOWNLOAD: function (options) {
                return this._fCommonParamGetter(
                    // TODO
                    // 参数名未定
                    { mailTo: options.args.param.email }
                );
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_PLANE_TABLE_MODEL_CLASS.complete = new XDATASOURCE.Set(
        {
            DATA: doComplete,
            DRILL: doComplete,
            LINK_DRILL: doComplete,
            SELECT: doComplete,
            CHECK: doComplete,
            OFFLINE_DOWNLOAD: doComplete
        }
    );

    function doComplete(ejsonObj) {
        // 换reportTemplateId（后台生成了副本，所以约定更换为副本的id）
        // FIXME 
        // 换成非嵌入的实现方式
        this._fCommonParamGetter.update(ejsonObj.data);
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_PLANE_TABLE_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            DATA: doParse,
            CHECK: function (data) { return data; },
            SELECT: function (data) { return data; }
        }
    );

    /**
     * 解析后台数据
     * 
     * @private
     */
    function doParse(data, ejsonObj, options) {
        try {
            var retData = {
                tableData: {
                    head: data.head,
                    data: data.data
                },
                pageInfo: data.pageInfo,
                exception: data.exception,
                actualSql: data.actualSql
            };
            return retData;
        }
        catch (e) {
            logError(e);
            this.$goError();
        }
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_PLANE_TABLE_MODEL_CLASS.error = new XDATASOURCE.Set(
        {
            DATA: function (status, ejsonObj, options) {
                this._oTableData = {};
                this._oBreadcrumbData = {};
            }
            // TODO
        }
    );

})();

