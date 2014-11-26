/**
 * di.shared.adapter.EcuiInputTreeVUIAdapter
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @file:    ecui input-tree的适配器
 * @author:  sushuang(sushuang)
 * @depend:  xui, xutil, ecui
 */

$namespace('di.shared.adapter');

(function() {

    var ecuiCreate = di.helper.Util.ecuiCreate;
    var dateToString = xutil.date.dateToString;
    var isArray = xutil.lang.isArray;
    var DICT = di.config.Dict;

    /**
     * ecui input tree的适配器
     *
     * @public
     * @param {Object} def vui的定义
     * @param {Object} options vui实例创建参数
     * @return {Object} vui adapter实例
     */
    $namespace().EcuiInputTreeVUIAdapter = function(def, options) {
        return {
            create: create,
            setData: setData,
            getValue: getValue
        };
    };

    /**
     * 创建
     *
     * @public
     * @param {Object} def vui定义
     * @param {Object} options 初始化参数
     * @return {Object} 创建的实例
     */
    function create(def, options) {
        // 控件初始化所须
        options.hideCancel = true;
        options.asyn = true;

        var ctrl = ecuiCreate(def.clz, def.el, null, options);

        ctrl.$di('registerEventAgent', 'async');

        // 挂接事件
        ctrl.onloadtree = function (value, func) {
            /**
             * 异步加载统一的事件
             *
             * @event
             */
            ctrl.$di(
                'dispatchEvent',
                'async',
                [
                    value,
                    function (data) {
                        func((data.datasource || {}).children || []);
                    }
                ]
            );
        }

        // 赋予全局浮层id，用于自动化测试的dom定位
        ctrl._uLayer.getOuter().setAttribute(DICT.TEST_ATTR, def.id);

        return ctrl;
    }

    /**
     * 设置初始化数据
     * 
     * @public
     * @param {Object} data 数据
     */
    function setData(data) {
        if (!data) {
            return;
        }

        this.setData(
            { 
                root: data.datasource,
                selected: isArray(data.value) 
                    ? data.value[0] 
                    : (data.value || (data.datasource || {}).value)
            }, 
            { 
                hideCancel: data.hideCancel == null 
                    ? true : data.hideCancel, 
                asyn: data.asyn == null 
                    ? true : data.asyn
            }
        );
    }

    /**
     * 获得当前选中数据
     *
     * @public
     * @this {Object} 目标实例
     * @return {Object} 数据
     */
    function getValue() {
        var v = this.getValue();
        return v ? [v.value] : [];
    }

})();

