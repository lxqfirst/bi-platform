/**
 * di.console.shared.ui.CubeConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    cube选择panel
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */
$namespace('di.console.shared.ui');

(function() {

    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var LANG = di.config.Lang;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var bind = xutil.fn.bind;
    var $fastCreate = ecui.$fastCreate;
    var PL_FLOAT_MENU = ecui.ui.PlFloatMenu;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var CUBE_META_MODEL;

    $link(function() {
        CUBE_META_MODEL = di.shared.model.CubeMetaModel;
    });

    /**
     * cube选择panel
     *
     * @class
     */
    var CUBE_CONFIG_PANEL = $namespace().CubeConfigPanel = inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this._uParent = options.parent;
                this.DATASOURCE_ID_MAPPING = { INIT: 'INIT' };
            }
        );
    var CUBE_CONFIG_PANEL_CLASS = CUBE_CONFIG_PANEL.prototype;

    /** 
     * @override
     */
    CUBE_CONFIG_PANEL_CLASS.changeReportType = function(reportType) {
        this._mModel.setReportType(reportType);
        this.DATASOURCE_ID_MAPPING.INIT = ({
            RTPL_OLAP_TABLE: 'CUBE_INIT',
            RTPL_OLAP_CHART: 'CUBE_INIT',
            RTPL_PLANE_TABLE: 'DATASOURCE_INIT'
        })[reportType];
    }

    /** 
     * @override
     */
    CUBE_CONFIG_PANEL_CLASS.$doGetContentTPL = function() {
        return [
            '<div class="menu-cube-config">',
                '<div class="ui-menu q-menu"><label>&nbsp;</label></div>',
            '</div>'
        ].join('');
    };

    /** 
     * @override
     */
    CUBE_CONFIG_PANEL_CLASS.$doGetModel = function() {
        return this._mModel;
    };

    /** 
     * @override
     */
    CUBE_CONFIG_PANEL_CLASS.$doCreateView = function(options) {
        this._mModel = new CUBE_META_MODEL(options);
        this._uMenu = $fastCreate(
            PL_FLOAT_MENU, q('q-menu', this.getContentEl())[0], null
        );
    };

    /** 
     * @override
     */
    CUBE_CONFIG_PANEL_CLASS.$doInit = function() {
        // 绑定菜单改变事件
        this._uMenu.onchange = bind(
            function (menuItem) {
                this.notify('select', [menuItem]);
                this.close();
            },
            this
        );
    };

    /** 
     * @override
     */
    CUBE_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        var menuTree = this._mModel.getMenuData().menuTree;
        this._uMenu.setData(menuTree.menuList);
        this._uMenu.select(menuTree.selMenuId);
    };

})();