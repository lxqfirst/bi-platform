/**
 * di.console.editor.ui.CondConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    condition config
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
    var AJAX = di.config.Ajax;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var encodeHTML = xutil.string.encodeHTML;
    var jsonParse = baidu.json.parse;
    var jsonStringify = baidu.json.stringify;
    var jsonFormat = jsl.format.formatJson;
    var jsonValidate = jsl.parser.parse;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var isArray = xutil.lang.isArray;
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
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var COND_CONFIG_PANEL = $namespace().CondConfigPanel =
        inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this.DATASOURCE_ID_MAPPING = {
                    INIT: 'GET_COND'
                };
            }
        );
    var COND_CONFIG_PANEL_CLASS = COND_CONFIG_PANEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    COND_CONFIG_PANEL_CLASS.$doDispose = function() {
        this._vtplFork = null;
        this._condEl = null;
        this._optSetEl = null;
        this._clzKeySel = null;
        this._handlerSel = null;
        this._paramNameSel = null;
        this._levelSel = null;
        this.getContentEl().innerHTML = '';
        // FIXME
        // 需要unbind？
    };

    /** 
     * @override
     */
    COND_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
        // 这些参数都应该在open时传入，因为每次open时有可能不一样
        this._cpntId = options.cpntId;
        this._entityId = options.entityId;
        this._reportType = options.reportType;
        this._reportTemplateId = options.reportTemplateId;
        this._vtplFork = options.vtplFork;
        this._isCreate = options.isCreate;
        this._condEl = options.condEl;

        // 要么是RTPL_VIRTUAL，要么是reportTemplateId
        // 不会是真实的virtualTemplateId
        this._tplKey = this._reportType == 'RTPL_VIRTUAL'
            ? 'RTPL_VIRTUAL_ID' : this._reportTemplateId;
    };

    /** 
     * @override
     */
    COND_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        var css = 'cond-config-panel';
        var me = this;
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

        html.push('<div>');
        makeClzKeySel(html);
        makeParamNameSel(html);
        // makeLevelSel(html);
        html.push('</div>');

        html.push('<div>');
        // 这几个暂用文本输入
        html.push(
            '<span class="vtpl-quick-text-label" title="不填则会取默认设置">fetchURL: </span>',
            '<input placeholder="可不填" class="', css + '-fetch-url" value="', 
                rtplCond.fetchURL || '','" />'
        );
        html.push(
            '<span class="vtpl-quick-text-label" title="不填则会取默认设置">默认值: </span>',
            '<input placeholder="可不填" class="', css + '-default-value" value="', 
                rtplCond.defaultValue || '','" />'
        );
        makeRequiredSelect(html);
        html.push('<br />');
        makeHandlerSelect(html);
        html.push('</div>');

        // 不同控件的特定设置
        html.push('<div class="', css, '-opt-set"></div>');

        contentEl.innerHTML = html.join('');

        // 挂this上是为了和dom循环引用时好清理
        this._clzKeySel = q(css + '-clz-key-sel', contentEl)[0];
        this._handlerSel = q(css + '-handler-sel', contentEl)[0];
        this._paramNameSel = q(css + '-param-name-sel', contentEl)[0];
        this._levelSel = q(css + '-level-sel', contentEl)[0];
        this._optSetEl = q(css + '-opt-set', contentEl)[0];

        // 绑定联动
        var clzKeyChange = function () {
            var cSel = me._clzKeySel;
            var clzKey = (cSel.options[cSel.selectedIndex] || {}).value;

            // handler设置随clzKey选择而联动
            makeHandlerOption(me._handlerSel, rtplCond, clzKey);

            // opt设置随clzKey选择而联动
            var htm = [];
            htm.push('<div>');
            makeOptTree(htm, entityDef, clzKey);
            makeOptIstCalendar(htm, entityDef, clzKey);
            makeOptXCalendar(htm, entityDef, clzKey);
            htm.push('</div>');
            // 其他 ...
            me._optSetEl.innerHTML = htm.join('');
            me.center();
        };
        this._clzKeySel.onchange = clzKeyChange;

        // 绑定联动
        // level的选择，暂时先不提供
        // 现在的规则是，每个name实际就是 dimName#level，前后台交互都一致
        /* var paramNameChange = bind(
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
        this._paramNameSel.onchange = paramNameChange;*/

        // 初始执行
        clzKeyChange();
        // paramNameChange();

        // 清理和返回
        contentEl = null;
        clzKeyChange = null;
        return;

        //--------------------------------
        // 以下是公用的参数设置元件初始化
        //--------------------------------

        // clzKey sel
        function makeClzKeySel(html) {
            var formDef = DICT.findClzDef('DI_FORM', 'COMPONENT');
            
            html.push('<span class="vtpl-quick-text-label">选择控件：</span>');
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
            html.push('<span class="vtpl-quick-text-label">选择所对应的后台参数名：</span>');
            html.push('<select class="', css, '-param-name-sel">');
            for (var i = 0, o, sel; o = candidateCond[i]; i ++) {
                // 回填当前已经选择的
                sel = entityDef.name == o.name 
                    ? sel = ' selected="selected" ' : ' ';
                html.push('<option value="', o.name, '" ', sel, '>', o.caption, '（', o.name, '）</option>')
            }
            html.push('</select>');
        }

        /*function makeLevelSel(html) {
            // handler是和paramNameSel联动的，联动时再填值
            html.push('<span>选择所对应的维度层级：</span>');
            html.push(
                '<select class="', css, '-level-sel">',
                '</select>'
            );
        }*/

        function makeRequiredSelect(html) {
            html.push('<span class="vtpl-quick-text-label">是否设为必传条件：</span>');
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
            html.push('<span class="vtpl-quick-text-label">选择参数处理器：</span>');
            html.push(
                '<select class="', css, '-handler-sel">',
                '</select>'
            );
        }

