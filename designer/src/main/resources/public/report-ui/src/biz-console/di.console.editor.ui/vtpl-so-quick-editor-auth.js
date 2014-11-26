/**
 * di.console.editor.ui.VTplSoQuickAuth
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    负责vtplSoQuickEditor的权限设置的逻辑
 * @author:  xxx(xxx)
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
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var objKey = xutil.object.objKey;
    var alert = di.helper.Dialog.alert;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var jsonParse = baidu.json.parse;
    var encodeHTML = xutil.string.encodeHTML;
    var trim = xutil.string.trim;
    var getParent = xutil.dom.getParent;
    var children = xutil.dom.children;
    var extend = xutil.object.extend;
    var foreachDoOri = UTIL.foreachDoOri;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var stringifyParam = xutil.url.stringifyParam;
    var ecuiCreate = UTIL.ecuiCreate;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var textParam = xutil.url.textParam;
    var UI_BUTTON = ecui.ui.Button;
    var UI_INPUT = ecui.ui.Input;
    var SELECT = UTIL.select;
    var XVIEW = xui.XView;
    var DI_FACTORY;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 负责vtplSoQuickEditor的权限设置的逻辑
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var VTPL_SO_QUICK_EDITOR_AUTH = $namespace().VTplSoQuickEditorAuth = 
        inheritsObject(XVIEW, constructor);
    var VTPL_SO_QUICK_EDITOR_AUTH_CLASS = VTPL_SO_QUICK_EDITOR_AUTH.prototype;
    
    var HTML_MAIN = [
        // 权限设置
        '<div class="vtpl-quick-ep-auth-area"></div>',
        // ...
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @construtor
     * @private
     */
    function constructor(options) {
        var editor = this._editor = options.editor;
        var vtplPanelPage = editor._vtplPanelPage;

        var el = this._el = options.el;
        el.innerHTML = HTML_MAIN;
        this._eAuthList = q('vtpl-quick-ep-auth-area', editor.getEl())[0]
    }
    
    /**
     * @override
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.dispose = function() {
        // foreachDoOri(
        //     [
        //         this._uSaveBtn,
        //         this._uRefreshBtn,
        //         this._uOlapTableBtn,
        //         this._uOlapChartBtn,
        //         this._uPlaneTableBtn,
        //         this._uNameInput,
        //         this._ds,
        //         this._layout
        //     ],
        //     'dispose',
        //     true
        // );
        this._eAuthList.innerHTML = '';
        this._eAuthList = null;
        VTPL_SO_QUICK_EDITOR_AUTH.superClass.dispose.call(this);
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            // foreachDoOri(
                // [
                    // this._uSaveBtn,
                    // this._uRefreshBtn,
                    // this._uPlaneTableBtn,
                    // this._uOlapChartBtn,
                    // this._uOlapTableBtn
                // ],
                // 'enable',
                // key
            // );
            VTPL_SO_QUICK_EDITOR_AUTH.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            // foreachDoOri(
            //     [
            //         // this._uSaveBtn,
            //         // this._uRefreshBtn,
            //         // this._uPlaneTableBtn,
            //         // this._uOlapChartBtn,
            //         // this._uOlapTableBtn
            //     ],
            //     'disable',
            //     key
            // );
        }
        VTPL_SO_QUICK_EDITOR_AUTH.superClass.disable.call(this);
    };

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.active = function () {
        return this._el.style.display = '';
        // ...
    };    

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.inactive = function () {
        return this._el.style.display = 'none';
        // ...
    };    

    /**
     * 刷新ep auth面板
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.refreshPanelAuth = function() {
        var vtplFork = this._editor._vtplFork;
        var entityDefs = vtplFork.findEntityByClzType('VUI');
        var html = [];

        html.push('<div>');
        html.push('<span>如果没有功能权限控制需求，可忽略此步。</span>');
        vtplFork.forEachEntity(
            'VUI',
            function (def) {
                html.push(
                    '<div>',
                        '<span>控件“', encodeHTML(def.id), 
                            '”对应的权限关键字（funcAuth）为：</span>',
                        '<input type="input" data-def-id="', encodeHTML(def.id), 
                            '" value="', encodeHTML(def.funcAuth || ''), '" />',
                    '</div>'
                );
            }
        );
        html.push('</div>');

        // 写入html
        this._eAuthList.innerHTML = html.join('');
    };

    /**
     * 保存权限设置变更
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_AUTH_CLASS.saveAuth = function() {
        var html = [];

        var els = this._eAuthList.getElementsByTagName('INPUT');
        for (var i = 0, e, id, def, val; e = els[i]; i ++) {
            if ((id = e.getAttribute('data-def-id'))
                && (def = this._editor._vtplFork.findEntityById(id))
            ) {
                if (val = trim(e.value)) {
                    def.funcAuth = val;
                }
                else {
                    delete def.funcAuth;
                }
            }
        }
    };

})();