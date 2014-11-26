/**
 * di.console.shared.ui.ReportPreview
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    页面预览
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
    var URL = di.config.URL;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var encodeHTML = xutil.string.encodeHTML;
    var getUID = xutil.uid.getUID;
    var alert = di.helper.Dialog.alert;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var template = xutil.string.template;
    var textParam = xutil.url.textParam;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var PREVIEW_CONFIG_PANEL = di.console.shared.ui.PreviewConfigPanel;
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 页面预览
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.reportType
     * @param {string} options.schemaName
     * @param {string} options.cubeTreeNodeName
     */
    var REPORT_MOLD_LIST_PAGE = $namespace().ReportMoldListPage = 
        inheritsObject(
            PANEL_PAGE,
            function (options) {
                var el = options.el;
                addClass(el, 'report-release');
                el.innerHTML = TPL_MAIN;
                this._reportURL = options.reportURL;
                this._data = options.data;
                this._vtplModel = options.vtplModel;
                this._globalPanelPageManager = options.globalPanelPageManager;
                this._phase = options.phase;
                createView.call(this, el, options);
            }
        );
    var REPORT_MOLD_LIST_PAGE_CLASS = REPORT_MOLD_LIST_PAGE.prototype;
    
    //------------------------------------------
    // 模板
    //------------------------------------------

    var TPL_MAIN = [
        '<div class="report-release-list">',
        '</div>'
    ].join('');
    
    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
         // 预览参数设置浮层
        this._uPreviewConfig = new PREVIEW_CONFIG_PANEL(
            { parent: this, panelTitle: '预览设置' }
        );
    }
    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 初始化
     *
     * @public
     */
    REPORT_MOLD_LIST_PAGE_CLASS.init = function() {
        
         this._uPreviewConfig.init();
    };
    
    /**
     * @override
     */
    REPORT_MOLD_LIST_PAGE_CLASS.render = function() {
        var phase = this._phase;
        var molds = this._vtplModel.getMolds();
        var mainEl = this.getEl();
        var me = this;
        var html;
        html = appendHTML(phase,molds);
        
        mainEl.innerHTML = html;
        
        
        var imgs = mainEl.getElementsByTagName('IMG');
        for (var i = 0, img; img = imgs[i]; i ++) {
            
            var vtpl = molds.get(img.getAttribute('data-index'));
            img.title = vtpl.snippet.fileName;
            img.onclick = handleClick;
            // img.onerror = function (img) {
            //      img.src = '../asset/css/img/demo.jpg';
            // }
        }

        
        function handleClick() {
            var vtpl = molds.get(this.getAttribute('data-index'));
            var vtplKey = vtpl.vtplKey;
            var fileName = vtpl.snippet.fileName;
            me._globalPanelPageManager.openByURI(
                'di.console.editor.ui.VTplPanelPage?'
                    + [
                        'pageId=' + fileName,
                        'pageTitle=' + '新建 [基于：' + fileName + ']',
                        'moldKey=' + fileName,
                        'act=CREATE#QUICK',
                        'forceCreate=true'
                    ].join('&'),
                { vtplModel: me._vtplModel, forceActive: true }
            );   
        };
        
    };    

    function appendHTML(phase,list){
        var html = [];
        var onerrorHtml="this.src='../asset/css/img/demo.jpg'";
        list.foreach(
            function (key, vtplInfo, i) {
                var descs = vtplInfo.desc.split('||');
                html.push('<div class="report-release-block">');
               // html.push(' <img data-index="', encodeHTML(key), '" class="report-release-img" src="../asset/css/img/demo.jpg"/>');
                html.push(' <img data-index="', encodeHTML(key), '" class="report-release-img" onerror='+onerrorHtml+'   src="../report-img/mold-img/'+ vtplInfo.snippet.fileName +'.png"/>');
                html.push(' <span data-index="', encodeHTML(key), '">');
                for (var i = 0; i < descs.length; i++) {
                    var descStr= descs[i];
                    html.push('<li>' + descStr +'</li>');
                };
                html.push('</span>');
                html.push('</div>');
            }
        );
        return  html.join('');
    }
    /**
     * @override
     */
    REPORT_MOLD_LIST_PAGE_CLASS.dispose = function() {
        REPORT_MOLD_LIST_PAGE.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    REPORT_MOLD_LIST_PAGE_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    REPORT_MOLD_LIST_PAGE_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };
    

})();