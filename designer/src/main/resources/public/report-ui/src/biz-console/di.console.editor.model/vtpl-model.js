/**
 * di.console.model.VTplModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    试图模版Model
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
    var jsonStringify = di.helper.Util.jsonStringify;
    var assign = xutil.object.assign;
    var stringifyParam = xutil.url.stringifyParam;
    var parse = baidu.json.parse;
    var assert = UTIL.assert;
    var parseFileName = UTIL.parseFileName;
    var ajaxRequest = baidu.ajax.request;
    var stringify = baidu.json.stringify;
    var hasValue = xutil.lang.hasValue;
    var getUID = xutil.uid.getUID;
    var stringToDate = xutil.date.stringToDate;
    var dateToString = xutil.date.dateToString;
    var textParam = xutil.url.textParam;
    var travelTree = xutil.collection.travelTree;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var XDATASOURCE = xui.XDatasource;
    var VTPL;
    var GLOBAL_MODEL;

    $link(function () {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
        VTPL = di.console.editor.model.VTpl;
    });

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * 试图模版Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var VTPL_MODEL = 
            $namespace().VTplModel = 
            inheritsObject(XDATASOURCE, constructor);
    var VTPL_MODEL_CLASS = 
            VTPL_MODEL.prototype;
  
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
//        this._vtpls = new LINKED_HASH_MAP();
        this._molds = new LINKED_HASH_MAP();
        this._vtplMap = {
            release: new LINKED_HASH_MAP(),
        	pre: new LINKED_HASH_MAP(),
            dev: new LINKED_HASH_MAP(),
            all: new LINKED_HASH_MAP()
        };
    }

    /**
     * @override
     */
    VTPL_MODEL_CLASS.init = function() {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    VTPL_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            VTPL_LIST: URL.fn('CONSOLE_VTPL_LIST'),
            // MOLD_LIST: URL.fn('CONSOLE_MOLD_LIST'),
            SAVE_TPL: URL.fn('CONSOLE_SAVE_TPL'),
            GET_COND: URL.fn('CONSOLE_GET_COND'),
            EXIST_COND: URL.fn('CONSOLE_EXIST_COND'),
            DS_LIST: URL.fn('CONSOLE_DS_LIST'),
            TO_PRE: URL.fn('CONSOLE_TO_PRE'),
            TO_RELEASE: URL.fn('CONSOLE_TO_RELEASE'),
            REPORT_QUERY:URL.fn('REPORT_QUERY'),
            MOLD_QUERY:URL.fn('MOLD_QUERY'),
            PAHNTOMJS_INFO:URL.fn('PAHNTOMJS_INFO')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    VTPL_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            SAVE_TPL: function (options) {
                var param = [];
                var vtpl = options.args.vtpl;

                param.push(
                    'virtualTemplateName=' + textParam(vtpl.vtplName),
                    'virtualTemplateId=' + textParam(vtpl.vtplKey),
                    'doCreate=' + (vtpl.status == 'MOLD')
                );
                // FIXME
                // 这是不得以加的，后续考虑去掉
                assert(!!vtpl.snippet.content, 'SNIPPET 为空');
                assert(!!vtpl.depict.content, 'DEPICT 为空');

                param.push(
                    // 条件的保存（会向相应的reportTemplate中写入）
                    'condConf=' + textParam(jsonStringify(vtpl.condSubmitGet())),
                    // 'snippetName=' + textParam(vtpl.vtplKey + '.vm'),
                    'snippetContent=' + textParam(vtpl.snippet.content),
                    // 'depictName=' + textParam(vtpl.vtplKey + '.json'),
                    'depictContent=' + textParam(vtpl.depict.content)
                );
                return param.join('&');
            },
            // cond的候选项
            GET_COND: function (options) {
                return stringifyParam(
                    assign({}, options.args, ['reportTemplateIdList', 'virtualTemplateId']),
                    true
                ).join('&');
            },
            // 已选中并保存的cond
            EXIST_COND: function (options) {
                return stringifyParam(
                    assign({}, options.args, ['reportTemplateIdList', 'virtualTemplateId']),
                    true
                ).join('&');
            },
            DS_LIST: function (options) {
                return 'reportTemplateType=' + textParam(options.args.reportTemplateType);
            },
            TO_PRE: function (options) {
                return 'reportTemplateIdList=' + options.args.vtpl.vtplKey;
            },
            TO_RELEASE: function (options) {
                return 'reportTemplateIdList=' + options.args.vtpl.vtplKey;
            },
            REPORT_QUERY: function (options) {
                return stringifyParam(
                    assign({}, options.args, ['reportName']),
                    true
                ).join('&');
            },
            MOLD_QUERY: function (options) {
                return stringifyParam(
                    assign({}, options.args, ['reportName']),
                    true
                ).join('&');
            },
            PAHNTOMJS_INFO: function (options) {
                return stringifyParam(
                    assign({}, options.args, ['perviewUrl','imgName']),
                    true
                ).join('&');
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    VTPL_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            VTPL_LIST: function (data, ejsonObj, options) {
                var list = data.vtplInfo || [];
                for (var i = 0, item, vtpl, vtplKey; i < list.length; i ++) {
                    if ((item = list[i]) && (vtplKey = item.id)) {
                        vtpl = this._vtpls.get(vtplKey);
                        if (!vtpl) {
                            vtpl = new VTPL({
                                vtplKey: vtplKey,
                                vtplName: item.name 
                                    || (item.name = '未命名视图模版'),
                                snippet: {
                                    fileName: item.id,
                                    extName: 'vm',
                                    fullName: item.id + '.vm'
                                },
                                depict: {
                                    fileName: item.id,
                                    extName: 'json',
                                    fullName: item.id + '.json'
                                }
                            });
                            vtpl.status = 'SAVED';
                            this._vtpls.set(vtplKey, vtpl);
                        }
                    }
                }
                return data;
            },
            MOLD_LIST: function (data, ejsonObj, options) {
                var list = data.moldFiles || [];
                for (var i = 0, file, vtpl; i < list.length; i ++) {
                    if ((file = parseFileName(list[i])).fileName) {
                        vtpl = this._molds.get(file.fileName) || new VTPL();
                        vtpl[
                            { vm: 'snippet', json: 'depict' }[file.extName]
                        ] = file;
                        // 现在没有vtplKey，所以用fake
                        vtpl.vtplKey = 'RTPL_VIRTUAL_ID';
                        vtpl.status = 'MOLD';
                        this._molds.set(file.fileName, vtpl);
                    }
                }
                return data;
            },
            PAHNTOMJS_INFO: function (data, ejsonObj, options) {
                return data;
            },
            DS_LIST: function (data, ejsonObj, options) {
                dsList = this._reportTemplateList 
                    = data.reportTemplateList = data.reportTemplateList || [];

                // 去除RTPL_VIRTUAL
                for (j = 0; dso = dsList[j]; ) {
                    dso.reportTemplateType == 'RTPL_VIRTUAL'
                        ? dsList.splice(j, 1)
                        : j ++;
                }

                // 添加fake RTPL_VIRTUAL
                dsList.splice(
                    0, 0, 
                    { 
                        reportTemplateId: 'RTPL_VIRTUAL_ID',
                        reportTemplateType: 'RTPL_VIRTUAL'
                    }
                );
                return data;
            },
            REPORT_QUERY: function (data, ejsonObj, options) {
                //每次请求的时候，清空之前_vtplMap里保存的对应状态的数据
                this._vtplMap['dev'].clean();
                this._vtplMap['pre'].clean();
                this._vtplMap['release'].clean();
                var releaseList = data.releaseReportInfo;
                var preList = data.preReportInfo;
                var savedList = data.savedReportInfo;
                var reportArray = [
                                   {list:releaseList,	status:'release'},
                                   {list:preList,		status:'pre'},
                                   {list:savedList,		status:'dev'}
                                   ];
                for(var k = 0 ; k < reportArray.length; k ++){
                	var list = reportArray[k].list;
                	var reportStatus = reportArray[k].status;
	                for (var i = 0, item, vtpl, vtplKey; i < list.length; i ++) {
	                    if ((item = list[i]) && (vtplKey = item.id)) {
	                    	
                            vtpl = this._vtplMap[reportStatus].get(vtplKey);
                            
	                        if (!vtpl) {
	                            vtpl = new VTPL({
	                            	// 将vtpl的key用报表状态和报表id拼接起来
	                                vtplKey: vtplKey,
	                                vtplName: item.name 
	                                    || (item.name = '未命名视图模版'),
	                                snippet: {
	                                    fileName: item.id,
	                                    extName: 'vm',
	                                    fullName: item.id + '.vm'
	                                },
	                                depict: {
	                                    fileName: item.id,
	                                    extName: 'json',
	                                    fullName: item.id + '.json'
	                                }
	                            });
	                             vtpl.status = reportStatus;
	                             this._vtplMap[reportStatus].set(vtplKey, vtpl);
//	                            this._vtpls.set(vtplKey, vtpl);
	                        }
	                    }
	                }
            	}
                return data;
            },
            MOLD_QUERY:function (data, ejsonObj, options) {
                this._molds.clean();
                var list = data.moldFiles || [];
                for (var i = 0, file, vtpl; i < list.length; i ++) {
                    if ((file = parseFileName(list[i].fileName)).fileName) {
                        vtpl = this._molds.get(file.fileName) || new VTPL();
                        vtpl[
                            { vm: 'snippet', json: 'depict' }[file.extName]
                        ] = file;
                        // 现在没有vtplKey，所以用fake
                        vtpl.vtplKey = 'RTPL_VIRTUAL_ID';
                        vtpl.status = 'MOLD';
                        vtpl.desc = list[i].desc ;
                        this._molds.set(file.fileName, vtpl);
                    }
                }
                return data;
            },
            SAVE_TPL: defaultParse,
            GET_COND: defaultParse,
            EXIST_COND: defaultParse,
            TO_PRE: defaultParse,
            TO_RELEASE: defaultParse
        }
    );

    function defaultParse(data) { return data; } 

    /**
     * 从后台请求vtpl内容
     */
    VTPL_MODEL_CLASS.fetchRemoteVTpl = function(vtpl, callback) {
        var me = this;
        var got = 0;
        var url;
        var content = {};

        function getURL(fullName) {
            var path = [URL.getWebRoot()];
            if (vtpl.status == 'MOLD') {
                path.push(
                    DICT.MOLD_PATH,
                    fullName
                );
            }
            else {
                path.push(
                    DICT.VTPL_ROOT,
                    GLOBAL_MODEL().getBizKey(),
                    'dev',
                    fullName
                );
            }
            return path.join('/') + '?__v__=' + Math.random();
        }

        // 请求xxx.vm (snippet)
        ajaxRequest(
            url = getURL(vtpl.snippet.fullName),
            {
                method: 'GET',
                onsuccess: bind(onsuccess, this, url, 'snippet'),
                onfailure: bind(onfailure, this, url)
            }
        );
        // 请求xxx.json (depict)
        ajaxRequest(
            url = getURL(vtpl.depict.fullName),
            {
                method: 'GET',
                onsuccess: bind(onsuccess, this, url, 'depict'),
                onfailure: bind(onfailure, this, url)
            }
        );

        // function requestCondSelected() {
        //     me.sync({
        //         datasourceId: 'EXIST_COND',
        //         args: {
        //             reportTemplateList: vtpl.rtplIdGet(true),
        //             virtualTemplateId: vtpl.vtplKey
        //         },
        //         result: function (data, ejsonObj, options) {
        //             vtpl.rtplCond = data.templateDims || {};
        //             // 回调外层
        //             callback();
        //         },
        //         error: function (status, ejsonObj, options) {
        //             me.disable();
        //             alert('获取条件设置失败：status=' + status);
        //         }
        //     });
        // }

        function onsuccess(url, vtplType, xhr, rspText) {
            got ++;

            content[vtplType] = rspText;

            // 已经全部获取时
            if (got === 2) {
                // 强制写入
                vtpl.contentSet(content.snippet, content.depict, true);
                // 请求已选择的"条件"
                // requestCondSelected();
                callback();
            }
        }

        function onfailure(url, xhr, rspText) {
            me.disable();
            alert('获取vtpl失败：url=' + url + ' status=' + xhr.status);
        }
    };

    /**
     * @public
     */
    VTPL_MODEL_CLASS.getVTpls = function(phase) {
        return this._vtplMap[phase];
    };

    /**
     * @public
     */
    VTPL_MODEL_CLASS.getVTpl = function(phase, vtplKey) {
        return this._vtplMap[phase].get(vtplKey);
    };

    /**
     * @public
     */
    VTPL_MODEL_CLASS.getMolds = function() {
        return this._molds;
    };


    VTPL_MODEL_CLASS.getBizKey = function() {
        return GLOBAL_MODEL().getBizKey();
    };
    
    /**
     * @public
     */
    VTPL_MODEL_CLASS.getMold = function(moldKey) {
        return this._molds.get(moldKey);
    };

    /**
     * @public
     */
    VTPL_MODEL_CLASS.getReportTemplateList = function() {
        return this._reportTemplateList;
    };

    /**
     * 得到转化来的menu结构(vtpl)
     *
     * @public
     */
    VTPL_MODEL_CLASS.getVTplMenuData = function() {
        var menuList = [];
        var menuTree = { menuList: menuList };
        var selMenuId;
        var chList = [];
        var prefix = 'MENU_ID_VTPL';

        menuList.push(
            {
                text: '我的报表',
                value: prefix + '1',
                children: chList
            }
        );

        this._vtpls.foreach(
            function (vtplKey, vtpl, index) {
                var pageId = vtplKey + getUID();
                chList.push(
                    {
                        text: vtpl.vtplName,
                        prompt: '[reportTemplateId]: ' + vtpl.vtplKey,
                        floatTree: [
                            {
                                children: [
                                    {
                                        text: '快速编辑',
                                        // value: prefix + getUID(),
                                        url: 'di.console.editor.ui.VTplPanelPage?'
                                            + [
                                                'pageId=' + pageId,
                                                'pageTitle=' + vtplKey,
                                                'vtplKey=' + vtplKey,
                                                'act=EDIT#QUICK'
                                            ].join('&')
                                    },
                                    {
                                        text: '源码编辑',
                                        // value: prefix + getUID(),
                                        url: 'di.console.editor.ui.VTplPanelPage?'
                                            + [
                                                'pageId=' + pageId,
                                                'pageTitle=' + vtplKey,
                                                'vtplKey=' + vtplKey,
                                                'act=EDIT#CODE'
                                            ].join('&')
                                    }
                                ]
                            }
                        ]
                    }
                );
            }
        );

        menuTree.selMenuId = prefix + '1';

        return { menuTree: menuTree };
    };

    /**
     * 得到转化来的menu结构(vtpl)
     *
     * @public
     */
    VTPL_MODEL_CLASS.getMoldMenuData = function() {
        var menuList = [];
        var menuTree = { menuList: menuList };
        var selMenuId;
        var chList = [];
        var prefix = 'MENU_ID_MOLD';

        menuList.push(
            {
                text: '新建报表（基于模版）',
                value: prefix + '1',
                children: chList
            }
        );

        this._molds.foreach(
            function (moldKey, mold, index) {
                chList.push(
                    {
                        text: moldKey,
                        // FIXME
                        value: prefix + (10000 + index),
                        floatTree: [
                            {
                                value: prefix + String(Math.random()),
                                children: [
                                    {
                                        text: '新建',
                                        value: prefix + String(Math.random()),
                                        url: 'di.console.editor.ui.VTplPanelPage?'
                                            + [
                                                'pageTitle=' + '新建 [基于：' + moldKey + ']',
                                                'moldKey=' + moldKey,
                                                'act=CREATE#QUICK',
                                                'forceCreate=true'
                                            ].join('&')
                                    }
                                ]
                            }
                        ]
                    }
                );
            }
        );

        menuTree.selMenuId = prefix + '1';

        return { menuTree: menuTree };
    };

})();

