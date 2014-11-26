/**
 * di.console.shared.ui.PreviewConfigPanel
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    视图模版编辑
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */
$namespace('di.console.shared.ui');

(function() {

    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var extend = xutil.object.extend;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var alert = di.helper.Dialog.alert;
    var confirm = di.helper.Dialog.confirm;
    var template = xutil.string.template;
    var getUID = xutil.uid.getUID;
    var ecuiCreate = UTIL.ecuiCreate;
    var foreachDoOri = UTIL.foreachDoOri;
    var textParam = xutil.url.textParam;
    var replaceIntoParam = xutil.url.replaceIntoParam;
    var assert = UTIL.assert;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 预览设置浮层
     * 
     * @class
     * @extends di.shared.ui.BaseConfigPanel
     * @param {Object} options @see di.shared.ui.BaseConfigPanel
     */
    var PREVIEW_CONFIG_PANEL = $namespace().PreviewConfigPanel
        = inheritsObject(BASE_CONFIG_PANEL);
    var PREVIEW_CONFIG_PANEL_CLASS = PREVIEW_CONFIG_PANEL.prototype;

    /**
     * @override
     *
     * @param {string} vtplKey
     * @param {Function} onconfirm 
     *      参数为：
     *          {string} options.reportURL
     *          {string} options.data 填入的data
     */ 
    PREVIEW_CONFIG_PANEL_CLASS.$doOpen = function(mode, options) {
        this._vtplKey = options.vtplKey;
        this._onconfirm = options.onconfirm;
    };

    /** 
     * @override
     */
    PREVIEW_CONFIG_PANEL_CLASS.$doDispose = function() {
        this.getContentEl().innerHTML = '';
    };

    /** 
     * 渲染
     * 
     * @override
     */
    PREVIEW_CONFIG_PANEL_CLASS.$doRender = function(contentEl, data) {
        var html = [
            '<span class="vtpl-preview-config-phase">',
                '<input type="radio" name="vtpl-preview" value="dev" checked="checked" /><span>dev</span>',
                '<input type="radio" name="vtpl-preview" value="pre" /><span>pre</span>',
                '<input type="radio" name="vtpl-preview" value="release" /><span>release</span>',
            '</span>',
            '<div>',
                '如下为报表URL：',
            '</div>',
            '<div>',
                '<textarea class="vtpl-preview-config-report-url"></textarea>',
            '</div>',
            '<div>',
                '如果要传入额外的参数，请在下面添加，使用“&”符号链接：',
            '</div>',
            '<div>',
                '<textarea class="vtpl-preview-config-data"></textarea>',
            '</div>'
        ];
        contentEl.innerHTML = html.join('');

        // 绑定事件
        var radios = q('vtpl-preview-config-phase', contentEl)[0]
            .getElementsByTagName('INPUT');
        for (var i = 0, ra; ra = radios[i]; i ++) {
            ra.onclick = bind(this.$urlAddPhase, this);
        }

        this.$urlGen();
    };

    /**
     * 生成url（以及url中的默认参数）
     *
     * @private
     */ 
    PREVIEW_CONFIG_PANEL_CLASS.$urlGen = function () {
        var url = URL('REPORT_PREVIEW');
        
        var urlEl = q('vtpl-preview-config-report-url', this.getContentEl())[0];
        urlEl.value = replaceIntoParam(
            url, 'reportTemplateId', this._vtplKey
        );

        this.$urlAddPhase();
    };

    /**
     * 增加或修改URL中的phase
     *
     * @private
     */ 
    PREVIEW_CONFIG_PANEL_CLASS.$urlAddPhase = function () {
        var contentEl = this.getContentEl();
        var pEl = q('vtpl-preview-config-phase', contentEl)[0];
        var urlEl = q('vtpl-preview-config-report-url', contentEl)[0];

        // 取预览模式(dev/pre/release)
        var radios = pEl.getElementsByTagName('INPUT');
        var phase = 'dev';
        for (var i = 0, ra; ra = radios[i]; i ++) {
            if (ra.checked) { phase = ra.value; }
        }

        urlEl.value = replaceIntoParam(urlEl.value, 'phase', phase);
    };

    /**
     * 得到提交参数
     * 
     * @protected
     */
    PREVIEW_CONFIG_PANEL_CLASS.$doGetSubmitArgs = function() {
        var contentEl = this.getContentEl();
        var url = q('vtpl-preview-config-report-url', contentEl)[0].value;
        var data = q('vtpl-preview-config-data', contentEl)[0].value;
        if (!url || !trim(url)) {
            return 'URL不可为空';
        }
        else {
            return { reportURL: url, data: data };
        }
    };

    /**
     * 关闭浮层，打开新tab页
     * 
     * @protected
     */
    PREVIEW_CONFIG_PANEL_CLASS.$doSubmitSuccess = function(
        contentEl, data, ejsonObj, options
    ) {
        this._onconfirm(
            { 
                reportURL: options.args.reportURL, 
                data: options.args.data
            }
        );
    };

})();