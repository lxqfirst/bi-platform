/**
 * di.console.editor.ui.PlaneEditor
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    平面表编辑
 * @author:  xxx(xxx)
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
    var AJAX = di.config.Ajax;
    var inheritsObject = xutil.object.inheritsObject;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var extend = xutil.object.extend;
    var objKey = xutil.object.objKey;
    var q = xutil.dom.q;
    var children = xutil.dom.children;
    var bind = xutil.fn.bind;
    var trim = xutil.string.trim;
    var template = xutil.string.template;
    var preInit = UTIL.preInit;
    var getUID = xutil.uid.getUID;
    var htmlText = xutil.string.htmlText;
    var stringifyParam = xutil.url.stringifyParam;
    var cmptCreate4Console = UTIL.cmptCreate4Console;
    var cmptSync4Console = UTIL.cmptSync4Console;
    var ecuiCreate = UTIL.ecuiCreate;
    var $fastCreate = ecui.$fastCreate;
    var isString = xutil.lang.isString;
    var foreachDoOri = UTIL.foreachDoOri;
    var PANEL_PAGE = di.shared.ui.PanelPage;
    var UI_CONTROL = ecui.ui.Control;
    var alert = di.helper.Dialog.alert;
    var UI_BUTTON = ecui.ui.Button;
    var UI_SELECT = ecui.ui.Select;
    var UI_INPUT = ecui.ui.Input;
    var BASE_CONFIG_PANEL = di.shared.ui.BaseConfigPanel;
    var PLANE_EDITOR_MODEL;
    var DI_FACTORY;
    var COMMON_PARAM_FACTORY;

    $link(function() {
        DI_FACTORY = di.shared.model.DIFactory;
        PLANE_EDITOR_MODEL = di.console.editor.model.PlaneEditorModel;
        COMMON_PARAM_FACTORY = di.shared.model.CommonParamFactory;
    });

    //------------------------------------------
    // 类型声明 
    //------------------------------------------

    /**
     * 平面表编辑
     * 
     * @class
     * @extends di.shared.ui.PanelPage
     * @param {Object} options
     * @param {string} options.dsId 平面表的后台数据源
     */
    var PLANE_EDITOR = $namespace().PlaneEditor =
        inheritsObject(
            PANEL_PAGE,
            function(options) {
                var el = options.el;
                var css = 'plane-editor';
                addClass(el, css);
                el.innerHTML = template(SNIPPET_MAIN, { css: css });
                createModel.call(this, el, options);
                createView.call(this, el, options);
            }
        );
    var PLANE_EDITOR_CLASS = PLANE_EDITOR.prototype;

    /**
     * 映射关系浮层
     */
    var MAPPING_CONFIG = inheritsObject(
            BASE_CONFIG_PANEL,
            function(options) {
                this.DATASOURCE_ID_MAPPING = options.dsMapping;
                this._sConfigType = options.configType;
            }
        );
    var MAPPING_CONFIG_CLASS = MAPPING_CONFIG.prototype;

    //------------------------------------------
    // 模板
    //------------------------------------------

    var SNIPPET_MAIN = [
        '<div class="#{css}-sql">',
            '<div class="#{css}-name">',
                '<span>数据集名：</span>',
                '<span></span>',
            '</div>',
            '<div class="#{css}-desc">请输入SQL（例如：selec {a.col1}, {b.col2} from table1, table2 where [a.col1=:col1 ] and [b.col2 =:cols2 ]）</div>',
            '<div class="#{css}-sql-input"></div>',
            '<div class="#{css}-btns">',
                '<span class="ui-button">保存</span>',
                '<span class="ui-button">设置列</span>',
                '<span class="ui-button">设置映射</span>',
                '<span class="ui-button">预览</span>',
            '</div>',
            '<div>',
            '<div class="#{css}-label-line">真实执行的SQL：</div>',
            '<div class="#{css}-sql-actual"></div>',
        '</div>',
        '<div class="#{css}-preview">',
            '<div class="#{css}-data q-di-data"></div>',
        '</div>'
    ].join('');

    //------------------------------------------
    // 方法
    //------------------------------------------

   function createDIEntity(el, commonParamGetter) {
        // 图或者pivot表
        var dataOpt = {};
        var cmptEl = q('q-di-data', el)[0];
        var depict;

        createTable();

        return cmptCreate4Console(DI_FACTORY(), depict, commonParamGetter);

        // 创建plane图组件
        function createTable() {
            var cmptId = "snpt-CONSOLE.cpnt-CONSOLE-plane-table-" + getUID();
            var vuiTableId = "snpt-CONSOLE.vu-CONSOLE-plane-table-" + getUID();
            var vuiPagerId = "snpt-CONSOLE.vu-CONSOLE-pager-" + getUID();
            var vuiDownloadId = "snpt-CONSOLE.vu-CONSOLE-download-" + getUID();
            var vuiDownloadExcelId = "snpt-CONSOLE.vu-CONSOLE-downloadExcel-" + getUID();
            
            cmptEl.innerHTML = [
                '<div class="q-di-table-area di-table-area">',
                    '<div class="q-di-download"></div>',
                    '<div class="q-di-downloadExcel"></div>',
                    '<div class="q-di-table plane-table"></div>',
                    '<div class="q-di-pager"></div>',
                '</div>'
            ].join('');

            depict = [
                {
                    "id": cmptId,
                    "clzType": "COMPONENT",
                    "clzKey": "DI_PLANE_TABLE",
                    "el": cmptEl,
                    "vuiRef": {
                        "mainTable": vuiTableId,
                        "pager": vuiPagerId,
                        "download": vuiDownloadId,
                        "downloadExcel": vuiDownloadExcelId
                    }
                },
                { 
                    "id": vuiPagerId,
                    "clzType": "VUI",
                    "clzKey": "ECUI_PAGER",
                    "el": q('q-di-pager', cmptEl)[0]
                },
                {
                    "id": vuiDownloadId,
                    "clzType": "VUI",
                    "clzKey": "H_BUTTON",
                    "el": q('q-di-download', cmptEl)[0],
                    "dataOpt": { 
                        "skin": "ui-download-btn",
                        "text": "CSV下载"
                    }
                },
                {
                    "id": vuiDownloadExcelId,
                    "clzType": "VUI",
                    "clzKey": "H_BUTTON",
                    "el": q('q-di-downloadExcel', cmptEl)[0],
                    "dataOpt": { 
                        "skin": "ui-download-btn",
                        "text": "Excel下载"
                    }
                },
                { 
                    "id": vuiTableId, 
                    "clzType": "VUI",
                    "clzKey": "ECUI_SLOW_PLANE_TABLE",
                    "el": q('q-di-table', cmptEl)[0],
                    "dataOpt": {
                        "rowHCellCut": 30,
                        "hCellCut": 30,
                        "cCellCut": 30,
                        "vScroll": false,
                        "rowCheckMode": "SELECT"
                    }
                }
            ];
        }
    }

    /**
     * 创建Model
     *
     * @private
     */
    function createModel(el, options) {
        this._mModel = new PLANE_EDITOR_MODEL(options);

        // 绑定默认方法   
        this._mModel.ajaxOptions = {
            defaultFailureHandler:
                bind(this.$defaultFailureHandler, this)
        };

        this._sStatus = options.reportTemplateId ? 'EXIST' : 'NEW';
    }

    /**
     * 创建View
     *
     * @private
     */
    function createView(el, options) {
        var model = this._mModel;
        var me = this;
        var css = 'plane-editor';

        this._uNameInput = ecuiCreate(
            UI_INPUT, 
            q(css + '-name', el)[0].lastChild
        );

        this._uSqlInput = CodeMirror(
            q(css + '-sql-input', el)[0],
            {
                theme: "rubyblue",
                mode:  "text/x-mysql",
                lineNumbers: true,
                matchBrackets: true,
                indentUnit: 4,
                smartIndent: false
            }            
        );

        this._uSqlActual = CodeMirror(
            q(css + '-sql-actual', el)[0],
            {
                theme: "rubyblue",
                mode:  "text/x-mysql",
                lineNumbers: true,
                matchBrackets: true,
                indentUnit: 4,
                smartIndent: false
            }            
        );

        var els = children(q(css + '-btns', el)[0]);
        this._uSqlSaveBtn = ecuiCreate(UI_BUTTON, els[0], null, { primary: 'ui-button-g' });
        this._uColBtn = ecuiCreate(UI_BUTTON, els[1], null, { primary: 'ui-button' });
        this._uCondBtn = ecuiCreate(UI_BUTTON, els[2], null, { primary: 'ui-button' });
        this._uPreviewBtn = ecuiCreate(UI_BUTTON, els[3], null, { primary: 'ui-button' });

        this._uColConfig = new MAPPING_CONFIG(cfg('COL_DATA', 'COL_SAVE', 'col'));
        this._uCondConfig = new MAPPING_CONFIG(cfg('COND_DATA', 'COND_SAVE', 'cond'));
        this._uPreviewConfig = new MAPPING_CONFIG(cfg('PREVIEW_DATA', void 0, 'preview'));

        function cfg(init, submit, configType) {
            return { 
                dsMapping: { INIT: init, SUBMIT: submit },
                configType: configType, 
                model: model,
                parent: me
            };
        }

        this.$switchConfigBtns('disable');

        // 图或者表
        this._uDIData = createDIEntity(el, model.getCommonParamGetter());
        this._mDIDataModel = this._uDIData.getModel();
    }

    /**
     * 初始化
     *
     * @public
     */
    PLANE_EDITOR_CLASS.init = function() {
        this._mModel.attach(
            ['sync.preprocess.SQL_SAVE', this.disable, this, 'PLANE_EDITOR'],
            ['sync.complete.SQL_SAVE', this.enable, this, 'PLANE_EDITOR'],
            ['sync.result.SQL_SAVE', handleSaved, this],
            ['sync.result.INIT', handleInit, this],
            ['sync.error.INIT', handleInitError, this]
        );

        // 暂用策略：查询返回前，禁止一切操作
        this._mDIDataModel.attach(
            ['sync.preprocess.DATA', this.disable, this, 'PLANE_EDIROT'],
            ['sync.complete.DATA', this.enable, this, 'PLANE_EDIROT']
        );

        var me = this;
        this._uSqlSaveBtn.onclick = function() {
            var txt = me._uSqlInput.getValue();
            var name = me._uNameInput.getValue();
            if (!(txt = trim(txt))) {
                return;
            }

            me._mModel.sync(
                {
                    datasourceId: 'SQL_SAVE',
                    args: { sqlString: txt, reportTemplateName: name }
                }
            );
        };
        function handleSaved () {
            // 点击保存返回后，解禁            
            me.$switchConfigBtns('enable');
            if (me._sStatus == 'NEW') {
                me.notify('rtpl.created');
            }
            me._sStatus = 'EXIST';
            me.notify('rtpl.saved');
        }
        function handleInit (data) {
            me._uSqlInput.setValue(data.sqlString || '');
            me._uNameInput.setValue(data.reportTemplateName || '');
        }
        function handleInitError (status) {
            me.disable();
        }

        this._uColBtn.onclick = function () {
            me._uColConfig.open();
        };
        this._uCondBtn.onclick = function () {
            me._uCondConfig.open();
        };
        this._uPreviewBtn.onclick = function () {
            me._uPreviewConfig.open();
        };

        this._uSqlInput.on(
            'change',
            function () {
                // sql一改变，就禁用这个操作，除非点击保存后，解禁
                me.$switchConfigBtns('disable');
            }
        );

        this._uDIData.$di(
            'addEventListener',
            'outputexecinfo',
            function (result) {
                // 打印真实执行的sql便于检查
                this._uSqlActual.setValue(result.data.actualSql);
                if(result.data.exception){
                    DIALOG.alert(LANG.SAD_FACE + "SQL解析执行出错，原因如下：<br>" +result.data.exception);
                }
            },
            this
        );

        foreachDoOri(
            [
                // this._uSqlInput,
                this._uColBtn,
                this._uCondBtn,
                this._uPreviewBtn,
                this._uColConfig,
                this._uCondConfig,
                this._uPreviewConfig
            ],
            'init'
        );
        this._uDIData.$di('init');

        // 开始init请求
        this._mModel.sync({ datasourceId: 'INIT' });
    };

    /**
     * @override
     */
    PLANE_EDITOR_CLASS.dispose = function() {
        foreachDoOri(
            [
                // this._uSqlInput,
                this._uNameInput,
                this._uSqlSaveBtn,
                this._uColBtn,
                this._uCondBtn,
                this._uPreviewBtn,
                this._uColConfig,
                this._uCondConfig,
                this._uPreviewConfig
            ],
            'dispose'
        );
        this._uDIData.$di('dispose');
        PLANE_EDITOR.superClass.dispose.call(this);
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage
     */
    PLANE_EDITOR_CLASS.$active = function() {
    };

    /**
     * @override
     * @see di.shared.ui.PanelPage     
     */
    PLANE_EDITOR_CLASS.$inactive = function() {
    };

   /**
     * 解禁操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    PLANE_EDITOR_CLASS.enable = function(key) {
        objKey.remove(this, key);

        if (objKey.size(this) === 0 && this._bDisabled) {
            // this._uSqlInput.enable();
            this._uSqlSaveBtn.enable();
            this.$switchConfigBtns('enable');
            PLANE_EDITOR.superClass.enable.call(this);
        }
    };

    /**
     * 禁用操作
     *
     * @protected
     * @param {string} key 禁用者的标志
     */
    PLANE_EDITOR_CLASS.disable = function(key) {
        objKey.add(this, key);

        if (!this._bDisabled) {
            // this._uSqlInput.disable();
            this._uSqlSaveBtn.disable();
            this.$switchConfigBtns('disable');
        }
        PLANE_EDITOR.superClass.disable.call(this);
    };

    /**
     * 严重错误处理
     * 
     * @protected
     */
    PLANE_EDITOR_CLASS.$handleFatalError = function(status) {
        this.disable();
        // 参数校验失败
        if (status == 1001) {
            DIALOG.alert(LANG.SAD_FACE + LANG.PARAM_ERROR);
        }
        else {
            DIALOG.alert(LANG.SAD_FACE + LANG.FATAL_DATA_ERROR);
        }
    };

    PLANE_EDITOR_CLASS.$switchConfigBtns = function(method) {
        this._uColBtn[method]();
        this._uCondBtn[method]();
        this._uPreviewBtn[method]();
    };


    /**
     * 请求失败的默认处理
     *
     * @protected
     */
    PLANE_EDITOR_CLASS.$defaultFailureHandler = function (status, ejsonObj) {
        if (status == AJAX.ERROR_RTPL_ID) {
            alert(LANG.SAD_FACE + LANG.ERROR_RTPL_ID);
        }
        else {
            alert(LANG.SAD_FACE + LANG.ERROR);
        }
    };    

    //------------------------------------------
    // 浮层相关方法 
    //------------------------------------------

    /**
     * 查询请求
     * 
     * @protected
     */
    MAPPING_CONFIG_CLASS.$doSubmit = function() {
        if (this._sConfigType == 'preview') {
            // 从preview mapping中取data
            var par = this._uParent;
            var data = {};

            var args = this.$doGetSubmitArgs();
            if (isString(args)) {
                // 表示验证失败，不提交
                alert(args);
                return;
            }

            var json = par._mModel.getMappingConfig();
            for (var i = 0, o; o = json[i]; i ++) {
                data[o.paramKey] = o.paramValue;
            }
            data.showColumns = args.showColumns;

            // plane table component sync开始
            cmptSync4Console(DI_FACTORY(), par._uDIData, data);
        }
        else {
            // col和cond等情况，都是直接提交到后台
            MAPPING_CONFIG.superClass.$doSubmit.apply(this, arguments);
        }
        this.close();
    };

    /** 
     * @override
     */
    MAPPING_CONFIG_CLASS.$doRender = function(contentEl, data) {
        var i;
        var item;
        var json = this._mModel.getMappingConfig() || [];
        var colSel = this._mModel.getColShow() || [];
        var configType = this._sConfigType;
        var html = [];
        var p = 'plane-editor';
        var qp = 'q-plane-editor';

        // preview时col show select
        function renderColSel() {
            html.push('请选择要显示的列');
            var dele = '&nbsp;&nbsp;';
            html.push(
                '<div style="margin-bottom:10px;" class="' + qp + '-col-show-sel">' 
            );
            for (var i = 0, item; item = colSel[i]; i ++) {
                if (item.paramKey) {
                    html.push(
                        '<div>' + htmlText(item.sqlKey) 
                        + dele + htmlText(item.paramKey) 
                        + dele + htmlText(item.showName) 
                        + '<input data-col-show-sel="' + htmlText(item.paramKey) + '" type="checkbox" /></div>'
                    );
                }
            }
            html.push('</div>');
        }

        // 渲染表头
        var fillHead = {
            // col mapping的表头
            col: function () {
                html.push('<th>sqlKey</th>');
                html.push('<th>paramKey</th>');
                html.push('<th>显示名</th>');
                html.push('<th>格式（如I,III.DD%）</th>');
                html.push('<th>排序方式</th>');
                html.push('<th>是否默认显示</th>');
            },
            // cond mapping的表头
            cond: function () {
                html.push('<th>sqlKey</th>');
                html.push('<th>paramKey</th>');
            },
            // col mapping的表头
            preview: function () {
                html.push('<th>sqlKey</th>');
                html.push('<th>paramKey</th>');
                html.push('<th>输入值</th>');
            }
        };

        var fillBody = {
            col: function (line) {
                html.push('<td class="', qp, '-sql-key" data-sql-key="' + line.sqlKey + '">', htmlText(line.sqlKey), '</td>');
                html.push('<td><input class="', qp, '-param-key" type="input" value="', htmlText(line.paramKey), '"/></td>');
                html.push('<td><input class="', qp, '-show-name" type="input" value="', htmlText(line.showName), '"/></td>');
                html.push('<td><input class="', qp, '-format" type="input" value="', htmlText(line.format), '"/></td>');
                html.push('<td>', makeOrderbySelect(line), '</td>');
                html.push('<td>', makeIsDefaultShowSelect(line), '</td>');
            },
            cond: function (line) {
                html.push('<td class="', qp, '-sql-key" data-sql-key="' + line.sqlKey + '">', htmlText(line.sqlKey), '</td>');
                html.push('<td><input class="', qp, '-param-key" type="input" value="', htmlText(line.paramKey), '"/></td>');
            },
            preview: function (line) {
                html.push('<td class="', qp, '-sql-key" data-sql-key="' + line.sqlKey + '">', htmlText(line.sqlKey), '</td>');
                html.push('<td class="', qp, '-param-key">', htmlText(line.paramKey), '</td>');
                html.push('<td><input class="', qp, '-param-value" type="input" /></td>');
            }
        };

        // orderby 下拉框
        function makeOrderbySelect(line) {
            var sel = {'': '', 'NONE': ''};
            sel[line.orderby] = ' selected="selected" ';
            return [
                '<select class="', qp, '-orderby">',
                    '<option value="" ', sel[''], '>不排序</option>',
                    '<option value="NONE" ', sel['NONE'], '>排序</option>',
                '</select>'
            ].join('');
        }

        // ”是否默认显示“下拉框
        function makeIsDefaultShowSelect(line) {
            var sel = {'true': '', 'false': ''};
            sel[String(!!line.isDefaultShow)] = ' selected="selected" ';
            return [
                '<select class="', qp, '-default-show">',
                    '<option value="true" ', sel['true'], '>默认显示</option>',
                    '<option value="false" ', sel['false'], '>默认不显示</option>',
                '</select>'
            ].join('');
        }

        if (this._sConfigType == 'preview') {
            renderColSel();
            html.push('<div>请输入映射值</div>');
        }

        // 渲染表头
        html.push('<table cellspacing="0"><thead><tr>');
        fillHead[this._sConfigType]();
        html.push('<tr></thead>');

        // 渲染表身
        html.push('<tbody class="', p, '-mapping-tbody">');
        for (i = 0; item = json[i]; i ++) {
            html.push('<tr>');
            fillBody[this._sConfigType](item);
            html.push('</tr>');
        }
        html.push('</tbody></table>');

        this.getContentEl().innerHTML = html.join('');
    };

    /** 
     * @override
     */
    MAPPING_CONFIG_CLASS.$doGetSubmitArgs = function() {
        var json = this._mModel.getMappingConfig() || [];
        var p = 'plane-editor';
        var qp = 'q-plane-editor';
        var ret = {};
        var ERROR_MSG_COMMA = 'paramKey不可含有半角逗号';
        var ERROR_MSG_EMPTY = 'paramKey不可为空';

        // 修改model里存的json
        var updateJson = {
            col: function (line, jsonItem) {
                var sel;
                var pk = fmtInput(q(qp + '-param-key', line)[0].value);
                if (pk.indexOf(',') >= 0) {
                    return ERROR_MSG_COMMA;
                }
                if (!pk) {
                    return ERROR_MSG_EMPTY;
                }
                jsonItem.paramKey = pk;
                jsonItem.showName = fmtInput(q(qp + '-show-name', line)[0].value);
                jsonItem.format = fmtInput(q(qp + '-format', line)[0].value);
                sel = q(qp + '-orderby', line)[0];
                jsonItem.orderby = sel.options[sel.selectedIndex].value;
                sel = q(qp + '-default-show', line)[0];
                jsonItem.isDefaultShow = sel.options[sel.selectedIndex].value;
            },
            cond: function (line, jsonItem) {
                var pk = fmtInput(q(qp + '-param-key', line)[0].value);
                if (pk.indexOf(',') >= 0) {
                    jsonItem.paramKey = null;
                    return ERROR_MSG_COMMA;
                }
                if (!pk) {
                    return ERROR_MSG_EMPTY;
                }
                jsonItem.paramKey = pk;
            },
            preview: function (line, jsonItem) {
                var sel;
                jsonItem.paramValue = fmtInput(q(qp + '-param-value', line)[0].value);
            }
        };

        var lines = q(
                'plane-editor-mapping-tbody', this.getContentEl()
            )[0].getElementsByTagName('tr');
        var i;
        var j;
        var line;
        var o;
        var sel;
        var msg;

        for (i = 0; line = lines[i]; i ++) {
            var sqlKey = q(qp + '-sql-key', line)[0].getAttribute('data-sql-key');
            // 在json中根据sqlKey定位行
            for (j = 0; o = json[j]; j ++) {
                if (o.sqlKey == sqlKey) {
                    // 修改model里存的json
                    if (isString(msg = updateJson[this._sConfigType](line, o))) {
                        return msg;
                    }
                }
            }
        }

        if (this._sConfigType == 'preview') {
            ret.showColumns = [];
            var eColSel = q(qp + '-col-show-sel', this.getContentEl())[0];
            var colSelCheckbox = eColSel.getElementsByTagName('input');
            for (i = 0, o; o = colSelCheckbox[i]; i ++) {
                o.checked
                    && ret.showColumns.push(o.getAttribute('data-col-show-sel'));
            }
            ret.showColumns = ret.showColumns.join(',');
        }

        return ret;
    };

    function fmtInput(value) {
        if (value == null) {
            return '';
        }
        return trim(String(value));
    }

    // function cutParamPrefix(value) {
    //     if (value != null) {
    //         return String(value).slice(DICT.PARAM_PREFIX.length);
    //     }
    // }

})();