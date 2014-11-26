/**
 * di.console.editor.ui.VTplSoQuickEditorLayout
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    基础地渲染当前报表的布局结构
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
    var hasClass = xutil.dom.hasClass;
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
    var domData = UTIL.domData;
    var preInit = UTIL.preInit;
    var forEachCSSFlag = UTIL.forEachCSSFlag;
    var forEachDom = UTIL.forEachDom;
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
     * 基础地渲染当前报表的布局结构
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var VTPL_SO_QUICK_EDITOR_LAYOUT = $namespace().VTplSoQuickEditorLayout = 
        inheritsObject(XVIEW, constructor);
    var VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS = VTPL_SO_QUICK_EDITOR_LAYOUT.prototype;
    
    // var HTML_MAIN = [
        // '<div class="vtpl-quick-editor-cond-btns">',
        //     '<span class="vtpl-quick-editor-cond-add-line">添加一行</span>',
        // '</div>',
        // '<div class="vtpl-quick-editor-cond-layout">',
        // '</div>'
    // ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 构造函数
     *
     * @constructor
     * @private
     */
    function constructor(options) {
        this._editor = options.editor;
        var el = this._el = options.el;

        // FIXME
        // this._uAddLineBtn = ecuiCreate(
        //     UI_BUTTON,
        //     q('vtpl-quick-editor-cond-add-line', el)[0],
        //     null, 
        //     { primary: 'ui-button-g' }
        // );
        // this._eLayout = q('vtpl-quick-editor-cond-layout', el)[0];

        // 创建操作浮层
        this.$createFloater();

        // 条件配置panel
        this._uCondConfigPanel = new COND_CONFIG_PANEL(
            {
                model: this._mVTplModel,
                parent: this
            }
        );

        this.$initFloater();

        // 点击既标志更改
        el.onclick = this._editor.bindEditFn(new Function());

        this._uCondConfigPanel.init();
    }
    
    /**
     * @override
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.dispose = function () {
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
        VTPL_SO_QUICK_EDITOR_LAYOUT.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$active = function () {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$inactive = function () {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.enable = function (key) {
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
            VTPL_SO_QUICK_EDITOR_LAYOUT.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.disable = function (key) {
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
        VTPL_SO_QUICK_EDITOR_LAYOUT.superClass.disable.call(this);
    };

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.active = function () {
        // ...
    };    

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.inactive = function () {
        // ...
    };    

    /**
     * 保存
     *
     * @public
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.doSave = function () {
        // 清除多余标签
        var html = clearConsoleCSS(this.el.innerHTML);
        // 在doSave时才将dom保存进vtplFork
        // （而对于depict，是随时变随时改的）
        this._editor._vtplFork.innerHTML(this._def.id, html);
    };

    /**
     * 设置edit phase，不同截断，layout会有不同表现
     *
     * @public
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.changeEditPhase = function (epKey) {
        if (!this._currEPKey || this._currEPKey != epKey) {

            this.$inactiveFloater(null, true);
            this.$highlightCPNT(null, false);

            this._currEPKey = epKey;

            if (epKey == 'EP_DS') {
                // FIXME
                // 是否需要视图内部设为visiblity: false？
                // ...
            }
            else if (epKey == 'EP_AUTH') {
                // ...
            }
            else if (epKey == 'EP_DETAIL') {
                // ...
            }
        }
    };

    /**
     * 刷新布局
     *
     * @public
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.resetLayout = function () {
        var me = this;
        var vtpl = this._editor._vtplFork;
        var eLayout = this._el;
        var html = vtpl.innerHTML();

        // FIXME
        // 先清空内部 ...

        // 未定义的情况，不可以编辑
        if (html == null) {
            this.disable();
            eLayout.innerHTML = '未定义可编辑区域，不可编辑'
            return;
        }

        eLayout.innerHTML = html;

        // 增加console css
        addConsoleCSS(eLayout);

        forEachDom(
            eLayout, 
            function (el) {
                if (hasClass(el, 'di-o_o-line')
                    || el.getAttribute(DICT.DI_ATTR)
                ) {
                    me.$bindHover(el);
                }
            }
        );

        // 绑定打开编辑窗口的事件
        var els = q('di-o_o-item', eLayout);
        for (var i = 0, eItem; eItem = els[i]; i ++) {
            if (eItem.getAttribute(DICT.DI_ATTR)) {
                // FIXME
                // 加上根据item确定component的def的逻辑，从而后面才能设置condition
                this.$initVUIItem(eItem);
            }
        }
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$addTextItem = function (eLine) {
        var eItem = document.createElement('div');
        eItem.innerHTML = '请输入文本';
        addClass(eItem, 'di-o_o-item c-di-o_o-item');
        eItem.setAttribute('contentEditable', true);
        eLine.appendChild(eItem);
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$addVUIItem = function (eLine) {
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

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$initVUIItem = function (eItem) {
        var me = this;
        // 打开编辑窗口的事件
        eItem.onclick = function () {
            var id = this.getAttribute(DICT.DI_ATTR);
            me.$openCondConfig(
                id, 
                this, 
                false, 
                bind(me.$refreshVUIItem, me, this)
            );
        }
        // 初始刷新
        this.$refreshVUIItem(eItem);
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$refreshVUIItem = function (vuiItem) {
        // TODO
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$openCondConfig = function (
        entityId, condEl, isCreate, onclose
    ) {
        this._uCondConfigPanel.attachOnce('submit.close', onclose, this);
        this._uCondConfigPanel.open(
            'EDIT',
            {
                // FIXME
                // 从外部传来component的def
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
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$addLine = function () {
        var line = document.createElement('div');
        addClass(line, 'di-o_o-line c-di-o_o-line');
        this.el.appendChild(line);
        this.$bindHover(line);
    };

    /**
     * 删除一行
     *
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$removeLine = function (eLine) {
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

        this.el.removeChild(eLine);
    };

    /**
     * hover事件管理
     *
     * @protected
     * @param {HTMLElement} el 绑定到这个节点上
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$bindHover = function (el) {
        var me = this;

        if (domData(el, 'boundHover')) {
            // 避免重复绑定
            return;
        }
        domData(el, 'boundHover', true);

        baiduOn(
            el,
            'mouseenter',
            function (e) {
                var currEPKey = me._currEPKey;

                if (currEPKey == 'EP_DS') {
                    // 如果是数据集设置截断，
                    // 增加边框提示当前hover的COMPONENT。
                    // 这里根据data-di-o_o-id属性来判断元素是不是属于某COMPONENT，
                    // 而不宜根据di-o_o-block这个css判断，
                    // 因为DI规范上，di-o_o-block和COMPONENT并没有对应关系，
                    // 有些模板为了视图效果，COMPONENT可能根本没有挂上di-o_o-block这个css类。
                    if (!domData(el, 'isFloater')) {
                        me.$highlightCPNT(el, true);
                    }
                }
                else if (currEPKey == 'EP_DETAIL') {
                    // 如果是详细设置阶段
                    // 出现操作浮层
                    me.$activeFloater(el);
                }
                else if (currEPKey == 'EP_AUTH') {
                    // DO NOTHING
                }
                // e.stopPropagation();
            }
        );
        baiduOn(
            el, 
            'mouseleave', 
            function (e) {
                var currEPKey = me._currEPKey;

                if (currEPKey == 'EP_DS') {
                    !domData(el, 'isFloater') && me.$highlightCPNT(el, false);
                }
                else if (currEPKey == 'EP_DETAIL') {
                    // 如果是详细设置阶段
                    // 隐藏操作浮层
                    me.$inactiveFloater(el, false);
                }
                else if (currEPKey == 'EP_AUTH') {
                    // DO NOTHING
                }
                // e.stopPropagation();
            }
        );
    };

    /**
     * 高亮component中所有vui
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$highlightCPNT = function (el, willHighlight) {
        var cpntId;
        var doms = [];
        var vtplFork = this._editor._vtplFork;

        if (willHighlight) {
            cpntId = (vtplFork.findCPNTByDom(el, this._el) || {}).id;
        }
        this.highlightCPNT(cpntId, willHighlight);

        // 高亮数据集选择项
        // 这里没用事件的方式，直接调用了，比较明显
        var ds = this._editor._ds;
        ds && ds.highlight(cpntId, willHighlight);
    };

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.highlightCPNT = function (cpntId, willHighlight) {
        var els = this._el.getElementsByTagName('*');
        var vtplFork = this._editor._vtplFork;

        for (var i = 0; i < els.length; i ++) {
            if (els[i].getAttribute(DICT.DI_ATTR)) {
                this.$removeHoverStyle(els[i]);
            }
        }

        if (cpntId && willHighlight) {
            var doms = vtplFork.findCPNTDoms(cpntId, this._el);
            for (var i = 0; i < doms.length; i ++) {
                this.$addHoverStyle(doms[i]);
            }
        }
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$addHoverStyle = function (el) {
        // FIXME
        // 暂且认为el全是line，后续加其他种类，如item, block等
        el && addClass(el, 'c-di-o_o-hover');
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$removeHoverStyle = function (el) {
        // FIXME
        // 暂且认为el全是line，后续加其他种类，如item, block等
        el && removeClass(el, 'c-di-o_o-hover');
    };

    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$belongTo = function (el) {

    };

    //--------------------------------------------------------------------------------
    // 控制浮层相关
    //--------------------------------------------------------------------------------

    /**
     * 创建控制浮层
     *
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$createFloater = function () {
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
            domData(lineFloater, 'isFloater', true);
            this.$bindHover(lineFloater);
        }
    };

    /**
     * 初始化控制浮层
     *
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$initFloater = function () {
        var editor = this._editor;
        // floater内部按钮的功能
        this._uAddTextBtn.onclick = editor.bindEditFn(function () {
            this.$addTextItem(this._lineFloater.trigger);
            this.$showFloater(false);
        }, this);
        this._uAddVUIBtn.onclick = editor.bindEditFn(function () {
            this.$addVUIItem(this._lineFloater.trigger);
            this.$showFloater(false);
        }, this);
        this._uRemoveLineBtn.onclick = editor.bindEditFn(function () {
            this.$removeLine(this._lineFloater.trigger);
            this.$showFloater(false);
        }, this);
    };

    /**
     * active floater
     *
     * @protected
     * @param {HTMLElement=} trigger 传入则表示有触发元素，不传则表示没有。
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$activeFloater = function (el) {
        var lineFloater = this._lineFloater;

        if (!lineFloater) { return; }

        // FIXME
        // 暂时策略，后续加di-o_o-item等的hover
        if (!hasClass(el, 'di-o_o-line')
            && !domData(el, 'isFloater')
        ) { 
            return; 
        }

        // 控制变量
        lineFloater.needShow = true;

        var currTrigger = lineFloater.trigger;
        if (!domData(el, 'isFloater')) {
            this.$removeHoverStyle(currTrigger)
            currTrigger = lineFloater.trigger = el;
            this.$addHoverStyle(currTrigger)
        }

        // floater显示
        this.$showFloater(true);
        // floater定位
        var pos = getPosition(currTrigger);
        var st = lineFloater.style;
        st.left = (pos.left + currTrigger.offsetWidth - lineFloater.offsetWidth) + 'px';
        st.top = (pos.top + 2 - lineFloater.offsetHeight) + 'px';
    };

    /**
     * inactive floater
     *
     * @protected
     * @param {boolean} force 是否强制立刻消失，还是延迟消失
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$inactiveFloater = function (el, force) {
        var me = this;
        var lineFloater = this._lineFloater;

        if (!lineFloater) { return; }

        // FIXME
        // 暂时策略，后续加di-o_o-item等的hover
        if (el && !hasClass(el, 'di-o_o-line')
            && !domData(el, 'isFloater')
        ) { 
            return; 
        }
        // 控制变量
        lineFloater.needShow = false;

        force 
            ? inact() 
            : setTimeout(
                function () {
                    lineFloater && !lineFloater.needShow && inact();
                }, 
                600
            );

        function inact() {
            lineFloater.trigger && me.$removeHoverStyle(lineFloater.trigger);
            me.$showFloater(false);
        }
    };  

    /**
     * 创建控制浮层
     *
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_LAYOUT_CLASS.$showFloater = function (toShow) {
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