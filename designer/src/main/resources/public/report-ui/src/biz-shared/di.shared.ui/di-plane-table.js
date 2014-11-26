/**
 * di.shared.ui.DIPlaneTable
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    DI 平面表视图组件（支持分页）
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */

$namespace('di.shared.ui');

(function () {
    
    //------------------------------------------
    // 引用 
    //------------------------------------------

    var UTIL = di.helper.Util;
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var assign = xutil.object.assign;
    var q = xutil.dom.q;
    var bind = xutil.fn.bind;
    var objKey = xutil.object.objKey;
    var getByPath = xutil.object.getByPath;
    var download = UTIL.download;
    var foreachDo = UTIL.foreachDo;
    var jsonStringify = baidu.json.stringify;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var INTERACT_ENTITY = di.shared.ui.InteractEntity;
    var ARG_HANDLER_FACTORY;

    $link(function () {
        ARG_HANDLER_FACTORY = di.shared.arg.ArgHandlerFactory;
    });
        
    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * DI 表视图组件
     * 
     * @class
     * @extends xui.XView
     * @param {Object} options
     */
    var DI_PLANE_TABLE = $namespace().DIPlaneTable = 
        inheritsObject(INTERACT_ENTITY);
    var DI_PLANE_TABLE_CLASS = DI_PLANE_TABLE.prototype;
    
    //------------------------------------------
    // 常量 
    //------------------------------------------

    /**
     * 定义
     */
    DI_PLANE_TABLE_CLASS.DEF = {
        // 暴露给interaction的api
        exportHandler: {
            sync: { datasourceId: 'DATA' },
            clear: {}
        },
        // 主元素的css
        className: 'di-plane-table',
        // model配置
        model: {
            clzPath: 'di.shared.model.DIPlaneTableModel'
        }
    };

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建View
     *
     * @private
     * @param {Object} options 参数
     */
    DI_PLANE_TABLE_CLASS.$createView = function (options) {
        var el = this.$di('getEl');

        this._uTable = this.$di('vuiCreate', 'mainTable');

        // 下载按钮
        this._uDownloadBtn = this.$di('vuiCreate', 'download');

        // 下载Excel按钮 add by MENGRAN at 2013-12-17
        this._uDownloadExcelBtn = this.$di('vuiCreate', 'downloadExcel');

        // 离线下载
        this._uOfflineDownloadBtn = this.$di('vuiCreate', 'offlineDownload');

        // 分页
        this._uPager = this.$di('vuiCreate', 'pager');
    };

    /**
     * 初始化
     *
     * @public
     */
    DI_PLANE_TABLE_CLASS.init = function () {
        var me = this;
        var key;
        var model = this.getModel();
        var table = this._uTable;
        var downloadBtn = this._uDownloadBtn;
        var downloadExcelBtn = this._uDownloadExcelBtn;
        var offlineDownloadBtn = this._uOfflineDownloadBtn;  
        var pager = this._uPager;

        // 事件绑定
        for (key in { 
                'DATA': 1, 
                'DRILL': 1, 
                'SORT': 1
            }
        ) {
            model.attach(
                ['sync.preprocess.' + key, this.$syncDisable, this, key],
                ['sync.result.' + key, this.$renderMain, this],
                ['sync.result.' + key, this.$handleDataLoaded, this],
                ['sync.error.' + key, this.$handleDataError, this],
                ['sync.complete.' + key, this.$syncEnable, this, key]
            );
        }
        key = 'OFFLINE_DOWNLOAD';
        model.attach(
            ['sync.preprocess.' + key, this.$syncDisable, this, key],
            ['sync.error.' + key, this.$handleOfflineDownloadError, this],
            ['sync.complete.' + key, this.$syncEnable, this, key]
        );
        model.attach(
            ['sync.preprocess.CHECK', this.$syncDisable, this, 'CHECK'],
            ['sync.result.CHECK', this.$handleRowAsync, this, false],
            ['sync.error.CHECK', this.$handleRowAsync, this, true],
            ['sync.complete.CHECK', this.$syncEnable, this, 'CHECK']
        );
        model.attach(
            ['sync.preprocess.SELECT', this.$syncDisable, this, 'SELECT'],
            ['sync.result.SELECT', this.$handleRowAsync, this, false],
            ['sync.error.SELECT', this.$handleRowAsync, this, true],
            ['sync.complete.SELECT', this.$syncEnable, this, 'SELECT']
        );

        model.init();

        table.onsort = bind(this.$handleSort, this);
        table.onrowclick = bind(this.$handleRowClick, this);
        table.onrowselect = bind(this.$handleRowCheck, this, 'rowselect', 'SELECT');
        table.onrowcheck = bind(this.$handleRowCheck, this, 'rowcheck', 'CHECK');
        table.onrowuncheck = bind(this.$handleRowCheck, this, 'rowuncheck', 'CHECK');
        table.oncelllinkbridge = bind(this.$handleLinkBridge, this);

        if (pager) {
            pager.onchange = bind(this.$handlePageChange, this);
            pager.onpagesizechange = bind(this.$handlePageSizeChange, this);
        }

        downloadBtn && (
            downloadBtn.onclick = bind(this.$handleDownload, this)
        );
        downloadExcelBtn && (
            downloadExcelBtn.onclick = bind(this.$handleDownloadExcel, this)
        );
        offlineDownloadBtn && (
            offlineDownloadBtn.attach('confirm', this.$handleOfflineDownload, this)
        );

        foreachDo(
            [
                table,
                downloadBtn,
                offlineDownloadBtn,
                pager
            ],
            'init'
        );

        this.$di('getEl').style.display = 'none';
    };

    /**
     * @override
     */
    DI_PLANE_TABLE_CLASS.dispose = function () {
        foreachDo(
            [
                this._uTable,
                this._uPager,
                this._uDownloadBtn,
                this._uDownloadExcelBtn,
                this._uOfflineDownloadBtn
            ],
            'dispose'
        );
        DI_PLANE_TABLE.superClass.dispose.call(this);
    };

    /**
     * 从后台获取数据并渲染
     *
     * @public
     * @event
     * @param {Object} options 参数
     */
    DI_PLANE_TABLE_CLASS.sync = function (options) {

        // 视图禁用
        /*
        var diEvent = this.$di('getEvent');
        var vd = diEvent.viewDisable;
        vd && this.getModel().attachOnce(
            ['sync.preprocess.DATA', vd.disable],
            ['sync.complete.DATA', vd.enable]
        );*/

        options = assign({ DI_querySessionClear: true }, options);
        if (this._uPager) {
            options.pageSize = this._uPager.getPageSize();
        }

        // 请求后台
        this.$sync(this.getModel(), 'DATA', options, this.$di('getEvent'));
    };

    /**
     * 视图清空
     *
     * @public
     * @event
     */
    DI_PLANE_TABLE_CLASS.clear = function () {
        foreachDo(
            [
                this._uTable,
                this._uPager
            ],
            'setData'
        );
    };

    /**
     * 渲染主体
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$renderMain = function (data, ejsonObj, options) {
        this.$di('getEl').style.display = '';

        foreachDo(
            [
                this._uTable,
                this._uPager,
                this._uDownloadBtn,
                this._uDownloadExcelBtn,
                this._uOfflineDownloadBtn               
            ],
            'diShow'
        );

        var setDataOpt = { diEvent: this.$diEvent(options) };

        // 表格
        this._uTable.$di('setData', data, setDataOpt);

        // 分页信息
        if (this._uPager) {
            if (data.pageInfo) {
                this._uPager.show();
                this._uPager.$di('setData', data.pageInfo, setDataOpt);
            }
            else {
                this._uPager.hide();
            }
        }

        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
    };

    /**
     * 窗口改变后重新计算大小
     *
     * @public
     */
    DI_PLANE_TABLE_CLASS.resize = function () {
        this._uTable && this._uTable.resize();
    };

    /**
     * 解禁操作
     *
     * @protected
     */
    DI_PLANE_TABLE_CLASS.enable = function () {
        foreachDo(
            [
                this._uTable,
                this._uPager,
                this._uDownloadBtn,
                this._uDownloadExcelBtn,
                this._uOfflineDownloadBtn
            ],
            'enable'
        );
        DI_PLANE_TABLE.superClass.enable.call(this);
    };

    /**
     * 禁用操作
     *
     * @protected
     */
    DI_PLANE_TABLE_CLASS.disable = function () {
        foreachDo(
            [
                this._uTable,
                this._uPager,
                this._uDownloadBtn,
                this._uDownloadExcelBtn,
                this._uOfflineDownloadBtn
            ],
            'disable'
        );
        DI_PLANE_TABLE.superClass.disable.call(this);
    };

    /**
     * 参见DIFactory中dimTagsList的描述
     *
     * @protected
     */
    DI_PLANE_TABLE_CLASS.getDimTagsList = function () {
        var dimTagsList =  ARG_HANDLER_FACTORY(
            [this, "getValue", this.$di("getId"), "table.rowChecked", "dimTagsList"],
            [this, "attrArr", "dimTagsList", "value"]
        )([{}])[0].dimTagsList;

        // 平面表的dimTagsList约定在前端拼成json传
        for (var i = 0, o; i < dimTagsList.length; i ++) {
            if (o = dimTagsList[i]) {
                dimTagsList[i] = jsonStringify(o);
            }
        }

        return dimTagsList;
    };

    /**
     * 下载操作
     *
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleDownload = function (wrap) {
        var commonParamGetter = this.$di('getCommonParamGetter');

        var url = URL('PLANE_TABLE_DOWNLOAD')
            + '?' + commonParamGetter();
        download(url, null, true);

        // 对于下载，不进行reportTemplateId控制，直接打开
        commonParamGetter.update();
    };

    /**
     * 下载Excel操作
     *
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleDownloadExcel = function (wrap) {
        var commonParamGetter = this.$di('getCommonParamGetter');

        var url = URL('PLANE_TABLE_DOWNLOADEXCEL')
            + '?' + commonParamGetter();
        download(url, null, true);

        // 对于下载，不进行reportTemplateId控制，直接打开
        commonParamGetter.update();
    };

    /**
     * 离线下载操作
     *
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleOfflineDownload = function () {
        var val = this._uOfflineDownloadBtn.getValue() || {};
        this.$sync(
            this.getModel(),
            'OFFLINE_DOWNLOAD',
            { email: val.email }
        );
    };

    /**
     * 报表跳转
     *
     * @protected
     * @param {string} linkBridgeType 跳转类型，值可为'I'(internal)或者'E'(external)
     * @param {string} url 目标url
     * @param {Object} options 参数
     */
    DI_PLANE_TABLE_CLASS.$handleLinkBridge = function (colDefItem, rowDefItem) {
        // FIXME
        // 参数不一样了，这个是原来olap的，后面修改
        this.$di(
            'linkBridge', 
            colDefItem.linkBridge, 
            URL('PLANE_TABLE_LINK_BRIDGE'),
            this.$di('getCommonParamGetter')(
                {
                    colUniqName: colDefItem.uniqueName,
                    rowUniqName: rowDefItem.uniqueName,
                    colDefineId: colDefItem.colDefineId
                }
            )
        );
    };    

    /**  
     * 行点击
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleRowClick = function (rowDefItem) {
        /**
         * 行点击事件
         *
         * @event
         */
        this.$di(
            'dispatchEvent',
            'rowclick',
            [{ uniqueName: rowDefItem.uniqueName }]
        );
    };

    /**  
     * 行选中
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleRowCheck = function (eventName, datasourceId, rowData, callback) {
        this.$sync(
            this.getModel(),
            datasourceId,
            { uniqueName: rowData.uniqueName },
            null,
            {
                rowData: rowData,
                eventName: eventName,
                callback: callback
            }
        );
    };

    /**  
     * 排序
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleSort = function (orderbyParamKey) {
        this.$sync(
            this.getModel(),
            'DATA',
            { orderbyParamKey: orderbyParamKey }
        );
    };

    /**  
     * 行选中
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleRowAsync = function (isFailed, data, ejsonObj, options) {
        var args = options.args;

        // 根据后台结果，改变行选中与否
        args.callback(data.selected);

        /**
         * line check模式下行选中和取消选中事件
         *
         * @event
         */
        this.$di(
            'dispatchEvent',
            args.eventName,
            [ assign({}, args.rowData) ]
        );
    };

    /**
     * 翻页
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handlePageChange = function (currentPage) {
        this.$sync(
            this.getModel(),
            'DATA',
            { 
                currentPage: currentPage,
                pageSize: this._uPager ? this._uPager.getPageSize() : void 0
            }
        );
    };

    /**
     * 页数改变
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handlePageSizeChange = function (pageSize) {
        this.$sync(
            this.getModel(),
            'DATA',
            { pageSize: pageSize }
        );
    };

    /**
     * 数据加载成功
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleDataLoaded = function (data, ejsonObj, options) {
        var datasourceId = options.datasourceId;    
        var value = this.$di('getValue');
        var args;
        var param = options.args.param;

        if (datasourceId == 'DATA') {
            args = [value];
        }
        else if (datasourceId == 'SORT') {
            args = [assign({}, param, ['field', 'orderby'])];
        }

        /**
         * 数据成功加载事件（分datasourceId）
         *
         * @event
         */
        this.$di(
            'dispatchEvent',
            this.$diEvent('dataloaded.' + datasourceId, options),
            args
        );

        if (datasourceId in { DATA: 1, SORT: 1 }) {
            /**
             * 数据改变事件（DRILL在逻辑上是添加数据，不算在此事件中）
             *
             * @event
             */
            this.$di(
                'dispatchEvent',
                this.$diEvent('datachange', options),
                [value]
            );
        }

        /**
         * 数据成功加载事件
         *
         * @event
         */
        this.$di(
            'dispatchEvent', 
            this.$diEvent('dataloaded', options), 
            [value]
        );

        /**
         * 真实使用的查询sql，在此输出
         */
        this.$di(
            'dispatchEvent', 
            this.$diEvent('outputexecinfo', options), 
            [{ data: data }]
        );
    };

    /**
     * 获取表格数据错误处理
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleDataError = function (status, ejsonObj, options) {
        this.$di('getEl').style.display = '';

        foreachDo(
            [
                this._uTable,
                this._uPager,
                this._uDownloadBtn,
                this._uDownloadExcelBtn,
                this._uOfflineDownloadBtn
            ],
            'diShow'
        ); 

        // 设置空视图
        this.clear();

        /**
         * 渲染事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('rendered', options));
        /**
         * 数据加载失败事件
         *
         * @event
         */
        this.$di('dispatchEvent', this.$diEvent('dataerror', options));
    };

    /**
     * 离线下载错误处理
     * 
     * @protected
     */
    DI_PLANE_TABLE_CLASS.$handleOfflineDownloadError = function (status, ejsonObj, options) {
        DIALOG.alert(LANG.SAD_FACE + LANG.OFFLINE_DOWNLOAD_FAIL);
    };

})();