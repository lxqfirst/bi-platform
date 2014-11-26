/**
 * di.console.editor.ui.VTplSoQuickEditorDS
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    负责vtplSoQuickEditor的数据集选取的逻辑
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
    var baiduOn = baidu.on;
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
     * vtpl快速编辑：数据集选取的逻辑
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var VTPL_SO_QUICK_EDITOR_DS = $namespace().VTplSoQuickEditorDS = 
        inheritsObject(XVIEW, constructor);
    var VTPL_SO_QUICK_EDITOR_DS_CLASS = VTPL_SO_QUICK_EDITOR_DS.prototype;
    
    var HTML_MAIN = [
        // 数据集设置
        '<div class="vtpl-quick-ep-ds-line1">请选择数据集：</div>',
        '<div class="vtpl-quick-ep-ds-line2">',
            '<span>如果没有想要的数据集，请：</span>',
            '<span class="q-btn-olap-table">创建多维透视表数据集</span>',
            '<span class="q-btn-plane-table">创建平面表数据集</span>',
            '<span class="q-btn-olap-chart">创建图数据集</span>',
        '</div>',
        '<div><span class="vtpl-quick-ep-ds-refresh">刷新</span></div>',
        '<div class="vtpl-quick-ep-ds-list"></div>',
    ].join('');

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
        var editor = this._editor = options.editor;
        var vtplPanelPage = editor._vtplPanelPage;

        var el = this._el = options.el;
        el.innerHTML = HTML_MAIN;
        this._eDS = q('vtpl-quick-ep-ds-list', el)[0];

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

        this._uRefreshBtn.onclick = bind(this.refreshPanelDS, this)
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
        // FIXME
        // 打开编辑页面
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
    }

    /**
     * @override
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.dispose = function() {
        this._eDS = null;
        foreachDoOri(
            [
                this._uRefreshBtn,
                this._uOlapTableBtn,
                this._uOlapChartBtn,
                this._uPlaneTableBtn
            ],
            'dispose',
            true
        );
        VTPL_SO_QUICK_EDITOR_DS.superClass.dispose.call(this);
    };

    /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) == 0 && this._bDisabled) {
            foreachDoOri(
                [
                    this._uRefreshBtn,
                    this._uPlaneTableBtn,
                    this._uOlapChartBtn,
                    this._uOlapTableBtn
                ],
                'enable',
                key
            );
            VTPL_SO_QUICK_EDITOR_DS.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            foreachDoOri(
                [
                    this._uRefreshBtn,
                    this._uPlaneTableBtn,
                    this._uOlapChartBtn,
                    this._uOlapTableBtn
                ],
                'disable',
                key
            );
        }
        VTPL_SO_QUICK_EDITOR_DS.superClass.disable.call(this);
    };

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.active = function () {
        return this._el.style.display = '';
        // ...
    };    

    /**
     * @public
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.inactive = function () {
        return this._el.style.display = 'none';
        // ...
    };    

    /**
     * 列出数据源
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.refreshPanelDS = function() {
        this._editor._mVTplModel.sync(
            {
                datasourceId: 'DS_LIST',
                // FIXME
                // 检查是不是还要disable editor
                preprocess: bind(this.disable, this, 'QUICK_EDIROT_DS'),
                complete: bind(this.enable, this, 'QUICK_EDIROT_DS'),
                result: bind(this.$renderDSList, this)
            }
        );
    };

    /**
     * 列出数据源
     * 
     * @protected
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.$renderDSList = function() {
        var editor = this._editor;
        dsList = editor._mVTplModel.getReportTemplateList().slice();

        // 这个视图的内容目前比较件简单，就不做dispose了。

        var html = [];

        // 根据当前有的snippet，分别列出可选数据源
        var cmpts = editor._vtplFork.findEntityByClzType('COMPONENT');
        for (var i = 0, cpnt, j, dso; cpnt = cmpts[i]; i ++) {
            html.push(
                '<div class="vtpl-quick-ep-ds-item" data-cpnt-id="', cpnt.id, '">',
                '<span>', encodeHTML(cpnt.id), '</span>&nbsp;&nbsp;&nbsp;&nbsp;'//,
            );

            // 为每个component，列出可以选择的reportTemplateId
            SELECT.create(html, {
                attr: { 'data-cpnt-id': encodeHTML(cpnt.id) },
                datasource: dsList,
                textAttr: 'reportTemplateId',
                valueAttr: 'reportTemplateId',
                extraAttr: 'reportTemplateType',
                first: { reportTemplateId: LANG.NO_SEL},
                selected: function (item) {  
                    return item.reportTemplateId == cpnt.reportTemplateId
                        // 对与RTPL_VIRTUAL的特殊处理
                        // || (item.reportTemplateId == 'RTPL_VIRTUAL_ID' 
                        //     && cpnt.reportTemplateId == 
                        // ) 
                },
                filter: function (item) {
                    return DICT.hasReportTemplateType(
                        cpnt.clzKey,
                        item.reportTemplateType
                    )
                }
            });

            html.push(
                '<input type="button" value="编辑此数据集"/>'
            );
            html.push('</div>');
        }
        this._eDS.innerHTML = html.join('');

        // 绑定hover
        this.$bindHover();

        // 绑定change事件
        // 从而一旦修改，能被vtplPanelPage察觉
        var sels = this._eDS.getElementsByTagName('SELECT');
        for (var k = 0, se; se = sels[k]; k ++) {
            se.onchange = editor.bindEditFn(function (editor) {
                // reportTemplateId修改后即时存在vtplFork中
                var rid = this.getAttribute('data-cpnt-id');
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
            }, null, editor);
        }
    };

    /**
     * 检查是否ds都选择了
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.checkAllDSLinked = function() {
        var ok = true;
        this._editor._vtplFork.forEachEntity(
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
     * 高亮数据源选择项
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.$bindHover = function() {
        var layout = this._editor._layout;
        var items = q('vtpl-quick-ep-ds-item', this._el);
        for (var i = 0, item; item = items[i]; i ++) {
            baiduOn(
                item,
                'mouseenter',
                function (e) {
                    addClass(e.target, 'vtpl-quick-ep-ds-item-hover');
                    layout && layout.highlightCPNT(
                        this.getAttribute('data-cpnt-id'), 
                        true
                    );
                    // e.stopPropagation();
                }
            );
            baiduOn(
                item, 
                'mouseleave', 
                function (e) {
                    removeClass(e.target, 'vtpl-quick-ep-ds-item-hover');
                    layout && layout.highlightCPNT(
                        this.getAttribute('data-cpnt-id'), 
                        false
                    );
                    // e.stopPropagation();
                }
            );
        }
    };

    /**
     * 高亮数据源选择项
     * 
     * @public
     */
    VTPL_SO_QUICK_EDITOR_DS_CLASS.highlight = function(cpntId, willHighlight) {
        // 清除全部highlight
        var items = q('vtpl-quick-ep-ds-item', this._el);
        for (var i = 0, item; item = items[i]; i ++) {
            removeClass(item, 'vtpl-quick-ep-ds-item-hover');

            // 增加highlight
            if (cpntId && willHighlight
                && item.getAttribute('data-cpnt-id') == cpntId
            ) {
                addClass(item, 'vtpl-quick-ep-ds-item-hover');
            }
        }
    };

})();