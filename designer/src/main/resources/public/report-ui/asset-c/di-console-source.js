/**
 * project declaration
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    项目起始文件，全局声明
 * @author:  sushuang(sushuang)
 * @depend:  xui.XProject
 */

// 如果打包时使用(function() { ... })()包裹住所有代码，
// 则以下声明的变量在闭包中；
// 否则以下声明的变量暴露到全局。
 
// DI名空间基础
xui.XProject.setNamespaceBase(
    window.__$DI__NS$__ = window.__$DI__NS$__ || {}
);

// 声明名空间用方法
var $namespace = xui.XProject.namespace;

// 注册依赖连接用方法
var $link = xui.XProject.link;

// 注册延迟初始化用方法
var $end = xui.XProject.end;

// 得到名空间根基
var $getNamespaceBase = xui.XProject.getNamespaceBase;

// DI根名空间
var di = $namespace('di');

// FIXME
// 暂时用这种方法注册进去
$getNamespaceBase().ecui = ecui;
$getNamespaceBase().xui = xui;
$getNamespaceBase().xutil = xutil;

xutil.object.PATH_DEFAULT_CONTEXT = $getNamespaceBase();
/**
 * configuration of xutil.ajax
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    data insight 全局(包括console和product)的ajax的配置
 *          （常量和默认失败处理等）
 *          （如不服此配置，可重载）
 * @author:  sushuang(sushuang)
 * @depend:  xutil.ajax, di.config.lang
 */

$namespace('di.config');

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var XAJAX = xutil.ajax;
    var isFunction = xutil.lang.isFunction;
    var LANG;
    var DIALOG;
    
    $link(function () {
        LANG = di.config.Lang;
        DIALOG = di.helper.Dialog;
    });

    //--------------------------------
    // 类型声明
    //--------------------------------

    var AJAX = $namespace().AJAX = function() {};

    /**
     * 默认选项
     */
    var DEFAULT_OPTIONS = {
        showWaiting: true // 默认在ajax请求时显示waiting
    };

    /**
     * 默认的ajax失败处理
     * 
     * @public
     * @param {number} status ajax返回状态
     * @param {Object|string} ejsonObj e-json整体返回的数据
     * @param {Function} defaultCase 可用此函数替换默认情况的处理函数
     */
    AJAX.handleDefaultFailure = function(status, ejsonObj, defaultCase) {
        switch (status) {
            case 100: // 未登陆
            case 201: 
            case 301: // 重定向的情况
            case 302: // 重定向的情况
            case 99999: // 其实302时返回的是这个 ...
                DIALOG.alert(LANG.SAD_FACE + LANG.RE_LOGIN, null, true);
                break;
            case 333: //没有权限
                DIALOG.alert(LANG.SAD_FACE + LANG.NO_AUTH_SYSTEM);
                break;
            case 1: // 返回html错误页面的情况
            case 403: // 403错误
            case 404: // 404错误
            case 405: // 405错误
            case 500: // 500错误
                DIALOG.alert(LANG.SAD_FACE + LANG.ERROR);
                break;
            default:
                if (isFunction(defaultCase)) {
                    defaultCase(status, ejsonObj);
                } 
                else {
                    DIALOG.alert(LANG.SAD_FACE + LANG.ERROR);
                }
        }
    }

    /**
     * 刷新整站
     *
     * @protected
     */
    // AJAX.reload = function() {
    //     try {
    //         window.top.location.reload();
    //     } 
    //     catch (e) {
    //         window.location.reload();
    //     }
    // }

    /**
     * 默认的timeout处理
     *
     * @public
     */
    AJAX.handleDefaultTimeout = function() {
        DIALOG.hidePrompt();
    }
    
    /**
     * 默认的请求参数
     *
     * @public
     * @return {string} 参数字符串，如a=5&a=2&b=xxx
     */
    AJAX.getDefaultParam = function() {
        var date = new Date(), paramArr = [];
        paramArr.push('_cltime=' + date.getTime()); // 供后台log当前时间
        paramArr.push('_cltimezone=' + date.getTimezoneOffset()); // 供后台log当前时区
        return paramArr.join('&');
    }
    
    /**
     * 用于显示全局的等待提示，当第一个需要显示等待的请求发生时会调用
     *
     * @public
     */
    AJAX.showWaiting = function() {
        DIALOG.waitingPrompt(LANG.AJAX_WAITING);
    }
    
    /**
     * 用于隐藏全局的等待提示，当最后一个需要显示等待的请求结束时会调用
     *
     * @public
     */
    AJAX.hideWaiting = function() {
        DIALOG.hidePrompt();
    }
        
    /**
     * 挂载配置
     */
    XAJAX.DEFAULT_FAILURE_HANDLER = AJAX.handleDefaultFailure;
    XAJAX.DEFAULT_ONTIMEOUT = AJAX.handleDefaultTimeout;
    XAJAX.DEFAULT_PARAM =AJAX.getDefaultParam;
    XAJAX.SHOW_WAITING_HANDLER = AJAX.showWaiting;
    XAJAX.HIDE_WAITING_HANDLER = AJAX.hideWaiting;
    XAJAX.DEFAULT_OPTIONS = DEFAULT_OPTIONS;    

})();
/**
 * di.config.Dict
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    data insight 全局(包括console和product)的ajax的配置
 * @author:  xxx(xxx)
 */

$namespace('di.config');

(function() {
    
    var DICT = $namespace().Dict = {};

    /**
     * 默认的遮罩透明度
     */
    DICT.DEFAULT_MASK_OPACITY = 0.5;

    /**
     * 自动化测试用的id属性
     */
    DICT.TEST_ATTR = 'data-o_o-di-test';

    /**
     * 指标维度元数据视图状态
     */
    DICT.META_STATUS = {
        DISABLED: 0,
        NORMAL: 1,
        SELECTED: 2
    };

    /**
     * 默认的clzKey
     */
    DICT.DEFAULT_CLZ_KEY = {
        SNIPPET: 'GENERAL_SNIPPET',
        VCONTAINER: 'GENERAL_VCONTAINER',
        VPART: 'GENERAL_VPART'
    };

    /**
     * 类
     * 说明：
     * (1) 如果定义了adapterMethod，则从di.shared.adapter.GeneralAdapterMethod中获取方法拷贝到目标实例中
     * (2) 如果定义了adapterPath，则将该adapter中方法全拷贝至目标实例中。能够覆盖adapterMethod定义。
     */
    DICT.CLZ_DEFS = [

        //-------------------------------
        // GENERAL
        //-------------------------------

        {
            clzKey: 'GENERAL_SNIPPET',
            clzPath: 'di.shared.ui.GeneralSnippet',
            clzType: 'SNIPPET'
        },
        {
            clzKey: 'GENERAL_VCONTAINER',
            clzPath: 'di.shared.ui.GeneralVContainer',
            clzType: 'VCONTAINER'
        },
        {
            clzKey: 'GENERAL_VPART',
            clzPath: 'di.shared.ui.GeneralVPart',
            clzType: 'VPART'
        },

        //-------------------------------
        // COMPONENT
        //-------------------------------

        {
            clzKey: 'GENERAL_COMPONENT',
            clzPath: 'di.shared.ui.InteractEntity',
            clzType: 'COMPONENT'
        },
        { 
            clzKey: 'DI_TABLE',
            clzPath: 'di.shared.ui.DITable',
            clzType: 'COMPONENT'
        },
        { 
            clzKey: 'DI_CHART',
            clzPath: 'di.shared.ui.DIChart', 
            clzType: 'COMPONENT'
        },
        {
            clzKey: 'DI_FORM',
            clzPath: 'di.shared.ui.DIForm',
            clzType: 'COMPONENT'
        },
        {
            clzKey: 'OLAP_META_CONFIG',
            clzPath: 'di.shared.ui.OlapMetaConfig',
            clzType: 'COMPONENT'
        },

        //-------------------------------
        // VCONTAINER
        //-------------------------------

        {
            clzKey: 'DI_TAB',
            clzPath: 'di.shared.ui.DITab',
            clzType: 'VCONTAINER'
        },
        {
            clzKey: 'FOLD_PANEL',
            clzPath: 'di.shared.ui.FoldPanel',
            clzType: 'VCONTAINER'
        },

        //-------------------------------
        // VUI
        //-------------------------------

        {
            clzKey: 'HIDDEN_INPUT',
            clzPath: 'di.shared.vui.HiddenInput',
            adapterMethod: { create: 'xuiCreate', dispose: 'xuiDispose' },
            clzType: 'VUI'
        },
        {
            clzKey: 'H_CHART',
            clzPath: 'xui.ui.HChart',
            adapterMethod: { create: 'xuiCreate', dispose: 'xuiDispose' },
            adapterPath: 'di.shared.adapter.HChartVUIAdapter',
            clzType: 'VUI'
        },
        {
            clzKey: 'OLAP_META_DRAGGER',
            clzPath: 'di.shared.vui.OlapMetaDragger',
            clzType: 'VUI',
            adapterPath: 'di.shared.adapter.MetaConfigVUIAdapter'
        },
        {
            clzKey: 'TEXT_LABEL',
            clzPath: 'di.shared.vui.TextLabel',
            clzType: 'VUI',
            adapterMethod: { create: 'xuiCreate', dispose: 'xuiDispose' }
        },
        {
            clzKey: 'OLAP_META_IND_SELECT',
            clzPath: 'ecui.ui.Select',
            clzType: 'VUI',
            adapterMethod: { dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.MetaConfigVUIAdapter',
            dataOpt: {
                optionSize: 15
            }
        },
        {
            clzKey: 'DAY_POP_CALENDAR',
            clzPath: 'ecui.ui.IstCalendar',
            clzType: 'VUI',
            adapterMethod: { dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.IstCalendarVUIAdapter',
            dataOpt: {
                mode: 'DAY',
                viewMode: 'POP'
            }
        },
        {
            clzKey: 'RANGE_POP_CALENDAR',
            clzPath: 'ecui.ui.IstCalendar',
            clzType: 'VUI',
            adapterMethod: { dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.IstCalendarVUIAdapter',
            dataOpt: {
                mode: 'RANGE',
                viewMode: 'POP'
            }
        },
        {
            clzKey: 'CALENDAR_PLUS',
            clzPath: 'ecui.ui.CalendarPlus',
            clzType: 'VUI',
            adapterMethod: { dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.CalendarPlusVUIAdapter'
        },
        {
            clzKey: 'X_CALENDAR',
            clzPath: 'ecui.ui.XCalendar',
            clzType: 'VUI',
            adapterMethod: { dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.XCalendarVUIAdapter'
        },
        {
            clzKey: 'OLAP_TABLE',
            clzPath: 'ecui.ui.OlapTable',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' },
            dataOpt: { defaultCCellAlign: 'right' }
        },
        {
            clzKey: 'BEAKER_CHART',
            clzPath: 'ecui.ui.BeakerChart',
            clzType: 'VUI',
            adapterPath: 'di.shared.adapter.BeakerChartVUIAdapter'
        },
        {
            clzKey: 'BREADCRUMB',
            clzPath: 'ecui.ui.Breadcrumb',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' }
        },
        {
            clzKey: 'BUTTON',
            clzPath: 'ecui.ui.Button',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' }
        },
        {
            clzKey: 'H_BUTTON',
            clzPath: 'ecui.ui.HButton',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' }
        },
        {
            clzKey: 'OFFLINE_DOWNLOAD',
            clzPath: 'di.shared.vui.OfflineDownload',
            clzType: 'VUI',
            adapterMethod: { create: 'xuiCreate', dispose: 'xuiDispose' },
            dataOpt: {
                headText: '请输入邮箱（多个邮箱使用逗号分隔）：',
                confirmText: '确定',
                cancelText: '取消',
                text: '离线下载1'
            }
        },
        {
            clzKey: 'SWITCH_BUTTON',
            clzPath: 'ecui.ui.SwitchButton',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' }
        },
        {
            clzKey: 'ECUI_SELECT',
            clzPath: 'ecui.ui.Select',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.EcuiSelectVUIAdapter',
            dataOpt: {
                optionSize: 15
            }
        },
        {
            clzKey: 'ECUI_INPUT_TREE',
            clzPath: 'ecui.ui.InputTree',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.EcuiInputTreeVUIAdapter'
        },
        {
            clzKey: 'ECUI_SUGGEST',
            clzPath: 'ecui.ui.Suggest',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' },
            adapterPath: 'di.shared.adapter.EcuiSuggestVUIAdapter'
        },
        {
            clzKey: 'ECUI_INPUT',
            clzPath: 'ecui.ui.Input',
            clzType: 'VUI',
            adapterMethod: { create: 'ecuiCreate', dispose: 'ecuiDispose' }
        }
    ];

    /**
     * 类引用
     */
    DICT.CLZ = {};
    for (var i = 0, clzDef; clzDef = DICT.CLZ_DEFS[i]; i ++) {
        if (clzDef.clzKey in DICT.CLZ) {
            throw new Error('dupicate clzKey: ' + clzDef.clzKey);
        }
        DICT.CLZ[clzDef.clzKey] = clzDef;
    }


})();
/**
 * di.config.Lang
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    data insight 全局(包括console和product)的话术定义
 * @author:  xxx(xxx)
 */

$namespace('di.config');

(function() {
    
    //--------------------------------
    // 类型声明
    //--------------------------------

    var LANG = $namespace().Lang = {};

    /**
     * ajax请求失败
     */
    LANG.AJAX_FAILURE = function (status) {
        return status + ' SERVER ERROR';
    };

    LANG.AJAX_TIMEOUT = '请求超时，请稍后重试';
    LANG.AJAX_WAITING = '加载中...';
    
    LANG.SMILE_FACE = '&nbsp;<div class="global-smile-face"></div>&nbsp;&nbsp;&nbsp;';
    LANG.SAD_FACE = '&nbsp;<div class="global-sad-face"></div>&nbsp;&nbsp;&nbsp;';
    
    LANG.NO_DATA = '缺失数据';
    LANG.NO_AUTH = '抱歉，您没有查看当前页面的权限';
    LANG.NO_AUTH_OPERATION = '抱歉，您没有权限进行此操作';
    LANG.NO_AUTH_SYSTEM = '抱歉，您没有系统权限';
    LANG.ERROR = '系统异常';
    LANG.DATA_ERROR = '数据异常';
    LANG.RE_LOGIN = '请重新登陆';
    LANG.EMPTY_TEXT = '未查询到相关信息';
    LANG.SAVE_FAIL = '抱歉，保存失败，请重试';
    LANG.PARAM_ERROR = '抱歉，参数校验失败';
    LANG.FATAL_DATA_ERROR = '抱歉，服务器异常，操作无法继续';
    
    LANG.INPUT_MANDATORY = '必填';
    LANG.INVALID_FORMAT = '格式错误';
    LANG.NUMBER_OVERFLOW = '数据过大';
    LANG.NUMBER_UNDERFLOW = '数据过小';
    LANG.TEXT_OVERFLOW = '输入文字过多';
    LANG.DOWNLOAD_FAIL = '下载失败';
    LANG.OFFLINE_DOWNLOAD_FAIL = '离线下载请求失败';
    LANG.DELETE_SUCCESS = '删除成功';

    LANG.GET_DIM_TREE_ERROR = '抱歉，维度数据获取失败，请重试';

    LANG.CONFIRM_ADD_SHARE = '您真的要添加分享吗？';
    LANG.CONFIRM_REMOVE_SHARE = '您真的要取消分享吗？';
    LANG.CONFIRM_DELETE = '您真的要删除吗？';

    LANG.DIM_MANDATORY = '请确认每种维度都有勾选，再点击查询';

    LANG.DESC_OVERFLOW = '解释说明文字过多';
    LANG.DESC_MANDATORY = '解释说明必填';
    LANG.PLAN_OVERFLOW = '跟进计划文字过多';
    LANG.PLAN_MANDATORY = '跟进计划必填';
    LANG.REASON_ADD_ERROR = '原因添加失败，请重试';

    LANG.DRILL_DIM_DATA_ERROR = '[维度数据校验失败]';

    LANG.WAITING_HTML = '<span class="waiting-icon"></span>&nbsp;<span class="waiting-text">加载中...</span>';
        
})();
/**
 * di.config.URL
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    data insight 全局(包括console和product)的URL定义
 * @author:  sushuang(sushuang)
 */
$namespace('di.config');

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var xextend = xui.XDatasource.extend;
    
    //--------------------------------
    // 类型声明
    //--------------------------------

    /**
     * 因为URL要作为权限验证，所以在使用时再加WEB_ROOT
     * web根目录, 页面初始时从后台传来，暂存在_TMP_WEB_ROOT_中
     *
     * @usage 
     *      假设有定义：kt.config.URL.SOME_TABLE_QUERY = '/some/table.action';
     *      用这样语句获得请求url： kt.config.URL('SOME_TABLE_QUERY'); 
     * @param {string} urlAttr url常量名
     * @return {string} 请求使用的url
     */
    var URL = $namespace().URL = function(urlConst) {
        var url = URL_SET[urlConst];
        if (!url) {
            throw new Error('empty url!');
        }
        return URL.getWebBase() + url;
    };

    var URL_SET = {};

    /**
     * 得到运行时的web base
     * （这需要页面中将_TMP_WEB_ROOT_赋值）
     * 
     * @public
     * @return {string} 运行时的web base
     */
    URL.getWebBase = function() {
        return $getNamespaceBase().WEB_ROOT || '';
    };

    /**
     * 增加URL
     * 
     * @public
     * @param {string} 新增的URL
     */
    URL.addURL = function(name, url) {
        // 检查重复
        if (URL_SET[name]) {
            throw new Error('Duplicate URL! name=' + name + ' url=' + url);
        }

        // 新增
        URL_SET[name] = url;
    }

    //--------------------------------
    // 公用URL
    //--------------------------------  

    // 打开报表编辑
    URL_SET.OLAP_REPORT_INIT = '/reportTemplate/create.action';

    // 得到cube tree
    URL_SET.CUBE_META = '/meta/getCubeTree.action';

    // 获取维度树
    URL_SET.DIM_TREE_TABLE = '/reportTemplate/table/getDimTree.action';
    URL_SET.DIM_TREE_CHART = '/reportTemplate/chart/getDimTree.action';
    URL_SET.DIM_SELECT_SAVE_TABLE = '/reportTemplate/table/updateDimNodes.action';
    URL_SET.DIM_SELECT_SAVE_CHART = '/reportTemplate/chart/updateDimNodes.action';

    // 指标维度元数据
    URL_SET.META_CONDITION_IND_DIM_TABLE = '/reportTemplate/table/getMetaData.action';
    URL_SET.META_CONDITION_IND_DIM_CHART = '/reportTemplate/chart/getMetaData.action';
    URL_SET.META_CONDITION_SELECT_TABLE = '/reportTemplate/table/dragAndDrop.action';
    URL_SET.META_CONDITION_SELECT_CHART = '/reportTemplate/chart/dragAndDrop.action';
    URL_SET.META_CONDITION_LIST_SELECT_CHART = '/reportTemplate/chart/selectInd.action'; // 这是个为list形式的元数据提交而写的临时接口

    // 表单
    URL_SET.FORM_DATA = '/reportTemplate/initParams.action';
    URL_SET.FORM_ASYNC_DATA = '/reportTemplate/interactParam.action';

    // 表格
    URL_SET.OLAP_TABLE_DATA = '/reportTemplate/table/transform.action';
    URL_SET.OLAP_TABLE_DRILL = '/reportTemplate/table/drill.action';
    URL_SET.OLAP_TABLE_LINK_DRILL = '/reportTemplate/table/drillByLink.action';
    URL_SET.OLAP_TABLE_SORT = '/reportTemplate/table/sort.action';
    URL_SET.OLAP_TABLE_CHECK = '/reportTemplate/table/checkRow.action';
    URL_SET.OLAP_TABLE_SELECT = '/reportTemplate/table/selectRow.action';
    URL_SET.OLAP_TABLE_DOWNLOAD = '/reportTemplate/table/download.action';
    URL_SET.OLAP_TABLE_OFFLINE_DOWNLOAD = '/reportTemplate/table/downloadOffLine.action';
    URL_SET.OLAP_TABLE_LINK_BRIDGE = '/reportTemplate/table/linkBridge.action';

    // 图
    URL_SET.OLAP_CHART_DATA = '/reportTemplate/chart/transform.action';
    URL_SET.OLAP_CHART_X_DATA = '/reportTemplate/chart/reDraw.action';
    URL_SET.OLAP_CHART_S_DATA = '/reportTemplate/chart/reDrawSeries.action'; // 传入维度参数
    URL_SET.OLAP_CHART_S_ADD_DATA = '/reportTemplate/chart/addChartSeries.action'; // 传入维度参数，增加趋势线
    URL_SET.OLAP_CHART_S_REMOVE_DATA = '/reportTemplate/chart/removeChartSeries.action'; // 传入维度参数，删除趋势线
    URL_SET.OLAP_CHART_BASE_CONFIG_INIT = '/reportTemplate/chart/config.action';
    URL_SET.OLAP_CHART_BASE_CONFIG_SUBMIT = '/reportTemplate/chart/config.action';
    URL_SET.OLAP_CHART_DOWNLOAD = '/reportTemplate/chart/download.action';
    URL_SET.OLAP_CHART_OFFLINE_DOWNLOAD = '/reportTemplate/chart/downloadOffLine.action';
    // addSeriesUnit
    // removeSeriesUnit
    // setSeriesUnitType

    // 报表预览
    // URL_SET.REPORT_PREVIEW = '/layout-tpl/biz-pool.html';
    // URL_SET.REPORT_PREVIEW = '/layout-tpl/pgr.html';
    URL_SET.REPORT_PREVIEW = '/layout-tpl/ka-income.html';
    // URL_SET.REPORT_PREVIEW = '/layout-tpl/ka-income2.html';
    // URL_SET.REPORT_PREVIEW = '/reportTemplate/complex/generateReport.action';

})();
/**
 * di.helper.Dialog
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    全局的提示信息 
 *           (代码拷贝自 rigel.layer。但是tip是“小窍门”的意思，而不是“提示”的意思，所以改成prompt)
 * @author:  sushuang(sushuang)
 * @depends: ecui
 */

$namespace('di.helper');

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var ui = ecui;
    var encodeHTML = xutil.string.encodeHTML;
    var LANG;
    var UTIL;
    var DICT;
    var DI_FACTORY;

    $link(function() {
        LANG = di.config.Lang;
        DICT = di.config.Dict;
        UTIL = di.helper.Util;
        DI_FACTORY = di.shared.model.DIFactory;
    });

    //--------------------------------
    // 类型声明
    //--------------------------------

    var DIALOG = $namespace().Dialog = {};
    
    var ePrompt = null;
    var bPromptMask = false;
    var promptTimer = null;

    DIALOG.prompt = function () {
        prompt.apply(this, arguments);
    };
    DIALOG.waitingPrompt = function () {
        waitingPrompt.apply(this, arguments);
    };
    DIALOG.hidePrompt = function () {
        hidePrompt.apply(this, arguments);
    };

    /**
     * 设置prompt定义
     *
     * @public
     * @param {Object} def 定义
     * @param {string} def.anchor 值可为：
     *      'I'：internal，在报表引擎内部定位，如果是iframe加载报表引擎，这样则定位不理想），默认
     *      'E'：external，在报表引擎外定位（报表引擎所在的iframe的window上）
     * @param {string} diAgent 是否为stub
     */
    DIALOG.setPromptDef = function(def, diAgent) {
        if (diAgent == 'STUB' && def && def.anchor == 'E') {
            // 临时写法，后续规整
            // FIXME
            prompt = getRemoteDelegation('prompt');
            hidePrompt = getRemoteDelegation('hideprompt');
            waitingPrompt = getRemoteDelegation('waitingprompt');
        }
    };

    /**
     * 设置prompt定义
     *
     * @public
     */
    function getRemoteDelegation(eventName) {
        return function() {
            var eventChannel = DI_FACTORY().getEventChannel();
            if (eventChannel) {
                eventChannel.triggerEvent(eventName, arguments);
            }
        };
    };

    /**
     * 信息提示，支持自动消失
     *
     * @public
     * @param {string} text 信息
     * @param {boolean} mask 是否使用遮罩
     * @param {number} timeout 消失时间
     */
    function prompt(text, mask, timeout) {
        var win;
        try {
            // win = window.top;
            win = window;
            // TODO
            // 在iframe中，根据定位到top中间，或者dom加到top上。
        } 
        catch (e) {
        }
        
        var x = UTIL.getScrollLeft(win) + UTIL.getViewWidth(win) / 2;
        var y = 5;

        if(!ePrompt) {
            ePrompt = document.createElement('div');
            ePrompt.style.cssText = 'display:none;position:fixed;*position:absolute';
            ePrompt.className = 'global-prompt';
            document.body.appendChild(ePrompt);
        }

        clearPromptTimer();

        if(ePrompt.style.display == '') {
            return false;
        }

        ePrompt.innerHTML = text;
        ePrompt.style.display = '';
        ePrompt.style.left = x - ePrompt.offsetWidth / 2 + 'px';
        ePrompt.style.top = y + 'px';
        if(mask) {
            ui.mask(0);
            bPromptMask = true;
        }

        if (timeout) {
            promptTimer = setTimeout(
                function () {
                    DIALOG.hidePrompt();
                }, 
                timeout
            );
        }
        return true;        
    };

    /**
     * 等待提示
     *
     * @public
     * @param {string} text 信息
     * @param {boolean} mask 是否使用遮罩
     * @param {number} timeout 消失时间
     */
    function waitingPrompt(text) {
        if (text == null) {
            text = LANG.AJAX_WAITING;
        }
        text = [
            '<div class="global-prompt-waiting"></div>',
            '<div class="global-prompt-waiting-text">', text, '</div>'
        ].join('');
        DIALOG.prompt(text);
    }
    
    /**
     * 隐藏信息提示
     *
     * @public
     * @param {string} messag 信息
     * @param {boolean} 是否使用遮罩
     * @param {number} timeout 消失时间
     */
    function hidePrompt() {
        clearPromptTimer();
        ePrompt.style.display = 'none';
        if(bPromptMask) {
            bPromptMask = false;
            ui.mask();
        }
    };
        
    function clearPromptTimer() {
        if (promptTimer) {
            clearTimeout(promptTimer);
            promptTimer = null;
        }
    }

    /**
     * 显示提示窗口
     *
     * @public
     * @param {string} text 提示信息
     * @param {string} title 标题
     * @param {Array.<Object>} buttons 按钮，其中每一项结构为
     *      {string} text 按钮文字
     *      {string} className cssClassName
     *      {Function} action 按下按钮的回调
     * @param {number=} mask 使用mask的透明值，如果不传此参数则不使用
     */
    DIALOG.showDialog = function(text, title, buttons, mask) {
        ui.$messagebox(text, title, buttons, mask);
    };

    /**
     * 只含确定键的提示窗口
     *
     * @public
     * @param {String} text 提示信息
     * @param {Function} onconfirm 确定按钮的处理函数
     * @param {boolean} noBtn 是否不显示btn（不显示则禁止了一切页面的继续操作）
     */
    DIALOG.alert = function(text, onconfirm, noBtn) {
        DIALOG.showDialog(
            text, 
            '提示', 
            noBtn
                ? []
                : [
                    { 
                        text: '确定', 
                        className: 'ui-button-g', 
                        action: onconfirm 
                    }
                ], 
            DICT.DEFAULT_MASK_OPACITY
        );
    };

    /**
     * 含确定和取消键的窗口
     *
     * @public
     * @param {String} text 提示信息
     * @param {Function} ok 确定按钮的处理函数
     * @param {Function} cancel 取消按钮的处理函数
     */
    DIALOG.confirm = function(text, onconfirm, oncancel) {
        DIALOG.showDialog(
            text, 
            '确认', 
            [
                { 
                    text: '确定', 
                    className: 'ui-button-g', 
                    action: onconfirm 
                },
                { 
                    text: '取消', 
                    action: oncancel 
                }
            ], 
            DICT.DEFAULT_MASK_OPACITY
        );
    };
    
    /**
     * 自定义键的窗口
     *
     * @public
     * @param {string} title 标题
     * @param {string} message 提示信息
     * @param {Array.<Object>} buttons 按钮，每项为：
     *          {string} text 按钮文字
     *          {string} className 样式文字
     *          {Function} action 点击的回调函数
     */
    DIALOG.dialog = function(title, message, buttons) {
        var html;
        buttons = buttons || [];
        
        html.push(
            '<div class="ui-messagebox-icon"></div>', 
            '<div class="ui-messagebox-content">',
                '<div class="ui-messagebox-text">', 
                    encodeHTML(message), 
                '</div>',
            '</div>'
        );

        DIALOG.showDialog(
            html.join(''), 
            title, 
            buttons, 
            DICT.DEFAULT_MASK_OPACITY
        );     
    };

    /**
     * 错误alert
     *
     * @public
     */
    DIALOG.errorAlert = function() {
        DIALOG.alert(LANG.ERROR);
    };

})();
/**
 * di.helper.Formatter
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    格式化集合
 * @author:  sushuang(sushuang)
 * @depend:  xutil
 */

$namespace('di.helper');
 
(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var xlang = xutil.lang;
    var isFunction = xlang.isFunction;
    var isArray = xlang.isArray;
    var isString = xlang.isString;
    var hasValue = xlang.hasValue;
    var hasValueNotBlank = xlang.hasValueNotBlank;
    var encodeHTML = xutil.string.encodeHTML;
    var textLength = xutil.string.textLength;
    var textSubstr = xutil.string.textSubstr;
    var formatNumber = xutil.number.formatNumber;
    var arraySlice = Array.prototype.slice;
    var DICT;

    $link(function() {
        DICT = di.config.Dict;
    });
    
    /**
     * 约定，所有formatter第一个参数是data
     * 取得formatter使用这种方式：
     * kt.helper.Formatter('SOME_FORMATTER')
     * kt.helper.Formatter('SOME_FORMATTER', true, 'asdf', ...)
     * （从第二参数起是绑定给formatter的参数）
     * formatter的this指针，即每项的对象。
     *
     * @param {string} formatterName 格式化名
     * @param {Any...} 调用formatter时的从第二个开始的参数
     * @return {Function} formatter
     */
    var FORMATTER = $namespace().Formatter = function(formatterName) {
        var args = arraySlice.call(arguments, 1);
        return function(data) {
            var argsInput = arraySlice.call(arguments, 1);
            return FORMATTER[formatterName].apply(
                this, 
                [data].concat(args, argsInput)
            );
        }
    };

    /**
     * 统一的比率格式
     */
    FORMATTER.DEFAULT_RATE_FORMAT = 'I,III.DD%';

    /**
     * 得到用于ecui表格的formatter
     * 取得formatter使用这种方式：
     * tableFormatter('SOME_FORMATTER')
     * tableFormatter('SOME_FORMATTER', true, 'asdf', ...)
     * （从第二参数起是绑定给formatter的参数）
     * 
     * @param {(string|Object)} field 数据源项的要格式化的属性名
     *              如果为Obejct，则各域为
     *              {string} data 数据属性名
     *              {string} link 链接属性名
     * @param {string} formatterName 格式化名
     * @param {Any...} 调用formatter时的从第二个开始的参数
     * @return {Function} formatter
     */
    FORMATTER.tableFormatter = function(field, formatterName) {
        var args = arraySlice.call(arguments, 2);
        var dataField; 
        var linkField;

        if (isString(field)) {
            dataField = field;
        } 
        else {
            dataField = field.data;
            linkField = field.link;
        }   

        return function(item) {
            var text = FORMATTER[formatterName].apply(
                item, 
                [item[dataField]].concat(args)
            );
            return prepareLink(item, text, linkField);
        };
    }

    /**
     * 表格中普通文本格式化，默认encodeHTML
     * 
     * @public
     * @param {Any} data 值
     * @param {string} needEncodeHTML 默认为true
     * @return {string} 显示值
     */
    FORMATTER.SIMPLE_TEXT = function(data, needEncodeHTML) {    
        needEncodeHTML = hasValue(needEncodeHTML) ? needEncodeHTML : true;
        data = hasValueNotBlank(data) ? data : '-';
        data = needEncodeHTML ? encodeHTML(data) : data;
        return data;
    }
    
    /**
     * 截断字符，用HTML的title属性显示全部字符
     * 
     * @public
     * @param {Any} data 值
     * @param {number} length 显示字节长度
     * @param {string} needEncodeHTML 默认为true
     * @param {string} color 当截断时，显示颜色，缺省则原色
     * @param {string} classNames 补充的classNames
     * @return {string} 显示值
     */
    FORMATTER.CUT_TEXT = function(
        data, length, needEncodeHTML, color, classNames
    ) {
        var shortText = '', isCut, colorStyle = '',
        needEncodeHTML = hasValue(needEncodeHTML) ? needEncodeHTML : true;
        data = hasValueNotBlank(data) ? data : '-';

        if (textLength(data) > length) {
            shortText = textSubstr(data, 0, length - 2) + '..';
            isCut = true;
        } 
        else {
            shortText = data;
            isCut = false;
        }

        shortText = needEncodeHTML ? encodeHTML(shortText) : shortText;
        if (isCut && hasValue(color)) {
            colorStyle = 'color:' + color + '';
        }
        data = needEncodeHTML ? encodeHTML(data) : data;
        return '<span class="' + classNames + '" style="' + colorStyle + '" title="' + data + '" >' + shortText + '&nbsp;</span>'; 
    }

    /**
     * 表格中比率的格式化
     * 
     * @public
     * @param {Any} data 值
     * @param {string} format 数据格式，缺省则为'I,III.DD%'
     * @return {string} 显示值
     */
    FORMATTER.SIMPLE_RATE = function(data, format) {
        var text, flagClass;
        if (!hasValueNotBlank(data)) {
            return '-';
        }
        format = format || FORMATTER.DEFAULT_RATE_FORMAT;
        text = formatNumber(data, format);
        return text;
    }

    /**
     * 表格中普通数据格式化
     * 
     * @public
     * @param {Any} data 值
     * @param {string} format 数据格式，缺省不格式化
     * @return {string} 显示值
     */
    FORMATTER.SIMPLE_NUMBER = function(data, format) {
        data = hasValueNotBlank(data) 
            ? (!format ? data : formatNumber(data, format)) 
            : '-';
        return data;
    }

    /**
     * 表格中带颜色的数据格式化（默认正数红，负数绿）
     * 
     * @public
     * @param {Any} data 值
     * @param {string} format 数据格式，缺省不格式化
     * @param {string} positiveColor 非负数的颜色，默认'red'
     * @param {string} nagetiveColor 负数的颜色，默认'green'
     * @return {string} 显示值
     */
    FORMATTER.COLORED_NUMBER = function(
        data, format, positiveColor, nagetiveColor
    ) {    
        var style, text = '-';
        positiveColor = positiveColor || 'red';
        nagetiveColor = nagetiveColor || 'green';
        if (hasValueNotBlank(data)) {
            style = 'style="color:' + (data < 0 ? nagetiveColor : positiveColor) + '" ';
            text = '<span ' + style + '>' + (!format ? data : formatNumber(data, format)) + '</span>';
        }
        return text;
    }


    /**
     * @private
     */
    function prepareLink (item, text, linkField, dontTargetBlank) {
        var href;
        if (hasValueNotBlank(linkField)) {
            href = item[linkField];
        }
        if (!hasValueNotBlank(href) || !hasValueNotBlank(text)) { 
            return text;
        }
        var targetBlank = dontTargetBlank ? '' : ' target="_blank" ';
        return '<a ' + targetBlank + ' href="' + href + '">' + text + '</a>';
    }

})();
/**
 * di.helper.SnippetParser
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    提供html片段的解析
 * @author:  sushuang(sushuang)
 * @depend:  xutil
 */

$namespace('di.helper');
 
(function () {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var setByPath = xutil.object.setByPath;
    var getByPath = xutil.object.getByPath;
    var getParent = xutil.dom.getParent;
    var merge = xutil.object.merge;
    var DICT;
    var DIALOG;

    $link(function () {
        DICT = di.config.Dict;
        DIALOG = di.helper.Dialog;
    });

    /**
     * html片段解析器
     *
     * @usage
     *      单例，
     *      这样得到实例：var unitFactory = di.helper.SnippetParser();
     */
    $namespace().SnippetParser = function () {
        return instance = instance || {
            parseProdSnippet: parseProdSnippet,
            setupEventChannel: setupEventChannel
        };
    };

    var instance;

    var DEFAULT_DOM_ATTR_NAME = 'data-o_o-di';
    var STUB_EVENT_CHANNEL_ANCHOR = 'BODY';
    var STUB_EVENT_CHANNEL_OUTWARD = 'data-d-outward-d-atad';
    var STUB_EVENT_CHANNEL_INWARD = 'data-d-inward-d-atad';
    var ID_DELIMITER = '.';

    function setupEventChannel(el, prodDef, diFactory) {
        var els = getAllEls(el);
        var domAttrName = prodDef.domAttrName || DEFAULT_DOM_ATTR_NAME;

        // 便利dom节点
        for (var i = 0, eo, attr; eo = els[i]; i ++) {
            // 事件通道
            attr = eo.getAttribute(domAttrName);
            if (attr == STUB_EVENT_CHANNEL_ANCHOR) {
                return createStubEventChannel(eo, diFactory);
            }
        }                
    }

    /**
     * 解析生产环境的snippet
     * 
     * @public
     * @param {HTMLElement} el html片段的根节点
     * @param {Object} depict 定义描述
     * @param {Object} prodDef 生成环境定义
     * @param {Object} diFactory 工厂
     */
    function parseProdSnippet(el, depict, prodDef, diFactory) {    
        prodDef = prodDef || {};
        var domAttrName = prodDef.domAttrName || DEFAULT_DOM_ATTR_NAME;

        var els = getAllEls(el);
        var def;
        var attr;
        var ins;
        var clz;
        var clzType;
        var clzKey;
        var i;
        var j;
        var eo;

        // 融合clzDef
        mergeClzDef(depict);

        // 初始化class
        diFactory.installClz();
        
        // 做entityDef集合
        var entityDefs = depict.entityDefs || [];
        var entityDefMap = {};
        for (i = 0; i < entityDefs.length; i ++) {
            def = entityDefs[i];
            entityDefMap[def.id] = def;
        }

        // 便利dom节点
        for (i = 0; eo = els[i]; i ++) {
            // 事件通道
            attr = eo.getAttribute(domAttrName);
            if (attr == STUB_EVENT_CHANNEL_ANCHOR) {
                // createStubEventChannel(eo, diFactory);
                continue;
            }

            // 处理实例声明的节点
            if (attr) {
                def = entityDefMap[attr];
                checkId(def.id);
                recordDef(def, eo, diFactory);
            }
        }

        // 根据id，为component寻找到逻辑隶属snippet，
        // 添加reportTemplateId的引用
        // 根据包含关系，为component寻找视图隶属snippet。
        diFactory.forEachEntity(
            ['COMPONENT'], 
            function (def, ins, id) {
                // 设置逻辑隶属snippet
                var idArr = def.id.split(ID_DELIMITER);
                var snptDef = diFactory.getEntity(idArr[0], 'DEF');
                if (!snptDef) {
                    throw new Error(def.id + ' 未定义隶属的snippet');
                }
                setByPath('belong.snippet', snptDef.id, def);

                // 向外循环，设置视图隶属snippet
                var el = def.el;
                var parentDef;
                var besnpt = getByPath('layout.parentSnippet', def);
                if (!besnpt) {
                    setByPath('layout.parentSnippet', besnpt = [], def);
                }
                while ((el = getParent(el)) && el != document) {
                    parentDef = diFactory.getEntity(
                        el.getAttribute(domAttrName), 
                        'DEF'
                    );

                    if (parentDef && parentDef.clzType == 'SNIPPET') {
                        besnpt.push(parentDef.id);
                    }
                }
            }
        );

        // 根据dom包含关系，为vpart添加其内部实体的引用
        // FIXME
        // 如果后面要vpart中能嵌套snippet，则不能如下简单处理，须考虑层级。
        diFactory.forEachEntity(
            ['VPART'],
            function(def, ins, id) {
                var subEls = getAllEls(def.el);
                var index = { COMPONENT: 0, VUI: 0 };
                var refName = { COMPONENT: 'componentRef', VUI: 'vuiRef' };

                for (var i = 0, eo, subDef, clzType; eo = subEls[i]; i ++) {
                    subDef = diFactory.getEntity(
                        eo.getAttribute(domAttrName), 
                        'DEF'
                    );

                    if (!subDef) { continue; }

                    refName[clzType = subDef.clzType] && setByPath(
                        refName[clzType] + '.inner[' + (index[clzType] ++) + ']',
                        subDef.id, 
                        def
                    );
                }
            }
        );

        // 记录根snippet
        diFactory.rootSnippet(depict.rootSnippet); 
    }

    /**
     * 融合clzDef
     *
     * @private
     */
    function mergeClzDef(depict) {
        var clzDefs = depict.clzDefs || [];
        var clzDefMap = {};
        for (var i = 0, clzDef; clzDef = clzDefs[i]; i ++) {
            clzDefMap[clzDef.clzKey] = clzDef;
        }
        merge(DICT.CLZ, clzDefMap);  
    }

    /**
     * 生成对外事件通道
     * 
     * @private
     */
    function createStubEventChannel(el, diFactory) {  

        // outward (报表发事件，di-stub收事件)
        var triggerEvent = function(eventName, args) {
            var handler = el[STUB_EVENT_CHANNEL_OUTWARD];
            if (handler) {
                try {
                    handler(eventName, args);
                }
                catch (e) {
                    // TODO
                }
            }
        };
        
        // inward (di-stub发事件，报表收事件)
        el[STUB_EVENT_CHANNEL_INWARD] = function(eventName, args) {
            var hList = listenerMap[eventName];
            if (hList) {
                for (var i = 0; i < hList.length; i ++) {
                    try {
                        hList[i] && hList[i].apply(null, args || []);
                    }
                    catch (e) {
                        // TODO
                    }
                }
            }
        };

        var listenerMap = {};

        var addEventListener = function(eventName, listener) {
            var hList = listenerMap[eventName];
            if (!hList) {
                hList = listenerMap[eventName] = [];
            }
            hList.push(listener);          
        }

        var eventChannel;
        diFactory.setEventChannel(
            eventChannel = {
                anchorEl: el,
                triggerEvent: triggerEvent,
                addEventListener: addEventListener
            }
        );

        return eventChannel;
    }

    /**
     * 生成instance
     * 
     * @private
     * @param {Object} def json声明
     * @param {HTMLElement=} el dom节点
     * @param {Object} diFactory 工厂
     */
    function recordDef(def, el, diFactory) {  
        // 仅记录留待后续创建
        def.el = el;
        diFactory.addEntity(def, 'DEF');
    }

    /**
     * 检查id，非法则抛出异常
     * 目前只允许使用 1-9a-zA-Z、中划线、下划线
     *
     * @private
     * @param {string} id
     */
    function checkId(id) {
        if (!/[1-9a-zA-Z\-_\.]/.test(id)) {
            throw new Error('id is illegal: ' + id);
        }
    }

    /**
     * 得到所有子el
     * 
     * @private
     * @param {HTMLElement} el 根el
     * @return {Array} 所有子el
     */
    function getAllEls(el) {
        return el.all || el.getElementsByTagName('*');
    }

})();
/**
 * di.helper.Util
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    业务辅助函数集
 * @author:  sushuang(sushuang)
 * @depend:  xutil, tangram.ajax, tangram.json
 */

$namespace('di.helper');
 
(function () {
    
    //----------------------------------------
    // 引用
    //----------------------------------------

    var xlang = xutil.lang;
    var isFunction = xlang.isFunction;
    var isArray = xlang.isArray;
    var isString = xlang.isString;
    var stringToDate = xutil.date.stringToDate;
    var hasValue = xlang.hasValue;
    var hasValueNotBlank = xlang.hasValueNotBlank;
    var encodeHTML = xutil.string.encodeHTML;
    var sortList = xutil.collection.sortList;
    var dateToString = xutil.date.dateToString;
    var getWorkday = xutil.date.getWorkday;
    var getWeekend = xutil.date.getWeekend;
    var getQuarter = xutil.date.getQuarter;
    var getQuarterBegin = xutil.date.getQuarterBegin;
    var g = xutil.dom.g;
    var isDate = xutil.lang.isDate;
    var $fastCreate = ecui.$fastCreate;
    var stringify = baidu.json.stringify;
    var getByPath = xutil.object.getByPath;
    var ECUI_CONTROL;
    var DIALOG;
    var LANG;
    var REGEXP = RegExp;

    $link(function () {
        ECUI_CONTROL = getByPath('ecui.ui.Control');
        DIALOG = di.helper.Dialog;
        LANG = di.config.Lang;
    });
        
    //----------------------------------------
    // 类型声明
    //----------------------------------------

    var UTIL = $namespace().Util = {};

    var DAY_MILLISEC = 1000 * 60 * 60 * 24; 
    
    //----------------------------------------
    // 方法
    //----------------------------------------

    /**
     * 就是通常用的assert
     * 
     * @public
     * @param {boolean} cond 条件真假
     * @param {string} msg 如果cond为false时的信息
     */
    UTIL.assert = function (cond, msg) {
        if (!cond) {
            throw new Error(msg || 'Assert fail!');
        }
    }

    /**
     * 在控件中初始化自己的主元素，如需使用则放在preprocess最前调用。
     * 用于这种情况：外部逻辑只构造了一个空元素（使控件定位），然后$fastCreate控件，控件自己管理自己的所有行为。
     * 
     * @public
     * @param {ecui.ui.Control} control 控件
     * @param {HTMLElement} el 控件的主元素
     * @param {Object} options 控件的初始化参数
     */
    UTIL.preInit = function (control, el, options) {
        options.primary = control.getType();
        el.className = control.getTypes().join(' ') + el.className;
    };
    
    /**
     * 初始化一个ecui控件
     * 用于这种情况：外部逻辑只构造了一个空元素（使控件定位）。
     * 
     * @public
     * @param {constructor} contorlClass ecui的类
     * @param {HTMLElement} el 控件的主元素
     * @param {ecui.ui.Control} parentControl 父控件
     * @param {Object} options 控件的初始化参数
     * @return {ecui.ui.Control} 创建好的控件
     */
    UTIL.ecuiCreate = function (controlClass, el, parentControl, options) {
        var type = controlClass.types[0];
        options = options || {};
        !options.primary && (options.primary = type);
        el.className = controlClass.TYPES + ' ' + el.className;
        return $fastCreate(controlClass, el, parentControl, options);
    };

    /**
     * 析构名为"_u***"的成员ecui控件
     * 
     * @public
     * @param {Object} container 
     */
    UTIL.disposeInnerControl = function (container) {
        for (var attr in container) {
            /_u\w+/.test(attr) 
                && container[attr]
                && UTIL.ecuiDispose(container[attr]);
        }
    };

    /**
     * 检查dimSel是否全勾选
     *
     * @public
     * @param {string} dimSelStr 
     * @return {boolean} 是否valid
     */
    UTIL.validDimSel = function (dimSelStr) {
        var i, o, oo, arr;
        if (!hasValueNotBlank(dimSelStr)) { return false; }

        arr = dimSelStr.split('|');
        for (i = 0; i < arr.length; i ++) {
            if (!hasValueNotBlank(o = arr[i])) {
                return false;
            }
            oo = o.split(':');
            if (!hasValueNotBlank(oo[0]) || !hasValueNotBlank(oo[1])) {
                return false;
            }
        }  
        return true;
    };

    /**
     * 将dimSel中未选择的项补为选择维度树根节点
     *
     * @public
     * @param {string} dimSelStr 维度选择字符串
     * @param {Object} dimDatasourceMap 维度散列O
     *                  key: dimId, 
     *                  value: { datasource: dimDatasource }
     * @return {string} 补全过的dimSelStr
     */
    UTIL.completeDimSel = function (dimSelStr, dimDatasourceMap) {
        if (!hasValueNotBlank(dimSelStr)) { return false; }

        var dimSelObj = UTIL.parseDimSel(dimSelStr);
        var rootNode;
        for (var dimId in dimSelObj) {
            rootNode = dimDatasourceMap[dimId].datasource.rootNode;
            if (rootNode 
                && (!dimSelObj[dimId] || dimSelObj[dimId].length == 0)
            ) {
                dimSelObj[dimId] = [rootNode.dimNodeId];
            }
        }
        return UTIL.stringifyDimSel(dimSelObj);
    };    

    /**
     * 把字符串格式的dimSel解析成对象
     *
     * @public
     * @param {string} dimSelStr 
     * @return {Object} dimSel对象
     *          格式：{<dimId>: [<dimNodeId>, <dimNodeId>, ...], ...}
     */
    UTIL.parseDimSel = function (dimSelStr) {
        var i, o, oo, ooo, arr, ret = {};
        if (!hasValueNotBlank(dimSelStr)) { return null; }
        arr = dimSelStr.split('|');
        for (i = 0; i < arr.length; i ++) {
            if (!hasValueNotBlank(o = arr[i])) { continue; }
            oo = o.split(':');
            if (!hasValueNotBlank(oo[0])) { continue; }
            ret[oo[0]] = hasValueNotBlank(oo[1]) ? oo[1].split(',') : [];
        }
        return ret;
    };

    /**
     * 把对象格式的dimSel解析成字符串格式
     *
     * @public
     * @param {Object} dimSelObj
     *          格式：{<dimId>: [<dimNodeId>, <dimNodeId>, ...], ...}
     * @return {string} dimSel字符串
     */
    UTIL.stringifyDimSel = function (dimSelObj) {
        var dimId, arr = [];
        if (!dimSelObj) {
            return '';
        }
        for (dimId in dimSelObj) {
            arr.push(dimId + ':' + (dimSelObj[dimId] || []).join(','));
        }
        return arr.join('|');
    };

    /**
     * 得到el的属性里的json
     * 出错时会抛出异常
     * 
     * @private
     * @param {HTMLElement} el dom节点
     * @param {string} attrName 属性名
     * @return {Object} 属性信息
     */
    UTIL.getDomAttrJSON = function (el, attrName) {
        var attr = el.getAttribute(attrName);
        if (attr) {
            return (new Function('return (' + attr + ');'))();
        }
    };

    /**
     * 判断dimSel是否相同
     *
     * @public
     * @param {string} dimSelStr1 要比较的dimSel1
     * @param {string} dimSelStr2 要比较的dimSel2
     * @param {Object} dimIdMap dimId集合，在其key指定的dimId上比较
     * @return {boolean} 比较结果 
     */
    UTIL.sameDimSel = function (dimSelStr1, dimSelStr2, dimIdMap) {
        var dimId, list1, list2, 
            dimSelObj1 = UTIL.parseDimSel(dimSelStr1), 
            dimSelObj2 = UTIL.parseDimSel(dimSelStr2);

        for (dimId in dimIdMap) {
            sortList((list1 = dimSelObj1[dimId]), null, '<', false);
            sortList((list2 = dimSelObj2[dimId]), null, '<', false);
            if (list1.join(',') !== list2.join(',')) {
                return false;
            }
        }
        return true;
    };

    /**
     * 判断某个dim的选择是否相同（都为空算相同）
     *
     * @public
     * @param {Array{string}} dimNodeIdArr1 要比较的dim1
     * @param {Array{string}} dimNodeIdArr2 要比较的dim2
     * @return {boolean} 比较结果 
     */
    UTIL.sameDimNodeIdArr = function (dimNodeIdArr1, dimNodeIdArr2) {
        dimNodeIdArr1 = dimNodeIdArr1 || [];
        dimNodeIdArr2 = dimNodeIdArr2 || [];

        if (dimNodeIdArr1.length != dimNodeIdArr2.length) {
            return false;
        }

        sortList(dimNodeIdArr1, null, '<', false);
        sortList(dimNodeIdArr2, null, '<', false);

        for (var i = 0; i < dimNodeIdArr1.length; i ++) {
            if (dimNodeIdArr1[i] != dimNodeIdArr2[i]) {
                return false;
            }
        }
        return true;
    };

    /**
     * 渲染空表格
     * 
     * @public
     * @param {ecui.ui.LiteTable} tableCon table控件
     * @param {string} text 解释文字，可缺省
     */
    UTIL.emptyTable = function (tableCon, text) {
        var oldText, html = '';

        if (hasValue(text)) {
            oldText = tableCon.getEmptyText();
            tableCon.setEmptyText(text);
        }

        tableCon.setData([]);

        if (hasValue(oldText)) {
            tableCon.setEmptyText(oldText);
        }
    };

    /**
     * 渲染表格的等待状态
     * 
     * @public
     * @param {ecui.ui.LiteTable} tableCon table控件
     */
    UTIL.waitingTable = function (tableCon) {
        UTIL.emptyTable(tableCon, LANG.WAITING_HTML);
    };    

    /**
     * 得到wrap格式的当前选择
     *
     * @public
     * @param {Object} wrap，格式为：
     *          {Array.<Object>} list
     *              {string} text
     *              {*} value
     *          {*} selected
     */
    UTIL.getWrapSelected = function (wrap) {
        for (var i = 0; o = wrap.list[i]; i ++) {
            if (o.value == wrap.selected) {
                return o;
            }
        }
    };

    /**
     * 打印异常
     *
     * @public
     * @param {Error} e 异常对象
     */
    UTIL.logError = function (e) {
        try {
            if (console && console.log) {
                console.log(e);
                (e.message != null) && console.log(e.message);
                (e.stack != null) && console.log(e.stack);
            }
        } 
        catch (e) {
        }
    };

    /**
     * 解析成DI约定的字符串时间格式
     *
     * @public
     * @param {Date|number} date 目标时间或者时间戳
     * @param {string} config.granularity 时间粒度，'D', 'W', 'M', 'Q', 'Y'
     * @param {Object} options 参数
     * @param {boolean} options.firstWeekDay 为true则周数据时格式化成周一，默认false
     */
    UTIL.formatTime = function (date, granularity, options) {
        if (!date) { return; }
        if (!isDate(date)) { date = new Date(date); }
        options = options || {};

        switch (granularity) {
            case 'D': 
                return dateToString(date, 'yyyy-MM-dd');
            case 'W':
                return options.firstWeekDay 
                    // 取周一
                    ? dateToString(getWorkday(date), 'yyyy-MM-dd')
                    // 保留原来日期
                    : dateToString(date, 'yyyy-MM-dd')
            case 'M':
                return dateToString(date, 'yyyy-MM');
            case 'Q':
                return date.getFullYear() + '-Q' + getQuarter(date);
            case 'Y':
                return String(date.getFullYear());
            default: 
                return '';
        }
    };

    /**
     * 由DI约定的字符串时间格式得到Date对象
     *
     * @public
     * @param {Date|string} date 目标时间
     */
    UTIL.parseTime = function (dateStr) {
        if (!dateStr) { return null; }
        if (isDate(dateStr)) { return dateStr; }

        if (dateStr.indexOf('-Q') >= 0) {
            var par = [0, 0, 3, 6, 9];
            dateStr = dateStr.split('-Q');
            return new Date(
                parseInt(dateStr[0], 10), 
                par[parseInt(dateStr[1], 10)], 
                1
            );
        }
        else {
            return stringToDate(dateStr);
        }
    };    

    /**
     * 解析标准化的时间定义。
     * 标准化的时间定义由timeUtil数组组成，或者是单纯的一个timeUnit。
     *（timeUtil定义由parseTimeUtitDef方法规定
     * 例如: 
     *      时间定义可以是一个timeUnit: [+1D, +5W]
     *      也可以是timeUnit组成的数组: [[+1D, +5W], [+5W, +10Q], ...]
     *
     * @param {(Array.<Array.<string>>|Array.<string>)} def 时间定义
     * @param {(Array.<string>|Array.<Date>)} ref 基准时间
     * @return {Array.<Object>} timeUnitList 结果时间单元数组，
     *      其中每个数组元素的格式见parseTimeUnitDef的返回。
     */
    UTIL.parseTimeDef = function (def, ref) {
        var dArr = [];
        var retArr = [];
        if (isArray(def) && def.length) {
            var def0 = def[0];
            if (isString(def0)) {
                dArr = [def];
            }
            else if (isArray(def0)) {
                dArr = def;
            }
            else {
                UTIL.assert('TimeDef illegal: ' + def);
            }
            for (var i = 0, unit; i < dArr.length; i ++) {
                if (isArray(unit = dArr[i])) {
                    retArr.push(UTIL.parseTimeUnitDef(unit, ref));
                }
                else {
                    UTIL.assert('TimeDef illegal: ' + def);
                }
            }
        }

        return retArr;
    };

    /**
     * 解析标准化的时间单元定义
     * 时间单元用于描述一个时间或者一段时间
     * 
     * @param {Array.<string>} def 时间单元定义，其中：
     *      数组第一个元素表示def.start，即开始时间，
     *                      绝对值（如2012-12-12）
     *                      或相对于基准时间的偏移（如-5d）
     *      数组第二个元素表示def.end 结束时间，格式同上。（可缺省）
     *      数组第三个元素表示def.range 区间，相对于start或end的偏移（如-4d）（可缺省）
     *                  如果已经定义了start和end，则range忽略。
     *                  如果start或end只有一个被定义，则range是相对于它的偏移。
     *                  如果只有start被定义，则只取start。
     *                  例如start是+1ME，range是+5WB，
     *                  表示一个时间范围：从下月的最后一天开始，到下月最后一天往后5周的周一为止。
     * @param {(Array.<string>|Array.<Date>)} ref 基准时间
     *      格式同上，但数组中每个项都是绝对时间
     * @return {Object} timeUnit 结果时间单元
     * @return {Date} timeUnit.start 开始时间
     * @return {Date} timeUnit.end 结束时间
     */
    UTIL.parseTimeUnitDef = function (def, ref) {
        if (!def || !def.length) {
            return null;
        }

        var ret = {};
        var start = def[0];
        var end = def[1];
        var interval = def[2];

        ret.start = UTIL.parseTimeOffset(ref[0], start);
        ret.end = UTIL.parseTimeOffset(ref[1], end);

        // range情况处理
        if ((!start || !end) && interval) {
            var from;
            var to;
            if (start) {
                from = 'start';
                to = 'end';
            }
            else {
                from = 'end';
                to = 'start';
            }
            ret[to] = UTIL.parseTimeOffset(ret[from], interval);
        }
        else if (!end && !interval) {
            ret.end = ret.start;
        }

        return ret;
    };

    /**
     * 解析时间的偏移表达式
     *
     * @public
     * @param {(Date|string)} baseDate 基准时间，
     *      如果为 {string} 则格式为yyyy-MM-dd
     * @param {string} offset 偏移量，
     *      第一种情况是：
     *          用YMDWQ（年月日周季）分别表示时间粒度，
     *          用B/E表示首尾，如果没有B/E标志则不考虑首尾
     *          例如：
     *              假如baseDate为2012-05-09
     *              '+4D'表示baseDate往后4天，即2012-05-13 
     *              '-2M'表示往前2个月（的当天），即2012-03-13
     *              '2Q'表示往后2个季度（的当天），即2012-11-13
     *              '1W'表示往后1周（的当天），即2012-05-20
     *              '1WB'表示往后1周的开头（周一），即2012-05-14
     *              '-1WE'表示往前一周的结束（周日），即2012-05-06
     *              '0WE'表示本周的结束（周日），即2012-05-13
     *              月、季、年同理
     *      第二种情况是：直接指定日期，如yyyy-MM-dd，
     *          则返回此指定日期
     *      第三种情况是：空，则返回空
     * @return {Date} 解析结果
     */
    UTIL.parseTimeOffset = function (baseDate, offset) {
        if (offset == null) { return null; }
        if (!baseDate) { return baseDate; }
        
        if (isString(baseDate)) {
            baseDate = UTIL.parseTime(baseDate);
        }
        offset = offset.toUpperCase();
        
        var t = [
            baseDate.getFullYear(), 
            baseDate.getMonth(), 
            baseDate.getDate()
        ];
        var p = { Y: 0, M: 1, D: 2 };

        if (/^([-+]?)(\d+)([YMDWQ])([BE]?)$/.test(offset)) {
            var notMinus = !REGEXP.$1 || REGEXP.$1 == '+';
            var off = parseInt(REGEXP.$2);
            var timeType = REGEXP.$3;
            var beginEnd = REGEXP.$4;

            if ('YMD'.indexOf(timeType) >= 0) {
                t[p[timeType]] += notMinus ? (+ off) : (- off);
            }
            else if (timeType == 'W') {
                off = off * 7;
                t[p['D']] += notMinus ? (+ off) : (- off);
            }
            else if (timeType == 'Q') {
                off = off * 3;
                t[p['M']] += notMinus ? (+ off) : (- off);
            }
            var ret = new Date(t[0], t[1], t[2]);

            if (beginEnd) {
                if (timeType == 'Y') {
                    beginEnd == 'B'
                        ? (
                            ret.setMonth(0),
                            ret.setDate(1)
                        )
                        : (
                            ret.setFullYear(ret.getFullYear() + 1),
                            ret.setMonth(0),
                            ret.setDate(1),
                            ret.setTime(ret.getTime() - DAY_MILLISEC)
                        );
                }
                else if (timeType == 'M') {
                    beginEnd == 'B'
                        ? ret.setDate(1)
                        : (
                            ret.setMonth(ret.getMonth() + 1),
                            ret.setDate(1),
                            ret.setTime(ret.getTime() - DAY_MILLISEC)
                        );
                }
                else if (timeType == 'W') {
                    ret = (beginEnd == 'B' ? getWorkday : getWeekend)(ret);
                }
                else if (timeType == 'Q') {
                    (beginEnd == 'B') 
                        ? (ret = getQuarterBegin(ret))
                        : (
                            ret.setMonth(ret.getMonth() + 3),
                            ret = getQuarterBegin(ret),
                            ret.setTime(ret.getTime() - DAY_MILLISEC)
                        );
                }
            }

            return ret;
        }
        else {
            return UTIL.parseTime(offset);
        }
    };

    /**
     * 季度格式解析，格式形如：2012-Q1
     *
     * @param {string} dateStr 季度字符串
     * @return {Date} 季度第一天日期
     */
    UTIL.parseQuarter = function (dateStr) {
        var par = [0, 0, 3, 6, 9];
        dateStr = dateStr.split('-Q'); 
        return new Date(
            parseInt(dateStr[0], 10), 
            par[parseInt(dateStr[1], 10)], 
            1
        );
    };

    /**
     * json stringify
     *
     * @param {Object} obj 对象
     * @return {string} json 字符串
     */
    UTIL.jsonStringify = function (obj) {
        return obj ? stringify(obj) : '';
    };

    /**
     * ecui 发事件
     * 没有ecui时则直接返回
     *
     * @param {ecui.ui.Control} control ECUI 控件
     * @param {string} name 事件名称
     * @param {Object} event 事件对象
     * @param {Array} args 事件参数
     */
    UTIL.ecuiTriggerEvent = function (control, name, event, args) {
        if (!ecui) { return; }
        return ecui.triggerEvent(control, name, event, args);
    };  

    /**
     * ecui 添加监听器
     * 没有ecui时则直接返回
     *
     * @param {ecui.ui.Control} control ECUI 控件
     * @param {string} name 事件名称
     * @param {Function} caller 监听函数
     * @param {boolean=} once 是否只执行一次就注销
     */
    UTIL.ecuiAddEventListener = function (control, name, caller, once) {
        if (!ecui) { return; }

        var newCaller = once 
            ? function () {
                // 运行一次后就注销自己
                ecui.removeEventListener(control, name, arguments.callee);
                // 执行原来caller
                return caller.apply(this, arguments);
            }
            : caller;

        return ecui.addEventListener(control, name, newCaller);
    };    

    /**
     * ecui 析构控件
     * 没有ecui时则直接返回
     *
     * @param {ecui.ui.Control|HTMLElement} control 
     *      需要释放的控件对象或包含控件的 Element 对象
     */
    UTIL.ecuiDispose = function (control) {
        ecui && ecui.dispose(control);
    };

    /**
     * 是否是ecui控件
     *
     * @param {Object} obj 对象
     * @return {boolean} 是否是ecui控件
     */
    UTIL.isEcuiControl = function (obj) {
        return !!(ECUI_CONTROL && obj instanceof ECUI_CONTROL);
    };

    /**
     * 下载
     * 只支持下载失败的判断。
     * （在iframe的onload中使用readyState判断，如果下载成功则不会走onload）
     * 默认情况失败则弹窗提示。
     *
     * @public
     * @param {Object} url 链接和参数
     * @param {Function} onfailure 失败的回调
     * @param {boolean} showDialog 显示对话框提示。默认不显示。
     */
    UTIL.download = function (url, onfailure, showDialog) {
        onfailure = onfailure || new Function();

        var failureHandler = showDialog 
            ? function () {
                DIALOG.alert(LANG.SAD_FACE + LANG.DOWNLOAD_FAIL, onfailure);
            }
            : onfailure;

        var elDownload = g(downloadIframeId);
        if (!elDownload) {
            var elDownload = document.createElement('iframe');
            elDownload.id = downloadIframeId;
            elDownload.style.display = 'none';
            document.body.appendChild(elDownload);
        }

        elDownload.onload = function () {
            var doc = elDownload.contentWindow.document;
            
            if (doc.readyState == 'complete' || doc.readyState == 'loaded') {
                failureHandler();
            }

            elDownload.onload = null;
        };

        // 开始下载
        elDownload.src = url;
    };

    /**
     * 新开窗口
     *
     * @public
     * @param {string} url 目标url
     */
    UTIL.targetBlank = function (url) {
        var doc = document;
        var body = doc.body;
        var el = doc.createElement('a');
        el.style.display = 'none';
        el.href = url || '#';
        el.target = '_blank';
        body.appendChild(el);
        el.click();
        body.removeChild(el);
    };

    /**
     * 对每个对象，执行方法
     *
     * @public
     * @param {Array} list 要执行方法的对象列表
     * @param {string} methodName 要执行的方法名
     */
    UTIL.foreachDo = function (list, methodName) {
        for (var i = 0, o; i < list.length; i ++) {
            (o = list[i]) && (
                o.$di
                    ? o.$di(methodName)
                    : o[methodName]
            );
        }
    };

    var downloadIframeId = String(
        'download-iframe-' + Math.round(Math.random() * 10000000000000)
    );

    function naming (attrName, prefix) {
        return prefix + attrName.charAt(0).toUpperCase() + attrName.slice(1);
    }
    
    function attrNaming (attrName, o) {
        var prefix = '';
        if (UTIL.isEcuiControl(o)) {
            prefix = '_u';
        } else if (isArray(o)) {
            prefix = '_a';
        } else if (isFunction(o)) {
            prefix = '_f';
        } else {
            prefix = '_m';
        }
        return naming(attrName, prefix);
    }

    //-------------------------------------------------------
    // 逻辑表达式
    //-------------------------------------------------------

    /**
     * 计算json配置的逻辑表达式
     * 
     * @public
     * @param {Object} jsonLogicExp 表达式
     *      支持与（and）、或（or）非（not）逻辑。
     *      原子语句的判断由使用提供（atomCal）
     *      原子语句必须是对象形式定义
     *      格式例如：（array的第一个元素是操作符，后面是操作数）
     *      [
     *          'and',
     *           [ 
     *               'or',
     *               { someCustomerRule: 'asdf', someValue: 1234 },
     *               { someCustomerRule: 'asdf', someValue: 1234 },
     *               { someCustomerRule: 'asdf', someValue: 1234 }
     *           ],
     *           { someCustomerRule: 'zcvcxz', someValue: 32432 }
     *      ]
     *
     * @param {Function} atomCalFunc 原子语句的计算的回调函数
     *      参数为{Object}格式的原子语句
     *      返回值为{boolean}表示判断结果
     * @return {boolean} 计算结果
     */
    UTIL.evalJsonLogic = function (jsonLogicExp, atomCalFunc) {
        if (!jsonLogicExp || !atomCalFunc) {
            jsonLogicExpError(jsonLogicExp);
        }

        var operator;
        var i;
        var ret;

        // 是逻辑表达式
        if (isArray(jsonLogicExp)) {

            jsonLogicExp.length < 2 && jsonLogicExpError(jsonLogicExp);

            operator = jsonLogicExp[0];
            if (operator == 'and') {
                ret = true;
                for (i = 1; i < jsonLogicExp.length; i ++) {
                    ret = ret && UTIL.evalJsonLogic(
                        jsonLogicExp[i], atomCalFunc
                    );
                }
                return ret;
            }
            else if (operator == 'or') {
                ret = false;
                for (i = 1; i < jsonLogicExp.length; i ++) {
                    ret = ret || UTIL.evalJsonLogic(
                        jsonLogicExp[i], atomCalFunc
                    );
                }
                return ret;
            }
            else if (operator == 'not') {
                return !UTIL.evalJsonLogic(
                    jsonLogicExp[i], atomCalFunc
                );
            }
            else {
                jsonLogicExpError(jsonLogicExp);
            }
        }
        // 是原子语句
        else {
            return atomCalFunc(jsonLogicExp);
        }
    };

    function jsonLogicExpError(jsonLogicExp, msg) {
        throw new Error(
            'Illegle json logic express, ' + (msg || '') 
            + '. ' + stringify(jsonLogicExp)
        );
    }

    //-------------------------------------------------------
    // dom相关 (modified based on tangram and ecui)
    //-------------------------------------------------------

    /**
     * 获取横向滚动量
     * 
     * @public
     * @param {Window} win 指定window
     * @return {number} 横向滚动量
     */
    UTIL.getScrollLeft = function (win) {
        win = win || window;
        var d = win.document;
        return win.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
    };

    /**
     * 获取纵向滚动量
     *
     * @public
     * @param {Window} win 指定window
     * @return {number} 纵向滚动量
     */
    UTIL.getScrollTop = function (win) {
        win = win || window;
        var d = win.document;
        return win.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
    };

    /**
     * 获取页面视觉区域宽度
     *             
     * @public
     * @param {Window} win 指定window
     * @return {number} 页面视觉区域宽度
     */
    UTIL.getViewWidth = function (win) {
        win = win || window;
        var doc = win.document;
        var client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

        return client.clientWidth;
    };

    /**
     * 获取页面视觉区域高度
     * 
     * @public
     * @param {Window} win 指定window
     * @return {number} 页面视觉区域高度
     */
    UTIL.getViewHeight = function (win) {
        win = win || window;
        var doc = win.document;
        var client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

        return client.clientHeight;
    };

    /**
     * 获取页面宽度
     *
     * @public
     * @param {Window} win 指定window
     * @return {number} 页面宽度
     */
    UTIL.getWidth = function (win) {
        win = win || window;
        var doc = win.document;
        var body = doc.body;
        var html = doc.documentElement;
        var client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

        return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
    };

    /**
     * 获取页面高度
     *             
     * @public
     * @param {Window} win 指定window
     * @return {number} 页面高度
     */
    UTIL.getHeight = function (win) {
        win = win || window;
        var doc = win.document;
        var body = doc.body;
        var html = doc.documentElement;
        var client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

        return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
    };

    //-------------------------------------------------
    // Deprecated
    //-------------------------------------------------

    /**
     * 注入ui和model的方便方法
     * 
     * @public 
     * @deprecated
     * @usage 例如：util.ref(container, 'abc', o); 
     *        则首先会去container中寻找方法setAbc调用，
     *        如果没有则直接对属性进行赋值：
     *              前缀映射举例：
     *                  {ecui.ui.Control} => _uAbc
     *                  {Array} => _aAbc
     *                  {Function} => _fAbc
     *                  {others} => _mAbc
     * @param {Object} container 目标容器
     * @param {string} attrName 属性名
     * @param {ecui.ui.Contorl|SomeModel|Array|Function} o 被设置内容
     * @return {ecui.ui.Contorl|SomeModel|Array|Function} o 被设置内容
     */
    UTIL.ref = function (container, attrName, o) {
        var f;
        if (isFunction(f = container[naming(attrName, 'set')])) {
            f.call(container, o);
        } else if (hasValue(f = attrNaming(attrName, o))){
            container[f] = o;
        }
        return o;
    };
    
    /**
     * 从对象中得到model的方便方法
     * 
     * @deprecated
     * @public 
     * @usage 例如：util.getModel(container, 'abc'); 
     *        则首先会去container中寻找方法getAbc调用，
     *        如果没有则直接从属性container._mAbc中取
     * @param {Object} container 目标容器
     * @param {string} attrName 属性名
     * @return {SomeModel} o 模型对象
     */
    UTIL.getModel = function (container, attrName) {
        var f;
        if (isFunction(f = container[naming(attrName, 'get')])) {
            return f.call(container);
        } else {
            return container[naming(attrName, '_m')];
        }
    };

})();
/**
 * configuration of xutil.ajax
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console工程的ajax配置
 *           重载全局配置
 * @author:  xxx(xxx)
 * @depend:  xutil.ajax, config.lang
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var XAJAX = xutil.ajax;
    var isFunction = xutil.lang.isFunction;
    var AJAX = di.config.AJAX
    var LANG = di.config.Lang;
    var alert = di.helper.Dialog.alert;
    var confirm = di.helper.Dialog.confirm;
    var waitingPrompt = di.helper.Dialog.waitingPrompt;
    var hidePrompt = di.helper.Dialog.hidePrompt;
    
    // 如有需要，在此重载全局配置 ...

})();
/**
 * di.config.Dict的增改
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console的字典及常量定义
 * @author:  xxx(xxx)
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var DICT = di.config.Dict;
    
    // 如有需要，在此增加配置 ...

})();
/**
 * di.config.Lang的增改
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console的话术定义
 * @author:  xxx(xxx)
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var LANG = di.config.Lang;

    // 如有需要，在此增加配置 ...        
    
})();
/**
 * configuration of xutil.ajax
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console工程的url配置
 *           重载全局配置
 * @author:  xxx(xxx)
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var URL = di.config.URL;
    
    // olap编辑、报表管理外壳
    URL.addURL('CONSOLE_FRAME_INIT', '/xxx/xxxxxxxxx1.action');


	// TODO    
    // URL.addURL('CONSOLE_IND', '/xxx/xxxxxxxxx2.action');
    // URL.addURL('CONSOLE_DIM', '/xxx/xxxxxxxxx3.action');
    // URL.addURL('CONSOLE_CHART', '/xxx/xxxxxxxxx4.action');

})();
/**
 * di.helper.Dialog的增改
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console特有的全局的提示信息 
 * @author:  xxx(xxx)
 * @depend:  tangram.dom, tangram.page, ecui, xui
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var DIALOG = di.helper.Dialog;

    // 如有需要，在此增加配置 ...  
        
})();
/**
 * di.helper.Formatter的增改
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console特有的格式化
 * @author:  xxx(xxx)
 * @depend:  xutil, tangram.ajax
 */

(function() {
    
    //----------------------------------------
    // 引用
    //----------------------------------------

    var FORMATTER = di.helper.Formatter;
        
    // 如有需要，在此增加配置 ...  

})();
/**
 * di.helper.Util的增改
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console特有的业务辅助函数集
 * @author:  xxx(xxx)
 * @depend:  xutil, tangram.ajax
 */

(function() {
    
    //----------------------------------------
    // 引用
    //----------------------------------------

    var UTIL = di.helper.Util;
        
    // 如有需要，在此增加配置 ...  

})();
/**
 * di.shared.vui.HiddenInput
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    隐藏的输入，用于传递报表引擎外部传来的参数
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.vui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var extend = xutil.object.extend;
    var encodeHTML = xutil.string.encodeHTML;
    var XOBJECT = xui.XObject;

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 隐藏的输入，用于传递报表引擎外部传来的参数
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {HTMLElement} options.el 容器元素
     */
    var HIDDEN_INPUT = $namespace().HiddenInput = 
            inheritsObject(XOBJECT, constructor);
    var HIDDEN_INPUT_CLASS = HIDDEN_INPUT.prototype;
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        (this._eMain = options.el).style.display = 'none';
    };
    
    /**
     * 设置数据
     *
     * @public
     * @param {Object} data 数据
     * @param {(Object|Array}} data.datasource 数据集
     * @param {*} data.value 当前数据
     */
    HIDDEN_INPUT_CLASS.setData = function (data) {
        this._oData = data;
    };

    /**
     * 得到当前值
     *
     * @public
     * @return {*} 当前数据
     */
    HIDDEN_INPUT_CLASS.getValue = function () {
        return (this._oData || {}).value;
    };

})();
/**
 * di.shared.vui.OfflineDownload
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    离线下载按钮和对话框
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.vui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var extend = xutil.object.extend;
    var encodeHTML = xutil.string.encodeHTML;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var isObject = xutil.lang.isObject;
    var isArray = xutil.lang.isArray;
    var template = xutil.string.template;
    var domChildren = xutil.dom.children;
    var domRemove = xutil.dom.remove;
    var getByPath = xutil.object.getByPath;
    var DICT = di.config.Dict;
    var XOBJECT = xui.XObject;
    var UI_BUTTON;
    var UI_FORM;

    $link(function () {
        UI_BUTTON = getByPath('ecui.ui.HButton');
        UI_FORM = getByPath('ecui.ui.Form');
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 离线下载按钮和对话框
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {string} options.skin 皮肤（的css类）
     * @param {string} options.text 按钮上的文字，默认为'离线下载'
     * @param {string} options.confirmText 确定按钮上的文字，默认为'确定'
     * @param {string} options.cancelText 取消按钮上的文字，默认为'取消'
     * @param {string} options.headText 提示文字，默认为'请输入邮箱'
     * @param {string} options.inputInfo 输入信息
     */
    var OFFLINE_DOWNLOAD = $namespace().OfflineDownload = 
            inheritsObject(XOBJECT, constructor);
    var OFFLINE_DOWNLOAD_CLASS = OFFLINE_DOWNLOAD.prototype;
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        var el = this._eMain = options.el;
        addClass(el, 'offline-download');

        var eel;
        var html;

        eel = document.createElement('div');
        el.appendChild(eel);
        this._uBtn = ecuiCreate(
            UI_BUTTON, 
            eel, 
            null,
            {
                text: options.text || '离线下载',
                skin: options.skin
            }
        );

        // 输入离线下载信息（如邮箱）的对话框
        if (!this._uDialog) {
            eel = document.createElement('div');
            html = [
                '<label>离线下载</label>',
                '<span class="offline-download-head">' + (options.headText || '请输入邮箱') + '</span>',
                '<input type="input" class="offline-download-input"/>',
                '<div></div>',
                '<div></div>'
            ];
            eel.innerHTML = html.join('');
            html = domChildren(eel);
            this._eInput = html[2];
            this._uDialog = ecuiCreate(UI_FORM, eel, null, { hide: true });
            this._uConfirmBtn = ecuiCreate(
                UI_BUTTON, 
                html[3],
                null,
                {
                    text: options.confirmText || '确定',
                    skin: options.skin
                }
            );
            this._uCancelBtn = ecuiCreate(
                UI_BUTTON, 
                html[4],
                null,
                {
                    text: options.cancelText || '取消',
                    skin: options.skin
                }
            );

            document.body.appendChild(eel);
        }
    };

    OFFLINE_DOWNLOAD_CLASS.init = function () {
        var me = this;

        this._uBtn.onclick = function () {
            me.$clear();
            me._uDialog.center();
            me._uDialog.showModal(DICT.DEFAULT_MASK_OPACITY);
        };

        this._uConfirmBtn.onclick = function () {
            me.notify('confirm', [me._eInput.value]);
            me._uDialog.hide();
        };

        this._uCancelBtn.onclick = function () {
            me._uDialog.hide();
        }

        this._uDialog.init();
        this._uBtn.init();
        this._uConfirmBtn.init();
        this._uCancelBtn.init();
    };   

    OFFLINE_DOWNLOAD_CLASS.$clear = function () {
        this._eInput.value = '';
    };

    OFFLINE_DOWNLOAD_CLASS.getValue = function () {
        return { email: this._eInput.value };
    };

    OFFLINE_DOWNLOAD_CLASS.dispose = function () {
        if (this._uDialog) {
            var el = this._uDialog.getOuter();
            this._uDialog.dispose();
            this._uBtn.dispose();
            this._uConfirmBtn.dispose();
            this._uCancelBtn.dispose();
            domRemove(el);
        }
    };       
    
})();
/**
 * di.shared.ui.OlapMetaDragger
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    多维分析报表元数据拖拽
 * @author:  xxx(xxx)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.vui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var extend = xutil.object.extend;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var template = xutil.string.template;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var getByPath = xutil.object.getByPath;
    var getUID = xutil.uid.getIncreasedUID;
    var XOBJECT = xui.XObject;
    var UI_DROPPABLE_LIST;
    var UI_DRAGPABLE_LIST;
    var DIM_SELECT_PANEL;
    var ecuiCreate = UTIL.ecuiCreate;
    var ecuiDispose = UTIL.ecuiDispose;

    $link(function () {
        UI_DROPPABLE_LIST = getByPath('ecui.ui.DroppableList');
        UI_DRAGPABLE_LIST = getByPath('ecui.ui.DraggableList');
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 元数据（指标维度）条件拖动选择
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {HTMLElement} options.el 容器元素
     * @param {Object} options.reportType 类型，
     *          TABLE(默认)或者CHART
     * @param {Function=} options.commonParamGetter 公共参数获取     
     */
    var OLAP_META_DRAGGER = $namespace().OlapMetaDragger = 
            inheritsObject(XOBJECT, constructor);
    var OLAP_META_DRAGGER_CLASS = OLAP_META_DRAGGER.prototype;
    
    //------------------------------------------
    // 模板 
    //------------------------------------------

    var TPL_MAIN = [
        '<div class="meta-condition-src">',
            '<div class="meta-condition-ind">',
                '<div class="meta-condition-head-text">选择指标：</div>',
                '<div class="meta-condition-ind-line q-di-meta-ind"></div>',
            '</div>',
            '<div class="meta-condition-dim">',
                '<div class="meta-condition-head-text">选择维度：</div>',
                '<div class="meta-condition-dim-line q-di-meta-dim"></div>',
            '</div>',
        '</div>',
        '<div class="meta-condition-tar q-di-meta-tar">',
        '</div>'
    ].join('');

    var TPL_SEL_LINE = [
        '<div class="meta-condition-sel">',
            '<div class="meta-condition-head-text">#{0}</div>',
            '<div class="meta-condition-sel-line q-di-meta-sel-line"></div>',
        '</div>'
    ].join('');

    var DEFAULT_SEL_LINE_TITLE = {
        ROW: '行：',
        FILTER: '过滤：',
        COLUMN: '列：'
    };


    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        var el = this._eMain = options.el;
        addClass(el, 'meta-condition');

        // 模板
        el.innerHTML = TPL_MAIN;

        // 控件/DOM引用
        this._eSelLineArea = q('q-di-meta-tar', el)[0];

        // selLine控件集合，key为selLineName
        this._oSelLineWrap = new LINKED_HASH_MAP();
        // selLine控件id集合，key为selLineName
        this._oSelLineIdWrap = {};
    };
    
    /**
     * 初始化
     *
     * @public
     */
    OLAP_META_DRAGGER_CLASS.init = function () {
    };

    /**
     * 设置数据
     *
     * @public
     * @param {Object} data 数据
     * @param {Object} data.inddim
     *      控件所需的item 的数据结构
     *      {string} uniqName （相当于控件的value）
     *      {string} caption （相当于控件的text）
     *      {string} clazz （标志是'IND'还是'DIM'）
     *      {boolean} fixed 是否固定
     *      {string} align item居左（'LEFT'）还是居右（'RIGHT'）
     * @param {Object} data.selLineDataWrap
     * @param {Object=} data.selLineTitleDef 标题定义，
     *      形如{ ROW: '行', COLUMN: '列, FITER: '过滤' }，
     *      为空则取默认。
     * @param {Object=} data.rule 拖拽规则
     *      FIXME
     *      这些规则配置没有实现，后续重构规则配置
     *      {Object=} data.rule.IND 指标规则
     *      {Object=} data.rule.DIM 维度规则
     *          规则项有：
     *              {Array.<string>} dropPos 可下落的位置（null则全可下落）
     *                  每项值可为'COL'\'ROW'\'FILTER'
     *      {Object=} data.rule.COL 列规则
     *      {Object=} data.rule.ROW 行规则
     *      {Object=} data.rule.FILTER 过滤器规则
     *          规则项有：
     *              {boolean} canEmpty 是否可为空（默认true）
     *              {boolean} draggable 是否可拖拽（默认true）
     *              {boolean} selectable 是否可选择（默认true）
     * @param {boolean} isSilent
     */
    OLAP_META_DRAGGER_CLASS.setData = function (data, isSilent) {
        this._oData = data || {};
        this._mModel = data.model;
        this._oRule = data.rule || {};
        !isSilent && this.render();
    };

    /**
     * 渲染
     *
     * @public
     */
    OLAP_META_DRAGGER_CLASS.render = function () {
        var me = this;
        var el = this._eMain;
        var data = this._oData;

        // 清空
        this.$disposeInner();

        // 指标维度
        var sourceEcuiId = [
            '\x06_DI_META_COND_IND' + getUID('DI_META_COND'),
            '\x06_DI_META_COND_DIM' + getUID('DI_META_COND')
        ];
        var inddim = data.inddim;

        // 指标控件
        this._uIndSrc = ecuiCreate(
            UI_DRAGPABLE_LIST,
            q('q-di-meta-ind', el)[0],
            null,
            {
                id: sourceEcuiId[0],
                disableSelected: true, // 暂禁止重复拖动
                clazz: 'IND'
            }
        );
        inddim.indList.foreach(
            function (uniqName, item) {
                me._uIndSrc.addItem(
                    {
                        value: item.uniqName, 
                        text: item.caption, 
                        clazz: item.clazz,
                        fixed: item.fixed,
                        align: item.align
                    }
                );
            }
        );

        // 维度控件
        this._uDimSrc = ecuiCreate(
            UI_DRAGPABLE_LIST,
            q('q-di-meta-dim', el)[0],
            null,
            {
                id: sourceEcuiId[1],
                disableSelected: true,
                clazz: 'DIM'
            }
        );
        inddim.dimList.foreach(
            function (uniqName, item) {
                me._uDimSrc.addItem(
                    {
                        value: item.uniqName, 
                        text: item.caption, 
                        clazz: item.clazz,
                        fixed: item.fixed,
                        align: item.align
                    }
                );
            }
        );

        // 增加默认的selLine
        data.selLineDataWrap.foreach(
            function (name, selLineData, index) {
                me.$addSelLine(
                    name,
                    (data.selLineTitleDef || DEFAULT_SEL_LINE_TITLE)[
                        name.split('_')[0]
                    ],
                    sourceEcuiId.join(','),
                    selLineData
                );
            }
        );

        // 事件绑定
        this._uIndSrc.onchange = bind(this.$handleSelLineChange, this);
        this._uDimSrc.onchange = bind(this.$handleSelLineChange, this); 
        this._oSelLineWrap.foreach(
            function (selLineName, selLineCtrl) {
                selLineCtrl.onitemclick = bind(
                    me.$handleItemClick, 
                    me, 
                    selLineName
                );

                selLineCtrl.oncheckdroppable = bind(
                    me.$checkSelLineDroppable, me
                );
                selLineCtrl.oncheckdraggable = bind(
                    me.$checkSelLineDraggable, me
                );
            }
        );
    };

    /**
     * @override
     */
    OLAP_META_DRAGGER_CLASS.dispose = function () {
        this.$disposeInner();
        this._eSelLineArea = null;
        OLAP_META_DRAGGER.superClass.dispose.call(this);
    };

    /**
     * 内部清空
     * 
     * @protected
     */
    OLAP_META_DRAGGER_CLASS.$disposeInner = function () {
        if (this._uIndSrc) {
            ecuiDispose(this._uIndSrc);
            this._uIndSrc = null;
        }
        if (this._uDimSrc) {
            ecuiDispose(this._uDimSrc);
            this._uDimSrc = null;
        }
        this._oSelLineWrap.foreach(
            function (name, item, index) {
                ecuiDispose(item);
            }
        );
        this._eSelLineArea.innerHTML = '';
        this._oSelLineWrap.cleanWithoutDefaultAttr();
        this._oSelLineIdWrap = {};
    };

    /**
     * 增加选择行
     * 
     * @protected
     * @param {string} selLineName selLine名
     * @param {string} selLineTitle selLine显示名
     * @param {string} source 来源ecui控件id
     * @param {xutil.LinkedHashMap=} selLineData selLine数据
     */
    OLAP_META_DRAGGER_CLASS.$addSelLine = function (
        selLineName, selLineTitle, source, selLineData
    ) {
        if (selLineName == null) {
            return;
        }
        var selLineWrap = this._oSelLineWrap;
        var selLineIdWrap = this._oSelLineIdWrap;

        // 增加selLine
        var o = document.createElement('div');
        o.innerHTML = template(TPL_SEL_LINE, selLineTitle);
        this._eSelLineArea.appendChild(o = o.firstChild);

        selLineWrap.addLast(
            ecuiCreate(
                UI_DROPPABLE_LIST, 
                q('q-di-meta-sel-line', o)[0],
                null,
                {
                    id: selLineIdWrap[selLineName] = 
                        '\x06_DI_META_COND_SEL' + getUID('DI_META_COND'),
                    source: source,
                    name: selLineName,
                    configBtn: false
                }
            ),
            selLineName
        );

        // 设置新增控件target，并对所有其他selLine设置target
        for (var name in selLineIdWrap) {
            if (name != selLineName) {
                selLineWrap.get(name).addTarget(selLineIdWrap[selLineName]);
            }
            selLineWrap.get(selLineName).addTarget(selLineIdWrap[name]);
        }
        this._uIndSrc.addTarget(selLineIdWrap[selLineName]);
        this._uDimSrc.addTarget(selLineIdWrap[selLineName]);

        // 初始数据
        if (selLineData) {
            selLineData.foreach( 
                function (uniqName, item, index) {
                    selLineWrap.get(selLineName).addItem(
                        {
                            value: item.uniqName, 
                            text: item.caption,
                            clazz: item.clazz,
                            fixed: item.fixed,
                            align: item.align
                        }
                    );
                }
            );
        }
    };

    /**
     * 更新控件的元数据状态
     *
     * @public
     */
    OLAP_META_DRAGGER_CLASS.refreshStatus = function (statusWrap) {
        if (statusWrap) {
            this._uIndSrc.setState(
                { 
                    disable: statusWrap.indMetas.disabledMetaNames,
                    selected: statusWrap.indMetas.selectedMetaNames
                }
            );
            this._uDimSrc.setState(
                { 
                    disable: statusWrap.dimMetas.disabledMetaNames,
                    selected: statusWrap.dimMetas.selectedMetaNames
                }
            );
        }
    };

    /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    OLAP_META_DRAGGER_CLASS.enable = function (key) {
        // TODO 检查
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            this._uIndSrc && this._uIndSrc.enable();
            this._uDimSrc && this._uDimSrc.enable();
            this._oSelLineWrap.foreach(
                function (name, item, index) {
                    item.enable();
                }
            );
        }
        OLAP_META_DRAGGER.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    OLAP_META_DRAGGER_CLASS.disable = function (key) {
        objKey.add(this, key);

        // TODO 检查
        if (!this._bDisabled) {
            this._uIndSrc && this._uIndSrc.disable();
            this._uDimSrc && this._uDimSrc.disable();
            this._oSelLineWrap.foreach(
                function (name, item, index) {
                    item.disable();
                }
            );
        }
        OLAP_META_DRAGGER.superClass.disable.call(this);
    };    

    /**
     * 获取元数据选择处理
     * 
     * @protected
     */
    OLAP_META_DRAGGER_CLASS.$handleSelLineChange = function (
        itemData, itemIndex, selLineName, oriItemIndex, oriSelLineName
    ) {
        var wrap = {};
        this._oSelLineWrap.foreach(
            function (k, o, index) {
                wrap[k] = o.getValue();
            }
        );

        var changeWrap = {
            from: oriSelLineName,
            to: selLineName,
            toPosition: itemIndex,
            uniqNameList: [itemData.value]
        };

        // 根据规则修正变化
        // this.$fixSelLineChange(itemData, itemIndex, selLineName, changeWrap);

        /**
         * 选择变化事件
         *
         * @event
         */
        this.notify('sellinechange', [wrap, changeWrap]);
    };

    /**
     * selLine上指标维度点击事件处理
     * 
     * @protected
     */
    OLAP_META_DRAGGER_CLASS.$handleItemClick = function (
        selLineName, event, itemData
    ) {
        var metaItem = 
            this._mModel.getMetaItem(itemData.value);

        // 维度--打开维度选择面板
        if (metaItem && metaItem.clazz == 'DIM') {
            DIM_SELECT_PANEL().open(
                'EDIT',
                {
                    uniqName: itemData.value,
                    reportType: this._sReportType,
                    selLineName: selLineName,
                    dimMode: metaItem.isTimeDim ? 'TIME' : 'NORMAL',
                    commonParamGetter: this._fCommonParamGetter
                }
            );
        }
        // 指标--打开指标设置面板
        else {
            // TODO
        }
    };

    /**
     * 从selline中寻找item
     *
     * @private
     * @param {string} clazz 'IND'或者'DIM'
     * @param {string=} selLineName 指定的selLineName，缺省则全局找
     * @param {Item=} exclude 排除
     * @return {Array.<Object>} 每项中含有：
     *          item：查找到的item
     *          selLineName：行名
     *          index：item的index
     */
    OLAP_META_DRAGGER_CLASS.$findItemFromSelLine = function(
        clazz, selLineName, exclude
    ) {
        var ret = [];

        function findInLine(selLineName, selLine) {
            var itemList = selLine.getItems();
            for (var i = 0, item; item = itemList[i]; i ++) {
                if (item != exclude && item.getClazz() == clazz) {
                    ret.push(
                        { 
                            item: item, 
                            selLineName: selLineName, 
                            index: i 
                        }
                    );
                }
            }
        }

        if (selLineName) {
            findInLine(selLineName, this._oSelLineWrap.get(selLineName));
        }
        else {
            this._oSelLineWrap.foreach(findInLine);
        }

        return ret;
    }


    //---------------------------------------------------
    // 拖拽规则(后续重构) FIXME
    //---------------------------------------------------

    /**
     * selLine上检查是否可以drop
     * 
     * @protected
     */
    OLAP_META_DRAGGER_CLASS.$checkSelLineDroppable = function (
        itemData, index, selLineName
    ) {
        var rule = this._oRule;
        // var ruleIND = rule.IND || {};
        // var ruleDIM = rule.DIM || {};

        // 规则 FORBID_1：指标只能拖到列上
        if (itemData.clazz == 'IND' && selLineName.indexOf('COL') < 0) {
            return false;
        }

        // 规则 FORBID_5：维度不能拖到列上
        if (itemData.clazz == 'DIM' && selLineName.indexOf('COL') >= 0) {
            return false;
        }

        // 规则 FORBID_7：filter不能drop
        if (selLineName.indexOf('FILTER') >= 0) {
            return false;
        }

        var selLine = this._oSelLineWrap.get(selLineName);

        // 规则 FORBID_4：有align标志的，只能在左或右
        // 这里假设后台来的数据都已经是align正确的，前台仅就拖拽行为进行限制
        var items = selLine.getItems();
        var item;
        if ((
                (item = items[index]) 
                && item.getWrap().align == 'LEFT'
            )
            || (
                (item = items[index - 1]) 
                && item.getWrap().align == 'RIGHT'
            )
        ) {
            return false;
        }

        return true;
    };
    
    /**
     * selLine上检查是否可以drag
     * 
     * @protected
     */    
    OLAP_META_DRAGGER_CLASS.$checkSelLineDraggable = function (
        itemData, index, selLineName
    ) {
        var rule = this._oRule;

        // 规则 FORBID_2：禁止指标维度全部拖空
        var selLine = this._oSelLineWrap.get(selLineName);
        if (selLine.count() <= 1) {
            if (rule.forbidColEmpty && selLineName.indexOf('COL') >= 0) {
                return false;
            }
            if (rule.forbidRowEmpty && selLineName.indexOf('ROW') >= 0) {
                return false;
            }
        }

        // 规则 FORBID_3：有fixed标志的，不能拖走
        if (itemData.fixed) {
            return false;
        }

        // 规则 FORBID_6：filter不能操作（禁止拖动、放大镜）
        if (selLineName.indexOf('FILTER') >= 0) {
            return false;
        }

        return true;
    }

    /**
     * 根据规则对拖拽结果进行修正
     * （这段逻辑没有启用，后面会移到后台）
     * 
     * @protected
     * @deprecated
     */
    OLAP_META_DRAGGER_CLASS.$fixSelLineChange = function (
        itemData, itemIndex, selLineName, changeWrap
    ) {
        if (itemIndex == null) {
            // 移除的情况，不作修正
            return;
        }
        
        // 规则 FIX_1：所有指标和计算列，总是连在一起。
        //          （指标和计算列的连带暂未实现）

        // 规则 FIX_2：指标区要么在头部，要么在尾部。

        // 被移动的项是否是计算列
        var isCal = (itemData.calcColumnRefInd || []).length > 0;
        var selLine = this._oSelLineWrap.get(selLineName);
        var selLineItems = selLine.getItems() || [];
        var dragItem = selLineItems[itemIndex];
        var prev = selLineItems[itemIndex - 1];
        var next = selLineItems[itemIndex + 1];
        var prevData = prev && prev.getWrap();
        var nextData = next && next.getWrap();
        var oList;
        var o;
        var des;
        var targetIndex;
        var i;

        // 判断dragItem的两边状况
        var side = { IND: [], DIM: [], WALL: [] };
        prevData 
            ? (side[prevData.clazz][0] = 1)
            : (side.WALL[0] = 1);
        nextData 
            ? (side[nextData.clazz][1] = 1)
            : (side.WALL[1] = 1);

        // IF 拖拽的dragItem是dim
        if (itemData.clazz == 'DIM') {
            // IF dragItem两边都是dim，THEN do nothing

            // IF dragItem一边是ind，另一边是dim，THEN do nothing

            // IF dragItem一边是ind，另一边是墙 
            if (side.IND.length > 0 && side.WALL.length > 0) {
                // THEN 同行所有dim都移入ind区和dragItem间
                oList = this.$findItemFromSelLine('DIM', selLineName, dragItem);                                
                for (i = 0; o = oList[i]; i ++) {
                    this._oSelLineWrap.get(o.selLineName).remove(o.item);
                }
                for (i = 0; o = oList[i]; i ++) {
                    selLine.add(o.item, side.IND[0] ? (selLine.count() - 1) : 1);
                }
            }

            // IF dragItem两边都是ind
            else if (side.IND[0] && side.IND[1]) {
                // THEN 往两边找到dim区，item移入dim区和ind区之间
                // 用首尾判断即可
                des = selLineItems[0].getClazz() == 'DIM';
                for (
                    i = des ? 0 : (selLineItems.length - 1); 
                    o = selLineItems[i]; 
                    i += des ? 1 : -1
                ) {
                    if (o.getClazz() == 'IND') {
                        targetIndex = des ? i : (i + 1);
                        break;
                    }
                }
                selLine.remove(dragItem);
                selLine.add(
                    dragItem, 
                    targetIndex <= itemIndex ? targetIndex : targetIndex - 1
                );
            }
        }

        // IF 拖拽的dragItem是ind
        else if (itemData.clazz == 'IND') {
            // IF dragItem两边都是ind，THEN do nothing

            // IF dragItem一边是ind，另一边是dim，THEN do nothing

            // IF dragItem一边是dim，另一边是墙 
            if (side.DIM.length > 0 && side.WALL.length > 0) {
                // THEN 全局所有ind都移入dim区和dragItem间
                oList = this.$findItemFromSelLine('IND', null, dragItem);
                for (i = 0; o = oList[i]; i ++) {
                    this._oSelLineWrap.get(o.selLineName).remove(o.item);
                }
                for (i = 0; o = oList[i]; i ++) {
                    selLine.add(o.item, side.DIM[0] ? (selLine.count() - 1) : 1);
                }
            }

            // IF dragItem两边都是dim
            else if (side.DIM[0] && side.DIM[1]) {
                // THEN 找到离墙近的那边，把dragItem移动到墙边，
                des = itemIndex > (selLineItems.length - 1) / 2;
                selLine.remove(dragItem);
                selLine.add(dragItem, des ? selLine.count() : 0);
                
                // 再把所有ind移动到dragItem和dragItem之间
                oList = this.$findItemFromSelLine('IND', null, dragItem);
                for (i = 0; o = oList[i]; i ++) {
                    this._oSelLineWrap.get(o.selLineName).remove(o.item);
                }
                for (i = 0; o = oList[i]; i ++) {
                    selLine.add(o.item, des ? (selLine.count() - 1) : 1);
                }
            }
        }

        // 修正changeWrap的toPosition
        selLineItems = selLine.getItems() || [];
        for (i = 0; o = selLineItems[i]; i ++) {
            if (o.getClazz == 'IND') {

            }
        }
    };

})();
/**
 * di.shared.vui.TextLabel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    文字区
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.vui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var extend = xutil.object.extend;
    var encodeHTML = xutil.string.encodeHTML;
    var isObject = xutil.lang.isObject;
    var isArray = xutil.lang.isArray;
    var template = xutil.string.template;
    var XOBJECT = xui.XObject;

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 文字区
     * 直接指定文字，或者html，
     * 或者模板（模板形式参见xutil.string.template）
     * 初始dom中的内容被认为是初始模板。
     * 也可以用参数传入模板。
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {HTMLElement} options.el 容器元素
     */
    var TEXT_LABEL = $namespace().TextLabel = 
            inheritsObject(XOBJECT, constructor);
    var TEXT_LABEL_CLASS = TEXT_LABEL.prototype;
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        var el = this._eMain = options.el;
        addClass(el, 'vui-text-area');

        this._sInitTpl = el.innerHTML;
        el.innerHTML = '';

        this.setData(options);
    };
    
    /**
     * 设置数据
     *
     * @public
     * @param {Object} data 数据
     * @param {string} data.html html
     * @param {string} data.text 文本
     * @param {string} data.tpl 模板
     * @param {(Array|Object)} data.args 参数
     */
    TEXT_LABEL_CLASS.setData = function (data) {
        var el = this._eMain;
        data = data || {};

        if (data.html != null) {
            el.innerHTML = data.html;
        }
        else if (data.text != null) {
            el.innerHTML = encodeHTML(data.text);
        }
        else if (data.tpl != null) {
            renderTpl.call(this, data.tpl, data.args);
        }
        else if (this._sInitTpl != null) {
            renderTpl.call(this, this._sInitTpl, data.args);
        }
    };

    /**
     * 按照模板渲染
     * 
     * @private
     */
    function renderTpl(tpl, args) {
        var el = this._eMain;

        if (isObject(args)) {
            el.innerHTML = template(tpl, args);
        }
        else if (isArray(args)) {
            el.innerHTML = template.apply(null, tpl, args);
        }
        else {
            el.innerHTML = template.tpl || '';
        }
    }

})();
/**
 * di.shared.model.AuthModel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用模型] 权限数据模型
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.shared.model');

(function () {
    
    /* 外部引用 */
    var inheritsModel = ecui.inheritsModel, 
        XDATASOURCE = xui.XDatasource;
        
    $link(function () {
    });
    
    /* 类型声明 */
    var AUTH_MODEL = $namespace().AuthModel = inheritsModel(XDATASOURCE),
        AUTH_MODEL_CLASS = AUTH_MODEL.prototype;
        
    /**
     * 获得用户Id
     * @public
     * 
     * @return {string} 用户id
     */
    AUTH_MODEL_CLASS.getUserId = function () {
        // TODO
    };    
    
})();

/**
 * di.shared.model.CommonParamFactory
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    通用请求参数处理器工厂
 * @author:  sushuang(sushuang)
 */

$namespace('di.shared.model');

(function () {
    
    var clone = xutil.object.clone;
    var extend = xutil.object.extend;
    var textParam = xutil.url.textParam;
    var jsonStringify = di.helper.Util.jsonStringify;
    var isArray = xutil.lang.isArray;
    var isObject = xutil.lang.isObject;

    /** 
     * 通用请求参数获取器工厂
     * 
     * @class
     * @param {Object} options 参数
     * @param {Object} options.externalParam 报表外部参数
     */
    var COMMON_PARAM_FACTORY = $namespace().CommonParamFactory = 
        function (options) {
            // 外部传来的报表参数。
            // 这些参数会回传给前端，而后在前后端传递。
            this.externalParam = options 
                && clone(options.externalParam) 
                || {};
        };
    var COMMON_PARAM_FACTORY_CLASS = COMMON_PARAM_FACTORY.prototype;

    /**
     * 要将对象格式化为json传输的标志
     */
    var STRINGIFY_FLAG = 'diF\x06^_^jsonnosj^_^\x06';

    /**
     * 如果是对象，
     * 则标注用http传输数据使用的格式，
     * 可以是stringify成json的格式，
     * 或者普通格式
     *
     * @public
     * @static
     * @param {*} data 可转为json的对象
     * @param {string} paramMode 可为'NORMAL'（默认），'JSON'
     * @return 原输入
     */
    COMMON_PARAM_FACTORY.markParamMode = function(data, paramMode) {
        if (isObject(data)) {
            if (!paramMode || paramMode == 'NORMAL') {
                delete data[STRINGIFY_FLAG];
            }
            else {
                data[STRINGIFY_FLAG] = paramMode;
            }
        }
        return data;
    };

    /**
     * 得到生产环境的getter
     *
     * @public
     * @param {Object} options 参数
     * @param {Object} options.reportTemplateId 后台的reportTemplateId
     */
    COMMON_PARAM_FACTORY_CLASS.getGetter = function(options) {
        options = options || {};

        var externalParam = this.externalParam;

        /**
         * 即后台的reportTemplateId。
         * reportTemplateId在必须以snippet为单位。
         * 每次请求后台都须调用commonParamGetter.update(data)对其进行更新，
         * 因为针对于每个报表，一个snippet中的第一个请求总要是使用记录在模板中reportTemplateId
         * （形如PERSISTENT***）来请求，后台用这个id从DB中取出报表，生成一个副本，放入缓存，
         * 并返回这个副本的reportTemplateId（形如：SESSION_LOADED***），后续，此snippet中的所有请求，
         * 都须以这个副本的reportTemplateId作为参数。
         * 所以要用update函数对这个reportTemplateId进行更新。
         */
        var reportTemplateId = options.reportTemplateId;

        /**
         * 初始为'INIT'，允许调用commonParamGetter。
         * 第一次调用而未返回时变为'FORBIDDEN'，这时再次调用则抛出异常，
         * （这是为了防止报表设计时，设计出：一个报表初始用）
         * 第一次调用返回时，变为'OPEN'，以后可随意调用。
         */
        var loadValve = 'INIT';

        /**
         * 通用参数获取器，
         * 会进行encodeURIComponent，和去除空值
         *
         * @public
         * @param {Object=} paramObj 请求参数
         *      key为参数名，
         *      value为参数值，{string}或者{Array.<string>}类型
         * @param {string} paramMode 什么格式传输，值可为：
         *      'NORMAL'（默认）：普通格式（数组使用aa=2&aa=3&aa=5的方式，不支持对象传输）；
         *      'JSON'：使用json格式传输对象（含数组）
         * @return {string} 最终请求参数最终请求参数
         */
        function commonParamGetter(paramObj, paramMode) {
            if (loadValve == 'INIT') {
                loadValve = 'FORBIDDEN';
            }
            else if (loadValve == 'FORBIDDEN') {
                throw new Error('' 
                    + '一个snippet中的第一个请求不能并发，请调整报表设计。' 
                    + '在第一请求返回后再发出其他请求。'
                );
            }

            var o = {};
            extend(o, externalParam, paramObj);
            o.reportTemplateId = reportTemplateId;

            // o._REQ_KEY = reqKey || '';
            // if (diEvent) {
            // 
            // }

            return stringifyParam(o, paramMode);
        };

        /** 
         * 通用参数更新方法
         *
         * @public
         * @return {Object} options 参数
         * @return {Object} options.reportTemplateId 后台模板id
         */
        commonParamGetter.update = function (options) {
            // 后台的约定：无论何时，
            // 总是以reprotTemplateId这个名字进行 传参 和 回传。
            var rTplId = options && options.reportTemplateId || null;
            if (rTplId) {
                loadValve = 'OPEN';
                reportTemplateId = rTplId;
            }
            else if (loadValve != 'OPEN') {
                loadValve = 'INIT';
            }
        };

        /** 
         * 得到当前reportTemplateId
         *
         * @public
         * @return {string} 当前reportTemplateId
         */
        commonParamGetter.getReportTemplateId = function () {
            return reportTemplateId;
        };

        return commonParamGetter;
    };

    /**
     * 请求参数变为string
     * null和undefined会被转为空字符串
     * 可支持urlencoding
     * 
     * @public
     * @param {Object} paramObj 请求参数封装
     *      key为参数名，
     *      value为参数值，{string}或者{Array.<string>}类型   
     * @param {Object=} options 参数
     * @param {string=} options.paramMode 什么格式传输，值可为：
     *      'NORMAL'（默认）：普通格式（数组使用aa=2&aa=3&aa=5的方式，不支持对象传输）；
     *      'JSON'：使用json格式传输对象（含数组）
     * @param {string=} options.suffix 参数名后缀
     * @return {Array.<string>} 请求参数数组
     */
    function stringifyParam(paramObj, options) {
        var paramArr = [];
        options = options || {};

        function pushParam(name, value) {
            paramArr.push(textParam(name) + '=' + textParam(value));
        }

        var name;
        var value;
        var i;

        for (name in paramObj) {
            value = paramObj[name];

            // paramMode为'JSON'，
            // 无论数组还是对象，都格式化成json传输
            if (isObject(value) 
                && (options.paramMode == 'JSON' || value[STRINGIFY_FLAG] == 'JSON')
            ) {
                // 格式化成json前清理
                delete value[STRINGIFY_FLAG];

                // 格式化成json
                pushParam(name, jsonStringify(value));

                // 格式化成json后恢复
                value[STRINGIFY_FLAG] = 1;
            }
            // 没有json化标志，则用传统方式处理
            else {
                if (isArray(value)) {
                    for (i = 0; i < value.length; i ++) {
                        pushParam(name, value[i]);
                    }
                }
                else {
                    pushParam(name, value);
                }
            }
        }

        return paramArr.join('&');
    };    

})();

/**
 * di.shared.model.CubeMetaModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    cube树原数据Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.model');

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
    var clone = xutil.object.clone;
    var stringToDate = xutil.date.stringToDate;
    var dateToString = xutil.date.dateToString;
    var textParam = xutil.url.textParam;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var travelTree = xutil.collection.travelTree;
    var XDATASOURCE = xui.XDatasource;

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * cube树原数据Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var CUBE_META_MODEL = 
            $namespace().CubeMetaModel = 
            inheritsObject(XDATASOURCE, constructor);
    var CUBE_META_MODEL_CLASS = 
            CUBE_META_MODEL.prototype;
  
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
     */
    function constructor() {
    }

    /**
     * @override
     */
    CUBE_META_MODEL_CLASS.init = function() {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    CUBE_META_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            INIT: URL('CUBE_META')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    CUBE_META_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            INIT: function(data) {
                this._aCubeForest = data['cubeTree'];
            }
        }
    );

    /**
     * 得到cube树转为的menu结构
     *
     * @public
     * @return {xutil.LinkedHashMap} selLine
     */
    CUBE_META_MODEL_CLASS.getMenuByCubeMeta = function() {
        var menuTree = { menuList: [] };
        var selMenuId;

        menuTree.menuList.push(
            {
                text: '报表类型',
                value: 1
            }
        );

        for (
            var i = 0, root, schemaName; 
            root = this._aCubeForest[i]; 
            i ++
        ) {
            schemaName = root['schemaName'];
            travelTree(
                root = clone(root['root']),
                function(node, options) {

                    node.value = node.nodeName;
                    node.text = node.caption || ' - ';
                    node.floatTree = [
                        {
                            text: node.caption,
                            value: String(Math.random()),
                            url: 'schemaName=' + schemaName,
                            children: [
                                {
                                    text: '创建表',
                                    value: String(Math.random()),
                                    url: 'di.console.editor.ui.OLAPEditor?reportType=TABLE&schemaName=' 
                                        + schemaName + '&cubeTreeNodeName=' + node.nodeName
                                },
                                {
                                    text: '创建图',
                                    url: 'di.console.editor.ui.OLAPEditor?reportType=CHART&schemaName=' 
                                        + schemaName + '&cubeTreeNodeName=' + node.nodeName
                                }
                            ]
                        }
                    ];
                },
                'children'
            );
            menuTree.menuList.push(root);
        }
        menuTree.selMenuId = 1;

        // FIXME
        // 临时增加：报表效果观看的入口
        menuTree.menuList.push(
            {
                text: '效果试验',
                value: 19999,
                url: 'di.console.editor.ui.ReportPreview'
            }
        );

        return { menuTree: menuTree };
    };

})();

/**
 * di.shared.model.DateModel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用模型] 时间数据模型
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.shared.model');

(function() {
    
    /* 外部引用 */
    var inheritsModel = ecui.inheritsModel, 
        XDATASOURCE = xui.XDatasource;
        
    /* 类型声明 */
    var DATE_MODEL = $namespace().DateModel = inheritsModel(XDATASOURCE);
    var DATE_MODEL_CLASS = DATE_MODEL.prototype;
        
    /**
     * 初始化当前值
     * @override
     */
    DATE_MODEL_CLASS.result = function(data) {
        this.businessData = true;
        this._nInitServerTime = parseInt(data.serverTime) || new Date().getTime();
        this._nServerTimeOffset = this._nInitServerTime - (new Date).getTime();
    };
    
    /**
     * 获得服务器的当前时间
     * 不保证准确的地方：
     * 1. 网路延迟没有考虑
     * 2. 如果用户在打开了网页后修改了客户端的系统时间，则此值会错误
     * @public
     * 
     * @return {Date} 当前时间
     */
    DATE_MODEL_CLASS.now = function() {
        var date = new Date();
        date.setTime(date.getTime() + this._nServerTimeOffset);
        return date;
    };
    
})();

/**
 * di.shared.model.DIChartModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    DI 图模型组件
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.model');

(function() {
    
    //------------------------------------------
    // 引用
    //------------------------------------------

    var URL = di.config.URL;
    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var logError = UTIL.logError;
    var getUID = xutil.uid.getUID;
    var XDATASOURCE = xui.XDatasource;

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * DI 图模型组件
     *
     * @class
     * @extends xui.XDatasource
     * @param {Function=} options.commonParamGetter      
     */
    var DI_CHART_MODEL = 
            $namespace().DIChartModel = 
            inheritsObject(XDATASOURCE, constructor);
    var DI_CHART_MODEL_CLASS = 
            DI_CHART_MODEL.prototype;

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
        /**
         * 图后台返回的原始数据
         *
         * @type {Object}
         * @private
         */
        this._oRawChartData = {};
        /**
         * 图前台显示的数据
         *
         * @type {Object}
         * @private
         */
        this._oChartData = {};
    }

    /**
     * @override
     */
    DI_CHART_MODEL_CLASS.init = function() {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_CHART_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            DATA: URL('OLAP_CHART_DATA'),
            X_DATA: URL('OLAP_CHART_X_DATA'),
            S_DATA: URL('OLAP_CHART_S_DATA'),
            S_ADD_DATA: URL('OLAP_CHART_S_ADD_DATA'),
            S_REMOVE_DATA: URL('OLAP_CHART_S_REMOVE_DATA'),
            OFFLINE_DOWNLOAD: URL('OLAP_CHART_OFFLINE_DOWNLOAD')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_CHART_MODEL_CLASS.businessKey = new XDATASOURCE.Set(
        {
            DATA: 'DI_CHART_MODEL_DATA_' + getUID(),
            X_DATA: 'DI_CHART_MODEL_X_DATA_' + getUID(),
            S_DATA: 'DI_CHART_MODEL_S_DATA_' + getUID(),
            S_ADD_DATA: 'DI_CHART_MODEL_S_ADD_DATA_' + getUID(),
            S_REMOVE_DATA: 'DI_CHART_MODEL_S_REMOVE_DATA_' + getUID(),
            OFFLINE_DOWNLOAD: 'DI_CHART_OFFLINE_DOWNLOAD_' + getUID()
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_CHART_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            DATA: doParam,
            X_DATA: doParam,
            S_DATA: doParam,
            S_ADD_DATA: doParam,
            S_REMOVE_DATA: doParam,
            OFFLINE_DOWNLOAD: function (options) {
                return this._fCommonParamGetter(
                    { mainTo: options.args.param.email }
                );
            }
        }
    );
    function doParam(options) {
        var param = options.args.param;
        
        if (param.uniqueName) {
            // 合适么？
            param.dimTags = param.uniqueName;
            delete param.uniqueName;
        }

        if (param.uniqueNames) {
            param.dimTagsList = param.uniqueNames;
            delete param.uniqueNames;
        }

        return this._fCommonParamGetter(param);
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_CHART_MODEL_CLASS.complete = new XDATASOURCE.Set(
        {
            DATA: doComplete,
            X_DATA: doComplete,
            S_DATA: doComplete,
            S_ADD_DATA: doComplete,
            S_REMOVE_DATA: doComplete,
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
    DI_CHART_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            DATA: doParse,
            X_DATA: doParse,
            S_DATA: doParse,
            S_ADD_DATA: doParse,
            S_REMOVE_DATA: doParse
        }
    );

    /**
     * 图数据解析
     *
     * @private
     */
    function doParse(data, ejsonObj, options) {
        try {
            var rawData = this._oRawChartData = data['reportChart'];

            // 解析图后台返回数据
            var chartData = {};

            // FIXME
            // 暂时所有datetime类型了都作date类型
            if (rawData.xAxisType == 'datetime') {
                rawData.xAxisType = 'date';
            }

            chartData.chartType = 'line';
            chartData.series = rawData.seriesData;
            chartData.xAxis = [
                {
                    type: rawData.xAxisType,
                    data: rawData.xAxisCategories
                }
            ];

            // y轴
            chartData.yAxis = [];
            if (rawData.yAxises) {
                for (var i = 0, ya; ya = rawData.yAxises[i]; i ++) {
                    chartData.yAxis.push(
                        {
                            // 数值的格式化
                            format: ya.format,
                            // 轴上的文字
                            title: ya.unitName ? { text: ya.unitName } : null
                        }
                    );
                }
            }

            this._oChartData = chartData;                    
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
    DI_CHART_MODEL_CLASS.error = new XDATASOURCE.Set(
        {
            DATA: doError,
            X_DATA: doError,
            S_DATA: doError,
            S_ADD_DATA: doError,
            S_REMOVE_DATA: doError
        }
    );

    /**
     * 数据错误处理
     *
     * @private
     */
    function doError(status, ejsonObj, options) {    
        this._oRawChartData = {};
        this._oChartData = {};
    }

    /**
     * 得到图数据
     *
     * @public
     * @return {Object} 图数据
     */
    DI_CHART_MODEL_CLASS.getChartData = function() {
        return this._oChartData;
    };

})();

/**
 * di.shared.model.DIFactory
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    工厂
 *           约定：
 *              各种组件的类型均从这里获取，不直接引用。
 *              全局实例从这里获取。
 *           
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.model');

(function () {



    //-------------------------------------------------------
    // 引用 
    //-------------------------------------------------------

    var UTIL = di.helper.Util;
    var DICT = di.config.Dict;
    var DIALOG = di.helper.Dialog;
    var xlang = xutil.lang;
    var xobject = xutil.object;
    var xurl = xutil.url;
    var isString = xlang.isString;
    var isArray = xlang.isArray;
    var isObject = xlang.isObject;
    var isFunction = xlang.isFunction;
    var isEmptyObj = xobject.isEmptyObj;
    var getByPath = xobject.getByPath;
    var objKey = xobject.objKey;
    var assign = xobject.assign;
    var extend = xobject.extend;
    var merge = xobject.merge;
    var clone = xobject.clone;
    var getUID = xutil.uid.getUID;
    var bind = xutil.fn.bind;
    var assert = UTIL.assert;
    var ecuiAddEventListener = UTIL.ecuiAddEventListener;
    var ecuiTriggerEvent = UTIL.ecuiTriggerEvent;
    var targetBlank = UTIL.targetBlank;
    var objProtoToString = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var arrayPush = Array.prototype.push;
    var isEcuiControl = UTIL.isEcuiControl;
    var evalJsonLogic = UTIL.evalJsonLogic;
    var stringifyParam = xurl.stringifyParam;
    var XOBJECT = xui.XObject;
    var COMMON_PARAM_FACTORY;
    var ARG_HANDLER_FACTORY;

    $link(function () {
        ARG_HANDLER_FACTORY = di.shared.arg.ArgHandlerFactory;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
    });

        



    //----------------------------------------------------------
    // 类型声明 
    //----------------------------------------------------------

    /**
     * Unit工厂
     * 
     * @usage
     *      单例，
     *      这样得到实例：var unitFactory = di.shared.model.DIFactory();
     */
    $namespace().DIFactory = function () {
        if (!instance) {

            instance = {
                installClz: installClz,
                getClz: getClz,
                addEntity: addEntity,
                removeEntity: removeEntity,
                createIns: createIns,
                mountInteractions: mountInteractions,
                mountInteraction: mountInteraction,
                getDIMethod: getDIMethod,
                getEntity: function (id, mode) {
                    return getEntity(id, mode == 'RAW' ? 'DEF' : mode);
                },
                findEntity: findEntity,
                forEachEntity: forEachEntity,
                createDIEvent: createDIEvent,
                getRef: getRef,
                mergeOpt: mergeOpt,
                setGlobalTemp: setGlobalTemp,
                getGlobalTemp: getGlobalTemp,
                setEventChannel: setEventChannel,
                getEventChannel: getEventChannel,
                setInteractMemo: setInteractMemo,
                getInteractMemo: getInteractMemo,
                rootSnippet: rootSnippet,
                isDIEvent: isDIEvent,
                setFuncAuth: setFuncAuth,
                INIT_EVENT_NAME: INIT_EVENT_NAME,
                INIT_EVENT_AGENT_ID: INIT_EVENT_AGENT_ID
            };
        }
        return instance;
    };





    //----------------------------------------------------------
    // 常量/内部变量
    //----------------------------------------------------------

    /**
     * 为实例挂载属性或方法时使用的前缀，
     * 以及一些隐含的引用名
     */
    var DI_ATTR_PREFIX = '\x06diA^_^';
    var DI_METHOD_PREFIX = '\x06diM^_^';
    var DI_DEF_TAG = '\x06diDef^_^';
    var DI_EVENT_AGENT_TAG = '\x06diEAgt^_^';
    var DI_EVENT_TAG = '\x06diEvt^_^';
    var DI_TMP_TAG = '\x06diTmp^_^';
    var DI_OPT_HOME_TAG = '\x06diOpt^_^';
    var DI_OPT_CACHE_TAG = '\x06diOpt_cache^_^';
    var DI_OPT_ID_TAG = '\x06diOpt_id^_^';
    var SEP = '\x06_';
    var INIT_EVENT_NAME = '\x06diEvt_init^_^';
    var INIT_EVENT_AGENT_ID = '\x06diEvtAgtId_init^_^';

    /**
     * clzType
     */
    var INS_CLZ_TYPE = [
        'SNIPPET',
        'COMPONENT',
        'VUI',   
        'VCONTAINER',
        'VPART'
    ];

    /**
     * 默认的vui adapter
     */
    var GENERAL_ADAPTER_METHOD_PATH = 'di.shared.adapter.GeneralAdapterMethod';
    var generalAdapterMethod;

    /**
     * DIFactory实例
     */
    var instance;

    /**
     * 库
     */
    var repository = {
        // 类库
        CLZ: {},

        // 各种实例库
        SNIPPET: {},
        SNIPPET_DEF: {},
        COMPONENT: {},
        COMPONENT_DEF: {},
        VUI: {},   
        VUI_DEF: {},   
        VCONTAINER: {},
        VCONTAINER_DEF: {},
        VPART: {},
        VPART_DEF: {}
    };

    /**
     * 根snippet
     */
    var rootSnippetId;

    /**
     * 对外事件通道
     */
    var eventChannel;

    /**
     * 设置或获取临时全局参数，参见setGlobalTemp
     */
    var globalTempData = {};

    /**
     * 功能权限key集合
     */
    var funcAuthKeys = {};



    //-----------------------------------------------------------------
    // 契约方法
    //-----------------------------------------------------------------

    /**
     * 调用挂载到各个实例上的di方法（如果找不到，则调用同名原有方法）
     * 挂载后，在实例中使用this.$di('someMethodName')调用挂载的方法
     * 如果调用时要传参，则为this.$di('someMethodName', arg1, arg2)
     * （PS：之所以没做成$di('someMethodName')(arg1, arg2)的样子，
     * 因为这样不好得到this）
     *
     * @param {string} methodName 方法名
     * @param {*...} args 调用参数
     */
    var $di = {
        INS: function (methodName, args) {
            return (
                // 寻找di挂载的方法
                this[DI_METHOD_PREFIX + methodName]
                // 如果找不到，则调用同名原有方法
                || this[methodName]
            ).apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );
        },
        DEF: function (methodName, args) {
            return DEF_CONTRACT_METHOD[methodName].apply(
                this,
                Array.prototype.slice.call(arguments, 1)
            );
        }
    };

    /**
     * 通用契约方法，用于注入
     */
    var COMMON_CONTRACT_METHOD = {
        start: function (options) {
            var opt = options[DI_TMP_TAG];
            this.$di('setId', opt.id);
            this.$di('setEl', opt.el);

            var def = getEntity(opt.id, 'DEF');
            if (opt.el && opt.el.style.display == 'none') {
                setDIAttr(this, 'styleDisplay', def.styleDisplay);
            }

            var func; 
            (func = getDIMethod(this, 'setTplMode')) 
                && func.call(this, opt.tplMode);
            (func = getDIMethod(this, 'setCommonParamGetter')) 
                && func.call(this, opt.commonParamGetter);
        },

        getDIFactory: function () {
            return instance;
        },

        getMethod: function (methodName) {
            return getDIMethod(this, methodName);
        },

        getDef: function () {
            return getEntity(
                COMMON_CONTRACT_METHOD.getId.call(this),
                'DEF'
            );
        },

        setId: function (id) {
            setDIAttr(this, 'id', id);
        },

        getId: function () {
            return getDIAttr(this, 'id');
            // return getAttrIncludeGlobal(this, 'id');
        },

        setEl: function (el) {
            setDIAttr(this, 'el', el);
        },

        getEl: function (id) {
            return getDIAttr(this, 'el');
        },

        setTplMode: function (tplMode) {
            setDIAttr(this, 'tplMode', tplMode);
        },

        getTplMode: function () {
            return getDIAttr(this, 'tplMode');
            // return getAttrIncludeGlobal(this, 'tplMode');
        },

        setCommonParamGetter: function (commonParamGetter) {
            setDIAttr(this, 'commonParamGetter', commonParamGetter);
        },

        getCommonParamGetter: function () {
            return getDIAttr(this, 'commonParamGetter');
        },

        getEventChannel: getEventChannel,

        diShow: function () {
            var def = this.$di('getDef');
            var el = this.$di('getEl');
            var styleDisplay = getDIAttr(this, 'styleDisplay');
            var hideByAuth = getDIAttr(this, 'hideByAuth');
            if (styleDisplay != null && !hideByAuth) {
                setDIAttr(this, 'styleDisplay', null);
                el.style.display = styleDisplay;
            }
        },

        diHide: function () {
            var el = this.$di('getEl');
            if (el && getDIAttr(this, 'styleDisplay') == null) {
                setDIAttr(this, 'styleDisplay', el.style.display);
                el.style.display = 'none';
            }
        },

        /**
         * 设置耳聋，聋则不收到任何事件
         * 
         * @param {boolean} isDeaf 是否耳聋
         * @param {string=} key 禁用者的标志，缺省则忽略
         */
        setDeaf: function (isDeaf, key) {
            var keyName = 'deaf';

            // 设置禁用，并记录objKey
            if (isDeaf) {
                objKey.add(this, key, keyName);
                setDIAttr(this, keyName, true);
            }
            // 所有key都清除了，或者未传key，才解除禁用
            else {
                objKey.remove(this, key, keyName);
                (key == null || objKey.size(this, keyName) == 0)
                    && setDIAttr(this, keyName, false);
            }
        },

        isDeaf: function () {
            return getDIAttr(this, 'deaf');
        },

        /**
         * 设置getValue禁用
         * 
         * @param {boolean} valueDisabled 是否getValue禁用
         * @param {string=} key 禁用者的标志，缺省则忽略
         */
        setValueDisabled: function (valueDisabled, key) {
            var keyName = 'valueDisabled';

            // 设置禁用，并记录objKey
            if (valueDisabled) {
                objKey.add(this, key, keyName);
                setDIAttr(this, keyName, true);
            }
            // 所有key都清除了，或者未传key，才解除禁用
            else {
                objKey.remove(this, key, keyName);
                (key == null || objKey.size(this, keyName) == 0) 
                    && setDIAttr(this, keyName, false);
            }
        },

        isValueDisabled: function () {
            return getDIAttr(this, 'valueDisabled');
        },

        getClzType: 'placeholder',

        /**
         * 解禁操作
         *
         * @protected
         * @param {string=} key 禁用者的标志
         */
        disable: function (key) {
            objKey.add(this, key);

            if (!getDIAttr(this, 'disabled')) {
                setDIAttr(this, 'disabled', true);
                this.disable && this.disable();
            }
        },

        /**
         * 禁用操作
         *
         * @protected
         * @param {string=} key 禁用者的标志，空则无条件解禁
         */
        enable: function (key) {
            objKey.remove(this, key);

            if (objKey.size(this) == 0 && getDIAttr(this, 'disabled')) {
                setDIAttr(this, 'disabled', false);
                this.enable && this.enable();
            }
        },

        /**
         * 得到opt或opt值的统一入口
         *
         * @public
         * @param {string} optName 如cfgOpt、baseOpt
         * @param {string=} attr 属性名，如果为空，则得到opt本身
         * @return {Object} 得到的opt
         */
        getOpt: function (optName, attr) {
            var def = getEntity(this.$di('getId'), 'RAW');
            return getOpt(def, optName, attr, { clone: true });
        },

        /**
         * 设置def的参数
         *
         * @public
         * @param {string} optName 如cfgOpt、baseOpt
         * @param {string} attr 属性名
         * @param {*} value 属性值
         */
        setOpt: function (optName, attr, value) {
            var def = getEntity(this.$di('getId'), 'RAW');
            setOpt(def, optName, attr, value);
        },

        /** 
         * @param {string} refName 如'vuiRef'，'vpartRef'
         * @param {string} refPath 引用定位路径，如'someAttr.some[4][5].some'
         * @param {string=} modee 值为'DEF'（默认）或者'INS'
         * @return {(Array.<Object>|Object)} ref的数组
         *      例如：vuiDef的内容为：
         *      {string} vuiDef.id ID
         *      {Object} vuiDef.clz 类
         *      {string} vuiDef.clzKey 类key
         *      {Object} vuiDef.initObject 初始化参数，可能为空
         */
        getRef: function (refName, refPath, mode) {
            return getRef(this, refName, refPath, mode)
        },

        /**
         * 为给定的事件使用事件代理。注册事件代理后，
         * 对此事件的addeventlistener和dispatch都只针对于代理，屏蔽了原生事件。
         * 此方法常用于vui的adapter。
         *
         * @public
         * @param {string=} eventName 事件名，缺省则对于全部事件都使用event agent
         */
        registerEventAgent: function (eventName) {
            registerEventAgent(this, eventName);
        },

        /**
         * 添加事件监听
         * 目前只支持XObject和ecui
         * 
         * @param {string} eventName 事件名
         * @param {Function} handler 事件处理函数
         * @param {Object} scope 域，handler执行时的this
         * @param {Object=} options 选项
         * @param {string=} options.interactionId interact的id
         * @param {string=} options.dispatcherId 触发event的di ins的id
         * @param {Function=} options.argHandler 参数转化函数，用于适配事件的参数
         *      输入为 {Array} 参数构成的数组
         *      输出为 {Array} 转化完成后的参数构成的数组
         *      注意argHandler如果要更改原参数对象的内容，需要新建副本，
         *      以免影响其他事件处理器的响应。
         * @param {Array} options.bindArgs 绑定的参数，总在最前面传入handler，
         *      但是不会传入argHandler
         * @param {boolean=} options.once handler是否只调用一次后就注销
         * @param {boolean=} options.dontClone 是否禁用clone。默认不禁用。
         *      clone的用意是，每次创建一个参数副本给事件处理器，
         *      防止事件处理修改了参数而影响其他事件处理器的调用，
         *      只有普通Object和Array和基本类型能被clone，否则抛置异常。
         * @param {(Function|boolean)=} checkDeaf 检查是否deaf，deaf则不响应事件
         *      默认是true，如果传false则不检查，如果传function则用此function检查
         * @param {string} options.viewDisableDef 视图禁用定义
         * @param {(Array|Object)=} options.rule 事件路径定义
         */
        addEventListener: function (
            eventName, handler, scope, options
        ) {
            assert(
                eventName && handler && scope, 
                'Event listener can not be empty.'
            );

            options = options || {};
            var argHandler = options.argHandler;
            var dontClone = options.dontClone;
            var once = options.once;
            var checkDeaf = options.checkDeaf;
            var bindArgs = options.bindArgs || [];
            var id = options.id;
            var dispatcherId = options.dispatcherId;
            var interactionId = options.interactionId;
            var viewDisableDef = options.viewDisableDef;
            var rule = options.rule;
            var eventMatchMode = options.eventMatchMode;
            var eventAgent = getEventAgentByName(this, eventName) || this;

            var newHandler = function () {
                // 耳聋则不响应事件
                if (checkDeaf !== false
                    && (isFunction(checkDeaf)
                            ? checkDeaf(scope)
                            : (scope && scope.$di && scope.$di('isDeaf'))
                    )
                ) {
                    return;
                }

                // 处理diEvent
                var diEvent = arguments[0];
                var args = Array.prototype.slice.call(
                    arguments,
                    isDIEvent(diEvent)
                        ? (
                            // diEvent或者由事件dispatch者传来
                            //（从而支持interactPath）
                            diEvent = cloneEvent(diEvent),
                            1
                        )
                        : (
                            // diEvent未传来，则在此处创建。
                            diEvent = createDIEvent(eventName),
                            0
                        )
                );
                // 注入触发事件的ins的diId
                setEventAttr(diEvent, 'dispatcherId', dispatcherId, true),
                setEventAttr(diEvent, 'interactionId', interactionId, true),
                diEvent.viewDisableDef = viewDisableDef;

                // 对interactionRule求值
                if (rule && !evalJsonLogic(
                        rule, 
                        bind(evalRule, null, diEvent)
                    )
                ) {
                    return;
                }

                // 克隆参数
                !dontClone && (args = argsClone(args));

                // 执行arg handler
                args = argHandler ? argHandler.call(scope, args) : args;

                // 设定interact memo
                scope.$di && setInteractMemo(scope, 'diEvent', diEvent);

                // 执行action
                var ret = handler.apply(scope, bindArgs.concat(args));

                // 清除interact memo
                scope.$di && setInteractMemo(scope, 'diEvent', void 0);

                return ret;
            };
            
            if (eventAgent instanceof XOBJECT) {
                eventAgent[once ? 'attachOnce' : 'attach'](eventName, newHandler);
            }
            else if (isEcuiControl(eventAgent)) {
                ecuiAddEventListener(eventAgent, eventName, newHandler, once);
            }

            options = null;
        },

        /**
         * 分发事件
         * 目前只支持XObject和ecui
         * 
         * @param {(string|DIEvent)} eventName 事件名（或者diEvent对象）
         * @param {Array} args 事件参数
         */
        dispatchEvent: function (eventName, args, options) {
            options = options || {};

            var eventAgent = getEventAgentByName(this, eventName) || this;

            // diEvent用以支持interactPath功能
            var diEvent;
            if (isDIEvent(eventName)) {

                // 这个限制，是为了保证：收到diEvent的eventHandler都是用$di('addEventListener')注册的
                // 因为diEvent要暗自用第一个参数传递，$di('addEventListener')注册的才能识别
                assert(
                    eventAgent != this,
                    '如果使用diEvent，必须先registerEventAgent。'
                );

                diEvent = eventName;
                eventName = diEvent.getEventName();
                // 暗自用第一个参数传递diEvent对象
                (args = args || []).splice(0, 0, diEvent);
            }

            if (eventAgent instanceof XOBJECT) {
                eventAgent.notify(eventName, args);
            }
            else if (isEcuiControl(eventAgent)) {
                ecuiTriggerEvent(eventAgent, eventName, null, args);
            }
        },

        /**
         * 因为功能权限而禁用vui, 此为默认行为，可重载改变
         * 
         * @public
         */
        funcAuthVerify: function () {
            var vuiSet = getMakeAttr(this, 'vuiSet');
            var vuiIns;
            var vuiDef;

            for (var refPathKey in vuiSet) {
                vuiIns = vuiSet[refPathKey];
                vuiDef = vuiIns.$di('getDef');
                if (// 如果vui配了funcAuth，则要检查查权限
                    vuiDef.funcAuth 
                    && !(vuiDef.funcAuth in funcAuthKeys)
                ) {
                    // 没权限禁用
                    vuiIns.$di('getEl').style.display = 'none';
                    setDIAttr(vuiIns, 'hideByAuth', true);
                }
            }
        },

        /** 
         * 创建VUI实例
         * 如果工厂里有VUI定义，则用工厂里的定义创建，
         * 否则返回空
         *
         * 例：在component中创建一个vui，
         *  这个vui本身是一个ecui控件，
         *  如果在模板中有定义，则用模板中定义的创建，
         *  否则使用ecui的$fastCreate创建：
         *      var options = { myAttr1: 1, myAttr2: 'yyy' };
         *      this._uSomeControl = this.$di 
         *          && this.$di('create', ['theVUINameInTpl', 1], options)
         *          || ecui.$fastCreate(ecui.ui.MyControl, mainEl, null, options);
         *
         * @param {string} refPath 引用定位路径，如'someAttr.some[4][5].some'
         * @param {Object=} options 被创建者需要的初始化参数
         * @return {Object} vui实例，如果创建失败则返回空
         */
        vuiCreate: function (refPath, options) {
            var def = this.$di('getRef', 'vuiRef', refPath, 'DEF');
            if (!def) { return null; }
            
            options = mergeOpt(
                def, 
                extend({}, options, { id: def.id, el: def.el }),
                'DATA_INIT'
            );

            // vuiSet用于component引用自身的vui
            var vuiSet = getMakeAttr(this, 'vuiSet');
            var vuiSetKey = makePathKey(refPath);

            assert(
                !vuiSet[vuiSetKey],
                'vui已经存在: refPath=' + refPath + ' vuiSetKey=' + vuiSetKey
            );

            // 设置默认值
            if (getOpt(def, 'cfgOpt', 'paramMode') == null) {
                setOpt(def, 'cfgOpt', 'paramMode', 'NORMAL');
            }

            // 得到适配器和适配方法
            var adptMethod = def.adapterMethod || {};
            var adpt = def.adapter && def.adapter(def, options) || {};

            // 创建实例
            var ins;
            if (adpt['create']) {
                ins = adpt['create'](def, options);
            }
            else if (adptMethod['create']) {
                ins = generalAdapterMethod[adptMethod['create']](def, options);
            }

            // 实例创建失败
            if (!ins) {
                return null;
            }

            // 绑定$di
            ins.$di = $di.INS;

            // 设置基本属性
            setDIAttr(ins, 'id', def.id);
            setDIAttr(ins, 'el', def.el);
            if (def.el && def.el.style.display == 'none') {
                setDIAttr(ins, 'styleDisplay', def.styleDisplay);
            }

            // 保存实例
            vuiSet[vuiSetKey] = ins;
            addEntity(ins, 'INS');

            // 拷贝adapter方法到实例上
            var setDataMethod;
            var methodName;
            for (methodName in adptMethod) {
                if (methodName != 'create') {
                    setDIMethod(
                        ins, 
                        methodName, 
                        generalAdapterMethod[methodName]
                    );
                }
            }
            for (methodName in adpt) {
                if (methodName != 'create') {
                    setDIMethod(
                        ins, 
                        methodName, 
                        adpt[methodName]
                    );
                }
            }

            // 绑定默认方法
            addVUISetDataMethod(ins);
            addVUIGetValueMethod(ins);
            addVUIInitMethod(ins);
            addDisposeMethod(ins, vuiSet, vuiSetKey);

            return ins;
        },

        /**
         * component获得自己的vui实例
         * 
         * @public
         * @param {string} refPath 引用定位路径，如'someAttr.some[4][5].some'
         * @return {Object} vui实例
         */
        vuiGet: function (refPath) {
            return getMakeAttr(this, 'vuiSet')[makePathKey(refPath)];
        },

        /** 
         * 创建VPART实例
         * 如果工厂里有VPART定义，则用工厂里的定义创建，
         * 否则返回空
         *
         * @param {string} refPath 引用定位路径，如'someAttr.some[4][5].some'
         * @param {Object=} options 被创建者需要的初始化参数
         * @return {Object} vpart实例，如果创建失败则返回空
         */
        vpartCreate: function (refPath, options) {
            var def = this.$di('getRef', 'vpartRef', refPath, 'DEF');
            if (!def) { return null; }

            options = mergeOpt(
                def, 
                extend({}, options, { id: def.id, el: def.el }),
                'DATA_INIT'
            );

            // vpartSet用于component引用自身的vpart
            var vpartSet = getMakeAttr(this, 'vpartSet');
            var vpartSetKey = makePathKey(refPath);

            assert(
                !vpartSet[vpartSetKey],
                'vpart已经存在: refPath=' + refPath + ' vpartSetKey=' + vpartSetKey
            );

            // 创建实例
            var ins = new def.clz(options);

            // 实例创建失败
            if (!ins) {
                return null;
            }

            // 绑定$di
            ins.$di = $di.INS;

            // 设置基本属性
            setDIAttr(ins, 'id', def.id);
            setDIAttr(ins, 'el', def.el);
            if (def.el && def.el.style.display == 'none') {
                setDIAttr(ins, 'styleDisplay', def.styleDisplay);
            }

            // 保存实例
            vpartSet[vpartSetKey] = ins;
            addEntity(ins, 'INS');

            // 绑定默认方法
            addDisposeMethod(ins, vpartSet, vpartSetKey);

            return ins;
        },

        /**
         * vcontainer获得自己的vpart实例
         * 
         * @public
         * @param {string} refPath 引用定位路径，如'someAttr.some[4][5].some'
         * @return {Object} vui实例
         */
        vpartGet: function (refPath) {
            return getMakeAttr(this, 'vpartSet')[makePathKey(refPath)];
        },

        /**
         * Component的getValue的统一实现，
         * 遍历每个vui，调用其getValue方法，
         * 用每个vui的name作为key，组成返回值对象。
         * （如果没有name，则不会被getValue），
         * 如果要控制某个vui的getValue，可自己实现vuiGetValue方法
         * 
         * @public
         * @return {Object} value
         */
        getValue: function () {
            var def = this.$di('getDef');
            var valueDisabledMode = def.valueDisabledMode;

            var cmptValDisabled = this.$di('isValueDisabled');
            if (cmptValDisabled && valueDisabledMode == 'NORMAL') {
                return null;
            }

            var value = {};
            var vuiSet = getMakeAttr(this, 'vuiSet');
            var vuiIns;
            var vuiDef;
            var vuiValue;

            if (this.getValue) {
                value = this.getValue() || {};
            }

            var valDisabled;
            for (var refPathKey in vuiSet) {
                vuiIns = vuiSet[refPathKey];
                vuiDef = vuiIns.$di('getDef');
                valDisabled = cmptValDisabled || vuiIns.$di('isValueDisabled');

                if (vuiDef.name == null 
                    || (valDisabled && valueDisabledMode == 'NORMAL')
                ) { 
                    continue; 
                }

                value[vuiDef.name] = valDisabled && valueDisabledMode == 'DI'
                    ? null
                    : (
                        isObject(vuiValue = vuiIns.$di('getValue')) 
                            ? COMMON_PARAM_FACTORY.markParamMode(
                                vuiValue,
                                getOpt(vuiDef, 'cfgOpt', 'paramMode')
                            )
                            : vuiValue
                    );
            }

            return value;
        },

        /**
         * COMPONENT中，在interaction时得到event，
         * 其中含有disableFunc和enableFunc，
         * 调用则会执行disable和enable.
         * 用于在异步行为时做用户操作屏蔽。
         * 只能在interaction的action开始执行时调用
         * 
         * @public
         * @return {Object} event 
         *      {Function} event.disableFunc
         *      {Function} event.enableFunc
         */
        getEvent: function () {
            var event = getInteractMemo(this, 'diEvent');
            /*
            // 使用sync view disable配置代替
            var visDef = event.viewDisableDef;
            if (visDef) {
                var key = 'INTERACTION_VIEW_DISABLE_' + this.$di('getId');
                event.viewDisable = {
                    disable: makeViewDisableFunc(visDef, 'disable', key),
                    enable: makeViewDisableFunc(visDef, 'enable', key)
                }
            };
            */
            return event;
        },

        /**
         * 执行view disable
         * 
         * @protected
         * @param {string} actName 值为disable或者enable
         * @param {string} datasourceId 
         */
        syncViewDisable: function (actName, datasourceId) {
            assert(
                actName == 'enable' || actName == 'disable',
                'Wrong actName: ' + actName
            );
            var def = this.$di('getDef');
            var key = 'ASYNC_VIEW_DISABLE_' + this.$di('getId');
            var vdDef = (def.sync || {}).viewDisable;
            doViewDisable(
                vdDef == 'ALL'
                    ? vdDef
                    : (isObject(vdDef) && vdDef[datasourceId]),
                actName,
                key
            );
        },

        /**
         * 报表跳转
         * 
         * @protected
         * @param {string} linkBridgeType 跳转类型，值可为'I'(internal)或者'E'(external)
         * @param {string} url 目标url
         * @param {string} param 参数
         */
        linkBridge: function (linkBridgeType, url, param) {
            // 报表引擎内部处理，直接跳转
            if (linkBridgeType == 'I') {
                targetBlank(url + '?' + param);
            }
            // 给di-stub发事件，由引用报表引擎的系统来跳转
            else if (linkBridgeType == 'E') {
                eventChannel && eventChannel.triggerEvent(
                    'linkbridge', 
                    [url, param]
                );
            }
        }        
    };

    var DEF_CONTRACT_METHOD = {
        getDIFactory: COMMON_CONTRACT_METHOD.getDIFactory,
        getMethod: function (methodName) {
            return DEF_CONTRACT_METHOD[methodName];
        },
        setId: function (id) {
            this.id = id;
        },
        getId: function () {
            return this.id;
        },
        getOpt: COMMON_CONTRACT_METHOD.getOpt,
        setOpt: COMMON_CONTRACT_METHOD.setOpt,
        getRef: COMMON_CONTRACT_METHOD.getRef
    };





    //----------------------------------------------------------------------
    // rule相关
    //----------------------------------------------------------------------

    /**
     * 处理interaction规则
     * 
     * @private 
     * @param {Object} diEvent 
     * @param {Array.<Object>} atomRule
     *      结构例如：
     *      { operator: 'includes', interactionIds: ['aaaaa-rid1', 'aaaa-rid2' ]}
     * @return {boolean} 判断结果
     */
    function evalRule(diEvent, atomRule) {
        // 目前支持的operator：
        var ruleMap = { 
            includes: evalRuleIncludesExcludes, 
            excludes: evalRuleIncludesExcludes, 
            equals: evalRuleEquals
        };        

        assert(
            atomRule.operator in ruleMap,
            'Illegal rule: ' + atomRule.operator
        );

        return ruleMap[atomRule.operator](diEvent, atomRule);
    }

    /**
     * 处理interaction规则 incudes excludes
     * 
     * @private 
     * @param {Object} diEvent 
     * @param {Array.<Object>} atomRule
     *      结构例如：
     *      { operator: 'includes', interactionIds: ['aaaaa-rid1', 'aaaa-rid2' ]}
     * @return {boolean} 判断结果
     */
     function evalRuleIncludesExcludes(diEvent, atomRule) {
        if (!diEvent) { return false; }

        var rSet = { includes: {}, excludes: {} };

        for (var j = 0; j < (atomRule.interactionIds || []).length; j ++) {
            rSet[atomRule.operator][atomRule.interactionIds[j]] = 1;
        }

        var path = getEventAttr(diEvent, 'interactPath');
        for (var i = 0, e, iid; e = path[path.length - i - 1]; i ++) {
            iid = getEventAttr(e, 'interactionId');

            if (iid in rSet.excludes) {
                return false;
            }

            if (rSet.includes[iid]) {
                delete rSet.includes[iid];
            }
        }

        if (!isEmptyObj(rSet.includes)) {
            return false;
        }

        return true;

        // TODO
        // 按路径模式匹配的代码（如下类似），后续有需求再加
        // for (
        //     var i = 0, e, eDef; 
        //     eDef = interactPathDef[dlen - i - 1], e = realPath[rlen - i - 1];
        //     i ++
        // ) {
        //     if (!eDef) {
        //         if (eventMatchMode == 'EXACT') { return false; }
        //         else { break; }
        //     }

        //     if (getEventAttr(e, 'dispatcherId') != eDef.dispatcherId
        //         || getEventAttr(e, 'eventName') != eDef.name
        //     ) {
        //         return false;
        //     }
        // }
    }

    /**
     * 处理interaction规则 equals
     * 
     * @private 
     * @param {Object} diEvent 
     * @param {Array.<Object>} atomRule
     *      结构例如：
     *      { atomRule: 'equals', argHandlers: [ ... ], value: 1234 }
     * @return {boolean} 判断结果
     */
     function evalRuleEquals(diEvent, atomRule) {
        var val = parseArgHandlerDesc(atomRule).call(null, [])[0];
        return val == atomRule.value;
     }





    //-------------------------------------------------------------------
    // DI Event
    //-------------------------------------------------------------------

    /**
     * DI事件
     * 
     * @private
     * @param {string=} eventName 事件名
     * @param {Object=} options 参数
     * @param {string=} options.dispatcherId 触发event的di ins的id
     * @param {string=} options.interactionId interaction的id
     * @param {string=} options.isClone 是否是clone
     * @param {Array.<Object>=} options.interactPath 事件路径
     * @return {Function} event实例
     */
    function createDIEvent(eventName, options) {
        options = options || {};

        var evt = function (eName) {
            return createDIEvent(
                eName,
                // interactPath上所有event对象都引用本interactPath
                { interactPath: evt[DI_EVENT_TAG].interactPath }         
            );
        }

        // event对象中保存数据的地方
        var repo = evt[DI_EVENT_TAG] = {
            eventName: eventName,
            dispatcherId: options.dispatcherId,
            interactionId: options.interactionId,
            interactPath: (options.interactPath || []).slice()
        };

        // 最新一个event总在interactPath末尾
        var path = repo.interactPath;
        options.isClone
            ? path.splice(path.length - 1, 1, evt)
            : path.push(evt);

        // event对象的方法
        extend(evt, DI_EVENT_METHODS);

        return evt;
    };

    var DI_EVENT_METHODS = {
        /** 
         * 得到事件名
         * 
         * @public
         * @this {Object} diEvent对象
         * @return {string} 事件名
         */
        getEventName: function () {
            return this[DI_EVENT_TAG].eventName;
        },

        /** 
         * 得到interactionId
         * 
         * @public
         * @this {Object} diEvent对象
         * @return {string} interactionIdId
         */
        getInteractionId: function () {
            return this[DI_EVENT_TAG].interactionId;
        }

        /**
         * 是否为用户触发的事件中的第一个事件
         * 
         * @public
         */
        // isUserFirst: function () {
        //     var path = this[DI_EVENT_TAG].interactPath;
        //     return path && path[0] && path[0].getEventName() != INIT_EVENT_NAME
        // },

        /**
         * 是否为自然初始化的事件中的第一个有效事件
         * 
         * @public
         */
        // isInitFirst: function () {
        //     var path = this[DI_EVENT_TAG].interactPath;
        //     if (path 
        //         && path[0] 
        //         && path[0].getEventName() == INIT_EVENT_NAME
        //         && path[1] === this
        //     ) {
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // }
    };

    /**
     * 得到副本
     * 
     * @public
     * @this {Event} 对象
     * @param {Object} event 事件对象
     * @return {string} 事件
     */
    function cloneEvent(event) {
        var repo = event[DI_EVENT_TAG];
        return createDIEvent(
            repo.eventName,
            {
                dispatcherId: repo.dispatcherId,
                interactionId: repo.interactionId,
                interactPath: repo.interactPath,
                isClone: true
            }
        );
    }

    /**
     * 得到event对象的属性值
     *
     * @private
     */
    function getEventAttr(event, attrName) {
        return event[DI_EVENT_TAG][attrName];
    }

    /**
     * 设置event对象的属性值
     *
     * @private
     */
    function setEventAttr(event, attrName, value, checkExist) {
        if (checkExist && event[DI_EVENT_TAG][attrName] !== void 0) {
            throw new Error('请使用diEvent("newEventName")创建新的diEvent实例');
        }
        event[DI_EVENT_TAG][attrName] = value;
    }

    /**
     * 是否为event对象
     *
     * @private
     */
    function isDIEvent(obj) {
        return isObject(obj) && obj[DI_EVENT_TAG];
    }





    //--------------------------------------------------------------------
    // DI Opt 相关方法
    //--------------------------------------------------------------------

    /**
     * 初始化opt
     * 现在支持的opt定义方式：
     *      (1) def[optName] ==> Object
     *      (2) def[optName + 's'] ==> Array
     *
     * @private
     * @param {Object} src 源
     * @param {string} optName opt名
     * @return {Object} opt
     */
    function initializeOpt(def, optName) {

        // 创建optCache
        var optCacheHome = def[DI_OPT_CACHE_TAG];
        if (!optCacheHome) {
            optCacheHome = def[DI_OPT_CACHE_TAG] = {};
        }
        optCacheHome[optName] = {};

        // 创建opt存储位置
        var optHome = def[DI_OPT_HOME_TAG];
        if (!optHome) {
            optHome = def[DI_OPT_HOME_TAG] = {};
        }

        var opt = optHome[optName] = def[optName] || {};
        var opts = optHome[optName + 's'] = def[optName + 's'] || [];

        // 删除def[optName]防止直接得到（只允许通过getOpt方法得到）
        def[optName] = null;
        def[optName + 's'] = null;

        // 生成id，用于optCache
        opt[DI_OPT_ID_TAG] = 'DI_OPT_' + getUID('DI_OPT');
        for (var i = 0; i < opts.length; i ++) {
            opts[i][optName][DI_OPT_ID_TAG] = 'DI_OPT_' + getUID('DI_OPT');
        }
    }

    /**
     * 提取定义的opt
     *
     * @private
     * @param {Object} src 源
     * @param {string} optName opt名
     * @param {string=} attr 属性名，如果为空，则得到opt本身
     * @param {Obejct=} options 参数
     * @param {Object=} options.diEvent di事件
     * @param {boolean=} options.clone 是否返回副本，默认是false
     * @return {Object} opt
     */
    function getOpt(def, optName, attr, options) {
        options = options || {};

        var optHome = def[DI_OPT_HOME_TAG];
        var optCache = def[DI_OPT_CACHE_TAG][optName];
        var opt = optHome[optName];
        var opts = optHome[optName + 's'];
        var diEvent = options.diEvent;
        var i;
        var o;
        var ret;
        var matchedOpt = [];
        var matchedIds = [];
        var evalRuleFunc = bind(evalRule, null, diEvent);

        matchedOpt.push(opt);
        matchedIds.push(opt[DI_OPT_ID_TAG]);

        // 根据rule找到匹配的opt
        for (i = 0; i < opts.length; i ++) {
            if ((o = opts[i]) 
                && o.rule 
                && o[optName]
                && evalJsonLogic(o.rule, evalRuleFunc)
            ) {
                matchedOpt.push(o[optName]);
                matchedIds.push(o[optName][DI_OPT_ID_TAG]);
            }
        }

        var cacheKey = matchedIds.join(SEP);

        // 优先取缓存，否则merge
        if (!(ret = optCache[cacheKey])) {
            ret = optCache[cacheKey] = {};
            for (i = 0; i < matchedOpt.length; i ++) {
                merge(
                    ret, 
                    matchedOpt[i], 
                    { overwrite: true, clone: 'WITHOUT_ARRAY' }
                );
            }
        }

        if (attr != null) {
            ret = ret[attr];
        }

        return options.clone
            ? clone(ret, { exclusion: [DI_OPT_CACHE_TAG] })
            : ret;
    }

    /**
     * 设置opt
     *
     * @private
     * @param {Object} src 源
     * @param {string} optName 如cfgOpt、dataOpt
     * @param {string} attr 属性名
     * @param {*} value 属性值
     */
    function setOpt(def, optName, attr, value) {
        def[DI_OPT_HOME_TAG][optName][attr] = value;

        // 清除optcache
        def[DI_OPT_CACHE_TAG][optName] = {};
    }

    /** 
     * 融合参数
     *
     * @public
     * @param {Object} def 目标实例定义
     * @param {Object} invokerData 调用者提供的options
     * @param {string} optType 可为'INIT', 'DATA'
     * @param {Object=} options
     * @param {Object=} options.forceData 最高等级的参数
     * @param {Object=} options.diEvent di事件
     */
    function mergeOpt(def, invokerData, optType, options) {
        def = def || {};
        options = options || {};
        var ret = {};

        // 使用了clone模式的merge，但是为减少消耗，不clone array
        var mOpt = { overwrite: true, clone: 'WITHOUT_ARRAY' };
        var mOpt2 = extend({}, mOpt, { exclusion: [DI_OPT_ID_TAG] });
        var optopt = { diEvent: options.diEvent };

        var clzDef = getClz(def.clzKey) || {};
        var clzDataOpt = getOpt(clzDef, 'dataOpt', null, optopt);
        var dataOpt = getOpt(def, 'dataOpt', null, optopt);

        merge(ret, clzDataOpt, mOpt2);
        merge(ret, invokerData, mOpt);
        merge(ret, dataOpt, mOpt2);

        if (optType == 'DATA_SET') {
            merge(ret, getOpt(def, 'dataSetOpt', null, optopt), mOpt2);
        }
        else if (optType == 'DATA_INIT') {
            merge(ret, getOpt(def, 'dataInitOpt', null, optopt), mOpt2);
        }
        else {
            throw new Error('error optType:' + optType);
        }

        options.forceData && 
                merge(ret, options.forceData, mOpt);

        return ret;
    }






    //-----------------------------------------------------------------------
    // Arg Handler 相关
    //-----------------------------------------------------------------------

    /**
     * 解析argHandler定义
     * 
     * @param {Object} container 定义argHandler的容器
     * @param {Object=} scope 可缺省
     * @private
     */
    function parseArgHandlerDesc(container, scope) {
        var argH;
        var argHs = [];

        if (argH = container.argHandler) {
            argHs.push(argH);
        }
        if (argH = container.argHandlers) {
            argHs.push.apply(argHs, argH);
        }

        for (var i = 0; i < argHs.length; i ++) {
            argHs[i] = [scope].concat(argHs[i]);
        }

        return ARG_HANDLER_FACTORY.apply(null, argHs);
    }






    //-----------------------------------------------------------------------
    // DI Factory方法
    //-----------------------------------------------------------------------

    /**
     * 对注册的类实例化并enhance
     * 一般在类加载完后调用此方法，
     * 如果相应的类并未加载完，则忽略
     *
     * @private
     */
    function installClz() {
        var clzKey;
        var clzDef;
        var proto;

        generalAdapterMethod = getByPath(
            GENERAL_ADAPTER_METHOD_PATH,
            $getNamespaceBase()
        );

        for (clzKey in DICT.CLZ) {
            repository['CLZ'][clzKey] = clzDef = clone(DICT.CLZ[clzKey]);

            // 得到类实例
            if (clzDef.clzPath 
                && (clzDef.clz = getByPath(clzDef.clzPath, $getNamespaceBase()))
            ) {
                proto = clzDef.clz.prototype;

                // 绑定$di
                proto.$di = $di.INS;

                // 添加约定方法
                mountMethod(
                    proto,
                    [
                        'start',
                        'getDIFactory',
                        'setId',
                        'getId',
                        'getDef',
                        'isDeaf',
                        'setDeaf',
                        'setEl',
                        'getEl',
                        'disable',
                        'enable',
                        'diShow',
                        'diHide',
                        'setValueDisabled',
                        'isValueDisabled',
                        'addEventListener',
                        'dispatchEvent',
                        'registerEventAgent',
                        'getOpt',
                        'setOpt',
                        'getRef'
                    ],
                    COMMON_CONTRACT_METHOD
                );

                if (clzDef.clzType == 'COMPONENT') {
                    mountMethod(
                        proto,
                        [
                            'setTplMode',
                            'getTplMode',
                            'vuiCreate',
                            'vuiGet',
                            'getValue',
                            'getEvent',
                            'getEventChannel',
                            'getCommonParamGetter',
                            'setCommonParamGetter',
                            'linkBridge',
                            'syncViewDisable',
                            'funcAuthVerify'                     
                        ],
                        COMMON_CONTRACT_METHOD
                    );
                }                

                if (clzDef.clzType == 'VCONTAINER') {
                    mountMethod(
                        proto,
                        [
                            'vpartCreate',
                            'vpartGet'
                        ],
                        COMMON_CONTRACT_METHOD
                    );
                }

                // 赋予类型
                setDIMethod(
                    proto, 
                    'getClzType', 
                    (function (clzType) {
                        return function () { return clzType; }     
                    })(clzDef.clzType)
                );
            }

            // 得到adapter实例
            clzDef.adapterPath && (
                clzDef.adapter = 
                    getByPath(clzDef.adapterPath, $getNamespaceBase())
            );

            // 选项初始化
            initializeOpt(clzDef, 'dataOpt');
            initializeOpt(clzDef, 'dataInitOpt');
            initializeOpt(clzDef, 'dataSetOpt');
            initializeOpt(clzDef, 'valueGetOpt');
            initializeOpt(clzDef, 'cfgOpt');
        }
    }

    /**
     * 为类挂载di的方法。如果类中已经有此方法，则不挂载。
     *
     * @private
     * @param {Object} proto 类的prototype
     * @param {Array.<string>} methodNameList 方法名
     * @param {Array.<string>} methodSet 方法集合
     */
    function mountMethod(proto, methodNameList, methodSet) {
        for (
            var i = 0, methodName, prefixedMethodName; 
            methodName = methodNameList[i]; 
            i ++
        ) {
            setDIMethod(proto, methodName, methodSet[methodName]);
        }
    }

    /**
     * vui本身要求提供setData方法，
     * vui提供的setData意为重新设置完全数据并渲染
     * 这里的setData方法又为vui的setData方法的加了一层包装，
     * 用于将模板里自定义的dataOpt与传入的options融合
     * （融合顺序依照mergeOpt方法的定义）。
     * Component对vui进行操作时须调用此setData方法，
     * （如：this._uSomeVUi.$di('setData', data);）
     * 而非直接调用vui本身提供的setData方法。
     * 
     * @private
     * @param {Object} ins 目标对象
     */
    function addVUISetDataMethod(ins) {
        var oldMethod = getDIMethod(ins, 'setData');

        setDIMethod(
            ins,
            'setData',
            oldMethod
                /**
                 * @param {*} data
                 * @param {Object=} options 参数
                 * @param {*=} options.forceData 最高merge优先级的data
                 * @param {Object=} options.diEvent di事件
                 */
                ? function (data, options) {
                    options = options || {};
                    data = mergeOpt(
                        this.$di('getDef'), data, 'DATA_SET', options
                    );
                    // TODO 
                    // isSilent的统一支持
                    return oldMethod.call(this, data);
                }
                // 如果没有提供，表示不需要，则给予空方法
                : new Function()
        );
    }

    /**
     * vui的getValue方法的封装
     * 
     * @private
     * @param {Object} ins 目标对象
     */
    function addVUIGetValueMethod(ins) {
        var oldMethod = getDIMethod(ins, 'getValue');

        setDIMethod(
            ins,
            'getValue',
            oldMethod 
                ? function () {
                    return this.$di('isValueDisabled')
                        ? null
                        : oldMethod.call(this);
                }
                // 如果没有提供，表示不需要，则给予空方法
                : new Function()
        );
    }

    /**
     * vui的init方法的封装
     * 
     * @private
     * @param {Object} ins 目标对象
     */
    function addVUIInitMethod(ins) {
        var oldMethod = getDIMethod(ins, 'init');

        setDIMethod(
            ins,
            'init',
            function () {
                mountInteractions(ins);
                oldMethod && oldMethod.call(this);
            }
        );
    }

    /**
     * 包装的(vui和vpart的）析构方法
     * 
     * @private
     * @param {Object} ins 目标对象
     */
    function addDisposeMethod(ins, vSet, vSetKey) {
        var oldMethod = getDIMethod(ins, 'dispose');

        setDIMethod(
            ins,
            'dispose',
            function () {
                delete vSet[vSetKey];
                removeEntity(ins);
                oldMethod && oldMethod.call(this);
                this.$di('setEl', null);
            }
        );
    }

    /**
     * 创建di实例
     *
     * @private
     * @param {Object} def 实例定义
     * @param {Object} options 初始化参数
     * @param {string} options.tplMode （默认为'FROM_SNIPPET'）
     * @param {string} options.commonParamGetter
     * @return {Object} 创建好的实例
     */
    function createIns(def, options) {   
        options = options || {};
        // 为了下面new时能在构造方法中访问这些数据，
        // 所以放到globalTemp中
        var opt = {
            id: def.id,
            el: def.el,
            // 标志html片段从snippet中取，而不是组件自己创建
            tplMode: options.tplMode || 'FROM_SNIPPET',
            commonParamGetter: options.commonParamGetter
        };
        opt[DI_TMP_TAG] = extend({}, opt);

        // DI_FACTORY().setGlobalTemp('DI_DEF_FOR_NEW', opt);
        var ins = new def.clz(
            mergeOpt(def, extend(options, opt), 'DATA_INIT')
        );
        // DI_FACTORY().setGlobalTemp('DI_DEF_FOR_NEW', null);

        // ins.$di('setId', def.id);
        // ins.$di('setEl', def.el);
        // ins.$di('setTplMode', def.tplMode);

        addEntity(ins);

        return ins;
    }    

    /**
     * 根据配置，挂载多个interaction
     *
     * @public
     * @param {Object} ins 实例
     */
    function mountInteractions(ins) {   
        var def = ins.$di('getDef');

        // 模板中定义的事件绑定(interaction)
        if (!def.interactions) { return; }

        for (
            var i = 0, interact; 
            interact = def.interactions[i]; 
            i ++
        ) {
            mountInteraction(ins, interact);
        }        
    }

    /**
     * 根据配置，挂载interaction
     *
     * @public
     * @param {Object} ins 实例
     */
    function mountInteraction(ins, interact) {  
        var def = ins.$di('getDef');

        var events = [];
        interact.event && events.push(interact.event);
        interact.events && arrayPush.apply(events, interact.events);

        for (var j = 0, evt, triggerIns; j < events.length; j ++) {
            evt = events[j];
            triggerIns = evt.triggerIns || getEntity(evt.rid, 'INS');

            // 设置这个断言的部分原因是，vui事件不保证能提供diEvent
            assert(
                triggerIns.$di('getDef').clzType != 'VUI',
                '不允许监听vui事件'
            );

            if (!triggerIns) { return; }

            triggerIns.$di(
                'addEventListener', 
                evt.name,
                getDIMethod(ins, interact.action.name),
                ins,
                {
                    interactionId: interact.id,
                    dispatcherId: evt.rid,
                    argHandler: parseArgHandlerDesc(interact, ins),
                    once: interact.once,
                    viewDisableDef: interact.viewDisable,
                    rule: evt.rule 
                        ? ['and', interact.rule, evt.rule] 
                        : interact.rule
                }
            );
        }
    }

    /**
     * 根据引用路径（refPath）得到引用。
     * 路径可直接指向对象树叶节点，也可以指向途中的节点。
     *
     * @public
     * @param {Object} obj 目标INS或者DEF
     * @param {string} refName 如'vuiRef'，'vpartRef'
     * @param {string} refPath 引用定位路径，如'someAttr.some[4][5].some'
     * @param {string=} mode 值为'DEF'（默认）或者'INS'
     * @param {Object=} options 选项
     * @param {boolean=} options.flatReturn 
     *      true则返回一个数组，里面是所有目标实例，
     *      false则返回源结构，里面的id会替换为目标实例（默认）。
     * @return {(Array.<Object>|Object)} ref数组或者ref项
     */
    function getRef(obj, refName, refPath, mode, options) {
        options = options || {};

        var refBase = (
            getEntity(obj.$di('getId'), 'DEF') || {}
        )[refName];

        if (!refBase) { return null; }

        return findEntity(
            getByPath(refPath, refBase), 
            mode, 
            { isClone: true, flatReturn: options.flatReturn }
        );
    }

    /**
     * 设置方法，如果没有此方法的话
     *
     * @private
     * @param {Object} o 类的prototype或者实例
     * @param {string} methodName 方法名
     * @param {Function} method 方法
     * @param {boolean} force 是否强制覆盖，默认true
     */    
    function setDIMethod(o, methodName, method, force) {
        force == null && (force = true);
        var prefixedMethodName = DI_METHOD_PREFIX + methodName;
        if (force || !o[prefixedMethodName]) {
            o[prefixedMethodName] = method;
        }
    }      

    /**
     * 获取方法
     *
     * @private
     * @param {Object} o 类的prototype或者实例
     * @param {string} methodName 方法名
     * @return {Function} method 方法
     */    
    function getDIMethod(o, methodName) {
            // 寻找di挂载的方法
        return o[DI_METHOD_PREFIX + methodName]
            // 如果找不到，则调用同名原有方法
            || o[methodName];
    }

    /**
     * 得到类
     *
     * @public
     * @param {string} clzKey 类的key
     * @return {Object} clzDef 类定义
     *      clzDef.clz 类
     *      clzDef.clzKey 类key
     *      clzDef.clzPath 类路径
     *      clzDef.adapterPath 适配器路径
     *      clzDef.adapter 适配器
     *      clzDef.dataOpt 初始化参数
     */
    function getClz(clzKey) {
        return repository['CLZ'][clzKey];
    }

    /**
     * 添加实体（ins或def）
     *
     * @public
     * @param {Object} o 实例或实例定义
     * @param {string} mode 'INS'（默认）, 'DEF'
     * @return {DIFactory} 本身
     */
    function addEntity(o, mode) {
        if (mode == 'DEF') {
            if (o.clzType && o.id) {
                
                // 装上clz
                var clzDef = getClz(
                    o.clzKey || DICT.DEFAULT_CLZ_KEY[o.clzType]
                ); 
                o = merge(clone(clzDef), o);

                // def标志
                o[DI_DEF_TAG] = true;

                // 赋予$di
                o.$di = $di.DEF;

                // 选项初始化
                initializeOpt(o, 'dataOpt');
                initializeOpt(o, 'dataInitOpt');
                initializeOpt(o, 'dataSetOpt');
                initializeOpt(o, 'cfgOpt');

                // 保存
                repository[o.clzType + '_DEF'][o.id] = assign({}, o);
            }
        }
        else {        
            repository[o.$di('getClzType')][o.$di('getId')] = o;
        }
        return instance;
    }    

    /**
     * 删除实例
     *
     * @public
     * @param {Object} o 实例或实例定义
     */
    function removeEntity(o) {
        if (o[DI_DEF_TAG]) {
            delete repository[o.clzType + '_DEF'][o.id];
        }
        else {        
            delete repository[o.$di('getClzType')][o.$di('getId')];
        }
    }

    /**
     * 得到实例
     *
     * @private
     * @param {string} id 实例id
     * @param {string} mode 'INS', 'DEF'（默认）, 'RAW'（原定义对象，内部使用）
     * @return {Object} 实例
     */
    function getEntity(id, mode) {
        var suffix = mode == 'INS' ? '' : '_DEF';
        var o;
        var ret;
        var optCache;

        for (var i = 0, clzType; clzType = INS_CLZ_TYPE[i]; i ++) {
            if (clzType != 'CLZ' 
                && (o = repository[clzType + suffix][id])
            ) {
                if (mode == 'INS' || mode == 'RAW') {
                    return o;
                }
                // mode为'DEF'则返回副本
                else {
                    ret = clone(o, { exclusion: [DI_OPT_CACHE_TAG] });
                    // 不克隆optCache节省开销
                    ret[DI_OPT_CACHE_TAG] = o[DI_OPT_CACHE_TAG];
                    return ret;
                }
            }
        }
        return null;
    }

    /**
     * 为对象装填ins或def，或者返回装填好的副本
     *
     * @public
     * @param {(Object|Array)} target 目标对象中，
     *      只可以含有Object或Array或实例id
     * @param {string} mode 'INS', 'DEF'（默认）
     * @param {Object=} options 选项
     * @param {boolean=} options.flatReturn 
     *      true则返回一个数组，里面是所有目标实例，
     *      false则返回源结构，里面的id会替换为目标实例（默认）。
     * @param {boolean=} options.isClone 是否是clone模式，
     *      true则不修改target，返回值是新对象，
     *      false则修改target，返回target。（默认）
     * @return {Object} target 源对象
     */
    function findEntity(target, mode, options) {
        options = options || {}
        var result;
        var i;
        var flatRet = options.flatReturn ? [] : null;

        if (isArray(target)) {
            result = options.isClone ? [] : target;
            for (i = 0; i < target.length; i ++) {
                target.hasOwnProperty(i)
                    && (result[i] = findEntity(target[i], mode));
            }
        }
        else if (isObject(target)) {
            result = options.isClone ? {} : target;
            for (i in target) {
                target.hasOwnProperty(i)
                    && (result[i] = findEntity(target[i], mode));
            }
        } 
        else {
            result = getEntity(target, mode);
            flatRet && flatRet.push(result);
        }

        return flatRet ? flatRet : result;
    }

    /**
     * 遍历unit
     *
     * @protected
     * @param {(string|Array)} clzType 单值或数组，
     *      如果是数组，则顺序遍历
     * @param {Function} callback 回调，参数为
     *              {Object} def
     *              {Object} ins
     *              {string} id
     */
    function forEachEntity(clzType, callback) {
        clzType = isString(clzType) 
            ? [clzType] : (clzType || []);

        for (var i = 0, c, repoIns, repoDef; c = clzType[i]; i ++) {
            var repoDef = repository[c + '_DEF'];
            var repoIns = repository[c];
            for (var id in repoDef) {
                repoDef[id] && callback(repoDef[id], repoIns[id], id);
            }
        }
    }

    /**
     * 设置di私有的属性
     * 
     * @private
     * @param {Object} o 目标ins
     * @param {string} attrName 属性名
     * @param {*} attrValue 属性值
     */
    function setDIAttr(o, attrName, attrValue) {
        if (o && attrName != null) {
            o[DI_ATTR_PREFIX + attrName] = attrValue;
        }
    }

    /**
     * 得到di私有的属性
     * 
     * @private
     * @param {Object} o 来源ins
     * @param {string} attrName 属性名
     * @return {*} attrValue 属性值
     */
    function getDIAttr(o, attrName) {
        if (o && attrName != null) {
            return o[DI_ATTR_PREFIX + attrName];
        }
        return null;
    }

    /**
     * 获得对象，如果没有就创建
     *
     * @param {Object} di实例
     * @param {string} attrName
     * @param {*=} makeValue 如果没有，则创建的值，默认为{}
     * @private
     */
    function getMakeAttr(ins, attrName, makeValue) {
        if (makeValue === void 0) {
            makeValue = {};
        }
        var value = getDIAttr(ins, attrName);
        if (value === void 0) {
            setDIAttr(ins, attrName, value = makeValue);
        }
        return value;
    }

    /**
     * 得到di私有的属性，如果没有则从global中取
     * 专用于new创建时
     * 
     * @private
     * @param {Object} o 来源对象
     * @param {string} attrName 属性名
     * @return {*} attrValue 属性值
     */
    function getAttrIncludeGlobal(o, attrName) {
        var ret = getDIAttr(o, attrName);
        if (ret == null) {
            ret = (getGlobalTemp('DI_DEF_FOR_NEW') || {})[attrName];
        }
        return ret;
    }

    /**
     * 设置事件通道
     *
     * @public
     * @param {Object} ec 事件通道 
     */
    function setEventChannel(ec) {
        eventChannel = ec;
    }

    /**
     * 得到事件通道
     *
     * @public
     * @param {Object} 事件通道 
     */
    function getEventChannel() {
        return eventChannel;
    }

    /**
     * 设置或获取临时全局参数
     * 除非一些不好处理的问题，
     * 否则不建议使用！
     * 
     * @public
     * @param {string} key 使用者标志
     * @param {*} data
     */
    function setGlobalTemp(key, data) {
        globalTempData[key] = data;
    }

    /**
     * 设置或获取临时全局参数
     * 除非一些不好处理的问题，
     * 否则不建议使用！
     * 
     * @public
     * @param {string} key 使用者标志
     * @return {*} data
     */
    function getGlobalTemp(key) {
        return globalTempData[key];
    }

    /**
     * refPath变成唯一的key
     *
     * @private
     */
    function makePathKey(refPath) {
        return refPath.replace(/[\]\s]/g, '').replace(/\[/g, '.');
    }

    /**
     * 得到或创建事件代理
     *
     * @private
     */
    function registerEventAgent(obj, eventName) {
        var agent = obj[DI_EVENT_AGENT_TAG];
        if (!agent) {
            agent = obj[DI_EVENT_AGENT_TAG] = new XOBJECT();
            agent.eventNameMap = {};
        }
        if (eventName != null) {
            agent.eventNameMap[eventName] = 1;
        }
        else {
            agent.eventNameAll = 1;
        }
    }

    function getEventAgentByName(obj, eventName) {
        var agent = obj[DI_EVENT_AGENT_TAG];
        if (agent 
            && (
                agent.eventNameAll
                || agent.eventNameMap[eventName]
            )
        ) {
            return agent;
        }
    }

    function rootSnippet(id) {
        id && (rootSnippet = id) || (id = rootSnippet);
        var def = getEntity(id, 'DEF');
        assert(def, 'no def. id=' + id);
        return def;
    }

    /*
    function makeViewDisableFunc(disDef, actName, key) {
        if (!disDef) { return null; }

        var repCmpt = repository['COMPONENT'];
        var repCtnr = repository['VCONTAINER'];

        if (disDef == 'ALL') {
            disDef = [];
            for (id in repCmpt) { disDef.push(id); }
            for (id in repCtnr) { disDef.push(id); }
        }

        return function () {
            for (var i = 0, ins, id; i < disDef.length; i ++) {
                id = disDef[i];
                ins = repCmpt[id] || repCtnr[id];
                ins && ins.$di(actName, key);
            }
        }
    }*/

    function setFuncAuth(auth) {
        if (!auth) {
            return;
        }
        funcAuthKeys = {};
        for (var i = 0; i < (auth || []).length; i ++) {
            funcAuthKeys[auth[i]] = 1;
        }
    }

    function doViewDisable(disDef, actName, key) {
        if (!disDef) { return null; }

        var repCmpt = repository['COMPONENT'];
        var repCtnr = repository['VCONTAINER'];

        if (disDef == 'ALL') {
            disDef = [];
            for (id in repCmpt) { disDef.push(id); }
            for (id in repCtnr) { disDef.push(id); }
        }

        for (var i = 0, ins, id; i < disDef.length; i ++) {
            id = disDef[i];
            ins = repCmpt[id] || repCtnr[id];
            ins && ins.$di(actName, key);
        }
    }

    function setInteractMemo(ins, attr, value) {
        var memo = getDIAttr(ins, 'interactMemo');
        if (!memo) {
            setDIAttr(ins, 'interactMemo', memo = {});
        }
        if (value !== void 0) {
            memo[attr] = value;
        }
        else {
            delete memo[attr];
        }
    }

    function getInteractMemo(ins, attr) {
        var memo = getDIAttr(ins, 'interactMemo');
        return memo ? memo[attr] : void 0;
    }

    /**
     * 参数clone
     * 如果不为可clone的类型，则抛出异常
     *
     * @private
     * @param {*} args
     * @return {*} clone结果
     */
    function argsClone(args) {
        var result;
        var i;
        var len;
        var objStr = objProtoToString.call(args);
        var isArr;

        if (objStr == '[object Date]') {
            result = new Date(args.getTime());
        }
        else if (
            objStr == '[object Function]' 
            || objStr == '[object RegExp]'
        ) {
            result = args;
        }
        else if (
            // array也用下面方式复制，从而非数字key属性也能被复制
            (isArr = objStr == '[object Array]')
            // 对于其他所有Object，先检查是否是可以拷贝的object，
            // 如果不是，抛出异常，防止隐含错误
            || args === Object(args)
        ) {
            result = isArr ? [] : {};
            !isArr && checkObjectClonable(args);
            for (i in args) {
                if (args.hasOwnProperty(i)) {
                    result[i] = argsClone(args[i]);
                }
            }
        } 
        else {
            result = args;
        }
        return result;
    }

    /**
     * 检查对象是否可以拷贝。
     * 如果不可以，抛出异常；
     */
    function checkObjectClonable(obj) {
        var clonable = true;

        // 排除DOM元素
        if (Object.prototype.toString.call(obj) != '[object Object]'
            // 但是在IE中，DOM元素对上一句话返回true，
            // 所以使用字面量对象的原型上的isPrototypeOf来判断
            || !('isPrototypeOf' in obj)) {
            clonable = false;
        }

        // 试图排除new somefunc()创建出的对象
        if (// 如果没有constructor则通过
            obj.constructor
            // 有constructor但不在原型上时通过
            && !hasOwnProperty.call(obj, 'constructor') 
            // 用isPrototypeOf判断constructor是否为Object对象本身
            && !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')
        ) {
            clonable = false;
        }

        if (!clonable) {
            throw new Error('Object can not be clone: ' + obj);
        }
    };    

})();
/**
 * di.shared.model.DIFormModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    DI 表单模型组件
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
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
    var logError = UTIL.logError;
    var getUID = xutil.uid.getUID;
    var XDATASOURCE = xui.XDatasource;

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * DI 表单模型组件
     *
     * @class
     * @extends xui.XDatasource
     * @param {Function=} options.commonParamGetter      
     */
    var DI_FORM_MODEL = 
            $namespace().DIFormModel = 
            inheritsObject(XDATASOURCE, constructor);
    var DI_FORM_MODEL_CLASS = 
            DI_FORM_MODEL.prototype;

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
        this._fCommonParamGetter = options.commonParamGetter
    }

    /**
     * @override
     */
    DI_FORM_MODEL_CLASS.init = function () {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_FORM_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            DATA: URL('FORM_DATA'),
            ASYNC_DATA: URL('FORM_ASYNC_DATA')
        }
    );    

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_FORM_MODEL_CLASS.businessKey = new XDATASOURCE.Set(
        {
            DATA: 'DI_FORM_MODEL_DATA_' + getUID(),
            ASYNC_DATA: 'DI_FORM_MODEL_ASYNC_DATA_' + getUID()
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_FORM_MODEL_CLASS.complete = new XDATASOURCE.Set(
        {
            DATA: doComplete,
            ASYNC_DATA: doComplete
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
    DI_FORM_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            DATA: function (options) {
                return this._fCommonParamGetter(options.args.param); 
            },
            ASYNC_DATA: function (options) {
                return this._fCommonParamGetter(options.args.param);
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_FORM_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            DATA: function (data, ejsonObj, options) {
                this._oInitData = (data || {}).params || {};
                return data;
            },
            ASYNC_DATA: function (data, ejsonObj, options) {
                return (data || {}).params || {};
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_FORM_MODEL_CLASS.error = new XDATASOURCE.Set(
        {
            DATA: function (status, ejsonObj, options) {
                // TODO
            },
            ASYNC_DATA: function (status, ejsonObj, options) {
                // TODO
            }
        }
    );

    /** 
     * 得到初始化数据
     *
     * @public
     * @return {Object} 初始化数据
     */
    DI_FORM_MODEL_CLASS.getInitData = function () {
        return this._oInitData;
    };    

})();

/**
 * di.shared.model.DITableModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    DI 表模型组件
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
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
    var DI_TABLE_MODEL = 
            $namespace().DITableModel = 
            inheritsObject(XDATASOURCE, constructor);
    var DI_TABLE_MODEL_CLASS = 
            DI_TABLE_MODEL.prototype;

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
    DI_TABLE_MODEL_CLASS.init = function () {};

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_TABLE_MODEL_CLASS.url = new XDATASOURCE.Set(
        {
            DATA: URL('OLAP_TABLE_DATA'),
            DRILL: URL('OLAP_TABLE_DRILL'),
            LINK_DRILL: URL('OLAP_TABLE_LINK_DRILL'),
            SORT: URL('OLAP_TABLE_SORT'),
            CHECK: URL('OLAP_TABLE_CHECK'),
            SELECT: URL('OLAP_TABLE_SELECT'),
            OFFLINE_DOWNLOAD: URL('OLAP_TABLE_OFFLINE_DOWNLOAD')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_TABLE_MODEL_CLASS.businessKey = new XDATASOURCE.Set(
        {
            DATA: 'DI_TABLE_MODEL_DATA_' + getUID(),
            DRILL: 'DI_TABLE_MODEL_DRILL_' + getUID(),
            LINK_DRILL: 'DI_TABLE_MODEL_LINK_DRILL_' + getUID(),
            SORT: 'DI_TABLE_MODEL_SORT_' + getUID(),
            CHECK: 'DI_TABLE_MODEL_CHECK_' + getUID(),
            SELECT: 'DI_TABLE_MODEL_SELECT_' + getUID(),
            OFFLINE_DOWNLOAD: 'DI_TABLE_OFFLINE_DOWNLOAD_' + getUID()
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_TABLE_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            DATA: function (options) {
                return this._fCommonParamGetter(options.args.param);
            },
            DRILL: function (options) {
                return createLinkDrillParam.call(this, options);
            },
            LINK_DRILL: function (options) {
                return createLinkDrillParam.call(this, options);
            },
            SORT: function (options) {
                var param = options.args.param;
                return this._fCommonParamGetter(
                    {
                        uniqueName: param.uniqueName,
                        sortType: param.currentSort
                    }
                );
            },
            CHECK: function (options) {
                return this._fCommonParamGetter(
                    { uniqueName: options.args.param.uniqueName }
                );
            },
            SELECT: function (options) {
                return this._fCommonParamGetter(
                    { uniqueName: options.args.param.uniqueName }
                );
            },
            OFFLINE_DOWNLOAD: function (options) {
                return this._fCommonParamGetter(
                    { mailTo: options.args.param.email }
                );
            }
        }
    );

    /**
     * 创建链接式下钻参数
     *
     * @private
     */
    function createLinkDrillParam(options) {
        var param = options.args.param;
        var paramObj = {};
        
        paramObj['uniqueName'] = param.uniqueName;
        paramObj['lineUniqueName'] = param.lineUniqueName;

        paramObj['action'] = param.action;
        // FIXME
        // 现在先写死，不存在上表头下钻
        paramObj['drillAxisName'] = 'ROW';
        
        return this._fCommonParamGetter(paramObj);
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_TABLE_MODEL_CLASS.complete = new XDATASOURCE.Set(
        {
            DATA: doComplete,
            DRILL: doComplete,
            LINK_DRILL: doComplete,
            SORT: doComplete,
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
    DI_TABLE_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            DATA: doParse,
            DRILL: doParse,
            LINK_DRILL: doParse,
            SORT: doParse,
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
            var retData = {};
            var tableData = retData.tableData = data['pivottable'];

            // 控件数据
            tableData.datasource = tableData.dataSourceRowBased;

            var i;
            var j;
            var o;
            var colspan;
            var headLength;

            // 控件列定义(colDefine)构造
            var firstLine = tableData['colFields'][0];
            var rawColDefine = tableData.colDefine;
            var colDefine = [];
            for (i = 0; i < firstLine.length; i ++) {
                o = firstLine[i];
                if (!o) { continue; }
                colspan = o.colspan || 1;
                for (j = 0; j < colspan; j ++) {
                    colDefine.push({ width:1 });
                }
            }
            headLength = colDefine.length - rawColDefine.length;
            for (i = 0; i < rawColDefine.length; i ++) {
                extend(colDefine[i + headLength], rawColDefine[i]);
            }
            tableData.colDefine = colDefine;

            // 由于之前不合适的接口制定：colspan和rowspan没有占位，导致坐标对不齐，
            // 这引来了很多处理上的麻烦（前后台都麻烦）。
            // 但是后台暂时没精力改了（因为有一定牵连）。
            // 所以这里对colFields和rowHeadFields强制加上占位，使其对其。
            fixColFields(tableData, headLength);
            fixRowHeadFields(tableData, headLength);

            // 排序
            var sortType; 
            var sortKeyMap = { // 前后台接口映射
                ASC: 'asc',
                DESC: 'desc',
                NONE: 'none'
            }
            for (i = 0; i < colDefine.length; i ++) {
                if (sortType = colDefine[i].currentSort) {
                    colDefine[i].orderby = sortKeyMap[sortType];
                }
            }

            // 行选中
            retData.tableData.rowCheckMax = data['rowCheckMax'];
            retData.tableData.rowCheckMin = data['rowCheckMin'];

            // 面包屑
            var breadcrumb = data['mainDimNodes'] || [];
            if (breadcrumb) {
                for (i = 0; o = breadcrumb[i]; i ++) {
                    o.text = o['showName'];
                    o.value = i;
                    o.url = null;
                    if (i == breadcrumb.length - 1) {
                        o.disabled = true;
                    }
                    if (i == 0) {
                        o.isFirst = true;
                    }
                }
            }
            retData.breadcrumbData = {
                datasource: breadcrumb,
                maxShow: 5,
                hidePosPercent: 0.5
            }

            retData.pageInfo = {
                totalRecordCount: data['totalSize'],
                currRecordCount: data['currentSize']
            }

            // retData.tableDataOverlap = getDataOverlap(
            //     tableData, 
            //     options.args.viewStateWrap
            // );
            
            return retData;
        }
        catch (e) {
            logError(e);
            this.$goError();
        }
    }

    /**
     * 得到保存的状态，用于覆盖
     *
     * @protected
     */
    // function getDataOverlap(tableData, viewStateWrap) {
    //     if (!tableData || !viewStateWrap) { return; }

    //     var dataOverlap = {};

    //     // 行选择
    //     var rowCheckedMap = viewStateWrap.rowCheckedMap;
    //     if (rowCheckedMap) {
    //         var rowChecked = [];
    //         for (var i = 0, rhd; rhd = tableData.rowDefine[i]; i ++) {
    //             (rhd.uniqueName in rowCheckedMap) && rowChecked.push(i);
    //         }

    //         dataOverlap.rowChecked = rowChecked;
    //     }

    //     return dataOverlap;
    // };

    /**
     * 对colFields进行占位补齐，使用空对象{}进行标志。
     * 约定的法则：
     *      只有左上角第一行有rowspan（前面得到了headLength），
     *      其他地方不考虑rowspan，
     *      并且呈树状展开
     * 
     * @private
     */
    function fixColFields(tableData, headLength) {
        var i;
        var j;
        var k;
        var o;
        var line;
        var rawLine;
        var colspan;
        var colFields = [];

        for (i = 0; rawLine = tableData.colFields[i]; i ++) {
            colFields.push(line = []);
            if (i > 0) {
                // 左上角区域，后台只给第一行，后面的加占位
                for (k = 0; k < headLength; k ++) {
                    line.push({});
                }
            }
            for (j = 0; j < rawLine.length; j ++) {
                line.push(o = rawLine[j]);
                colspan = (o || {}).colspan || 1;
                for (k = 1; k < colspan; k ++) {
                    // 占位
                    line.push({});
                }
            }
        }
        tableData.colFields = colFields;
    }

    /**
     * 对rowHeadFields进行占位补齐，使用空对象{}进行标志。
     * 约定的法则：
     *      不存在colspan，
     *      只有rowspan，
     *      并且呈树状展开
     *
     * @private
     */
    function fixRowHeadFields(tableData, headLength) {
        var i;
        var j;
        var line;
        var rawLine;
        var rowHeadFields = [];

        for (i = 0; rawLine = tableData.rowHeadFields[i]; i ++) {
            rowHeadFields.push(line = []);
            // 前面补齐
            for (j = 0; j < headLength - rawLine.length; j ++) {
                line.push({});
            }
            for (j = 0; j < rawLine.length; j ++) {
                line.push(rawLine[j]);
            }
        }
        tableData.rowHeadFields = rowHeadFields;
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DI_TABLE_MODEL_CLASS.error = new XDATASOURCE.Set(
        {
            DATA: function (status, ejsonObj, options) {
                this._oTableData = {};
                this._oBreadcrumbData = {};
            }
            // TODO
        }
    );

})();

/**
 * di.shared.model.DimSelectModel  
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    维度选择model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.model');

(function() {
    
    //------------------------------------------
    // 引用
    //------------------------------------------

    var FORMATTER = di.helper.Formatter;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var URL = di.config.URL;
    var UTIL = di.helper.Util;
    var createDom = ecui.dom.create;
    var getStyle = ecui.dom.getStyle;
    var extend = xutil.object.extend;
    var getByPath = xutil.object.getByPath;
    var inheritsObject = xutil.object.inheritsObject;
    var q = xutil.dom.q;
    var g = xutil.dom.g;
    var bind = xutil.fn.bind;
    var assign = xutil.object.assign;
    var hasValue = xutil.lang.hasValue;
    var stringToDate = xutil.date.stringToDate;
    var dateToString = xutil.date.dateToString;
    var textParam = xutil.url.textParam;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var arrayProtoPush = Array.prototype.push;    
    var download = UTIL.download;
    var logError = UTIL.logError;
    var UI_CONTROL = ecui.ui.Control;
    var XDATASOURCE = xui.XDatasource;
        
    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * 维度选择Model
     *
     * @class
     * @extends xui.XDatasource
     */
    var DIM_SELECT_MODEL = 
            $namespace().DimSelectModel = 
            inheritsObject(XDATASOURCE, constructor);
    var DIM_SELECT_MODEL_CLASS = 
            DIM_SELECT_MODEL.prototype;
  
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造方法
     *
     * @private
     * @param {Object} options 
     */
    function constructor(options) {
        /**
         * hierachy的根，子女节点是维度树
         *
         * @type {Array.<Object>}
         * @private
         */
        this._oHierarchyRoot;
        /**
         * 当前hierachy的维度树
         *
         * @type {Array.<Object>}
         * @private
         */
        this._oCurrDimTree;
        /**
         * 维度名
         *
         * @type {string} 
         * @private
         */
        this._sDimName;
        /**
         * schema名
         *
         * @type {string} 
         * @private
         */
        this._sSchemaName;
        /**
         * 维度类型, 目前可能为'TIME'或'NORMAL'
         *
         * @type {string} 
         * @private
         */
        this._sDimType;
        /**
         * 每个hierarchy的层级列表, key为hierarchy的name
         *
         * @type {Map} 
         * @private
         */
        this._oLevelMap;
    }

    var URL_MAP = {
        TREE: {
            TABLE: URL('DIM_TREE_TABLE'),
            CHART: URL('DIM_TREE_CHART')
        },
        SAVE: {
            TABLE: URL('DIM_SELECT_SAVE_TABLE'),
            CHART: URL('DIM_SELECT_SAVE_CHART')
        }
    };

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DIM_SELECT_MODEL_CLASS.url = function(options) {
        return URL_MAP[options.datasourceId][options.args.reportType];
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DIM_SELECT_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            // 请求维度树参数
            TREE: function(options) {
                var paramArr = this.$createBaseParam(options);
                if (options.args.dimMode == 'TIME') {
                    paramArr.push('isTimeDim=true');
                }
                return paramArr.join('&');
            },

            // 保存维度树当前选中参数
            SAVE: function(options) {
                var args = options.args;
                var paramArr = this.$createBaseParam(options);

                paramArr.push(
                    'hierarchyName=' + textParam(this._oCurrDimTree.name)
                );
                arrayProtoPush.apply(
                    paramArr,
                    wrapArrayParam(args.treeSelected, 'selectedNodes')
                );
                arrayProtoPush.apply(
                    paramArr,
                    wrapArrayParam(args.levelSelected, 'levelUniqueNames')
                );

                if (args.dimMode == 'TIME') {
                    // 暂时只支持范围选择
                    var start = args.timeSelect.start
                        ? dateToString(args.timeSelect.start) : '';
                    var end = args.timeSelect.end 
                        ? dateToString(args.timeSelect.end) : start;
                    paramArr.push('startDay=' + start);
                    paramArr.push('endDay=' + end);
                }
                
                return paramArr.join('&');
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    DIM_SELECT_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            // 请求维度树后台返回解析
            TREE: function(data, ejsonObj, options) {
                try {
                    // timeType表示静态动态时间等，后面加. 0代表默认
                    var timeType = data['timeType'];
                    // 时间选择
                    this._oTimeSelect = data['timeSelects'] || {};

                    var dimTree = data['dimTree'];
                    var root = this._oHierarchyRoot = dimTree['dimTree'];
                    // 暂时都使用第一个hierarchy，后续再添加多hierarchy的支持
                    this._oCurrDimTree = root['children'][0];
                    this._oLevelMap = dimTree['hierarchyLevelUniqueNames'];
                    this._sDimName = dimTree['dimName'];
                    this._sSchemaName = dimTree['schemaName'];
                    this._sDimType = dimTree['isTimeDim'] ? 'TIME' : 'NORMAL';
                }
                catch (e) {
                    logError(e);
                    this.$goError();
                }
            }
        }
    );

    /**
     * 得到当前维度树
     * 
     * @public
     * @return {Object} 维度树
     */
    DIM_SELECT_MODEL_CLASS.getCurrDimTree = function() {
        return this._oCurrDimTree;
    };

    /**
     * 得到当前时间选择
     * 
     * @public
     * @return {Object} 时间选择
     */
    DIM_SELECT_MODEL_CLASS.getTimeSelect = function() {
        return this._oTimeSelect;
    };

    /**
     * 得到当前层级列表
     * 
     * @public
     * @return {Array.<Object>} 层级列表
     */
    DIM_SELECT_MODEL_CLASS.getCurrLevelList = function() {
        return (this._oLevelMap && this._oCurrDimTree)
            ? this._oLevelMap[this._oCurrDimTree.name]
            : null;
    };

    /**
     * 构造公用参数
     * 
     * @protected
     * @param {Object} options sync参数
     * @return {Array.<string>} 公用参数
     */
    DIM_SELECT_MODEL_CLASS.$createBaseParam = function(options) {
        var args = options.args;
        var paramArr = [];

        if (args.commonParamGetter) {
            paramArr.push(args.commonParamGetter());
        }
        paramArr.push(
            'dimSelectName=' + textParam(args.uniqName)
        );
        paramArr.push(
            'from=' + textParam(args.selLineName)
        );

        return paramArr;
    };

})();

/**
 * di.shared.model.GlobalMenuManager
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用模型] 全局菜单管理
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.shared.model');

/**
 * [外部注入 (@see util.ref)]
 * globalMenu
 */
(function() {
    
    /* 外部引用 */
    var inheritsModel = ecui.inheritsModel;
    var bind = xutil.fn.bind;
    var getByPath = xutil.object.getByPath;
    var XDATASOURCE = xui.XDatasource;
        
    /* 类型声明 */
    var GLOBAL_MENU_MANAGER = $namespace().GlobalMenuManager = 
            inheritsModel(XDATASOURCE);
    var GLOBAL_MENU_MANAGER_CLASS = GLOBAL_MENU_MANAGER.prototype;
    
    /**
     * 初始化
     * @public
     */
    GLOBAL_MENU_MANAGER_CLASS.init = function() {
    };
    
    /**
     * 析构
     * @protected
     */
    GLOBAL_MENU_MANAGER_CLASS.$dispose = function() {
        GLOBAL_MENU_MANAGER.superClass.$dispose.call(this);
    };
    
    /**
     * 获得当前所选
     * @public
     * 
     * @return {Object} 当前选择
     *          {string} menuId 菜单ID
     *          {string} menuName 菜单名
     *          {string} menuPage 额外数据
     *          {string} menuUrl 菜单URL
     */
    GLOBAL_MENU_MANAGER_CLASS.getSelected = function() {
        !this.businessData && this.sync();
        return this.businessData && this.businessData.selMenu;
    };
    
    /**
     * 获得菜单数据
     * @public
     * 
     * @return {Array} 菜单数据
     */
    GLOBAL_MENU_MANAGER_CLASS.getMenuData = function() {
        !this.businessData && this.sync();
        return this.businessData && this.businessData.menuList;
    }
    
    /**
     * 获得当前页面根控件类型
     * @public
     * 
     * @return {Constructor#ecui.ui.Control} 当前页面根控件类型
     */
    GLOBAL_MENU_MANAGER_CLASS.getControlClass = function() {
        var classPath = (this.getSelected() || {}).menuPage;
        return classPath ? getByPath(classPath) : null;
    };
    
    /**
     * 获得数据
     * @protected
     */
    GLOBAL_MENU_MANAGER_CLASS.parse = function(data) {
        // 从GLOBAL_MODEL中获取数据，并保存在此
        var globalMenu = data && data.globalMenu || {};
        this.businessData = {menuList: globalMenu.menuList, selMenu: globalMenu.selMenu};
        return this.businessData;
    };
    
    /**
     * 顶层页跳转
     * @public
     */
    GLOBAL_MENU_MANAGER_CLASS.changeMenu = function(args) {
        // to be continued ...
    };
    
        
})();

/**
 * di.shared.model.GlobalModel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用模型] 全局数据模型
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.shared.model');

/**
 * @usage 单例，直接如此获取单例即可：var g = di.shared.GlobalModel();
 */
(function() {
    
    /* 外部引用 */
    var inherits = ecui.util.inherits,
        USER_MODEL, AUTH_MODEL, DATE_MODEL, GLOBAL_MENU_MANAGER, 
        XDATASOURCE = xui.XDatasource;
    
    $link(function() {
        var sharedNS = di.shared;
        USER_MODEL = sharedNS.model.UserModel;
        AUTH_MODEL = sharedNS.model.AuthModel;
        DATE_MODEL = sharedNS.model.DateModel;
        GLOBAL_MENU_MANAGER = sharedNS.model.GlobalMenuManager;
    });
    
    /* 类型声明 */
    var GLOBAL_MODEL = $namespace().GlobalModel = function() {
            return instance || (instance = new SINGLETON());
        };
    var GLOBAL_MODEL_CLASS = inherits(GLOBAL_MODEL, XDATASOURCE);
        
    function SINGLETON() {
        XDATASOURCE.client.call(this);

        this._oHTMLData = $getNamespaceBase().HTML_DATA;
        this._sGlobalType = this._oHTMLData.globalType;

        // 初始化全局模型
        this.addSyncCombine(this._mUserModel = new USER_MODEL());
        this.addSyncCombine(this._mAuthModel = new AUTH_MODEL());
        this.addSyncCombine(this._mDateModel = new DATE_MODEL());

        if (this._sGlobalType == 'CONSOLE') {
            this.addSyncCombine(
                this._mGlobalMenuManager = new GLOBAL_MENU_MANAGER()
            );
        }
    };
    
    var instance;
    
    /**
     * 初始化
     * @public
     */
    GLOBAL_MODEL_CLASS.init = function() {
        this.sync();
    };
    
    /**
     * 数据来源于HTML
     * @public
     */
    GLOBAL_MODEL_CLASS.local = function() {
        return this.wrapEJson(this._oHTMLData);
    }
    
    /**
     * 获得DateModel
     * @public
     */
    GLOBAL_MODEL_CLASS.getDateModel = function() {
        return this._mDateModel;   
    }
    
    /**
     * 获得UserModel
     * @public
     */
    GLOBAL_MODEL_CLASS.getUserModel = function() {
        return this._mUserModel;   
    }
    
    /**
     * 获得AuthModel
     * @public
     */
    GLOBAL_MODEL_CLASS.getAuthModel = function() {
        return this._mAuthModel;   
    }
    
    /**
     * 获得GlobalMenuManager
     * @public
     */
    GLOBAL_MODEL_CLASS.getGlobalMenuManager = function() {
        return this._mGlobalMenuManager;   
    }

    inherits(SINGLETON, GLOBAL_MODEL);
    
})();

/**
 * di.shared.model.MenuPageManager
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用管理器] 菜单行为的托管，菜单页的管理
 * author:  sushuang(sushuang)
 */

$namespace('di.shared.model');

/**
 * [外部注入 (@see ecui.util.ref)]
 * {ecui.ui.PlMenu} menu 左侧菜单
 * {di.shared.model.PanelPageManager} pangelPageManager 页面管理
 */
(function() {
    
    //-----------------------------------------
    // 引用
    //-----------------------------------------

    var inheritsModel = ecui.inheritsModel; 
    var createDom = ecui.dom.create;
    var getModel = ecui.util.getModel;
    var bind = xutil.fn.bind;
    var parseParam = xutil.url.parseParam;
    var isString = xutil.lang.isString;
    var getByPath = xutil.object.getByPath;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var XDATASOURCE = xui.XDatasource;
    var GLOBAL_MODEL;
        
    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
    });
    
    //-----------------------------------------
    // 类型声明
    //-----------------------------------------

    /**
     * 菜单管理类
     *
     * @class
     * @extends xui.XDatasource
     */
    var MENU_PAGE_MANAGER = 
        $namespace().MenuPageManager = 
        inheritsModel(XDATASOURCE);
    var MENU_PAGE_MANAGER_CLASS = MENU_PAGE_MANAGER.prototype;
    
    //-----------------------------------------
    // 方法
    //-----------------------------------------

    /**
     * 初始化
     * @public
     */    
    MENU_PAGE_MANAGER_CLASS.init = function() {
        this._uMenu.onchange = bind(this.$menuChangeHandler, this);
        this._mPanelPageManager.attach(
            'page.active', 
            this.$pageActiveHandler, 
            this
        );
    };
    
    /**
     * 获得请求参数
     * @public
     */    
    MENU_PAGE_MANAGER_CLASS.param = function(options) {
        var globalMenuSel = getModel(
                GLOBAL_MODEL(), 
                'globalMenuManager'
            )
            .getSelected() || {};

        return 'rootMenuId=' + (globalMenuSel.menuId || '');
    };
    
    /**
     * 解析后台返回
     * @public
     */    
    MENU_PAGE_MANAGER_CLASS.parse = function(data) {
        var menuTree = data['menuTree'];
        if (menuTree) {
            // 菜单数据设置
            this._uMenu.setData(menuTree.menuList);
            // 初始时默认选择
            // this._uMenu.select(menuTree.selMenuId);
            // this.$menuChangeHandler(this._uMenu.getSelected());
        }
    };
    
    /**
     * 菜单选择行为
     * @protected
     * 
     * @param {Object} menuItem 节点数据对象
     *          {string} menuId 节点ID
     *          {string} menuName 节点名
     *          {string} menuUrl 节点URL
     */
    MENU_PAGE_MANAGER_CLASS.$menuChangeHandler = function(menuItem) {
        var page, arr, pageClass, param;
        var menuId = menuItem.menuId;

        arr = menuItem.menuUrl.split('?');
        // menuPage中保存的是页面panel page类型
        pageClass = getByPath(arr[0]);
        param = parseParam(arr[1]);
            
        var title = menuItem.menuName;

        // FIXME
        // 暂时在此处设置title
        if (param && param.reportType == 'TABLE') {
            title = '[表] ' + title;
        }
        else if (param && param.reportType == 'CHART') {
            title = '[图] ' + title;
        }

        // FIXME 
        // 暂时改为总是新建
        var pageId;
        if (true || !this._mPanelPageManager.exists(menuId)) {
            // 不存在页面则新建
            pageId = 
            this._mPanelPageManager.add(
                function(opt) {
                    var o, page;
                    opt.el.appendChild(o = createDom());
                    page = ecuiCreate(pageClass, o, opt.parent, param);
                    page.init(); 
                    return page;
                },
                {
                    // FIXME
                    // 暂时改为自动生成pageId
                    /* pageId: menuId, */
                    title: title,
                    canClose: true
                }
            );
        }
        
        // 选择激活
        /* this._mPanelPageManager.select(menuId); */
        this._mPanelPageManager.select(pageId); 
    };
    
    /**
     * 页面选中后的行为
     */
    MENU_PAGE_MANAGER_CLASS.$pageActiveHandler = function(menuId) {
        this._uMenu.select(menuId);
    };
    
})();

/**
 * di.shared.model.MetaConditionModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    元数据选择Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.model');

(function () {
    
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
    var numberParam = xutil.url.numberParam;
    var arrayProtoPush = Array.prototype.push;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var logError = UTIL.logError;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var XDATASOURCE = xui.XDatasource;

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * 元数据选择Model
     *
     * @class
     * @extends xui.XDatasource
     * @param {Object} options
     * @param {Object} options.reportType
     * @param {Function=} options.commonParamGetter    
     */
    var META_CONDITION_MODEL = 
            $namespace().MetaConditionModel = 
            inheritsObject(XDATASOURCE, constructor);
    var META_CONDITION_MODEL_CLASS = 
            META_CONDITION_MODEL.prototype;
  
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
         * 类型，TABLE 或者 CHART
         *
         * @type {string}
         * @private
         */
        this._sReportType = options.reportType || 'TABLE';
        /**
         * 得到公用的请求参数
         *
         * @type {Function}
         * @private
         */
        this._fCommonParamGetter = 
            options.commonParamGetter || function () { return ''; }
        /**
         * 指标列表
         *
         * @type {xutil.LinkedHashMap}
         * @private
         */
        this._oIndList = new LINKED_HASH_MAP(null, 'uniqName');
        /**
         * 维度列表
         * 
         * @type {xutil.LinkedHashMap}
         * @private
         */
        this._oDimList = new LINKED_HASH_MAP(null, 'uniqName');
        /**
         * selLine包装
         * key为selLine唯一名，value是selLine的list
         * 
         * @type {xutil.LinkedHashMap}
         * @private
         */
        this._oSelLineWrap = new LINKED_HASH_MAP(null, 'k', 'l');
        /**
         * 元数据状态
         * dimMetas: {}
         * indMetas: {}
         *      {Array.<string>} validMetaNames
         *      {Array.<string>} selectedMetaNames
         *
         * @type {Object}
         * @private
         */
        this._oStatusWrap = {};
    }

    /**
     * @override
     */
    META_CONDITION_MODEL_CLASS.init = function () {};

    var URL_MAP = {
        META_DATA: {
            TABLE: URL('META_CONDITION_IND_DIM_TABLE'),
            CHART: URL('META_CONDITION_IND_DIM_CHART')
        },
        SELECT: {
            TABLE: URL('META_CONDITION_SELECT_TABLE'),
            CHART: URL('META_CONDITION_SELECT_CHART')
        }
    };    

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    META_CONDITION_MODEL_CLASS.url = function (options) {
        return URL_MAP[options.datasourceId][this._sReportType];
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    META_CONDITION_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            META_DATA: function (options) { 
                return this._fCommonParamGetter(); 
            },
            SELECT: function (options) {
                var args = options.args;
                var changeWrap = args.changeWrap;
                var paramArr = [];

                paramArr.push(this._fCommonParamGetter());
                arrayProtoPush.apply(
                    paramArr, 
                    wrapArrayParam(changeWrap.uniqNameList, 'uniqNameList')
                );
                paramArr.push('from=' + textParam(changeWrap.from));
                paramArr.push('to=' + textParam(changeWrap.to));
                paramArr.push(
                    'toPosition=' + numberParam(changeWrap.toPosition, -1)
                );
                return paramArr.join('&');
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    META_CONDITION_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            META_DATA: function (data, ejsonObj, options) {
                try {
                    var me = this;

                    // 指标维度元数据
                    var metaData = data['metaData'];
                    this._oIndList.appendAll(metaData['inds']);
                    this._oDimList.appendAll(metaData['dims']);

                    // 设置指标还是维度标记
                    setIndDimClazz.call(this, this._oIndList, 'IND');
                    setIndDimClazz.call(this, this._oDimList, 'DIM');

                    // 图的series属性（左右轴，图类型等）
                    // TODO
                    this._oSeriesCfg = data['seriesTypes']; 

                    // selLine处理
                    for (
                        var i = 0, key, list; 
                        key = data['index4Selected'][i]; 
                        i ++
                    ) {
                        this._oSelLineWrap.addLast(
                            {
                                k: key,
                                l: list = new LINKED_HASH_MAP(
                                    data['selected'][key], 
                                    'uniqName'
                                )
                            }
                        );
                        setIndDimClazz.call(this, list);
                    }
                }
                catch (e) {
                    logError(e);
                    this.$goError();
                }
            },

            SELECT: function (data, ejsonObj, options) {
                try {
                    this._oStatusWrap = data['metaStatusData'];
                    // 处理、融合
                    processStatus.call(
                        this, 
                        this._oStatusWrap.indMetas, 
                        this._oIndList
                    );
                    processStatus.call(
                        this, 
                        this._oStatusWrap.dimMetas, 
                        this._oDimList
                    );

                    // 提交成功才更新本地selected的Model数据
                    this.$updateSelected(options.args.changeWrap);
                }
                catch (e) {
                    logError(e);
                    this.$goError();
                }
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    META_CONDITION_MODEL_CLASS.error = new XDATASOURCE.Set(
        {
            META_DATA: function (status, ejsonObj, options) {
                this._oIndList.clean();
                this._oDimList.clean();
                this._oSelLineWrap.clean();
                this._oStatusWrap = {};
            },
            SAVE: function (status, ejsonObj, options) {
                // TODO 
                // 严重错误则全部停止继续操作
            }
        }
    );

    /**
     * 补充设置指标维度标志，根据字典
     *
     * @private
     */
    function setIndDimClazz(list, flag) {
        var me = this;
        list.foreach(
            function (key, o) {
                if (flag) {
                    o.clazz = flag;
                }
                else if (me._oIndList.containsKey(o.uniqName)) {
                    o.clazz = 'IND';
                }
                else if (me._oDimList.containsKey(o.uniqName)) {
                    o.clazz = 'DIM';
                }
            }
        );        
    }

    /**
     * 融合status
     *
     * @private
     */
    function processStatus(statusWrap, baseList) {
        // 先全设为disabled
        baseList.foreach(
            function (k, item, index) {
                item.status = DICT.META_STATUS.DISABLED;
            }
        );

        !statusWrap.validMetaNames && (statusWrap.validMetaNames = []);
        !statusWrap.selectedMetaNames && (statusWrap.selectedMetaNames = []);

        // 用后台返回的normal和selected列表设置状态
        var i;
        var o;
        var item;
        for (i = 0; o = statusWrap.validMetaNames[i]; i ++) {
            if (item = baseList.get(o)) {
                item.status = DICT.META_STATUS.NORMAL;
            }
        }
        for (i = 0; o = statusWrap.selectedMetaNames[i]; i ++) {
            if (item = baseList.get(o)) {
                item.status = DICT.META_STATUS.SELECTED;
            }
        }

        // 接口定的有点乱，控件需要的其实是disabled列表
        statusWrap.disabledMetaNames = [];
        baseList.foreach(
            function (k, item, index) {
                if (item.status == DICT.META_STATUS.DISABLED) {
                    statusWrap.disabledMetaNames.push(k);
                }
            }
        );
    }

    /**
     * 得到selLine包装
     *
     * @public
     * @return {xutil.LinkedHashMap} selLine
     */
    META_CONDITION_MODEL_CLASS.getSelLineWrap = function () {
        return this._oSelLineWrap;
    };

    /**
     * 得到指标维度列表
     *
     * @public
     * @return {Object} 指标维度列表
     */
    META_CONDITION_MODEL_CLASS.getIndDim = function () {
        return {
            indList: this._oIndList,
            dimList: this._oDimList
        };
    };

    /**
     * 得到指标维度最新状态
     *
     * @public
     * @return {Object} 指标维度最新状态
     */
    META_CONDITION_MODEL_CLASS.getStatusWrap = function () {
        return this._oStatusWrap;
    };

    /**
     * 根据uniqName得到项
     * 
     * @public
     * @param {string} uniqName
     * @return {Object} metaItem
     */
    META_CONDITION_MODEL_CLASS.getMetaItem = function (uniqName) {  
        var item = this._oIndList.get(uniqName);
        if (!item) {
            item = this._oDimList.get(uniqName);
        }
        return item;
    };

    /**
     * 得到选择变化信息
     * 
     * @public
     * @param {Object} selLineWrap key为行列名，value为行列选中列表 
     * @return {Object} 返回值的key为from, to, toPosition
     */
    META_CONDITION_MODEL_CLASS.diffSelected = function (selLineWrap) {
        var srcList;
        var removeList; 
        var addList;
        var changeWrap = { uniqNameList: [] };

        for (var name in selLineWrap) {
            srcList = this._oSelLineWrap.get(name);
            diffLineSelected.call(
                this, 
                name, 
                selLineWrap[name], 
                srcList, 
                changeWrap
            );
        }

        return changeWrap;
    };

    /**
     * 得到某行选择变化信息
     * 只支持三种可能：某项此行间换位值，拖离此行，拖进此行
     * 
     * @private
     * @param {string} lineName
     * @param {Array.<string>} currLine
     * @param {xutil.LinkedHashMap} srcList 
     * @param {Object} result
     */
    function diffLineSelected(lineName, currLine, srcList, result) {
        // 在此行间换位置的情况，检查出拖动的节点
        if (currLine.length == srcList.size()) {
            var diffKeySrc;
            var diffIndex;
            var tarIndexCurr;
            var tarIndexSrc;
            var tarKeySrc;
            srcList.foreach(
                function (key, value, index) {
                    if (diffIndex == null) {
                        if (key != currLine[index]) { 
                            // 出现了第一个不一样的值
                            diffKeySrc = key; 
                            diffIndex = index;
                        }
                    }
                    else {
                        if (diffKeySrc == currLine[index]) {
                            tarIndexCurr = index;
                        }
                        if (currLine[diffIndex] == key) {
                            tarIndexSrc = index;
                            tarKeySrc = key;
                        }
                    }
                }
            );
            if (diffIndex != null) {
                result.from = lineName;
                result.to = lineName;
                result.fromLineData = currLine;
                result.toLineData = currLine;
                if (tarIndexSrc > tarIndexCurr) {
                    result.uniqName = tarKeySrc;
                    result.toPosition = diffIndex;
                }
                else {
                    result.uniqName = diffKeySrc;
                    result.toPosition = tarIndexCurr;
                }
                result.uniqNameList.push(result.uniqName);
            }
        }
        // 拖进此行的情况
        else if (currLine.length > srcList.size()) {
            for (var i = 0, name; i < currLine.length; i ++) {
                name = currLine[i];
                if (!srcList.containsKey(name)) {
                    result.uniqName = name
                    result.uniqNameList.splice(0, 1, name);
                    result.to = lineName;
                    result.toLineData = currLine;
                    if (result.toPosition == null) {
                        result.toPosition = i;
                    }
                }
            }
        }
        // 拖离此行的情况（删除或者拖到别的行）
        else if (currLine.length < srcList.size()) {
            srcList.foreach(
                function (name, value, index) {
                    if (currLine[index] != name) {
                        result.uniqName = name
                        result.uniqNameList.push(name);
                        result.from = lineName;
                        result.fromLineData = currLine;
                        return false;
                    }
                }
            );
        }
        // FIXME
        // 临时处理，FIXME，后续改和后台的接口
        result.uniqNameList.splice(1, result.uniqNameList.length - 1);
    };

    /**
     * 设置条件选择变化
     * 
     * @protected
     * @param {Object} changeWrap
     * @param {Array.<string>} changeWrap.uniqNameList
     * @param {string} changeWrap.from
     * @param {string} changeWrap.to
     * @param {number} changeWrap.toPosition
     */
    META_CONDITION_MODEL_CLASS.$updateSelected = function (changeWrap) {
        var fromList = changeWrap.from != changeWrap.to
                ? this._oSelLineWrap.get(changeWrap.from)
                : null;
        var toList = this._oSelLineWrap.get(changeWrap.to);

        var fromLineData = changeWrap.fromLineData;
        var toLineData = changeWrap.toLineData;
        var i = 0;
        var uniqName;

        if (fromList) {
            fromList.cleanWithoutDefaultAttr();
            for (i = 0; i < fromLineData.length; i ++) {
                uniqName = fromLineData[i];
                fromList.addLast(this.getMetaItem(uniqName));
            }
        }

        if (toList) {
            toList.cleanWithoutDefaultAttr();
            for (i = 0; i < toLineData.length; i ++) {
                uniqName = toLineData[i];
                toList.addLast(this.getMetaItem(uniqName));
            }
        }

        //----------------------------------
        // ONLY FOR TESTING. TO BE DELETED.
        // console.log(changeWrap);
        // console.log('      uniqNameList= ' + changeWrap.uniqNameList);
        // console.log('      from= ' + changeWrap.from);
        // console.log('      fromLineData= ' + changeWrap.fromLineData);
        // console.log('      to= ' + changeWrap.to);
        // console.log('      toLineData= ' + changeWrap.toLineData);
        // console.log('      toPosition= ' + changeWrap.toPosition);
        // this._oSelLineWrap.foreach(function (k, item, index) {
        //     console.log('LINE NAME::: ' + k);
        //     item.foreach(function (kk, oo, ii) {
        //         var arr = [];
        //         arr.push(kk);
        //         console.log('          ' + arr.join('  '));
        //     });
        // });
    };

})();

/**
 * di.shared.model.OlapMetaConfigModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    元数据选择Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.model');

(function () {
    
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
    var logError = UTIL.logError;
    var getUID = xutil.uid.getUID;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var XDATASOURCE = xui.XDatasource;

    //------------------------------------------
    // 类型声明
    //------------------------------------------

    /**
     * 元数据选择Model
     *
     * @class
     * @extends xui.XDatasource
     * @param {Object} options
     * @param {Object} options.reportType
     * @param {Function=} options.commonParamGetter    
     */
    var OLAP_META_CONFIG_MODEL = 
            $namespace().OlapMetaConfigModel = 
            inheritsObject(XDATASOURCE, constructor);
    var OLAP_META_CONFIG_MODEL_CLASS = 
            OLAP_META_CONFIG_MODEL.prototype;
  
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
         * 类型，TABLE 或者 CHART
         *
         * @type {string}
         * @private
         */
        this._sReportType = options.reportType || 'TABLE';
        /**
         * 得到公用的请求参数
         *
         * @type {Function}
         * @private
         */
        this._fCommonParamGetter = options.commonParamGetter;
        /**
         * 指标列表
         *
         * @type {xutil.LinkedHashMap}
         * @private
         */
        this._oIndList = new LINKED_HASH_MAP(null, 'uniqName');
        /**
         * 维度列表
         * 
         * @type {xutil.LinkedHashMap}
         * @private
         */
        this._oDimList = new LINKED_HASH_MAP(null, 'uniqName');
        /**
         * selLine包装
         * key为selLine唯一名，value是selLine的list
         * 
         * @type {xutil.LinkedHashMap}
         * @private
         */
        this._oSelLineWrap = new LINKED_HASH_MAP(null, 'k', 'l');
        /**
         * 元数据状态
         * dimMetas: {}
         * indMetas: {}
         *      {Array.<string>} validMetaNames
         *      {Array.<string>} selectedMetaNames
         *
         * @type {Object}
         * @private
         */
        this._oStatusWrap = {};
        /**
         * 图的属性
         *
         * @private
         */
        this._oSeriesCfg = null;
    }

    /**
     * @override
     */
    OLAP_META_CONFIG_MODEL_CLASS.init = function () {};

    var URL_MAP = {
        TABLE: {
            DATA: URL('META_CONDITION_IND_DIM_TABLE'),
            SELECT: URL('META_CONDITION_SELECT_TABLE')
        },
        CHART: {
            DATA: URL('META_CONDITION_IND_DIM_CHART'),
            SELECT: URL('META_CONDITION_SELECT_CHART'),
            LIST_SELECT: URL('META_CONDITION_LIST_SELECT_CHART')
        }
    };    

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_META_CONFIG_MODEL_CLASS.url = function (options) {
        return URL_MAP[this._sReportType][options.datasourceId];
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_META_CONFIG_MODEL_CLASS.businessKey = new XDATASOURCE.Set(
        {
            DATA: 'OLAP_META_CONFIG_MODEL_DATA_' + getUID(),
            SELECT: 'OLAP_META_CONFIG_MODEL_SELECT_' + getUID()
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_META_CONFIG_MODEL_CLASS.complete = new XDATASOURCE.Set(
        {
            DATA: doComplete,
            SELECT: doComplete
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
    OLAP_META_CONFIG_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            DATA: function (options) { 
                return this._fCommonParamGetter(options.args.param);
            },
            SELECT: function (options) {
                var changeWrap = options.args.changeWrap;
                var paramArr = [];

                var param = {
                    from: changeWrap.from,
                    to: changeWrap.to,
                    toPosition: changeWrap.toPosition != null 
                        ? changeWrap.toPosition : -1,
                    needShowCalcInds: options.args.needShowCalcInds,
                    uniqNameList: []
                };

                param.uniqNameList.push.apply(
                    param.uniqNameList,
                    changeWrap.uniqNameList
                );

                return this._fCommonParamGetter(param);
            }, 
            LIST_SELECT: function (options) {
                var param = { indNames: [options.args.selected] };
                return this._fCommonParamGetter(param);
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_META_CONFIG_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            DATA: function (data, ejsonObj, options) {
                try {
                    var me = this;

                    this.$clean();
                    
                    // 指标维度元数据
                    var metaData = data['metaData'];
                    this._oIndList.appendAll(metaData['inds']);
                    this._oDimList.appendAll(metaData['dims']);

                    // 设置指标还是维度标记
                    setIndDimClazz.call(this, this._oIndList, 'IND');
                    setIndDimClazz.call(this, this._oDimList, 'DIM');

                    // 图的series属性（左右轴，图类型等）
                    // TODO
                    this._oSeriesCfg = data['seriesTypes']; 

                    // selLine处理
                    for (
                        var i = 0, key, list; 
                        key = data['index4Selected'][i]; 
                        i ++
                    ) {
                        this._oSelLineWrap.addLast(
                            {
                                k: key,
                                l: list = new LINKED_HASH_MAP(
                                    data['selected'][key], 
                                    'uniqName'
                                )
                            }
                        );
                        setIndDimClazz.call(this, list);
                    }

                    // 选中、禁用等状态
                    doMerge.call(this, data);
                }
                catch (e) {
                    logError(e);
                    this.$goError();
                }
            },

            SELECT: function (data, ejsonObj, options) {
                try {
                    // 选中、禁用等状态
                    doMerge.call(this, data);

                    // 提交成功才更新本地selected的Model数据
                    this.$updateSelected(options.args.changeWrap);
                }
                catch (e) {
                    logError(e);
                    this.$goError();
                }
            }
        }
    );

    /**
     * 对selected和meta进行融合
     * 
     * @private
     */
    function doMerge(data) {

        // 用selected中的status来覆盖进meta
        if (this._oStatusWrap = data['metaStatusData']) {
            // 处理、融合
            mergeStatus.call(
                this, 
                this._oStatusWrap.indMetas, 
                this._oIndList
            );
            mergeStatus.call(
                this, 
                this._oStatusWrap.dimMetas, 
                this._oDimList
            );
        }

        // 用meta中的其余信息（如fixed、align等）覆盖回selected
        var indList = this._oIndList;
        var dimList = this._oDimList;
        this._oSelLineWrap.foreach(
            function (selLineName, selLine, index) {
                selLine.foreach(function (key, item, idx) {
                    var o;
                    if ((o = indList.get(key))
                        || (o = dimList.get(key))
                    ) {
                        extend(item, o);
                    }
                });
            }
        );
    }

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_META_CONFIG_MODEL_CLASS.error = new XDATASOURCE.Set(
        {
            DATA: function (status, ejsonObj, options) {
                this._oIndList.clean();
                this._oDimList.clean();
                this._oSelLineWrap.clean();
                this._oStatusWrap = {};
            }
        }
    );

    OLAP_META_CONFIG_MODEL_CLASS.$clean = function() {
        this._oIndList.cleanWithoutDefaultAttr();
        this._oDimList.cleanWithoutDefaultAttr();
        this._oSelLineWrap.cleanWithoutDefaultAttr();
        this._oStatusWrap = {};
        this._oSeriesCfg = null;
    }

    /**
     * 补充设置指标维度标志，根据字典
     *
     * @private
     */
    function setIndDimClazz(list, flag) {
        var me = this;
        list.foreach(
            function (key, o) {
                if (flag) {
                    o.clazz = flag;
                }
                else if (me._oIndList.containsKey(o.uniqName)) {
                    o.clazz = 'IND';
                }
                else if (me._oDimList.containsKey(o.uniqName)) {
                    o.clazz = 'DIM';
                }
            }
        );        
    }

    /**
     * 融合status
     *
     * @private
     */
    function mergeStatus(statusWrap, baseList) {
        // 先全设为disabled
        baseList.foreach(
            function (k, item, index) {
                item.status = DICT.META_STATUS.DISABLED;
            }
        );

        if (!statusWrap) { return; }

        var validMetaNames = statusWrap.validMetaNames;
        !validMetaNames 
            && (validMetaNames = statusWrap.validMetaNames = []);

        var selectedMetaNames = statusWrap.selectedMetaNames;
        !selectedMetaNames 
            && (selectedMetaNames = statusWrap.selectedMetaNames = []);

        // 用后台返回的normal和selected列表设置状态
        // 因为visible设定的影响，后台返回的项有可能含有baseList里不存在的（小明说灰常难改），
        // 所以在这里去除不存在的
        var i;
        var o;
        var item;
        for (i = 0; i < validMetaNames.length;) {
            if (item = baseList.get(validMetaNames[i])) {
                item.status = DICT.META_STATUS.NORMAL;
                i ++;
            }
            else {
                validMetaNames.splice(i, 1);
            }
        }
        for (i = 0; i < selectedMetaNames.length;) {
            if (item = baseList.get(selectedMetaNames[i])) {
                item.status = DICT.META_STATUS.SELECTED;
                i ++;
            }
            else {
                selectedMetaNames.splice(i, 1);
            }
        }

        // 接口定的有点乱，控件需要的其实是disabled列表
        var disabledMetaNames = statusWrap.disabledMetaNames = [];
        baseList.foreach(
            function (k, item, index) {
                if (item.status == DICT.META_STATUS.DISABLED) {
                    disabledMetaNames.push(k);
                }
            }
        );
    }

    /**
     * 得到selLine包装
     *
     * @public
     * @return {xutil.LinkedHashMap} selLine
     */
    OLAP_META_CONFIG_MODEL_CLASS.getSelLineWrap = function () {
        return this._oSelLineWrap;
    };

    /**
     * 得到指标维度列表
     *
     * @public
     * @return {Object} 指标维度列表
     */
    OLAP_META_CONFIG_MODEL_CLASS.getIndDim = function () {
        return {
            indList: this._oIndList,
            dimList: this._oDimList
        };
    };

    /**
     * 得到指标维度最新状态
     *
     * @public
     * @return {Object} 指标维度最新状态
     */
    OLAP_META_CONFIG_MODEL_CLASS.getUpdateData = function () {
        return this._oStatusWrap;
    };

    /**
     * 根据uniqName得到项
     * 
     * @public
     * @param {string} uniqName
     * @return {Object} metaItem
     */
    OLAP_META_CONFIG_MODEL_CLASS.getMetaItem = function (uniqName) {  
        var item = this._oIndList.get(uniqName);
        if (!item) {
            item = this._oDimList.get(uniqName);
        }
        return item;
    };

    /**
     * 得到选择变化信息
     * 
     * @public
     * @param {Object} selLineWrap key为行列名，value为行列选中列表 
     * @return {Object} 返回值的key为from, to, toPosition
     */
    OLAP_META_CONFIG_MODEL_CLASS.diffSelected = function (selLineWrap) {
        var srcList;
        var removeList; 
        var addList;
        var changeWrap = { uniqNameList: [] };

        for (var name in selLineWrap) {
            srcList = this._oSelLineWrap.get(name);
            diffLineSelected.call(
                this, 
                name, 
                selLineWrap[name], 
                srcList, 
                changeWrap
            );
        }

        return changeWrap;
    };

    /**
     * 得到某行选择变化信息
     * 只支持三种可能：某项此行间换位值，拖离此行，拖进此行
     * （这些处理过于复杂，后端也重复实现了这些复杂逻辑，这
     *  源于定的from-to接口，合理的方式是重构，
     *  不使用from-to方式的接口，而是传当前状态）
     * 
     * @private
     * @param {string} lineName
     * @param {Array.<string>} currLine
     * @param {xutil.LinkedHashMap} srcList 
     * @param {Object} result
     */
    function diffLineSelected(lineName, currLine, srcList, result) {
        // 在此行间换位置的情况，检查出拖动的节点
        if (currLine.length == srcList.size()) {
            var diffKeySrc;
            var diffIndex;
            var tarIndexCurr;
            var tarIndexSrc;
            var tarKeySrc;
            srcList.foreach(
                function (key, value, index) {
                    if (diffIndex == null) {
                        if (key != currLine[index]) { 
                            // 出现了第一个不一样的值
                            diffKeySrc = key; 
                            diffIndex = index;
                        }
                    }
                    else {
                        if (diffKeySrc == currLine[index]) {
                            tarIndexCurr = index;
                        }
                        if (currLine[diffIndex] == key) {
                            tarIndexSrc = index;
                            tarKeySrc = key;
                        }
                    }
                }
            );
            if (diffIndex != null) {
                result.from = lineName;
                result.to = lineName;
                result.fromLineData = currLine;
                result.toLineData = currLine;
                if (tarIndexSrc > tarIndexCurr) {
                    result.uniqName = tarKeySrc;
                    result.toPosition = diffIndex;
                }
                else {
                    result.uniqName = diffKeySrc;
                    result.toPosition = tarIndexCurr;
                }
                result.uniqNameList.push(result.uniqName);
            }
        }
        // 拖进此行的情况
        else if (currLine.length > srcList.size()) {
            for (var i = 0, name; i < currLine.length; i ++) {
                name = currLine[i];
                if (!srcList.containsKey(name)) {
                    result.uniqName = name
                    result.uniqNameList.splice(0, 1, name);
                    result.to = lineName;
                    result.toLineData = currLine;
                    if (result.toPosition == null) {
                        result.toPosition = i;
                    }
                }
            }
        }
        // 拖离此行的情况（删除或者拖到别的行）
        else if (currLine.length < srcList.size()) {
            srcList.foreach(
                function (name, value, index) {
                    if (currLine[index] != name) {
                        result.uniqName = name
                        result.uniqNameList.push(name);
                        result.from = lineName;
                        result.fromLineData = currLine;
                        return false;
                    }
                }
            );
        }
        // FIXME
        // 临时处理，FIXME，后续改和后台的接口
        result.uniqNameList.splice(1, result.uniqNameList.length - 1);
    };

    /**
     * 设置条件选择变化
     * 
     * @protected
     * @param {Object} changeWrap
     * @param {Array.<string>} changeWrap.uniqNameList
     * @param {string} changeWrap.from
     * @param {string} changeWrap.to
     * @param {number} changeWrap.toPosition
     */
    OLAP_META_CONFIG_MODEL_CLASS.$updateSelected = function (changeWrap) {
        var fromList = changeWrap.from != changeWrap.to
                ? this._oSelLineWrap.get(changeWrap.from)
                : null;
        var toList = this._oSelLineWrap.get(changeWrap.to);

        var fromLineData = changeWrap.fromLineData;
        var toLineData = changeWrap.toLineData;
        var i = 0;
        var uniqName;

        if (fromList) {
            fromList.cleanWithoutDefaultAttr();
            for (i = 0; i < fromLineData.length; i ++) {
                uniqName = fromLineData[i];
                fromList.addLast(this.getMetaItem(uniqName));
            }
        }

        if (toList) {
            toList.cleanWithoutDefaultAttr();
            for (i = 0; i < toLineData.length; i ++) {
                uniqName = toLineData[i];
                toList.addLast(this.getMetaItem(uniqName));
            }
        }

        //----------------------------------
        // ONLY FOR TESTING. TO BE DELETED.
        // console.log(changeWrap);
        // console.log('      uniqNameList= ' + changeWrap.uniqNameList);
        // console.log('      from= ' + changeWrap.from);
        // console.log('      fromLineData= ' + changeWrap.fromLineData);
        // console.log('      to= ' + changeWrap.to);
        // console.log('      toLineData= ' + changeWrap.toLineData);
        // console.log('      toPosition= ' + changeWrap.toPosition);
        // this._oSelLineWrap.foreach(function (k, item, index) {
        //     console.log('LINE NAME::: ' + k);
        //     item.foreach(function (kk, oo, ii) {
        //         var arr = [];
        //         arr.push(kk);
        //         console.log('          ' + arr.join('  '));
        //     });
        // });
    };

    //------------------------------------------------
    // 拖拽规则
    //------------------------------------------------

    

})();

/**
 * di.shared.model.PageInfo
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:   分页信息对象
 *          可屏蔽前后台对分页对象的定义不一致的情况
 * @author: sushuang(sushuang)
 */

$namespace('di.shared.model');

(function() {
    
    //---------------------------------------
    // 引用
    //---------------------------------------
    
    var textParam = xutil.url.textParam;
    var clone = xutil.object.clone;
        
    //---------------------------------------
    // 类型声明
    //---------------------------------------

    /**
     * 分页对象
     *
     * @class
     * @constructor
     * @param {(Object|PageInfo)=} pageInfo 分页信息，可缺省
     *          {number} disabled 是否禁用
     *          {number} totalRecordCount 总记录数
     *          {number} pageSize 每页大小
     *          {number} currentPage 当前页号，从1开始
     */
    var PAGE_INFO = $namespace().PageInfo = function(pageInfo) {
        /**
         * 是否禁用
         *
         * @type {boolean}
         * @public
         */
        this.disable;
        /**
         * 总记录数
         *
         * @type {number}
         * @public
         */
        this.totalRecordCount;
        /**
         * 每页大小
         *
         * @type {number}
         * @public
         */
        this.pageSize;

        this.setData(pageInfo);
    };
    var PAGE_INFO_CLASS = PAGE_INFO.prototype;
        
    /**
     * 设置数据
     * 
     * @public
     * @param {Object} pageInfo 分页信息，
     *          如果pageInfo某个属性没有值，则此属性不会被设值改动
     *          {number} disabled 是否禁用
     *          {number} totalRecordCount 总记录数
     *          {number} pageSize 每页大小
     *          {number} currentPage 当前页号，从1开始
     */
    PAGE_INFO_CLASS.setData = function(pageInfo) {
        if (pageInfo) {
            if (pageInfo.disabled != null) {
                this.disabled = pageInfo.disabled;
            }
            if (pageInfo.totalRecordCount != null) {
                this.totalRecordCount = pageInfo.totalRecordCount;
            }
            if (pageInfo.pageSize != null) {
                this.pageSize = pageInfo.pageSize;
            }
            if (pageInfo.currentPage != null) {
                this.currentPage = pageInfo.currentPage;
            }
        }
    };

    /**
     * 用后台数据设置page info
     * 
     * @public
     * @param {Object} serverPageInfo 后台page info的json对象
     * @param {string=} type 后台page bean类型，
     *              可取值：'TCOM', 
     *              为空则是默认模式
     */
    PAGE_INFO_CLASS.setServerData = function(serverPageInfo, type) {
        var pageInfo;

        switch (type) {
            case 'TCOM': 
                pageInfo = {};
                if (serverPageInfo) {
                    pageInfo.disabled = false;
                    pageInfo.totalRecordCount = 
                        parseInt(serverPageInfo.totalRecNum) || 0;
                    pageInfo.pageSize = 
                        parseInt(serverPageInfo.pageSize) || 0;
                    pageInfo.currentPage = 
                        parseInt(serverPageInfo.curPageNum) || 0;
                }
                break;

            default:
                pageInfo = serverPageInfo;
        }

        this.setData(pageInfo);
    };

    /**
     * 得到请求server的参数
     * 
     * @public
     * @param {string=} prefix 参数名前缀，如: 
     *              请求参数想要为'model.page.cur_page_num ...'，
     *              则此参数可传'model.page.',
     *              缺省为'page.'
     * @param {string=} type 后台page bean类型，
     *              可取值：'TCOM', 
     *              为空则是默认模式
     * @return {string} 后台的page info的请求参数
     */
    PAGE_INFO_CLASS.getServerParam = function(prefix, type) {
        var paramArr = [];

        if (prefix == null) {
            prefix = 'page.';
        }

        switch (type) {
            case 'TCOM': 
                paramArr.push(
                    prefix + 'curPageNum=' + textParam(this.currentPage)
                );
                paramArr.push(
                    prefix + 'pageSize=' + textParam(this.pageSize)
                );
                break;

            default:
                paramArr.push(
                    prefix + 'currentPage' + textParam(this.currentPage)
                );
                paramArr.push(
                    prefix + 'pageSize' + textParam(this.pageSize)
                );
        }

        return paramArr.join('&');            
    };

})();

/**
 * di.shared.model.PanelPageManager
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用管理器] panel page关系页管理：
 *          维护页面引用，页面打开先后顺序，当前页面等。适应不同的页面展现方式（如tab方式或窗口方式等）。
 * author:  sushuang(sushuang)
 * depend:  
 */

$namespace('di.shared.model');

/**
 * [外部注入 (@see ecui.util.ref)]
 * {ecui.ui.Control} panelPageContainer 页面容器
 */
(function() {
    
    //------------------------------------------
    // 引用
    //------------------------------------------
    var inheritsModel = ecui.inheritsModel;
    var XDATASOURCE = xui.XDatasource;
    var bind = xutil.fn.bind;
    var isString = xutil.lang.isString;
    var hasValue = xutil.lang.hasValue;
    var extend = xutil.object.extend;
    var ref = ecui.util.ref;
    var UI_CONTROL = ecui.ui.Control;
    var UI_TAB_CONTAINER = ecui.ui.TabContainer;
    var UI_RADIO_CONTAINER = ecui.ui.RadioContainer;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    
    //------------------------------------------
    // 类型声明
    //------------------------------------------

    var PANEL_PAGE_MANAGER = $namespace().PanelPageManager = 
        inheritsModel(
            XDATASOURCE,
            /**
             * @param {Object} options
             *          {Object} adapter 适配器
             */
            function(options) {
                // 记录页面访问顺序的队列，队尾为最近访问的
                this._oPanelPageSet = new LINKED_HASH_MAP();
                this._oCurrPageWrap;
                this._sCurrPageId;
                // 挂适配器的方法
                extend(this, options.adapter);
            }
        );
    var PANEL_PAGE_MANAGER_CLASS = PANEL_PAGE_MANAGER.prototype;
        
    /**
     * 初始化
     *
     * @public
     */
    PANEL_PAGE_MANAGER_CLASS.init = function() {
        this.$bind();
    };
    
    /**
     * 增加 panel pange
     *
     * @public 
     * @param {ecui.ui.PanelPage|Function} panelPage 要添加的panel page，
     *          或者创建panel page的回调函数
     *          如果为函数，则：
     *          @param {Object} options 参数
     *                      {HTMLElement} el 在此dom元素内创建
     *                              （根据不同的实现类，可能为空）
     *                      {ecui.ui.Control} parent 父控件
     *                      {string} pageId 页ID
     *          @return {ecui.ui.PanelPage} 页内对象
     * @param {Object} options 参数
     *          {string} pageId 页面ID，如果不传则自动生成一个
     *          {string} title 页面标题，可缺省
     *          {number} index 序号，缺省则在最后添加
     *          {boolean} canClose 是否可以关闭
     * @return {number} 页面实例ID
     */
    PANEL_PAGE_MANAGER_CLASS.add = function(panelPage, options) {
        var o, pageId;
        options = options || {};
        
        if (!panelPage) { return null; }

        !hasValue(pageId = options.pageId) 
            && (pageId = options.pageId = this.$genPageId());

        if (this._oPanelPageSet.containsKey(pageId)) {
            throw new Error('Duplicate panel page ID! id=' + pageId); 
        }
        
        o = this.$addItem(panelPage, options);
        
        this._oPanelPageSet.addFirst(
            { page: o.content, item: o.item }, 
            pageId
        );
        
        return pageId;
    };
    
    /**
     * panel pange是否存在
     *
     * @public 
     * @param {string} panelPageWrap 页面的ID
     * @return {boolean} 是否存在
     */
    PANEL_PAGE_MANAGER_CLASS.exists = function(pageId) {
        return !!this._oPanelPageSet.containsKey(pageId);
    };
    
    /**
     * 选择 panel pange
     *
     * @public 
     * @param {string} nextPageId 页面的ID
     * @param {Object} options 额外参数
     */
    PANEL_PAGE_MANAGER_CLASS.select = function(nextPageId, options) {
        var nextPageWrap = this._oPanelPageSet.get(nextPageId);
        
        if (nextPageWrap && nextPageWrap != this._oCurrPageWrap) {
            // inactive上一个页面
            if (this._oCurrPageWrap) {
                this._oCurrPageWrap.page.inactive();
                this.notify('page.inactive', [this._sCurrPageId]);
            }
            // tab切换
            this._oCurrPageWrap = nextPageWrap;
            var lastPageId = this._sCurrPageId;
            this._sCurrPageId = nextPageId;
            this.$selectItem(nextPageWrap);
            // 下一个页面移动到队尾
            this._oPanelPageSet.remove(nextPageId);
            this._oPanelPageSet.addLast(nextPageWrap, nextPageId);
            this.notify('page.change', [nextPageId, lastPageId]);
            // active下一个页面
            nextPageWrap.page.active(options);
            this.notify('page.active', [nextPageId]);
        }
    };

    /**
     * 跳到栈中的某一页面
     *
     * @public
     * @return {number} pageId page号
     * @return {Object} options 额外参数
     */
    PANEL_PAGE_MANAGER_CLASS.goTo = function(pageId, options) {
        this.select(pageId, options);
    };
    
    /**
     * 含有的panel page数量
     *
     * @public
     * @return {number} 数量
     */
    PANEL_PAGE_MANAGER_CLASS.size = function() {
        return this._oPanelPageSet.size();
    };
    
    /**
     * 得到页面实例
     *
     * @public
     * @param {string} pageId 页id
     * @return {PanelPage} panelPage
     */
    PANEL_PAGE_MANAGER_CLASS.getPage = function(pageId) {
        return this._oPanelPageSet.get(pageId).page;
    };
    
    /**
     * 得到当前页面实例
     *
     * @public
     * @return {PanelPage} panelPage
     */
    PANEL_PAGE_MANAGER_CLASS.getCurrentPage = function() {
        return this._oCurrPageWrap ? this._oCurrPageWrap.page : null;
    };

    /**
     * 得到当前页面ID
     *
     * @public
     * @return {string} pageId
     */
    PANEL_PAGE_MANAGER_CLASS.getCurrentPageId = function() {
        return this._sCurrPageId;
    };
    
    /**
     * 更改标题
     *
     * @public
     * @param {string} pageId 页id
     * @param {string} title 标题
     */
    PANEL_PAGE_MANAGER_CLASS.setTitle = function(pageId, title) {
        return this.$setTitle(pageId, title);
    };
    
    /**
     * page before change事件处理
     *
     * @protected
     */
    PANEL_PAGE_MANAGER_CLASS.$pageBeforeChangeHandler = function() {
        if (this._oCurrPageWrap) {
            // inactive上一页
            this._oCurrPageWrap.page.inactive();
            this.notify('page.inactive', [this._sCurrPageId]);
        }
    };
    
    /**
     * page after change事件处理
     *
     * @protected
     */
    PANEL_PAGE_MANAGER_CLASS.$pageAfterChangeHandler = function() {
        var nextPageId = this.$retrievalPageId.apply(this, arguments);
        var lastPageId = this._sCurrPageId;
        var nextPageWrap;
        
        if (nextPageWrap = this._oPanelPageSet.get(nextPageId)) {
            // 当前页面放到记录列表最后
            this._oCurrPageWrap = nextPageWrap;
            this._sCurrPageId = nextPageId;
            this._oPanelPageSet.remove(nextPageId);
            this._oPanelPageSet.addLast(nextPageWrap, nextPageId);
            this.notify('page.change', [nextPageId, lastPageId]);
            // active下一页
            nextPageWrap.page.active();
            this.notify('page.active', [nextPageId]);
        }
    };
    
    /**
     * close事件处理
     *
     * @protected
     */
    PANEL_PAGE_MANAGER_CLASS.$pageCloseHandler = function() {
        var closePageId = this.$retrievalPageId.apply(this, arguments);
        
        // 如果只有一个页面，禁止关闭 
        if (this._oPanelPageSet.size() <= 1) {
            return false;
        }
        
        var closePageWrap = this._oPanelPageSet.remove(closePageId);

        // 修正fromPageId
        this._oPanelPageSet.foreach(
            function(pageId, wrap, index) {
                if (wrap.page.getFromPageId() == closePageId) {
                    wrap.page.setFromPageId(closePageWrap.page.getFromPageId());
                }
            }
        );

        // 关闭页面
        closePageWrap.page.dispose();
        
        // 如果是当前页面，关闭后取最近访问过的一个页面
        if (this._oCurrPageWrap && this._oCurrPageWrap == closePageWrap) {
            this._oCurrPageWrap = null;
            this._sCurrPageId = null;
            this.goTo(this._oPanelPageSet.lastKey());
        }

        this.notify('page.close', [closePageId]);
    };
    
    /**
     * 生成pageId
     *
     * @protected
     * @return {string} 生成的pageId
     */
    PANEL_PAGE_MANAGER_CLASS.$genPageId = function() {
        var id = 1;
        while (this._oPanelPageSet.containsKey(id)) { id ++; }
        return id;
    };  
        
})();

/**
 * di.shared.model.PanelPageRadioAdapter
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    PanelPageManager的适配器（RADIO型）
 * author:  sushuang(sushuang)
 * depend:  
 */

$namespace('di.shared.model');

(function () {
    
    /* 外部引用 */
    var inheritsModel = ecui.inheritsModel, 
        bind, hasValue, isString,
        UI_CONTROL, UI_TAB_CONTAINER, UI_RADIO_CONTAINER,
        XDATASOURCE = xui.XDatasource,
        LINKED_HASH_MAP;
        
    $link(function () {
        bind = ecui.xfn.bind;
        isString = ecui.xlang.isString;
        hasValue = ecui.xlang.hasValue;
        UI_CONTROL = ecui.ui.Control;
        UI_TAB_CONTAINER = ecui.ui.TabContainer;
        UI_RADIO_CONTAINER = ecui.ui.RadioContainer;
        LINKED_HASH_MAP = ecui.ext.LinkedHashMap;
    });
    
    /* 类型声明 */
    var PANEL_PAGE_RADIO_ADAPTER = $namespace().PanelPageRadioAdapter = {};
        
    /**
     * 绑定事件
     */
    PANEL_PAGE_RADIO_ADAPTER.$bind = function () {
        this._uPanelPageContainer.onbeforechange = bind(this.$pageBeforeChangeHandler, this);
        this._uPanelPageContainer.onafterchange = bind(this.$pageAfterChangeHandler, this);
    };
    
    /**
     * 增加item
     */
    PANEL_PAGE_RADIO_ADAPTER.$addItem = function (panelPage, options) {
        var container = this._uPanelPageContainer,
            content = container.add({value: options.id, text: options.title}, 
                function() { return panelPage({el: null, parent: container, pageId: options.pageId}); });
        return {content: content, item: options.id};
    };
        
    /**
     * 选择item
     */
    PANEL_PAGE_RADIO_ADAPTER.$selectItem = function (pageWrap) {
        this._uPanelPageContainer.select(pageWrap.item);
    };
    
    /**
     * 得到pageId
     */
    PANEL_PAGE_RADIO_ADAPTER.$retrievalPageId = function () {
        return arguments[0];
    }
    
    /**
     * 更改标题
     */
    PANEL_PAGE_RADIO_ADAPTER.$setTitle = function (pageId, title) {
        // not supported yet
    }
        
})();

/**
 * di.shared.model.PanelPageTabAdapter
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    PanelPageManager的适配器（TAB型）
 * author:  sushuang(sushuang)
 * depend:  
 */

$namespace('di.shared.model');

(function () {
    
    /* 外部引用 */
    var inheritsModel = ecui.inheritsModel, 
        bind, hasValue, isString,
        UI_CONTROL, UI_TAB_CONTAINER, UI_RADIO_CONTAINER,
        XDATASOURCE = xui.XDatasource,
        LINKED_HASH_MAP;
        
    $link(function () {
        bind = ecui.xfn.bind;
        isString = ecui.xlang.isString;
        hasValue = ecui.xlang.hasValue;
        UI_CONTROL = ecui.ui.Control;
        UI_TAB_CONTAINER = ecui.ui.TabContainer;
        UI_RADIO_CONTAINER = ecui.ui.RadioContainer;
        LINKED_HASH_MAP = ecui.ext.LinkedHashMap;
    });
    
    /* 类型声明 */
    var PANEL_PAGE_TAB_ADAPTER = $namespace().PanelPageTabAdapter = {};
        
    /**
     * 绑定事件
     */
    PANEL_PAGE_TAB_ADAPTER.$bind = function () {
        this._uPanelPageContainer.onbeforechange = bind(this.$pageBeforeChangeHandler, this);
        this._uPanelPageContainer.onafterchange = bind(this.$pageAfterChangeHandler, this);
        this._uPanelPageContainer.ontabclose = bind(this.$pageCloseHandler, this);
    };
    
    /**
     * 增加item
     */
    PANEL_PAGE_TAB_ADAPTER.$addItem = function (panelPage, options) {
        var o = this._uPanelPageContainer.addTab(
            function (el, parent) {
                return panelPage(
                    { 
                        el: el, 
                        parent: parent, 
                        pageId: options.pageId
                    }
                );
            }, 
            {
                title: options.title,
                index: options.index,
                canClose: options.canClose,
                memo: options.pageId
            }
        );
        return {content: o.tabContent, item: o.tabItem};
    };
    
    /**
     * 选择item
     */
    PANEL_PAGE_TAB_ADAPTER.$selectItem = function (pageWrap) {
        this._uPanelPageContainer.selectTab(pageWrap.item);
    };
        
    
    /**
     * 得到pageId
     */
    PANEL_PAGE_TAB_ADAPTER.$retrievalPageId = function () {
        var item = arguments[0];
        return item.getMemo();
    }

    /**
     * 更改标题
     */
    PANEL_PAGE_TAB_ADAPTER.$setTitle = function (pageId, title) {
        var pageWrap = this._oPanelPageSet.get(pageId);
        pageWrap && pageWrap.item.setTitle(title);
    }    
    
})();

/**
 * di.shared.model.TableModel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:   表格Model的基类，
 *          支持前台分页、排序，后台分页、排序，
 *          各表格页面Model可继承或聚合此类
 * @author: sushuang(sushuang)
 * @depend: xui, xutil, ecui
 */

$namespace('di.shared.model');

/**
 * @usage 先调用prepareArgs准备参数（用cmd和changeArgs指定参数），
 *        再调用persistent进行模型刷新，最后用getData获取显示数据。
 *
 * 数据格式说明：
 *    {Object|Array{Object}} sortInfo 排序信息
 *        如果为Object，结构为：
 *        {string} orderby 'asc'或'desc'或空
 *        {string} sortby 根据什么列排序
 *        如果为Array，则示按多列排序，
 *        第一列作为主排序在getData时会被返回，不常用
 *    {(Object|PageInfo)} pageInfo 分页信息
 *        {number} disabled 是否禁用
 *        {number} totalRecordCount 总记录数
 *        {number} pageSize 每页大小
 *        {number} currentPage 当前页号，从1开始
 */
(function() {
    
    //-------------------------------------------
    // 引用
    //-------------------------------------------

    var xobject = xutil.object;
    var xlang = xutil.lang;
    var extend = xobject.extend;
    var inheritsObject = xobject.inheritsObject;
    var q = xutil.dom.q;
    var g = xutil.dom.g;
    var sortList = xutil.collection.sortList;
    var hasValue = xlang.hasValue;
    var isArray = xlang.isArray;
    var XDATASOURCE = xui.XDatasource;
    var DICT = di.config.Dict;
    var URL = di.config.URL;
    var PAGE_INFO;

    $link(function() {
        PAGE_INFO = di.shared.model.PageInfo;
    });

    //-------------------------------------------
    // 类型定义
    //-------------------------------------------

    /**
     * 表格模型基础类
     *
     * @class
     * @extend xui.XDatasource
     */
    var TABLE_MODEL = 
            $namespace().TableModel = 
            inheritsObject(XDATASOURCE, constructor);
    var TABLE_MODEL_CLASS = TABLE_MODEL.prototype;

    TABLE_MODEL_CLASS.DEFAULT_PAGE_SIZE = 20;

    //-------------------------------------------
    // 方法
    //-------------------------------------------

    /**
     * 构造方法
     * 
     * @constructor
     * @private
     */
    function constructor() {
        /**
         * 所有数据
         * （在使用前端分页时，这是数据的全集）
         *
         * @type {Array.<Object>}
         * @private
         */
        this._oDatasource = [];
        /**
         * 数据信息包装（包括当页数据，分页信息，排序信息）
         *
         * @type {Object}
         * @private
         */
        this._oWrap = {
            sortInfo: {},
            pageInfo: new PAGE_INFO(),
            pageData: []
        }
    }

    /**
     * 获取数据（包括当页数据，分页信息，排序信息）
     *
     * @public
     * @return {Object} 显示数据
     *          {Array} pageData
     *          {Object} sortInfo
     *          {PageInfo} pageInfo
     */
    TABLE_MODEL_CLASS.getData = function() {
        var ret = extend({}, this._oWrap);
        ret.sortInfo = this.$getMainSortInfo(ret.sortInfo);
        return ret;
    };

    /**
     * 获得数据信息封装（包括当页数据，分页信息，排序信息）
     *（返回原引用而非副本，派生类中使用）
     *
     * @protected
     * @return {Object} 数据信息封装
     *          {Array} pageData
     *          {Object} sortInfo
     *          {PageInfo} pageInfo     
     */
    TABLE_MODEL_CLASS.$getWrap = function() {
        return this._oWrap;
    };

    /**
     * 获取所有数据
     *
     * @public
     * @return {Array.<Object>} 所有数据
     */
    TABLE_MODEL_CLASS.getDatasource = function() {
        return this._oDatasource || [];
    };

    /**
     * 准备参数
     *
     * @public
     * @param {string} cmd 命令，
     *          默认的有'CMD_INIT', 'CMD_SORT', 
     *          'CMD_PAGE_CHANGE', 'CMD_PAGE_SIZE_CHANGE'
     * @param {Object} changeArgs 需要改变的参数参数，
     *          结构如下，只传需要改变的属性
     *          {(Object|Array.<Object>)} sortInfo
     *          {(Object|PageInfo)} pageInfo
     * @return {Object} initArgs
     *          {Object} sortInfo
     *          {PageInfo} pageInfo
     */
    TABLE_MODEL_CLASS.prepareArgs = function(cmd, changeArgs) {
        var wrap = this._oWrap;
        return this['$' + cmd](cmd, changeArgs);
    };

    /**
     * 持久化Model
     *
     * @public
     * @param {Object} datasource 数据源，如果不传则使用已经持久化的数据源
     * @param {Object} initArgs 初始化参数，根据此参数初始化
     *          {(Object|Array.<Object>)} sortInfo
     *          {(Object|PageInfo)} pageInfo
     * @param {boolean} useRawData 不处理数据（用于后台分页和排序），缺省是false
     */
    TABLE_MODEL_CLASS.persistent = function(datasource, initArgs, useRawData) {
        this._oWrap = extend({}, initArgs);
        this._oDatasource = datasource || this._oDatasource;

        if (useRawData) {
            this._oWrap.pageData = datasource;
        } 
        else {
            this._oWrap.pageInfo.totalRecordCount = this._oDatasource.length;
            this.$sortTable(datasource, this._oWrap.sortInfo);
            this._oWrap.pageData = this.$pagingTable(
                datasource, 
                this._oWrap.pageInfo
            );
        }
    };


    /**
     * 命令处理，生成initArgs，可添加或重载
     *
     * @protected
     */
    TABLE_MODEL_CLASS.$CMD_INIT = function(cmd, changeArgs) {
        var wrap = this._oWrap;
        var initArgs = {};
        var pageSize = wrap.pageInfo.pageSize;
        initArgs.sortInfo = this.$initSortInfo();
        initArgs.pageInfo = this.$initPageInfo();
        pageSize && (initArgs.pageInfo.pageSize = pageSize);
        return initArgs;
    };
    TABLE_MODEL_CLASS.$CMD_SORT = function(cmd, changeArgs) {
        var wrap = this._oWrap;
        var initArgs = {};
        var pageSize = wrap.pageInfo.pageSize;
        if (this.$getMainSortInfo(changeArgs.sortInfo).sortby != 
                this.$getMainSortInfo(wrap.sortInfo).sortby
        ) {
            initArgs.sortInfo = this.$changeSortby(
                this.$getMainSortInfo(changeArgs.sortInfo).sortby
            );
        } else {
            initArgs.sortInfo = wrap.sortInfo;
            this.$getMainSortInfo(initArgs.sortInfo).orderby = 
                this.$changeOrderby(initArgs.sortInfo);
        }
        initArgs.pageInfo = wrap.pageInfo;
        pageSize && (initArgs.pageInfo.pageSize = pageSize);
        return initArgs;
    };
    TABLE_MODEL_CLASS.$CMD_CHANGE_PAGE = function(cmd, changeArgs) {
        var wrap = this._oWrap;
        var initArgs = {};
        var pageSize = wrap.pageInfo.pageSize;
        initArgs.sortInfo = wrap.sortInfo;
        initArgs.pageInfo = wrap.pageInfo;
        initArgs.pageInfo.currentPage = Number(
            changeArgs.pageInfo.currentPage
        );
        pageSize && (initArgs.pageInfo.pageSize = pageSize);
        return initArgs;
    };
    TABLE_MODEL_CLASS.$CMD_CHANGE_PAGE_SIZE = function(cmd, changeArgs) {
        var wrap = this._oWrap; 
        var initArgs = {};
        var pageSize = wrap.pageInfo.pageSize;
        initArgs.sortInfo = this.$initSortInfo();
        initArgs.pageInfo = this.$initPageInfo();
        initArgs.pageInfo.pageSize = Number(
            changeArgs.pageInfo.pageSize
        );
        return initArgs;
    };

    /**
     * 默认的pageInfo初始化，可重载
     *
     * @protected
     * @return {PageInfo} pageInfo
     */
    TABLE_MODEL_CLASS.$initPageInfo = function() {
        return new PAGE_INFO(
            {
                disabled: false,
                currentPage: 1,
                pageSize: this.DEFAULT_PAGE_SIZE
            }
        );
    };

    /**
     * 默认的sortInfo初始化，可重载
     * 
     * @protected
     * @return {(Object|Array.<Object>)} sortInfo
     */
    TABLE_MODEL_CLASS.$initSortInfo = function() {
        return { sortby: null, orderby: null, dataField: null };
    };

    /**
     * 修改sortby，可重载
     * 
     * @protected
     * @param {string} newSortby
     * @return {(Object|Array.<Object>)} sortInfo
     */
    TABLE_MODEL_CLASS.$changeSortby = function(newSortby) {
        return { sortby: newSortby, orderby: null, dataField: newSortby };
    };

    /**
     * 修改orderby，可重载
     * 
     * @protected
     * @param {(Object|Array.<Object>)} oldSortInfo
     * @return {string} orderby
     */
    TABLE_MODEL_CLASS.$changeOrderby = function(oldSortInfo) {
        var sInfo = isArray(oldSortInfo) ? oldSortInfo[0] : oldSortInfo;
        return sInfo.orderby == 'asc' ? 'desc' : 'asc'; 
    };

    /**
     * 表格排序
     * 会更新输入的原数据集和sortInfo的orderby字段
     * 不支持“还原成默认”，只在asc和desc间切换
     * 
     * @protected
     * @param {Array{Object}} datasource
     * @param {(Object|Array.<Object>)} sortInfo
     */
    TABLE_MODEL_CLASS.$sortTable = function(datasource, sortInfo) {
        if (!datasource || !sortInfo) { 
            return; 
        }
        
        var sortInfoArr = isArray(sortInfo) ? sortInfo : [sortInfo];
        for (
            var i = sortInfoArr.length - 1, o, compareFunc; 
            o = sortInfoArr[i]; 
            i --
        ) {
            if (hasValue(o.dataField) && o.orderby) {
                compareFunc = o.orderby == 'asc' ? '<' : '>'; 
                sortList(datasource, o.dataField, compareFunc, false);
            }
        }
    };    
    
    /**
     * 前端表格分页
     * 
     * @protected
     * @param {Array.<Object>} datasource
     * @param {(Object|PageInfo)} pageInfo
     * @return {Array} 当前页数据
     */
    TABLE_MODEL_CLASS.$pagingTable = function(datasource, pageInfo) {
        var start;
        var length;
        var ret = [];
        if (pageInfo.disabled) {
            start = 0;
            length = datasource.length;
        } else {
            start = (pageInfo.currentPage - 1) * pageInfo.pageSize;
            length = pageInfo.pageSize;
        }
        for (
            var i = 0, o; 
            i < length && (o = datasource[start + i]); 
            i ++
        ) {
            ret.push(o);
        }
        return ret;
    };

    /**
     * 得到主sortInfo
     *
     * @protected
     */
    TABLE_MODEL_CLASS.$getMainSortInfo = function(sortInfo) {
        return isArray(sortInfo) ? sortInfo[0] : sortInfo;
    };  

})();

/**
 * di.shared.model.UserModel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用模型] 用户数据模型
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.shared.model');

(function () {
    
    /* 外部引用 */
    var inheritsModel = ecui.inheritsModel,
        XDATASOURCE = xui.XDatasource;
        
    $link(function () {
    });
    
    /* 类型声明 */
    var USER_MODEL = $namespace().UserModel = inheritsModel(XDATASOURCE),
        USER_MODEL_CLASS = USER_MODEL.prototype;
        
    /**
     * 获得用户Id
     * @public
     * 
     * @return {string} 用户id
     */
    USER_MODEL_CLASS.getUserId = function () {
        // TODO
    };    
    
})();

/**
 * di.shared.ui.InteractEntity
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    Base Entity
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var assign = xutil.object.assign;
    var addClass = xutil.dom.addClass;
    var isObject = xutil.lang.isObject;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var getByPath = xutil.object.getByPath;
    var XOBJECT = xui.XObject;
    var LANG = di.config.Lang;
    var alert;
    
    $link(function () {
        alert = di.helper.Dialog.alert;
    });    

    /**
     * Base Entity
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {HTMLElement} options.el 容器元素
     * @param {Function=} options.commonParamGetter 
     *      得到公用的请求参数     
     */
    var INTERACT_ENTITY = $namespace().InteractEntity = 
        inheritsObject(
            XOBJECT,
            function (options) {

                // di开始必须
                this.$di('start', options);

                // 统一注册事件代理
                this.$di('registerEventAgent');

                // 禁用自身的notify和attach（只允许使用$di提供的）
                this.notify = this.attach = this.attachOnce =                 
                    function () {
                        throw new Error('Forbiden function');
                    };

                // 挂主cssClass
                var el = this.$di('getEl');
                var className = this.DEF.className;
                el && className && addClass(el, className);

                // 根据DEF创建model
                this.$createModelByDef(options);

                // 创建view
                this.$createView && this.$createView(options);
            }
        );
    var INTERACT_ENTITY_CLASS = INTERACT_ENTITY.prototype;
    
    /**
     * 定义信息
     */
    INTERACT_ENTITY_CLASS.DEF = {};

    /**
     * 根据定义信息，创建model
     *
     * @private
     */
    INTERACT_ENTITY_CLASS.$createModelByDef = function (options) {
        var modelDef = this.DEF.model;
        if (!modelDef) { return; }

        var clz = modelDef.clz 
            || (modelDef.clzPath && getByPath(modelDef.clzPath));
        if (!clz) { return; }

        // 创建model实例
        this._mModel = new clz(
            assign(
                {
                    commonParamGetter: this.$di('getCommonParamGetter'),
                    diFactory: this.$di('getDIFactory')
                },
                this.$createModelInitOpt(options)
            )
        );

        // 绑定默认方法   
        this._mModel.ajaxOptions = {
            defaultFailureHandler:
                bind(this.$defaultFailureHandler, this)
        };
    };

    /**
     * 得到model初始化参数
     * 由派生类自行实现
     *
     * @protected
     * @return {Object} 初始化参数
     */
    INTERACT_ENTITY_CLASS.$createModelInitOpt = function (options) {
        return {};
    };

    /**
     * 得到model
     *
     * @public
     * @return {Object} model
     */
    INTERACT_ENTITY_CLASS.getModel = function () {
        return this._mModel;
    };

    /**
     * 组装model sync的参数的统一方法
     *
     * @protected
     * @param {Object} model
     * @param {string} datasourceId
     * @param {Object} param
     * @param {Object} diEvent
     * @param {Object} opt
     */
    INTERACT_ENTITY_CLASS.$sync = function (
        model, datasourceId, param, diEvent, opt
    ) {
        var o = {
            datasourceId: datasourceId,
            args: {
                param: param,
                diEvent: diEvent
            }
        }
        assign(o.args, opt);
        return model.sync(o);
    };

    /**
     * 创建或得到dievent的方便方法
     * 用法一：$diEvent(options) 
     *      则得到options中的原有的diEvent（可能为undefined） 
     * 用法二：$diEvent('someEventName', options) 
     *      则得到事件名为'someEventName'的衍生diEvent，
     *      或者（没有使用diEvent时）得到eventnName本身
     *
     * @protected
     * @param {(string|Object)} eventName 如果为对象则表示此参数为options
     * @param {string=} options 走xdatasource的options，里面含有传递的diEvent属性
     */
    INTERACT_ENTITY_CLASS.$diEvent = function (eventName, options) {
        if (arguments.length == 1 && isObject(eventName)) {
            options = eventName;
            eventName = null;
        }

        var diEvent = options.args.diEvent;
        return eventName
            ? (diEvent ? diEvent(eventName) : eventName)
            : diEvent;
    };

    /**
     * sync时的解禁操作
     *
     * @protected
     */
    INTERACT_ENTITY_CLASS.$syncEnable = function (datasourceId) {
        this.$di('syncViewDisable', 'enable', datasourceId);
        this.$di('enable', 'DI_SELF_' + datasourceId);
    };

    /**
     * sync时的禁用操作
     *
     * @protected
     */
    INTERACT_ENTITY_CLASS.$syncDisable = function (datasourceId) {
        this.$di('syncViewDisable', 'disable', datasourceId);
        this.$di('disable', 'DI_SELF_' + datasourceId);
    };

    /**
     * 请求失败的默认处理
     *
     * @protected
     */
    INTERACT_ENTITY_CLASS.$defaultFailureHandler = function (status, ejsonObj) {
        var eventChanel = this.$di('getEventChannel');

        switch (status) {
            case 10001: // session 过期
                eventChanel.triggerEvent('sessiontimeout');
                alert(LANG.SAD_FACE + LANG.RE_LOGIN, null, true);
                break;
            case 20001: // olap查询参数错误，由应用程序自己处理
                break;
            default:
                alert(LANG.SAD_FACE + LANG.ERROR);
        }
    };

})();
/**
 * di.shared.ui.BaseConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    简单配置面板的基类，做一些共性的事情，
 *           配置面板可继承此类。
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var URL = di.config.URL;
    var DIALOG = di.helper.Dialog;
    var UTIL = di.helper.Util;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var createDom = ecui.dom.create;
    var getStyle = ecui.dom.getStyle;
    var triggerEvent = ecui.triggerEvent;
    var disposeControl = ecui.dispose;
    var ecuiCreate = UTIL.ecuiCreate;
    var disposeInnerControl = UTIL.disposeInnerControl;
    var template = xutil.string.template;
    var toShowText = xutil.string.toShowText;
    var q = xutil.dom.q;
    var inheritsObject = xutil.object.inheritsObject;
    var hasValueNotBlank = xutil.lang.hasValueNotBlank;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var textLength = xutil.string.textLength;
    var textSubstr = xutil.string.textSubstr;
    var stringToDate = xutil.date.stringToDate;
    var trim = xutil.string.trim;
    var bind = xutil.fn.bind;
    var XVIEW = xui.XView;
    var UI_FORM = ecui.ui.Form;
    var UI_BUTTON = ecui.ui.Button;
        
    $link(function() {
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 简单配置面板的基类，做一些共性的事情
     * 派生类可使用单例(xutil.object.createSingle)
     * 
     * @class
     * @extends xui.XView
     */
    var BASE_CONFIG_PANEL = $namespace().BaseConfigPanel = 
            inheritsObject(XVIEW, constructor);
    var BASE_CONFIG_PANEL_CLASS = BASE_CONFIG_PANEL.prototype;

    //-----------------------------------
    // 模板
    //-----------------------------------

    var TPL_MAIN = [
            '<div class="q-di-form">',
                '<label>#{0}</label>',
                '#{1}',
                '<div>',
                    '<div class="di-dim-select-btn">',
                        '<div class="ui-button-g ui-button q-di-submit">确定</div>',
                        '<div class="ui-button q-di-cancel">取消</div>',
                    '</div>',
                '<div>',
            '</div>'
        ].join('');

    //-----------------------------------
    // 待实现的抽象方法
    //-----------------------------------

    /**
     * 创建View
     *
     * @abstract
     * @protected
     * @param {Object} options 初始化参数
     */
    BASE_CONFIG_PANEL_CLASS.$doCreateView = function(options) {
    };

    /**
     * 创建Model
     *
     * @abstract
     * @protected
     * @param {Object} options 初始化参数
     */
    BASE_CONFIG_PANEL_CLASS.$doCreateModel = function(options) {
        this._mModel;
    };

    /**
     * 得到model
     *
     * @abstract
     * @protected
     * @return {xui.XDatasource} model
     */
    BASE_CONFIG_PANEL_CLASS.$doGetModel = function() {
        // 如果中派生类中的model就用this._mModel命名，则不用重载这个方法
        return this._mModel;
    };

    /**
     * 其他初始化
     *
     * @abstract
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$doInit = function() {
    };

    /**
     * 得到内容tpl
     *
     * @abstract
     * @protected
     * @param {Object} options 初始化参数
     * @return {string} 内容的html模板
     */
    BASE_CONFIG_PANEL_CLASS.$doGetInnerTPL = function(options) {
        return '';
    };

    /**
     * 重置输入
     * 
     * @abstract
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$doResetInput = function() {
    };

    /**
     * 渲染内容
     * 
     * @abstract
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$doRender = function() {
    };

    /**
     * 其他启用
     * 
     * @abstract
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$doEnable = function() {
    };

    /**
     * 其他禁用
     * 
     * @abstract
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$doDisable = function() {
    };

    /**
     * 其他禁用
     * 
     * @abstract
     * @protected
     * @return {Object} 提交参数包装，如{ aaa: 1, bbb: '123' }
     */
    BASE_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
    };

    /**
     * 析构
     * 
     * @abstract
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$doDispose = function() {
        // 一般不用实现
    };

    //-----------------------------------
    // 已实现的方法
    //-----------------------------------

    /**
     * 构造函数
     *
     * @constructor
     * @param {Object} options 初始化参数
     * @param {string} options.cssName 主css名字 
     * @param {string} options.panelTitle 标题 
     */
    function constructor(options) {

        // 创建Model
        this.$doCreateModel(options);

        // 创建主dom
        var el = this._eMain = createDom(
            options.cssName || 'di-config-panel'
        );
        document.body.appendChild(el);
        el.innerHTML = template(
            TPL_MAIN, 
            toShowText(options.panelTitle || this.PANEL_TITLE, '', true),
            this.$doGetInnerTPL(options)
        );

        // 创建基本控件
        this._uForm = ecuiCreate(
            UI_FORM,
            q('q-di-form', el)[0],
            null,
            { hide: true }
        );
        this._uSubmitBtn = ecuiCreate(
            UI_BUTTON,
            q('q-di-submit', el)[0]
        );
        this._uCancelBtn = ecuiCreate(
            UI_BUTTON,
            q('q-di-cancel', el)[0]
        );        

        // 创建其他View
        this.$doCreateView(options);

        // 初始化
        this.init();
    }

    /**
     * @override
     */
    BASE_CONFIG_PANEL_CLASS.init = function() {
        var me = this;

        // 事件绑定
        this.$doGetModel().attach(
            ['sync.preprocess.INIT', this.disable, this],
            ['sync.result.INIT', this.$handleInitSuccess, this],
            ['sync.error.INIT', this.$handleInitError, this],
            ['sync.complete.INIT', this.enable, this]
        );
        this.$doGetModel().attach(
            ['sync.preprocess.SUBMIT', this.disable, this],
            ['sync.result.SUBMIT', this.$handleSubmitSuccess, this],
            ['sync.error.SUBMIT', this.$handleSubmitError, this],
            ['sync.complete.SUBMIT', this.enable, this]
        );
        this._uSubmitBtn.onclick = bind(this.$submitHandler, this);
        this._uCancelBtn.onclick = bind(this.$cancelHandler, this);

        // Init
        this._uForm.init();
        this._uSubmitBtn.init();
        this._uCancelBtn.init();

        // 其他初始化
        this.$doInit();

        this.$doResetInput();
    };
    
    /**
     * @override
     */
    BASE_CONFIG_PANEL_CLASS.dispose = function() {
        this._uForm && this._uForm.dispose();
        this._uSubmitBtn && this._uSubmitBtn.dispose();
        this._uCancelBtn && this._uCancelBtn.dispose();

        // 其他析构
        this.$doDispose();

        BASE_CONFIG_PANEL.superClass.dispose.call(this);
    };

    /**
     * 打开面板
     *
     * @public
     * @param {string} mode 可取值：
     *                       'VIEW': 查看
     *                       'EDIT': 修改
     * @param {Object} options open 参数
     */
    BASE_CONFIG_PANEL_CLASS.open = function(mode, options) {
        this._sMode = mode;
        this._oOpenOptions = options;

        this.$doResetInput();

        // 每次打开时从后台获取初始值
        if (!this.IGNORE_INIT_SYNC) {
            this.$doGetModel().sync(
                { 
                    datasourceId: this.DATASOURCEID_INIT || 'INIT', 
                    args: this._oOpenOptions
                }
            );
        }
    };

    /**
     * 解禁操作
     *
     * @override
     * @public
     */
    BASE_CONFIG_PANEL_CLASS.enable = function() {
        if (this._bDisabled && this._sMode == 'EDIT') {
            this._uSubmitBtn.enable();
            this._uCancelBtn.enable();
            // 其他启用
            this.$doEnable();
        }
        BASE_CONFIG_PANEL.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @override
     * @public
     */
    BASE_CONFIG_PANEL_CLASS.disable = function() {
        if (!this._bDisabled) {
            this._uSubmitBtn.disable();
            this._uCancelBtn.disable();
            // 其他禁用
            this.$doDisable();
        }
        BASE_CONFIG_PANEL.superClass.disable.call(this);
    };    

    /**
     * 提交事件处理
     *
     * @protected
     * @event
     */
    BASE_CONFIG_PANEL_CLASS.$submitHandler = function() {
        this._mDimSelectModel.sync(
            { 
                datasourceId: DATASOURCEID_SUBMIT || 'SUBMIT',
                args: extend({}, this._oOpenOptions, this.$doGetSubmitArgs())
            }
        );
    };

    /**
     * 取消事件处理
     *
     * @protected
     * @event
     */
    BASE_CONFIG_PANEL_CLASS.$cancelHandler = function() {
        this._uForm.hide();
    };

    /**
     * 初始数据成功结果处理
     *
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$handleInitSuccess = function() {
        try {
            this._uForm.showModal(DICT.DEFAULT_MASK_OPACITY);

            // 渲染内容
            this.$doRender();
            
            this._uForm.center();
        }
        catch (e) {
            // 需求变化性很大，数据源很杂，不敢保证返回数据总是匹配，
            // 所以用try catch
            this.$handleInitError();
        }
    };

    /**
     * 原因添加失败结果处理
     *
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$handleInitError = function() {
        var me = this;
        // 获取初始数据出错，提示并关闭面板
        DIALOG.alert(
            LANG.GET_DIM_TREE_ERROR,
            function() {
                me._uForm.hide();
            }
        );
    };

    /**
     * 原因添加成功结果处理
     *
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$handleSubmitSuccess = function() {
        this._uForm.hide();
        /**
         * @event di.shared.ui.DimSelectPanel#submit.close
         */
        this.notify('submit.close');
    };

    /**
     * 原因添加失败结果处理
     *
     * @protected
     */
    BASE_CONFIG_PANEL_CLASS.$handleSubmitError = function(status) {
        DIALOG.alert(LANG.SAVE_FAILURE);
    };

})();

/**
 * di.shared.ui.DIChart
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    DI 图视图组件
 * @author:  xxx(xxx)
 * @depend:  xui, xutil
 */

$namespace('di.shared.ui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var download = UTIL.download;
    var foreachDo = UTIL.foreachDo;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    var H_CHART;
        
    $link(function () {
        H_CHART = xutil.object.getByPath('xui.ui.HChart');
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * DI 图视图组件
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     */
    var DI_CHART = $namespace().DIChart = 
        inheritsObject(INTERACT_ENTITY);
    var DI_CHART_CLASS = DI_CHART.prototype;
    
    //------------------------------------------
    // 常量 
    //------------------------------------------

    var TPL_MAIN = [
        '<div class="q-di-chart"></div>',
    ].join('');

    /**
     * 暴露给interaction的api
     */
    DI_CHART_CLASS.EXPORT_HANDLER = {
        sync: { datasourceId: 'DATA' },
        syncX: { datasourceId: 'X_DATA' },
        syncS: { datasourceId: 'S_DATA' },
        syncSAdd: { datasourceId: 'S_ADD_DATA' },
        syncSRemove: { datasourceId: 'S_REMOVE_DATA' },
        clear: {}
    };

    /**
     * 定义
     */
    DI_CHART_CLASS.DEF = {
        // 暴露给interaction的api
        exportHandler: {
            sync: { datasourceId: 'DATA' },
            syncX: { datasourceId: 'X_DATA' },
            syncS: { datasourceId: 'S_DATA' },
            syncSAdd: { datasourceId: 'S_ADD_DATA' },
            syncSRemove: { datasourceId: 'S_REMOVE_DATA' },
            clear: {}
        },
        // 主元素的css
        className: 'di-chart',
        // model配置
        model: {
            clzPath: 'di.shared.model.DIChartModel'
        }
    };


    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建View
     *
     * @private
     * @param {Object} options 参数
     */
    DI_CHART_CLASS.$createView = function (options) {
        var el = this.$di('getEl');

        // 模板
        var tplMode = this.$di('getTplMode');
        if (tplMode != 'FROM_SNIPPET') {
            el.innerHTML = TPL_MAIN;
        }

        this._uChart = tplMode == 'FROM_SNIPPET'
            ? this.$di('vuiCreate', 'mainChart')
            : new H_CHART({ el: q('q-di-chart', el)[0] });

        // 下载按钮
        this._uDownloadBtn = this.$di('vuiCreate', 'download');

        // 离线下载
        this._uOfflineDownloadBtn = this.$di('vuiCreate', 'offlineDownload');
    };

    /**
     * 初始化
     *
     * @public
     */
    DI_CHART_CLASS.init = function () {
        var key;
        var exportHandler = this.DEF.exportHandler;
        
        // 事件绑定
        for (key in exportHandler) {
            var id = exportHandler[key].datasourceId;
            this.getModel().attach(
                ['sync.preprocess.' + id, this.$syncDisable, this, id],
                ['sync.result.' + id, this.$renderMain, this],
                ['sync.result.' + id, this.$handleDataLoaded, this],
                ['sync.error.' + id, this.$handleDataError, this],
                ['sync.complete.' + id, this.$syncEnable, this, id]
            );
        }
        key = 'OFFLINE_DOWNLOAD';
        this.getModel().attach(
            ['sync.preprocess.' + key, this.$syncDisable, this, key],
            ['sync.error.' + key, this.$handleOfflineDownloadError, this],
            ['sync.complete.' + key, this.$syncEnable, this, key]
        );
        this._uDownloadBtn && (
            this._uDownloadBtn.onclick = bind(this.$handleDownload, this)
        );
        this._uOfflineDownloadBtn && (
            this._uOfflineDownloadBtn.attach('confirm', this.$handleOfflineDownload, this)
        );

        foreachDo(
            [
                this.getModel(),
                this._uChart, 
                this._uDownloadBtn,
                this._uOfflineDownloadBtn
            ], 
            'init'
        );
    };

    /**
     * @override
     */
    DI_CHART_CLASS.dispose = function () {
        this._uChart && this._uChart.$di('dispose');
        DI_CHART.superClass.dispose.call(this);
    };

    /**
     * 从后台获取数据并渲染
     *
     * @public
     * @param {Object} options 参数
     */
    (function () {
        var exportHandler = DI_CHART_CLASS.DEF.exportHandler;
        for (var funcName in exportHandler) {
            DI_CHART_CLASS[funcName] = getSyncMethod(
                exportHandler[funcName].datasourceId
            );
        }
        function getSyncMethod(datasourceId) {
            return function (options) {
                // 视图禁用
                /*
                var diEvent = this.$di('getEvent');
                var vd = diEvent.viewDisable;
                vd && this.getModel().attachOnce(
                    ['sync.preprocess.' + datasourceId, vd.disable],
                    ['sync.complete.' + datasourceId, vd.enable]
                );*/

                // 请求后台
                this.$sync(
                    this.getModel(),
                    datasourceId,
                    (options || {}),
                    this.$di('getEvent')
                );
            };
        }
    })();

    /**
     * 清空视图
     * 
     * @public
     */
    DI_CHART_CLASS.clear = function () {  
        this._uChart && this._uChart.$di('setData');
    };

    /**
     * 渲染主体
     * 
     * @protected
     */
    DI_CHART_CLASS.$renderMain = function (data, ejsonObj, options) {
        this._uChart.$di(
            'setData', 
            this.getModel().getChartData(),
            { diEvent: this.$diEvent(options) }
        );
        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
    };

    /**
     * 窗口改变后重新计算大小
     *
     * @public
     */
    DI_CHART_CLASS.resize = function () {
    };

    /**
     * 解禁操作
     *
     * @protected
     */
    DI_CHART_CLASS.enable = function () {
        foreachDo(
            [this._uChart, this._uDownloadBtn, this._uOfflineDownloadBtn], 
            'enable'
        );
        DI_CHART.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     */
    DI_CHART_CLASS.disable = function () {
        foreachDo(
            [this._uChart, this._uDownloadBtn, this._uOfflineDownloadBtn], 
            'disable'
        );
        DI_CHART.superClass.disable.call(this);
    };    

    /**
     * 下载操作
     *
     * @protected
     */
    DI_CHART_CLASS.$handleDownload = function (wrap) {
        var commonParamGetter = this.$di('getCommonParamGetter');

        var url = URL('OLAP_CHART_DOWNLOAD') 
            + '?' + commonParamGetter();
        download(url, null, true);

        // 对于下载，不进行reportTemplateId控制，直接打开
        commonParamGetter.update();
    };

    /**
     * 离线下载操作
     *
     * @protected
     */
    DI_CHART_CLASS.$handleOfflineDownload = function () {
        var val = this._uOfflineDownloadBtn.getValue() || {};
        this.$sync(
            this.getModel(),
            'OFFLINE_DOWNLOAD',
            { email: val.email }
        );
    };

    /**
     * 数据加载成功
     * 
     * @protected
     */
    DI_CHART_CLASS.$handleDataLoaded = function  (data, ejsonObj, options) {
        /**
         * 数据成功加载事件（分datasourceId）
         *
         * @event
         */
        this.$di(
            'dispatchEvent', 
            this.$diEvent('dataloaded.' + options.datasourceId, options)
        );

        /**
         * 数据成功加载事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('dataloaded', options));
    };

    /**
     * 获取数据错误处理
     * 
     * @protected
     */
    DI_CHART_CLASS.$handleDataError = function (status, ejsonObj, options) {

        // 设置空视图
        this.clear();

        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
        /**
         * 数据加载失败事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('dataerror', options));
    };

    /**
     * 离线下载错误处理
     * 
     * @protected
     */
    DI_CHART_CLASS.$handleOfflineDownloadError = function (status, ejsonObj, options) {
        DIALOG.alert(LANG.SAD_FACE + LANG.OFFLINE_DOWNLOAD_FAIL);
    };

})();
/**
 * di.shared.ui.DIForm
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    DI 表单视图组件
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var isObject = xutil.lang.isObject;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    var extend = xutil.object.extend;
    var OLAP_TABLE = ecui.ui.OlapTable;
    var BREADCRUMB = ecui.ui.Breadcrumb;
    var UI_BUTTON = ecui.ui.Button;

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * DI 表单视图组件
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {string} options.submitMode 提交方式，可选值为
     *      'IMMEDIATE'（输入后立即提交，默认）
     *      'CONFIRM'（按确定按钮后提交）
     * @param {(Object|boolean)=} options.confirmBtn 是否有确认按钮
     *      如果为Object则内容为，{ text: '按钮文字' }
     */
    var DI_FORM = $namespace().DIForm = 
        inheritsObject(INTERACT_ENTITY);
    var DI_FORM_CLASS = DI_FORM.prototype;

    /**
     * 定义
     */
    DI_FORM_CLASS.DEF = {
        // 暴露给interaction的api
        exportHandler: {
            sync: { datasourceId: 'DATA' },
            clear: {}
        },
        // 主元素的css
        className: 'di-form',
        // model配置
        model: {
            clzPath: 'di.shared.model.DIFormModel'
        }
    };

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建View
     *
     * @private
     * @param {Object} options 参数
     */
    DI_FORM_CLASS.$createView = function (options) {
        this._oOptions = extend({}, options);
        options.submitMode = options.submitMode || 'IMMEDIATE';

        // 创建参数输入控件
        this._aInput = [];
        for (var i = 0, o; o = this.$di('vuiCreate', 'input.' + i); i ++) {
            this._aInput.push(o);
            // 使用json格式传输数据
            o.$di('setOpt', 'cfgOpt', 'paramMode', 'JSON');
        }

        // 创建“确认”控件
        this._uConfirmBtn = this.$di('vuiCreate', 'confirm');
    };

    /**
     * 初始化
     *
     * @public
     */
    DI_FORM_CLASS.init = function() {
        var me = this;
        var i;
        var input;
        var def;
        var cfgOpt;

        // 绑定组件事件
        this.getModel().attach(
            ['sync.preprocess.DATA', this.$syncDisable, this, 'DATA'],
            ['sync.result.DATA', this.$renderMain, this],
            ['sync.result.DATA', this.$handleDataLoaded, this],
            ['sync.error.DATA', this.$handleDataError, this],
            ['sync.complete.DATA', this.$syncEnable, this, 'DATA'],

            // ASYNC不加disable，否则suggest框会在disasble的时候动input框，与输入法冲突。            
            // ['sync.preprocess.ASYNC_DATA', this.disable, this, 'DI_FORM'],
            ['sync.result.ASYNC_DATA', this.$renderAsync, this],
            ['sync.error.ASYNC_DATA', this.$handleAsyncError, this]
            // ['sync.complete.ASYNC_DATA', this.enable, this, 'DI_FORM']
        );

        // 绑定控件事件
        for (i = 0; input = this._aInput[i]; i ++ ) {
            def = input.$di('getDef');
            cfgOpt = input.$di('getOpt', 'cfgOpt');

            // 改变事件
            if (!cfgOpt.changeSilent) {
                input.$di(
                    'addEventListener',
                    'change',
                    this.$handleChange,
                    this
                );
            }

            // 异步取值事件
            if (cfgOpt.async) {
                input.$di(
                    'addEventListener',
                    'async',
                    this.$handleAsync,
                    this,
                    { bindArgs: [input] }
                );
            }
        }

        if (this._uConfirmBtn) {
            this._uConfirmBtn.onclick = function() {
                me.$submit();
            }
        }

        for (i = 0; input = this._aInput[i]; i ++ ) {
            input.$di('init');
        }
    };

    /**
     * @override
     */
    DI_FORM_CLASS.dispose = function() {
        for (var i = 0, input; input = this._aInput[i]; i ++ ) {
            input.$di('dispose');
        }
        DI_FORM.superClass.dispose.call(this);
    };

    /**
     * 从后台获取数据并渲染
     *
     * @public
     */
    DI_FORM_CLASS.sync = function(options) {

        // 视图禁用
        /*
        var diEvent = this.$di('getEvent');
        var vd = diEvent.viewDisable;
        vd && this.getModel().attachOnce(
            ['sync.preprocess.DATA',  vd.disable],
            ['sync.complete.DATA', vd.enable]
        );*/

        // 初始化参数
        var paramList = [];
        for (var i = 0, input; input = this._aInput[i]; i ++ ) {
            paramList.push(input.$di('getDef').name);
        }

        this.$sync(
            this.getModel(),
            'DATA',
            { paramList: paramList },
            this.$di('getEvent')
        );
    };

    /**
     * 清空视图
     *
     * @public
     */
    DI_FORM_CLASS.clear = function(options) {
        // TODO
    };

    /**
     * 提交
     *
     * @protected
     */
    DI_FORM_CLASS.$submit = function() {
        /**
         * 提交
         *
         * @event
         */
        this.$di('dispatchEvent', 'submit', [this.$di('getValue')]);
    };

    /**
     * 渲染主体
     * 
     * @protected
     */
    DI_FORM_CLASS.$renderMain = function(data, ejsonObj, options) {

        var setDataOpt = { diEvent: this.$diEvent(options) };

        // 设置数据并渲染
        var initData = this.getModel().getInitData();
        for (var i = 0, input; input = this._aInput[i]; i ++ ) {
            input.$di(
                'setData',
                initData[input.$di('getDef').name],
                setDataOpt
            );
        }

        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
    };

    /**
     * 渲染同步
     * 
     * @protected
     */
    DI_FORM_CLASS.$renderAsync = function(data, ejsonObj, options) {
        var args = options.args;
        args.callback(data[args.input.$di('getDef').name] || {});
    };

    /**
     * 窗口改变后重新计算大小
     *
     * @public
     */
    DI_FORM_CLASS.resize = function() {
    };

    /**
     * 解禁操作
     *
     * @protected
     */
    DI_FORM_CLASS.enable = function() {
        for (var i = 0, input; input = this._aInput[i]; i ++) {
            input.$di('enable');
        }
        this._uConfirmBtn && this._uConfirmBtn.$di('enable');
        DI_FORM.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     */
    DI_FORM_CLASS.disable = function() {
        for (var i = 0, input; input = this._aInput[i]; i ++) {
            input.$di('disable');
        }
        this._uConfirmBtn && this._uConfirmBtn.$di('disable');
        DI_FORM.superClass.disable.call(this);
    };    

    /**
     * 初始数据加载完成
     * 
     * @protected
     */
    DI_FORM_CLASS.$handleDataLoaded = function(data, ejsonObj, options) {
        /**
         * 初始数据加载完成
         *
         * @event
         */
        this.$di(
            'dispatchEvent', 
            this.$diEvent('dataloaded', options), 
            [this.$di('getValue')]
        );
    };

    /**
     * 条件变化事件
     *
     * @event
     * @protected
     */
    DI_FORM_CLASS.$handleChange = function() {
        if (this._oOptions.submitMode == 'IMMEDIATE') {
            this.$submit();
        }
    };

    /**
     * 异步取数据事件
     *
     * @event
     * @protected
     */
    DI_FORM_CLASS.$handleAsync = function(input, value, callback) {
        var name = input.$di('getDef').name;
        var arg = {};

        this.$sync(
            this.getModel(),
            'ASYNC_DATA',
            {
                paramName: name,
                arg: value
            },
            null,
            {
                value: value,
                callback: callback,
                input: input
            }
        );
    };

    /**
     * 获取数据错误处理
     * 
     * @protected
     */
    DI_FORM_CLASS.$handleDataError = function(status, ejsonObj, options) {
        // 清空视图
        this.clear();

        this.$di('dispatchEvent', this.$diEvent('rendered', options));
    };

    /**
     * 获取async数据错误处理
     * 
     * @protected
     */
    DI_FORM_CLASS.$handleAsyncError = function() {
        // TODO
        this.$di('dispatchEvent', 'rendered');
    };

})();
/**
 * di.shared.ui.DITab
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    DI tab容器
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var assign = xutil.object.assign;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var ecuiCreate = UTIL.ecuiCreate;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    var TAB_CONTAINER = ecui.ui.TabContainer;
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * DI tab容器
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {boolean=} options.autoDeaf 使用deaf模式，
     *                  即隐藏时deaf内部实体，默认为true
     * @param {boolean=} options.autoComponentValueDisabled component自动在隐藏时valueDisabled模式，
     *                  即隐藏时value disable内部实体，默认为false
     * @param {boolean=} options.autoVUIValueDisabled vui自动在隐藏时使用valueDisabled模式，
     *                  即隐藏时value disable内部实体，默认为true
     */
    var DI_TAB = $namespace().DITab = 
            inheritsObject(INTERACT_ENTITY, constructor);
    var DI_TAB_CLASS = DI_TAB.prototype;
    
    /**
     * 定义
     */
    DI_TAB_CLASS.DEF = {
        // 主元素的css
        className: 'di-tab',
    };

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @constructor
     * @public
     * @param {Object} options 参数
     */
    function constructor(options) {
        var el = this.$di('getEl');
        var o = document.createElement('div');
        el.appendChild(o);

        this._bAutoDeaf = options.autoDeaf == null ? true : options.autoDeaf;
        this._bAutoComponentValueDisabled = 
            options.autoComponentValueDisabled == null
                ? false : options.autoComponentValueDisabled;
        this._bAutoVUIValueDisabled = 
            options.autoVUIValueDisabled == null
                ? true : options.autoVUIValueDisabled;

        this._aTab = [];        
        // TODO
        // 后续要写成vui的形式，剥离ecui
        this._uTab = ecuiCreate(TAB_CONTAINER, o);
        this._aBodyPart = [];

        // 添加tab 创建vpart实例
        var tabs = this.$di('getRef', 'vpartRef', 'tab');
        var bodys = this.$di('getRef', 'vpartRef', 'body');
        for (var i = 0, tabDef, bodyDef; tabDef = tabs[i]; i ++) {
            bodyDef = bodys[i];
            this._aTab.push(
                this._uTab.addTab(
                    null, 
                    assign(
                        {
                            tabEl: tabDef.el,
                            contentEl: bodyDef.el
                        },
                        tabDef.$di('getOpt', 'dataOpt'),
                        ['title', 'canClose']
                    )
                )
            );

            this._aBodyPart.push(this.$di('vpartCreate', 'body.' + i));
        }
    };

    /**
     * 初始化
     *
     * @public
     */
    DI_TAB_CLASS.init = function() {
        var me = this;

        // 事件绑定
        this._uTab.onafterchange = function(ctrlItem, lastCtrlItem) {

            // 设置耳聋
            me.$resetDisabled();

            for (
                var i = 0, item, bodyPart; 
                bodyPart = me._aBodyPart[i], item = me._aTab[i]; 
                i ++
            ) {
                /** 
                 * vpart显示事件
                 * 
                 * @event
                 */
                if (item.tabItem == ctrlItem) {
                    bodyPart.$di('dispatchEvent', 'active');
                }
                /** 
                 * vpart隐藏事件
                 * 
                 * @event
                 */
                if (item.tabItem == lastCtrlItem) {
                    bodyPart.$di('dispatchEvent', 'inactive');
                }
            }

            /**
             * 渲染完毕事件
             *
             * @event
             */
            me.$di('dispatchEvent', 'rendered');
            /**
             * tab更改事件
             *
             * @event
             */
            me.$di('dispatchEvent', 'change');
        }

        var opt = this.$di('getOpt', 'dataOpt');
        // 默认选中
        var selIndex = opt.selected - 1;
        var sel;
        if (sel = this._aTab[selIndex]) {
            this._uTab.selectTab(sel.tabItem);
            me.$di('dispatchEvent', 'rendered');
        }

        this.$resetDisabled();

        sel && this._aBodyPart[selIndex].$di('dispatchEvent', 'active');
    };

    /**
     * @protected
     */
    DI_TAB_CLASS.$resetDisabled = function() {
        var key = this.$di('getId');
        var bodys = this.$di('getRef', 'vpartRef', 'body', 'DEF');

        for (var i = 0, tab, inners, notCurr; tab = this._aTab[i]; i ++) {
            notCurr = this._uTab.getSelected() != tab.tabItem;

            inners = bodys[i].$di(
                'getRef', 'componentRef', 'inner', 'INS'
            ) || [];

            for (var j = 0; j < inners.length; j ++) {
                if (inners[j]) {
                    this._bAutoDeaf 
                        && inners[j].$di('setDeaf', notCurr, key);
                    this._bAutoComponentValueDisabled 
                        && inners[j].$di('setValueDisabled', notCurr, key);
                }
            }

            if (this._bAutoVUIValueDisabled) {
                inners = bodys[i].$di(
                    'getRef', 'vuiRef', 'inner', 'INS'
                ) || [];

                for (var j = 0; j < inners.length; j ++) {
                    inners[j] && inners[j].$di('setValueDisabled', notCurr, key);
                }
            }
        }    
    };

    /**
     * @override
     */
    DI_TAB_CLASS.dispose = function() {
        this._uTab && disposeControl(this._uTab);
        this._aTab = [];
        DI_TAB.superClass.dispose.call(this);
    };

    /**
     * 窗口改变后重新计算大小
     *
     * @public
     */
    DI_TAB_CLASS.resize = function() {
        this._uTab && this._uTab.resize();
    };

    /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    DI_TAB_CLASS.enable = function(key) {
        this._uTab && this._uTab.enable();
        DI_TAB.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    DI_TAB_CLASS.disable = function(key) {
        this._uTab && this._uTab.disable();
        DI_TAB.superClass.disable.call(this);
    };

})();
/**
 * di.shared.ui.DITable
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    DI 表视图组件
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var ecuiDispose = UTIL.ecuiDispose;
    var assign = xutil.object.assign;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var getByPath = xutil.object.getByPath;
    var ecuiCreate = UTIL.ecuiCreate;
    var download = UTIL.download;
    var foreachDo = UTIL.foreachDo;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    var OLAP_TABLE;
    var BREADCRUMB;
        
    $link(function () {
        OLAP_TABLE = getByPath('ecui.ui.OlapTable');
        BREADCRUMB = getByPath('ecui.ui.Breadcrumb');
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * DI 表视图组件
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     */
    var DI_TABLE = $namespace().DITable = 
        inheritsObject(INTERACT_ENTITY);
    var DI_TABLE_CLASS = DI_TABLE.prototype;
    
    //------------------------------------------
    // 常量 
    //------------------------------------------

    var TPL_MAIN = [
        '<div class="q-di-table-area di-table-area">',
            '<div class="q-di-breadcrumb"></div>',
            '<div class="q-di-table"></div>',
        '</div>'
    ].join('');

    /**
     * 定义
     */
    DI_TABLE_CLASS.DEF = {
        // 暴露给interaction的api
        exportHandler: {
            sync: { datasourceId: 'DATA' },
            clear: {}
        },
        // 主元素的css
        className: 'di-table',
        // model配置
        model: {
            clzPath: 'di.shared.model.DITableModel'
        }
    };

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建View
     *
     * @private
     * @param {Object} options 参数
     */
    DI_TABLE_CLASS.$createView = function (options) {
        var el = this.$di('getEl');

        var tplMode = this.$di('getTplMode');
        // 模板
        if (tplMode != 'FROM_SNIPPET') {
            el.innerHTML = TPL_MAIN;
        }

        this._uTable = tplMode == 'FROM_SNIPPET'
            ? this.$di('vuiCreate', 'mainTable')
            : ecuiCreate(OLAP_TABLE, q('q-di-table', el)[0]);

        // 为ecui table控件在显示中渲染。后续检查是否有必要用这个方式
        // FIXME
        this._eArea = el;

        // 面包屑
        this._uBreadcrumb = tplMode == 'FROM_SNIPPET'
            ? this.$di(
                'vuiCreate', 
                'breadcrumb', 
                { maxShow: 5 } 
            )
            : ecuiCreate(
                BREADCRUMB,
                q('q-di-breadcrumb', el)[0],
                null,
                { maxShow: 5 }
            );

        // 下载按钮
        this._uDownloadBtn = this.$di('vuiCreate', 'download');

        // 离线下载
        this._uOfflineDownloadBtn = this.$di('vuiCreate', 'offlineDownload');

        // 条目数值等信息
        // 模板配置接口：totalRecordCount, currRecordCount
        this._uCountInfo = this.$di('vuiCreate', 'countInfo');
    };

    /**
     * 初始化
     *
     * @public
     */
    DI_TABLE_CLASS.init = function () {
        var me = this;
        var key;

        // 事件绑定
        for (key in { 
                'DATA': 1, 
                'DRILL': 1, 
                'LINK_DRILL': 1,
                'SORT': 1
            }
        ) {
            this.getModel().attach(
                ['sync.preprocess.' + key, this.$syncDisable, this, key],
                ['sync.result.' + key, this.$renderMain, this],
                ['sync.result.' + key, this.$handleDataLoaded, this],
                ['sync.error.' + key, this.$handleDataError, this],
                ['sync.complete.' + key, this.$syncEnable, this, key]
            );
        }
        key = 'OFFLINE_DOWNLOAD';
        this.getModel().attach(
            ['sync.preprocess.' + key, this.$syncDisable, this, key],
            ['sync.error.' + key, this.$handleOfflineDownloadError, this],
            ['sync.complete.' + key, this.$syncEnable, this, key]
        );
        this.getModel().attach(
            ['sync.preprocess.CHECK', this.$syncDisable, this, 'CHECK'],
            ['sync.result.CHECK', this.$handleRowAsync, this, false],
            ['sync.error.CHECK', this.$handleRowAsync, this, true],
            ['sync.complete.CHECK', this.$syncEnable, this, 'CHECK']
        );
        this.getModel().attach(
            ['sync.preprocess.SELECT', this.$syncDisable, this, 'SELECT'],
            ['sync.result.SELECT', this.$handleRowAsync, this, false],
            ['sync.error.SELECT', this.$handleRowAsync, this, true],
            ['sync.complete.SELECT', this.$syncEnable, this, 'SELECT']
        );

        this.getModel().init();

        this._uTable.onexpand = bind(this.$handleExpand, this);
        this._uTable.oncollapse = bind(this.$handleCollapse, this);
        this._uTable.onsort = bind(this.$handleSort, this);
        this._uTable.onrowclick = bind(this.$handleRowClick, this);
        this._uTable.onrowselect = bind(this.$handleRowCheck, this, 'rowselect', 'SELECT');
        this._uTable.onrowcheck = bind(this.$handleRowCheck, this, 'rowcheck', 'CHECK');
        this._uTable.onrowuncheck = bind(this.$handleRowCheck, this, 'rowuncheck', 'CHECK');
        this._uTable.oncelllinkdrill = bind(this.$handleLinkDrill, this);
        this._uTable.oncelllinkbridge = bind(this.$handleLinkBridge, this);
        this._uBreadcrumb && (
            this._uBreadcrumb.onchange = bind(this.$handleBreadcrumbChange, this)
        );
        this._uDownloadBtn && (
            this._uDownloadBtn.onclick = bind(this.$handleDownload, this)
        );
        this._uOfflineDownloadBtn && (
            this._uOfflineDownloadBtn.attach('confirm', this.$handleOfflineDownload, this)
        );

        foreachDo(
            [
                this._uTable,
                this._uBreadcrumb,
                this._uCountInfo,
                this._uDownloadBtn,
                this._uOfflineDownloadBtn                
            ],
            'init'
        )
        this._uBreadcrumb && this._uBreadcrumb.hide();

        this._eArea.style.display = 'none';
    };

    /**
     * @override
     */
    DI_TABLE_CLASS.dispose = function () {
        this._uTable && ecuiDispose(this._uTable);
        this._eArea = null;
        DI_TABLE.superClass.dispose.call(this);
    };

    /**
     * 从后台获取数据并渲染
     *
     * @public
     * @event
     * @param {Object} options 参数
     */
    DI_TABLE_CLASS.sync = function (options) {

        // 视图禁用
        /*
        var diEvent = this.$di('getEvent');
        var vd = diEvent.viewDisable;
        vd && this.getModel().attachOnce(
            ['sync.preprocess.DATA', vd.disable],
            ['sync.complete.DATA', vd.enable]
        );*/

        // 请求后台
        this.$sync(
            this.getModel(),
            'DATA',
            options || {},
            this.$di('getEvent')
        );
    };

    /**
     * 视图清空
     *
     * @public
     * @event
     */
    DI_TABLE_CLASS.clear = function () {
        foreachDo(
            [
                this._uTable,
                this._uBreadcrumb,
                this._uCountInfo
            ],
            'setData'
        ); 
    };

    /**
     * 渲染主体
     * 
     * @protected
     */
    DI_TABLE_CLASS.$renderMain = function (data, ejsonObj, options) {
        this._eArea.style.display = '';

        foreachDo(
            [
                this._uTable,
                this._uBreadcrumb,
                this._uCountInfo,
                this._uDownloadBtn,
                this._uOfflineDownloadBtn                
            ],
            'diShow'
        ); 

        var setDataOpt = { diEvent: this.$diEvent(options) };

        // 表格
        this._uTable.$di('setData', data.tableData, setDataOpt);

        // 面包屑
        if (this._uBreadcrumb) {
            if (data.breadcrumbData.datasource
                && data.breadcrumbData.datasource.length > 0
            ) {
                this._uBreadcrumb.show();
                this._uBreadcrumb.$di('setData', data.breadcrumbData, setDataOpt);
            }
            else {
                this._uBreadcrumb.hide();
            }
        }

        // 页信息
        this._uCountInfo && this._uCountInfo.$di(
            'setData', 
            {
                args: {
                    totalRecordCount: data.pageInfo.totalRecordCount,
                    currRecordCount: data.pageInfo.currRecordCount
                }
            },
            setDataOpt
        );

        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
    };

    /**
     * 窗口改变后重新计算大小
     *
     * @public
     */
    DI_TABLE_CLASS.resize = function () {
        this._uTable && this._uTable.resize();
    };

    /**
     * 解禁操作
     *
     * @protected
     */
    DI_TABLE_CLASS.enable = function () {
        foreachDo(
            [
                this._uTable,
                this._uBreadcrumb,
                this._uCountInfo,
                this._uDownloadBtn,
                this._uOfflineDownloadBtn
            ],
            'enable'
        ); 
        DI_TABLE.superClass.enable.call(this);
    };

    /**
     * 禁用操作
     *
     * @protected
     */
    DI_TABLE_CLASS.disable = function () {
        foreachDo(
            [
                this._uTable,
                this._uBreadcrumb,
                this._uCountInfo,
                this._uDownloadBtn,
                this._uOfflineDownloadBtn
            ],
            'disable'
        ); 
        DI_TABLE.superClass.disable.call(this);
    };

    /**
     * 下载操作
     *
     * @protected
     */
    DI_TABLE_CLASS.$handleDownload = function (wrap) {
        var commonParamGetter = this.$di('getCommonParamGetter');

        var url = URL('OLAP_TABLE_DOWNLOAD') 
            + '?' + commonParamGetter();
        download(url, null, true);

        // 对于下载，不进行reportTemplateId控制，直接打开
        commonParamGetter.update();
    };

    /**
     * 离线下载操作
     *
     * @protected
     */
    DI_TABLE_CLASS.$handleOfflineDownload = function () {
        var val = this._uOfflineDownloadBtn.getValue() || {};
        this.$sync(
            this.getModel(),
            'OFFLINE_DOWNLOAD',
            { email: val.email }
        );
    };

    /**
     * 面包屑点击
     *
     * @protected
     */
    DI_TABLE_CLASS.$handleBreadcrumbChange = function (wrap) {
        this.$sync(
            this.getModel(),
            'LINK_DRILL',
            {
                action: 'EXPAND',
                // 这接口定的很乱，这里是简写的uniq
                uniqueName: wrap['uniqName']
            }
        );
    };  

    /**
     * link式下钻
     *
     * @protected
     */
    DI_TABLE_CLASS.$handleLinkDrill = function (cellWrap, lineWrap) {
        this.$sync(
            this.getModel(),
            'LINK_DRILL',
            {
                action: 'EXPAND',
                uniqueName: cellWrap['uniqueName'],
                lineUniqueName: (lineWrap || {})['uniqueName']
            }
        );
    };        

    /**
     * 报表跳转
     *
     * @protected
     * @param {string} linkBridgeType 跳转类型，值可为'I'(internal)或者'E'(external)
     * @param {string} url 目标url
     * @param {Object} options 参数
     */
    DI_TABLE_CLASS.$handleLinkBridge = function (colDefItem, rowDefItem) {
        this.$di(
            'linkBridge', 
            colDefItem.linkBridge, 
            URL('OLAP_TABLE_LINK_BRIDGE'),
            this.$di('getCommonParamGetter')(
                {
                    colUniqName: colDefItem.uniqueName,
                    rowUniqName: rowDefItem.uniqueName,
                    colDefineId: colDefItem.colDefineId
                }
            )
        );
    };    

    /**
     * 展开（下钻）
     *
     * @protected
     */
    DI_TABLE_CLASS.$handleExpand = function (cellWrap, lineWrap) {
        this.$sync(
            this.getModel(),
            'DRILL',
            {
                action: 'EXPAND',
                uniqueName: cellWrap['uniqueName'],
                lineUniqueName: (lineWrap || {})['uniqueName']
            }
        );
    };

    /**
     * 收起（上卷）
     *
     * @protected
     */
    DI_TABLE_CLASS.$handleCollapse = function (cellWrap, lineWrap) {
        this.$sync(
            this.getModel(),
            'DRILL',
            {
                action: 'COLLAPSE',
                uniqueName: cellWrap['uniqueName'],
                lineUniqueName: (lineWrap || {})['uniqueName']
            }
        );
    };

    /**  
     * 行点击
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleRowClick = function (rowDefItem) {
        /**
         * 行点击事件
         *
         * @event
         */
        this.$di(
            'dispatchEvent', 
            'rowclick',
            [{ uniqueName: rowDefItem.uniqueName }]
        );
    };

    /**  
     * 行选中
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleRowCheck = function (eventName, datasourceId, rowDefItem, callback) {
        this.$sync(
            this.getModel(),
            datasourceId, 
            { uniqueName: rowDefItem.uniqueName },
            null,
            {
                eventName: eventName,
                callback: callback
            }
        );
    };

    /**  
     * 排序
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleSort = function (colDefineItem) {
        this.$sync(
            this.getModel(),
            'SORT',
            colDefineItem
        );
    };

    /**  
     * 行选中
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleRowAsync = function (isFailed, data, ejsonObj, options) {

        // 根据后台结果，改变行选中与否
        options.args.callback(data.selected);

        /**
         * line check模式下行选中和取消选中事件
         *
         * @event
         */
        this.$di(
            'dispatchEvent',
            options.args.eventName,
            [{ uniqueName: options.args.param.uniqueName }]
        );
    };

    /**
     * 数据加载成功
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleDataLoaded = function (data, ejsonObj, options) {
        var datasourceId = options.datasourceId;     
        var value = this.$di('getValue');
        var args;
        var param = options.args.param;

        if (datasourceId == 'DATA') {
            args = [value];
        }
        else if (datasourceId == 'LINK_DRILL') {
            args = [assign({}, param, ['uniqueName'])];
        }
        else if (datasourceId == 'DRILL') {
            args = [assign({}, param, ['uniqueName', 'lineUniqueName'])];
        }
        else if (datasourceId == 'SORT') {
            args = [assign({}, param, ['uniqueName', 'currentSort'])];
        }

        /**
         * 数据成功加载事件（分datasourceId）
         *
         * @event
         */
        this.$di(
            'dispatchEvent',
            this.$diEvent('dataloaded.' + datasourceId, options),
            args
        );

        if (datasourceId in { DATA: 1, LINK_DRILL: 1, SORT: 1 }) {
            /**
             * 数据改变事件（DRILL在逻辑上是添加数据，不算在此事件中）
             *
             * @event
             */
            this.$di(
                'dispatchEvent', 
                this.$diEvent('datachange', options), 
                [value]
            );
        }

        /**
         * 数据成功加载事件
         *
         * @event
         */
        this.$di(
            'dispatchEvent', 
            this.$diEvent('dataloaded', options), 
            [value]
        );
    };

    /**
     * 获取表格数据错误处理
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleDataError = function (status, ejsonObj, options) {
        this._eArea.style.display = '';

        foreachDo(
            [
                this._uTable,
                this._uBreadcrumb,
                this._uCountInfo,
                this._uDownloadBtn,
                this._uOfflineDownloadBtn
            ],
            'diShow'
        ); 

        // 设置空视图
        this.clear();

        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
        /**
         * 数据加载失败事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('dataerror', options));
    };

    /**
     * 离线下载错误处理
     * 
     * @protected
     */
    DI_TABLE_CLASS.$handleOfflineDownloadError = function (status, ejsonObj, options) {
        DIALOG.alert(LANG.SAD_FACE + LANG.OFFLINE_DOWNLOAD_FAIL);
    };

})();
/**
 * ist.opanaly.fcanaly.ui.DimSelectPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    维度选择面板
 * @author:  sushuang(sushuang)
 * @depend:  xui
 */

$namespace('di.shared.ui');

(function() {
    
    //-----------------------------------
    // 引用
    //-----------------------------------
    
    var URL = di.config.URL;
    var DIALOG = di.helper.Dialog;
    var UTIL = di.helper.Util;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var createDom = ecui.dom.create;
    var getStyle = ecui.dom.getStyle;
    var triggerEvent = ecui.triggerEvent;
    var disposeControl = ecui.dispose;
    var ecuiCreate = UTIL.ecuiCreate;
    var disposeInnerControl = UTIL.disposeInnerControl;
    var template = xutil.string.template;
    var q = xutil.dom.q;
    var createSingleton = xutil.object.createSingleton;
    var hasValueNotBlank = xutil.lang.hasValueNotBlank;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var textLength = xutil.string.textLength;
    var textSubstr = xutil.string.textSubstr;
    var stringToDate = xutil.date.stringToDate;
    var trim = xutil.string.trim;
    var bind = xutil.fn.bind;
    var XVIEW = xui.XView;
    var UI_TEXTAREA = ecui.ui.Textarea;
    var UI_INPUT = ecui.ui.Input;
    var UI_FORM = ecui.ui.Form;
    var UI_BUTTON = ecui.ui.Button;
    var UI_IND_TREE = ecui.ui.IndTree;
    var UI_CALENDAR = ecui.ui.IstCalendar;
    var DIM_SELECT_MODEL;

    $link(function() {
        DIM_SELECT_MODEL = di.shared.model.DimSelectModel;
    });

    //-----------------------------------
    // 类型声明
    //-----------------------------------

    /**
     * 维度树选择浮层
     * 单例，直接使用DIM_SELECT_PANEL()可得到实例
     * 
     * @class
     * @extends xui.XView
     */
    var DIM_SELECT_PANEL = 
        $namespace().DimSelectPanel = createSingleton(
            XVIEW,
            dimSelectPanelConstructor
        );
    var DIM_SELECT_PANEL_CLASS = DIM_SELECT_PANEL.prototype;

    /**
     * 构造函数
     *
     * @constructor
     * @param {Object} options 参数
     */
    function dimSelectPanelConstructor(options) {
        createModel.call(this, options);
        createView.call(this, options);
        this.init();
    }

    //-----------------------------------
    // 模板
    //-----------------------------------

    var TPL_MAIN = [
            '<div class="q-di-form">',
                '<label>维度选择</label>',
                '<div class="di-dim-select-tree">',
                    '<div class="q-di-tree"></div>',
                '</div>',
                '<div class="di-dim-select-cal">',
                    '<div class="q-calendar"></div>',
                '</div>',
                '<div>',
                    '<div class="di-dim-select-btn">',
                        '<div class="ui-button-g ui-button q-di-submit">确定</div>',
                        '<div class="ui-button q-di-cancel">取消</div>',
                    '</div>',
                '<div>',
            '</div>'
        ].join('');

    //-----------------------------------
    // 方法
    //-----------------------------------

    /**
     * 创建Model
     *
     * @private
     */
    function createModel() {
        this._mDimSelectModel = new DIM_SELECT_MODEL();
    };

    /**
     * 创建控件
     *
     * @private
     */
    function createView() {
        // 创建主dom
        var el = this._eMain = createDom('di-dim-select-panel');
        document.body.appendChild(el);
        el.innerHTML = TPL_MAIN;

        // 创建控件
        this._uForm = ecuiCreate(
            UI_FORM,
            q('q-di-form', el)[0],
            null,
            { hide: true }
        );

        this._uDimTree = ecuiCreate(
            UI_IND_TREE,
            q('q-di-tree', el)[0]
        );

        this._uCalendar = ecuiCreate(
            UI_CALENDAR,
            q('q-calendar', el)[0],
            null, 
            {
                mode: 'RANGE',
                viewMode: 'FIX',
                shiftBtnDisabled: true
            }
        );

        this._uSubmitBtn = ecuiCreate(
            UI_BUTTON,
            q('q-di-submit', el)[0]
        );
        this._uCancelBtn = ecuiCreate(
            UI_BUTTON,
            q('q-di-cancel', el)[0]
        );
    };

    /**
     * @override
     */
    DIM_SELECT_PANEL_CLASS.init = function() {
        var me = this;

        // 事件绑定
        this._mDimSelectModel.attach(
            ['sync.preprocess.TREE', this.disable, this],
            ['sync.result.TREE', this.$handleTreeSuccess, this],
            ['sync.error.TREE', this.$handleTreeError, this],
            ['sync.complete.TREE', this.enable, this]
        );
        this._mDimSelectModel.attach(
            ['sync.preprocess.SAVE', this.disable, this],
            ['sync.result.SAVE', this.$handleSubmitSuccess, this],
            ['sync.error.SAVE', this.$handleSubmitError, this],
            ['sync.complete.SAVE', this.enable, this]
        );
        this._uSubmitBtn.onclick = bind(this.$submitHandler, this);
        this._uCancelBtn.onclick = bind(this.$cancelHandler, this);

        // Init
        this._uForm.init();
        this._uDimTree.init();
        this._uSubmitBtn.init();
        this._uCancelBtn.init();
        this._uCalendar.init();

        this._uCalendar.hide();
        // this._uForm.$resize();

        this.$resetInput();
    };
    
    /**
     * @override
     */
    DIM_SELECT_PANEL_CLASS.dispose = function() {
        DIM_SELECT_PANEL.superClass.dispose.call(this);
    };

    /**
     * 打开面板
     *
     * @public
     * @param {string} mode 可取值：
     *                       'VIEW': 查看
     *                       'EDIT': 修改
     * @param {Object} options 参数
     * @param {string=} options.uniqName
     * @param {string} options.selLineName
     * @param {Function} options.commonParamGetter
     * @param {string} options.reportType 值为TABLE或者CHART
     * @param {string=} options.dimMode 模式，
     *      可选值为'NORMAL'（默认）, 'TIME'（时间维度面板）
     */
    DIM_SELECT_PANEL_CLASS.open = function(mode, options) {
        this._sMode = mode;
        this._oOptions = options;

        this.$resetInput();

        // 每次打开时从后台获取维度树和当前所选
        this._mDimSelectModel.sync(
            { 
                datasourceId: 'TREE', 
                args: this._oOptions
            }
        );
    };

    /**
     * 重置
     * 
     * @public
     */
    DIM_SELECT_PANEL_CLASS.$resetInput = function() {
        // 清空以及恢复状态
        // 如果后续只有此一行代码则移除此方法直接调用clear prompt
        this.$clearPrompt();
    };

    /**
     * 清除prompt
     *
     * @protected
     */
    DIM_SELECT_PANEL_CLASS.$clearPrompt = function() {
        // TODO
    };

    /**
     * 解禁操作
     *
     * @override
     * @public
     */
    DIM_SELECT_PANEL_CLASS.enable = function(enable) {
        if (this._bDisabled && this._sMode == 'EDIT') {
            this._uSubmitBtn.enable();
            this._uCancelBtn.enable();
            this._uDimTree.enable(); // FIXME 验证
        }
        DIM_SELECT_PANEL.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @override
     * @public
     */
    DIM_SELECT_PANEL_CLASS.disable = function(enable) {
        if (!this._bDisabled) {
            this._uSubmitBtn.disable();
            this._uCancelBtn.disable();
            this._uDimTree.disable(); // FIXME 验证
        }
        DIM_SELECT_PANEL.superClass.disable.call(this);
    };    

    /**
     * 提交事件处理
     *
     * @protected
     * @event
     */
    DIM_SELECT_PANEL_CLASS.$submitHandler = function() {
        this._mDimSelectModel.sync(
            { 
                datasourceId: 'SAVE',
                args: extend(
                    {
                        treeSelected: this._uDimTree.getSelected(),
                        levelSelected: this._uDimTree.getLevelSelected(),
                        timeSelect: {
                            start: this._uCalendar.getDate(),
                            end: this._uCalendar.getDateEnd() 
                        }
                    },
                    this._oOptions
                )
            }
        );
    };

    /**
     * 取消事件处理
     *
     * @protected
     * @event
     */
    DIM_SELECT_PANEL_CLASS.$cancelHandler = function() {
        this._uForm.hide();
    };

    /**
     * 原因添加成功结果处理
     *
     * @protected
     */
    DIM_SELECT_PANEL_CLASS.$handleTreeSuccess = function() {
        try {
            var model = this._mDimSelectModel;

            this._uForm.showModal(DICT.DEFAULT_MASK_OPACITY);

            // 渲染维度树
            this._uDimTree.render(
                {
                    tree: model.getCurrDimTree(),
                    level: model.getCurrLevelList()
                }
            );

            if (this._oOptions.dimMode == 'TIME') {
                this._uCalendar.show();
                var timeSelect = model.getTimeSelect();
                this._uCalendar.setDate(
                    stringToDate(timeSelect.start),
                    stringToDate(timeSelect.end)
                );
            }
            else {
                this._uCalendar.hide();
            }
            
            this._uForm.center();
        }
        catch (e) {
            // 需求变化性很大，数据源很杂，真不敢保证返回数据总是匹配，
            // 所以暂用try catch
            this.$handleTreeError();
        }
    };

    /**
     * 原因添加失败结果处理
     *
     * @protected
     */
    DIM_SELECT_PANEL_CLASS.$handleTreeError = function() {
        var me = this;
        // 获取维度树出错，提示并关闭面板
        DIALOG.alert(
            LANG.GET_DIM_TREE_ERROR,
            function() {
                me._uForm.hide();
            }
        );
    };

    /**
     * 原因添加成功结果处理
     *
     * @protected
     */
    DIM_SELECT_PANEL_CLASS.$handleSubmitSuccess = function() {
        this._uForm.hide();
        /**
         * @event di.shared.ui.DimSelectPanel#submit.close
         */
        this.notify('submit.close');
    };

    /**
     * 原因添加失败结果处理
     *
     * @protected
     */
    DIM_SELECT_PANEL_CLASS.$handleSubmitError = function(status) {
        DIALOG.alert(LANG.SAVE_FAILURE);
    };

})();

/**
 * di.shared.ui.FoldPanel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    折叠面板
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var assign = xutil.object.assign;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    var TAB_CONTAINER = ecui.ui.TabContainer;
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 折叠面板
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {boolean=} options.autoDeaf 使用deaf模式，
     *                  即隐藏时deaf内部实体，默认为true
     * @param {boolean=} options.autoComponentValueDisabled component自动在隐藏时valueDisabled模式，
     *                  即隐藏时value disable内部实体，默认为false
     * @param {boolean=} options.autoVUIValueDisabled vui自动在隐藏时使用valueDisabled模式，
     *                  即隐藏时value disable内部实体，默认为true
     */
    var FOLD_PANEL = $namespace().FoldPanel = 
            inheritsObject(INTERACT_ENTITY, constructor);
    var FOLD_PANEL_CLASS = FOLD_PANEL.prototype;

    /**
     * 定义
     */
    FOLD_PANEL_CLASS.DEF = {
        // 主元素的css
        className: 'di-fold-panel',
    };

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @constructor
     * @public
     * @param {Object} options 参数
     */
    function constructor(options) {
        var el = this.$di('getEl');
        var o = document.createElement('div');
        el.appendChild(o);

        this._bFolded = true;
        this._bAutoDeaf = options.autoDeaf == null 
            ? true : options.autoDeaf;
        this._bAutoComponentValueDisabled = 
            options.autoComponentValueDisabled == null
                ? false : options.autoComponentValueDisabled;
        this._bAutoVUIValueDisabled = 
            options.autoVUIValueDisabled == null
                ? true : options.autoVUIValueDisabled;

        this._oBodyDef = this.$di('getRef', 'vpartRef', 'body', 'DEF');
        this._oCtrlBtnDef = this.$di('getRef', 'vpartRef', 'ctrlBtn', 'DEF');

        this.$createCtrlBtn();
        this.$resetCtrlBtnText();
        this.$ctrlBtnChange(true);
    };

    /**
     * 初始化
     *
     * @public
     */
    FOLD_PANEL_CLASS.init = function() {
        this.$resetDisabled();
    };

    /**
     * 创建ctrlBtn
     *
     * @protected
     */
    FOLD_PANEL_CLASS.$createCtrlBtn = function() {
        // 目前只支持文字式的ctrlBtn
        this._oCtrlBtnDef.el.innerHTML = [
            '<a href="#" class="di-fold-panel-ctrl-btn">',
                '<span class="di-fold-panel-ctrl-btn-text">&nbsp;</span>',
            '</a>',
            '<span class="di-fold-panel-ctrl-down"></span>'
        ].join('');

        var el = this._oCtrlBtnDef.el.firstChild;
        var me = this;
        el.onclick = function() {
            if (!me._bDisabled) { 
                me.$ctrlBtnChange();
                me.$resetDisabled();
            }
            return false;
        }
    };

    /**
     * @override
     */
    FOLD_PANEL_CLASS.dispose = function() {
        this._oCtrlBtnDef = null;
        this._oBodyDef = null;
        FOLD_PANEL.superClass.dispose.call(this);
    };

    /**
     * @protected
     */
    FOLD_PANEL_CLASS.$resetDisabled = function() {
        var inners;
        var key = this.$di('getId');

        inners = this._oBodyDef.$di(
            'getRef', 'componentRef', 'inner', 'INS'
        ) || [];

        for (var j = 0; j < inners.length; j ++) {
            if (inners[j]) {
                this._bAutoDeaf 
                    && inners[j].$di('setDeaf', this._bFolded, key);
                this._bAutoComponentValueDisabled
                    && inners[j].$di('setValueDisabled', this._bFolded, key);
            }
        }

        if (this._bAutoVUIValueDisabled) {
            inners = this._oBodyDef.$di(
                'getRef', 'vuiRef', 'inner', 'INS'
            ) || [];

            for (var j = 0; j < inners.length; j ++) {
                inners[j] && inners[j].$di('setValueDisabled', this._bFolded, key);
            }
        }
    };

    /**
     * 窗口改变后重新计算大小
     *
     * @public
     */
    FOLD_PANEL_CLASS.resize = function() {
    };

    /**
     * 设置ctrlBtn文字
     *
     * @protected
     */    
    FOLD_PANEL_CLASS.$resetCtrlBtnText = function() {
        var btnDef = this._oCtrlBtnDef;
        var dataOpt = btnDef.$di('getOpt', 'dataOpt');

        // 暂只支持链接形式
        // TODO
        btnDef.el.firstChild.firstChild.innerHTML = this._bFolded
            ? dataOpt.expandText 
            : dataOpt.collapseText;
        btnDef.el.lastChild.className = this._bFolded
            ? 'di-fold-panel-ctrl-down'
            : 'di-fold-panel-ctrl-up';
    };

    /**
     * 展开折叠
     *
     * @protected
     * @param {boolean=} toFold 是否折叠，如不传，则将折叠与否置反
     */
    FOLD_PANEL_CLASS.$ctrlBtnChange = function(toFold) {
        var style = this._oBodyDef.el.style;

        this._bFolded = toFold == null ? !this._bFolded : toFold;

        this.$resetCtrlBtnText();

        style.display = this._bFolded ? 'none' : '';

        /**
         * 渲染完事件
         *
         * @event
         */
        this.$di('dispatchEvent', 'rendered');
    };

})();
/**
 * di.shared.ui.GeneralSnippet
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    DI 片段
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * DI 片段
     * 
     * @class
     * @extends xui.XView
     */
    var SNIPPET = $namespace().GeneralSnippet = 
            inheritsObject(INTERACT_ENTITY, constructor);
    var SNIPPET_CLASS = SNIPPET.prototype;
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @constructor
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        // ...
    };
    
    /**
     * @override
     */
    SNIPPET_CLASS.dispose = function() {
    };

})();
/**
 * di.shared.ui.GeneralVContainer
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    VCONTAINER
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var assign = xutil.object.assign;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var XVIEW = xui.XView;
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * VCONTAINER
     * 
     * @class
     * @extends xui.XView
     */
    var GENERAL_VCONTAINER = $namespace().GeneralVContainer = 
            inheritsObject(XVIEW, constructor);
    var GENERAL_VCONTAINER_CLASS = GENERAL_VCONTAINER.prototype;
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @constructor
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        this._oOptions = assign({}, options);
    };
    
    /**
     * @override
     */
    GENERAL_VCONTAINER_CLASS.dispose = function() {
        this.$di('disposeMainEl');
    };

})();
/**
 * di.shared.ui.GeneralVPart
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    VCONTAINER
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = ecui.dom.addClass;
    var disposeControl = ecui.dispose;
    var q = xutil.dom.q;
    var assign = xutil.object.assign;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var XVIEW = xui.XView;
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * VCONTAINER
     * 
     * @class
     * @extends xui.XView
     */
    var GENERAL_VPART = $namespace().GeneralVPart = 
            inheritsObject(XVIEW, constructor);
    var GENERAL_VPART_CLASS = GENERAL_VPART.prototype;
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @constructor
     * @private
     * @param {Object} options 参数
     */
    function constructor(options) {
        this._oOptions = assign({}, options);
    };
    
    /**
     * @override
     */
    GENERAL_VPART_CLASS.dispose = function() {
        this.$di('disposeMainEl');
    };

})();
/**
 * di.shared.ui.MetaCondition
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    多维分析报表原数据选择面板
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.shared.ui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var ecuiDispose = UTIL.ecuiDispose;
    var extend = xutil.object.extend;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var template = xutil.string.template;
    var ecuiCreate = UTIL.ecuiCreate;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var UI_DROPPABLE_LIST;
    var UI_DRAGPABLE_LIST;
    var getByPath = xutil.object.getByPath;
    var getUID = xutil.uid.getIncreasedUID;
    var XVIEW = xui.XView;
    var META_CONDITION_MODEL;
    var DIM_SELECT_PANEL;
        
    $link(function () {
        UI_DROPPABLE_LIST = getByPath('ecui.ui.DroppableList');
        UI_DRAGPABLE_LIST = getByPath('ecui.ui.DraggableList');
        META_CONDITION_MODEL = di.shared.model.MetaConditionModel;
        DIM_SELECT_PANEL = di.shared.ui.DimSelectPanel;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 元数据（指标维度）条件拖动选择
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {HTMLElement} options.el 容器元素
     * @param {Object} options.reportType 类型，
     *          TABLE(默认)或者CHART
     * @param {Function=} options.commonParamGetter 公共参数获取     
     */
    var META_CONDITOIN = $namespace().MetaCondition = 
        inheritsObject(
            XVIEW,
            function (options) {
                createModel.call(this, options);
                createView.call(this, options);
            }
        );
    var META_CONDITOIN_CLASS = META_CONDITOIN.prototype;
    
    //------------------------------------------
    // 模板 
    //------------------------------------------

    var TPL_MAIN = [
        '<div class="meta-condition-src">',
            '<div class="meta-condition-ind">',
                '<div class="meta-condition-head-text">选择指标：</div>',
                '<div class="meta-condition-ind-line q-di-meta-ind"></div>',
            '</div>',
            '<div class="meta-condition-dim">',
                '<div class="meta-condition-head-text">选择维度：</div>',
                '<div class="meta-condition-dim-line q-di-meta-dim"></div>',
            '</div>',
        '</div>',
        '<div class="meta-condition-tar q-di-meta-tar">',
        '</div>'
    ].join('');

    var TPL_SEL_LINE = [
        '<div class="meta-condition-sel">',
            '<div class="meta-condition-head-text">#{0}</div>',
            '<div class="meta-condition-sel-line q-di-meta-sel-line"></div>',
        '</div>'
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @private
     * @param {Object} options 参数
     */
    function createModel(options) {
        /**
         * 类型，TABLE 或者 CHART
         *
         * @type {string}
         * @private
         */
        this._sReportType = options.reportType || 'TABLE';
        /**
         * 得到公用的请求参数
         *
         * @type {Function}
         * @private
         */
        this._fCommonParamGetter = options.commonParamGetter;

        this._mMetaConditionModel = new META_CONDITION_MODEL(
            { 
                reportType: this._sReportType,
                commonParamGetter: this._fCommonParamGetter
            }
        );
    };
    
    /**
     * 创建View
     *
     * @private
     * @param {Object} options 参数
     */
    function createView(options) {
        var el = this._eMain = options.el;
        addClass(el, 'meta-condition');

        // 模板
        el.innerHTML = TPL_MAIN;

        // 控件/DOM引用
        this._eSelLineArea = q('q-di-meta-tar', el)[0];

        // selLine控件集合，key为selLineName
        this._oSelLineWrap = new LINKED_HASH_MAP();
        // selLine控件id集合，key为selLineName
        this._oSelLineIdWrap = {};
    };
    
    /**
     * 初始化
     *
     * @public
     */
    META_CONDITOIN_CLASS.init = function () {
        // 事件绑定
        this._mMetaConditionModel.attach(
            ['sync.preprocess.META_DATA', this.disable, this, 'META_COND'],
            ['sync.result.META_DATA', this.$renderMain, this],
            ['sync.error.META_DATA', this.$handleMetaError, this],
            ['sync.complete.META_DATA', this.enable, this, 'META_COND']
        );        
        this._mMetaConditionModel.attach(
            ['sync.preprocess.SELECT', this.disable, this, 'META_COND'],
            ['sync.result.SELECT', this.$refreshStatus, this],
            ['sync.error.SELECT', this.$handleSelectError, this],
            ['sync.complete.SELECT', this.enable, this, 'META_COND']
        );

        this._mMetaConditionModel.init();
    };

    /**
     * @override
     */
    META_CONDITOIN_CLASS.dispose = function () {
        this._uIndSrc && ecuiDispose(this._uIndSrc);
        this._uDimSrc && ecuiDispose(this._uDimSrc);
        this._oSelLineWrap.foreach(
            function (name, item, index) {
                ecuiDispose(item);
            }
        );
        this._eSelLineArea = null;
        META_CONDITOIN.superClass.dispose.call(this);
    };

    /**
     * 从后台获取数据并渲染
     *
     * @public
     */
    META_CONDITOIN_CLASS.sync = function () {
        this._mMetaConditionModel.sync(
            { datasourceId: 'META_DATA' }
        );
    };

    /**
     * 得到Model
     * 
     * @public
     * @return {di.shared.model.MetaConditionModel} metaItem
     */
    META_CONDITOIN_CLASS.getModel = function () {  
        return this._mMetaConditionModel;
    };

    /**
     * 渲染主体
     * 
     * @protected
     */
    META_CONDITOIN_CLASS.$renderMain = function () {
        var me = this;
        var el = this._eMain;

        // 指标维度
        var sourceEcuiId = [
            '\x06_DI_META_COND_IND' + getUID('DI_META_COND'),
            '\x06_DI_META_COND_DIM' + getUID('DI_META_COND')
        ];
        var inddim = this._mMetaConditionModel.getIndDim();
        // 图的情况，可以重复拖动
        var disableSelected = this._sReportType == 'TABLE';

        // 指标控件
        var indSrc = this._uIndSrc = ecuiCreate(
            UI_DRAGPABLE_LIST,
            q('q-di-meta-ind', el)[0],
            null,
            {
                id: sourceEcuiId[0],
                disableSelected: disableSelected,
                clazz: 'IND'
            }
        );
        inddim.indList.foreach(
            function (uniqName, item) {
                indSrc.addItem(
                    {
                        value: item.uniqName, 
                        text: item.caption, 
                        clazz: item.clazz,
                        fixed: item.fixed,
                        align: item.align
                    }
                );
            }
        );

        // 维度控件
        var dimSrc = this._uDimSrc = ecuiCreate(
            UI_DRAGPABLE_LIST,
            q('q-di-meta-dim', el)[0],
            null,
            {
                id: sourceEcuiId[1],
                disableSelected: disableSelected,
                clazz: 'DIM'
            }
        );
        inddim.dimList.foreach(
            function (uniqName, item) {
                dimSrc.addItem(
                    {
                        value: item.uniqName, 
                        text: item.caption, 
                        clazz: item.clazz,
                        fixed: item.fixed,
                        align: item.align
                    }
                );
            }
        );

        // 增加默认的selLine
        var selLineDataWrap = this._mMetaConditionModel.getSelLineWrap();
        selLineDataWrap.foreach(
            function (name, selLineData, index) {
                me.$addSelLine(
                    name,
                    me.$getSelLineTitle(name),
                    sourceEcuiId.join(','),
                    selLineData
                );
            }
        );

        // 事件绑定
        this._uIndSrc.onchange = bind(
            this.$handleSelLineChange, 
            this, 
            this._uIndSrc
        );
        this._uDimSrc.onchange = bind(
            this.$handleSelLineChange, 
            this, 
            this._uDimSrc
        ); 
        this._oSelLineWrap.foreach(
            function (selLineName, selLineCon) {
                selLineCon.onitemclick = bind(
                    me.$handleItemClick, 
                    me, 
                    selLineName
                );
            }
        );
    };

    /**
     * 增加选择行
     * 
     * @protected
     * @param {string} selLineName 名
     * @param {string} selLineTitle selLine显示名
     */
    META_CONDITOIN_CLASS.$getSelLineTitle = function (selLineName) {
        var text = '';
        if (this._sReportType == 'TABLE') {
            if (selLineName == 'ROW') {
                text = '行：';
            }
            else if (selLineName == 'FILTER') {
                text = '过滤：';
            } 
            else {
                text = '列：';
            }
        }
        else {
            if (selLineName == 'ROW') {
                text = '轴：';
            }
            else if (selLineName == 'FILTER') {
                text = '过滤：';
            } 
            else {
                text = '系列组：';
            }
        }   
        return text;     
    };

    /**
     * 增加选择行
     * 
     * @protected
     * @param {string} selLineName selLine名
     * @param {string} selLineTitle selLine显示名
     * @param {string} source 来源ecui控件id
     * @param {xutil.LinkedHashMap=} selLineData selLine数据
     */
    META_CONDITOIN_CLASS.$addSelLine = function (
        selLineName, selLineTitle, source, selLineData
    ) {
        if (selLineName == null) {
            return;
        }
        var selLineWrap = this._oSelLineWrap;
        var selLineIdWrap = this._oSelLineIdWrap;

        // 增加selLine
        var o = document.createElement('div');
        o.innerHTML = template(TPL_SEL_LINE, selLineTitle);
        this._eSelLineArea.appendChild(o = o.firstChild);

        selLineWrap.addLast(
            ecuiCreate(
                UI_DROPPABLE_LIST, 
                q('q-di-meta-sel-line', o)[0],
                null,
                {
                    id: selLineIdWrap[selLineName] = 
                        '\x06_DI_META_COND_SEL' + getUID('DI_META_COND'),
                    source: source,
                    configBtn: true
                }
            ),
            selLineName
        );

        // 设置新增控件target，并对所有其他selLine设置target
        for (var name in selLineIdWrap) {
            if (name != selLineName) {
                selLineWrap.get(name).addTarget(selLineIdWrap[selLineName]);
            }
            selLineWrap.get(selLineName).addTarget(selLineIdWrap[name]);
        }
        this._uIndSrc.addTarget(selLineIdWrap[selLineName]);
        this._uDimSrc.addTarget(selLineIdWrap[selLineName]);

        // 初始数据
        if (selLineData) {
            selLineData.foreach( 
                function (uniqName, item, index) {
                    selLineWrap.get(selLineName).addItem(
                        {
                            value: item.uniqName, 
                            text: item.caption,
                            clazz: item.clazz,
                            fixed: item.fixed,
                            align: item.align
                        }
                    );
                }
            );
        }
    };

    /**
     * 更新控件的元数据状态
     *
     * @protected
     */
    META_CONDITOIN_CLASS.$refreshStatus = function () {
        var statusWrap = this._mMetaConditionModel.getStatusWrap();
        this._uIndSrc.setState(
            { 
                disable: statusWrap.indMetas.disabledMetaNames,
                selected: statusWrap.indMetas.selectedMetaNames
            }
        );
        this._uDimSrc.setState(
            { 
                disable: statusWrap.dimMetas.disabledMetaNames,
                selected: statusWrap.dimMetas.selectedMetaNames
            }
        );
    };

    /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    META_CONDITOIN_CLASS.enable = function (key) {
        // TODO 检查
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            this._uIndSrc && this._uIndSrc.enable();
            this._uDimSrc && this._uDimSrc.enable();
            this._oSelLineWrap.foreach(
                function (name, item, index) {
                    item.enable();
                }
            );
        }
        META_CONDITOIN.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    META_CONDITOIN_CLASS.disable = function (key) {
        objKey.add(this, key);

        // TODO 检查
        if (!this._bDisabled) {
            this._uIndSrc && this._uIndSrc.disable();
            this._uDimSrc && this._uDimSrc.disable();
            this._oSelLineWrap.foreach(
                function (name, item, index) {
                    item.disable();
                }
            );
        }
        META_CONDITOIN.superClass.disable.call(this);
    };    

    /**
     * 获取元数据选择处理
     * 
     * @protected
     */
    META_CONDITOIN_CLASS.$handleSelLineChange = function () {
        var wrap = {};
        this._oSelLineWrap.foreach(
            function (k, o, index) {
                wrap[k] = o.getValue();
            }
        );
        var changeWrap = this._mMetaConditionModel.diffSelected(wrap);

        this._mMetaConditionModel.sync(
            {
                datasourceId: 'SELECT',
                args: {
                    uniqNameList: wrap[name],
                    changeWrap: changeWrap
                }
            }
        );
    };

    /**
     * selLine上指标维度点击事件处理
     * 
     * @protected
     */
    META_CONDITOIN_CLASS.$handleItemClick = function (
        selLineName, event, itemData
    ) {
        var metaItem = 
            this._mMetaConditionModel.getMetaItem(itemData.value);

        // 维度--打开维度选择面板
        if (metaItem && metaItem.clazz == 'DIM') {
            DIM_SELECT_PANEL().open(
                'EDIT',
                {
                    uniqName: itemData.value,
                    reportType: this._sReportType,
                    selLineName: selLineName,
                    dimMode: metaItem.isTimeDim ? 'TIME' : 'NORMAL',
                    commonParamGetter: this._fCommonParamGetter
                }
            );
        }
        // 指标--打开指标设置面板
        else {
            // TODO
        }
    };

    /**
     * 获取元数据初始化错误处理
     * 
     * @protected
     */
    META_CONDITOIN_CLASS.$handleMetaError = function () {
        // TODO
    };

    /**
     * 元数据拖拽错误处理
     * 
     * @protected
     */
    META_CONDITOIN_CLASS.$handleSelectError = function () {
        // TODO
    };

})();
/**
 * di.shared.ui.OlapMetaConfig
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    多维分析报表原数据选择面板
 * @author:  xxx(xxx)
 * @depend:  xui, xutil
 */

$namespace('di.shared.ui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var DIALOG = di.helper.Dialog;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var ecuiDispose = UTIL.ecuiDispose;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var template = xutil.string.template;
    var ecuiCreate = UTIL.ecuiCreate;
    var LINKED_HASH_MAP = xutil.LinkedHashMap;
    var getUID = xutil.uid.getIncreasedUID;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 元数据（指标维度）条件拖动选择
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     * @param {Object} options.reportType 类型，
     *          TABLE(默认)或者CHART
     * @param {string} options.submitMode 提交模式，可选值为
     *      'IMMEDIATE'（输入后立即提交，默认）
     *      'CONFIRM'（按确定按钮后提交）
     * @param {boolean} options.needShowCalcInds 计算列是否作为指标
     */
    var OLAP_META_CONFIG = $namespace().OlapMetaConfig = 
        inheritsObject(INTERACT_ENTITY);
    var OLAP_META_CONFIG_CLASS = OLAP_META_CONFIG.prototype;
    
    /**
     * 定义
     */
    OLAP_META_CONFIG_CLASS.DEF = {
        // 暴露给interaction的api
        exportHandler: {
            sync: { datasourceId: 'DATA' },
            clear: {}
        },
        // 主元素的css
        className: 'olap-meta-config',
        // model配置
        model: {
            clzPath: 'di.shared.model.OlapMetaConfigModel'
        }
    };

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model初始化参数
     *
     * @private
     * @param {Object} options 参数
     */
    OLAP_META_CONFIG_CLASS.$createModelInitOpt = function (options) {
        return { reportType: options.reportType };
    };
    
    /**
     * 创建View
     *
     * @private
     * @param {Object} options 参数
     */
    OLAP_META_CONFIG_CLASS.$createView = function (options) {
        /**
         * 是否计算列作为指标显示
         *
         * @type {boolean}
         * @private
         */
        this._bNeedShowCalcInds = options.needShowCalcInds || false;
        /**
         * 支持外部配置的datasourceId设置
         *
         * @type {Object}
         * @private
         */
        var did = this._oDatasourceId = options.datasourceId || {};
        did.DATA = did.DATA || 'DATA';
        did.SELECT = did.SELECT || 'SELECT';
        /**
         * 提交模式
         * 
         * @type {string}
         * @private 
         */
        this._sSubmitMode = options.submitMode;

        this._uOlapMetaSelector = this.$di('vuiCreate', 'main');
    };
    
    /**
     * 初始化
     *
     * @public
     */
    OLAP_META_CONFIG_CLASS.init = function () {
        // 事件绑定
        this.getModel().attach(
            ['sync.preprocess.DATA', this.$syncDisable, this, 'DATA'],
            ['sync.result.DATA', this.$renderMain, this],
            ['sync.error.DATA', this.$handleMetaError, this],
            ['sync.complete.DATA', this.$syncEnable, this, 'DATA']
        );
        this.getModel().attach(
            ['sync.preprocess.SELECT', this.$syncDisable, this, 'SELECT'],
            ['sync.result.SELECT', this.$handleSelected, this],
            ['sync.error.SELECT', this.$handleSelectError, this],
            ['sync.complete.SELECT', this.$syncEnable, this, 'SELECT']
        );
        this.getModel().attach(
            ['sync.preprocess.LIST_SELECT', this.$syncDisable, this, 'LIST_SELECT'],
            ['sync.result.LIST_SELECT', this.$handleSelected, this],
            ['sync.error.LIST_SELECT', this.$handleSelectError, this],
            ['sync.complete.LIST_SELECT', this.$syncEnable, this, 'LIST_SELECT']
        );
        this._uOlapMetaSelector.$di(
            'addEventListener',
            'change', 
            this.$handleChange, 
            this
        );

        this._uOlapMetaSelector.init();
        this.getModel().init();
    };

    /**
     * @override
     */
    OLAP_META_CONFIG_CLASS.dispose = function () {
        this._uOlapMetaSelector && this._uOlapMetaSelector.dispose();
        this.getModel() && this.getModel().dispose();
        OLAP_META_CONFIG.superClass.dispose.call(this);
    };

    /**
     * 从后台获取数据并渲染
     *
     * @public
     */
    OLAP_META_CONFIG_CLASS.sync = function () {
        var datasourceId = this._oDatasourceId.DATA;

        // 视图禁用
        /*
        var diEvent = this.$di('getEvent');
        var vd = diEvent.viewDisable;
        vd && this.getModel().attachOnce(
            ['sync.preprocess.' + datasourceId, vd.disable],
            ['sync.complete.' + datasourceId, vd.enable]
        );*/

        // 请求后台
        this.$sync(
            this.getModel(),
            datasourceId,
            { needShowCalcInds: this._bNeedShowCalcInds },
            this.$di('getEvent')
        );
    };

    /**
     * 清空视图
     * 
     * @public
     */
    OLAP_META_CONFIG_CLASS.clear = function () {  
        // TODO
    };

    /**
     * 渲染主体
     * 
     * @protected
     */
    OLAP_META_CONFIG_CLASS.$renderMain = function (data, ejsonObj, options) {
        var me = this;
        var el = this.$di('getEl');

        var imme = this._sSubmitMode == 'IMMEDIATE';

        this._uOlapMetaSelector.$di(
            'setData', 
            {
                inddim: this.getModel().getIndDim(),
                selLineDataWrap: this.getModel().getSelLineWrap(),
                model: this.getModel(),
                rule: {
                    forbidColEmpty: imme,
                    forbidRowEmpty: imme
                }
            },
            { diEvent: this.$diEvent(options) }
        );
        
        // 更新控件的元数据状态
        this._uOlapMetaSelector.$di(
            'updateData',
            this.getModel().getUpdateData()
        );
    };

    /**
     * 选择完成
     *
     * @protected
     */
    OLAP_META_CONFIG_CLASS.$handleSelected = function () {
        // 更新控件的元数据状态
        this._uOlapMetaSelector.$di(
            'updateData',
            this._mModel.getUpdateData()
        );

        if (this._sSubmitMode == 'IMMEDIATE') {
            /**
             * 提交事件
             *
             * @event
             */
            this.$di('dispatchEvent', 'submit');
        }
    };

    /**
     * 获取元数据选择处理
     * 
     * @protected
     */
    OLAP_META_CONFIG_CLASS.$handleChange = function (wrap) {
        var didSel = this._oDatasourceId.SELECT;

        this.$sync(
            this._mModel,
            didSel,
            null,
            null,
            didSel == 'LIST_SELECT' 
                ? { selected: wrap }
                : {
                    uniqNameList: wrap[name],
                    changeWrap: this._mModel.diffSelected(wrap),
                    needShowCalcInds: this._bNeedShowCalcInds
                }
        );
    };

    /**
     * 解禁操作
     *
     * @protected
     */
    OLAP_META_CONFIG_CLASS.enable = function () {
        this._uOlapMetaSelector && this._uOlapMetaSelector.$di('enable');
        OLAP_META_CONFIG.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     */
    OLAP_META_CONFIG_CLASS.disable = function () {
        this._uOlapMetaSelector && this._uOlapMetaSelector.$di('disable');
        OLAP_META_CONFIG.superClass.disable.call(this);
    };    

    /**
     * 获取元数据初始化错误处理
     * 
     * @protected
     */
    OLAP_META_CONFIG_CLASS.$handleMetaError = function () {
        this.clear();
        DIALOG.errorAlert();
    };

    /**
     * 元数据拖拽错误处理
     * 
     * @protected
     */
    OLAP_META_CONFIG_CLASS.$handleSelectError = function () {
        DIALOG.errorAlert();
    };

})();
/**
 * ecui.ui.PanelPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    容器中子页面基类
 * @author:  sushuang(sushuang)
 * @depend:  ecui
 */

$namespace('di.shared.ui');

(function() {

    var inheritsControl = ecui.inherits;
    var arraySlice = Array.prototype.slice;
    var UI_CONTROL = ecui.ui.Control;
    var UI_CONTROL_CLASS = UI_CONTROL.prototype;

    var PANEL_PAGE = $namespace().PanelPage = 
        inheritsControl(
            // TODO 
            // 继承UI_CONTROL还是XView ??
            UI_CONTROL, 
            'panel-page',
            null,
            function(el, options) {
                this._bVisible = true;
                this._aPendingUpdater = [];
                this._sPageId = options.pageId;
                this._sFromPageId = options.fromPageId;
            }
        );
    var PANEL_PAGE_CLASS = PANEL_PAGE.prototype;
    
    /**
     * 析构
     * @override
     * @private
     */
    PANEL_PAGE_CLASS.$dispose = function() {
        this._aPendingUpdater = [];
        PANEL_PAGE.superClass.$dispose.call(this);
    };

    /**
     * 更新page视图
     * 因为page视图在要被更新时，可能正处于隐藏的状态，
     *（例如ajax回调时页面已经被切走），
     * 这样有可能导致dom计算出问题（根据page具体实现而定）。
     * 此方法用于延迟更新视图的情况，
     * 如果页面处于显示状态，则正常执行视图更新
     * 如果页面处于隐藏状态，则到显示时（active时）再执行视图更新
     * 
     * @public
     * @param {!Function} updater 更新器（回调）
     * @param {Object=} scope updater执行的scope，缺省则为window
     * @param {...*} args updater执行时传递的参数
     */
    PANEL_PAGE_CLASS.updateView = function(updater, scope, args) {
        if (this._bVisible) {
            updater.apply(scope, arraySlice.call(arguments, 2));
        }
        else {
            this._aPendingUpdater.push(
                {
                    updater: updater,
                    scope: scope,
                    args: arraySlice.call(arguments, 2)
                }
            );
        }
    };

    /**
     * 得到pageId
     *
     * @public
     * @return {string} pageId
     */
    PANEL_PAGE_CLASS.getPageId = function() {
        return this._sPageId;
    };
    
    /**
     * 得到来源的pageId
     *
     * @public
     * @return {string} fromPageId
     */
    PANEL_PAGE_CLASS.getFromPageId = function() {
        return this._sFromPageId;
    };
    
    /**
     * 设置来源的pageId
     *
     * @public
     * @param {string} fromPageId
     */
    PANEL_PAGE_CLASS.setFromPageId = function(fromPageId) {
        this._sFromPageId = fromPageId;
    };
    
    /**
     * 激活，PanelPageManager使用
     *
     * @public
     */
    PANEL_PAGE_CLASS.active = function() {
        this._bVisible = true;

        // 执行panding的视图更新
        var updaterWrap;
        while(updaterWrap = this._aPendingUpdater.shift()) {
            updaterWrap.updater.apply(updaterWrap.scope, updaterWrap.args);
        }

        this.$active();
    };

    /**
     * 睡眠，PanelPageManager使用
     *
     * @public
     */
    PANEL_PAGE_CLASS.inactive = function() {
        this._bVisible = false;
        this.$inactive();
    };

    /**
     * 激活，由派生类实现
     *
     * @protected
     * @abstract
     */
    PANEL_PAGE_CLASS.$active = function() {};
    
    /**
     * 睡眠，由派生类实现
     *
     * @protected
     * @abstract
     */
    PANEL_PAGE_CLASS.$inactive = function() {};

})();
/**
 * di.helper.ArgHandlerFactory
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    默认的参数解析方法集合
 * @author:  sushuang(sushuang)
 * @depend:  xutil
 */

$namespace('di.shared.arg');
 
(function () {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var isObject = xutil.lang.isObject;
    var extend = xutil.object.extend;
    var getByPath = xutil.object.getByPath;
    var setByPath = xutil.object.setByPath;
    var isArray = xutil.lang.isArray;
    var formatTime = di.helper.Util.formatTime;
    var parseTimeUnitDef = di.helper.Util.parseTimeUnitDef;
    var assign = xutil.object.assign;
    var merge = xutil.object.merge;
    var DI_FACTORY;

    $link(function () {
        DI_FACTORY = di.shared.model.DIFactory;
    });

    /**
     * 默认的参数解析方法集合
     * 约定：所有parser的
     *      this：是参数所属的函数被调用时的scope。
     *      输入：
     *          {Array} tarArgs 要处理的参数数组。
     *          {*...} 其余参数。
     *
     * 注意GeneralArgHandler如果要更改原参数对象的内容，需要新建副本，
     * 以免影响其他事件处理器的响应。
     *
     * 得到argHandler的方法：
     *      var argHandler = di.helper.ArgHandlerFactory(
     *          [somObj1, 'handlerName1', 'asdf', 'zxcv', ...],
     *          [null, 'handlerName2', 'zxz', 1242, ...]
     *      );
     * 则得到了一个argHandler，其中会顺序调用handlerName1, handlerName2
     * handlerName1调用时，'asdf', 'zxcv', ... 会作为后面的参数自动传入，
     * handlerName2同理。
     *
     * @param {Array...} descs 
     *          每个Array：
     *              第一个元素是转换函数调用时的scope（可缺省），
     *              第二个元素是转换函数名，
     *              以后的元素是转换函数调用时，tarArgs后面的参数。
     * @return {Function} 参数转换函数
     */
    $namespace().ArgHandlerFactory = function (descs) {
        // 目前全由内部提供，后续支持可扩展
        if (arguments.length < 1) {
            return null;
        }

        var funcs = [];

        // 这其中会进行check，如果非法则返回空
        for (var i = 0, desc; i < arguments.length; i ++) {
            desc = arguments[i];
            funcs.push(
                [
                    desc[0], 
                    NS[desc[1]], 
                    desc.slice(2)
                ]
            );
            if (!funcs[funcs.length - 1][1]) {
                return null;
            }
        }

        return function (tarArgs) {
            // 链式调用各个argHandler
            for (var i = 0, func; func = funcs[i]; i ++) {
                func[1].apply(
                    func[0], 
                    [tarArgs].concat(func[2])
                );
            }
            return tarArgs;
        }
    }

    var NS = {};

    /**
     * 清除参数内容
     * 
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {number=} index 参数index，如果缺省则全部清除
     */
    NS.clear = function (tarArgs, index) {
        if (index != null) {
            tarArgs[index] = void 0;
        }
        else {
            for (var i = 0; i < tarArgs.length; i ++) {
                tarArgs[i] = void 0;
            }
        }
    };

    /**
     * 对第一个参数，根据源属性路径取得值，根据目标属性路径放到结果对象中。
     * 属性路径例如'aaa.bbb[3][4].ccc.ddd'
     * 
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {string} srcPath 源属性路径，如果为null，则取数组元素本身
     * @param {string} tarPath 目标属性路径，如果为null，则放到数组元素本身上
     * @param {number} index 对第哪个参数进行操作，默认为0
     * @param {Object=} options 参见xutil.object.setByPath的options
     */
    NS.attr = function (tarArgs, srcPath, tarPath, index, options) {
        index = String(index || 0);
        var value = tarArgs[index];
        setByPath(
            !tarPath ? index : (index + '.' + tarPath),
            isObject(value) ? getByPath(srcPath, value, options) : value,
            tarArgs,
            options
        );
    };

    /**
     * 对第一个参数，按arrPath得到数组，对每一个元素，按arcPath和tarPath进行转换
     * 属性路径例如'aaa.bbb[3][4].ccc.ddd'
     * 
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {string} arrPath 数组目标，如果为null，则取tarArgs[0]本身
     * @param {string} srcPath 源属性路径，如果为null，则取数组元素本身
     * @param {string} tarPath 目标属性路径，如果为null，则放到数组元素本身上
     * @param {Object=} options 参见xutil.object.setByPath的options
     */
    NS.attrArr = function (tarArgs, arrPath, srcPath, tarPath, options) {
        var value = tarArgs[0];
        var arr = isObject(value)
            ? (
                arrPath 
                    ? getByPath(arrPath, value, options) 
                    : value
            )
            : null;

        if (isArray(arr)) {
            for (var i = 0, itemA; i < arr.length; i ++) {
                NS.attr(arr, srcPath, tarPath, i, options);
            }
        }
    };

    /**
     * 设置数据（用于配置时）
     * 
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {*} data 数据
     * @param {number} index 向第哪个参数，默认为0
     */
    NS.setData = function (tarArgs, data, index) {
        tarArgs[index || 0] = data;
    };

    /**
     * merge数据（用于配置时）
     * 
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {*} data 数据
     * @param {number} index 向第哪个参数，默认为0
     */
    NS.mergeData = function (tarArgs, data, index) {
        merge(tarArgs[index || 0], data);
    };

    /**
     * 从diIdList给定的id对应的di实例中用getValue取值，
     * 覆盖到tarArgs第一个参数中。
     *
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {string} di实例的id
     * @param {string} srcPath 源属性路径
     * @param {string} tarPath 目标属性路径
     * @param {Object=} options 参见xutil.object.setByPath的options
     */
    NS.getValue = function (tarArgs, diId, srcPath, tarPath, options) {
        var ins = DI_FACTORY().getEntity(diId, 'INS');
        var o = [];
        if (ins && ins.$di) {
            var value = ins.$di('getValue');
            setByPath(
                !tarPath ? '0' : ('0.' + tarPath), 
                isObject(value) ? getByPath(srcPath, value, options) : value,
                o,
                options
            );
            
            if (isObject(o[0])) {
                extend(tarArgs[0] || (tarArgs[0] = {}), o[0]);
            }
            else {
                tarArgs[0] = o[0];
            }
        }
    };

    /**
     * 修正时间
     * 应用场景例如：可以在这里配置固定时间，隐含时间等界面输入无法不表达出的时间参数
     *
     * @public
     * @this {Object} tarArgs所属函数被调用时的scope
     * @param {Array} tarArgs
     * @param {string} attrName 参数属性名
     * @param {Object.<Array.<string>>} timeUnitDefMap 按此参数修正时间。 
     *      格式例如：{ D: ['-1Y', '0D'], W: ['-1Y', '0D'], M: ['-24M', '0D'], Q: ['-2Y', '0D'] }
     */
    NS.patchTime = function (tarArgs, attrName, timeUnitDefMap) {
        var arg = tarArgs[0];
        if (isObject(arg) && isObject(arg = arg[attrName])) {
            var gran = arg.granularity;
            arg = parseTimeUnitDef(
                timeUnitDefMap[gran], 
                [arg.start, arg.end, arg.range]
            );
            arg.start = formatTime(arg.start, gran);
            arg.end = formatTime(arg.end, gran);
            extend(tarArgs[0][attrName], arg);
        }
    };

})();
/**
 * di.shared.adapter.BeakerChartVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    BeakerChart的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var extend = xutil.object.extend;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var formatNumber = xutil.number.formatNumber;
    var UI_BEAKER_CHART = ecui.ui.BeakerChart;
    var UI_BEAKER_CHART_CLASS = UI_BEAKER_CHART.prototype;

    /**
     * BeakerChart的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().BeakerChartVUIAdapter = function(def, options) {
        return {
            create: create,
            setData: setData
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        // 创建ecui控件
        return ecuiCreate(
            UI_BEAKER_CHART,
            def.el,
            null,
            options
        );
    }

    /**
     * 设置数据并渲染
     * 将标准的数据转换为烧杯图需要的的格式。
     * 由于是特殊定制的图，所以这接口相当“特定”。
     *
     * @public
     * @this {Object} 目标实例
     * @param {Object} data 数据
     */
    function setData(data) {
        var series = data.series || [];
        var datasource = {};
        var beakerA = datasource.beakerA = { water: [] };
        var beakerB = datasource.beakerB = { water: [] };
        var o;

        for (var i = 3; o = series[i]; i ++) {
            beakerA.water.push(
                {
                    text: o.name,
                    value: o.data[0]
                }
            );
        }

        if (o = series[2]) {
            beakerA.mark = {
                text: o.name,
                value: o.data[0]
            };
        }

        if (o = series[1]) {
            beakerB.water.push(
                {
                    text: o.name,
                    value: o.data[0]
                }
            );
        }

        if (o = series[0]) {
            datasource.theRate = {
                text: o.name,
                value: o.data[0] != null
                    ? formatNumber(
                        o.data[0], 'I,III.DD%', void 0, void 0, true
                    )
                    : '-'
            };
        }
        
        datasource.title = data.xAxis[0].data[0];

        var o = {
            width: data.width,
            heigth: data.height,
            datasource: datasource
        }

        return UI_BEAKER_CHART_CLASS.setData.call(this, o);
    }

})();

/**
 * di.shared.adapter.CalendarPlusVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    CalendarPlus的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var UTIL = di.helper.Util;
    var ecuiCreate = UTIL.ecuiCreate;
    var ecuiDispose = UTIL.ecuiDispose;
    var detachEvent = ecui.util.detachEvent;
    var attachEvent = ecui.util.attachEvent;
    var disposeControl = ecui.dispose;
    var repaint = ecui.repaint;
    var parseTimeUnitDef = UTIL.parseTimeUnitDef;
    var formatTime = UTIL.formatTime;
    var CALENDAR_PLUS = ecui.ui.CalendarPlus;
    var GLOBAL_MODEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
    });

    /**
     * CalendarPlus的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().CalendarPlusVUIAdapter = function(def, options) {
        return {
            create: create,
            setData: setData,
            getValue: getValue
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @param {Object} options.granularities 粒度，
     *      'D', 'W', 'M', 'Q', 'Y'
     *          每项的配置，含有：
     *          options.start 开始时间，绝对值（如2012-12-12）或相对当前时间的值（如-5d）
     *          options.end 结束时间，格式同上
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        return ecuiCreate(CALENDAR_PLUS, def.el, null, prepareData(options));
    }

    /**
     * 设置数据
     *
     * @public
     */
    function setData(data) {
        this.setData(prepareData(data));
        // detachEvent(window, 'resize', repaint);

        // var disposeFunc = this.$dispose;
        // this.$dispose = new Function();
        // disposeControl(this);
        // this.$dispose = disposeFunc;

        // var el = this.getOuter();
        // el.innerHTML = '';
        // this.$setBody(el);
        // this.$resize();
        // CALENDAR_PLUS.client.call(this, el, prepareData(data));
        // this._bCreated = false;
        // this.cache(true, true);
        // this.init();

        // attachEvent(window, 'resize', repaint);
    }

    /**
     * 准备数据
     *
     * @private
     */
    function prepareData(options) {
        var now = GLOBAL_MODEL().getDateModel().now();

        var defUnit = {
                defaultTime: ['0d'],
                range: ['-1Y', '0d']
            };
        var granularities = options.granularities
            // 缺省的granularity
            || { D: defUnit, W: defUnit, M: defUnit, Q: defUnit };

        var opt = {
            types: [],
            range: {},
            defaults: {}
        };

        var timeMap = {
            D: 'day', W: 'week', M: 'month', Q: 'quarter', Y: 'year'
        };

        var range;
        for (var gran in granularities) {
            opt.types.push(gran);

            range = granularities[gran];
            
            opt.defaults[timeMap[gran]] = formatObjTime(
                parseTimeUnitDef(range.defaultTime, [now, now]),
                gran
            ).start;
            opt.range[timeMap[gran]] = formatObjTime(
                parseTimeUnitDef(range.range, [now, now]) || {},
                gran
            );
        }

        return opt;
    }

    /**
     * 格式化时间
     * 
     * @private
     */    
    function formatObjTime(obj, granularity) {
        for (var key in obj) {
            obj[key] = formatTime(obj[key], granularity);
        }
        return obj;
    }

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    function getValue() {
        var wrap = this.getDate();
        return {
            start: wrap.date,
            end: wrap.date,
            granularity: wrap.type
        };
    }

})();

/**
 * di.shared.adapter.EcuiInputTreeVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    ecui input-tree的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {

    var ecuiCreate = di.helper.Util.ecuiCreate;
    var dateToString = xutil.date.dateToString;
    var isArray = xutil.lang.isArray;
    var DICT = di.config.Dict;

    /**
     * ecui input tree的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().EcuiInputTreeVUIAdapter = function(def, options) {
        return {
            create: create,
            setData: setData,
            getValue: getValue
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        // 控件初始化所须
        options.hideCancel = true;
        options.asyn = true;

        var ctrl = ecuiCreate(def.clz, def.el, null, options);

        ctrl.$di('registerEventAgent', 'async');

        // 挂接事件
        ctrl.onloadtree = function (value, func) {
            /**
             * 异步加载统一的事件
             *
             * @event
             */
            ctrl.$di(
                'dispatchEvent',
                'async',
                [
                    value,
                    function (data) {
                        func((data.datasource || {}).children || []);
                    }
                ]
            );
        }

        // 赋予全局浮层id，用于自动化测试的dom定位
        ctrl._uLayer.getOuter().setAttribute(DICT.TEST_ATTR, def.id);

        return ctrl;
    }

    /**
     * 设置初始化数据
     * 
     * @public
     * @param {Object} data 数据
     */
    function setData(data) {
        if (!data) {
            return;
        }

        this.setData(
            { 
                root: data.datasource,
                selected: isArray(data.value) 
                    ? data.value[0] 
                    : (data.value || (data.datasource || {}).value)
            }, 
            { 
                hideCancel: data.hideCancel == null 
                    ? true : data.hideCancel, 
                asyn: data.asyn == null 
                    ? true : data.asyn
            }
        );
    }

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    function getValue() {
        var v = this.getValue();
        return v ? [v.value] : [];
    }

})();

/**
 * di.shared.adapter.EcuiInputVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    input（单行输入，以及textarea）的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var UTIL = di.helper.Util;
    var ecuiCreate = UTIL.ecuiCreate;

    /**
     * input（单行输入，以及textarea）的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().EcuiInputVUIAdapter = function(def, options) {
        return {
            // getValue: getValue
        };
    };

})();

/**
 * di.shared.adapter.EcuiSelectVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    IstCalendar的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var DICT = di.config.Dict;

    /**
     * ecui Select的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().EcuiSelectVUIAdapter = function(def, options) {
        return {
            setData: setData,
            getValue: getValue
        };
    };

    /**
     * 设置初始化数据
     * 
     * @public
     * @param {Object} data 数据
     * @param {Array.<Object>} data.datasource 数据集
     *      每个节点：
     *          {string} text
     *          {string} value
     * @param {Array.<string>} data.value 初始选中
     */
    function setData(data) {
        data = data || {};
        var datasource = data.datasource || [];
        var value = (data.value && data.value[0])
            || (datasource[0] && datasource[0].value);
            
        // 清除
        this.setValue(null);
        while(this.remove(0)) {}

        // 添加
        for (var i = 0, o; o = datasource[i]; i++) {
            this.add(
                String(o.text != null ? o.text : ''), 
                null,
                { value: o.value }
            );
        }

        // 设置默认选中
        value != null && this.setValue(value);
    }

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    function getValue() {
        var v = this.getValue();
        return v == null ? [] : [v];
    }

})();

/**
 * di.shared.adapter.EcuiSuggestVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    ecui suggest的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var extend = xutil.object.extend;
    var ecuiCreate = di.helper.Util.ecuiCreate;

    /**
     * ecui suggest的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @param {string} options.valueType 提交时值的类型，可为
     *      'TEXT'：则getValue取到的值是text（默认）
     *      'VALUE'：则getValue取到的是value
     * @return {Object} vui adapter实例
     */
    $namespace().EcuiSuggestVUIAdapter = function(def, options) {
        return {
            create: create,
            getValue: getValueFunc[options.valueType || 'TEXT']
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        var ctrl = ecuiCreate(def.clz, def.el, null, options);

        ctrl.$di('registerEventAgent', 'async');
        
        // 挂接事件
        ctrl.onquery = function (value) {
            /**
             * 异步加载统一的事件
             *
             * @event
             */
            ctrl.$di(
                'dispatchEvent',
                'async',
                [
                    (value || {}).text,
                    function (data) {
                        ctrl.update(data.datasource || []);
                    }
                ]
            );
        }

        return ctrl;
    }    

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {string} 数据
     */
    var getValueFunc = {
        TEXT: function () {
            return (this.getValue() || {}).text || '';
        },
        VALUE: function () {
            return (this.getValue() || {}).value || '';
        }
    }

})();

/**
 * di.shared.adapter.GeneralAdapterMethod
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    通用的默认适配器
 *           一般在di.config.Dict中使用adapterMethods来引用此中方法，
 *           拷贝到目标对象中
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var UTIL = di.helper.Util;
    var extend = xutil.object.extend;

    /**
     * 通用的适配器方法
     */
    $namespace().GeneralAdapterMethod = {
        ecuiCreate: ecuiCreate,
        ecuiDispose: ecuiDispose,
        xuiCreate: xuiCreate,
        xuiDispose: xuiDispose
    };

    /**
     * 创建ecui控件
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @return {Object} 创建的实例
     */
    function ecuiCreate(def, options) {
        return UTIL.ecuiCreate(def.clz, def.el, null, options);
    }

    /**
     * 释放ecui控件
     *
     * @public
     * @this {Object} 控件
     */
    function ecuiDispose() {
        UTIL.ecuiDispose(this);
    }

    /**
     * 创建xui-ui控件
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @return {Object} 创建的实例
     */
    function xuiCreate(def, options) {
        return new def.clz(options);
    }

    /**
     * 释放xui-ui控件
     *
     * @public
     * @this {Object} 控件
     */
    function xuiDispose() {
        this.dispose && this.dispose();
    }
    
    // ...

})();

/**
 * di.shared.adapter.HChartVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    HChart的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var UTIL = di.helper.Util;
    var parseTimeUnitDef = UTIL.parseTimeUnitDef;
    var formatTime = UTIL.formatTime;
    var dateToString = xutil.date.dateToString;
    var GLOBAL_MODEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
    });

    /**
     * IstCalendar的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().HChartVUIAdapter = function(def, options) {
        return {
            setData: setData
        };
    };

    /**
     * 设置数据
     *
     * @public
     */
    function setData(data) {
        var now = GLOBAL_MODEL().getDateModel().now();

        if (data.weekViewRange) {
            var range = parseTimeUnitDef(data.weekViewRange, [now, now]);

            if (range) {
                var fmt = 'yyyy-MM-dd';
                range[0] = range.start ? dateToString(range.start, fmt) : null;
                range[1] = range.end ? dateToString(range.end, fmt) : null;

                for (
                    var i = 0, xAxisDef; 
                    xAxisDef = (data.xAxis || [])[i]; 
                    i ++
                ) {
                    xAxisDef.range = range;
                }
            }
        }

        this.setData(data);
    }

})();

/**
 * di.shared.adapter.IstCalendarVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    IstCalendar的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var UTIL = di.helper.Util;
    var ecuiCreate = UTIL.ecuiCreate;
    var dateToString = xutil.date.dateToString;
    var parseTimeUnitDef = UTIL.parseTimeUnitDef;
    var assign = xutil.object.assign;
    var GLOBAL_MODEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
    });

    /**
     * IstCalendar的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().IstCalendarVUIAdapter = function(def, options) {
        return {
            create: create,
            getValue: getValue
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @param {string} options.start 开始时间，
     *                      绝对值（如2012-12-12）
     *                      或相对于系统时间的偏移（如-5d）
     * @param {string} options.end 结束时间，格式同上。如果和range同时存在，则end优先
     * @param {string} options.range 区间，相对于start的偏移（如-4d）
     * @param {string} options.defaultTime 默认时间
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        var now = GLOBAL_MODEL().getDateModel().now();

        var opt = {};

        opt.now = now.getTime();

        var defTime = parseTimeUnitDef(options.defaultTime, [now, now]);
        opt.date = defTime.start;
        opt.dateEnd = defTime.end;

        var range = parseTimeUnitDef(options.range, [now, now]);
        opt.start = range.start;
        opt.end = range.end;

        // 其他选项
        assign(opt, options, ['mode', 'viewMode', 'shiftBtnDisabled']);

        return ecuiCreate(def.clz, def.el, null, opt);
    }

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    function getValue() {
        var start = dateToString(this.getDate());

        if (this.getMode() == 'RANGE') {
            return {
                start: start,
                end: dateToString(this.getDateEnd())
            };
        }
        else {
            return {
                start: start,
                end: start
            }
        }
    }

})();

/**
 * di.shared.adapter.MetaConfigVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    元数据选择控件的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function () {

    var dateToString = xutil.date.dateToString;
    var isArray = xutil.lang.isArray;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var DICT = di.config.Dict;

    /**
     * 元数据选择控件的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().MetaConfigVUIAdapter = function (def, options) {
        var clzKey = def.clzKey;

        return {
            create: CREATE_METHOD[clzKey],
            setData: SET_DATA_METHOD[clzKey],
            updateData: UPDATE_DATA_METHOD[clzKey]
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @param {string} options.start 开始时间，
     *                      绝对值（如2012-12-12）
     *                      或相对于系统时间的偏移（如-5d）
     * @param {string} options.end 结束时间，格式同上。如果和range同时存在，则end优先
     * @param {string} options.range 区间，相对于start的偏移（如-4d）
     * @param {string} options.defaultTime 默认时间
     * @return {Object} 创建的实例
     */
    var CREATE_METHOD = {
        OLAP_META_DRAGGER: function create(def, options) {
            var ins = new def.clz(options)            

            ins.$di('registerEventAgent', 'change');

            ins.attach(
                'sellinechange', 
                function (wrap) {
                    ins.$di('dispatchEvent', 'change', [wrap]);
                }
            );

            return ins;
        },
        OLAP_META_IND_SELECT: function create(def, options) {
            var ins = ecuiCreate(def.clz, def.el, null, options);

            ins.$di('registerEventAgent', 'change');

            ins.onchange = function (wrap) {
                ins.$di('dispatchEvent', 'change', [ins.getValue()]);
            }

            // 禁用鼠标事件
            ins.$mousewheel = new Function();

            return ins;
        }
    };

    /**
     * 设置初始化数据
     * 
     * @public
     * @param {Object} data 数据
     */
    var SET_DATA_METHOD = {
        OLAP_META_DRAGGER: function (data) {
            this.setData(data);
        },
        OLAP_META_IND_SELECT: function (data) {
            var indList = data.inddim.indList;
            var datasource = [];
            var selected;
            if (indList) {
                indList.foreach(
                    function (k, item, index) {
                        if (item.status != DICT.META_STATUS.DISABLED) {
                            datasource.push(
                                { 
                                    text: item.caption, 
                                    value: item.uniqName 
                                }
                            );
                        }
                        if (item.status == DICT.META_STATUS.SELECTED) {
                            selected = item.uniqName;
                        }
                    }
                );
            }

            // 清除
            this.setValue(null);
            while(this.remove(0)) {}

            // 添加
            for (var i = 0, o; o = datasource[i]; i++) {
                this.add(
                    String(o.text != null ? o.text : ''), 
                    null,
                    { value: o.value }
                );
            }

            // 设置默认选中
            selected != null && this.setValue(selected);
        }
    };

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    var UPDATE_DATA_METHOD = {
        OLAP_META_DRAGGER: function (data) {
            this.refreshStatus(data);
        },
        OLAP_META_IND_SELECT: function (data) {
            // do nothing
        }
    };

})();

/**
 * di.shared.adapter.XCalendarVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    CalendarPlus的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {
    
    var UTIL = di.helper.Util;
    var ecuiCreate = UTIL.ecuiCreate;
    var ecuiDispose = UTIL.ecuiDispose;
    var detachEvent = ecui.util.detachEvent;
    var attachEvent = ecui.util.attachEvent;
    var disposeControl = ecui.dispose;
    var repaint = ecui.repaint;
    var parseTimeDef = UTIL.parseTimeDef;
    var formatTime = UTIL.formatTime;
    var X_CALENDAR = ecui.ui.XCalendar;
    var assign = xutil.object.assign;
    var clone = xutil.object.clone;
    var GLOBAL_MODEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
    });

    /**
     * XCalendar的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().XCalendarVUIAdapter = function(def, options) {
        return {
            create: create,
            setData: setData,
            getValue: getValue
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @param {Object} options.granularities 粒度，
     *      'D', 'W', 'M', 'Q', 'Y'
     *          每项的配置，含有：
     *          options.start 开始时间，绝对值（如2012-12-12）或相对当前时间的值（如-5d）
     *          options.end 结束时间，格式同上
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        return ecuiCreate(X_CALENDAR, def.el, null, prepareInitData(options));
    }

    /**
     * 设置数据
     *
     * @public
     */
    function setData(data) {
        this.setDatasource(prepareSetData(data));
    }

    /**
     * 准备数据
     *
     * @private
     */
    function prepareInitData(options) {
        var opt = assign(
            {}, 
            options, 
            [   
                'viewMode', 
                'headText', 
                'rangeLinkStr', 
                'weekLinkStr', 
                'blankText', 
                'forbidEmpty'
            ]
        );
        opt.timeTypeList = [];
        return opt;
    }

    /**
     * 准备数据
     *
     * @private
     */
    function prepareSetData(options) {
        var now = GLOBAL_MODEL().getDateModel().now();
        var opt = clone(options);
        var timeTypeOpt = options.timeTypeOpt;
        var timeType;
        var o;
        var i;
        var dArr;
        var unit;
        var offsetBase;
        opt.timeTypeOpt = opt.timeTypeOpt || {};

        for (timeType in timeTypeOpt) {
            o = opt.timeTypeOpt[timeType] = timeTypeOpt[timeType];
            dArr = parseTimeDef(o.date, [now, now]);

            // FIXME
            // 这里对于任意散选的情况，只支持了start，也就是只能这么配：
            // [[-1D], [-4D], ...] 而不能 [[-5D, -1D], [-9W, -6D], ...]
            if (dArr.length > 1) {
                o.date = [];
                for (i = 0; unit = dArr[i]; i ++) {
                    o.date.push(formatObjTime(unit, timeType).start);
                }
            }
            else {
                unit = formatObjTime(dArr[0],timeType);
                o.date = unit.end ? [unit.start, unit.end] : [unit.start];
            }
            o.range = formatObjTime(
                parseTimeDef(o.range, [now, now]) || {},
                timeType
            );
            o.range.offsetBase = now;
        }

        return opt;
    }

    /**
     * 格式化时间
     * 
     * @private
     */    
    function formatObjTime(obj, timeType) {
        for (var key in obj) {
            obj[key] = formatTime(obj[key], timeType);
        }
        return obj;
    }

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    function getValue() {
        // TODO
        // 现在后台还不支持多选，只支持单选和范围选择
        var aDate = this.getValue();
        var timeType = this.getTimeType();
        return {
            start: formatTime(aDate[0], timeType),
            end: formatTime(aDate[1] || aDate[0], timeType),
            granularity: timeType
        };
    }

})();

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
            INIT: URL('OLAP_CHART_BASE_CONFIG_INIT'),
            SUBMIT: URL('OLAP_CHART_BASE_CONFIG_INIT')
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

/**
 * di.console.shared.ui.ChartConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    图设置面板
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.console.shared.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var URL = di.config.URL;
    var DIALOG = di.helper.Dialog;
    var UTIL = di.helper.Util;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var createDom = ecui.dom.create;
    var getStyle = ecui.dom.getStyle;
    var triggerEvent = ecui.triggerEvent;
    var disposeControl = ecui.dispose;
    var ecuiCreate = UTIL.ecuiCreate;
    var disposeInnerControl = UTIL.disposeInnerControl;
    var template = xutil.string.template;
    var q = xutil.dom.q;
    var createSingleton = xutil.object.createSingleton;
    var hasValueNotBlank = xutil.lang.hasValueNotBlank;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var textLength = xutil.string.textLength;
    var textSubstr = xutil.string.textSubstr;
    var stringToDate = xutil.date.stringToDate;
    var trim = xutil.string.trim;
    var bind = xutil.fn.bind;
    var XVIEW = xui.XView;
    var UI_TEXTAREA = ecui.ui.Textarea;
    var UI_INPUT = ecui.ui.Input;
    var UI_FORM = ecui.ui.Form;
    var UI_BUTTON = ecui.ui.Button;
    var UI_IND_TREE = ecui.ui.IndTree;
    var UI_CALENDAR = ecui.ui.IstCalendar;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var CHART_CONFIG_MODEL;

    $link(function() {
        CHART_CONFIG_MODEL = di.console.shared.model.ChartConfigModel;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 图设置
     * 单例，直接使用CHART_CONFIG_PANEL()可得到实例
     * 
     * @class
     * @extends di.shared.ui.BaseConfigPanel
     */
    var CHART_CONFIG_PANEL = $namespace().ChartConfigPanel = 
            createSingleton(BASE_CONFIG_PANEL);
    var CHART_CONFIG_PANEL_CLASS = CHART_CONFIG_PANEL.prototype;

    var TPL_MAIN = [
            '<div class="di-dim-select-cal">',
                '<div class="q-calendar"></div>',
            '</div>'
        ].join('');

    /**
     * 标题
     */
    CHART_CONFIG_PANEL_CLASS.PANEL_TITLE = '图设置';

    //------------------------------------------
    // override方法 
    //------------------------------------------

    /**
     * 创建View
     *
     * @override
     * @protected
     * @param {Object} options 初始化参数
     */
    CHART_CONFIG_PANEL_CLASS.$doCreateView = function(options) {
    };

    /**
     * 创建Model
     *
     * @override
     * @protected
     * @param {Object} options 初始化参数
     */
    CHART_CONFIG_PANEL_CLASS.$doCreateModel = function(options) {
        this._mModel = new CHART_CONFIG_MODEL();
    };

    /**
     * 其他初始化
     *
     * @override
     * @protected
     */
    CHART_CONFIG_PANEL_CLASS.$doInit = function() {
    };

    /**
     * 得到内容tpl
     *
     * @override
     * @protected
     * @param {Object} options 初始化参数
     * @return {string} 内容的html模板
     */
    CHART_CONFIG_PANEL_CLASS.$doGetInnerTPL = function(options) {
        return 'asdfsadfasdfsadfsadfasdfsadfasdfsa';
    };

    /**
     * 重置输入
     * 
     * @override
     * @protected
     */
    CHART_CONFIG_PANEL_CLASS.$doResetInput = function() {
    };

    /**
     * 渲染内容
     * 
     * @override
     * @protected
     */
    CHART_CONFIG_PANEL_CLASS.$doRender = function() {
    };

    /**
     * 其他启用
     * 
     * @override
     * @protected
     */
    CHART_CONFIG_PANEL_CLASS.$doEnable = function() {
    };

    /**
     * 其他禁用
     * 
     * @override
     * @protected
     */
    CHART_CONFIG_PANEL_CLASS.$doDisable = function() {
    };

    /**
     * 其他禁用
     * 
     * @override
     * @protected
     * @return {Object} 提交参数包装，如{ aaa: 1, bbb: '123' }
     */
    CHART_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
    };

})();

/**
 * di.console.shared.ui.GlobalMenu
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    [通用构件] 顶层全局菜单
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.console.shared.ui');

/**
 * [外部注入 (@see ecui.util.ref)]
 * {di.shared.model.GlobalMenuManager} globalMenuManager 全局菜单管理
 */
(function () {
    
    /* 外部引用 */
    var core = ecui,
        dom = core.dom,
        util = core.util,
        ui = core.ui,
        inheritsControl = core.inherits,
        $fastCreate, disposeControl,
        createDom, getStyle, setStyle, extend, template,
        URL,
        UI_CONTROL = ui.Control;
        
    $link(function () {
        $fastCreate = core.$fastCreate;
        disposeControl = core.dispose;

        createDom = dom.create;
        setStyle = dom.setStyle;
        getStyle = dom.getStyle;
        extend = util.extend;
        template = core.xstring.template;
        
        URL = di.config.URL;
    });
        
    /* 类型声明 */
    var GLOBAL_MENU = $namespace().GlobalMenu = 
        inheritsControl(
            UI_CONTROL, 'global-menu', null,
            function (el, options) {
                el.innerHTML = template(TPL_MAIN, {type: this.getType()});
                this._eInner = el.firstChild;
                this._aItems = [];
                this._uCurrSel;
            }
        ),
        GLOBAL_MENU_CLASS = GLOBAL_MENU.prototype,
    
        GLOBAL_MENU_ITEM_CLASS = (GLOBAL_MENU_CLASS.Item = inheritsControl(
            UI_CONTROL, 'global-menu-item', null, 
            function(el, options) {
                var data = options.data, 
                    parent = options.parent,
                    selMenu = options.selMenu;
                    
                setStyle(el, 'display', 'inline-block');
                el.innerHTML = template(TPL_ITEM, 
                    {type: this.getType(), text: data.menuName, url: URL.WEB_ROOT + data.menuUrl});
                
                if (selMenu.menuId == (this._sMenuId = data.menuId)) {
                    parent._uCurrSel = this;
                    this.alterClass('+selected');
                }
            }        
        )).prototype;

    /* 模板 */
    var TPL_MAIN = '<div class="#{type}-items"></div>',
        TPL_ITEM = '<a href="#{url}" target="_blank">' +
                       '<div class="#{type}-ledge"></div>' +
                       '<div class="#{type}-text">#{text}</div>' +
                       '<div class="#{type}-redge"></div>' +
                   '</a>';
                
    /**
     * 初始化
     * @protected
     */
    GLOBAL_MENU_CLASS.init = function () {
        this.$resetItems();
    };
    
    /**
     * 销毁
     * @protected
     */
    GLOBAL_MENU_CLASS.$dispose = function () {
        this._aCurrSel = null;
        this.$disposeItems();
        GLOBAL_MENU.superClass.$dispose.call(this);
    };
    
    /**
     * 重置节点
     * @protected
     */
    GLOBAL_MENU_CLASS.$resetItems = function () {
        var datasource, selMenu, i, data, el, item;
        
        this._aCurrSel = null;
        this.$disposeItems();
        
        datasource = this._mGlobalMenuManager.getMenuData();
        selMenu = this._mGlobalMenuManager.getSelected();
        
        for (i = 0; data = datasource[i]; i++) {
            this._eInner.appendChild(el = createDom('global-menu-item'));
            this._aItems.push(item = $fastCreate(this.Item, el, this, 
                {data: data, selMenu: selMenu, parent: this}));
        }
    };
    
    /**
     * 析构节点
     * @protected
     */
    GLOBAL_MENU_CLASS.$disposeItems = function () {
        var i, o;
        for (i = 0; o = this._aItems[i]; i++) {
            o.dispose();
        }
        this._aItem = [];
        this._eInner.innerHTML = '';
    };
    
})();

/**
 * di.console.shared.ui.MENU_MAIN_PAGE
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    含左菜单，右侧是tab页的整体页基类，如果想用这种布局及逻辑，可继承此类
 * @author:  sushuang(sushuang)
 * @depend:  ecui
 */

$namespace('di.console.shared.ui');

(function () {
    
    //---------------------------------------------
    // 引用
    //---------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var q = xutil.dom.q;
    var ref = ecui.util.ref;
    var preInit = ecui.util.preInit;
    var $fastCreate = ecui.$fastCreate;
    var template = xutil.string.template;
    var XVIEW = xui.XView;
    var PL_FLOAT_MENU = ecui.ui.PlFloatMenu;
    var UI_TAB_CONTAINER = ecui.ui.TabContainer;
    var DICT = di.config.Dict;
    var URL = di.config.URL;
    var MENU_PAGE_MANAGER;
    var PANEL_PAGE_MANAGER;
    var PANEL_PAGE_TAB_ADAPTER;
        
    $link(function () {
        var sharedNS = di.shared;
        MENU_PAGE_MANAGER = sharedNS.model.MenuPageManager;
        PANEL_PAGE_MANAGER = sharedNS.model.PanelPageManager;
        PANEL_PAGE_TAB_ADAPTER = sharedNS.model.PanelPageTabAdapter;
    });
    
    //---------------------------------------------
    // 类型声明
    //---------------------------------------------

    var MENU_MAIN_PAGE = $namespace().MenuMainPage = 
        inheritsObject(
            XVIEW,
            function(options) {
                createHTML.call(this, options);
                createModel.call(this, options);
                createView.call(this, options);
            }
        );
    var MENU_MAIN_PAGE_CLASS = MENU_MAIN_PAGE.prototype;
    
    /* 模板 */    
    var TPL_MAIN =
            '<div class="main-left">' + 
                '<div class="ui-menu q-menu"><label>&nbsp;</label></div>' +
            '</div>' + 
            '<div class="main-right">' + 
                '<div class="ui-tab q-main"></div>' + 
            '</div>' + 
            '<div class="clear"></div>';

    //---------------------------------------------
    // 方法
    //---------------------------------------------

    /**
     * 创建HTML
     * 
     * @private
     * @param {Object} options 初始化参数
     */
    function createHTML(options) {
        this._eMain = options.el;
        this._eMain.innerHTML = template(TPL_MAIN);
    };

    /**
     * 创建Model
     * 
     * @private
     * @param {Object} options 初始化参数
     */
    function createModel(options) {
        this._mMenuPageManager = new MENU_PAGE_MANAGER();
        // 使用tabContainer
        this._mPanelPageManager = new PANEL_PAGE_MANAGER(
            { adapter: PANEL_PAGE_TAB_ADAPTER }
        );
    };
    
    /**
     * 创建View
     * 
     * @private
     * @param {Object} options 初始化参数
     */
    function createView(options) {
        this._uMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu', this._eMain)[0], null);
        this._uMainContainer = $fastCreate(
            UI_TAB_CONTAINER,
            q('q-main', this._eMain)[0],
            null, 
            { primary: 'ui-tab' }
        );
    };
        
    /**
     * @override
     */
    MENU_MAIN_PAGE_CLASS.init = function () {
        MENU_MAIN_PAGE.superClass.init.call(this);
        
        ref(this._mMenuPageManager, 'menu', this._uMenu);
        ref(this._mPanelPageManager, 'panelPageContainer', this._uMainContainer);
        ref(this._mMenuPageManager, 'panelPageManager', this._mPanelPageManager);

        this._mMenuPageManager.init();
        this._mPanelPageManager.init();
        
        // 页面开始
        this._mMenuPageManager.sync();
    };
    
    /**
     * @override
     */
    MENU_MAIN_PAGE_CLASS.dispose = function () {
        this._mMenuPageManager.dispose();
        this._mPanelPageManager.dispose();
        this._eMain = null;
        MENU_MAIN_PAGE.superClass.$dispose.call(this);
    };

})();

/**
 * di.console.model.OLAPEditorModel
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    报表编辑Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.console.model');

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
        this._sReportType = options.reportType || 'TABLE';
        this._sSchemaName = options.schemaName;
        this._sCubeTreeNodeName = options.cubeTreeNodeName;
        this._sReportTemplateId;
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
            INIT: URL('OLAP_REPORT_INIT')
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_EDITOR_MODEL_CLASS.param = new XDATASOURCE.Set(
        {
            INIT: function(options) { 
                var paramArr = [];
                paramArr.push('schemaName=' + textParam(this._sSchemaName));
                paramArr.push('treeNodeName=' + textParam(this._sCubeTreeNodeName));
                return paramArr.join('&');
            }
        }
    );

    /**
     * @override
     * @see xui.XDatasource.prototype.OPTIONS_NAME
     */
    OLAP_EDITOR_MODEL_CLASS.parse = new XDATASOURCE.Set(
        {
            INIT: function(data) {
                this._sReportTemplateId = data ? data['reportTemplateId'] : '';
            }
        }
    );

    /**
     * 得到selLine包装
     *
     * @public
     * @return {xutil.LinkedHashMap} selLine
     */
    OLAP_EDITOR_MODEL_CLASS.getBaseWrap = function() {
        return {
            reportType: this._sReportType,
            reportTemplateId: this._sReportTemplateId,
            schemaName: this._sSchemaName,
            cubeTreeNodeName: this._sCubeTreeNodeName
        };
    };

    /**
     * 设置reportTemplateId
     *
     * @public
     * @param {string} reportTemplateId
     */
    OLAP_EDITOR_MODEL_CLASS.setReportTemplateId = function(reportTemplateId) {
        this._sReportTemplateId = reportTemplateId;
    };

})();

/**
 * di.console.editor.ui.OlapEditor
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    多维分析报表编辑
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
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
    var inheritsControl = ecui.inherits;
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var createDom = ecui.dom.create;
    var getStyle = ecui.dom.getStyle;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var stringifyParam = xutil.url.stringifyParam;
    var $fastCreate = ecui.$fastCreate;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var textParam = xutil.url.textParam;
    var UI_CONTROL = ecui.ui.Control;
    var UI_BUTTON = ecui.ui.Button;
    var UI_SELECT = ecui.ui.Select;
    var PANEL_PAGE_MANAGER;
    var META_CONDITION;
    var OLAP_EDITOR_MODEL;
    var DI_TABLE;
    var DI_CHART;
    var CHART_CONFIG_PANEL;
    var DI_FACTORY;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        META_CONDITION = di.shared.ui.MetaCondition;
        PANEL_PAGE_MANAGER = di.shared.model.PanelPageManager;
        OLAP_EDITOR_MODEL = di.console.model.OLAPEditorModel;
        DI_TABLE = di.shared.ui.DITable;
        DI_CHART = di.shared.ui.DIChart;
        CHART_CONFIG_PANEL = di.console.shared.ui.ChartConfigPanel;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 多维分析报表编辑主类
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.reportType
     * @param {string} options.schemaName
     * @param {string} options.cubeTreeNodeName
     */
    var OLAP_EDITOR = $namespace().OLAPEditor = 
        inheritsControl(
            PANEL_PAGE,
            'olap-editor',
            function(el, options) {
                preInit(this, el, options);
                el.innerHTML = SNIPPET_MAIN;
            },
            function(el, options) {
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var OLAP_EDITOR_CLASS = OLAP_EDITOR.prototype;
    
    //------------------------------------------
    // 模板
    //------------------------------------------

    var SNIPPET_MAIN = [
        '<div class="olap-editor-meta-condition q-di-meta-condition">',
        '</div>',
        '<div class="olap-editor-data">',
            '<div class="olap-editor-operation q-di-operation">',
            '</div>',
            '<div class="olap-editor-data q-di-data">',
            '</div>',
        '</div>'
    ].join('');

    var SNIPPET_TABLE = [
        '<div class="q-di-table-area di-table-area">',
            '<div class="q-di-breadcrumb"></div>',
            '<div class="q-di-table"></div>',
        '</div>'        
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    /* 禁用$setSize */
    OLAP_EDITOR_CLASS.$setSize = new Function();

    /**
     * 创建Model
     *
     * @private
     */
    function createModel(el, options) {
        /**
         * 类型，TABLE 或者 CHART
         *
         * @type {string}
         * @private
         */
        this._sReportType = options.reportType || 'TABLE';

        this._mOLAPEditorModel = new OLAP_EDITOR_MODEL(
            {
                reportType: this._sReportType,
                schemaName: options.schemaName,
                cubeTreeNodeName: options.cubeTreeNodeName
            }
        );
    };
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        var olapEditorModel = this._mOLAPEditorModel;

        /** 
         * 通用参数获取器
         *
         * @public
         * @param {Object=} paramObj 请求参数
         *      key为参数名，
         *      value为参数值，{string}或者{Array.<string>}类型
         * @return {string} 最终请求参数
         */
        function commonParamGetter(paramObj) {
            var o = {
                reportTemplateId: textParam(
                    olapEditorModel.getBaseWrap().reportTemplateId
                )
            };
            extend(o, paramObj);
            return stringifyParam(o).join('&');            
        }

        /** 
         * 通用参数更新方法
         *
         * @public
         * @return {Object} options 参数
         * @return {Object} options.reportTemplateId 后台模板id
         */
        commonParamGetter.update = function(options) {
            var rTplId = options && options.reportTemplateId || null;
            if (rTplId) {
                olapEditorModel.setReportTemplateId(rTplId);
            }
        }

        // 元数据
        this._uMetaCondition = new META_CONDITION(
            {
                el: q('q-di-meta-condition', el)[0],
                reportType: this._sReportType,
                commonParamGetter: commonParamGetter
            }
        );
        this._mMetaConditionModel = this._uMetaCondition.getModel();

        // 操作按钮
        var opEl = q('q-di-operation', el)[0];
        var o = createDom();
        // 查询按钮
        o.innerHTML = '<div class="ui-button-g ui-button">查询</div>';
        opEl.appendChild(o.firstChild);
        this._uQueryBtn = $fastCreate(UI_BUTTON, opEl.lastChild);
        // 图设置按钮
        o.innerHTML = '<div class="ui-button-g ui-button">图设置</div>';
        opEl.appendChild(o.firstChild);
        this._uChartConfigBtn = $fastCreate(UI_BUTTON, opEl.lastChild);

        // 图或者表
        var clz;
        var clzKey;
        if (this._sReportType == 'TABLE') {
            clz = DI_TABLE;
            clzKey = 'DI_TABLE';
        }
        else if (this._sReportType == 'CHART') {
            clz = DI_CHART;
            clzKey = 'DI_CHART';
        }

        var def = {
            id: 'snipptEDITOR.OLAP-EDITOR-DATA-COMPONENT',
            el: q('q-di-data', el)[0],
            clzType: 'COMPONENT',
            clzKey: clzKey
        }
        DI_FACTORY().addEntity(def, 'DEF');
        def = DI_FACTORY().getEntity(def.id, 'DEF');

        this._uDIData = DI_FACTORY().createIns(
            def, { tplMode: 'SELF', commonParamGetter: commonParamGetter } 
        );

        // this._uDIData = new clz(
        //     {
        //         el: q('q-di-data', el)[0],
        //         commonParamGetter: commonParamGetter
        //     }
        // );
        this._mDIDataModel = this._uDIData.getModel();
    };
    
    /**
     * 初始化
     *
     * @public
     */
    OLAP_EDITOR_CLASS.init = function() {

        // 事件绑定
        this._mOLAPEditorModel.attach(
            'sync.result.INIT', 
            this.$handleInit, 
            this
        );
        this._mMetaConditionModel.attach(
            ['sync.complete.META_DATA', this.enable, this, 'OLAP_EDIROT'],
            ['sync.error.META_DATA', this.$handleFatalError, this]
        );

        // 操作按钮
        this._uQueryBtn.onclick = bind(this.$handleQuery, this);
        this._uChartConfigBtn.onclick = bind(this.$openChartConfig, this);

        // 暂用策略：查询返回前，禁止一切操作
        this._mDIDataModel.attach(
            ['sync.preprocess.DATA', this.disable, this, 'OLAP_EDIROT'],
            ['sync.complete.DATA', this.enable, this, 'OLAP_EDIROT']
        );

        // init
        this._uMetaCondition.init();
        this._uDIData.init();

        this.disable();

        // 初始报表
        this._mOLAPEditorModel.sync({ datasourceId: 'INIT' });
    };

    /**
     * @override
     */
    OLAP_EDITOR_CLASS.$dispose = function() {
        this._uMetaCondition && this._uMetaCondition.dispose();
        OLAP_EDITOR.superClass.$dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    OLAP_EDITOR_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    OLAP_EDITOR_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    OLAP_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            this._uDIData.enable(key);
            this._uQueryBtn.enable();
            this._uMetaCondition.enable(key);
        }
        OLAP_EDITOR.superClass.enable.call(this);
    };    

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    OLAP_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            this._uDIData.disable(key);
            this._uQueryBtn.disable();
            this._uMetaCondition.disable(key);
        }
        OLAP_EDITOR.superClass.disable.call(this);
    };    

    /**
     * 初始化
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleInit = function() {
        // 初始化元数据
        this._uMetaCondition.sync();
    };

    /**
     * 严重错误处理
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleFatalError = function(status) {
        this.disable();
        // 参数校验失败
        if (status == 1001) {
            DIALOG.alert(LANG.SAD_FACE + LANG.PARAM_ERROR);
        }
        else {
            DIALOG.alert(LANG.SAD_FACE + LANG.FATAL_DATA_ERROR);
        }
    };

    /**
     * 查询请求
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleQuery = function() {
        // FIXME
        // 为兼容product儿而加的代码，本身在editor中无意义。
        // 后续崇重构
        var diEvent = DI_FACTORY().createDIEvent('editorfakeevent-query');

        DI_FACTORY().setInteractMemo(this._uDIData, 'diEvent', diEvent);

        this._uDIData.sync();

        DI_FACTORY().setInteractMemo(this._uDIData, 'diEvent', void 0);

    };

    /**
     * 打开图设置
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$openChartConfig = function() {
        CHART_CONFIG_PANEL().open();
    };

})();
/**
 * di.console.editor.ui.ReportPreview
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    页面预览
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.console.editor.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var URL = di.config.URL;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var inheritsControl = ecui.inherits;
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var createDom = ecui.dom.create;
    var getStyle = ecui.dom.getStyle;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var $fastCreate = ecui.$fastCreate;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var textParam = xutil.url.textParam;
    var PANEL_PAGE_MANAGER;
        
    $link(function() {
        PANEL_PAGE_MANAGER = di.shared.model.PanelPageManager;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 页面预览
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.reportType
     * @param {string} options.schemaName
     * @param {string} options.cubeTreeNodeName
     */
    var REPORT_PREVIEW = $namespace().ReportPreview = 
        inheritsControl(
            PANEL_PAGE,
            'page-preview',
            function(el, options) {
                preInit(this, el, options);
                el.innerHTML = TPL_MAIN;
            },
            function(el, options) {
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var REPORT_PREVIEW_CLASS = REPORT_PREVIEW.prototype;
    
    //------------------------------------------
    // 模板
    //------------------------------------------

    var TPL_MAIN = [
        '<p>预览</p>',
        '<div class="q-di-stub"></div>'
    ].join('');
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /* 禁用$setSize */
    REPORT_PREVIEW_CLASS.$setSize = new Function();

    /**
     * 创建Model
     *
     * @private
     */
    function createModel(el, options) {
    };
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
    };
    
    /**
     * 初始化
     *
     * @public
     */
    REPORT_PREVIEW_CLASS.init = function() {
        var stub = new $DataInsight$(
            q('q-di-stub', this.getMain())[0],
            { 
                url: URL('REPORT_PREVIEW'),
                widthMode: 'FULLFILL',
                heightMode: 'ADAPT'
            }
        );
        stub.load();
    };

    /**
     * @override
     */
    REPORT_PREVIEW_CLASS.$dispose = function() {
        REPORT_PREVIEW.superClass.$dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    REPORT_PREVIEW_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    REPORT_PREVIEW_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

})();

/**
 * di.console.mgr.ui.ReportListPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    报表列表页
 * @author:  xxx(xxx)
 * @depend:  ecui, xui, xutil
 */

$namespace('di.console.mgr.ui');

(function() {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var core = ecui;
    var dom = core.dom;
    var ui = core.ui;
    var util = core.util;
    var inheritsControl = ecui.inherits;
    var blank = util.blank;
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var addEventListener = core.addEventListener;
    var createDom = dom.create;
    var getStyle = dom.getStyle;
    var extend = util.extend;
    var q = core.xdom.q;
    var bind = core.xfn.bind;
    var preInit = core.util.preInit;
    var template = core.xstring.template;
    var ref = core.util.ref;
    var getModel = core.util.getModel;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var UI_CONTROL = ui.Control;
    var UI_SELECT = ui.Select;
    var UI_RADIO_CONTAINER = ui.RadioContainer;
    var DICT = di.config.Dict;
    var PANEL_PAGE_MANAGER;
        
    $link(function() {
        PANEL_PAGE_MANAGER = di.shared.model.PanelPageManager;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 报表列表页主类
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     */
    var REPORT_LIST_PAGE = $namespace().ReportListPage = 
        inheritsControl(
            PANEL_PAGE,
            'report-list-page',
            function(el, options) {
                preInit(this, el, options);
                el.innerHTML = template(TPL_MAIN);
            },
            function(el, options) {
                createModel(el, options);
                createView(el, options);
            }
        );
    var REPORT_LIST_PAGE_CLASS = REPORT_LIST_PAGE.prototype;
    
    /* 模板 */       
    var TPL_MAIN = [
        '<div class="olap-condition">',
            '报表列表',
        '</div>',
        '<div class="olap-table">',
            '表格',
        '</div>'
    ].join('');
    
    //------------------------------------------
    // 方法
    //------------------------------------------

    /* 禁用$setSize */
    REPORT_LIST_PAGE_CLASS.$setSize = blank;

    /**
     * 创建Model
     *
     * @private
     */
    function createModel() {
        // TODO
        // this._mXXXModel = new XXXModel();
        // this._mXXXModel = new XXXModel();
    };
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        // TODO
        // this._uXXXControl = ecuiCreate(
        //     XXXCONTROL, 
        //     q('q-some-el-class', el)[0], 
        //     this
        // );
        // this._uXXXControl = ecuiCreate(
        //     XXXCONTROL, 
        //     q('q-some-el-class', el)[0], 
        //     this
        // );
    };
    
    /**
     * 初始化
     *
     * @public
     */
    REPORT_LIST_PAGE_CLASS.init = function() {
        // ref 引用

        // 事件绑定
        // commonModelUpdateHandler = bind(this.$commonModelUpdateHandler, this);
        // addEventListener(this._uAccountRangeType, 'change', bind(this.$accountRangTypeChangeHandler, this));
        // addEventListener(this._uAccountRangeType, 'change', commonModelUpdateHandler);
        // addEventListener(this._uAccountRange, 'change', commonModelUpdateHandler);
        // addEventListener(this._uOpenAccountDuration, 'change', commonModelUpdateHandler);
        // this._eInherit.onclick = commonModelUpdateHandler;

        // init
        // this._mXXXModel.init();
        // this._uXXXControl.init();

        // 初始获取数据
        // this._mXXXModel.sync('INIT');
    };

    /**
     * @override
     */
    REPORT_LIST_PAGE_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     */
    REPORT_LIST_PAGE_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

    /**
     * @override
     */
    REPORT_LIST_PAGE_CLASS.$dispose = function() {
        // this._eAnalysisArea = null;
        // this._eCondtionArea = null;
        // this._mTimeTypePageManager.dispose();
        // this._eInherit = null;
        REPORT_LIST_PAGE.superClass.$dispose.call(this);
    };
    
})();
/**
 * di.console.frame.ui.ConsoleFrame
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    报表设计 / 管理页整体
 * author:  sushuang(sushuang)
 * depend:  ecui
 */

$namespace('di.console.frame.ui');

(function() {
    
    //-----------------------------------------
    // 引用
    //-----------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var MENU_MAIN_PAGE = di.console.shared.ui.MenuMainPage;
    var DICT = di.config.Dict;
    var URL = di.config.URL;
    var CUBE_META_MODEL;

    $link(function() {
        CUBE_META_MODEL = di.shared.model.CubeMetaModel;
    });

    //-----------------------------------------
    // 类型声明
    //-----------------------------------------

    var CONSOLE_FRAME = $namespace().ConsoleFrame = 
        inheritsObject(
            MENU_MAIN_PAGE, 
            function(options) {
                createModel.call(this, options);
            }
        );
    var CONSOLE_FRAME_CLASS = CONSOLE_FRAME.prototype;
    
    //-----------------------------------------
    // 方法
    //-----------------------------------------

    /**
     * 创建Model
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function createModel(options) {

        // 初始临时方案：用cubeMeta转为menu，用menu作为创建报表入口
        var menuPageManager = this._mMenuPageManager;
        var cubeMetaModel = this._mCubeMetaModel = new CUBE_META_MODEL();

        menuPageManager.url = URL('CUBE_META');

        var oldParse = this._mMenuPageManager.parse;
        this._mMenuPageManager.parse = function(data) {
            cubeMetaModel.parse['INIT'].call(cubeMetaModel, data);
            var menu = cubeMetaModel.getMenuByCubeMeta();
            return oldParse.call(menuPageManager, menu);
        }

    };
    
})();

/**
 * di.console.frame.ui.MainPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    [通用构件] Data Insight页面整体
 * @author:  sushuang(sushuang)
 * @depend:  ecui
 */

$namespace('di.console.frame.ui');

(function() {
    
    //-----------------------------------------------
    // 引用
    //-----------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var q = xutil.dom.q;
    var getByPath = xutil.object.getByPath;
    var XVIEW = xui.XView;
    var createDom = ecui.dom.create;
    var getModel = ecui.util.getModel;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var ref = ecui.util.ref;
    var DICT = di.config.Dict;
    var GLOBAL_MENU;
    var GLOBAL_MODEL;
    var DI_FACTORY;
        
    $link(function() {
        GLOBAL_MENU = di.console.shared.ui.GlobalMenu;
        GLOBAL_MODEL = di.shared.model.GlobalModel;
        DI_FACTORY = di.shared.model.DIFactory;
    });
        
    //-----------------------------------------------
    // 类型声明
    //-----------------------------------------------

    /**
     * 页面整体类
     *
     * @class
     * @extends xui.XView
     */
    var MAIN_PAGE = $namespace().MainPage = 
        inheritsObject(
            XVIEW,
            function(options) {
                DI_FACTORY().installClz();
                createView.call(this, options);
            }
        );
    var MAIN_PAGE_CLASS = MAIN_PAGE.prototype;
        
    //-----------------------------------------------
    // 方法
    //-----------------------------------------------

    /**
     * @override
     */
    XVIEW.$domReady = ecui.dom.ready;

    /**
     * 创建View
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function createView(options) {
        var o;
        options = options || {};
        q('q-global-main')[0].appendChild(o = createDom());
        this._uGlobalMenu = ecuiCreate(
            GLOBAL_MENU, 
            q('q-global-menu')[0], 
            null
        );
        if (options.pageClass) {
            this._uMainContainer = 
                new (
                    getByPath(options.pageClass, $getNamespaceBase())
                )({ el: o });
        }
    };
    
    /**
     * @override
     */
    MAIN_PAGE_CLASS.init = function() {
        MAIN_PAGE.superClass.init.call(this);

        // 初始化全局模型
        GLOBAL_MODEL();

        // 引用
        var o = getModel(GLOBAL_MODEL(), 'globalMenuManager');
        ref(this._uGlobalMenu, 'globalMenuManager', o);
        ref(o, 'globalMenu', this._uGlobalMenu);

        // 页面开始
        GLOBAL_MODEL().init();
        this._uGlobalMenu.init();
        this._uMainContainer && this._uMainContainer.init();
    }

    /**
     * @override
     */
    MAIN_PAGE_CLASS.dispose = function() {
        GLOBAL_MODEL().dispose();
        MAIN_PAGE.superClass.$dispose.call(this);
    };

})();

/**
 * project link
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    项目结尾文件
 * @author:  sushuang(sushuang)
 * @depend:  xui.XProject
 */

// 依赖连接
xui.XProject.doLink();
// 项目初始化最后执行的内容
xui.XProject.doEnd()
