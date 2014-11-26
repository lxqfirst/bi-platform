/**
 * di.console.model.VTpl
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    试图模版Model
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, jsl, htmlClean
 */

$namespace('di.console.editor.model');

(function() {

    var FORMATTER = di.helper.Formatter;
    var DICT = di.config.Dict;
    var LANG = di.config.Lang;
    var URL = di.config.URL;
    var UTIL = di.helper.Util;
    var inheritsObject = xutil.object.inheritsObject;
    var q = xutil.dom.q;
    var g = xutil.dom.g;
    var bind = xutil.fn.bind;
    var extend = xutil.object.extend;
    var assign = xutil.object.assign;
    var clone = xutil.object.clone;
    var parseFileName = UTIL.parseFileName;
    var ajaxRequest = baidu.ajax.request;
    var jsonStringify = baidu.json.stringify;
    var jsonParse = baidu.json.parse;
    var jsonFormat = jsl.format.formatJson;
    var jsonValidate = jsl.parser.parse;
    var hasClass = xutil.dom.hasClass;
    var getByPath = xutil.object.getByPath;
    var setByPath = xutil.object.setByPath;    
    var isString = xutil.lang.isString;
    var isArray = xutil.lang.isArray;
    var isNumber = xutil.lang.isNumber;
    var indexOf = UTIL.indexOf;
    var hasValue = xutil.lang.hasValue;
    var getUID = xutil.uid.getUID;
    var stringToDate = xutil.date.stringToDate;
    var dateToString = xutil.date.dateToString;
    var textParam = xutil.url.textParam;
    var travelTree = xutil.collection.travelTree;
    var wrapArrayParam = xutil.url.wrapArrayParam;
    var assert = UTIL.assert;

    /**
     * 视图模版
     * 注意：
     *      所有编辑都在depict.obj和snippet.el上进行，
     *      然后适当时候统一stringify更新depict.content和snippect.content
     *      不要直接往vtpl中设content，要通过contentSet方法
     *
     * 每个vtpl的统一结构：
     * {
     *     vtplKey: 就是存在后台的virtualTemplateId, 也是snippet和depict的文件名,
     *     vtplName: 描述信息，用户输入，显示在菜单上,
     *     status: 值可为：
     *         'MOLD'表示仍为mold状态，后台没保存过, 
     *         'SAVED'表示与后台一致, 
     *         'CHANGED'表示已经修改
     *     snippet: {
     *         fileName: 目前就是vtplKey,
     *         extName: 'vm',
     *         fullName: 目前是vtplKey + '.vm'
     *         content: 文件全部内容,
     *         oriContent: 后台返回的文件全部内容，不会被修改
     *     },
     *     depict: {
     *         fileName: 目前就是vtplKey,
     *         extName: 'vm',
     *         fullName: 目前是vtplKey + '.vm'
     *         content: 文件全部内容,
     *         oriContent: 后台返回的文件全部内容，不会被修改,
     *         obj: 解析出的json对象
     *     },
     *     rtplCond: {
     *         xxxxxreportTemplateId1: { {name: 'aaa', ...}, {}, ... },
     *         xxxxxreportTemplateId2: { ... }
     *     }
     * }
     *
     * @class
     * @extends xui.XDatasource
     */
    var VTPL = $namespace().VTpl = function (obj) {
        extend(this, obj || {});
        this.depict = this.depict || {};
        this.snippet = this.snippet || {};
        this.rtplCond = this.rtplCond || {};
    };
    var VTPL_CLASS = VTPL.prototype;

    /**
     * 产生一个entityId，
     * 这里不能单用前端随机数是没意义的。
     * 要避免和已有的id重复。
     *
     *
     * @public
     */
    VTPL_CLASS.genId = function () {
        var entityDefs = this.getEntityDefs();
        var idSet = {};
        for (var i = 0; i < entityDefs.length; i ++) {
            idSet[entityDefs[i]] = 1;
        }
        var newId;
        do {
            newId = (new Date()).getTime() + '_' + getUID();
        }
        while (newId in idSet);
        return newId;
    };

    /**
     * 获得副本
     *
     * @public
     */
    VTPL_CLASS.clone = function () {
        var newObj = new VTPL();
        // 这里刻意不用extend，防止以后改代码时，
        // 忘了做对象深拷贝，又发现不了。
        newObj.vtplKey = this.vtplKey;
        newObj.vtplName = this.vtplName;
        newObj.status = this.status;
        newObj.depict = clone(this.depict);
        newObj.snippet = clone(this.snippet);
        newObj.rtplCond = clone(this.rtplCond);

        // HTMLElement的clone
        var el = this.snippet.el;
        if (el) {
            newObj.snippet.el = document.createElement('div');
            newObj.snippet.el.innerHTML = el.innerHTML;
        }

        return newObj;
    };

    /**
     * 设置conent
     * 
     * @public
     * @param {boolean} force 就算出错，也强制写入content，默认是出错则不写入
     * @return {string} errorMsg 如果set不成功（如json.parse失败），
     *      则返回错误信息（具体哪里有错误）。如果成功，返回空。
     */
    VTPL_CLASS.contentSet = function(snippetContent, depictContent, force) {
        // 暂时禁止ie的设值，因为格式会不对
        // 其他浏览器，暂时先不format（因为会报错，后续跟进）
        // FIXME
        var errorMsg = [];
        var res;

        try {
            // json parse
            depictContent = jsonFormat(depictContent);
            jsonValidate(depictContent);

            // parse，缓存结构信息
            res = parseContent(snippetContent, depictContent);
            errorMsg.push.apply(errorMsg, res.errorMsg);
        }
        catch (e) {
            // FIXME
            // 兼容
            errorMsg.push('JSON解析错误：\n' + e.message);
        }

        if (force || !errorMsg.length) {
            // 正式写入
            this.depict.content = depictContent;
            this.snippet.content = snippetContent;
        }

        if (!errorMsg.length) {
            // 正式写入
            this.depict.obj = res.depict.obj;
            this.snippet.el = res.snippet.el;
        }

        // 修正depict。 修正后先不反映到content上。
        // 到contentStringify时才反映到content上。
        this.$fixDepict();

        return errorMsg;
    };

    /**
     * 由vtpl.depict.obj和vtpl.snippet.el写回content
     * 
     * @public
     */
    VTPL_CLASS.contentStringify = function() {
        var errorMsg = [];
        var depictContent;
        var snippetContent;
        var depict = this.depict;
        var snippet = this.snippet;

        try {
            // stringify depict
            depictContent = jsonFormat(jsonStringify(depict.obj));

            // stringify snippet
            var pos = parseFlagPos(snippet.content);
            if (pos) {
                var bstr = snippet.content.slice(0, pos.start);
                var estr = snippet.content.slice(pos.end);
                snippetContent = [
                    bstr, 
                    ' \n ', 
                    formatSnippet(snippet.el.innerHTML),
                    ' \n ', 
                    estr
                ].join('');
            }
            else {
                errorMsg.push('未找到DOM FLAG, SNIPPET未能保存');
            }
        }
        catch (e) {
            errorMsg.push('Stringify时JSON解析错误：\n' + e.message);
        }

        if (!errorMsg.length) {
            // 正式写入
            errorMsg.concat(this.contentSet(snippetContent, depictContent));
        }

        return errorMsg;
    };   

    /**
     * 用vtplOther的内容，提换自己的内容
     * 
     * @public
     */
    VTPL_CLASS.replaceWith = function(vtplOther) {
        // 清空
        for (var i in this) {
            if (this.hasOwnProperty(i)) {
                this[i] = void 0;
            }
        }
        // 浅拷贝
        extend(this, vtplOther);
    }; 

    /**
     * 由vtpl中的“content”解析出结构化的对象。
     * 
     * @private
     * @return {Object} parse结果
     */
    function parseContent(snippetContent, depictContent) {
        var snippet = {};
        var depict = {};
        var errorMsg = [];
        
        // depict解析
        try {
            depict.obj = jsonParse(depictContent);
        }
        catch (e) {
            errorMsg.push('JSON格式错误' + e);
        }

        // snippet解析
        var el = snippet.el = document.createElement('div');
        var pos = parseFlagPos(snippetContent);
        if (pos) {
            el.innerHTML = snippetContent.slice(pos.start, pos.end);
        }
        else {
            snippet.invalid = true;
            errorMsg.push('SNIPPET未能解析');
        }

        return {
            snippet: snippet,
            depict: depict,
            errorMsg: errorMsg
        };
    };

    function parseFlagPos(snippetContent) {
        var start = snippetContent.indexOf(DICT.DOM_FLAG_BEGIN);
        var end = snippetContent.indexOf(DICT.DOM_FLAG_END);
        return (start < 0 || end < 0)
            ? null
            : { 
                start: start + DICT.DOM_FLAG_BEGIN.length, 
                end: end 
            };
    };

    /**
     * 为了一致，将所有真实的virtualTemplate都替换为"RTPL_VIRTUAL_ID"
     * 将所有没有填reportType的entity的reportTemplateId清空，
     * 强制重新选择，从而填进去reportType
     * 
     * @private
     */
    VTPL_CLASS.$fixDepict = function () {
        this.forEachEntity(
            'COMPONENT',
            function (def) {
                if (!def.reportType) {
                    def.reportTemplateId = void 0;
                }
                if (def.reportType == 'RTPL_VIRTUAL') {
                    def.reportTemplateId = 'RTPL_VIRTUAL_ID';
                }
            }
        );
    };

    /**
     * 清理rtplCond，对于没有被引用的rtplCond，清除
     * 
     * @public
     */
    VTPL_CLASS.condClean = function (cpntId, vuiId) {
        var rtplCond = this.rtplCond;
        var rtplIdMap = {};
        var rtplId;
        var i;
        var j;

        this.forEachEntity(
            'COMPONENT',
            function (def) {
                var rtplId;
                if (def.reportType == 'RTPL_VIRTUAL' 
                    || def.reportTemplateId == 'RTPL_VIRTUAL_ID'
                ) {
                    rtplId = 'RTPL_VIRTUAL_ID';
                }
                else if (def.reportTemplateId) {
                    rtplId = def.reportTemplateId;
                }
                if (!rtplIdMap[rtplId]) {
                    rtplIdMap[rtplId] = [];
                }
                rtplIdMap[rtplId].push(def);
            }
        );

        // 在这里确保rtplCond中的rtplId和vtpl中的rtplId是一致的。
        for (rtplId in rtplIdMap) {
            if (!rtplCond[rtplId]) {
                // 赋给空数组，表示后台清空条件
                rtplCond[rtplId] = [];
            }
        }
        for (rtplId in rtplCond) {
            if (!rtplIdMap[rtplId]) {
                delete rtplCond[rtplId];
            }
        }

        // 在这里清除未被引用的cond
        for (rtplId in rtplCond) {
            var cpntDefArr = rtplIdMap[rtplId];

            // 得到每个rtplId对应的所有name（rtpl找cpntDef找vuiRef找name）
            var nameSet = {};
            var cpntDef;
            for (i = 0; cpntDef = cpntDefArr[i]; i ++) {
                var vuiRef = this.getVUIRef(cpntDef.id, 'input');
                for (j = 0; j < vuiRef.length; j ++) {
                    var vuiDef = this.findEntityById(vuiRef[j]);
                    vuiDef && vuiDef.name && (nameSet[vuiDef.name] = 1);
                }
            }

            // 删除未引用的
            var rtplConds = rtplCond[rtplId];
            for (i = 0; i < rtplConds.length; ) {
                if (!nameSet.hasOwnProperty((rtplConds[i] || {}).name)) {
                    rtplConds.splice(i, 1);
                }
                else {
                    i ++;
                }
            }
        }
    };

    /**
     * 得到当前已经选择的cond
     * 注意，对于virtualTempalteId的情况，只能tplKey=="RTPL_VIRTUAL_ID"
     * 
     * @public
     */
    VTPL_CLASS.condGet = function (tplKey, name) {
        if (!tplKey || !name) {
            return null;
        }
        var rtplConds = this.rtplCond[tplKey] || [];
        for (var i = 0, cond; i < rtplConds.length; i ++) {
            if ((cond = rtplConds[i]) && name == cond.name) {
                return cond;
            }
        }
    };

    /**
     * TODO
     * 如果要对virtualTemplate设置条件，后台需要同时向子模版设置条件
     * 但这样对于用户交互来说是比较奇怪的，不可能让用户一个条件设置多次
     * 现在在这里判断，如果是对virtualTemplate设置条件，则clone，
     * 对所有子模版设置条件。
     * 后续可以再添加：遇到要对virtualTemplate设置条件时，
     * cond-config-panel中能选择对某部分子模版设置（比较冷门的需求）
     * 
     * @public
     */
    VTPL_CLASS.condSubmitGet = function () {
        // var rtplIdMap = this.rtplIdGet(false, true);
        var rtplCond = clone(this.rtplCond);
        if (!rtplCond) {
            // 返回空对象，后台不会保存
            return {};
        }

        // 依照对rid为RTPL_VIRTUAL_ID的，进行分发复制
        var rid;
        var vCond = rtplCond['RTPL_VIRTUAL_ID'];
        if (vCond) {
            for (rid in rtplCond) {
                var c = rtplCond[rid];
                if (c != vCond) {
                    // 不按name去重了，写烦了，忠一说可以重复
                    c.push.apply(c, vCond);
                }
            }
        }

        return rtplCond;
    };

    /**
     * 增加一个cond（如果有重复，则merge）
     * 
     * @public
     * @return {boolean} 是否添加成功
     */
    VTPL_CLASS.condAdd = function(tplKey, cond) {
        if (this.condGet(tplKey, cond.name)) {
            return false;
        }
        var o = this.rtplCond[tplKey];
        if (!o) {
            o = this.rtplCond[tplKey] = [];
        }
        o.push(cond);
        return true;
    };   

    /**
     * @public
     */
    VTPL_CLASS.findEntityByClzType = function(clzType) {
        var ret = [];
        var entityDefs = this.getEntityDefs();
        if (entityDefs) {
            for (var i = 0, o; i < entityDefs.length; i ++) {
                if ((o = entityDefs[i]) && o.clzType == clzType) {
                    ret.push(o);
                }
            }
        }

        return ret;
    };

    /**
     * @public
     */
    VTPL_CLASS.findEntityById = function(id) {
        var entityDefs = this.getEntityDefs();
        if (entityDefs) {
            for (var i = 0, o; i < entityDefs.length; i ++) {
                if ((o = entityDefs[i]) && o.id == id) {
                    return o;
                }
            }
        }
    };

    /**
     * 根据某个vui, 得到其所属的component
     *
     * @public
     */
    VTPL_CLASS.findCPNTByVUI = function (vuiId) {
        var cpnt;
        var me = this;

        this.forEachEntity(
            'COMPONENT',
            function (def) {
                var refIds = me.getVUIRef(def.id);
                for (var i = 0; i < refIds.length; i ++) {
                    if (refIds[i] == vuiId) {
                        cpnt = def;
                    }
                }
            }
        );

        return cpnt;
    };

    /**
     * 根据某个（有data-di-o_o-id属性的）dom，获得其component
     *
     * @public
     */
    VTPL_CLASS.findCPNTByDom = function (targetEl, rootEl) {
        var diId = targetEl.getAttribute(DICT.DI_ATTR);
        if (!diId) {
            return [];
        }
        rootEl = rootEl || this.snippet.el;

        var def = this.findEntityById(diId);
        var cpnt;

        if (def.clzType == 'VUI') {
            cpnt = this.findCPNTByVUI(def.id);
        }        
        else if (def.clzType == 'COMPONENT') {
            cpnt = def;
        }

        return cpnt;
    };  

    /**
     * 根据cpntId，获得同属一个component下的所有entity（vuiRef引用的）的dom
     *
     * @public
     */
    VTPL_CLASS.findCPNTDoms = function (cpntId, rootEl) {
        return this.findDomsByIds(
            this.getVUIRef(cpntId).concat([cpntId]),
            rootEl
        );
    };     

    /**
     * 根据diId，找到其对应的dom，可以批量查找
     *
     * @public
     * @param {array} diIds 可批量查找
     * @param {HTMLElement} rootEl 根dom节点
     * @return {array} dom列表，和diIds一一对应
     */
    VTPL_CLASS.findDomsByIds = function (diIds, rootEl) {
        var ret = [];
        rootEl = rootEl || this.snippet.el;
        var els = rootEl.getElementsByTagName('*');

        for (var i = 0, el; el = els[i]; i ++) {
            var domId = el.getAttribute(DICT.DI_ATTR);
            for (var j = 0; j < diIds.length; j ++) {
                if (domId == diIds[j]) {
                    ret[j] = el;
                }
            }
        }
        return ret;    
    };

    /**
     * 遍历entity
     *
     * @public
     * @param {(string|Array)=} clzType 单值或数组，
     *      如果是数组，则顺序遍历，如果不传，则遍历所有entity
     * @param {Function} callback 回调，参数为
     *              {Object} def
     */
    VTPL_CLASS.forEachEntity = function (clzType, callback) {
        var entityDefs = this.getEntityDefs();
        if (entityDefs) {
            for (var i = 0, o; i < entityDefs.length; i ++) {
                if ((o = entityDefs[i]) && (!clzType || o.clzType == clzType)) {
                    callback(o);
                }
            }
        }
    };

    /**
     * 取所有rtplId
     *
     * @public
     * @param {boolean} excludeVirtual 所有没有reportType的def，
     *      或者reportType是RTPL_VIRTUAL的，被认为是vtpl, 被排除
     * @param {booelan} returnMap true则返回map，false则返回array
     * @return {Array} rtplIdList
     */
    VTPL_CLASS.rtplIdGet = function (excludeVirtual, returnMap) {
        // 用于去重
        var idSet = {};
        var entityDefs = this.getEntityDefs() || [];
        for (var i = 0, def, rid; def = entityDefs[i]; i ++) {
            if ((rid = def.reportTemplateId)
                && (
                    !excludeVirtual 
                    || (
                        def.reportType 
                        && def.reportType != 'RTPL_VIRTUAL'
                    )
                )
            ) {
                idSet[rid] = 1;
            }
        }

        if (!returnMap) {
            var ret = [];
            for (var rtplId in idSet) {
                ret.push(rtplId);
            }
            return ret;
        }
        else {
            return idSet;
        }
    };

    /**
     * 获取或设置某个entity的inneHTML
     *
     * @public
     * @param {(string|Array)} rid entity的id
     *      如果为array，则rid[0]是entity的id，rid[1]是flagCSS，如果有此项，则再用此css在内部找
     *      如果为空，则返回或设置整个innerHTML
     * @param {string} html
     * @return {string} html
     */
    VTPL_CLASS.innerHTML = function (rid, html) {
        var flagCSS;
        if (isArray(rid)) {
            flagCSS = rid[1];
            rid = rid[0];
        }

        var target;
        var el = this.snippet.el;

        if (!el) {
            return null;
        }

        if (!rid) {
            target = el;
        }
        else {
            var els = el.getElementsByTagName('*');
            for (var i = 0, o; o = els[i]; i ++) {
                if (o.getAttribute(DICT.DI_ATTR) == rid) {
                    target = o;
                    break;
                }
            }
            
            if (!target) { return null; }

            // 如果给了flagCSS，则在target中继续依照flagCSS找
            if (flagCSS && !hasClass(target, flagCSS)) {
                target = q(flagCSS, target)[0];
            }
        }

        if (!target) { return null; }


        if (html) {
            target.innerHTML = html;
        }
        return target.innerHTML;
    };

    /**
     * @public
     */
    VTPL_CLASS.getEntityDefs = function () {
        return (this.depict.obj || {}).entityDefs || [];
    };   

    /**
     * @public
     */
    VTPL_CLASS.addEntityDef = function (entityDef) {
        var obj = this.depict.obj;
        if (obj && entityDef) {
            // FIXME
            // 这里应该检查重复？
            obj.entityDefs.push(entityDef);
        }
    };

    /**
     * @public
     */
    VTPL_CLASS.removeEntityDef = function (entityId) {
        var entityDefs = this.getEntityDefs();
        for (var i = 0, ett; i < entityDefs.length; ) {
            if (ett = entityDefs[i]) {
                ett.id === entityId
                    ? entityDefs.splice(i, 1)
                    : i ++;
            }
        }
    };

    /**
     * @public
     */
    VTPL_CLASS.removeVUIRef = function (cpntId, vuiId) {
        var cpntDef = this.findEntityById(cpntId);
        if (cpntDef) {
            var arr = getByPath('vuiRef.input', cpntDef) || [];
            for (var i = 0; i < arr.length; ) {
                arr[i] === vuiId
                    ? arr.splice(i, 1)
                    : i ++;
            }
        }
    };

    /**
     * @public
     */
    VTPL_CLASS.removeVUIRefAll = function (vuiId) {
        var me = this;
        this.forEachEntity(
            null,
            function (def) {
                me.removeVUIRef(def.id, vuiId);
            }
        );
    };

    /**
     * @public
     */
    VTPL_CLASS.addVUIRef = function (cpntId, vuiId) {
        var cpntDef = this.findEntityById(cpntId);
        if (cpntDef) {
            var arr = getByPath('vuiRef.input', cpntDef);
            if (!arr) {
                setByPath('vuiRef.input', arr = []);
            }
            // 去重添加
            indexOf(arr, vuiId) < 0 && arr.push(vuiId);
        }
    };  

    /**
     * @public
     * @param {string} cpntId
     * @param {string} attrName 可缺省，缺省则返回所有
     */
    VTPL_CLASS.getVUIRef = function (cpntId, attrName) {
        var cpntDef = this.findEntityById(cpntId);
        if (cpntDef) {
            if (attrName) {
                return getByPath('vuiRef.' + attrName, cpntDef) || [];
            }
            else {
                var ref = [];
                var travel = function (o) {
                    if (isString(o) || isNumber(o)) {
                        ref.push(o);
                        return;
                    }
                    for (var i in o) {
                        travel(o[i]);
                    }
                };
                travel(cpntDef.vuiRef);
                return ref;
            }
        }
        return [];
    };

    /**
     * vtplKey就是后端的virtualTemplateId
     * 在status还是MOLD的时候，vtplKey是RTPL_VIRTUAL_ID
     * 保存后，后端返回真实的vtplKey，用此方法统一替换
     *
     * @public
     */
    // VTPL_CLASS.vtplKeyUpdate = function (vtplKey) {
    //     assert(vtplKey != null, 'vtplKey为空');
    //     var defaultKey = 'RTPL_VIRTUAL_ID';

    //     if (vtplKey != this.vtplKey) {
    //         this.vtplKey = vtplKey;

    //         // 更新rtplCond
    //         var rtplCond;
    //         this.rtplCond[vtplKey] = rtplCond[defaultKey];
    //         this.rtplCond[defaultKey] = null;

    //         // 更新depict的entityDefs
    //         var entityDefs = this.getEntityDefs();
    //         if (entityDefs) {
    //             for (var i = 0; i < entityDefs.length; i ++) {
    //                 if (entityDefs[i].reportType == 'RTPL_VIRTUAL') {
    //                     entityDefs[i].reportTemplateId = vtplKey;
    //                 }
    //             }
    //             // stringify depict
    //             this.depict.content = jsonStringify(this.depict.obj)
    //         }
    //     }
    // };

    /**
     * 更新状态
     *
     * @public
     */
    VTPL_CLASS.statusUpdate = function (status) {
        status && (this.status = status);
    };

    /**
     * 格式化snippet用于输出
     *
     * @public
     */
    function formatSnippet(html) {
        // 好吧，用了jquery
        return $.htmlClean(
            html,
            {
                format: true ,
                allowedAttributes: [
                    ["data-o_o-di"],
                    ["id"],
                    ["class"],
                    ["style"],
                    ["data-toggle"],
                    ["data-target"],
                    ["data-parent"],
                    ["role"],
                    ["data-dismiss"],
                    ["aria-labelledby"],
                    ["aria-hidden"],
                    ["data-slide-to"],
                    ["data-slide"]
                ]
            }
        );
    }

})();

