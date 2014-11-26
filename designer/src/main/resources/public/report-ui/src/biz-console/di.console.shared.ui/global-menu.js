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
    var util = ecui.util;
    var ui = ecui.ui;
    var inheritsControl = ecui.inherits;
    var $fastCreate = ecui.$fastCreate;
    var createDom = ecui.dom.create;;
    var setStyle = ecui.dom.setStyle;
    var getStyle = ecui.dom.getStyle;
    var extend = xutil.object.extend; 
    var template = xutil.string.template;
    var URL = di.config.URL;
    var UI_CONTROL = ui.Control;
        
    /* 类型声明 */
    var GLOBAL_MENU = $namespace().GlobalMenu = 
        inheritsControl(
            UI_CONTROL, 
            'global-menu', 
            null,
            function (el, options) {
                el.innerHTML = template(TPL_MAIN, {type: this.getType()});
                this._eInner = el.firstChild;
                this._aItems = [];
                this._uCurrSel;
            }
        );
    var GLOBAL_MENU_CLASS = GLOBAL_MENU.prototype;
    
    var GLOBAL_MENU_ITEM_CLASS = (GLOBAL_MENU_CLASS.Item = inheritsControl(
            UI_CONTROL, 
            'global-menu-item', 
            null, 
            function(el, options) {
                var data = options.data;
                var parent = options.parent;
                var selMenu = options.selMenu;
                    
                setStyle(el, 'display', 'inline-block');
                el.innerHTML = template(
                    TPL_ITEM, 
                    {
                        type: this.getType(), 
                        text: data.menuName,
                        url: URL.getWebRoot() + '/' + data.menuUrl
                    }
                );
                
                if (selMenu.menuId == (this._sMenuId = data.menuId)) {
                    parent._uCurrSel = this;
                    this.alterClass('+selected');
                }
            }        
        )).prototype;

    /* 模板 */
    var TPL_MAIN = '<div class="#{type}-items"></div>';
    var TPL_ITEM = ''
        + '<a href="#{url}" target="_blank">'
        + '<div class="#{type}-ledge"></div>'
        + '<div class="#{type}-text">#{text}</div>'
        + '<div class="#{type}-redge"></div>'
        + '</a>';
                
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
        this._aCurrSel = null;
        this.$disposeItems();
        
        var datasource = this._mGlobalMenuManager.getMenuData();
        var selMenu = this._mGlobalMenuManager.getSelected();
        
        for (var i = 0, date, el, item; data = datasource[i]; i++) {
            this._eInner.appendChild(el = createDom('global-menu-item'));
            this._aItems.push(
                item = $fastCreate(
                    this.Item, 
                    el, 
                    this, 
                    {
                        data: data, 
                        selMenu: selMenu,
                        parent: this
                    }
                )
            );
        }
    };
    
    /**
     * 析构节点
     * @protected
     */
    GLOBAL_MENU_CLASS.$disposeItems = function () {
        var i, o;
        for (i = 0; o = this._aItems[i]; i ++) {
            o.dispose();
        }
        this._aItem = [];
        this._eInner.innerHTML = '';
    };

    /**
     * 设置GlobalMenuManager
     * @public
     */
    GLOBAL_MENU_CLASS.setGlobalMenuManager = function(mgr) {
        this._mGlobalMenuManager = mgr;
    };

})();

