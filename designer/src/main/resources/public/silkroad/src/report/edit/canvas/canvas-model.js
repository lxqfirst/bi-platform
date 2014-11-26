/**
 * @file 报表编辑画布区操作的model
 * @author 赵晓强(longze_xq@163.com)
 * @date 2014-08-05
 */
define([
        'url',
        'report/edit/component-box/form-model'
    ], function (Url, formModel) {
        var rootId = 'snpt.';

        return Backbone.Model.extend({

            /**
             * 构造函数
             *
             * @param {Object} option 初始化配置项
             * @constructor
             */
            initialize: function (option) {
                this.parentModel = option.parentModel;
                this.compBoxModel = option.compBoxModel;
                window.canvas = this;
            },

            /**
             * 初始化报表的json文件配置信息
             *
             * @param {Function} success 交互成功后的回调函数
             * @public
             */
            initJson: function (success) {
                var that = this;

                $.ajax({
                    url: Url.initJson(that.id),
                    success: function (data) {
                        if (data.data !== null) {
                            that.reportJson = eval('(' + data.data + ')');
                        }
                        else {
                            that.reportJson = that.compBoxModel.config.defaultJson;
                            // 添加form（始终有form）
                            var formModel = that.compBoxModel.config.formModel;
                            that.reportJson.entityDefs.push(formModel.processRenderData(rootId));
                        }
                        success(that.reportJson);
                    }
                });
            },

            /**
             * 初始化报表的vm文件配置信息
             *
             * @param {Function} success 交互成功后的回调函数
             * @public
             */
            initVm: function (success) {
                var that = this;

                $.ajax({
                    url: Url.initVm(that.id),
                    success: function (data) {
                        if (data.data !== null) {
                            that.$reportVm = $(data.data);
                        }
                        else {
                            that.$reportVm = $(that.compBoxModel.config.defaultVm);
                            // 添加form（始终有form）
                            var formModel = that.compBoxModel.config.formModel;
                            that.$reportVm.append(formModel.vmTemplate.render({id: rootId}));
                        }
                        success(that.$reportVm);
                    }
                });
            },

            /**
             * 是否有form（在当前json中）
             *
             * @public
             * @return {boolean} 是否有form
             */
            hasFormComponent: function () {
                var array = this.reportJson.entityDefs;

                for (var i = 0, iLen = array.length; i < iLen; i++) {
                    var entity = array[i];
                    if (entity.clzKey === 'DI_FORM') {
                        return true;
                    }
                }
                return false;
            },

            /**
             * 获取json中的form信息，如果不存在返回null
             *
             * @private
             */
            _getFormJson: function () {
                var array = this.reportJson.entityDefs;
                for (var i = 0, iLen = array.length; i < iLen; i++) {
                    var entity = array[i];
                    if (entity.clzKey === 'DI_FORM') {
                        return entity;
                    }
                }
                return null;
            },

            /**
             * 向报表中添加一个组件
             *
             * @param {Object} compData 组件的配置信息
             * @param {string} compType 组件类型
             * @param {Function} createShell 结合后台返回的组件id生成组件外壳的回调函数
             * @param {Function} success 添加成功后的回调支持
             * @public
             */
            addComp: function (compData, compType, createShell, success) {
                var that = this;

                $.ajax({
                    url: Url.addComp(that.id),
                    type: 'POST',
                    data: {
                        type: compType
                    },
                    success: function (data) {
                        var serverData = data.data;

                        // 向VM中添加数据
                        that.addCompDataToVm(
                            createShell,
                            compData,
                            compType,
                            serverData
                        );
                        // 向Json中添加数据
                        that.addCompDataToJson(compData, compType, serverData);
                        that.saveJsonVm(success);
                    }
                });
            },

            /**
             * 向Vm中添加组件的信息
             *
             * @param {Function} createShell 结合后台返回的组件id生成组件外壳的回调函数
             * @param {Object} compData 组件的配置信息
             * @param {string} compType 组件类型
             * @param {string} serverData 服务器返回的数据
             * @public
             */
            addCompDataToVm: function (
                createShell,
                compData,
                compType,
                serverData
            ) {
                var vm = createShell(serverData.id);

                vm.html(compData.vm.render({
                    rootId: rootId,
                    serverData: serverData
                }));
                this.$reportVm.append(vm);
            },

            /**
             * 添加组件时向json文件中添加数据
             *
             * @param {Object} compData 组件配置数据，在component-box/main-model中配置
             * @param {string} compType 组件类型，来源同上
             * @param {Object} serverData 服务器返回的数据
             * @public
             */
            addCompDataToJson: function (compData, compType, serverData) {
                var reportJson = this.reportJson;
                var compRenderData;

                // 组件的json配置信息
                compRenderData = compData.processRenderData({
                    rootId: rootId,
                    serverData: serverData
                });

                // 添加compId，方便删除组件
                for (var i = 0, len = compRenderData.length; i < len; i++) {
                    compRenderData[i].compId = serverData.id;
                }

                var entityDefs = reportJson.entityDefs;
                // 如果是vui，需要向form中添加配置
                if (compData.componentType == 'vui') {
                    formJson = this._getFormJson();
                    // 址引用，直接赋值可以生效
                    formJson.vuiRef.input.push(compRenderData[0].id);
                }

                this.reportJson.entityDefs = entityDefs.concat(compRenderData);
            },

            /**
             * 删除报表中的某一组件,具体发送异步请求
             *
             * @param {string} compId 组件Id
             * @param {Function} success 回调函数
             * @public
             */
            deleteComp: function (compId, success) {
                var that = this;

                $.ajax({
                    url: Url.deleteComp(that.id, compId),
                    type: 'DELETE',
                    success: function () {
                        that._deleteComp(compId, success);
                    }
                });
            },

            /**
             * 删除报表中的某一组件,具体处理本地数据
             *
             * @param {string} compId 组件Id
             * @param {Function} success 回调函数
             * @private
             */
            _deleteComp: function (compId, success) {
                var that = this;
                var isDeleteVUI = false;
                success = success || new Function();
                // 移除vm中的东西
                var selector = '[data-comp-id=' + compId + ']';
                that.$reportVm.find(selector).remove();

                // 移除json中的东西
                var arr = that.reportJson.entityDefs;
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].compId == compId) {
                        // 如果是vui（条件组件）要删除form中的配置
                        if (
                            arr[i].clzType == 'VUI'
                            &&
                            arr[i].clzKey == 'X_CALENDAR'
                        ) {
                            that._deleteCompFromForm(arr[i].id);
                            isDeleteVUI = true;
                        }

                        arr.splice(i, 1);
                        // 某些组件的数据项可能是一组而并非一个，比如table
                        i--;
                    }
                }

                that.saveJsonVm(success);
            },

            /**
             * 处理form，主要是对无用的form做删除
             *
             * @private
             */
            _processFrom: function () {
                var formJson = this._getFormJson();
                var vuiArr = formJson.vuiRef.input;

                // 如果已经无vui存在了，删除form
                if (vuiArr.length == 0) {
                    this._deleteComp('comp-id-form');
                }
                // TODO 删除form后需要变换所有组件渲染的方式
                this._responseFormChange();
            },

            /**
             * 从form的配置信息中删除相关的vui信息
             *
             * @param {string} vuiId
             * @private
             */
            _deleteCompFromForm: function (vuiId) {
                var formJson = this._getFormJson();
                var vuiArr = formJson.vuiRef.input;

                for (var i = 0, len = vuiArr.length; i < len; i++) {
                    if (vuiArr[i] == vuiId) {
                        vuiArr.splice(i, 1);
                        break;
                    }
                }
            },

            /**
             * 组件拖动后，更新vm中组件的位置信息
             *
             * @param {string} compId 组件id
             * @param {string} left 左坐标值
             * @param {string} top 上坐标值
             * @public
             */
            updateCompPositing: function (compId, left, top) {
                this.$reportVm.find('[data-comp-id=' + compId + ']').css({
                    left: left,
                    top: top
                });
                this.saveJsonVm();
            },

            /**
             * 组件调整大小后，更新vm中组件的width与height
             *
             * @param {Object} paramObj 参数对象
             * @public
             */
            resizeComp: function (paramObj) {
                this.$reportVm.find('[data-comp-id=' + paramObj.compId + ']').css({
                    width: paramObj.width,
                    height: paramObj.height
                }).find('.vu-table').height(parseInt(paramObj.height) - 130);
                // 上下小零件的总高度94（=40+19+35） + 30的padding-top
                this.saveJsonVm();
            },

            /**
             * 保存报表
             *
             * @param {Function} success 回调函数
             * @public
             */
            saveReport: function (success) {
                var that = this;

                $.ajax({
                    url: Url.saveReport(that.id),
                    type: 'PUT',
                    data: {
                        json: JSON.stringify(that.reportJson),
                        vm: that.$reportVm.prop('outerHTML')
                    },
                    success: function () {
                        success && success();
                    }
                });
            },

            /**
             * 保存json与vm
             *
             * @param {Function} success 回调函数
             * @public
             */
            saveJsonVm: function (success) {
                var that = this;
                success = success || new Function();

                $.ajax({
                    url: Url.saveJsonVm(that.id),
                    type: 'PUT',
                    data: {
                        json: JSON.stringify(that.reportJson),
                        vm: that.$reportVm.prop('outerHTML')
                    },
                    success: function () {
                        success();
                    }
                });
            }
        });
    }
);