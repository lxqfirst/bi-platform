/**
 * di.helper.Util的增改
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    console特有的业务辅助函数集
 * @author:  xxx(xxx)
 * @depend:  xutil, tangram.ajax, jq.htmlClean
 */

(function() {

    var UTIL = di.helper.Util;
    var q = xutil.dom.q;
    var addClass = xutil.dom.addClass;
    var removeClass = xutil.dom.removeClass;
    var isArray = xutil.lang.isArray;
    var isFunction = xutil.lang.isFunction;
    var isString = xutil.lang.isString;
    var encodeHTML = xutil.string.encodeHTML;
    var DICT;

    $link(function () {
        DICT = di.config.Dict;
    });

    /**
     * 在console代码中创建component
     *
     * @public
     * @param {Object} diFactory
     * @param {Object} def
     * @param {HTMLElement} def.el
     * @param {string} def.clzKey
     * @param {Function} commonParamGetter
     * @return {Object} 创建好的component
     */
    UTIL.cmptCreate4Console = function (diFactory, depict, commonParamGetter) {
        var cmpt;
        var i;
        var def;
        var ins;

        for (i = 0; def = depict[i]; i ++) {
            diFactory.addEntity(def, 'DEF');
            def = diFactory.getEntity(def.id, 'DEF');
            if (def.clzType === 'COMPONENT') {
                cmpt = def;
            }
        }

        cmpt = diFactory.createIns(
            cmpt,
            { tplMode: 'SELF', commonParamGetter: commonParamGetter } 
        );

        return cmpt;        
    };

    /**
     * 在console代码中创建component
     *
     * @public
     * @param {Object} diFactory
     * @param {Object} cmptIns
     * @param {Object} data
     */
    UTIL.cmptSync4Console = function (diFactory, cmptIns, data) {
        // FIXME
        // 为兼容product儿而加的代码，本身在editor中无意义。
        // 后续崇重构
        var diEvent = diFactory.createDIEvent('editorfakeevent-query');

        diFactory.setInteractMemo(cmptIns, 'diEvent', diEvent);

        cmptIns.sync(data);

        diFactory.setInteractMemo(diFactory, 'diEvent', void 0);
    };

    /**
     * 遍历el下所有的有Dict.FLAG_CSS的dom节点
     *
     * @public
     * @param {Object} el
     * @param {(string|Array)} flagCSS 默认为Dict.FLAG_CSS
     * @param {Function} callback 
     *          参数为：el, flagcss
     * @param {string} prefix 为'c-'或者为空
     */
    UTIL.forEachCSSFlag = function (el, flagCSS, callback, prefix) {
        flagCSS = flagCSS || DICT.FLAG_CSS;
        !isArray(flagCSS) && (flagCSS = [flagCSS]);
        prefix = prefix || '';

        for (var j = 0, clz; clz = flagCSS[j]; j ++) {
            var els = q(prefix + clz, el);
            for (var i = 0, oi; oi = els[i]; i ++) {
                callback(oi, clz);
            }
        }
    };

    /**
     * 遍历el下所有的有的dom节点
     *
     * @public
     * @param {Object} el
     * @param {Function} callback 
     *          参数为：el
     */
    UTIL.forEachDom = function (el, callback) {
        var els = el.getElementsByTagName('*');
        for (var i = 0, el; el = els[i]; i ++) {
            callback(el);
        }
    };

    /**
     * 增加console特定的class（在所有di-o_o-xxx class的节点上加c-di-o_o-xxx class）
     *
     * @public
     * @param {Object} el
     */
    UTIL.addConsoleCSS = function (el, vtpl) {
        // var depictObj = vtpl.depict.obj;

        UTIL.forEachCSSFlag(
            el, 
            null,
            function (el, css) {
                addClass(el, 'c-' + css);
                if (css == 'di-o_o-item') {
                    var entityId = el.getAttribute(DICT.DI_ATTR);
                    if (!entityId) {
                        // FIXME
                        // 现在只有cond能编辑，所以这样简单处理
                        el.setAttribute('contentEditable', true);
                    }
                    else {
                        // vtpl.findEntityById(entityId).clzType
                        // FIXME
                        // 现在只有cond能编辑，所以这样简单处理，本应该在depict中确认是form的引用，才能确定
                        addClass(el, 'c-di-o_o-cond-vui');
                    }
                }
            }
        );
    };

    /**
     * 设置或得到（不传value则表示get）dom附加数据
     */
    UTIL.domData = function (el, attr, value) {
        if (value == null) {
            if (!el._data) {
                return;
            }
            return el._data[attr];
        }
        else {
            var data = el._data || (el._data = {});
            data[attr] = value;
        }
    };

    /**
     * 清除console特定的class（去除所有有c-di-o_o-前缀的css class）
     *
     * @public
     * @param {(HTMLElement|string)} html
     * @return {(HTMLElement|string)} html
     */
    UTIL.clearConsoleCSS = function (html) {
        if (isString(html)) {
            elTmp.innerHTML = html;
            html = elTmp;
        }
        var els = html.getElementsByTagName('*');

        for (var j = 0, eo; eo = els[j]; j ++) {
            var clz = eo.className.split(/\s+/).sort();
            var toRemove = [];
            for (var i = 0, cl; i < clz.length; i ++) {
                if ((cl = clz[i]) && cl.indexOf('c-di-o_o-') >= 0) {
                    toRemove.push(cl);
                }
            }
            removeClass(eo, toRemove.join(' '));
            eo.removeAttribute('contentEditable');
            delete eo._data;
        }

        return html.innerHTML;
    };
    var elTmp = document.createElement('div');

    /**
     * @public
     */
    UTIL.indexOf = function (arr, value) {
        for (var i = 0; i < arr.length; i ++) {
            if (arr[i] == value) {
                return i;
            }
        }
        return -1;
    };

    /**
     * 最简单的select控件
     * 
     * @public
     */
    var SELECT = UTIL.select = {};

    /**
     * 创建
     * 
     * @public
     * @param {Array} html
     * @param {Obejct} options
     * @param {string} options.css
     * @param {Array.<Obejct>} options.datasource
     * @param {*|Function} options.selected
     * @param {Function} filter
     * @param {Object} attr
     * @param {string} options.textAttr
     * @param {string} options.valueAttr
     * @param {string} options.extraAttr
     * @param {Object} options.first 一般用于加入“请选择”
     */
    SELECT.create = function (html, options) {
        var textAttr = options.textAttr || 'text';
        var valueAttr = options.valueAttr || 'value';
        var extraAttr = options.extraAttr || 'extra';
        html.push('<select class="', options.css || '', '" ');
        for (var key in options.attr) {
            html.push(' ', key, '="', encodeHTML(options.attr[key]), '" ');
        }
        html.push(' data-text-attr="', encodeHTML(textAttr), '" ');
        html.push(' data-value-attr="', encodeHTML(valueAttr), '" ');
        html.push(' data-extra-attr="', encodeHTML(extraAttr), '" ');
        html.push('>');
        createOptions(html, options);
        html.push('</select>');
        return html;
    };

    SELECT.createOptions = function (selEl, options) {
        var html = [];
        createOptions(html, options);
        selEl.innerHTML = html.join('');
    };

    /**
     * @public
     * @param {Object=} selEl
     * @param {Object=} datasource
     */
    SELECT.getSelected = function (selEl, datasource) {
        var opt = selEl.options[selEl.selectedIndex];
        var ret;
        var textAttr = selEl.getAttribute('data-text-attr');
        var valueAttr = selEl.getAttribute('data-value-attr');
        var extraAttr = selEl.getAttribute('data-extra-attr');

        if (opt) {
            ret = { index: selEl.selectedIndex };
            ret[textAttr] = opt.innerHTML;
            ret[extraAttr] = opt.getAttribute('data-simple-select-extra');
            var val = ret[valueAttr] = opt.getAttribute('data-simple-select');

            if (datasource) {
                for (var i = 0, o; i < datasource.length; i ++) {
                    if ((o = datasource[i]) && (o[valueAttr] == val)) {
                        return o;
                    }
                }
            }
        }
        return ret;
    };

    function createOptions(html, options) {
        var selFn = isFunction(options.selected)
            ? options.selected
            : function (o) { return o[options.valueAttr] == options.selected };
        var filterFn = options.filter 
            ? options.filter
            : function () { return true; };

        var first = options.first;
        var datasource = (first ? [first] : []).concat(options.datasource);
        
        for (var i = 0, o, sel; i < datasource.length; i ++) {
            if (o = datasource[i]) {
                sel = selFn(o) ? ' selected="selected" ' : '';
                (o === first || filterFn(o)) && html.push(
                    '<option ', sel, 
                        ' data-simple-select="', encodeHTML(getValue(o, options.valueAttr)), '" ', 
                        ' data-simple-select-extra="', encodeHTML(getValue(o, options.extraAttr)), '" ',
                    '>',
                        encodeHTML(getValue(o, options.textAttr)), 
                    '</option>'
                );
            }
        }

        return html;
    }

    function getValue(o, attr) {
        var v = isFunction(attr) ? attr(o) : o[attr];
        if (v == null) {
            return null;
        }
        return v;
    }

})();