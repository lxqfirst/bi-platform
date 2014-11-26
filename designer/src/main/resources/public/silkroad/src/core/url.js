/**
 * @file: 报表配置端url信息
 * @author: lizhantong(lztlovely@126.com)
 * @date: 2014-08-22
 */

define(function () {

    //--------------------------------
    // 类型声明
    //--------------------------------

    var Url = {};

    var webRoot;

    var REPORTS = 'reports';
    var DATASOURCES = 'datasources';

    /**
     * 得到运行时的web base
     *
     * @public
     * @return {string} 运行时的web base
     */
    Url.getWebRoot = function() {
        return webRoot;
    };

    /**
     * 设置根路径
     *
     * @param {string} 根路径
     * @public
     */
    Url.setWebRoot = function(root) {
        if (root === '') {
            webRoot = root;
        } else {
            webRoot = root + '/';
        }
    };


    /**
     * 获取数据源的基本路径
     *
     * @param {string=} dataSourceId 数据源id
     * @private
     * @return {string} 数据源的基本路径
     */
    function getDataSourcesBaseUrl(dataSourceId) {
        return dataSourceId === undefined
            ? (webRoot + DATASOURCES)
            : (webRoot + DATASOURCES + '/' + dataSourceId);
    }

    /**
     * 获取报表的基本路径
     *
     * @param {string=} reportId 报表id
     * @private
     * @return {string} 报表的基本路径
     */
    function getReportsBaseUrl(reportId) {
        return reportId === undefined
            ? (webRoot + REPORTS)
            : (webRoot + REPORTS + '/' + reportId);
    }

    /**
     * 获取cube的基本路径
     *
     * @param {string} reportId 数据源id
     * @param {string} cubeId cube的id
     * @private
     * @return {string} cube的基本路径
     */
    function getCubesBaseUrl(reportId, cubeId) {
        return ''
            + getReportsBaseUrl(reportId)
            + '/cubes/'
            + cubeId;
    }

    /**
     * 获取组件区的基本路径
     *
     * @param {string} reportId 报表id
     * @param {string} componentId 组件的id
     * @private
     * @return {string} 组件区的基本路径
     */
    function getExtendAreaBaseUrl(reportId, componentId) {
        var url = getReportsBaseUrl(reportId);
        url = (componentId === undefined)
            ? (url + '/extend_area')
            : (url + '/extend_area/' + componentId);
        return url;
    }

    /**
     * 获取维度组的基本路径
     *
     * @param {string} dataSourceId 数据源id
     * @param {string} componentId 组件的id
     * @param {string=} groupId 维度组的id
     * @private
     * @return {string} 维度组的基本路径
     */
    function getDimGroupBaseUrl(reportId, cubeId, groupId) {
        var url = getCubesBaseUrl(reportId, cubeId);

        url = (groupId === undefined)
            ? (url + '/dim_groups')
            : (url + '/dim_groups/' + groupId);
        return url;
    }

    //--------------------------------
    // 公用URL
    //--------------------------------

    /**
     * 数据源列表模块
     * 获取数据源列表url
     *
     * @public
     * @return {string} url
     */
    Url.loadDataSourcesList = function () {
        return getDataSourcesBaseUrl();
    };

    /**
     * 数据源列表模块
     * 删除数据源url
     *
     * @param {string} dataSourceId 数据源id
     * @public
     * @return {string} url
     */
    Url.deleteDataSources = function (dataSourceId) {
        return getDataSourcesBaseUrl(dataSourceId);
    };

    /**
     * 数据源新建和编辑模块
     * 获取当前数据源详细信息
     *
     * @param {string} dataSourceId 报表id
     * @public
     * @return {string} url
     */
    Url.getCurrentDataSourceInfo = function (dataSourceId) {
        return getDataSourcesBaseUrl(dataSourceId);
    };

    /**
     * 数据源新建模块
     * 提交数据源详细信息
     *
     * @public
     * @return {string} url
     */
    Url.submitDataSourceInfoAdd = function () {
        return getDataSourcesBaseUrl();
    };

    /**
     * 数据源编辑模块
     * 提交数据源详细信息
     *
     * @param {string} dataSourceId 报表id
     * @public
     * @return {string} url
     */
    Url.submitDataSourceInfoUpdate = function (dataSourceId) {
        return getDataSourcesBaseUrl(dataSourceId);
    };

    /**
     * 数据源新建和编辑模块
     * 加载某一数据源所含的表
     *
     * @param {string} dataSourceId 报表id
     * @public
     * @return {string} url
     */
    Url.loadTables = function (dataSourceId) {
        return getDataSourcesBaseUrl(dataSourceId) + '/tables';
    };


    /**
     * 报表列表
     * 获取报表列表url
     *
     * @public
     * @return {string} url
     */
    Url.loadReportList = function () {
        return getReportsBaseUrl();
    };

    /**
     * 报表列表
     * 预览报表
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.showReport = function (reportId) {
        return getReportsBaseUrl(reportId) + '/preview_info';
    };

    /**
     * 报表列表
     * 删除报表url
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.deleteReport = function (reportId) {
        return getReportsBaseUrl(reportId);
    };

    /**
     * 报表列表
     * 新建报表url
     *
     * @public
     * @return {string} url
     */
    Url.addReport = function () {
        return getReportsBaseUrl();
    };

    /**
     * 报表列表
     * 复制报表url
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.copyReport = function (reportId) {
        return getReportsBaseUrl(reportId) +  '/duplicate';
    };

    /**
     * 报表新建（编辑）-维度设置模块
     * 获取维度设置模块默认信息列表url
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.getDimSetList = function (reportId) {
        return getReportsBaseUrl(reportId) + '/dim_config';
    };

    /**
     * 报表新建（编辑）-维度设置模块
     * 时间维度设置：如果是普通表，去后端获取普通标对应的信息
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.getDimDateRelationTableList = function (reportId, tableId) {
        return ''
            + getReportsBaseUrl(reportId)
            + '/tables/'
            + tableId;
    };

    /**
     * 报表新建（编辑）-维度设置模块
     * 提交维度设置模块的设置信息
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.submitDimSetInfo = function (reportId) {
        return getReportsBaseUrl(reportId) + '/dim_config';
    };

    /**
     * 报表新建（编辑）-cube设置模块
     * 加载选中的数据源（主要用于编辑时的数据还原）对应的url
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.loadSelectedDataSources = function (reportId) {
        return getReportsBaseUrl(reportId) + '/ds_id';
    };

    /**
     * 报表新建（编辑）-cube设置模块
     * 加载报表所对应的已经选中的cube的id数组对应的url
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.loadReportFactTableList = function (reportId) {
        return getReportsBaseUrl(reportId) + '/cube_tables';
    };

    /**
     * 报表新建（编辑）-cube设置模块
     * 提交报表设置对应的url
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.submitCubeSetInfo = function (reportId) {
        return getReportsBaseUrl(reportId) + '/star_models';
    };

    /**
     * 报表新建（编辑）-edit
     * getRuntimeId
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.getRuntimeId = function (reportId) {
        return getReportsBaseUrl(reportId) + '/runtime_model';
    };

    /**
     * 报表新建（编辑）-edit
     * loadCubeList
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.loadCubeList = function (reportId) {
        return getReportsBaseUrl(reportId) + '/cubes';
    };

    /**
     * 报表新建（编辑）-edit
     * loadIndList
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.loadIndList = function (reportId, cubeId) {
        return getCubesBaseUrl(reportId, cubeId) + '/inds';
    };

    /**
     * 报表新建（编辑）-edit
     * loadDimList
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.loadDimList = function (reportId, cubeId) {
        return getCubesBaseUrl(reportId, cubeId) + '/dims';
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 初始化json
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.initJson = function (reportId) {
        return getReportsBaseUrl(reportId) + '/json';
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 初始化Vm
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.initVm = function (reportId) {
        return getReportsBaseUrl(reportId) + '/vm';
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 新增组件
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.addComp = function (reportId) {
        return getReportsBaseUrl(reportId) + '/extend_area';
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 删除组件
     *
     * @param {string} reportId 报表id
     * @param {string} componentId 组件id
     * @public
     * @return {string} url
     */
    Url.deleteComp = function (reportId, componentId) {
        return getExtendAreaBaseUrl(reportId, componentId);
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 保存报表
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.saveReport = function (reportId) {
        return getReportsBaseUrl(reportId);
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 临时保存报表的json与vm
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.saveJsonVm = function (reportId) {
        return getReportsBaseUrl(reportId) + '/json_vm';
    };


    /**
     * 报表新建（编辑）-edit-canvas
     * 发布报表
     *
     * @param {string} reportId 报表id
     * @public
     * @return {string} url
     */
    Url.publishReport = function (reportId) {
        return getReportsBaseUrl(reportId) + '/publish';
    };


    Url.getPublishInfo = function (reportId) {
        return getReportsBaseUrl(reportId) + '/publish_info';
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 获取组件的数据关联配置（指标、维度、切片）
     *
     * @param {string} reportId 报表id
     * @param {string} componentId 组件id
     * @public
     * @return {string} url
     */
    Url.getCompAxis = function (reportId, componentId) {
        return getExtendAreaBaseUrl(reportId, componentId);
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 添加组件的数据关联配置（指标、维度、切片）
     *
     * @param {string} reportId 报表id
     * @param {string} componentId 组件id
     * @public
     * @return {string} url
     */
    Url.addCompAxis = function (reportId, componentId) {
        return getExtendAreaBaseUrl(reportId, componentId) + '/item';
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 删除组件的数据关联配置（指标、维度、切片）
     *
     * @param {string} reportId 报表id
     * @param {string} compId 报表组件id
     * @param {string} olapId 数据项id
     * @public
     * @return {string} url
     */
    Url.deleteCompAxis = function (reportId, componentId, olapId, axisType) {
        return ''
            + getExtendAreaBaseUrl(reportId, componentId)
            + '/item/'
            + olapId
            + '/type/'
            + axisType;
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 更换组件的中维度图形种类
     *
     * @param {string} reportId 报表id
     * @param {string} compId 报表组件id
     * @param {string} chartType 图形种类
     * @public
     * @return {string} url
     */
    Url.changeCompItemChartType = function (reportId, componentId, olapId, chartType) {
        return ''
            + getExtendAreaBaseUrl(reportId, componentId)
            + '/item/'
            + olapId
            + '/chart/'
            + chartType;
    };

    /**
     * 报表新建（编辑）-edit-canvas
     * 调序组件的数据关联配置（横轴，纵轴）
     *
     * @param {string} reportId 报表id
     * @param {string} compId 报表组件id
     * @public
     * @return {string} url
     */
    Url.sortingCompDataItem = function (reportId, compId) {
        return ''
            + getExtendAreaBaseUrl(reportId, compId)
            + '/item_sorting'
    };

    /**
     * 报表新建（编辑）-edit-drag-ind-dim
     * 维度指标的相互转换
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} from 从维度（dim）或指标（ind）
     * @param {string} to 到从维度（dim）或指标（ind）
     * @param {string} moveItemId 被移动的项id
     * @public
     * @return {string} url
     */
    Url.indDimSwitch = function (reportId, cubeId, from, to, moveItemId) {
        return ''
            + getCubesBaseUrl(reportId, cubeId)
            + '/'
            + from
            + '-to-'
            + to
            + '/'
            + moveItemId;
    };

    /**
     * 报表新建（编辑）-edit-drag-ind-dim
     * 维度到维度组
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} groupId 维度组id
     * @public
     * @return {string} url
     */
    Url.dimToGroup = function (reportId, cubeId, groupId) {
        return getDimGroupBaseUrl(reportId,cubeId, groupId) + '/dims';
    };

    /**
     * 报表新建（编辑）-edit-drag-ind-dim
     * 对维度组中的维度进行排序
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} groupId 维度组id
     * @public
     * @return {string} url
     */
    Url.sortSubDim = function (reportId, cubeId, groupId) {
        return ''
            + getDimGroupBaseUrl(reportId,cubeId, groupId)
            + '/dim_sorting';

    };

    /**
     * 报表新建（编辑）-edit-setting
     * 加载设置“数据源展示数据”的原始数据
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.loadShowData = function (reportId, cubeId) {
        return getCubesBaseUrl(reportId, cubeId) + 'show-config';
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 向后台提交“展示数据”这之后的结果
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.submitSowData = function (reportId, cubeId) {
        return getCubesBaseUrl(reportId, cubeId) + 'show-config';
    };

    /**
     * 报表新建（编辑）-edit-setting
     * putAggregator
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} indId ind的id
     * @public
     * @return {string} url
     */
    Url.putAggregator = function (reportId, cubeId, indId) {
        return ''
            + getCubesBaseUrl(reportId, cubeId)
            + '/inds/'
            + indId;
    };

    /**
     * 报表新建（编辑）-edit-setting
     * putName
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} type 指标：ind，维度：dim
     * @param indDimId 指标或维度的id
     * @public
     * @return {string} url
     */
    Url.putName = function (reportId, cubeId, type, indDimId) {
        return ''
            + getCubesBaseUrl(reportId, cubeId)
            + '/'
            + type
            + 's/'
            + indDimId;
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 删除维度组中的维度
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} indId ind的id
     * @public
     * @return {string} url
     */
    Url.deleteSubDim = function (reportId, cubeId, groupId, dimId) {
        return ''
            + getDimGroupBaseUrl(reportId, cubeId, groupId)
            + '/level/'
            + dimId;
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 删除维度组
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @param {string} groupId 维度组的id
     * @public
     * @return {string} url
     */
    Url.deleteDimGroup = function (reportId, cubeId, groupId) {
        return getDimGroupBaseUrl(reportId,cubeId, groupId);
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 创建维度组
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.createDimGroup = function (reportId, cubeId) {
        return getDimGroupBaseUrl(reportId,cubeId);
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 衍生指标管理-提交
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.submitDeriveIndsInfo = function (reportId, cubeId) {
        return getCubesBaseUrl(reportId, cubeId) + '/extend_measures';
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 删除指标
     *
     * @param {string} reportId 报表id
     * @param {string} cubeId cube的id
     * @public
     * @return {string} url
     */
    Url.deleteInd = function (reportId, cubeId, measureId) {
        return getCubesBaseUrl(reportId, cubeId)
            + '/extend_measures'
            + '/'
            + measureId;
    };

    /**
     * 报表新建（编辑）-edit-setting
     * 获取数据格式信息
     *
     * @param {string} reportId 报表id
     * @param {string} compId 组建区域的id
     * @public
     * @return {string} url
     */
    Url.getDataFormatList = function (reportId, compId) {
        return getExtendAreaBaseUrl(reportId, compId)
            + '/dataformat';
    };

    return Url;
});