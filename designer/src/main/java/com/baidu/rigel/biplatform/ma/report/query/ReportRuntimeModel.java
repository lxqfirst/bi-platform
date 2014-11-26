/**
 * Copyright (c) 2014 Baidu, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.baidu.rigel.biplatform.ma.report.query;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.util.CollectionUtils;

import com.baidu.rigel.biplatform.ac.model.OlapElement;
import com.baidu.rigel.biplatform.ac.model.Schema;
import com.baidu.rigel.biplatform.ac.query.model.TimeCondition;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.ExtendAreaType;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.report.model.LiteOlapExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.LogicModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.utils.ItemUtils;
import com.baidu.rigel.biplatform.ma.report.utils.ReportDesignModelUtils;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * 
 * 报表运形态模型定义：用于描述运行时报表数据状态、操作状态等信息 提供报表区域更新、报表刷新操作等
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class ReportRuntimeModel implements Serializable {
    
    /**
     * serialized id
     */
    private static final long serialVersionUID = -7736213381907577058L;
    
    /**
     * id
     */
    private String id;
    
    /**
     * 定义模型：这里为定义模型的副本
     */
    private final String reportModelId;
    
    /**
     * 报表数据信息key为由单次QueryAction生成的唯一id为该区域对应的数据
     */
    private Map<String, LinkedList<ResultSet>> datas = null;
    
    /**
     * context信息：包括报表参数、过滤信息以及一些单张报表共享的全局信息
     */
    private QueryContext context;
    
    /**
     * 时间维度的itemId列表
     */
    private List<String> timeDimItemIds = Lists.newArrayList();
    
    /**
     * 选中的行
     */
    private Set<String> selectedRowIds;
    
    /**
     * 扩展区域对于的局部上下文，优先级高于全剧上下文 key 为扩展区域id
     */
    private Map<String, QueryContext> localContext;
    
    /**
     * 存储当前访问会话中，每个area对应的“维度名称-->Item”关系
     */
    private Map<String, Map<String, Item>> universalItemStore = Maps.newHashMap();
    
    /**
     * @return the universalItemStore
     */
    public Map<String, Map<String, Item>> getUniversalItemStore() {
        return universalItemStore;
    }
    
    /**
     * 是否已经初始化
     */
    private volatile boolean isInited = false;
    
    /**
     * 
     * 以便记录操作记录，提供回放功能 添加快照，方便记录快照 添加序列化和反序列化机制，为离线浏览提供支持 添加websocket支持 提供分屏共享支持
     * 提供下钻、上卷操作支持 提供行列转制支持
     * 
     * 
     */
    private Map<String, LinkedList<QueryAction>> queryActions = null;
    
