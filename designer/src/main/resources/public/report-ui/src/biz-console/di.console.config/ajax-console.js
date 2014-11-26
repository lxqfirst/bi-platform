/**
 * configuration of xutil.ajax
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console工程的ajax配置
 *           重载全局配置
 * @author:  xxx(xxx)
 * @depend:  xutil.ajax, config.lang
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var XAJAX = xutil.ajax;
    var isFunction = xutil.lang.isFunction;
    var AJAX = di.config.AJAX;
    var LANG = di.config.Lang;
    var alert = di.helper.Dialog.alert;
    var confirm = di.helper.Dialog.confirm;
    var waitingPrompt = di.helper.Dialog.waitingPrompt;
    var hidePrompt = di.helper.Dialog.hidePrompt;
    
    // 如有需要，在此重载全局配置 ...

})();