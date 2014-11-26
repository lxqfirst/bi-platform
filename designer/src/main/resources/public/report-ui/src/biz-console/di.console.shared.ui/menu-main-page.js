/**
 * di.console.shared.ui.MenuMainPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    含左菜单，右侧是tab页的整体页基类，如果想用这种布局及逻辑，可继承此类
 * @author:  sushuang(sushuang)
 * @depend:  ecui
 * @deprecated: 已弃用，因为没必要搞这么多抽象设计得这么复杂，
 *          代码适当堆一块儿反而好找。
 *          这些逻辑已经合到了console-frame中。
 */

$namespace('di.console.shared.ui');

(function () {
    
    //---------------------------------------------
    // 引用
    //---------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var q = xutil.dom.q;
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
        
        this._mMenuPageManager.inject(this._uMenu, this._mPanelPageManager);
        this._mPanelPageManager.inject(this._uMainContainer);

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

