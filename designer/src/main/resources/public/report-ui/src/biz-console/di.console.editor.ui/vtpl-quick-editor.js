/**
 * di.console.editor.ui.VTplQuickEditor
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
    var VTPL_QUICK_EDITOR_COND;
        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        VTPL_QUICK_EDITOR_COND = di.console.editor.ui.VTplQuickEditorCond;
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
    var VTPL_QUICK_EDITOR = $namespace().VTplQuickEditor = 
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
    var VTPL_QUICK_EDITOR_CLASS = VTPL_QUICK_EDITOR.prototype;
    
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
        // TODO 需要后台支持
        '<div class="vtpl-quick-snippet"></div>',
        '<div class="vtpl-quick-ep">',
            // 数据集设置
            '<div class="vtpl-quick-ep-ds">',
                '<div class="vtpl-quick-ep-ds-line1">请选择数据集：</div>',
                '<div class="vtpl-quick-ep-ds-line2">',
                    '<span>如果没有想要的数据集，请：</span>',
                    '<span class="q-btn-olap-table">创建多维透视表数据集</span>',
                    '<span class="q-btn-plane-table">创建平面表数据集</span>',
                    '<span class="q-btn-olap-chart">创建图数据集</span>',
                '</div>',
                '<div><span class="vtpl-quick-ep-ds-refresh">刷新</span></div>',
                '<div class="vtpl-quick-ep-ds-list"></div>',
            '</div>',
            // 条件设置
            '<div class="vtpl-quick-ep-cond">',
                '<div class="vtpl-quick-ep-cond-area"></div>',
            '</div>',
            // 权限设置
            '<div class="vtpl-quick-ep-auth">',
                '<div class="vtpl-quick-ep-auth-area"></div>',
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
        this._eSnippet = q('vtpl-quick-snippet', el)[0];
        this._eDS = q('vtpl-quick-ep-ds-list', this.getEl())[0];

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

        resetEditPhaseRadio.call(this);

        this._eps = {
            EP_DS: { el: q('vtpl-quick-ep-ds', el)[0] },
            EP_COND: { el: q('vtpl-quick-ep-cond', el)[0] },
            EP_AUTH: { el: q('vtpl-quick-ep-auth', el)[0] }
        };

        this._eCond = q('vtpl-quick-ep-cond-area', this.getEl())[0];

        // TODO
        // 临时使用简单的radio做编辑视图 （数据源＝》属性设定＝》交互动作设定）切换
        function resetEditPhaseRadio() {
            var ee = q('vtpl-quick-btn-phase', el)[0];
            var editPhases = ['EP_DS', 'EP_COND', 'EP_AUTH'];
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
                })(editPhases[i]);
            }
        }

        // DS面板中内容
        // FIXME
        // 刷新按钮后续去掉！！！！！！
        this._uRefreshBtn = ecuiCreate(
            UI_BUTTON,
            q('vtpl-quick-ep-ds-refresh', el)[0],
            null,
            { primary: 'ui-button-g' }
        );
        this._uOlapTableBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-olap-table', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._uOlapChartBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-olap-chart', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._uPlaneTableBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-plane-table', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
    }
    
    /**
     * 得到用于编辑的副本并刷新，被vtplPanelPage调用
     *
     * @public
     */
    VTPL_QUICK_EDITOR_CLASS.doRefreshFork = function (vtplFork) {
        var vtpl = this._vtplFork = vtplFork;

        this._uNameInput.setValue(vtpl.vtplName || '');

        if (vtpl.snippet.invalid) {
            alert('snippet格式校验失败，禁止编辑');
            this.disable();
            // FIXME
            // enable
            return;
        }

        this.$refreshPanelDS();
        this.$refreshPanelCond();
        this.$refreshPanelAuth();

        // 初始时展现layout面板
        !this._currEPKey && this.$changeEditPhase('EP_DS');
    }

    /**
     * 初始化
     *
     * @public
     */
    VTPL_QUICK_EDITOR_CLASS.init = function() {
        var vtplPanelPage = this._vtplPanelPage;

        this._uSaveBtn.onclick = bind(vtplPanelPage.doSave, vtplPanelPage, this);
        this._uNameInput.onchange = this.bindEditFn(new Function(), this);

        this._uRefreshBtn.onclick = bind(this.$refreshPanelDS, this)
        this._uOlapTableBtn.onclick = function () {
            vtplPanelPage.openCubeConfigPanel('RTPL_OLAP_TABLE');
        };
        this._uOlapChartBtn.onclick = function () {
            vtplPanelPage.openCubeConfigPanel('RTPL_OLAP_CHART');
        };
        this._uPlaneTableBtn.onclick = function () {
            vtplPanelPage.openCubeConfigPanel('RTPL_PLANE_TABLE');
        };

        // 打开数据集编辑页
        this._eDS.onclick = function (e) {
            var rid;
            var target = event.target || event.srcElement;
            if (target.tagName == 'INPUT') {
                // 这个input就是“编辑reportTemplate”
                var eSel = getParent(target).getElementsByTagName('SELECT')[0];
                var opt = SELECT.getSelected(eSel);
                var reportType = opt.reportTemplateType;

                if (opt.reportTemplateId == LANG.NO_SEL) {
                    // 此为请选择那行
                    return;
                }

                // FIXME
                if (reportType == 'RTPL_VIRTUAL') {
                    alert('此模板不可编辑');
                    return false;
                }
                vtplPanelPage.openTab({
                    editorType: reportType,
                    reportTemplateId: opt.reportTemplateId
                });
            }
        };

        // this._uSaveBtn.disable('SELF_START_EDIT');
    };

    /**
     * @override
     */
    VTPL_QUICK_EDITOR_CLASS.dispose = function() {
        this._eSnippet = null;
        this._eDS = null;
        this._eCond = null;
        this._eps = null;
        foreachDoOri(
            [
                this._uSaveBtn,
                this._uRefreshBtn,
                this._uOlapTableBtn,
                this._uOlapChartBtn,
                this._uPlaneTableBtn,
                this._uNameInput
            ],
            'dispose',
            true
        );
        VTPL_QUICK_EDITOR.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    VTPL_QUICK_EDITOR_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_QUICK_EDITOR_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_QUICK_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            foreachDoOri(
                [
                    this._uSaveBtn,
                    this._uRefreshBtn,
                    this._uPlaneTableBtn,
                    this._uOlapChartBtn,
                    this._uOlapTableBtn
                ],
                'enable',
                key
            );
            this.$enablePanelCond();
            VTPL_QUICK_EDITOR.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_QUICK_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            foreachDoOri(
                [
                    this._uSaveBtn,
                    this._uRefreshBtn,
                    this._uPlaneTableBtn,
                    this._uOlapChartBtn,
                    this._uOlapTableBtn
                ],
                'disable',
                key
            );
            this.$disablePanelCond();
        }
        VTPL_QUICK_EDITOR.superClass.disable.call(this);
    };

    /**
     * 列出数据源
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$refreshPanelDS = function() {
        this._mVTplModel.sync(
            {
                datasourceId: 'DS_LIST',
                preprocess: bind(this.disable, this, 'QUICK_EDIROT'),
                complete: bind(this.enable, this, 'QUICK_EDIROT'),
                result: bind(this.$renderDSList, this)
            }
        );
    };

    /**
     * 列出数据源
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$renderDSList = function() {
        dsList = this._mVTplModel.getReportTemplateList().slice();

        // 这个视图的内容目前比较件简单，就不做dispose了。

        var html = [];

        // 根据当前有的snippet，分别列出可选数据源
        var cmpts = this._vtplFork.findEntityByClzType('COMPONENT');
        for (var i = 0, cmpt, j, dso; cmpt = cmpts[i]; i ++) {
            // 检查是否需要为该组件选择数据源，如果不需要，则根本不用列出对应的选项
            if(cmpt['needDsSelect'] && cmpt['needDsSelect'] == 'true'){
                // 先什么都不做
            }else{
                html = layoutDsDiv(html,cmpt);    
            }
        }
        this._eDS.innerHTML = html.join('');

        // 绑定change事件
        // 从而一旦修改，能被vtplPanelPage察觉
        var sels = this._eDS.getElementsByTagName('SELECT');
        for (var k = 0, se; se = sels[k]; k ++) {
            se.onchange = this.bindEditFn(function (editor) {
                // reportTemplateId修改后即时存在vtplFork中
                var rid = this.getAttribute('data-cmpt-id');
                var entityDef = editor._vtplFork.findEntityById(rid);
                var opt = SELECT.getSelected(this);

                if (opt.reportTemplateId != LANG.NO_SEL) {
                    entityDef.reportTemplateId = opt.reportTemplateId;
                    entityDef.reportType = opt.reportTemplateType;
                }
                else {
                    entityDef.reportTemplateId = void 0;
                    entityDef.reportType = void 0;
                }
            }, null, this);
        }
    };

    // 拼接数据源选择的div块
    function layoutDsDiv (html,cmpt){
            html.push(
                '<div>',
                '<span>', encodeHTML(cmpt.id), '</span>&nbsp;&nbsp;&nbsp;&nbsp;'//,
            );

            // 为每个component，列出可以选择的reportTemplateId
            SELECT.create(html, {
                attr: { 'data-cmpt-id': encodeHTML(cmpt.id) },
                datasource: dsList,
                textAttr: function (o) { 
                    var rid = o['reportTemplateId'];
                    var rname = o['reportTemplateName'];
                    var showName ='';
                    if (rid == 'RTPL_VIRTUAL_ID') {
                        showName = 'RTPL_VIRTUAL_ID';
                    } else if(rid == '请选择'){
                        showName = '请选择';
                    } else {
                        if (rname == null){
                            showName ='未命名数据集' + '(' + rid + ')' ;
                        }else {
                            showName = rname + '(' + rid + ')' ;
                        }
                    }
                    return showName;
                },
                valueAttr: 'reportTemplateId',
                extraAttr: 'reportTemplateType',
                first: { reportTemplateId: LANG.NO_SEL},
                selected: function (item) {  
                    return item.reportTemplateId == cmpt.reportTemplateId
                        // 对与RTPL_VIRTUAL的特殊处理
                        // || (item.reportTemplateId == 'RTPL_VIRTUAL_ID' 
                        //     && cmpt.reportTemplateId == 
                        // ) 
                },
                filter: function (item) {
                    return DICT.hasReportTemplateType(
                        cmpt.clzKey,
                        item.reportTemplateType
                    )
                }
            });

            html.push(
                '<input type="button" value="编辑此数据集"/>'
            );
            html.push('</div>');
            return html;
    }

    /**
     * 开始编辑
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.doStartEdit = function() {
        // this._uSaveBtn.enable('SELF_START_EDIT');
    };

    /**
     * 保存，由vtpl panel page调用
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.doSave = function() {
        var sels = document.getElementsByTagName('SELECT', this._eDS);
        var i;
        var item;
        var errorMsg;
        var vtpl = this._vtplFork;

        for (i in this._condMap) {
            this._condMap[i].doSave();
        }

        this.$saveAuth();

        // 在这里清理rtplCond
        vtpl.condClean();

        // 报表名
        vtpl.vtplName = this._uNameInput.getValue();

        // stringify到vtpl的content中，才保存完成
        errorMsg = vtpl.contentStringify();

        // (!errorMsg || !errorMsg.length)
        //     && this._uSaveBtn.disable('SELF_START_EDIT');

        return {
            vtplFork: vtpl,
            errorMsg: errorMsg
        }
    };

    /**
     * 响应rtpl创建完成，被vtpl panel page调用
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.doCreated = function() {
        // 刷新选择项
        // if (this.$ch
        this.$refreshPanelDS();
    };

    /**
     * 检查是否ds都选择了
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$checkAllDSLinked = function() {
        var ok = true;
        this._vtplFork.forEachEntity(
            'COMPONENT',
            function (def) {
                if (!def.reportTemplateId) {
                    ok = false;
                }
            }
        );
        return ok;
    };

    /**
     * 改变editphase
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$changeEditPhase = function(epKey) {
        var currEPKey = this._currEPKey;

        if (currEPKey == 'EP_DS') {
            // 检查是否所有component都选中了reporttemplateid
            if (!this.$checkAllDSLinked()) {
                DIALOG.alert(LANG.NEED_DS_ALL_LINKED);
                return false;
            }
        }

        if (currEPKey == 'EP_AUTH') {
            this.$saveAuth();
        }

        if (!currEPKey || currEPKey != epKey) {
            for (var key in this._eps) {
                this._eps[key].el.style.display = key == epKey ? '' : 'none';
            }
            this._currEPKey = epKey;

            epKey == 'EP_COND' && this.$startCondPhase();
            epKey == 'EP_AUTH' && this.$refreshPanelAuth();
        }

        return true;
    };

    /**
     * 进入cond设置phase时必须先进此方法
     * 每次进入cond配置界面时，请求后台，更新vtpl.rtplCond的已选值
     * 现在只能想到，在这个时点与后台同步了，因为之前的时点，vtpl中引用的reportTemplateId都可能会变
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$startCondPhase = function() {
        /*
         * 此方法仅在点击【第二步 查询条件设定】时，才会触发。
         * 所以，可以在本方法中，删除_mVTplModel上的临时数据_oSecondConditionConfig。
         * 目的是：
         * 在没有点击第二步时，保存时使用_oSecondConditionConfig（则handler不会丢失）；
         * 而在点击第二步之后，使用系统原来的逻辑进行处理。
         */
        delete this._mVTplModel._oSecondConditionConfig;
        
        var me = this;
        var vtplFork = this._vtplFork;
        // 先禁用
        this.$disablePanelCond();
        this._mVTplModel.sync({
            datasourceId: 'EXIST_COND',
            args: {
                reportTemplateIdList: vtplFork.rtplIdGet(true),
                virtualTemplateId: vtplFork.vtplKey
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
                me.$enablePanelCond();
            },
            error: function (status, ejsonObj, options) {
                me.$disablePanelCond();
                alert('获取条件设置失败：status=' + status);
            }
        });
    };

    /**
     * 启用ep cond面板
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$enablePanelCond = function() {
        var condMap = this._condMap;
        for (var id in condMap) {
            condMap[id].enable('QUICK_EDITOR');
        }
    };

    /**
     * 启用ep cond面板
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$disablePanelCond = function() {
        var condMap = this._condMap;
        for (var id in condMap) {
            condMap[id].disable('QUICK_EDITOR');
        }
    };

    /**
     * 刷新ep cond面板
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$disposePanelCond = function() {
        var condMap = this._condMap;
        for (var id in condMap) {
            condMap[id].dispose();
        }
        this._condMap = {};
        this._eCond.innerHTML = '';
    };

    /**
     * 刷新ep cond面板
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$refreshPanelCond = function() {
        // 先进行dispose
        this.$disposePanelCond();
        
        var eCond = this._eCond;
        var el;
        var condMap = this._condMap;
        if (!condMap) {
            condMap = this._condMap = {};
        }

        // 然后渲染
        var opt = {
            vtplFork: this._vtplFork,
            bindEditFn: this.bindEditFn,
            vtplPanelPage: this._vtplPanelPage,
            vtplModel: this._mVTplModel,
            panelPageManager: this._mPanelPageManager
        };
        this._vtplFork.forEachEntity(
            'COMPONENT',
            function (def) {
                if (def.clzKey == 'DI_FORM') {
                    el = document.createElement('div');
                    eCond.appendChild(el);
                    condMap[def.id] = new VTPL_QUICK_EDITOR_COND(
                        extend({ el: el, def: def }, opt)
                    );
                }
            }
        );

        for (var id in this._condMap) {
            this._condMap[id].init();
        }
    };

    /**
     * 刷新ep auth面板
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$refreshPanelAuth = function() {
        var entityDefs = this._vtplFork.findEntityByClzType('VUI');
        var html = [];

        html.push('<div>');
        html.push('<span>如果没有功能权限控制需求，可忽略此步。</span>');
        this._vtplFork.forEachEntity(
            'VUI',
            function (def) {
                html.push(
                    '<div>',
                        '<span>控件“', encodeHTML(def.id), '”对应的权限关键字（funcAuth）为：</span>',
                        '<input type="input" data-def-id="', encodeHTML(def.id), '" value="', encodeHTML(def.funcAuth || ''), '" />',
                    '</div>'
                );
            }
        );
        html.push('</div>');

        this._eps['EP_AUTH'].el.innerHTML = html.join('');
    };

    /**
     * 保存权限设置变更
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$saveAuth = function() {
        var html = [];

        var els = this._eps['EP_AUTH'].el.getElementsByTagName('INPUT');
        for (var i = 0, e, id, def, val; e = els[i]; i ++) {
            if ((id = e.getAttribute('data-def-id'))
                && (def = this._vtplFork.findEntityById(id))
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

    /**
     * 严重错误处理
     * 
     * @protected
     */
    VTPL_QUICK_EDITOR_CLASS.$handleFatalError = function(status) {
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