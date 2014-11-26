/**
 * @file chart组件的配置数据信息
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-9-10
 */
define([
        'report/edit/component-box/chart-vm-template'
    ],
    function (chartVmTemplate) {

        var renderData = [
            {
                //"id": "snpt.cnpt-chart1",
                "clzType": "COMPONENT",
                "clzKey": "DI_ECHART",
                "sync": { "viewDisable": "ALL" },
                "vuiRef": {
                    //"mainChart": "snpt1.vu-chart1"
                },
                interactions: [
                    {
                        events: [
                            {
                                "rid": "snpt.form",
                                "name": "dataloaded"
                            },
                            {
                                rid: "snpt.form",
                                name: "submit"
                            }
                        ],
                        action: {
                            name: "sync"
                        },
                        argHandlers: [
                            ["clear"],
                            ["getValue", "snpt.cnpt-form"]
                        ]
                    }
                ]
            },
            {
                "clzType": "VUI",
                "clzKey": "E_CHART",
                "dataOpt": {
                    "height": 260,
                    "legend": { "xMode": "pl" },
                    "weekViewRange": [null, "-1d"]
                }
            }
        ];

        var processRenderData = function (dynamicData) {
            var id = dynamicData.rootId + dynamicData.serverData.id;
            var data = $.extend(true, [], this.renderData);
            data[0].id = id;
            data[0].vuiRef = {
                "mainChart": id + "-vu-chart"
            };
            data[1].id = id + '-vu-chart';
            return data;
        };

        return {
            type: 'CHART',
            caption: '图表',
            class: 'chart',
            defaultWidth: 300,
            defaultHeight: 300,
            vm: {
                render: function (data) {
                    var renderData = {
                        id: data.rootId + data.serverData.id
                    };
                    return chartVmTemplate.render(renderData);
                }
            },
            renderData: renderData,
            processRenderData: processRenderData
        };
    });