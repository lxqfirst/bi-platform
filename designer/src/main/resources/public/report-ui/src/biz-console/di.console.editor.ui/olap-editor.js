/**
 * di.console.editor.ui.OlapEditor
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    多维分析报表编辑
 * @author:  sushuang(sushuang)
 * @depend:  ecui, xui, xutil
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
    var getUID = xutil.uid.getUID;
    var children = xutil.dom.children;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var foreachDoOri = UTIL.foreachDoOri;
    var stringifyParam = xutil.url.stringifyParam;
    var ecuiCreate = UTIL.ecuiCreate;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var textParam = xutil.url.textParam;
    var UI_BUTTON = ecui.ui.Button;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var META_CONDITION;
    var OLAP_EDITOR_MODEL;
    var DI_TABLE;
    var DI_CHART;
    var CHART_CONFIG_PANEL;
    var META_CANDIDATE_CONFIG_PANEL;
    var META_ROWHEAD_CONFIG_PANEL;
    var META_DIMSHOW_CONFIG_PANEL;
    var DEFAULT_DATA_FORMAT_CONFIG_PANEL;
    var DATA_FORMAT_CONFIG_PANEL;
    var CHART_CONFIG_PANEL;
    var UI_INPUT = ecui.ui.Input;
    var DI_FACTORY;

    var REPORT_DATA_MERGE_CONFIG_PANEL;

    var QUERY_PARAM_FIX_PANEL;


        
    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        META_CONDITION = di.shared.ui.MetaCondition;
        OLAP_EDITOR_MODEL = di.console.editor.model.OLAPEditorModel;
        META_CANDIDATE_CONFIG_PANEL = di.console.editor.ui.MetaCandidateConfigPanel;
        META_ROWHEAD_CONFIG_PANEL = di.console.editor.ui.MetaRowHeadConfigPanel;
        META_DIMSHOW_CONFIG_PANEL = di.console.editor.ui.MetaDimShowConfigPanel;
        CHART_CONFIG_PANEL = di.console.shared.ui.ChartConfigPanel;
        DI_TABLE = di.shared.ui.DITable;
        DI_CHART = di.shared.ui.DIChart;

        DATA_FORMAT_CONFIG_PANEL = di.console.editor.ui.DataFormatPanel;
        REPORT_DATA_MERGE_CONFIG_PANEL = di.console.editor.ui.ReportDataMergeConfigPanel;
        QUERY_PARAM_FIX_PANEL = di.console.editor.ui.QueryParamFix;
    });
    
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 多维分析报表编辑主类
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.reportType
     * @param {string} options.schemaName
     * @param {string} options.cubeTreeNodeName
     */
    var OLAP_EDITOR = $namespace().OLAPEditor = 
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                var css = 'olap-editor';
                addClass(el, css);
                el.innerHTML = template(
                    SNIPPET_MAIN, 
                    { css: css }
                );
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var OLAP_EDITOR_CLASS = OLAP_EDITOR.prototype;
    
    //------------------------------------------
    // 模板
    //------------------------------------------

    var SNIPPET_MAIN = [
        '<div class="#{css}-name">',
            '<span>数据集名：</span>',
            '<span></span>',
        '</div>',
        '<div class="#{css}-meta-condition q-di-meta-condition">',
        '</div>',
        '<div class="#{css}-data">',
            '<div class="#{css}-operation q-di-operation">',
            '</div>',
            '<div class="#{css}-data q-di-data">',
            '</div>',
        '</div>'
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    function createDIEntity(reportType, el, commonParamGetter) {
        // 图或者pivot表
        var dataOpt = {};
        var cmptEl = q('q-di-data', el)[0];
        var depict;

        if (reportType == 'RTPL_OLAP_TABLE') {
            createTable();
        }
        else if (reportType == 'RTPL_OLAP_CHART') {
            createChart();
        }

        return cmptCreate4Console(DI_FACTORY(), depict, commonParamGetter);

        // 创建图组件
        function createTable() {
            var cmptId = "snpt-CONSOLE.cpnt-CONSOLE-table-" + getUID();
            var vuiBreadcrumbId = "snpt-CONSOLE.vu-CONSOLE-breadcrumb-" + getUID();
            var vuiTableId = "snpt-CONSOLE.vu-CONSOLE-table-" + getUID();
            
            cmptEl.innerHTML = [
                '<div class="q-di-table-area di-table-area">',
                    '<div class="q-di-breadcrumb"></div>',
                    '<div class="q-di-table pivot-table"></div>',
                '</div>'
            ].join('');
            var chDom = children(cmptEl.firstChild);

            depict = [
                {
                    "id": cmptId,
                    "clzType": "COMPONENT",
                    "clzKey": "DI_TABLE",
                    "el": cmptEl,
                    "vuiRef": {
                        "mainTable": vuiTableId,
                        "breadcrumb": vuiBreadcrumbId
                    }
                },
                { 
                    "id": vuiBreadcrumbId,
                    "clzType": "VUI",
                    "clzKey": "BREADCRUMB",
                    "el": chDom[0],
                    "dataOpt": {
                        "maxShow": 6
                    }
                },
                { 
                    "id": vuiTableId, 
                    "clzType": "VUI",
                    "clzKey": "OLAP_TABLE",
                    "el": chDom[1],
                    "dataOpt": {
                        "rowHCellCut": 30,
                        "hCellCut": 30,
                        "cCellCut": 30,
                        "vScroll": true,
                        "rowCheckMode": "CHECK"
                    }
                }
            ]
        }

        // 创建PIVOT表组件
        function createChart() {
            var cmptId = "snpt-CONSOLE.cpnt-CONSOLE-chart-" + getUID();
            var vuiChartId = "snpt-CONSOLE.vu-CONSOLE-chart-" + getUID();
            
            cmptEl.innerHTML = '<div class="q-di-chart"></div>';
            depict = [
                {
                    "id": cmptId,
                    "clzType": "COMPONENT",
                    "clzKey": "DI_CHART",
                    "el": cmptEl,
                    "vuiRef": {
                        "mainChart": vuiChartId
                    }
                },
                { 
                    "id": vuiChartId, 
                    "clzType": "VUI",
                    "clzKey": "H_CHART",
                    "el": cmptEl.firstChild,
                    "dataOpt": {
                        "height": 300,
                        "legend": { "xMode": "pl" }
                    }
                }
            ]
        }
    }

    /**
     * 创建Model
     *
     * @private
     */
    function createModel(el, options) {
        /**
         * 类型，TABLE 或者 CHART
         *
         * @type {string}
         * @private
         */
        this._sReportType = options.reportType || 'RTPL_OLAP_TABLE';

        this._mOLAPEditorModel = new OLAP_EDITOR_MODEL(
            {
                reportType: this._sReportType,
                schemaName: options.schemaName,
                cubeTreeNodeName: options.cubeTreeNodeName,
                reportTemplateId: options.reportTemplateId
            }
        );

        this._sStatus = options.reportTemplateId ? 'EXIST' : 'NEW';
    };
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        var commonParamGetter = this._mOLAPEditorModel.getCommonParamGetter();

        this._uNameInput = ecuiCreate(
            UI_INPUT, 
            q('olap-editor-name', el)[0].lastChild
        );

        // 元数据
        this._uMetaCondition = new META_CONDITION(
            {
                el: q('q-di-meta-condition', el)[0],
                reportType: this._sReportType,
                commonParamGetter: commonParamGetter
            }
        );
        this._mMetaConditionModel = this._uMetaCondition.getModel();

        //数据格式设置面板
        this._uDefaultDataPanel = new DATA_FORMAT_CONFIG_PANEL(
            {
                parent : this,
                model : this._mMetaConditionModel,
                cssName : 'default-data-format',
                panelTitle : '数据格式设置'
            }
        );

        // 候选设置面板
        this._uCandidatePanel = new META_CANDIDATE_CONFIG_PANEL(
            { 
                parent: this,
                model: this._mMetaConditionModel,
                cssName: 'meta-candidate',
                panelTitle: '候选项设置'
            }
        );

        //查询参数设置面板
        this._uExtendParamPanel = new QUERY_PARAM_FIX_PANEL(
            {
                parent: this,
                model: this._mMetaConditionModel,
                cssName: 'query-extend-param',
                panelTitle: '查询参数设置'
            }
        );

        if (!useChartCfg) {
            // 表头属性面板
            this._uRowHeadPanel = new META_ROWHEAD_CONFIG_PANEL(
                { 
                    parent: this,
                    model: this._mMetaConditionModel,
                    cssName: 'meta-candidate',
                    panelTitle: '行表头属性'
                }
            );
        }

        // 维度展示属性面板
        this._uDimShowPanel = new META_DIMSHOW_CONFIG_PANEL(
            { 
                parent: this,
                model: this._mMetaConditionModel,
                cssName: 'meta-candidate',
                panelTitle: '行（轴）维度展示属性'
            }
        );

        var useChartCfg = this._sReportType == 'RTPL_OLAP_CHART';
        // 图设置面板
        if (useChartCfg) {
            this._uChartCfgPanel = new CHART_CONFIG_PANEL(
                { 
                    parent: this,
                    model: this._mMetaConditionModel,
                    cssName: 'meta-chart-cfg',
                    panelTitle: '图设置'
                }
            );
        }

        this._uDataMergePanel = new REPORT_DATA_MERGE_CONFIG_PANEL(
            {
                parent : this,
                model : this._mMetaConditionModel,
                cssName : 'report-data-merge-config',
                panelTitle : '报表数据合并设置'
            }
        );

        // 操作按钮
        this._uQueryBtn = createBtn('查询');
        this._uSaveBtn = createBtn('保存')
        this._uCandidateBtn = createBtn('候选项设置');
        if (useChartCfg) {
            this._uChartCfgBtn = createBtn('图设置');
        }
        if (!useChartCfg){
            this._uRowHeadCfgBtn = createBtn('行头下钻属性');
        }
        this._uDimShowCfgBtn = createBtn('行（轴）维度展示属性');

        this._uDefaultDataFormatBtn = createBtn('数据格式设置');

        this._uDataMergeBtn = createBtn('数据合并方式设置');

        // 图或者表
        this._uDIData = createDIEntity(this._sReportType, el, commonParamGetter);
        this._mDIDataModel = this._uDIData.getModel();

        function createBtn(text) {
            var opEl = q('q-di-operation', el)[0];
            var o = document.createElement('div');
            o.innerHTML = '<div class="ui-button-g ui-button">' + text + '</div>';
            opEl.appendChild(o.firstChild);
            return ecuiCreate(
                UI_BUTTON, 
                opEl.lastChild, 
                null, 
                { primary: 'ui-button-g' }
            );
        }
    };
    
    /**
     * 初始化
     *
     * @public
     */
    OLAP_EDITOR_CLASS.init = function() {

        // 事件绑定
        this._mOLAPEditorModel.attach(
            ['sync.preprocess.INIT', this.disable, this, 'OLAP_EDIROT'],
            ['sync.complete.INIT', this.enable, this, 'OLAP_EDIROT'],
            ['sync.result.INIT', this.$handleInit, this]
        );
        this._mMetaConditionModel.attach(
            ['sync.preprocess.META_DATA', this.disable, this, 'OLAP_EDIROT'],
            ['sync.complete.META_DATA', this.enable, this, 'OLAP_EDIROT'],
            ['sync.error.META_DATA', this.$handleFatalError, this]
        );
        this._mOLAPEditorModel.attach(
            ['sync.preprocess.SAVE', this.disable, this, 'OLAP_EDIROT'],
            ['sync.complete.SAVE', this.enable, this, 'OLAP_EDIROT'],
            ['sync.result.SAVE', this.$handleSaved, this, 'OLAP_EDIROT']
        );

        // 操作按钮
        this._uQueryBtn.onclick = bind(this.$handleQuery, this);
        this._uSaveBtn.onclick = bind(this.$handleSave, this);
        this._uCandidateBtn.onclick = bind(this.$handleCandidateConf, this);
        // 当创建的不是多维表格的时候，需要加判断来决定是否初始化_uRowHeadCfgBtn的按钮，否则会报错，
        //  add by majun   2013-9-22 
        var useChartCfg = this._sReportType == 'RTPL_OLAP_CHART';
        if (!useChartCfg){
            this._uRowHeadCfgBtn.onclick = bind(this.$handleRowHeadConf, this);
        }
        this._uDimShowCfgBtn.onclick = bind(this.$handleDimShowConf, this);
        this._uChartCfgBtn 
            && (this._uChartCfgBtn.onclick = bind(this.$handleChartCfg, this));

        //绑定设置默认数据格式按钮的onclick事件
        this._uDefaultDataFormatBtn.onclick = bind(this.$handleSetDefaultDataFormat,this);
        //数据合并方式设置按钮点击事件
        this._uDataMergeBtn.onclick = bind(this.$hadleDataMergeSet,this);

        // 暂用策略：查询返回前，禁止一切操作
        this._mDIDataModel.attach(
            ['sync.preprocess.DATA', this.disable, this, 'OLAP_EDIROT'],
            ['sync.complete.DATA', this.enable, this, 'OLAP_EDIROT']
        );

        this._uCandidatePanel && this._uCandidatePanel.init();
        this._uChartCfgPanel && this._uChartCfgPanel.init();
        this._uRowHeadPanel && this._uRowHeadPanel.init();
        this._uDimShowPanel && this._uDimShowPanel.init();

        this._uDefaultDataPanel && this._uDefaultDataPanel.init();
        this._uDataMergePanel && this._uDataMergePanel.init();
        this._uExtendParamPanel && this._uExtendParamPanel.init();

        // init
        this._uMetaCondition.init();
        this._uDIData.init();

        // 初始报表
        this._mOLAPEditorModel.sync(
            { datasourceId: 'INIT' }
        );
    };



    /**
     * @override
     */
    OLAP_EDITOR_CLASS.dispose = function() {
        foreachDoOri(
            [
                this._uNameInput,
                this._uMetaCondition,
                this._uCandidatePanel,
                this._uChartCfgPanel,
                this._uDefaultDataPanel,
                this._uDefaultDataFormatBtn,
                this._uDataMergeBtn,
                this._uDataMergePanel,
                this._uRowHeadPanel,
                this._uDimShowPanel,
                this._uRowHeadCfgBtn,
		        this._uDimShowCfgBtn,
                this._uExtendParamPanel
            ],
            'dispose'
        );
        this._uDIData && this._uDIData.$di('dispose');

        // TODO
        // FIXME
        // button dispose

        OLAP_EDITOR.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    OLAP_EDITOR_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    OLAP_EDITOR_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    OLAP_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            foreachDoOri(
                [
                    this._uDIData,
                    this._uQueryBtn,
                    this._uSaveBtn,
                    this._uCandidateBtn,
                    this._uMetaCondition,
                    this._uChartCfgBtn,
                    this._uRowHeadCfgBtn,
                    this._uDimShowCfgBtn,
                    this._uDataMergeBtn,
                    this._uDefaultDataFormatBtn
                ],
                'enable',
                key
            );
            OLAP_EDITOR.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    OLAP_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            foreachDoOri(
                [
                    this._uDIData,
                    this._uQueryBtn,
                    this._uSaveBtn,
                    this._uCandidateBtn,
                    this._uMetaCondition,
                    this._uChartCfgBtn,
                    this._uRowHeadCfgBtn,
                    this._uDimShowCfgBtn,
                    this._uDefaultDataPanel,
                    this._uDataMergePanel,
                    this._uDataMergeBtn,
                    this._uDefaultDataFormatBtn
                ],
                'disable',
                key
            );
        }
        OLAP_EDITOR.superClass.disable.call(this);
    };    

    /**
     * 初始化
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleInit = function(data) {
        this._uNameInput.setValue(data.reportTemplateName || '');
        // 初始化元数据
        this._uMetaCondition.sync();
    };

    /**
     * 严重错误处理
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleFatalError = function(status) {
        this.disable();
        // 参数校验失败
        if (status == 1001) {
            DIALOG.alert(LANG.SAD_FACE + LANG.PARAM_ERROR);
        }
        else {
            DIALOG.alert(LANG.SAD_FACE + LANG.FATAL_DATA_ERROR);
        }
    };

    /**
     * 查询请求
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleQuery = function() {
        //cmptSync4Console(DI_FACTORY(), this._uDIData);
        this._uExtendParamPanel.open('EDIT',{data:this._uDIData});
    };

    /**
     * 保存
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleSave = function() {
        var name = this._uNameInput.getValue();

        this._mOLAPEditorModel.sync(
            { 
                datasourceId: 'SAVE',
                args: { reportTemplateName: name }
            }
        );
    };

    /**
     * 候选项设置
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleCandidateConf = function() {
        this._uCandidatePanel.open('EDIT');
    };

    /**
     * 表头属性
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleRowHeadConf = function() {
        this._uRowHeadPanel.open('EDIT');
    };

    /**
     * 维度展示属性
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleDimShowConf = function() {
        this._uDimShowPanel.open('EDIT');
    };

    /**
     * 图设置
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleChartCfg = function() {
        this._uChartCfgPanel.open('EDIT');
    };

    /**
     * 保存完毕
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleSaved = function(data, ejsonObj, options) {
        if (this._sStatus == 'NEW') {
            this.notify('rtpl.created');
        }
        this._sStatus = 'EXIST';
        this.notify('rtpl.saved');
    };

    /**
     * 默认数据格式设置
     * 
     * @protected
     */
    OLAP_EDITOR_CLASS.$handleSetDefaultDataFormat = function(){
        this._uDefaultDataPanel.open('EDIT');
    }

    OLAP_EDITOR_CLASS.$hadleDataMergeSet = function(){
        this._uDataMergePanel.open('EDIT');
    }

})();