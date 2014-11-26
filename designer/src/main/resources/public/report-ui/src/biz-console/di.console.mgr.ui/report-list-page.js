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

    var inheritsControl = ecui.inherits;
    var blank = new Function();
    var addClass = ecui.dom.addClass;
    var removeClass = ecui.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var extend = xutil.object.extend;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var template = xutil.string.template;
    var preInit = di.helper.Util.preInit;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var UI_CONTROL = ecui.ui.Control;
    var UI_SELECT = ecui.ui.Select;
    var UI_RADIO_CONTAINER = ecui.ui.RadioContainer;
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