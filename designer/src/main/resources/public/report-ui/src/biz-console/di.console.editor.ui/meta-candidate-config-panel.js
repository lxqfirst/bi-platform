/**
 * di.console.editor.ui.MetaCandidateConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    对元数据，设置其是否作为报表的“元数据改变”组件（如元数据拖拽组件、指标选择组件）的候选项。
 *           默认，cube中所有的元数据都是候选项。但是往往这太多了。所以在这里让用户能去掉不需要的。
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
    var htmlText = xutil.string.htmlText;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
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
     * 元数据候选项组件
     *
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     */
    var META_CANDIDATE_CONFIG_PANEL = $namespace().MetaCandidateConfigPanel =
        inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this._mModel = options.model;
                this.DATASOURCE_ID_MAPPING = {
                    INIT: 'CANDIDATE_INIT',
                    SUBMIT: 'CANDIDATE_SUBMIT'
                };
            }
        );
    var META_CANDIDATE_CONFIG_PANEL_CLASS = META_CANDIDATE_CONFIG_PANEL.prototype;

    //------------------------------------------
    // 方法
    //------------------------------------------

    /** 
     * @override
     */
    META_CANDIDATE_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
        // FIXME
    };

    /** 
     * @override
     */
    META_CANDIDATE_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
    };

    /** 
     * @override
     */
    META_CANDIDATE_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        // 首先dispose
        contentEl.innerHTML = ''

        var css = 'meta-candidate';
        var metaData = data.metaData || {};
        var indSel = makeSet(data.validMeasureName);
        var dimSel = makeSet(data.validDimensionNames);

        var tplMain = [
            '<div>',
                '<div class="#{css}-line-label">请勾选要作为候选项的指标：</div>',
                '<div class="#{css}-btns">',
                    '<input class="#{css}-ind-all-sel" type="button" value="全选" />',
                    '<input class="#{css}-ind-revert-sel" type="button" value="反选" />',
                '</div>',
                '<div class="#{css}-inds">#{inds}</div>',
                '<div class="#{css}-line-label #{css}-sep">请勾选要作为候选项的维度：</div>',
                '<div class="#{css}-btns">',
                    '<input class="#{css}-dim-all-sel" type="button" value="全选" />',
                    '<input class="#{css}-dim-revert-sel" type="button" value="反选" />',
                '</div>',
                '<div class="#{css}-dims">#{dims}</div>',
            '</div>'
        ].join('');

        var tplItem = [
            '<span class="#{css}-item">',
                '<input type="checkbox" #{checked} value="#{value}"/>',
                '<span class="#{css}-text-label">#{name}</span>',
            '</span>'
        ].join('');

        var htmlInd = [];
        var htmlDim = [];
        var i;
        var item;

        for (i = 0; item = (metaData.inds || [])[i]; i ++) {
            htmlInd.push(template(
                tplItem, 
                { 
                    css: css, 
                    name: htmlText(item.caption),
                    value: htmlText(item.uniqName),
                    checked: indSel[item.uniqName] ? ' checked="checked" ' : ''
                }
            ));
        }

        for (i = 0; item = (metaData.dims || [])[i]; i ++) {
            htmlDim.push(template(
                tplItem, 
                { 
                    css: css, 
                    name: htmlText(item.caption), 
                    value: htmlText(item.uniqName), 
                    checked: dimSel[item.uniqName] ? ' checked="checked" ' : ''
                }
            ));
        }

        contentEl.innerHTML = template(
            tplMain, 
            { css: css, inds: htmlInd.join(''), dims: htmlDim.join('') }
        );

        // 挂事件
        this.$bindEvent();
    };

    /**
     * @private
     */
    META_CANDIDATE_CONFIG_PANEL_CLASS.$bindEvent = function() {
        var css = 'meta-candidate';
        var contentEl = this.getContentEl();

        q(css + '-ind-all-sel', contentEl)[0].onclick =
            getAllSelFn(this, css + '-inds');
        q(css + '-ind-revert-sel', contentEl)[0].onclick = 
            getRevertSelFn(this, css + '-inds');
        q(css + '-dim-all-sel', contentEl)[0].onclick =
            getAllSelFn(this, css + '-dims');
        q(css + '-dim-revert-sel', contentEl)[0].onclick =
            getRevertSelFn(this, css + '-dims');

        // 全选
        function getAllSelFn(me, cssName) {
            return function () {
                var el = q(cssName, me.getContentEl())[0];
                var inputs = el.getElementsByTagName('INPUT');
                for (var i = 0, input; input = inputs[i]; i ++) {
                    input.checked = true;
                }
            };
        }

        // 反选
        function getRevertSelFn(me, cssName) {
            return function () {
                var el = q(cssName, me.getContentEl())[0];
                var inputs = el.getElementsByTagName('INPUT');
                for (var i = 0, input; input = inputs[i]; i ++) {
                    input.checked 
                        ? (input.checked = false) 
                        : (input.checked = true);
                }
            };
        }
    };

    /** 
     * @override
     */
    META_CANDIDATE_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var css = 'meta-candidate';
        var contentEl = this.getContentEl();
        var indSel = [];
        var dimSel = [];

        fillSel(css + '-inds', indSel);
        fillSel(css + '-dims', dimSel);
       
        return {
            validMeasureName: indSel,
            validDimensionNames: dimSel
        };

        function fillSel(cssName, list) {
            var inputs = q(cssName, contentEl)[0].getElementsByTagName('INPUT');
            for (var i = 0, input; input = inputs[i]; i ++) {
                if (input.checked) {
                    list.push(input.value);
                }
            }
        }
    };

    function makeSet(list) {
        list = list || [];
        var ret = {};
        for (var i = 0; i < list.length; i ++) {
            ret[list[i]] = 1;
        }
        return ret;
    }

    function fmtInput(value) {
        if (value == null) {
            return '';
        }
        return trim(String(value));
    }

})();