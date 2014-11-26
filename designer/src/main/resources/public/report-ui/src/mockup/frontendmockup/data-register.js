/**
 * xmock
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * desc:    注册mock data
 * author:  sushuang(sushuang)
 */
 
/** 
 * 所有的数据注册都在此文件中进行，
 * 因为工程后期维护升级过程中，可能需要只对某些特定的请求使用mock。
 * 放在单一文件中便于挑选出这些mock data的注册。
 * 
 * Usage: @see xmock.js
 */
(function () {
    
    // i.e. 
    // xmock.register(basedata.url.frameInitAction1, xmock.data.demo.menu1);
    // xmock.register(basedata.url.frameInitAction2, xmock.data.demo.menu1, {timeoutMode:1, timeout:10} );

    // more ...    
    
    var URL = di.config.URL;


    // console初始化
    xmock.register(
        URL.fn('OLAP_REPORT_INIT'), 
        xmock.data.console.OLAPEditor.OLAP_REPORT_INIT
    );
    xmock.register(
        URL.fn('CUBE_META'), 
        xmock.data.console.ConsoleFrame.CUBE_META
    );
    xmock.register(
        URL.fn('DATASOURCE_META'), 
        xmock.data.console.ConsoleFrame.DATASOURCE_META
    );
    xmock.register(
        URL.fn('CONSOLE_VTPL_LIST'), 
        xmock.data.console.CONSOLE_VTPL_LIST,
        { timeoutMode: 1, timeout: 200 }
    );
//    xmock.register(
//        URL.fn('CONSOLE_MOLD_LIST'), 
//        xmock.data.console.CONSOLE_MOLD_LIST,
//        { timeoutMode: 1, timeout: 200 }
//    );
    xmock.register(
        URL.fn('CONSOLE_SAVE_TPL'), 
        xmock.data.console.CONSOLE_SAVE_TPL
    );
    xmock.register(
        URL.fn('CONSOLE_DS_LIST'), 
        xmock.data.console.CONSOLE_DS_LIST
    );
    xmock.register(
        URL.fn('CONSOLE_GET_COND'), 
        xmock.data.console.CONSOLE_GET_COND
    );
    xmock.register(
        URL.fn('CONSOLE_EXIST_COND'), 
        xmock.data.console.CONSOLE_EXIST_COND
    );
    xmock.register(
        URL.fn('CONSOLE_TO_PRE'), 
        xmock.data.console.CONSOLE_TO_PRE
    );
    xmock.register(
        URL.fn('CONSOLE_TO_RELEASE'), 
        xmock.data.console.CONSOLE_TO_RELEASE
    );

    xmock.register(
        URL.fn('OLAP_SAVE'), 
        xmock.data.console.OLAPEditor.OLAP_SAVE
    );

    // 维度树
    xmock.register(
        URL.fn('DIM_TREE_TABLE'), 
        xmock.data.console.DimTree.DIM_TREE
    );
    xmock.register(
        URL.fn('DIM_TREE_CHART'), 
        xmock.data.console.DimTree.DIM_TREE
    );
    xmock.register(
        URL.fn('DIM_SELECT_SAVE_TABLE'),
        xmock.data.console.DimTree.DIM_SELECT_SAVE
    );
    xmock.register(
        URL.fn('DIM_SELECT_SAVE_CHART'),
        xmock.data.console.DimTree.DIM_SELECT_SAVE
    );

    // 维度多选控件
    xmock.register(
        URL.fn('DIM_MULTISELECT_TABLE'), 
        xmock.data.console.MultiSelect.MULTI_SELECT
    );
    xmock.register(
        URL.fn('DIM_MULTISELECT_CHART'), 
        xmock.data.console.MultiSelect.MULTI_SELECT
    );

    // 指标维度元数据
    xmock.register(
        URL.fn('META_CONDITION_IND_DIM_TABLE'),
        xmock.data.console.MetaCondition.META_CONDITION_IND_DIM
    );
    xmock.register(
        URL.fn('META_CONDITION_IND_DIM_CHART'),
        xmock.data.console.MetaCondition.META_CONDITION_IND_DIM
    );
    xmock.register(
        URL.fn('META_CONDITION_SELECT_TABLE'),
        xmock.data.console.MetaCondition.META_CONDITION_SELECT,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_SELECT_CHART'),
        xmock.data.console.MetaCondition.META_CONDITION_SELECT
    );
    xmock.register(
        URL.fn('META_CONDITION_LIST_SELECT_CHART'),
        xmock.data.console.MetaCondition.META_CONDITION_LIST_SELECT_CHART,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_LIST_SELECT_TABLE'),
        xmock.data.console.MetaCondition.META_CONDITION_LIST_SELECT_TABLE,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_COL_CONFIG_GET'),
        xmock.data.console.MetaCondition.META_CONDITION_COL_CONFIG_GET,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_COL_CONFIG_SUBMIT'),
        xmock.data.console.MetaCondition.META_CONDITION_COL_CONFIG_SUBMIT,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_CANDIDATE_INIT'),
        xmock.data.console.MetaCondition.META_CONDITION_CANDIDATE_INIT,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_CANDIDATE_SUBMIT'),
        xmock.data.console.MetaCondition.META_CONDITION_CANDIDATE_SUBMIT,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('META_CONDITION_ADD_SERIES_GROUP'),
        xmock.data.console.MetaCondition.META_CONDITION_ADD_SERIES_GROUP
    );
    xmock.register(
        URL.fn('META_CONDITION_REMOVE_SERIES_GROUP'),
        xmock.data.console.MetaCondition.META_CONDITION_REMOVE_SERIES_GROUP
    );

    // 图设置
    xmock.register(
        URL.fn('CONSOLE_CHART_CONFIG_INIT'),
        xmock.data.console.MetaCondition.CONSOLE_CHART_CONFIG_INIT,
        { timeoutMode: 1, timeout: 300 }
    );
    xmock.register(
        URL.fn('CONSOLE_CHART_CONFIG_SUBMIT'),
        xmock.data.console.MetaCondition.CONSOLE_CHART_CONFIG_SUBMIT,
        { timeoutMode: 1, timeout: 300 }
    );

    // 表单区数据
    xmock.register(
        URL.fn('FORM_DATA'),
        xmock.data.console.DIForm.FORM_DATA,
        { timeoutMode: 1, timeout: 500 }
    );    
    xmock.register(
        URL.fn('FORM_ASYNC_DATA'),
        xmock.data.console.DIForm.FORM_ASYNC_DATA,
        { timeoutMode: 1, timeout: 1300 }
    );    

    // 表格数据
    xmock.register(
        URL.fn('OLAP_TABLE_DATA'),
        xmock.data.console.DITable.OLAP_TABLE_DATA,
        { timeoutMode: 1, timeout: 299 }
    );
    xmock.register(
        URL.fn('OLAP_TABLE_DRILL'),
        xmock.data.console.DITable.OLAP_TABLE_DRILL
    );
    xmock.register(
        URL.fn('OLAP_TABLE_LINK_DRILL'),
        xmock.data.console.DITable.OLAP_TABLE_LINK_DRILL,
        { timeoutMode: 1, timeout: 3299 }
    );
    xmock.register(
        URL.fn('OLAP_TABLE_SORT'),
        xmock.data.console.DITable.OLAP_TABLE_SORT,
        { timeoutMode: 1, timeout: 299 }
    );
    xmock.register(
        URL.fn('OLAP_TABLE_CHECK'),
        xmock.data.console.DITable.OLAP_TABLE_CHECK
    );
    xmock.register(
        URL.fn('OLAP_TABLE_SELECT'),
        xmock.data.console.DITable.OLAP_TABLE_SELECT
    );

    // 图数据
    xmock.register(
        URL.fn('OLAP_CHART_DATA'),
        xmock.data.console.DIChart.OLAP_CHART_DATA,
        { timeoutMode: 1, timeout: 1000 }
    );
    xmock.register(
        URL.fn('LITEOLAP_CHART_DATA'),
        xmock.data.console.DIChart.OLAP_CHART_DATA,
        { timeoutMode: 1, timeout: 1000 }
    );
    xmock.register(
        URL.fn('OLAP_CHART_X_DATA'),
        xmock.data.console.DIChart.OLAP_CHART_DATA,
        { timeoutMode: 1, timeout: 1000 }
    );
    xmock.register(
        URL.fn('OLAP_CHART_S_DATA'),
        xmock.data.console.DIChart.OLAP_CHART_DATA,
        { timeoutMode: 1, timeout: 1000 }
    );
    xmock.register(
        URL.fn('OLAP_CHART_S_ADD_DATA'),
        xmock.data.console.DIChart.OLAP_CHART_DATA,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL.fn('OLAP_CHART_S_REMOVE_DATA'),
        xmock.data.console.DIChart.OLAP_CHART_DATA,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('PLANE_TABLE_INIT'),
        xmock.data.PLANE_TABLE_INIT,
        { timeoutMode: 1, timeout: 200 }
    );
    xmock.register(
        URL('PLANE_TABLE_SQL_SAVE'),
        xmock.data.PLANE_TABLE_SQL_SAVE,
        { timeoutMode: 1, timeout: 200 }
    );
    xmock.register(
        URL('PLANE_TABLE_COL_DATA'),
        xmock.data.PLANE_TABLE_COL_DATA,
        { timeoutMode: 1, timeout: 200 }
    );
    xmock.register(
        URL('PLANE_TABLE_COL_SAVE'),
        xmock.data.PLANE_TABLE_COL_SAVE,
        { timeoutMode: 1, timeout: 200 }
    );
    xmock.register(
        URL('PLANE_TABLE_COND_DATA'),
        xmock.data.PLANE_TABLE_COND_DATA,
        { timeoutMode: 1, timeout: 200 }
    );
    xmock.register(
        URL('PLANE_TABLE_COND_SAVE'),
        xmock.data.PLANE_TABLE_COND_SAVE,
        { timeoutMode: 1, timeout: 1000 }
    );
    xmock.register(
        URL('PLANE_TABLE_PREVIEW_DATA'),
        xmock.data.PLANE_TABLE_PREVIEW_DATA,
        { timeoutMode: 1, timeout: 1000 }
    );
    xmock.register(
        URL('PLANE_TABLE_DATA'),
        xmock.data.PLANE_TABLE_DATA,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('PLANE_TABLE_SELECT'),
        xmock.data.PLANE_TABLE_SELECT,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('ROWHEAD_CONFIG_INIT'),
        xmock.data.console.MetaCondition.ROWHEAD_CONFIG_INIT,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('ROWHEAD_CONFIG_SUBMIT'),
        xmock.data.console.MetaCondition.ROWHEAD_CONFIG_SUBMIT,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('DIMSHOW_CONFIG_INIT'),
        xmock.data.console.MetaCondition.DIMSHOW_CONFIG_INIT,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('DIMSHOW_CONFIG_SUBMIT'),
        xmock.data.console.MetaCondition.DIMSHOW_CONFIG_SUBMIT,
        { timeoutMode: 1, timeout: 500 }
    );

    xmock.register(
        URL('GET_TEMPLATE_INFO'),
        xmock.data.console.OLAPEditor.GET_TEMPLATE_INFO,
        { timeoutMode: 1, timeout: 500 }
    );

    xmock.register(
        URL('DATA_FORMAT_SET'),
        xmock.data.console.OLAPEditor.DATA_FORMAT_SET,
        { timeoutMode: 1, timeout: 500 }
    );

    xmock.register(
        URL('REPORT_ROWMERGE_KEY_SUBMIT'),
        xmock.data.console.MetaCondition.REPORT_ROWMERGE_KEY_SUBMIT,
        { timeoutMode: 1, timeout: 500 }

    );
    xmock.register(
        URL('REPORT_QUERY'),
        xmock.data.console.REPORT_QUERY,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('MOLD_QUERY'),
        xmock.data.console.MOLD_QUERY,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('PAHNTOMJS_INFO'),
        xmock.data.console.PAHNTOMJS_INFO,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('RTPL_CLONE_SAVE'),
        xmock.data.RTPL_CLONE_SAVE,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('RTPL_CLONE_CLEAR'),
        xmock.data.RTPL_CLONE_CLEAR,
        { timeoutMode: 1, timeout: 500 }
    );
    xmock.register(
        URL('RTPL_CLONE_GETDEFAULTIMAGENAME'),
        xmock.data.RTPL_CLONE_GET_DEFAULT_IMAGENAME,
        { timeoutMode: 1, timeout: 500 }
    );

})();