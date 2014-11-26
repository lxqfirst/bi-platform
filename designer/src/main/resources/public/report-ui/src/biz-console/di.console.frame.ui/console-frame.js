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
    var GLOBAL_MODEL;
    var q = xutil.dom.q;
    var preInit = ecui.util.preInit;
    var $fastCreate = ecui.$fastCreate;
    var template = xutil.string.template;
    var parseParam = xutil.url.parseParam;
    var isString = xutil.lang.isString;
    var getByPath = xutil.object.getByPath;
    var bind = xutil.fn.bind;
    var XVIEW = xui.XView;
    var PL_FLOAT_MENU = ecui.ui.PlFloatMenu;
    var UI_TAB_CONTAINER = ecui.ui.TabContainer;
    var DICT = di.config.Dict;
    var URL = di.config.URL;
    var MENU_PAGE_MANAGER;
    var PANEL_PAGE_MANAGER;
    var PANEL_PAGE_TAB_ADAPTER;
    var VTPL_MODEL;

    $link(function() {
        var sharedNS = di.shared;
        CUBE_META_MODEL = sharedNS.model.CubeMetaModel;
        GLOBAL_MODEL = sharedNS.model.GlobalModel;
        PANEL_PAGE_MANAGER = sharedNS.model.PanelPageManager;
        PANEL_PAGE_TAB_ADAPTER = sharedNS.model.PanelPageTabAdapter;
        MENU_PAGE_MANAGER = sharedNS.model.MenuPageManager;
        VTPL_MODEL = di.console.editor.model.VTplModel;
    });    

    //-----------------------------------------
    // 类型声明
    //-----------------------------------------

    var CONSOLE_FRAME = $namespace().ConsoleFrame = 
        inheritsObject(
            XVIEW, 
            function(options) {
                var el = options.el;
                el.innerHTML = template(TPL_MAIN);
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var CONSOLE_FRAME_CLASS = CONSOLE_FRAME.prototype;
    
    /* 模板 */    
    var TPL_MAIN = [
            '<div class="main-left">', 
	            '<div class="menu-mgr menu-sep">',
		            '<div class="ui-menu q-menu-myview"><label>&nbsp;</label></div>',
		        '</div>',
                '<div class="menu-mgr menu-sep">',
                    '<div class="ui-menu q-menu-createbymold"><label>&nbsp;</label></div>',
                '</div>',
               // '<div class="menu-vtpl">',
               //     '<div class="ui-menu q-menu-vtpl"><label>&nbsp;</label></div>',
               // '</div>',
               // '<div class="menu-mold menu-sep">',
               //     '<div class="ui-menu q-menu-mold"><label>&nbsp;</label></div>',
               // '</div>',
                '<div class="menu-mgr menu-sep">',
                    '<div class="ui-menu q-menu-mgr"><label>&nbsp;</label></div>',
                '</div>',
                '<div class="menu-mgr menu-sep">',
                   '<div class="ui-menu q-menu-dimgr"><label>&nbsp;</label></div>',
                '</div>',
            '</div>',
            '<div class="main-right">',
                '<div class="ui-tab q-main"></div>',
            '</div>',
            '<div class="clear"></div>'
        ].join('');

    //-----------------------------------------
    // 方法
    //-----------------------------------------

    /**
     * 创建Model
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function createModel(el, options) {
        // 使用tabContainer
        this._mPanelPageManager = new PANEL_PAGE_MANAGER(
            { adapter: PANEL_PAGE_TAB_ADAPTER }
        );
        this._mVTplModel = new VTPL_MODEL();
    }

    /**
     * 创建View
     * 
     * @private
     * @param {Object} options 初始化参数
     */
    function createView(el, options) {
    	this._uMyViewMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu-myview', el)[0], null);
        this._uCreateByMoldMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu-createbymold', el)[0], null);
        //this._uVTplMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu-vtpl', el)[0], null);
        //this._uMoldMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu-mold', el)[0], null);
        this._uMgrMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu-mgr', el)[0], null);
        this._diMgrMenu = $fastCreate(PL_FLOAT_MENU, q('q-menu-dimgr', el)[0], null);
        this._uMainContainer = $fastCreate(
            UI_TAB_CONTAINER,
            q('q-main', el)[0],
            null,
            { primary: 'ui-tab' }
        );
    }

    /**
     * @override
     */
    CONSOLE_FRAME_CLASS.init = function () {
        this._mPanelPageManager.inject(this._uMainContainer);
        this._uMyViewMenu.onchange = bind(this.$menuChangeHandler, this);
        this._uCreateByMoldMenu.onchange = bind(this.$menuChangeHandler, this);
        //this._uVTplMenu.onchange = bind(this.$menuChangeHandler, this);
        //this._uMoldMenu.onchange = bind(this.$menuChangeHandler, this);
        this._uMgrMenu.onchange = bind(this.$menuChangeHandler, this);
        this._diMgrMenu.onchange = bind(this.$openDataSourcePage, this);
        this._mPanelPageManager.attach(
            'page.active',
            this.$pageActiveHandler,
            this
        );

       // this._mVTplModel.attach(
       //     ['sync.result.VTPL_LIST', this.$renderVTplList, this],
       //     ['sync.result.MOLD_LIST', this.$renderMoldList, this]
       //     // TODO
       //     // 要不要disable / enable
       // );
        this.$renderDiMgrList();
        this.$renderCreateByMold();
        this.$renderMgrList();
        this.$renderMyViewList();
       // this.$renderDiMgrList();
       
        this._mPanelPageManager.init();
        this._mVTplModel.init();

        // 页面开始
       // this._mVTplModel.sync({ datasourceId: 'VTPL_LIST' });
       // this._mVTplModel.sync({ datasourceId: 'MOLD_LIST' });
        
    };
    
    /**
     * @override
     */
    CONSOLE_FRAME_CLASS.dispose = function () {
        this._mPanelPageManager.dispose();
        CONSOLE_FRAME.superClass.dispose.call(this);
    };


    /**
     * @override
     */
    CONSOLE_FRAME_CLASS.$openDataSourcePage = function () {
        window.open('manage/showdatasource.action');
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
    CONSOLE_FRAME_CLASS.$menuChangeHandler = function(menuItem) {
        this._mPanelPageManager.openByURI(
            menuItem.menuUrl,
            { vtplModel: this._mVTplModel, forceActive: true }
        );
    };
    
    /**
     * 页面选中后的行为
     */
    CONSOLE_FRAME_CLASS.$pageActiveHandler = function(menuId) {
        // 寻找到底是vtpl的点击还是mold的点击
        // if (menuId.indexOf('MENU_ID_VTPL') > -1) {
        //    //this._uVTplMenu.select(menuId);
        //    //this._uMoldMenu.select(null);
        //     this._uMgrMenu.select(null);
        //     this._uMyViewMenu.select(null);
        //     this._uCreateByMoldMenu.select(null);
        // }
        // else if (menuId.indexOf('MENU_ID_MOLD') > -1) {
        //    this._uVTplMenu.select(null);
        //    this._uMoldMenu.select(menuId);
        //     this._uMgrMenu.select(null);
        //     this._uMyViewMenu.select(null);
        //     this._uCreateByMoldMenu.select(null);
        // }
        if (menuId.indexOf('MENU_ID_MGR') > -1) {
            this._uMgrMenu.select(menuId);
            this._uMyViewMenu.select(null);
            this._uCreateByMoldMenu.select(null);
            this._diMgrMenu.select(null);
        }
        else if (menuId.indexOf('MENU_ID_MYVIEW') > -1) {
            this._uMgrMenu.select(null);
            this._uMyViewMenu.select(menuId);
            this._uCreateByMoldMenu.select(null);
            this._diMgrMenu.select(null);
        }
        else if (menuId.indexOf('MENU_ID_CREATEBYMOLD') > -1) {
            this._uMgrMenu.select(null);
            this._uMyViewMenu.select(null);
            this._uCreateByMoldMenu.select(menuId);
            this._diMgrMenu.select(null);
        }
        else if (menuId.indexOf('MENU_ID_DIMGR') > -1) {
            this._uMgrMenu.select(null);
            this._uMyViewMenu.select(null);
            this._uCreateByMoldMenu.select(menuId);
            this._diMgrMenu.select(null);
        }
        else {
            this._uMgrMenu.select(null);
            this._uMyViewMenu.select(null);
            this._uCreateByMoldMenu.select(null);
            this._diMgrMenu.select(null);
        }
    };
    
    /**
     * @private
     */
    CONSOLE_FRAME_CLASS.$renderVTplList = function() {
       // var menuTree = this._mVTplModel.getVTplMenuData().menuTree;
       // this._uVTplMenu.setData(menuTree.menuList);
       // this._uVTplMenu.select(menuTree.selMenuId);
    };

    CONSOLE_FRAME_CLASS.$renderDiMgrList = function() {
       var menuTree = this.getVTplMenuData().menuTree;
       this._diMgrMenu.setData(menuTree.menuList);
       this._diMgrMenu.select(menuTree.selMenuId);
    };


    CONSOLE_FRAME_CLASS.getVTplMenuData = function() {
        var menuList = [];
        var menuTree = { menuList: menuList };
        var selMenuId;
        var chList = [];
        var prefix = 'MENU_ID_DIMGR';

        menuList.push(
            {
                text: '工作台管理',
                value: prefix + '1',
                children: chList
            }
        );
        for(var i=0; i < 1; i++ ) {
            var pageId = 'test' + 'getUID';
            chList.push(
                {
                    text: '数据源',
                    prompt: '数据源相关资源',
                    floatTree: [
                            {
                                value: prefix + String(Math.random()),
                                children: [
                                    {
                                        text: '管理',
                                        value: prefix + String(Math.random())
                                    }
                                ]
                            }
                        ]
                }
            );
        }

        menuTree.selMenuId = prefix + '1';

        return { menuTree: menuTree };
    };
    

    /**
     * @private
     */
    CONSOLE_FRAME_CLASS.$renderMoldList = function() {
       // var menuTree = this._mVTplModel.getMoldMenuData().menuTree;
       // this._uMoldMenu.setData(menuTree.menuList);
       // this._uMoldMenu.select(menuTree.selMenuId);
    };

    /**
     * @private
     */
    CONSOLE_FRAME_CLASS.$renderMgrList = function() {
        var prefix = 'MENU_ID_MGR'
        var cmdMenuId = prefix + 1;
        var menuList = [];

        menuList.push(
            {
                text: '控制台',
                value: cmdMenuId,
                url: 'di.console.editor.ui.CmdPage?pageId=' 
                    + cmdMenuId + '&pageTitle=' + '控制台'
            }
        );

        this._uMgrMenu.setData(menuList);
        this._uMgrMenu.select(cmdMenuId);
    };

     /**
     * @private
     */
    CONSOLE_FRAME_CLASS.$renderCreateByMold = function() {
        var prefix = 'MENU_ID_CREATEBYMOLD'
        var cmdMenuId = prefix + 1;
        var menuList = [];

        menuList.push(
            {
                text: '创建报表(基于模板)',
                value: cmdMenuId,
                url: 'di.console.editor.ui.MoldListPanelPage?pageId=' 
                    + cmdMenuId + '&pageTitle=' + '模板列表'
            }
        );

        this._uCreateByMoldMenu.setData(menuList);
        this._uCreateByMoldMenu.select(cmdMenuId);
    };
    
    
    /**
     * @private
     */
    CONSOLE_FRAME_CLASS.$renderMyViewList = function() {
        var prefix = 'MENU_ID_MYVIEW'
        var cmdMenuId = prefix;
        var menuList = [];
        var myViewUrl = 'di.console.editor.ui.MyViewPanelPage?pageId=' 
            + cmdMenuId + '&pageTitle=' + '我的报表视图'+ '&act=' + 'EDIT#QUICK';
        menuList.push(
            {
                text: '我的报表',
                value: cmdMenuId,
                url: myViewUrl
            }
        );

        this._uMyViewMenu.setData(menuList);
        this._uMyViewMenu.select(cmdMenuId);
        
        this._mPanelPageManager.openByURI(
        		myViewUrl,
                { vtplModel: this._mVTplModel, forceActive: true }
            ); 
    };

})();

