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
    var REPORT_RELEASE_PAGE = $namespace().ReportReleasePage = 
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
    var REPORT_RELEASE_PAGE_CLASS = REPORT_RELEASE_PAGE.prototype;
    
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
    REPORT_RELEASE_PAGE_CLASS.init = function() {
    	
    	 this._uPreviewConfig.init();
    };
    
    /**
     * @override
     */
    REPORT_RELEASE_PAGE_CLASS.render = function() {
    	var phase = this._phase;
    	var vtplSet = this._vtplModel.getVTpls(phase);
    	var mainEl = this.getEl();
    	var me = this;
        var bizKey =this._vtplModel.getBizKey();
    	var html;
		html = appendHTML(bizKey,phase,vtplSet);
    	
    	mainEl.innerHTML = html;
    	
    	
    	var imgs = mainEl.getElementsByTagName('IMG');
    	for (var i = 0, img; img = imgs[i]; i ++) {
            
            var vtpl = vtplSet.get(img.getAttribute('data-index'));
            img.title = vtpl.vtplName;
            if (phase == 'dev'){
                img.onclick = handleDevPhaseClick;
            } else {
                img.onclick = handleImgClick;
            }
    	}
    	
    	function handleImgClick() {
			var vtpl = vtplSet.get(this.getAttribute('data-index'));
			var vtplKey = vtpl.vtplKey;
			me._uPreviewConfig.open(
		        'EDIT', 
		        { 
		        	vtplKey: vtplKey, 
		        	onconfirm: function (options) {
		                me._globalPanelPageManager.openByURI(
		                        'di.console.editor.ui.VTplPanelPage?'
		                            + [
		                               // 'pageId=' + vtplKey + getUID(),
                                        'pageId=' + vtplKey,
		                                'pageTitle=' + vtplKey,
		                                'vtplKey=' + vtplKey,
		                                'act=PREVIEW#PREVIEW',
		                                'phase=' + phase
		                            ].join('&'),
		                    	{ 
                                    vtplModel: me._vtplModel, 
                                    forceActive: true,
                                    extraOpt: {
                                        reportURL: options.reportURL,
                                        data: options.data,
                                        vtplKey: vtplKey
                                    }
                                }
		                   );		
		        	}
		        }
		    );
		};
		
		function handleDevPhaseClick() {
            var vtpl = vtplSet.get(this.getAttribute('data-index'));
            var vtplKey = vtpl.vtplKey;
            me._globalPanelPageManager.openByURI(
                'di.console.editor.ui.VTplPanelPage?'
                    + [
                        'pageId=' + vtplKey,
                        'pageTitle=' + vtplKey,
                        'vtplKey=' + vtplKey,
                        'act=EDIT#QUICK',
                        'phase=' + phase
                    ].join('&'),
                { vtplModel: me._vtplModel, forceActive: true }
            );   
        };
    	
    };    

    function appendHTML(bizKey,phase,list){
    	var html = [];
        var onerrorHtml="this.src='../asset/css/img/demo.jpg'";
        //如果没有返回数据，那么直接返回无数据提示
        if (list.size() == 0){
            html.push('<div');
            html.push(' <span > 暂无符合条件的数据！</span>');
            html.push('</div>');
        } else {
        	list.foreach(
        		function (key, vtplInfo, i) {
    	    		html.push('<div class="report-release-block">');
    	    		//html.push('	<img data-index="', encodeHTML(key), '" class="report-release-img" src="../asset/css/img/demo.jpg"/>');
    	    		html.push(' <img data-index="', encodeHTML(key), '" class="report-release-img" onerror='+onerrorHtml+'   src="'+URL.getWebRoot()+'/asset-d/'+bizKey+'/imgs/'+ vtplInfo.snippet.fileName +'.png"/>');
                    html.push('	<span data-index="', encodeHTML(key), '">' + vtplInfo.vtplName +'</span>');
    	    		html.push('</div>');
        		}
        	);
        }
    	return  html.join('');
    }
    /**
     * @override
     */
    REPORT_RELEASE_PAGE_CLASS.dispose = function() {
        REPORT_RELEASE_PAGE.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    REPORT_RELEASE_PAGE_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    REPORT_RELEASE_PAGE_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };
    

})();