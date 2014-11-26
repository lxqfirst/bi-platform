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
    var alert = di.helper.Dialog.alert;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var ecuiCreate = UTIL.ecuiCreate;
    var UI_BUTTON = ecui.ui.Button;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var template = xutil.string.template;
    var textParam = xutil.url.textParam;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var VTPL_MODEL ;
        
    $link(function() {
        VTPL_MODEL = di.console.editor.model.VTplModel;
    });    

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
    var REPORT_PREVIEW = $namespace().ReportPreview = 
        inheritsObject(
            PANEL_PAGE,
            function (options) {
                var el = options.el;
                addClass(el, 'page-preview');
                el.innerHTML = TPL_MAIN;
                this._reportURL = options.reportURL;
                this._data = options.data;
                this.vtplKey = options.vtplKey;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var REPORT_PREVIEW_CLASS = REPORT_PREVIEW.prototype;
    
    //------------------------------------------
    // 模板
    //------------------------------------------

    var TPL_MAIN = [
        '<div><span class="q-btn-screenshot ui-button ui-button-g">预览抓图</span></div>',
        '<div class="q-di-stub"></div>'
    ].join('');
    

      /**
     * 创建Model
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function createModel(el, options) {
        this._mVTplModel = new VTPL_MODEL();
    }
    //------------------------------------------
    // 方法
    //------------------------------------------

     /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        // 创建抓图按钮视图
        this._uScreenShotBtn = ecuiCreate(
                UI_BUTTON, 
                q('q-btn-screenshot', el)[0],
                null, 
                { primary: 'ui-button-g' }
            );
    }

    /**
     * 初始化
     *
     * @public
     */
    REPORT_PREVIEW_CLASS.init = function() {
        var stub = new $DataInsight$(
            q('q-di-stub', this.getEl())[0],
            { 
                // widthMode: 'FULLFILL',
                widthMode: 'ADAPT',
                heightMode: 'ADAPT'
            }
        );
        stub.load(
            { 
                // method: 'POST',
                url: this._reportURL,
                data: this._data
            }
        );

        this._uScreenShotBtn.onclick=bind(this.doScreenShot, this);
        // this._mVTplModel.attach(
        //    ['sync.result.PAHNTOMJS_INFO', this.$requestPhantomjsServer, this]
        // );
        this._mVTplModel.init();
    };

    /**
     * 先给后台发请求，确认Phantomjs服务地址，以及提示文本
     */
    REPORT_PREVIEW_CLASS.doScreenShot = function() {
        var perviewUrl = this._reportURL+this._data;
        var imgName = this.vtplKey;
        this._mVTplModel.sync(
            {
                datasourceId: 'PAHNTOMJS_INFO',
                args: {
                    perviewUrl:perviewUrl,
                    imgName:imgName
                },
                result: $requestPhantomjsServer
            }
        );
  
    };

    /**
    *给phantomjs服务发起抓图请求
    */
     function $requestPhantomjsServer (data, ejsonObj, options) {
        // 预览报表的实际url
        var reportPerviewUrl = data.perviewUrl;
        // phantomjs服务的url
        var phantomjsServerUrl = data.phantomjsServerUrl;
        // 要生成的图片名称
        var imgName = data.imgName;
        // 要用于登录的用户名
        var bizKey = data.bizKey;
        // 图片要存放在服务器的目录
        var imgLocation = data.imgLocation;
        //+'&url='+encodeURIComponent(reportPerviewUrl);
        //alert(perviewUrl);
        // 采用原生的ajax方式请求后台的抓图服务，无需返回
        var oAjax=null; 
        if(window.XMLHttpRequest){ 
            oAjax = new XMLHttpRequest(); 
        }else{ 
            oAjax = new ActiveXObject('Microsoft.XMLHTTP');    
        } 
        oAjax.open('POST',phantomjsServerUrl,true); 
        oAjax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        oAjax.onreadystatechange = function()
        {
            if (oAjax.readyState == 4)
            {
                // @TODO 
            }
        }
        var param = [
                        'resultType=html',
                        'imgType=png',
                        'imgName='+imgName,
                        'imgLocation='+imgLocation,
                        'bizKey='+bizKey,
                        'url=' + encodeURIComponent(reportPerviewUrl)
                    ].join('&')
        // alert(param)
        oAjax.send(param); 

        // window.open(perviewUrl);

        alert("后台已经在抓图，预计30秒之后能生成图片") 
    }
    /**
     * @override
     */
    REPORT_PREVIEW_CLASS.dispose = function() {
        REPORT_PREVIEW.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    REPORT_PREVIEW_CLASS.$active = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.active();
    };    

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    REPORT_PREVIEW_CLASS.$inactive = function() {
        // var page = this._mTimeTypePageManager.getCurrentPage();
        // page && page.inactive();
    };

})();