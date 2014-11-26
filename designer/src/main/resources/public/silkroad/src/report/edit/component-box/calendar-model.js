/**
 * @file 日历组件的配置数据信息
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-9-10
 */
define([
        'report/edit/component-box/calendar-vm-template'
    ],
    function (calendarVmTemplate) {
        var renderData = [
            {
                "clzType": "VUI",
                "dataSetOpt": {
                    "forbidEmpty": false,
                    "disableCancelBtn": false,
                    "timeTypeList": [
//                        {
//                            "value": "D",
//                            "text": "日"
//                        }
//                        ,{
//                            "value": "W",
//                            "text": "周"
//                        },
//                        {
//                            "value": "M",
//                            "text": "月"
//                        },
//                        {
//                            "value": "Q",
//                            "text": "季"
//                        }
                    ],
                    "timeTypeOpt": {
//                        "D": {
//                            "selMode": "SINGLE",
//                            // 默认时间
//                            "date": [
//                                //"-31D",
//                                "-1D"
//                            ],
//                            // 事件范围
//                            "range": [
//                                "2011-01-01",
//                                "-1D"
//                            ],
//                            "selModeList": [
//                                {
//                                    "text": "单选",
//                                    "value": "SINGLE",
//                                    "prompt": "单项选择"
//                                }
//                            ]
//                        }
//                        "W": {
//                            "selMode": "RANGE",
//                            "date": [
//                                "-31D",
//                                "-1D"
//                            ],
//                            "range": [
//                                "2011-01-01",
//                                "-1D"
//                            ],
//                            "selModeList": [
//                                {
//                                    "text": "单选",
//                                    "value": "SINGLE",
//                                    "prompt": "单项选择"
//                                },
//                                {
//                                    "text": "范围多选",
//                                    "value": "RANGE",
//                                    "prompt": "范围选择，点击一下选择开始值，再点击一下选择结束值"
//                                }
//                            ]
//                        },
//                        "M": {
//                            "selMode": "MULTIPLE",
//                            "date": [
//                                "-31D",
//                                "-1D"
//                            ],
//                            "range": [
//                                "2011-01-01",
//                                "-1D"
//                            ],
//                            "selModeList": [
//                                {
//                                    "text": "单选",
//                                    "value": "SINGLE",
//                                    "prompt": "单项选择"
//                                },
//                                {
//                                    "text": "范围多选",
//                                    "value": "RANGE",
//                                    "prompt": "范围选择，点击一下选择开始值，再点击一下选择结束值"
//                                }
//                            ]
//                        },
//                        "Q": {
//                            "selMode": "SINGLE",
//                            "date": [
//                                "-31D",
//                                "-1D"
//                            ],
//                            "range": [
//                                "2011-01-01",
//                                "-1D"
//                            ],
//                            "selModeList": [
//                                {
//                                    "text": "单选",
//                                    "value": "SINGLE",
//                                    "prompt": "单项选择"
//                                }
//                            ]
//                        }
                    }
                },
                // 与维度的id关联
                "name": "dim_time^_^the_date",
                // 数据关联
                "dateKey": {
//                    "D": "lztd",
//                    "W": "lztw",
//                    "M": "lztm",
//                    "Q": "lztq"
                },
                "clzKey": "X_CALENDAR"
            }
        ];

        // 那些个外在的配置项
        var config = {
            timeTypeListConfig: {
                "D": {
                    "value": "D",
                    "text": "日"
                },
                "W": {
                    "value": "W",
                    "text": "周"
                },
                "M": {
                    "value": "M",
                    "text": "月"
                },
                "Q": {
                    "value": "Q",
                    "text": "季"
                }
            },
            timeTypeOptConfig: {
                "D": {
                    "selMode": "SINGLE",
                    // 默认时间
                    "date": [
                        "-1D",
                        "-1D"
                    ],
                    // 事件范围
                    "range": [
                        "2011-01-01",
                        "-1D"
                    ],
                    "selModeList": [
                        {
                            "text": "单选",
                            "value": "SINGLE",
                            "prompt": "单项选择"
                        }
                    ]
                },
                "W": {
                    "selMode": "RANGE",
                    "date": [
                        "-1W",
                        "-1D"
                    ],
                    "range": [
                        "2011-01-01",
                        "-1D"
                    ],
                    "selModeList": [
                        {
                            "text": "单选",
                            "value": "SINGLE",
                            "prompt": "单项选择"
                        }
//                        {
//                            "text": "范围多选",
//                            "value": "RANGE",
//                            "prompt": "范围选择，点击一下选择开始值，再点击一下选择结束值"
//                        }
                    ]
                },
                "M": {
                    "selMode": "MULTIPLE",
                    "date": [
                        "-1M",
                        "-2M"
                    ],
                    "range": [
                        "2011-01-01",
                        "-1M"
                    ],
                    "selModeList": [
                        {
                            "text": "单选",
                            "value": "SINGLE",
                            "prompt": "单项选择"
                        }
//                        {
//                            "text": "范围多选",
//                            "value": "RANGE",
//                            "prompt": "范围选择，点击一下选择开始值，再点击一下选择结束值"
//                        }
                    ]
                },
                "Q": {
                    "selMode": "SINGLE",
                    "date": [
                        "-1Q",
                        "-2Q"
                    ],
                    "range": [
                        "2011-01-01",
                        "-1D"
                    ],
                    "selModeList": [
                        {
                            "text": "单选",
                            "value": "SINGLE",
                            "prompt": "单项选择"
                        }
                    ]
                }
            }
        };

        /**
         * 处理渲染数据（json的数据）
         *
         * @param {Object} dynamicData 动态数据
         * return {Object} 处理之后的数据
         */
        function processRenderData(dynamicData) {
            var id = dynamicData.rootId + dynamicData.serverData.id;
            var data = $.extend(true, [], this.renderData);
            data[0].id = id + '-vu-form-calendar';
            return data;
        };

        /**
         * 转换日历控件的配置信息（暂时简单做）
         *
         * @param {Array} data  前端整理后的数据
         * return {Object} 转换后的数据，包括两部分：timeTypeList 与 timeTypeOpt
         */
        function switchConfig(data) {
            var timeTypeList = [];
            var timeTypeOpt = {};
            var timeTypeListConfig = config.timeTypeListConfig;
            var timeTypeOptConfig = config.timeTypeOptConfig;

            for (var i = 0, len = data.length; i < len; i++) {
                var type = data[i].type;
                // 匹配timeTypeList
                timeTypeList.push(timeTypeListConfig[type]);
                // 匹配timeTypeOpt
                var opt = timeTypeOptConfig[type];
                opt.date = data[i].date;
                timeTypeOpt[type] = $.extend(true, {}, opt);
                // 匹配数据配置
            }

            return {
                timeTypeList: timeTypeList,
                timeTypeOpt: timeTypeOpt
            }
        }

        /**
         * 逆转换日历控件的配置信息（转换为可以还原展示的数据格式）
         *
         * @param {Object} timeTypeOpt 待转换数据，主要是
         * return {Array} data  整理后的数据
         */
        function deSwitchConfig(timeTypeOpt) {
            var data = [];
            var fromItem;
            var date;
            for (var name in timeTypeOpt) {
                var toItem = {};
                fromItem = timeTypeOpt[name];

                // 类型
                toItem.type = name;
                // 临时处理，如果添加功能需要升级此处代码
                date = fromItem.date[0];
                // 默认时间的偏差值
                toItem.defaultSelectedVal = date.substr(0, date.length-1);
                // 默认时间的偏差单位
                toItem.defaultSelectedUnit = date.substr(date.length-1, 1);

                data.push(toItem);
            }

            return data;
        }

        /**
         * 将后台给的单词转换成为前台需要的字母
         *
         * @param {string} word 后台给的单词
         * @public
         * @return {string} letter 前台需要的单词
         */
        function switchLetter (word) {
            var letter;
            switch (word) {
                case 'ownertable_TimeDay':
                    letter = 'D';
                    break ;
                case 'ownertable_TimeWeekly':
                    letter = 'W';
                    break ;
                case 'ownertable_TimeMonth':
                    letter = 'M';
                    break ;
                case 'ownertable_TimeQuarter':
                    letter = 'Q';
                    break ;
                case 'ownertable_TimeYear':
                    letter = 'Y';
                    break ;
            }
            return letter;
        }

        return {
            componentType: 'vui',
            type: 'TIME_COMP',
            caption: '日历',
            class: 'calendar',
            defaultWidth: 500,
            defaultHeight: 27,
            vm: {
                render: function (data) {
                    var renderData = {
                        id: data.rootId + data.serverData.id
                    };
                    return calendarVmTemplate.render(renderData);
                }
            },
            renderData: renderData,
            processRenderData: processRenderData,
            switchConfig: switchConfig,
            deSwitchConfig: deSwitchConfig,
            config: config,
            switchLetter: switchLetter
        };
    });