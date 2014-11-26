/**
 * di.console.editor.ui.ColConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    olap的列属性设置
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
    var AJAX = di.config.Ajax;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var textSubstr = xutil.string.textSubstr;
    var encodeHTML = xutil.string.encodeHTML;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var htmlText = xutil.string.htmlText;
    var stringifyParam = xutil.url.stringifyParam;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var ecuiCreate = UTIL.ecuiCreate;
    var $fastCreate = ecui.$fastCreate;
    var isString = xutil.lang.isString;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var strToBoolean = UTIL.strToBoolean;
    var UI_CONTROL = ecui.ui.Control;
    var alert = di.helper.Dialog.alert;
    var UI_BUTTON = ecui.ui.Button;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var DI_FACTORY;
    var COMMON_PARAM_FACTORY;

    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
    });

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * olap的列属性设置
     *
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var COL_CONFIG_PANEL = $namespace().ColConfigPanel =
        inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this._mModel = options.model;
                this._mDITableModel = options.diTableModel;
                this.DATASOURCE_ID_MAPPING = {
                    // INIT: 'GET_COND'
                    // SUBMIT: ''
                };
            }
        );
    var COL_CONFIG_PANEL_CLASS = COL_CONFIG_PANEL.prototype;

    var CUT_NUMBER = 30;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    COL_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
        // 需要unbind？
    };

    /** 
     * @override
     */
    COL_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
        // 这些参数都应该在open时传入，因为每次open时有可能不一样
        
        this._reportTemplateId = options.reportTemplateId;
    };

    /** 
     * @override
     */
    COL_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        // 首先dispose
        contentEl.innerHTML = ''
        
        var css = 'cond-config-panel';
        var tableData = (this._mDITableModel.getData() || {}).tableData || {};
        var colFields = tableData.colFields || [];
        var colDefine = tableData.colDefine || [];
        var i;
        var j;
        var line;
        var wrap;
        var leftLock = 1;

        var html = [];
        html.push('<table cellpadding="0" cellspacing="0" width="100%" class="', css, '-table ', 'ui-table"><thead>');

        // render head
        for (i = 0; line = colFields[i]; i ++) {
            html.push('<tr>');

            // 最左提示行
            html.push('<th>&nbsp;</th>');

            for (j = 0; j < line.length; j ++) {
                if (isPlaceholder(wrap = line[j])) {
                    continue;
                }
                this.$renderHCell(
                    html,
                    // 目前只有最底层才传colField
                    i == colFields.length - 1 ? colDefine[j] : null,
                    wrap,
                    j,
                    i
                );
            }
            html.push('</tr>');
        }

        html.push('</thead><tbody>');

        // render body

        html.push('</tbody></table>');

        contentEl.innerHTML = html.join('');



        var entityId = this._entityId;
        var isCreate = this._isCreate;
        var vtpl = this._vtplFork;
        var entityDef = !isCreate
            ? this._vtplFork.findEntityById(entityId)
            : {
                id: entityId,
                clzType: 'VUI'
            };
        var candidateCond = (data.templateDims || {})[this._tplKey] || [];
        var rtplCond = vtpl.condGet(this._tplKey, entityDef.name) || {};
        var html = [];
        var contentEl = this.getContentEl();
        var condEl = this._condEl;

        html.push('<div>');
        html.push('<span>选择控件：</span>');
        makeClzKeySel(html);
        html.push('<span>选择所对应的后台参数名：</span>');
        makeParamNameSel(html);
        html.push('<span>选择所对应的维度层级：</span>');
        makeLevelSel(html);
        html.push('</div>');

        html.push('<div>');
        // 这几个暂用文本输入
        html.push(
            '<span title="可不填">fetchURL: </span>',
            '<input class="', css + '-fetch-url" value="', 
                rtplCond.fetchURL || '','" />'
        );
        html.push(
            '<span title="可不填">默认值: </span>',
            '<input class="', css + '-default-value" value="', 
                rtplCond.defaultValue || '','" />'
        );
        makeRequiredSelect(html);
        makeHandlerSelect(html);
        html.push('</div>');

        contentEl.innerHTML = html.join('');

        // 挂this上是为了和dom循环引用时好清理
        this._clzKeySel = q(css + '-clz-key-sel', contentEl)[0];
        this._handlerSel = q(css + '-handler-sel', contentEl)[0];
        this._paramNameSel = q(css + '-param-name-sel', contentEl)[0];
        this._levelSel = q(css + '-level-sel', contentEl)[0];

        // 绑定联动
        var clzKeyChange = bind(
            function (rtplCond, DICT) {
                var cSel = this._clzKeySel;
                var hSel = this._handlerSel;
                var clzKey = (cSel.options[cSel.selectedIndex] || {}).value;
                // 只有有多个arghandler时，才显示，否则隐藏而且取默认值
                var handlers = clzKey
                    ? DICT.findClzDef(clzKey, 'VUI').rtplParamHandler
                    : [];
                var htm = [];
                for (var i = 0, h, sel; h = handlers[i]; i ++) {
                    sel = h == rtplCond.handler ? ' selected="selected" ' : ''
                    htm.push(
                        '<option value="', h, '" ', sel, '>', h, '</option>'
                    );
                }
                hSel.innerHTML = htm.join('');
            }, 
            this, 
            rtplCond,
            DICT
        );
        this._clzKeySel.onchange = clzKeyChange;

        // 绑定联动
        var paramNameChange = bind(
            function (rtplCond, DICT) {
                var pSel = this._paramNameSel;
                var lSel = this._levelSel;
                var paramName = (pSel.options[pSel.selectedIndex] || {}).value;
                var htm = [];
                for (var i = 0, o, sel; o = candidateCond[i]; i ++) {
                    if (o.name == paramName && o.levels && o.levels.length) {
                        for (var j = 0; j < o.levels.length; j ++) {
                            var l = o.levels[j];
                            sel = l == rtplCond.level ? ' selected="selected" ' : '';
                            htm.push(
                                '<option value="', l, '" ', sel, '>', l, '</option>'
                            );
                        }
                    }
                }
                lSel.innerHTML = htm.join('');
            }, 
            this, 
            rtplCond,
            DICT
        );
        this._paramNameSel.onchange = paramNameChange;

        // 初始执行
        clzKeyChange();
        paramNameChange();

        return;

        // clzKey sel
        function makeClzKeySel(html) {
            var formDef = DICT.findClzDef('DI_FORM', 'COMPONENT');

            html.push('<select class="', css, '-clz-key-sel">');
            for (
                var i = 0, clzKey, sel, vuiDef;
                clzKey = formDef.vuiRefCandidate.input[i];
                i ++
            ) {
                vuiDef = DICT.findClzDef(clzKey, 'VUI');
                if (vuiDef.editorDisable) {
                    continue;
                }
                
                // 回填当前已经选择的
                sel = entityDef.clzKey == clzKey
                    ? sel = ' selected="selected" ' : ' ';
                html.push('<option value="', clzKey, '" ', sel, '>', vuiDef.caption, '</option>')
            }
            html.push('</select>');
        }

        // param name sel，param name是后台的schema中的维度名
        function makeParamNameSel(html) {
            html.push('<select class="', css, '-param-name-sel">');
            for (var i = 0, o, sel; o = candidateCond[i]; i ++) {
                // 回填当前已经选择的
                sel = entityDef.name == o.name 
                    ? sel = ' selected="selected" ' : ' ';
                html.push('<option value="', o.name, '" ', sel, '>', o.caption, '（', o.name, '）</option>')
            }
            html.push('</select>');
        }

        function makeLevelSel(html) {
            // handler是和paramNameSel联动的，联动时再填值
            html.push(
                '<select class="', css, '-level-sel">',
                '</select>'
            );
        }

        function makeRequiredSelect(html) {
            html.push('<span>是否设为必传条件：</span>');
            var sel = { 'true': '', 'false': '' };
            // 回填当前已经选择的
            sel[String(!!rtplCond.required)] = ' selected="selected" ';
            html.push(
                '<select class="', css, '-required-sel">',
                    '<option value="true" ', sel['true'], '>是</option>',
                    '<option value="false" ', sel['false'], '>否</option>',
                '</select>'
            );
        }

        function makeHandlerSelect(html) {
            // handler是和clzKeySel联动的，联动时再填值
            html.push(
                '<select class="', css, '-handler-sel">',
                '</select>'
            );
        }
    };

    /**
     * 渲染上方表头节点
     *
     * @protected
     */
    COL_CONFIG_PANEL_CLASS.$renderHCell = function(
        // 只有最底层有colField
        html, colDefItem, wrap, x, y
    ) {
        var type = this.getType();
        var classStr = [type + '-hcell'];
        var styleStr = [];
        var attrStr = [];
        var span = [];
        var innerStr;

        wrap = objWrap(wrap);

        span.push(wrap.colspan ? ' colspan="' + wrap.colspan + '" ' : '');
        span.push(wrap.rowspan ? ' rowspan="' + wrap.rowspan + '" ' : '');

        if (colDefItem && colDefItem.width) {
            styleStr.push('width:' + colDefItem.width + 'px;');
        }
        attrStr.push('data-cell-pos="' + x + '-' + y + '"');
        innerStr = this.$renderCellInner(
            'HCELL', null, wrap, attrStr, classStr, styleStr
        );
        html.push(
            '<th ', 
                span.join(' '), ' ',
                attrStr.join(' '), ' ',
                ' class="', classStr.join(' '), 
                '" style="', styleStr.join(' '), 
            '">', 
                innerStr, 
            '</th>'
        );
    }; 

    /**
     * 节点内部结构
     *
     * @private
     * @param {string} cellType 为'ROWHCELL', 'HCELL', 'CCELL'
     * @param {Object=} defItem 列定义
     * @param {Object} wrap 节点数据
     * @param {Array} attrStr 父节点属性集合
     * @param {Array} classStr 父节点css class集合
     * @param {Array} styleStr 父节点css style集合
     * @return {string} 节点内部html
     */
    COL_CONFIG_PANEL_CLASS.$renderCellInner = function(
        cellType, defItem, wrap, attrStr, classStr, styleStr
    ) {
        var indentStyle = '';
        var clz = '';
        var type = this.getType();
        var value = getWrapValue(cellType, wrap);
        var prompt = value.prompt;
        value = value.value;

        if (prompt) {
            attrStr.push('title="' + prompt + '"');
        }
        return value;
    };

    /** 
     * @override
     */
    COL_CONFIG_PANEL_CLASS.$doGetInitArgs = function() {
        if (this._reportType == 'RTPL_VIRTUAL') {
            return {
                virtualTemplateId: 'RTPL_VIRTUAL_ID',
                reportTemplateIdList: this._vtplFork.rtplIdGet(true) 
            };
        }
        else {
            return {
                reportTemplateIdList: [this._tplKey]
            };
        }
    };

    /** 
     * @override
     */
    COL_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var css = 'cond-config-panel';
        var cpntId = this._cpntId;
        var entityId = this._entityId;
        var vtpl = this._vtplFork;
        var tplKey = this._tplKey;
        var isCreate = this._isCreate;
        var mainEl = this.getEl();
        var el;

        // 即时向vtplFork.rtplCond中保存
        el = q(css + '-param-name-sel', mainEl)[0];
        var name = (el.options[el.selectedIndex] || {}).value;
        el = q(css + '-clz-key-sel', mainEl)[0];
        var clzKey = (el.options[el.selectedIndex] || {}).value;
        var fetchURL = q(css + '-fetch-url', mainEl)[0].value;
        var defaultValue = q(css + '-default-value', mainEl)[0].value;
        el = q(css + '-required-sel', mainEl)[0];
        var required = strToBoolean((el.options[el.selectedIndex] || {}).value);
        el = q(css + '-handler-sel', mainEl)[0];
        var handler = (el.options[el.selectedIndex] || {}).value
        el = q(css + '-level-sel', mainEl)[0];
        var level = (el.options[el.selectedIndex] || {}).value

        // 不判断了，为调试方便
        // if (isCreate && vtpl.condGet(this._tplKey, name)) {
        //     return '参数名重复（' + entityDef.name + '），请重新选择';
        // }

        // 写入entityDef
        var entityDef;
        if (isCreate) {
            // 新建entityDef
            vtpl.addEntityDef(entityDef = { id: entityId, clzType: 'VUI' } );
            // 同时向DI_FORM中添加VUI引用
            vtpl.addVUIRef(cpntId, entityId);
        }
        else {
            entityDef = vtpl.findEntityById(entityId);
        }
        entityDef.name = name;
        entityDef.clzKey = clzKey;      

        // 写入rtplCond
        var rtplCond;
        if (name && !(rtplCond = vtpl.condGet(tplKey, name))) {
            vtpl.condAdd(tplKey, rtplCond = {});
        }
        if (rtplCond) {
            rtplCond.name = name;
            rtplCond.fetchURL = fetchURL;
            rtplCond.defaultValue = defaultValue;
            rtplCond.required = required;
            rtplCond.handler = handler;
            rtplCond.level = level;
        }

        // hide属性只纪录在el的style中
        return {
            // 目前只有这种控件是隐藏的
            hide: entityDef.clzKey == 'HIDDEN_INPUT'
        }
    };

    COL_CONFIG_PANEL_CLASS.getType = function() {
        return 'ui-table';
    };    

    /**
     * 得到格式化的值
     *
     * @private
     * @param {string} cellType 为'ROWHCELL', 'HCELL', 'CCELL'
     * @param {Object} wrap 数据元素
     * @return {Object} value和prompt
     */
    function getWrapValue(cellType, wrap) {
        var value = String(wrap.v == null ? ' - ' : wrap.v);
        var prompt = value;
        value = textSubstr(value, 0, CUT_NUMBER);
        if (value.length < prompt.length) {
            value += '...';
        }
        else {
            prompt = null;
        }
        return { 
            value: encodeHTML(value), 
            prompt: prompt && encodeHTML(prompt) 
        };
    }

    /**
     * 如果wrap不是对象，包装成对象
     *
     * @private 
     * @param {*} wrap 数据元素
     */
    function objWrap(wrap) {
        if (wrap !== Object(wrap)) {
            wrap = { v: wrap };
        }
        return wrap;
    }    

    /**
     * 判断是否placeholder（空对象为placeholder）
     */
    function isPlaceholder(o) {
        if (o !== Object(o)) {
            return false;
        }
        for (var i in o) {
            return false;
        }
        return true;
    }

    function fmtInput(value) {
        if (value == null) {
            return '';
        }
        return trim(String(value));
    }

})();