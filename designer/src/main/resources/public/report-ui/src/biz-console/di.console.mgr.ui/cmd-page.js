/**
 * di.console.mgr.ui.CmdPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    管理页面
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
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var template = xutil.string.template;
    var getUID = xutil.uid.getUID;
    var ecuiCreate = UTIL.ecuiCreate;
    var ajaxRequest = baidu.ajax.request;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var textParam = xutil.url.textParam;
    var jsonParse = baidu.json.parse;
    var UI_BUTTON = ecui.ui.Button;
    var PANEL_PAGE_MANAGER;
    var PANEL_PAGE_TAB_ADAPTER;
    var UI_TAB_CONTAINER = ecui.ui.TabContainer;
    var DI_FACTORY;
    var COMMON_PARAM_FACTORY;
    var CUBE_CONFIG_PANEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
        DI_FACTORY = di.shared.model.DIFactory;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
        PANEL_PAGE_MANAGER = di.shared.model.PanelPageManager;
        PANEL_PAGE_TAB_ADAPTER = di.shared.model.PanelPageTabAdapter;
        CUBE_CONFIG_PANEL = di.console.shared.ui.CubeConfigPanel;
    });

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 管理页面
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.dsId 平面表的后台数据源
     */
    var CMD_PAGE = $namespace().CmdPage =
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                addClass(el, 'cmd-page');
                el.innerHTML = SNIPPET_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var CMD_PAGE_CLASS = CMD_PAGE.prototype;

    //------------------------------------------
    // 模板
    //------------------------------------------

    var SNIPPET_MAIN = [
        '<div class="cmd-page-btns"></div>',
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
        this._uMainContainer = $fastCreate(
            UI_TAB_CONTAINER,
            q('q-main', this.getEl())[0],
            null,
            { primary: 'ui-tab' }
        );

        this._uCubeConfigPanel = new CUBE_CONFIG_PANEL({ parent: this });
    }

    /**
     * 初始化
     *
     * @public
     */
    CMD_PAGE_CLASS.init = function() {
        var me = this;

        this._mPanelPageManager.inject(this._uMainContainer);
        this._mPanelPageManager.attach(
            'page.active',
            this.$pageActiveHandler,
            this
        );
        this._uCubeConfigPanel.attach(
            'select',
            this.$openEditor,
            this
        )

        this._mPanelPageManager.init();
        this._uCubeConfigPanel.init();

        // FIXME
        // 临时
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        var eee = document.createElement('div');
        var btns = q('cmd-page-btns', this.getEl())[0]
        eee.innerHTML = '<input type="button" value="创建多维透视表数据集" />';
        eee = eee.firstChild;
        btns.appendChild(eee);
        eee.onclick = function () {
            me.openCubeConfigPanel('RTPL_OLAP_TABLE');
        };
        eee.innerHTML = '<input type="button" value="创建多维图数据集" />';
        eee = eee.firstChild;
        btns.appendChild(eee);
        eee.onclick = function () {
            me.openCubeConfigPanel('RTPL_OLAP_CHART');
        };
        eee.innerHTML = '<input type="button" value="创建平面表数据集" />';
        eee = eee.firstChild;
        btns.appendChild(eee);
        eee.onclick = function () {
            var reportTemplateId = q('q-cmd-page-rtpl-input', btns)[0].value;
            if (!reportTemplateId) {
                // 新建
                me.openCubeConfigPanel('RTPL_PLANE_TABLE');
            }
            else {
                // 打开已有的
                var reportType = 'RTPL_PLANE_TABLE';
                me._mPanelPageManager.openByURI(
                    'di.console.editor.ui.PlaneEditor?'
                        + [
                            'reportTemplateId=' + reportTemplateId,
                            'reportType=' + reportType,
                            'pageId=' + reportType + '_' + reportTemplateId + '_' + getUID(),
                            'pageTitle=[平面表] ' + reportType + '_' + reportTemplateId,
                            'act=EDIT'
                        ].join('&')
                );
            }
        };
        eee.innerHTML = '<input type="button" value="tmp snippet code" />';
        eee = eee.firstChild;
        btns.appendChild(eee);
        eee.onclick = function () {
            me.$openEditor(
                {
                    menuId: Math.random(), 
                    menuUrl: 'di.console.editor.ui.SnippetCodeEditor?'
                        + [
                            'pageTitle=[Code]'
                        ].join('&')
                }
            );
        };
        eee.innerHTML = '<input class="q-cmd-page-rtpl-input" type="input" />';
        btns.appendChild(eee.firstChild);
    };

    /**
     * @override
     */
    CMD_PAGE_CLASS.dispose = function() {
        this._mPanelPageManager.dispose();
        CMD_PAGE.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    CMD_PAGE_CLASS.$active = function() {
        // TODO
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    CMD_PAGE_CLASS.$inactive = function() {
        // TODO
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    CMD_PAGE_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) === 0 && this._bDisabled) {
            // TODO
            CMD_PAGE.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    CMD_PAGE_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            // TODO
        }
        CMD_PAGE.superClass.disable.call(this);
    };

    /**
     * 页面选中后的行为
     */
    CMD_PAGE_CLASS.$pageActiveHandler = function(menuId) {
        // TODO
    };

    /**
     * 打开cube选择面板
     */
    CMD_PAGE_CLASS.openCubeConfigPanel = function(reportType) {
        this._uCubeConfigPanel.changeReportType(reportType);
        this._uCubeConfigPanel.open();
    };

    /**
     * 打开后台模版编辑tab页
     */
    CMD_PAGE_CLASS.$openEditor = function(menuItem) {
        this._mPanelPageManager.openByURI(
            menuItem.menuUrl,
            { vtplModel: this._mVTplModel }
        );
    };

})();