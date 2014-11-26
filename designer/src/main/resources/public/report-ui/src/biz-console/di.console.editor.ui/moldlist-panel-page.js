/**
 * di.console.editor.ui.VTplPanelPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    mold模版展示
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
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
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var getByPath = xutil.object.getByPath;
    var parseParam = xutil.url.parseParam;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var $fastCreate = ecui.$fastCreate;
    var assign = xutil.object.assign;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var alert = di.helper.Dialog.alert;
    var confirm = di.helper.Dialog.confirm;
    var template = xutil.string.template;
    var getUID = xutil.uid.getUID;
    var ecuiCreate = UTIL.ecuiCreate;
    var foreachDoOri = UTIL.foreachDoOri;
    var ajaxRequest = baidu.ajax.request;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var textParam = xutil.url.textParam;
    var jsonParse = baidu.json.parse;
    var replaceIntoParam = xutil.url.replaceIntoParam;
    var UI_BUTTON = ecui.ui.Button;
    var UI_INPUT = ecui.ui.Input;
    var assert = UTIL.assert;
    var PANEL_PAGE_MANAGER;
    var PANEL_PAGE_TAB_ADAPTER;
    var UI_TAB_CONTAINER = ecui.ui.TabContainer;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var DI_FACTORY;
    var COMMON_PARAM_FACTORY;
    var CUBE_CONFIG_PANEL;
    var PREVIEW_CONFIG_PANEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
        DI_FACTORY = di.shared.model.DIFactory;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
        PANEL_PAGE_MANAGER = di.shared.model.PanelPageManager;
        PANEL_PAGE_TAB_ADAPTER = di.shared.model.PanelPageTabAdapter;
        CUBE_CONFIG_PANEL = di.console.shared.ui.CubeConfigPanel;
        PREVIEW_CONFIG_PANEL = di.console.shared.ui.PreviewConfigPanel;
    });

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 平面表编辑
     * 结构说明：
     *      1. 在本panelPage中，有若干子panelPage，每个是一个editor（如quickEidtor、codeEidtor）
     *      2. vtplPanelPage中，有vtpl真身，每个eidtor初始化时，会被调用doRefreshFork方法，
     *      自己从vtplPanelPage中clone一个vtpl副本，进行显示、编辑操作。
     *      每个editor在doRefreshFork时，会得到vtpl副本，进行编辑。
     *      3. 同一时间只能一个editor进行保存，一个eidtor点击了保存，会返回副本，
     *      然后vtplPanelPage负责合并到真身，然后doRefreshFork其他editor（并同时在各自的doRefrefhFork中刷新视图）。
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.dsId 平面表的后台数据源
     */
    var MOLDLIST_PANEL_PAGE = $namespace().MoldListPanelPage =
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                addClass(el, 'vtpl-panel-page');
                el.innerHTML = HTML_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
                this._globalPanelPageManager = options.panelPageManager;
            }
        );
    var MOLDLIST_PANEL_PAGE_CLASS = MOLDLIST_PANEL_PAGE.prototype;

    //------------------------------------------
    // 模板
    //------------------------------------------

    var HTML_MAIN = [
        '<div class="vtpl-panel-page-btns">',
             '<span>模板名称：</span>',
             '<input class="vtpl-name-input q-mold-name"/>',
             '<span class="q-btn-query">查询</span>',
        '</div>',
        '<div class="q-main"></div>'
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @private
     */
    function createModel(el, options) {
        this._mPanelPageManager = new PANEL_PAGE_MANAGER(
            { adapter: PANEL_PAGE_TAB_ADAPTER }
        );
        this._mVTplModel = options.vtplModel;
    }

    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        this._uQueryBtn = ecuiCreate(
                UI_BUTTON, 
                q('q-btn-query', el)[0],
                null, 
                { primary: 'ui-button-g' }
            );
         this._uNameInput = ecuiCreate(
                    UI_INPUT,
                    q('q-mold-name', el)[0]
                );
        this._uMainContainer = $fastCreate(
            UI_TAB_CONTAINER,
            q('q-main', this.getEl())[0],
            null,
            { primary: 'ui-tab' }
        );
    }

    /**
     * 初始化
     *
     * @public
     */
    MOLDLIST_PANEL_PAGE_CLASS.init = function() {
        var me = this;

        // 为自己绑定vtpl mgr functions
        //extend(this, this.vtplMgrGet(this));

        this._mPanelPageManager.inject(this._uMainContainer);
        this._mPanelPageManager.attach(
            ['page.active', this.$pageActiveHandler, this]
        );
        this._uQueryBtn.onclick=bind(this.doQuery, this);

        // 现在toPre和toRelease都一直可用，不做disable处理了，因为后台现在没有状态纪录的地方。
        // 如果toPre和toRlease在不合适的时间执行了（比如还没有创建），则报错

        this._mPanelPageManager.init();
        this._mVTplModel.attach(
                ['sync.result.MOLD_QUERY', this.$renderTab, this]
            );
        
        //在页面初始化的时候就打开“已发布”，“预发布”，“已保存”3个tab页面，
        //不要放到active事件里面去做，否则每次点击左侧菜单，都会去创建这3个tab页面
        var pg = me.openTab({ editorType: 'all' });
        //me.openTab({ editorType: 'pre' });
        //me.openTab({ editorType: 'dev' });
        me._mPanelPageManager.select(pg.getPageId());     
        //页面进入先默认调用一次不带条件的报表查询
        this.doQuery();
    };


    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    MOLDLIST_PANEL_PAGE_CLASS.$active = function(options) {

    };

   

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    MOLDLIST_PANEL_PAGE_CLASS.$renderTab = function(options) {
        this._mPanelPageManager.forEachPage(
            function (pageId, page, index) {
                page.render();
            }
        );
        
    };
    

    /**
     * 开始进入页面的操作
     * (注意：这是统一入口，所有需要开子panel page时候，都从这里进入)
     * 
     * @public
     * @param {Object} options
     * @param {string} act
     * @param {string} reportType
     * @param {string=} reportTemplateId
     * @param {string=} vtplKey
     */
    MOLDLIST_PANEL_PAGE_CLASS.openTab = function(options) {
        var editorType = options.editorType;
        var pageOpt = extend({}, options);
        var panelPageManager = this._mPanelPageManager;
        var vtpl = this._vtpl;

        extend(
            pageOpt, 
            {
                pageId: 'moldlist_' + getUID(),
                pageClz: 'di.console.shared.ui.ReportMoldListPage',
                pageTitle: ({
                        all: '全部模板'
                    })[editorType],
                phase: editorType,
                vtplModel: this._mVTplModel,
                panelPageManager: panelPageManager,
                globalPanelPageManager: this._globalPanelPageManager,
                vtplPanelPage: this
            }
        );

        assert(pageOpt.pageId, 'reportTempalteId is null')

        var page = panelPageManager.openByURI(pageOpt.pageClz, pageOpt, oncreate);
        // 挂载事件
        page.attach('rtpl.created', this.doCreated, this);

        return page;

        function oncreate(page) {
            //alert('走到 '+page+' 的oncreate了')
            //page.doRefreshFork && page.doRefreshFork(vtpl.clone());
        }
    };


    /**
     * 响应rtpl created
     */
    MOLDLIST_PANEL_PAGE_CLASS.doCreated = function(menuItem) {
        this._mPanelPageManager.forEachPage(function (pageId, page, index) {
            page.doCreated && page.doCreated();
        });
    };


    /**
     * 查询模板
     */
    MOLDLIST_PANEL_PAGE_CLASS.doQuery = function() {
        var reportName=this._uNameInput.getValue();
        this._mVTplModel.sync(
            {
                datasourceId: 'MOLD_QUERY',
                args: {
                    reportName:reportName
                }
            }
        );
    };
    
    

    /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    MOLDLIST_PANEL_PAGE_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) === 0 && this._bDisabled) {
            this._mPanelPageManager.forEachPage(
                function (pageId, page, index) {
                    page.enable(key);
                }
            );
            foreachDoOri(
                [
                    this._uQueryBtn,
                ],
                'enable',
                key
            );
            MOLDLIST_PANEL_PAGE.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    MOLDLIST_PANEL_PAGE_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            this._mPanelPageManager.forEachPage(
                function (pageId, page, index) {
                    page.disable(key);
                }
            );
            foreachDoOri(
                [
                    this._uQueryBtn,
                ],
                'disable',
                key
            );
        }
        MOLDLIST_PANEL_PAGE.superClass.disable.call(this);
    };
    /**
     * @override
     */
    MOLDLIST_PANEL_PAGE_CLASS.dispose = function() {
        this._mPanelPageManager.dispose();
        // TODO
        foreachDoOri(
            [
                this._uQueryBtn,
            ],
            'dispose'
        );
        // this._uNameInput = null;
        MOLDLIST_PANEL_PAGE.superClass.dispose.call(this);
    };
    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    MOLDLIST_PANEL_PAGE_CLASS.$inactive = function(options) {
        // TODO
    };
    /**
     * 页面选中后的行为
     */
    MOLDLIST_PANEL_PAGE_CLASS.$pageActiveHandler = function(menuId) {
        // TODO
    };
})();