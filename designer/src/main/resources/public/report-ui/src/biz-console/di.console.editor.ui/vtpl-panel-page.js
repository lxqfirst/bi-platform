/**
 * di.console.editor.ui.VTplPanelPage
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    视图模版编辑
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil
 */
$namespace('di.console.editor.ui');

(function() {

    //------------------------------------------
    // 引用 
    //------------------------------------------

    var DICT = di.config.Dict;
    var UTIL = di.helper.Util;
    var DIALOG = di.helper.Dialog;
    var LANG = di.config.Lang;
    var URL = di.config.URL;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var addEventListener = ecui.addEventListener;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var getByPath = xutil.object.getByPath;
    var parseParam = xutil.url.parseParam;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var $fastCreate = ecui.$fastCreate;
    var assign = xutil.object.assign;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var alert = di.helper.Dialog.alert;
    var confirm = di.helper.Dialog.confirm;
    var template = xutil.string.template;
    var getUID = xutil.uid.getUID;
    var ecuiCreate = UTIL.ecuiCreate;
    var foreachDoOri = UTIL.foreachDoOri;
    var ajaxRequest = baidu.ajax.request;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var textParam = xutil.url.textParam;
    var jsonParse = baidu.json.parse;
    var replaceIntoParam = xutil.url.replaceIntoParam;
    var UI_BUTTON = ecui.ui.Button;
    var assert = UTIL.assert;
    var PANEL_PAGE_MANAGER;
    var PANEL_PAGE_TAB_ADAPTER;
    var UI_TAB_CONTAINER = ecui.ui.TabContainer;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var DI_FACTORY;
    var COMMON_PARAM_FACTORY;
    var CUBE_CONFIG_PANEL;
    var PREVIEW_CONFIG_PANEL;

    $link(function() {
        GLOBAL_MODEL = di.shared.model.GlobalModel;
        DI_FACTORY = di.shared.model.DIFactory;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
        PANEL_PAGE_MANAGER = di.shared.model.PanelPageManager;
        PANEL_PAGE_TAB_ADAPTER = di.shared.model.PanelPageTabAdapter;
        CUBE_CONFIG_PANEL = di.console.shared.ui.CubeConfigPanel;
        PREVIEW_CONFIG_PANEL = di.console.shared.ui.PreviewConfigPanel;
    });

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 平面表编辑
     * 结构说明：
     *      1. 在本panelPage中，有若干子panelPage，每个是一个editor（如quickEidtor、codeEidtor）
     *      2. vtplPanelPage中，有vtpl真身，每个eidtor初始化时，会被调用doRefreshFork方法，
     *      自己从vtplPanelPage中clone一个vtpl副本，进行显示、编辑操作。
     *      每个editor在doRefreshFork时，会得到vtpl副本，进行编辑。
     *      3. 同一时间只能一个editor进行保存，一个eidtor点击了保存，会返回副本，
     *      然后vtplPanelPage负责合并到真身，然后doRefreshFork其他editor（并同时在各自的doRefrefhFork中刷新视图）。
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.dsId 平面表的后台数据源
     */
    var VTPL_PANEL_PAGE = $namespace().VTplPanelPage =
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                addClass(el, 'vtpl-panel-page');
                el.innerHTML = HTML_MAIN;
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var VTPL_PANEL_PAGE_CLASS = VTPL_PANEL_PAGE.prototype;

    //------------------------------------------
    // 模板
    //------------------------------------------

    var HTML_MAIN = [
        '<div class="vtpl-panel-page-btns">',
            // '<span>报表名：</span>',
            // '<input class="q-vtpl-name"/>',
            // '<span class="q-btn-save">保存</span>',
            '<span class="q-btn-pre">预发布</span>',
            '<span class="q-btn-release">正式发布</span>',
            '<span class="q-btn-preview">预览</span>',
        '</div>',
        '<div class="q-main"></div>'
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

    /**
     * 创建Model
     *
     * @private
     */
    function createModel(el, options) {
        this._mPanelPageManager = new PANEL_PAGE_MANAGER(
            { adapter: PANEL_PAGE_TAB_ADAPTER }
        );
        this._mVTplModel = options.vtplModel;
    }

    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        this._uPreBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-pre', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._uReleaseBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-release', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._uPreviewBtn = ecuiCreate(
            UI_BUTTON, 
            q('q-btn-preview', el)[0],
            null, 
            { primary: 'ui-button-g' }
        );
        this._uMainContainer = $fastCreate(
            UI_TAB_CONTAINER,
            q('q-main', this.getEl())[0],
            null,
            { primary: 'ui-tab' }
        );

        // 预览参数设置浮层
        this._uPreviewConfig = new PREVIEW_CONFIG_PANEL(
            { parent: this, panelTitle: '预览设置' }
        );

        // cube选择浮层
        this._uCubeConfigPanel = new CUBE_CONFIG_PANEL(
            { parent: this }
        );
    }

    /**
     * 初始化
     *
     * @public
     */
    VTPL_PANEL_PAGE_CLASS.init = function() {
        var me = this;

        // 为自己绑定vtpl mgr functions
        extend(this, this.vtplMgrGet(this));

        this._mPanelPageManager.inject(this._uMainContainer);
        this._mPanelPageManager.attach(
            ['page.active', this.$pageActiveHandler, this]
        );
        this._uCubeConfigPanel.attach(
            'select', this.$openEditor, this
        );

        this._uPreviewBtn.onclick = bind(this.doPreview, this);
        this._uPreBtn.onclick = bind(this.doPre, this);
        this._uReleaseBtn.onclick = bind(this.doRelease, this);

        // 现在toPre和toRelease都一直可用，不做disable处理了，因为后台现在没有状态纪录的地方。
        // 如果toPre和toRlease在不合适的时间执行了（比如还没有创建），则报错

        this._mPanelPageManager.init();
        this._uCubeConfigPanel.init();
        this._uPreviewConfig.init();
    };

    /**
     * @override
     */
    VTPL_PANEL_PAGE_CLASS.dispose = function() {
        this._mPanelPageManager.dispose();
        // TODO
        foreachDoOri(
            [
                this._uPreviewBtn,
                this._uPreBtn,
                this._uReleaseBtn,
                this._uPreviewConfig
            ],
            'dispose'
        );
        // this._uNameInput = null;
        VTPL_PANEL_PAGE.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     *
     * @param {Object} options
     * @param {Object} options.extraOpt 
     */
    VTPL_PANEL_PAGE_CLASS.$active = function(options) {
        function doOpen() {
                if (actName == 'CREATE' || actName == 'EDIT') {
                    var pg = me.openTab({ editorType: 'QUICK' });
                    me.openTab({ editorType: 'CODE' });
                    me._mPanelPageManager.select(pg.getPageId());
                    
                    //  每次打开新的tab页（创建或修改报表）时，调用$getSecondConditionConfig方法
                    //      预保存第二步的条件信息
                    me.$getSecondConditionConfig();
                }
                else {
                    me.openTab(
                        extend({ editorType: editorType }, options.extraOpt)
                    );
                }
        }
        
        var vtplModel = this._mVTplModel;
        var me = this;

        var act = options.act;
        var phase = options.phase;
        if (act) {
            // TODO
            // act[0] 暂时只支持 EDIT/CREATE, 暂不支持 VIEW

            // 值可为"EDIT#QUICK", "VIEW#QUICK", "CREATE#VTPL"等
            act = act.split('#');
            var actName = act[0];
            var editorType = act[1];

            var vtpl;
            if (actName == 'EDIT' || actName == 'VIEW' || actName == 'PREVIEW') {
                vtpl = this._vtpl = vtplModel.getVTpl(phase, options.vtplKey);
                // this._uNameInput.value = this._vtpl.vtplName;
            }
            else if (actName == 'CREATE') {
                vtpl = this._vtpl = vtplModel.getMold(options.moldKey);
            }

            if (actName != 'PREVIEW' && !this._vtplGot) {
                // 获取服务器上的vtpl
                this._mVTplModel.fetchRemoteVTpl(this._vtpl, doOpen);
                this._vtplGot = true;
            }
            else {
                doOpen();
            }

        }
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    VTPL_PANEL_PAGE_CLASS.$inactive = function(options) {
        // TODO
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_PANEL_PAGE_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) === 0 && this._bDisabled) {
            this._mPanelPageManager.forEachPage(
                function (pageId, page, index) {
                    page.enable(key);
                }
            );
            foreachDoOri(
                [
                    this._uPreviewBtn,
                    this._uPreBtn,
                    this._uReleaseBtn
                ],
                'enable',
                key
            );
            VTPL_PANEL_PAGE.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    VTPL_PANEL_PAGE_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            this._mPanelPageManager.forEachPage(
                function (pageId, page, index) {
                    page.disable(key);
                }
            );
            foreachDoOri(
                [
                    this._uPreviewBtn,
                    this._uPreBtn,
                    this._uReleaseBtn
                ],
                'disable',
                key
            );
        }
        VTPL_PANEL_PAGE.superClass.disable.call(this);
    };

    /**
     * 页面选中后的行为
     */
    VTPL_PANEL_PAGE_CLASS.$pageActiveHandler = function(menuId) {
        // TODO
    };

    /**
     * 打开cube选择面板
     */
    VTPL_PANEL_PAGE_CLASS.openCubeConfigPanel = function(reportType) {
        this._uCubeConfigPanel.changeReportType(reportType);
        this._uCubeConfigPanel.open();
    };

    /**
     * 开始进入页面的操作
     * (注意：这是统一入口，所有需要开子panel page时候，都从这里进入)
     * 
     * @public
     * @param {Object} options
     * @param {string} act
     * @param {string} reportType
     * @param {string=} reportTemplateId
     * @param {string=} vtplKey
     */
    VTPL_PANEL_PAGE_CLASS.openTab = function(options) {
        var editorType = options.editorType;
        var reportTemplateId = options.reportTemplateId;
        var pageOpt = extend({}, options);
        var panelPageManager = this._mPanelPageManager;
        var vtpl = this._vtpl;

        extend(
            pageOpt, 
            {
                pageId: ({
                        CODE: editorType,
                        QUICK: editorType,
                        RTPL_OLAP_TABLE: reportTemplateId || editorType + getUID(),
                        RTPL_OLAP_CHART: reportTemplateId || editorType + getUID(),
                        RTPL_PLANE_TABLE: reportTemplateId || editorType + getUID(),
                        PREVIEW: reportTemplateId || editorType + getUID()
                    })[editorType],
                pageClz: ({
                        CODE: 'di.console.editor.ui.VTplCodeEditor',
                        QUICK: 'di.console.editor.ui.VTplQuickEditor',
                        RTPL_OLAP_TABLE: 'di.console.editor.ui.OLAPEditor',
                        RTPL_OLAP_CHART: 'di.console.editor.ui.OLAPEditor',
                        RTPL_PLANE_TABLE: 'di.console.editor.ui.PlaneEditor',
                        PREVIEW: 'di.console.shared.ui.ReportPreview'
                    })[editorType],
                pageTitle: ({
                        CODE: '源码编辑(请慎用)',
                        QUICK: '快速编辑',
                        RTPL_OLAP_TABLE: '数据集编辑（多维透视表）',
                        RTPL_OLAP_CHART: '数据集编辑（图）',
                        RTPL_PLANE_TABLE: '数据集编辑（平面表）',
                        PREVIEW: '预览'
                    })[editorType],
                reportType: editorType,
                vtplModel: this._mVTplModel,
                panelPageManager: panelPageManager,
                vtplPanelPage: this
            }
        );

        assert(pageOpt.pageId, 'reportTempalteId is null')

        var page = panelPageManager.openByURI(pageOpt.pageClz, pageOpt, oncreate);
        // 挂载事件
        page.attach('rtpl.created', this.doCreated, this);

        return page;

        function oncreate(page) {
            page.doRefreshFork && page.doRefreshFork(vtpl.clone());
        }
    };

    /**
     * 打开后台模版编辑tab页
     */
    VTPL_PANEL_PAGE_CLASS.$openEditor = function(menuItem) {
        var arr = menuItem.menuUrl.split('?');
        this.openTab(parseParam(arr[1]));
    };

    /**
     * 响应rtpl created
     */
    VTPL_PANEL_PAGE_CLASS.doCreated = function(menuItem) {
        this._mPanelPageManager.forEachPage(function (pageId, page, index) {
            page.doCreated && page.doCreated();
        });
    };

    /**
     * 保存
     */
    VTPL_PANEL_PAGE_CLASS.doSave = function(who) {
        var me = this;
        var vtplBase = this._vtpl;
        var vtplModel = this._mVTplModel;
        var panelPageManager = this._mPanelPageManager;

        var otherEditing = this.$getOtherEditing(who);
        if (otherEditing.length) {
            // 提示：其他页面已经修改，是否放弃
            confirm(
                LANG.OTHER_EDITING(otherEditing),
                $doSave
            );
        }
        else {
            $doSave();
        }

        function $doSave() {
            try {
                var result = who.doSave();
                if (result.errorMsg.length) {
                    alert(LANG.SAD_FACE + result.errorMsg.join(' | '));
                    return;
                }
                
                //  -------------------- 来自xlst的分割线  [begin] --------------------
                //  分割线内的代码，为了防止发生handler丢失
                /*
                 * 本方案实现：
                 * ①创建或修改报表时，先预保存第二步的条件信息；
                 * ②在没有点击第二步而直接点【保存】时，会从预保存的数据中，获取第二步的查询条件 填充发送数据；
                 * ③如果点击了第二步，则使用系统原来的默认逻辑处理，本方案不进行额外干预。
                 */
                var secondConditionConfig = me._mVTplModel._oSecondConditionConfig;
                //  如果有更好的bug解决方案，请直接去掉本if（或设条件恒假），很方便的，大胆改吧！
                if (secondConditionConfig) {
                    var isArray = xutil.lang.isArray;
                    
                    var rtplId;
                    var rtplCond = result.vtplFork.rtplCond;
                    //  简单遍历，没有使用hasOwnProperty做严格判断（很奇怪工具库竟然没有遍历数组或对象的方法？是不是要继续吐槽？）
                    for (rtplId in rtplCond) {
                        //  这个if可能有点多余，但 小心驶得万年船（目前仅针对数组类型的参数，暂不明确是否有其它类型的参数需要填充）
                        if (isArray(rtplCond[rtplId])) {
                            //  谁说 我们一定要走别人的路，谁说 辉煌背后没有痛苦，只要为了梦想不服输，再苦也不停止脚步
                            result.vtplFork.rtplCond[rtplId] = secondConditionConfig[rtplId];
                        }
                    }
                    //  由于vtpl.js的condSubmitGet方法会分发复制'RTPL_VIRTUAL_ID'属性，所以上面的for，将导致部分属性重复
                    //      可以考虑改for为if，只从secondConditionConfig中取出'RTPL_VIRTUAL_ID'属性。
                    //      但目前系统的后台可能需要重新设计，因此谨慎考虑之后，决定这里 还是多发送了一些数据（对后台没有影响）。
                }
                //  -------------------- 来自xlst的分割线 [end] --------------------

                // 禁用
                me.disable('VTPL_PANEL_PAGE#DO_SAVE');

                vtplModel.sync(
                    {
                        datasourceId: 'SAVE_TPL',
                        args: { vtpl: result.vtplFork },
                        result: $saveSuccess,
                        error: $saveFail,
                        complete: $saveComplete
                    }
                );
            }
            catch (e) {
                alert(LANG.SOME_ERROR + ' info: ' + e.message);
            }
        }

        function $saveSuccess(data, ejsonObj, options) {
            // 回写合并
            vtplBase.replaceWith(options.args.vtpl);

            // 改状态
            vtplBase.statusUpdate('SAVED');
            if (data.virtualTemplateId) {
                // 不更新vtpl内部的vritualTemplateId，前端永远是"RTPL_VIRTUAL_ID"
                // 因为如果更新的话，要更新视图，更新fork，牵扯太多
                // 只更新外层的vtplKey即可
                vtplBase.vtplKey = data.virtualTemplateId;
            }

            // 所有页面解除禁用，刷新fork和视图，去除正在编辑的标记
            panelPageManager.forEachPage(
                function (pageId, page) {
                    panelPageManager.mark(page.getPageId(), false);
                    page.doRefreshFork && page.doRefreshFork(vtplBase.clone());
                    page.$__editing = false;
                }
            );

            alert(LANG.SMILE_FACE + LANG.SAVE_SUCCESS);
        }

        function $saveFail(status) {
            alert(LANG.SAD_FACE + LANG.SAVE_FAIL + ' （信息码：' + status + '）');
        }

        function $saveComplete() {
            me.enable('VTPL_PANEL_PAGE#DO_SAVE')
        }
    };

    /**
     * 发布预览
     */
    VTPL_PANEL_PAGE_CLASS.doPre = function() {
        var vtpl = this._vtpl;

        if (vtpl.status == 'MOLD') {
            alert(LANG.NEED_CREATE);
            return;
        } 

        this._mVTplModel.sync(
            {
                datasourceId: 'TO_PRE',
                args: { vtpl: vtpl },
                result: function () {
                    alert(LANG.SMILE_FACE + LANG.OPT_SUCCESS);
                }
            }
        );
    };

    /**
     * 正式上线
     */
    VTPL_PANEL_PAGE_CLASS.doRelease = function() {
        var vtpl = this._vtpl;

        if (vtpl.status == 'MOLD') {
            alert(LANG.NEED_CREATE);
            return;
        } 

        this._mVTplModel.sync(
            {
                datasourceId: 'TO_RELEASE',
                args: { vtpl: vtpl },
                result: function () {
                    alert(LANG.SMILE_FACE + LANG.OPT_SUCCESS);
                }
            }
        );
    };

    /**
     * 预览
     */
    VTPL_PANEL_PAGE_CLASS.doPreview = function() {
        var me = this;
        var vtpl = this._vtpl;
        if (vtpl.status == 'MOLD') {
            // 未保存的禁止preview
            alert('新报表尚未保存，请先保存再Preview');
            return;
        }
        this._uPreviewConfig.open(
            'EDIT', 
            { 
                vtplKey: vtpl.vtplKey,
                onconfirm: function (options) {
                    me.openTab(
                        { 
                            editorType: 'PREVIEW', 
                            reportURL: options.reportURL,
                            data: options.data,
                            vtplKey: vtpl.vtplKey
                        }
                    );
                }
            }
        );
    };

    /**
     * 得到vtpl编辑相关方法，各个子编辑器公用
     */
    VTPL_PANEL_PAGE_CLASS.vtplMgrGet = function(editor) {
        var vtplPanelPage = this;
        var pageMgr = this._mPanelPageManager;

        // 开始编辑统一走的函数
        function startEdit(who) {
            // 界面上标记表示在编辑未保存
            pageMgr.mark(who.getPageId(), true);
            // 标记正在编辑
            who.$__editing = true;
            who.doStartEdit && who.doStartEdit();

            //TODO
            // 检查别的是否在编辑，如果在，则提示
        }

        return {
            /**
             * 子editor中，所有编辑操作，都要用这个包一下。
             */
            bindEditFn: function (fn, scope, args) {
                args = Array.prototype.slice.call(arguments, 2);

                return function () {
                    // 这里用了try catch，理论上不能出错，但是目前需求变化大，同时又边开发边使用，
                    // 所以前后端错误难避免。错误后继续编辑，结果更糟糕。所以catch后禁用本编辑面板。
                    try {
                        startEdit(editor);
                        fn.apply(scope || this, Array.prototype.concat.call(args, arguments));
                    }
                    catch (e) {
                        vtplPanelPage.disable();
                        alert(LANG.SOME_ERROR + ' \n' + (e.message || ''));
                        throw e;
                    }
                }
            }
        }
    };

    /**
     * 得到别的正在编辑的tab页
     */
    VTPL_PANEL_PAGE_CLASS.$getOtherEditing = function(who) {
        var others = [];
        this._mPanelPageManager.forEachPage(
            function (pageId, page) {
                if (who != page && page.$__editing) {
                    others.push(page.getPageTitle());
                }
            }
        );
        return others;
    };
    
    /**
     * 本方法应用背景：防止发生handler丢失。
     * “预获取”第二步查询条件，并保存在vtplModel中。
     * 另：本方法参考自vtpl-quick-editor.js的$startCondPhase，并做了适量简化。
     * TODO 将方法移至vtpl-model.js中，或许更合适些。
     */
    VTPL_PANEL_PAGE_CLASS.$getSecondConditionConfig = function () {
        var me = this;
        var vtplFork = this._vtpl;
        
        this._mVTplModel.sync({
            //  datasourceId及args 同$startCondPhase方法
            datasourceId: 'EXIST_COND',
            args: {
                reportTemplateIdList: vtplFork.rtplIdGet(true),
                virtualTemplateId: vtplFork.vtplKey
            },
            //  简化了result，仅将数据保存在vtplModel中
            result: function (data, ejsonObj, options) {
                me._mVTplModel._oSecondConditionConfig = data.templateDims || {};
            },
            //  若因网络及其它原因，导致数据获取失败，则建议用户刷新重试（为了防止handler丢失）
            error: function (status, ejsonObj, options) {
                alert('第二步查询条件获取失败，请刷新页面重试！');
            }
        });
    };

})();