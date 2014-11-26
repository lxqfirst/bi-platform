/**
 * di.helper.Log
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    打印log工具
 * @author:  sushuang(sushuang)
 * @depend:  xutil, tangram.ajax, tangram.json
 */
 
(function () {
    
    var infoEl;

    function consoleLog() {
    };

    //===================================
    // console log
    //===================================

    if (!window.console) { 
        window.console = {};
    }
    if (!window.console.log) {
        window.console.log = consoleLog;
    }

})();