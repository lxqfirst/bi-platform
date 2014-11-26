/**
 * di.console.editor.ui.VTplQuickEditorCond
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    vtpl的很粗暴的“可视化”编辑（代码也很粗暴～）
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
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var remove = xutil.dom.remove;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var jsonParse = baidu.json.parse;
    var getUID = xutil.uid.getUID;
    var encodeHTML = xutil.string.encodeHTML;
    var children = xutil.dom.children;
    var foreachDoOri = UTIL.foreachDoOri;
    var template = xutil.string.template;
    var getParent = xutil.dom.getParent;
    var getPosition = ecui.dom.getPosition;
    var addConsoleCSS = UTIL.addConsoleCSS;
    var clearConsoleCSS = UTIL.clearConsoleCSS;
    var preInit = UTIL.preInit;
    var forEachCSSFlag = UTIL.forEachCSSFlag;
    var stringifyParam = xutil.url.stringifyParam;
    var ecuiCreate = UTIL.ecuiCreate;
    var getView = ecui.util.getView;
    var baiduOn = baidu.on;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var textParam = xutil.url.textParam;
    var UI_BUTTON = ecui.ui.Button;
    var XVIEW = xui.XView;
    var DI_FACTORY;
    var COND_CONFIG_PANEL;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        COND_CONFIG_PANEL = di.console.editor.ui.CondConfigPanel;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * vtpl图形编辑
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var VTPL_QUICK_EDITOR_COND = $namespace().VTplQuickEditorCond = 
        inheritsObject(
            XVIEW,
            function(options) {
                var el = options.el;
                addClass(el, 'vtpl-quick-editor-cond');
                el.innerHTML = HTML_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var VTPL_QUICK_EDITOR_COND_CLASS = VTPL_QUICK_EDITOR_COND.prototype;
    
    var HTML_MAIN = [
        '<div class="vtpl-quick-editor-cond-btns">',
            '<span class="vtpl-quick-editor-cond-add-line">添加一行</span>',
        '</div>',
        '<div class="vtpl-quick-editor-cond-layout">',
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
        this._def = options.def;
        this.bindEditFn = options.bindEditFn;
        this._vtplPanelPage = options.vtplPanelPage;
        this._mVTplModel = options.vtplModel;
        this._mPanelPageManager = options.panelPageManager;
        // FIXME
        // 是否不应该在创建时传入，因为每次有可能不一样，外面可能会重新fork
        this._vtplFork = options.vtplFork;
    }
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        this._uAddLineBtn = ecuiCreate(
            UI_BUTTON,
            q('vtpl-quick-editor-cond-add-line', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._eLayout = q('vtpl-quick-editor-cond-layout', el)[0];

        this.$createFloater();

        this._uCondConfigPanel = new COND_CONFIG_PANEL(
            {
                model: this._mVTplModel,
                parent: this
            }
        );
    }
    
    /**
     * 初始化
     *
     * @public
     */
    VTPL_QUICK_EDITOR_COND_CLASS.init = function () {
        this._uAddLineBtn.onclick = this.bindEditFn(this.$addLine, this);

        // floater内部按钮的功能
        this._uAddTextBtn.onclick = this.bindEditFn(function () {
            this.$addTextItem(this._lineFloater.trigger);
            this.$showFloater(false);
        }, this);
        this._uAddVUIBtn.onclick = this.bindEditFn(function () {
            this.$addVUIItem(this._lineFloater.trigger);
            this.$showFloater(false);
        }, this);
        this._uRemoveLineBtn.onclick = this.bindEditFn(function () {
            this.$removeLine(this._lineFloater.trigger);
            this.$showFloater(false);
        }, this);

        // 点击既启用保存按钮
        this._eLayout.onclick = this.bindEditFn(new Function());

        this._uCondConfigPanel.init();

        this.$resetLayout();
    };

    /**
     * @override
     */
    VTPL_QUICK_EDITOR_COND_CLASS.dispose = function () {
        this._eLayout = null;
        foreachDoOri(
            [
                this._uAddLineBtn,
                this._uAddVUIBtn,
                this._uAddTextBtn,
                this._uRemoveLineBtn,
                this._uCondConfigPanel
            ],
            'dispose'
        );
        if (this._lineFloater) {
            document.body.removeChild(this._lineFloater);
            this._lineFloater = null;
        }
        // FIXME 
        // 需要baidu.un？
        VTPL_QUICK_EDITOR_COND.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$active = function () {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$inactive = function () {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_QUICK_EDITOR_COND_CLASS.enable = function (key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            foreachDoOri(
                [
                    this._uAddLineBtn,
                    this._uAddVUIBtn,
                    this._uAddTextBtn,
                    this._uRemoveLineBtn
                ],
                'enable'
            );
            VTPL_QUICK_EDITOR_COND.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_QUICK_EDITOR_COND_CLASS.disable = function (key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            foreachDoOri(
                [
                    this._uAddLineBtn,
                    this._uAddVUIBtn,
                    this._uAddTextBtn,
                    this._uRemoveLineBtn
                ],
                'disable'
            )
        }
        VTPL_QUICK_EDITOR_COND.superClass.disable.call(this);
    };

    /**
     * 保存
     *
     * @public
     */
    VTPL_QUICK_EDITOR_COND_CLASS.doSave = function () {
        // 清除多余标签
        var html = clearConsoleCSS(this._eLayout.innerHTML);
        // 在doSave时才将dom保存进vtplFork
        // （而对于depict，是随时变随时改的）
        this._vtplFork.innerHTML(this._def.id, html);
    };

    /**
     * 刷新布局
     *
     * @protected
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$resetLayout = function () {
        var me = this;
        var vtpl = this._vtplFork;
        var def = this._def;
        var eLayout = this._eLayout;
        var i;
        var o;
        
        var html = vtpl.innerHTML(def.id);

        // 未定义的情况，不可以编辑
        if (html == null) {
            this.disable();
            eLayout.innerHTML = '未定义条件编辑区域，不可编辑条件'
            return;
        }

        eLayout.innerHTML = html;

        // 增加console css
        addConsoleCSS(eLayout);

        forEachCSSFlag(
            this._eLayout, 
            'di-o_o-line',
            function (el, css) {
                me.$bindShowFloater(el, true);
            }
        );

        // 打开编辑窗口的事件
        var els = q('di-o_o-item', this._eLayout);
        for (var i = 0, eItem; eItem = els[i]; i ++) {
            if (eItem.getAttribute(DICT.DI_ATTR)) {
                this.$initVUIItem(eItem);
            }
        }
    };

    VTPL_QUICK_EDITOR_COND_CLASS.$addTextItem = function (eLine) {
        var eItem = document.createElement('div');
        eItem.innerHTML = '请输入文本';
        addClass(eItem, 'di-o_o-item c-di-o_o-item');
        eItem.setAttribute('contentEditable', true);
        eLine.appendChild(eItem);
    };

    VTPL_QUICK_EDITOR_COND_CLASS.$addVUIItem = function (eLine) {
        var me = this;
        // 新生成entity id。
        var id = this._def.id + '-vu-' + this._vtplFork.genId();
        this.$openCondConfig(id, null, true, addItem);

        function addItem(data, ejsonObj, options) {
            var eItem = document.createElement('div');
            addClass(eItem, 'di-o_o-item c-di-o_o-item c-di-o_o-cond-vui');
            eItem.setAttribute(DICT.DI_ATTR, id);
            if (options.args.hide) {
                addClass(eItem, 'di-o_o-hide c-di-o_o-hide');
            }
            eLine.appendChild(eItem);
            me.$initVUIItem(eItem);
        }
    };

    VTPL_QUICK_EDITOR_COND_CLASS.$initVUIItem = function (eItem) {
        var me = this;
        // 打开编辑窗口的事件
        eItem.onclick = function () {
            var id = this.getAttribute(DICT.DI_ATTR);
            me.$openCondConfig(id, this, false, bind(me.$refreshVUIItem, me, this));
        }
        // 初始刷新
        this.$refreshVUIItem(eItem);
    };

    VTPL_QUICK_EDITOR_COND_CLASS.$refreshVUIItem = function (vuiItem) {
        // TODO
    };

    VTPL_QUICK_EDITOR_COND_CLASS.$openCondConfig = function (entityId, condEl, isCreate, onclose) {
        this._uCondConfigPanel.attachOnce('submit.close', onclose, this);
        this._uCondConfigPanel.open(
            'EDIT',
            {
                cpntId: this._def.id,
                entityId: entityId,
                reportType: this._def.reportType,
                vtplFork: this._vtplFork,
                reportTemplateId: this._def.reportTemplateId,
                isCreate: isCreate,
                condEl: condEl
            }
        );
    };

    /**
     * 增加一行
     *
     * @protected
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$addLine = function () {
        var line = document.createElement('div');
        addClass(line, 'di-o_o-line c-di-o_o-line');
        this._eLayout.appendChild(line);
        this.$bindShowFloater(line, true);
    };

    /**
     * 删除一行
     *
     * @protected
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$removeLine = function (eLine) {
        if (!eLine) {
            return;
        }

        var vtpl = this._vtplFork;
        var els = eLine.getElementsByTagName('*');
        for (var i = 0, eItem, id; eItem = els[i]; i ++) {
            if (id = eItem.getAttribute(DICT.DI_ATTR)) {
                // 注意：目前只对vuiRef进行了判断。
                // 如果后续添加了别的引用的设置，这里也要删除！
                vtpl.removeVUIRefAll(id);
                // 清除depict中的引用
                vtpl.removeEntityDef(id);
                // 对于rtplConf的引用，不在这里清除了（因为是多对多的关系）
                // 在rtplConf保存时，统一清除没有被引用的rtplConf
            }
        }

        this._eLayout.removeChild(eLine);
    };

    //--------------------------------------------------------------------------------
    // 控制浮层相关
    //--------------------------------------------------------------------------------

    /**
     * 创建控制浮层
     *
     * @protected
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$createFloater = function () {
        var me = this;

        if (!this._lineFloater) {
            var lineFloater = this._lineFloater = document.createElement('div');
            addClass(lineFloater, 'console-floater');
            document.body.appendChild(lineFloater);

            lineFloater.innerHTML = [
                '<div>添加文本</div>',
                '<div>添加输入控件</div>',
                '<div>删除本行</div>'
            ].join('');

            var ch = children(lineFloater);
            var btnOpt = { primary: 'ui-button-g' };

            this._uAddTextBtn = ecuiCreate(UI_BUTTON, ch[0], null, btnOpt);
            this._uAddVUIBtn = ecuiCreate(UI_BUTTON, ch[1], null, btnOpt);
            this._uRemoveLineBtn = ecuiCreate(UI_BUTTON, ch[2], null, btnOpt);

            lineFloater.style.display = 'none';
            this.$bindShowFloater(lineFloater);
        }
    };

    /**
     * 显示隐藏浮动层的事件
     *
     * @protected
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$bindShowFloater = function (el, isTrigger) {
        var me = this;
        var lineFloater = this._lineFloater;

        baiduOn(
            el,
            'mouseenter', 
            function (e) {
                if (!lineFloater) { return; }
                
                lineFloater.needShow = true;
                var trigger = lineFloater.trigger;
                if (isTrigger) {
                    trigger && removeClass(trigger, 'c-di-o_o-line-hover');
                    trigger = lineFloater.trigger = el;
                    addClass(el, 'c-di-o_o-line-hover');
                }
                // floater显示
                me.$showFloater(true);
                // floater定位
                var pos = getPosition(trigger);
                var st = lineFloater.style;
                st.left = (pos.left + trigger.offsetWidth - lineFloater.offsetWidth) + 'px';
                st.top = (pos.top + 2 - lineFloater.offsetHeight) + 'px';
            }
        );
        baiduOn(
            el, 
            'mouseleave', 
            function (e) {
                if (!lineFloater) { return; }

                lineFloater.needShow = false;
                setTimeout(function () {
                    if (lineFloater && !lineFloater.needShow) {
                        removeClass(lineFloater.trigger, 'c-di-o_o-line-hover');
                        me.$showFloater(false);
                    }
                }, 800);
            }
        );
    };    

    /**
     * 创建控制浮层
     *
     * @protected
     */
    VTPL_QUICK_EDITOR_COND_CLASS.$showFloater = function (toShow) {
        var lineFloater = this._lineFloater;
        if (!lineFloater) { return; }
        
        var st = lineFloater.style;
        if (toShow && st.display == 'none') {
            st.display = '';
            st.position = 'absolute';
        }
        else if (!toShow && st.display == '') {
            st.display = 'none';
        }
    };

})();