/**
 * di.console.frame.ui.MainPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    [通用构件] Data Insight页面整体
 * @author:  sushuang(sushuang)
 * @depend:  ecui
 */

$namespace('di.console.frame.ui');

(function() {
    
    //-----------------------------------------------
    // 引用
    //-----------------------------------------------

    var inheritsObject = xutil.object.inheritsObject;
    var getByPath = xutil.object.getByPath;
    var XVIEW = xui.XView;
    var ecuiCreate = di.helper.Util.ecuiCreate;
    var DICT = di.config.Dict;
    var URL = di.config.URL;
    var DOM = xutil.dom;
    var q = DOM.q;
    var LANG = di.config.Lang;
    var GLOBAL_MENU;
    var GLOBAL_MODEL;
    var DI_FACTORY;
        
    $link(function() {
        GLOBAL_MENU = di.console.shared.ui.GlobalMenu;
        GLOBAL_MODEL = di.shared.model.GlobalModel;
        DI_FACTORY = di.shared.model.DIFactory;
    });
        
    //-----------------------------------------------
    // 类型声明
    //-----------------------------------------------

    /**
     * 页面整体类
     *
     * @class
     * @extends xui.XView
     */
    var MAIN_PAGE = $namespace().MainPage = 
        inheritsObject(
            XVIEW,
            function(options) {
                checkEnv();
                consoleInit.call(this, options);
                createView.call(this, options);
            }
        );

    // 从此处可以看出组件采用原型注入式继承，
    // 在后面的“MAIN_PAGE_CLASS.init =”中可以看到址指向的具体实现
    var MAIN_PAGE_CLASS = MAIN_PAGE.prototype;

    var canInit = true;
        
    //-----------------------------------------------
    // 方法
    //-----------------------------------------------

    /**
     * @override
     */
    XVIEW.$domReady = ecui.dom.ready;

    /**
     * 检查浏览器环境
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function checkEnv() {
        // FIXME
        // ie8以下不支持是确定的。
        // 其他主要怕没网更新的机器上存在过古老版本（这些检查略随意）。
        if (DOM.ieVersion < 8
            || DOM.firefoxVersion < 10
            || DOM.chromeVersion < 10
        ) {
            canInit = false;
            document.body.innerHTML = [
                '<div style="color: #0DA823; font-size:16px; font-weight: 2px; text-align: center; margin-top: 50px">',
                    LANG.SAD_FACE,
                    '<span style="border:1px #17E734 solid; padding: 5px 10px;">对不起，此浏览器版本过低或不被支持，请使用现代浏览器。（ie8+, chrome10+, firefox10+等）</span>',
                '</div>'
            ].join('');
            return;
        }
    }

    /**
     * 编辑管理环境初始化
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function consoleInit(options) {
        if (!canInit) { return; }

        // web根路径
        URL.setWebRoot(options.webRoot);

        // 初始化global model
        GLOBAL_MODEL(options);

        // 初始化repo中的所有class
        DI_FACTORY().installClz();
    }

    /**
     * 创建View（DOM初始化）
     *
     * @private
     * @param {Object} options 初始化参数
     */
    function createView(options) {
        if (!canInit) { return; }

        // 创建视图左侧全局菜单
        var o;
        options = options || {};
        // TODOED 探究一下为何这里很难懂，是业务复杂还是代码结构的原因
        var mainContainer = q('q-global-main')[0];
        mainContainer.appendChild(o = document.createElement('div'));
        // 这段晦涩，不知道是什么，要做什么，怎么做
        // 原来是隔空传递，牛叉的享元模式...
        // 这玩意应该叫_uGlobalMenuItem，菜单项，_eBody属性是dom，其他的属性用处未知
        this._uGlobalMenu = ecuiCreate(
            GLOBAL_MENU,
            q('q-global-menu')[0],
            null
        );

        if (options.pageClass) {
            // getByPath 外再加new绝对是超级传送门，注意身体不适

//            this._uMainContainer =
//                new (
//                    getByPath(options.pageClass, $getNamespaceBase())
//                    )({ el: o });
            // 如下拆解
            // 变量名是一种说明方法，拆解逻辑节省脑细胞
            // 通过options.pageClass指定生成页面的控制器
            var handlerForGetMainContainer = getByPath(
                options.pageClass,
                $getNamespaceBase()
            );

            // 生成框架,当前对应的控制器为"di.console.frame.ui.ConsoleFrame"
            // 对应文件：src/biz-console/di.console.frame.ui/console-frame.js
            this._uMainContainer = new handlerForGetMainContainer({ el: o });
        }
    };
    
    /**
     * @override 重写默认的初始化函数
     */
    MAIN_PAGE_CLASS.init = function() {

        if (!canInit) { return; }

        MAIN_PAGE.superClass.init.call(this);

        // 引用
        var o = GLOBAL_MODEL().getGlobalMenuManager();
        this._uGlobalMenu.setGlobalMenuManager(o);
        o.setGlobalMenu(this._uGlobalMenu);

        // 页面开始
        this._uGlobalMenu.init();
        this._uMainContainer && this._uMainContainer.init();
    };

    /**
     * @override
     */
    MAIN_PAGE_CLASS.dispose = function() {
        GLOBAL_MODEL().dispose();
        MAIN_PAGE.superClass.$dispose.call(this);
    };

})();