//        function makeHandlerOption(handlerSel, rtplCond, clzKey) {
//            var handlers = clzKey
//                ? DICT.findClzDef(clzKey, 'VUI').rtplParamHandler
//                : [];
//            var htm = [];
//            for (var i = 0, h, sel; h = handlers[i]; i ++) {
//                sel = h == rtplCond.handler ? ' selected="selected" ' : ''
//                htm.push(
//                    '<option value="', h, '" ', sel, '>', h, '</option>'
//                );
//            }
//            handlerSel.innerHTML = htm.join('');
//        }
        //update by lizhantong 2014-04-14 18:30
        function makeHandlerOption(handlerSel, rtplCond, clzKey) {
        	var classDefine = DICT.findClzDef(clzKey, 'VUI');
       		var handlers = clzKey
                ? classDefine.rtplParamHandler
                : [];
            var handlersLang = classDefine.rtplParamHandlerCNLang || {};
            var htm = [];
            for (var i = 0, h, sel; h = handlers[i]; i ++) {
                sel = h == rtplCond.handler ? ' selected="selected" ' : ''
                htm.push(
                    '<option value="', h, '" ', sel, '>', handlersLang[h], '</option>'
                );
            }
            handlerSel.innerHTML = htm.join('');
        }

        //-------------------------------------
        // 以下是对于一些输入控件的特定的设置。
        // 目前先这样写，后续重构
        //-------------------------------------

        // 对于ECUI_INPUT_TREE，设置是否sync
        function makeOptTree(html, entityDef, clzKey) {
            if (clzKey != 'ECUI_INPUT_TREE') { return; }
            var cfgOpt = entityDef.cfgOpt || {};

            html.push('<span class="vtpl-quick-text-label">设置数据的获取时机：</span>');
            var sel = { 'true': '', 'false': '' };
            // 回填当前已经选择的
            sel[String(!!cfgOpt.async)] = ' selected="selected" ';
            html.push(
                '<select class="', css, '-async-sel">',
                    '<option value="false" ', sel['false'], '>初始加载时获取全部数据</option>',
                    '<option value="true" ', sel['true'], '>初始加载不获取全部数据，点击展开时异步获取数据</option>',
                '</select>'
            );
        }

        function makeOptIstCalendar(html, entityDef, clzKey) {
            if (clzKey != 'RANGE_POP_CALENDAR' && clzKey != 'DAY_POP_CALENDAR') {
                return;
            }
            var dataOpt = entityDef.dataOpt || {};

            html.push(
                '<div>',
                    '<span class="vtpl-quick-text-label">设置默认时间：</span>',
                    '<input type="input" value="', encodeHTML(stringifyTimeUnit(dataOpt.defaultTime)), '" class="', css, '-ist-cal-default"/>',
                    '<span class="vtpl-quick-text-label">（请输入时间表达式）</span>',
                '</div>',
                '<div>',
                    '<span class="vtpl-quick-text-label">设置可选时间范围：</span>',
                    '<input type="input" value="', encodeHTML(stringifyTimeUnit(dataOpt.range)), '" class="', css, '-ist-cal-range"/>',
                    '<span class="vtpl-quick-text-label">（请输入时间表达式）</span>',
                '</div>',
                LANG.TIME_DESC
            );
        }

        function makeOptXCalendar(html, entityDef, clzKey) {
            if (clzKey != 'X_CALENDAR') {
                return;
            }
            var dataSetOpt = entityDef.dataSetOpt || {};

            html.push(
                '<div class="', css, '-x-cal-set">',
                    '<span class="vtpl-quick-text-label">设置初始化参数：</span>',
                    '<textarea class="', css, '-x-cal-opt"/>',
                        encodeHTML(stringifyXCalOpt(dataSetOpt)),
                    '</textarea>',
                '</div>',
                LANG.X_CALENDAR_DESC
            );
        }        
    };

    /** 
     * @override
     */
    COND_CONFIG_PANEL_CLASS.$doGetInitArgs = function() {
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
    COND_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var css = 'cond-config-panel';
        var cpntId = this._cpntId;
        var entityId = this._entityId;
        var vtpl = this._vtplFork;
        var tplKey = this._tplKey;
        var isCreate = this._isCreate;
        var mainEl = this.getEl();
        var el;
        var errorMsg;

        // entityDef创建或获取
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

        // 即时向vtplFork.rtplCond中保存
        // 各种公共设置的值
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
        // el = q(css + '-level-sel', mainEl)[0];
        // var level = (el.options[el.selectedIndex] || {}).value

        // opt初始化
        if (errorMsg = makeOpt()) {
            return errorMsg;
        }

        // 写入entityDef
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
            // rtplCond.level = level;
        }

        // hide属性只纪录在el的style中
        return {
            // 目前只有这种控件是隐藏的
            hide: entityDef.clzKey == 'HIDDEN_INPUT'
        }

        // 各种控件特定设置的值
        function makeOpt() {
            var cfgOpt;
            var dataOpt;
            var dataInitOpt;
            var dataSetOpt;
            var valueGetOpt;
            var el;
            var val;

            if (clzKey == 'ECUI_INPUT_TREE') {
                cfgOpt = cfgOpt || {};
                if (el = q(css + '-async-sel', mainEl)[0]) {
                    cfgOpt.async = strToBoolean(
                        (el.options[el.selectedIndex] || {}).value
                    );
                }
            }

            if (clzKey == 'ECUI_SUGGEST') {
                cfgOpt = cfgOpt || {};
                cfgOpt.async = true;
            }


            if (clzKey == 'RANGE_POP_CALENDAR' || clzKey == 'DAY_POP_CALENDAR') {
                dataOpt = dataOpt || {};
                if (el = q(css + '-ist-cal-default', mainEl)[0]) {
                    if ((val = parseTimeUnit(el.value)) === false) {
                        return '时间格式错误';
                    }
                    dataOpt.defaultTime = val || void 0;
                }
                if (el = q(css + '-ist-cal-range', mainEl)[0]) {
                    if ((val = parseTimeUnit(el.value)) === false) {
                        return '时间格式错误';
                    }
                    dataOpt.range = val || void 0;
                }
            }

            if (clzKey == 'X_CALENDAR') {
                dataSetOpt = dataSetOpt || {};
                if (el = q(css + '-x-cal-opt', mainEl)[0]) {
                    if ((val = parseXCalOpt(el.value)) === false) {
                        return '初始化参数格式错误';
                    }
                    dataSetOpt = val || void 0;
                }
            }

            // 其他特定设置 ...

            // 各种Opt
            entityDef.cfgOpt = cfgOpt;
            entityDef.dataOpt = dataOpt;
            entityDef.dataInitOpt = dataInitOpt;
            entityDef.dataSetOpt = dataSetOpt;
            entityDef.valueGetOpt = valueGetOpt;
        }
    };

    function stringifyTimeUnit(obj) {
        if (!obj) {
            return '';
        }
        try {
            return jsonStringify(obj);
        }
        catch (e) {
            arguments.callee.errorMsg = e.message;
            return '';
        }
    }

    function parseTimeUnit(str) {
        if (!str) { return void 0; }

        try {
            str = jsonParse(str);
            if (!isArray(str)) {
                return false;
            }
            return str;
        }
        catch (e) {
            // 表示错误
            arguments.callee.errorMsg = e.message;
            return false;
        }
    }

    function stringifyXCalOpt(obj) {
        if (!obj) {
            return '';
        }
        try {
            return jsonFormat(jsonStringify(obj));
        }
        catch (e) {
            arguments.callee.errorMsg = e.message;
            return '';
        }
    }

    function parseXCalOpt(str) {
        if (!str) { return void 0; }

        try {
            str = jsonFormat(str);
            jsonValidate(str);
            return jsonParse(str);
        }
        catch (e) {
            // 表示错误
            arguments.callee.errorMsg = e.message;
            return false;
        }
    }

    function fmtInput(value) {
        if (value == null) {
            return '';
        }
        return trim(String(value));
    }

})();