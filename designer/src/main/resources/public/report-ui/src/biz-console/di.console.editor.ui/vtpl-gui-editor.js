/**
 * di.console.editor.ui.VTplGuiEditor
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    vtpl的很粗暴的“可视化”编辑
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
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var DI_FACTORY;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
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
     * @param {string} options.reportType
     * @param {string} options.schemaName
     * @param {string} options.cubeTreeNodeName
     */
    var VTPL_GUI_EDITOR = $namespace().VTplGuiEditor = 
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                addClass(el, 'vtpl-gui-editor');
                el.innerHTML = HTML_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var VTPL_GUI_EDITOR_CLASS = VTPL_GUI_EDITOR.prototype;
    
    var HTML_MAIN = [
        '<div class="">',
            '<div class="vtpl-gui-btn">',
                '<span class="q-vtpl-gui-btn-phase"></span>',
            '</div>',
            // TODO 需要后台支持
            '<div class="vtpl-gui-snippet"></div>',
            '<div class="vtpl-gui-ep">',
                '<div class="vtpl-gui-ep-ds">dsdsds</div>',
                '<div class="vtpl-gui-ep-cond">condcond</div>',
            '</div>',
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
        this._vtpl = options.vtpl;
        this._mVTplModel = options.vtplModel;
    }
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        this._eSnippet = q('vtpl-gui-snippet', el)[0];

        resetEditPhaseRadio.call(this);

        this._eps = {
            EP_DS: { el: q('vtpl-gui-ep-ds', el)[0] },
            EP_COND: { el: q('vtpl-gui-ep-cond', el)[0] }
        };

        // this.$initSnippet();

        // 初始时展现layout面板
        this.$changeEditPhase('EP_DS');

        // TODO
        // 临时使用简单的radio做编辑视图（布局＝》数据源＝》属性设定＝》交互动作设定）切换
        function resetEditPhaseRadio() {
            var ee = q('q-vtpl-gui-btn-phase', el)[0];
            ee.innerHTML = [
                // '<input type="radio" name="di-editor-phase" />布局&nbsp;&nbsp;',
                '<input type="radio" name="di-editor-phase" checked="checked" />数据源设定&nbsp;&nbsp;',
                '<input type="radio" name="di-editor-phase" />查询条件设定&nbsp;&nbsp;'//,
                // '<input type="radio" name="di-editor-phase" />属性设定&nbsp;&nbsp;',
                // '<input type="radio" name="di-editor-phase" />交互动作设定&nbsp;&nbsp;'
            ].join('');
            // var editPhases = ['EP_LAYOUT', 'EP_DATASOURCE', 'EP_ATTR', 'EP_INTERACTION'];
            var editPhases = ['EP_DS', 'EP_COND'];
            var ch = children(ee);
            for (var i = 0, o; o = ch[i]; i ++) {
                o.onclick = bind(this.$changeEditPhase, this, editPhases[i]);
            }
        }

        this.$preview();
    }
    
    /**
     * 初始化
     *
     * @public
     */
    VTPL_GUI_EDITOR_CLASS.init = function() {

        // // 事件绑定
        // this._mOLAPEditorModel.attach(
        //     'sync.result.INIT', 
        //     this.$handleInit, 
        //     this
        // );
        // this._mMetaConditionModel.attach(
        //     ['sync.complete.META_DATA', this.enable, this, 'OLAP_EDIROT'],
        //     ['sync.error.META_DATA', this.$handleFatalError, this]
        // );

        // // 操作按钮
        // this._uQueryBtn.onclick = bind(this.$handleQuery, this);
        // this._uChartConfigBtn.onclick = bind(this.$openChartConfig, this);

        // // 暂用策略：查询返回前，禁止一切操作
        // this._mDIDataModel.attach(
        //     ['sync.preprocess.DATA', this.disable, this, 'OLAP_EDIROT'],
        //     ['sync.complete.DATA', this.enable, this, 'OLAP_EDIROT']
        // );

        // // init
        // this._uMetaCondition.init();
        // this._uDIData.init();

        // this.disable();

        // // 初始报表
        // this._mOLAPEditorModel.sync({ datasourceId: 'INIT' });
    };

    /**
     * @override
     */
    VTPL_GUI_EDITOR_CLASS.dispose = function() {
        // TODO
        this._eSnippet = null;
        VTPL_GUI_EDITOR.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    VTPL_GUI_EDITOR_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_GUI_EDITOR_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_GUI_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            // this._uDIData.enable(key);
            // this._uQueryBtn.enable();
            // this._uMetaCondition.enable(key);
            VTPL_GUI_EDITOR.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_GUI_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            // this._uDIData.disable(key);
            // this._uQueryBtn.disable();
            // this._uMetaCondition.disable(key);
        }
        VTPL_GUI_EDITOR.superClass.disable.call(this);
    };

    /**
     * 初始化要展示出的布局面板
     * 
     * @protected
     */
    VTPL_GUI_EDITOR_CLASS.$initSnippet = function() {
        var snippetContent = this._vtpl.snippet.content;
        var eSnippet = this._eSnippet;

        // 检查是否可编辑
        if (!this.$checkEditable()) {
            eSnippet.innerHTML = '布局模版不可编辑';
            this.disable();
            return;
        }

        // 
    };

    /**
     * 检查snippet是否能可视化编辑，之前老版本的可能不能可视化编辑
     * 
     * @protected
     */
    VTPL_GUI_EDITOR_CLASS.$checkEditable = function() {
        var snippetContent = this._vtpl.snippet.content;
        if (snippetContent.indexOf(DOM_FLAG_BEGIN) >= 0
            && snippetContent.indexOf(DOM_FLAG_END) >= 0
        ) {
            return true;
        }
        return false;
    };    

    /**
     * 预览
     * 
     * @protected
     */
    VTPL_GUI_EDITOR_CLASS.$preview = function(epKey) {

    };

    /**
     * 改变editphase
     * 
     * @protected
     */
    VTPL_GUI_EDITOR_CLASS.$changeEditPhase = function(epKey) {
        var currEPKey = this._currEPKey;

        if (!currEPKey || currEPKey != epKey) {
            for (var key in this._eps) {
                this._eps[key].el.style.display = key == epKey ? '' : 'none';
            }
            this._currEPKey = epKey;
        }
    };

    /**
     * 严重错误处理
     * 
     * @protected
     */
    VTPL_GUI_EDITOR_CLASS.$handleFatalError = function(status) {
        this.disable();
        // // 参数校验失败
        // if (status == 1001) {
        //     DIALOG.alert(LANG.SAD_FACE + LANG.PARAM_ERROR);
        // }
        // else {
        //     DIALOG.alert(LANG.SAD_FACE + LANG.FATAL_DATA_ERROR);
        // }
    };

})();