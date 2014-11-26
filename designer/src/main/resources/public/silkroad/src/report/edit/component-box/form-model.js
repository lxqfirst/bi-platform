/**
 * @file form组件的配置数据信息
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-9-10
 */
define([
        'report/edit/component-box/form-vm-template'
    ],
    function (formVmTemplate) {

        var renderData = {
            "id": "snpt.form",
            "compId": "comp-id-form",
            "clzType": "COMPONENT",
            "clzKey": "DI_FORM",
            "reportType": "RTPL_VIRTUAL",
            "init": {
                "action": {
                    "name": "sync"
                }
            },
            "sync": {
                "viewDisable": "ALL"
            },
            "dataOpt": {
                "submitMode": "IMMEDIATE"
            },
            "reportTemplateId": "RTPL_VIRT  UAL_ID",
            "vuiRef": {}
        };

        var processRenderData = function (rootId) {
            var data = $.extend(true, {}, renderData);

            data.id = rootId + 'form';
            data.vuiRef.input = [];

            return data;
        };

        return {
            renderData: renderData,
            processRenderData: processRenderData,
            vmTemplate: formVmTemplate
        };
    });