//    /**
//     * 报表数据查询服务
//     */
//    @Resource
//    private ReportModelQueryService reportModelQueryService;
    
    /**
     * 构造函数
     * 
     * @param model
     *            定义模型定义
     */
    public ReportRuntimeModel(String reportModelId) {
        this.reportModelId = reportModelId;
        this.datas = Maps.newConcurrentMap();
        queryActions = Maps.newConcurrentMap();
        this.localContext = Maps.newConcurrentMap();
        this.context = new QueryContext();
    }
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    /**
     * get the datas
     * 
     * @return the datas
     */
    public Map<String, LinkedList<ResultSet>> getDatas() {
        return datas;
    }
    
    /**
     * get the reportModelId
     * 
     * @return the reportModelId
     */
    public String getReportModelId() {
        return reportModelId;
    }
    
    /**
     * get the queryActions
     * 
     * @return the queryActions
     */
    public Map<String, LinkedList<QueryAction>>  getQueryActions() {
        return queryActions;
    }
    
    /**
     * 获取运行时报表的context
     * 
     * @return 如果已经初始化，返回context 否则返回null
     */
    public QueryContext getContext() {
        if (!this.isInited || this.context == null) {
            this.context = new QueryContext();
        }
        return this.context;
    }
    
    /**
     * init
     * @param model
     * @param force
     */
    public void init(ReportDesignModel model, boolean force) {
//        if (!force) { 
//            return;
//        }
        context = new QueryContext();
        isInited = true;
        updateLogicModels(model);
        updateDimStores(model);
    }
    
    /**
     * @param model
     */
    private void updateLogicModels(ReportDesignModel model) {
        Schema schema = model.getSchema();
        model.getExtendAreas().values().forEach( area -> {
            LogicModel logicModel = area.getLogicModel();
            if (logicModel == null) {
                return;
            }
            /**
             * 
             */
            List<Item> itemsToRemove = collectCommonRemoveItem(schema, area, logicModel);
            collectLiteOlapItem(schema, area, itemsToRemove);
            removeAll(area, logicModel, itemsToRemove);
        });
        
    }

    /**
     * @param area
     * @param logicModel
     * @param itemsToRemove
     */
    private void removeAll(ExtendArea area, LogicModel logicModel, List<Item> itemsToRemove) {
        for (Item item : itemsToRemove) {
            switch (item.getPositionType()) {
                case X:
                    logicModel.removeRow(item.getOlapElementId());
                    break;
                case Y:
                    logicModel.removeColumn(item.getOlapElementId());
                    break;
                case S:
                    logicModel.removeSlice(item.getOlapElementId());
                    break;
                case CAND_DIM:
                    ((LiteOlapExtendArea) area).removeCandDim(item.getOlapElementId());
                    break;
                case CAND_IND:
                    ((LiteOlapExtendArea) area).removeCandInd(item.getOlapElementId());
                    break;
            }
        }
    }

    /**
     * @param schema
     * @param area
     * @param logicModel
     * @return
     */
    private List<Item> collectCommonRemoveItem(Schema schema, ExtendArea area, LogicModel logicModel) {
        List<Item> itemsToRemove = Lists.newArrayList();
        for (Item item : logicModel.getItems()) {
            OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(schema,
                    area.getCubeId(), item.getOlapElementId());
            if (element == null) {
                itemsToRemove.add(item);
            }
        }
        return itemsToRemove;
    }

    /**
     * @param schema
     * @param area
     * @param itemsToRemove
     */
    private void collectLiteOlapItem(Schema schema, ExtendArea area, List<Item> itemsToRemove) {
        if (area.getType() == ExtendAreaType.LITEOLAP) {
            ((LiteOlapExtendArea) area).getCandDims().values().parallelStream().forEach(item -> {
                OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(schema,
                        area.getCubeId(), item.getOlapElementId());
                if (element == null) {
                    itemsToRemove.add(item);
                }
            });
            ((LiteOlapExtendArea) area).getCandInds().values().parallelStream().forEach(item -> {
                OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(schema,
                        area.getCubeId(), item.getOlapElementId());
                if (element == null) {
                    itemsToRemove.add(item);
                }
            });
        }
    }
    
    public void updateDimStores(ReportDesignModel model) {
        ExtendArea[] areas = model.getExtendAreaList();
        if (areas == null || areas.length == 0) {
            return;
        }
        for (ExtendArea area : areas) { // 遍历扩展区域，初始化查询部件或者时间部件
            if (area.getType().equals(ExtendAreaType.QUERY_COMP)) { // 查询部件
                continue;
            }
            if (area.getType().equals(ExtendAreaType.TIME_COMP)) { // 时间部件
                LogicModel logicModel = area.getLogicModel();
                putIntoContext(logicModel, ExtendAreaType.TIME_COMP);
                continue;
            }
            updateDimStore(model, area.getId());
        }
    }
    
    private void updateDimStore(ReportDesignModel model, String areaId) {
        ExtendArea area = model.getExtendById(areaId);
        if (area.getLogicModel() != null) {
            /**
             * 为了联动需要，在runtimeModel中增加一个Map，存储维度名称与对应item对象
             */
            Map<String, Item> store = getItemStoreWithDimNameKey(area.getLogicModel(),
                    model.getSchema(), area.getCubeId());
            if (!CollectionUtils.isEmpty(store)) {
                this.universalItemStore.put(area.getId(), store);
                putTimeConditionIntoContext(store.values().iterator().next());
            }
        }
    }
    
    private Map<String, Item> getItemStoreWithDimNameKey(LogicModel logicModel, Schema schema,
            String cubeId) {
        Map<String, Item> store = Maps.newHashMap();
        for (Item item : logicModel.getItems()) {
            OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(schema, cubeId,
                    item.getOlapElementId());
            if (ItemUtils.isTimeDim(item, schema, cubeId)) {
                timeDimItemIds.add(item.getOlapElementId());
            }
            store.put(element.getName(), item);
        }
        return store;
    }
    
    /**
     * 将逻辑模型定义的数据信息更新到上下文
     * 
     * @param logicModel
     *            逻辑模型定义
     */
    private void putIntoContext(LogicModel logicModel, ExtendAreaType type) {
        if (logicModel == null) {
            return;
        }
        Item[] items = logicModel.getItems();
        if (items == null || items.length == 0) {
            return;
        }
        switch (type) {
            case TIME_COMP: {
                putTimeConditionIntoContext(items[0]);
                break;
            }
            default:
        }
    }
    
    /**
     * 将时间维度过滤信息放入上下文
     * 
     * @param items
     */
    private void putTimeConditionIntoContext(Item item) {
        if (item == null) {
            return;
        }
        String itemId = item.getOlapElementId();
        TimeCondition value = (TimeCondition) item.getParams().get(itemId);
        if (value != null) { // 用户提供默认值
            context.put(itemId, value);
        } else {
            value = new TimeCondition();
            SimpleDateFormat formate = new SimpleDateFormat("yyyy-MM-dd");
            String currentDate = formate.format(new Date());
            value.setEnd(currentDate);
            value.setStart(currentDate);
        }
    }
    
    /**
     * 
     * 通过查询action更新数据模型
     * 
     * @param action
     *            查询action
     * @param rs
     *            把返回结果和查询动作更新到运行模型中
     * @return 数据模型
     * 
     */
    public ResultSet updateDatas(QueryAction action, ResultSet rs) {
        if (this.queryActions.get(action.getExtendAreaId()) == null){
        		LinkedList<QueryAction> actions = Lists.newLinkedList();
        		actions.add(action);
        		this.queryActions.put(action.getExtendAreaId(), actions);
        } else {
        		this.queryActions.get(action.getExtendAreaId()).add(action);
        }
        // 缓存查询状态以及结果
        if (this.datas.get(action.getExtendAreaId()) == null) {
        		LinkedList<ResultSet> results = Lists.newLinkedList();
        		results.add(rs);
        		this.datas.put(action.getExtendAreaId(), results);
        } else {
        		this.datas.get(action.getExtendAreaId()).add(rs);
        }
//        this.datas.put(action.getDistinctId(), rs);
        return rs;
    }
    
    /**
     * 刷新整个报表模型
     * 
     * @param usingCache
     *            是否优先使用cache
     */
    public void refresh(boolean usingCache) {
    }
    
    /**
     * 下钻操作
     * 
     * @param action
     *            查询action
     * @param rs
     *            把返回结果和查询动作更新到运行模型中
     * @return 数据模型
     */
    public ResultSet drillDown(QueryAction action, ResultSet rs) {
        if (rs != null) {
            updateDatas(action, rs);
//            this.datas.put(action.getDistinctId(), rs);
        }
        return rs;
    }
    
    /**
     * @return the selectedRowIds
     */
    public Set<String> getSelectedRowIds() {
        if (selectedRowIds == null) {
            selectedRowIds = Sets.newHashSet();
        }
        return selectedRowIds;
    }
    
    /**
     * @param selectedRowIds
     *            the selectedRowIds to set
     */
    public void setSelectedRowIds(Set<String> selectedRowIds) {
        this.selectedRowIds = selectedRowIds;
    }
    
    /**
     * 
     * @param areaId
     * @return
     */
    public QueryContext getLocalContextByAreaId(String areaId) {
        QueryContext context = this.localContext.get(areaId);
        if (context == null) {
            context = new QueryContext();
            /**
             * Question. context为啥需要extendAreaId
             */
            context.setExtendAreaId(areaId);
            this.localContext.put(areaId, context);
        }
        
        return context;
    }
    
    /**
     * 获取上次查询的查询结果
     * @param previousAction 
     * 
     * @return
     */
    public ResultSet getPreviousQueryResult(QueryAction previousAction) {
        if (previousAction == null) {
        		return null;
        }
        LinkedList<ResultSet> resultList = this.datas.get(previousAction.getExtendAreaId());
		if (resultList == null) {
        		return null;
        }
        
        return resultList.isEmpty() ? null : resultList.getLast();
    }
    
    /**
     * @return the timeDimItemIds
     */
    public List<String> getTimeDimItemIds() {
        return timeDimItemIds;
    }
    
    public QueryAction getPreviousQueryAction(String areaId) {
        if (this.queryActions.get(areaId) == null) {
            return null;
        }
//        for (int i = queryActions.size() - 1; i >= 0; --i) {
//            if (this.queryActions.get(i).getExtendAreaId().equals(areaId)) {
//                return this.queryActions.get(i);
//            }
//        }
        
        LinkedList<QueryAction> actionList = this.getQueryActions().get(areaId);
		return actionList.isEmpty() ? null : actionList.getLast();
    }

    public Map<String, QueryContext> getLocalContext() {
        return this.localContext;
    }
}
