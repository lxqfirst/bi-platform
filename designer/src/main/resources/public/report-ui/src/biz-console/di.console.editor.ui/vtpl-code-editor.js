/**
 * di.console.editor.ui.VTplCodeEditor
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    vtpl源码编辑
 * @author:  sushuang(sushuang)
 * @depend:  codemirror, xui, xutil
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
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var children = xutil.dom.children;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var stringifyParam = xutil.url.stringifyParam;
    var ecuiCreate = UTIL.ecuiCreate;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var textParam = xutil.url.textParam;
    var UI_BUTTON = ecui.ui.Button;
    var UI_INPUT = ecui.ui.Input;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var DI_FACTORY;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * vtpl源码编辑
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var VTPL_CODE_EDITOR = $namespace().VTplCodeEditor = 
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                addClass(el, 'vtpl-code-editor');
                el.innerHTML = HTML_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var VTPL_CODE_EDITOR_CLASS = VTPL_CODE_EDITOR.prototype;
    
    //------------------------------------------
    // 模板
    //------------------------------------------

    var HTML_MAIN = [
        '<div class="vtpl-panel-page-btns">',
            '<span>报表名：</span>',
            '<input class="vtpl-name-input q-vtpl-name"/>',
            '<span class="q-btn-save">保存</span>',
        '</div>',
        '<div class="vtpl-quick-btn-phase">',
            '<span class="vtpl-quick-btn-phase-item">',
                '<input type="radio" name="di-editor-code" checked="checked" />视图布局文件',
            '</span>',
            '<span class="vtpl-quick-btn-phase-item" style="margin-left:10px;">',
                '<input type="radio" name="di-editor-code" />视图定义文件',
            '</span>',
        '</div>',
        '<div class="vtpl-code">',
            '<div class="vtpl-code-snippet"></div>',
            '<div class="vtpl-code-depict"></div>',
        '</div>'
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
        this._vtplPanelPage = options.vtplPanelPage;
        this._mVTplModel = options.vtplModel;
        extend(this, this._vtplPanelPage.vtplMgrGet(this));
    };
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        this._uSaveBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-save', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._uNameInput = ecuiCreate(
            UI_INPUT,
            q('q-vtpl-name', el)[0]
        );

        var opt = {
            theme: "rubyblue",
            lineNumbers: true,
            matchBrackets: true,
            indentUnit: 4,
            lineWrapping: false,
            height: 700,
            smartIndent: false
        };
        var snippetOpt = extend({ snippet: 'htmlmixed' }, opt);
        var depictOpt = extend({ snippet: 'javascript' }, opt);

        var eps = this._eps = { snippet: {}, depict: {} };
        eps.snippet.el = q('vtpl-code-snippet', el)[0];
        eps.snippet.el.appendChild(document.createElement('div'));
        eps.snippet.input = CodeMirror(eps.snippet.el.firstChild, snippetOpt);
        eps.depict.el = q('vtpl-code-depict', el)[0];
        eps.depict.el.appendChild(document.createElement('div'));
        eps.depict.input = CodeMirror(eps.depict.el.firstChild, depictOpt);

        var vtplType = ['snippet', 'depict'];
        var ch = children(q('vtpl-quick-btn-phase', el)[0]);
        var me = this;
        for (var i = 0, o; o = ch[i]; i ++) {
            o.onclick = (function (ph) {
                return function () {
                    if (me.$changeEditPhase(ph)) {
                        this.getElementsByTagName('input')[0].checked = true;
                    }
                    else {
                        return false;
                    }
                };
            })(vtplType[i]);
        }
    };

    /**
     * 创建副本，用于编辑，被vtplPanelPage调用
     * 
     * @public
     */
    VTPL_CODE_EDITOR_CLASS.doRefreshFork = function (vtplFork) {
        var vtpl = this._vtplFork = vtplFork;

        this._eps.snippet.input.$__setValue(vtpl.snippet.content);
        this._eps.depict.input.$__setValue(vtpl.depict.content);

        this._uNameInput.setValue(vtpl.vtplName || '');

        // 初始时展现depict面板
        !this._currEPKey && this.$changeEditPhase('snippet');
    };
    
    /**
     * 初始化
     *
     * @public
     */
    VTPL_CODE_EDITOR_CLASS.init = function() {
        var editFn = this.bindEditFn(new Function(), this);
        var eps = this._eps;
        var snippetInput = eps.snippet.input;
        var depictInput = eps.depict.input;
        var vtplPanelPage = this._vtplPanelPage;

        // 挂上重载的方法
        snippetInput.$__setValue = $__setValue;
        depictInput.$__setValue = $__setValue;

        // 挂事件
        this._uSaveBtn.onclick = bind(vtplPanelPage.doSave, vtplPanelPage, this);
        this._uNameInput.onchange = this.bindEditFn(new Function(), this);

        this._eps.snippet.input.on(
            'change', 
            snippetInput.$__changeFn = getChangeFn(editFn)
        );
        this._eps.depict.input.on(
            'change', 
            depictInput.$__changeFn = getChangeFn(editFn)
        );

        // this._uSaveBtn.disable('SELF_START_EDIT');

        function getChangeFn(editFn) {
            var fn = function () {
                // 因为code mirror的change，是无论用户事件还是setValue都会触发的，所以要区分一下。
                if (!fn.notUserEvent) {
                    return editFn([].slice.call(arguments));
                }
            };

            return fn;
        }

        function $__setValue(str) {
            var changeFn = this.$__changeFn;
            changeFn.notUserEvent = true;
            var ret = this.setValue(str);
            changeFn.notUserEvent = false;
            return ret;
        }
    };

    /**
     * @override
     */
    VTPL_CODE_EDITOR_CLASS.dispose = function() {
        // TODO
        this._uSaveBtn && this._uSaveBtn.dispose();
        this._uNameInput && this._uNameInput.dispose();
        this._eps = null;
        VTPL_CODE_EDITOR.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    VTPL_CODE_EDITOR_CLASS.$active = function() {
        // TODO
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_CODE_EDITOR_CLASS.$inactive = function() {
        // TODO
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_CODE_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            var el = this.getEl();
            q('vtpl-code-depict', el)[0]
                .getElementsByTagName('TEXTAREA')[0].disabled = false;
            q('vtpl-code-snippet', el)[0]
                .getElementsByTagName('TEXTAREA')[0].disabled = false;
            this._uSaveBtn && this._uSaveBtn.enable(key);
            VTPL_CODE_EDITOR.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_CODE_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            var el = this.getEl();
            q('vtpl-code-depict', el)[0]
                .getElementsByTagName('TEXTAREA')[0].disabled = true;
            q('vtpl-code-snippet', el)[0]
                .getElementsByTagName('TEXTAREA')[0].disabled = true;
            this._uSaveBtn && this._uSaveBtn.disable(key);
        }
        VTPL_CODE_EDITOR.superClass.disable.call(this);
    };    

    /**
     * 开始编辑
     * 
     * @protected
     */
    VTPL_CODE_EDITOR_CLASS.doStartEdit = function() {
        // this._uSaveBtn.enable('SELF_START_EDIT');
    };

    /**
     * 保存操作, 被vtplPanelPage调用
     *
     * @protected
     * @return {Array.<string>} errorMsg 如果正确，返回空
     */
    VTPL_CODE_EDITOR_CLASS.doSave = function() {
        var vtpl = this._vtplFork;

        // 报表名
        vtpl.vtplName = this._uNameInput.getValue();

        var errorMsg = vtpl.contentSet(
            this._eps.snippet.input.getValue(),
            this._eps.depict.input.getValue()
        );

        // (!errorMsg || !errorMsg.length)
        //     && this._uSaveBtn.disable('SELF_START_EDIT');

        return {
            vtplFork: vtpl,
            errorMsg: errorMsg
        }
    };

    /**
     * 改变editphase
     * 
     * @protected
     */
    VTPL_CODE_EDITOR_CLASS.$changeEditPhase = function(epKey) {
        var currEPKey = this._currEPKey;

        if (!currEPKey || currEPKey != epKey) {
            for (var key in this._eps) {
                this._eps[key].el.style.display = key == epKey ? '' : 'none';
            }
            this._currEPKey = epKey;
        }

        return true;
    };

})();