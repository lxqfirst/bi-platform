/**
 * configuration of xutil.ajax
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console工程的url配置
 *           重载全局配置
 * @author:  xxx(xxx)
 */

(function() {
    
    //--------------------------------
    // 引用
    //--------------------------------

    var URL = di.config.URL;
    
    // olap编辑、报表管理外壳
    URL.addURL('CONSOLE_FRAME_INIT', '/xxx/xxxxxxxxx1.action');


	// TODO    
    // URL.addURL('CONSOLE_IND', '/xxx/xxxxxxxxx2.action');
    // URL.addURL('CONSOLE_DIM', '/xxx/xxxxxxxxx3.action');
    // URL.addURL('CONSOLE_CHART', '/xxx/xxxxxxxxx4.action');

})();