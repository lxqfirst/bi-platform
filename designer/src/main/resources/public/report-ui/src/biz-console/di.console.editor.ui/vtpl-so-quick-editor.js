/**
 * di.console.editor.ui.VTplSoQuickEditor
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    vtpl的很粗暴的“可视化”编辑（代码也很粗暴～）
 *           此类为替换VTplQuickEditor而存在
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
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var DI_FACTORY;
    var VTPL_SO_QUICK_EDITOR_LAYOUT;
    var VTPL_SO_QUICK_EDITOR_DS;
    var VTPL_SO_QUICK_EDITOR_AUTH;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        VTPL_SO_QUICK_EDITOR_LAYOUT = di.console.editor.ui.VTplSoQuickEditorLayout;
        VTPL_SO_QUICK_EDITOR_DS = di.console.editor.ui.VTplSoQuickEditorDS;
        VTPL_SO_QUICK_EDITOR_AUTH = di.console.editor.ui.VTplSoQuickEditorAuth;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * vtpl快速编辑
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var VTPL_SO_QUICK_EDITOR = $namespace().VTplSoQuickEditor = 
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                addClass(el, 'vtpl-quick-editor');
                el.innerHTML = HTML_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var VTPL_SO_QUICK_EDITOR_CLASS = VTPL_SO_QUICK_EDITOR.prototype;
    
    var HTML_MAIN = [
        '<div class="vtpl-panel-page-btns">',
            '<span>报表名：</span>',
            '<input class="vtpl-name-input q-vtpl-name"/>',
            '<span class="q-btn-save">保存</span>',
        '</div>',
        '<div class="vtpl-quick-btn-phase">',
            '<span class="vtpl-quick-btn-phase-item">',
                '<input type="radio" name="di-editor-phase" checked="checked" />',
                '<span>第一步：数据集设定</span>',
            '</span>',
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
            '<span class="vtpl-quick-btn-phase-item">',
                '<input type="radio" name="di-editor-phase" />',
                '<span>第二步：查询条件设定</span>',
            '</span>',
            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;=>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
            '<span class="vtpl-quick-btn-phase-item">',
                '<input type="radio" name="di-editor-phase" />',
                '<span>第三步：权限设定</span>',
            '</span>',
        '</div>',
        '<div class="vtpl-quick-snippet"></div>',
        '<div class="vtpl-quick-ep">',
            '<div class="vtpl-quick-ep-ds" style="display:none">',
            '</div>',
            '<div class="vtpl-quick-ep-auth" style="display:none">',
            '</div>',
            '<div class="vtpl-quick-ep-layout">',
            '</div>',
        '</div>'
    ].join('');

    var EDIT_PHASE = ['EP_DS', 'EP_DETAIL', 'EP_AUTH'];    

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
        this._mPanelPageManager = options.panelPageManager;
        extend(this, this._vtplPanelPage.vtplMgrGet(this));
    }
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {

        // 保存按钮
        this._uSaveBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-save', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        // 初始时先设置为不能保存
        this._uSaveBtn.disable('SELF_START_EDIT');

        // 报表名输入框
        this._uNameInput = ecuiCreate(
            UI_INPUT,
            q('q-vtpl-name', el)[0]
        );

        // 创建布局渲染辅助类
        this._layout = new VTPL_SO_QUICK_EDITOR_LAYOUT(
            { editor: this, el: q('vtpl-quick-ep-layout', el)[0] }
        );
        // 创建数据集设置辅助类
        this._ds = new VTPL_SO_QUICK_EDITOR_DS(
            { editor: this, el: q('vtpl-quick-ep-ds', el)[0] }
        );
        // 创建权限设置辅助类
        this._auth = new VTPL_SO_QUICK_EDITOR_AUTH(
            { editor: this, el: q('vtpl-quick-ep-auth', el)[0] }
        );

        // 渲染步骤显示以及切换组件
        this.$resetEditPhaseRadio();
    }

    /**
     * 初始化
     *
     * @public
     */
    VTPL_SO_QUICK_EDITOR_CLASS.init = function() {
        var vtplPanelPage = this._vtplPanelPage;

        this._uSaveBtn.onclick = bind(vtplPanelPage.doSave, vtplPanelPage, this);

        // bindEditFn是vtplPanelPage传入的方法，
        // 用于统一实现“任何editor页中做修改时都能标记”等功能
        // nameInpt的onchange本身不需要做什么事件响应，
        // 只需要走一遍bindEditFn中的逻辑，所以用new Function
        this._uNameInput.onchange = this.bindEditFn(new Function(), this);
    };
    
    /**
     * 被vtplPanelPage调用，传入此editor专属的用于编辑的副本(vtplFork)，并刷新
     *
     * @public
     */
    VTPL_SO_QUICK_EDITOR_CLASS.doRefreshFork = function (vtplFork) {
        var vtpl = this._vtplFork = vtplFork;

        this._uNameInput.setValue(vtpl.vtplName || '');

        if (vtpl.snippet.invalid) {
            alert('snippet格式校验失败，禁止编辑');
            this.disable('VTPL_INVALID');
            // FIXME
            // 何时enable？
            return;
        }

        // 然后渲染
        this._layout.resetLayout();
        this._ds.refreshPanelDS();
        this._auth.refreshPanelAuth();

        // 初始时进入步骤“DS设置”
        !this._currEPKey && this.$changeEditPhase('EP_DS');
    };

    /**
     * @override
     */
    VTPL_SO_QUICK_EDITOR_CLASS.dispose = function() {
        foreachDoOri(
            [
                this._uSaveBtn,
                this._uRefreshBtn,
                this._uOlapTableBtn,
                this._uOlapChartBtn,
                this._uPlaneTableBtn,
                this._uNameInput,
                this._ds,
                this._layout
            ],
            'dispose',
            true
        );
        VTPL_SO_QUICK_EDITOR.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    VTPL_SO_QUICK_EDITOR_CLASS.$active = function() {
        // ...
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_SO_QUICK_EDITOR_CLASS.$inactive = function() {
        // ...
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            foreachDoOri(
                [
                    this._uSaveBtn,
                    this._uRefreshBtn,
                    this._uPlaneTableBtn,
                    this._uOlapChartBtn,
                    this._uOlapTableBtn,
                    this._layout,
                    this._ds,
                    this._auth
                ],
                'enable',
                key
            );
            VTPL_SO_QUICK_EDITOR.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            foreachDoOri(
                [
                    this._uSaveBtn,
                    this._uRefreshBtn,
                    this._uPlaneTableBtn,
                    this._uOlapChartBtn,
                    this._uOlapTableBtn,
                    this._layout,
                    this._ds,
                    this._auth
                ],
                'disable',
                key
            );
        }
        VTPL_SO_QUICK_EDITOR.superClass.disable.call(this);
    };

    /**
     * 开始编辑，被vtplPanelPage调用
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_CLASS.doStartEdit = function() {
        // 有修改的时候，保存按钮变为可用
        this._uSaveBtn.enable('SELF_START_EDIT');
    };

    /**
     * 保存，由vtplPanelPage调用
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_CLASS.doSave = function() {
        var vtpl = this._vtplFork;

        this._layout.doSave();

        // FIXME
        // 检查一下saveAuth的时间点是否合理
        this._auth.saveAuth();

        // 在这里清理rtplCond
        vtpl.condClean();

        // 写入报表名
        vtpl.vtplName = this._uNameInput.getValue();

        // stringify到vtpl的content中，才保存完成
        var errorMsg = vtpl.contentStringify();

        // FIXME
        // 如果遇到错误，是否要禁用save
        // (!errorMsg || !errorMsg.length)
        //     && this._uSaveBtn.disable('SELF_START_EDIT');

        return {
            vtplFork: vtpl,
            errorMsg: errorMsg
        }
    };

    /**
     * 响应rtpl创建完成，被vtplPanelPage调用
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_CLASS.doCreated = function() {
        // 刷新选择项
        // FIXME 
        // 检查是否真的被调用了。这个功能是用来自动刷新datasource的。
        this._ds.refreshPanelDS();
    };

    /**
     * 进入cond设置phase时必须先进此方法
     * 每次进入cond配置界面时，请求后台，更新vtpl.rtplCond的已选值
     * 现在只能想到，在这个时点与后台同步了，因为之前的时点，vtpl中引用的reportTemplateId都可能会变
     * 
     * @private
     */
    VTPL_SO_QUICK_EDITOR_CLASS.$syncCond = function (callback) {
        var me = this;
        var vtplFork = this._vtplFork;
        var key = 'VTPL_SO_QUICK_EDITOR';

        // 请求后台的condition信息
        this._mVTplModel.sync(
            {
                datasourceId: 'EXIST_COND',
                args: {
                    reportTemplateIdList: vtplFork.rtplIdGet(true),
                    virtualTemplateId: vtplFork.vtplKey
                },
                preprocess: function () {
                    // 先禁用
                    me.disable(key);
                },
                result: function (data, ejsonObj, options) {
                    // 得到当前选择
                    // 和已经选择的进行merge
                    var existCond = vtplFork.rtplCond;
                    var rtplCond = vtplFork.rtplCond = data.templateDims || {};
                    // 用已有的覆盖，因为已有的可能是设置但还未保存的
                    // 其实这里有潜在的和后台不同步的危险
                    // 但是没想到更好的方法了
                    for (var rid in existCond) {
                        if (rtplCond[rid] && existCond[rid]) {
                            rtplCond[rid] = existCond[rid];
                        }
                    }
                    // 启用
                    me.enable(key);
                    callback.call(me);
                },
                error: function (status, ejsonObj, options) {
                    me.disable(key);
                    alert('获取条件设置失败：status=' + status);
                    callback.call(me);
                }
            }
        );
    };

    /**
     * 改变edit phase
     * 
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_CLASS.$changeEditPhase = function(epKey) {
        var currEPKey = this._currEPKey;
        var me = this;

        if (currEPKey == 'EP_DS') {
            // 离开datasource视图时，
            // 检查是否所有component都选中了reporttemplateid
            if (!this._ds.checkAllDSLinked()) {
                DIALOG.alert(LANG.NEED_DS_ALL_LINKED);
                return false;
            }
        }

        if (currEPKey == 'EP_AUTH') {
            // 离开auth视图时，将视图中的auth数据中写入vtpl对象
            //（但不是写入后台，写入后台，统一都是save的时间）
            // FIXME
            // 执行saveAuth时间点再考虑下？
            this._auth.saveAuth();
        }

        if (!currEPKey || currEPKey != epKey) {
            this._currEPKey = epKey;

            if (epKey == 'EP_DS') {
                changePhaseView();
            }
            else if (epKey == 'EP_AUTH') {
                this._auth.refreshPanelAuth();
                changePhaseView();
            }
            else if (epKey == 'EP_DETAIL') {
                this.$syncCond(changePhaseView);
            }
        }

        return true;

        function changePhaseView() {
            me._layout.changeEditPhase(epKey);

            if (epKey == 'EP_DS') {
                me._ds.active();
                me._auth.inactive();
            }
            else if (epKey == 'EP_AUTH') {
                me._ds.inactive();
                me._auth.active();
            }
            else if (epKey == 'EP_DETAIL') {
                me._ds.inactive();
                me._auth.inactive();
            }
        }
    };

    // TODO
    // 临时使用简单的radio做编辑视图切换
    VTPL_SO_QUICK_EDITOR_CLASS.$resetEditPhaseRadio = function () {
        var ee = q('vtpl-quick-btn-phase', this.getEl())[0];
        var ch = children(ee);
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
            })(EDIT_PHASE[i]);
        }
    };

    /**
     * 严重错误处理
     * 
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_CLASS.$handleFatalError = function(status) {
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