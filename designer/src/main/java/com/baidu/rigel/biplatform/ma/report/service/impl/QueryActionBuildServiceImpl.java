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
package com.baidu.rigel.biplatform.ma.report.service.impl;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ac.minicube.TimeDimension;
import com.baidu.rigel.biplatform.ac.model.OlapElement;
import com.baidu.rigel.biplatform.ac.model.Schema;
import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ac.util.DeepcopyUtils;
import com.baidu.rigel.biplatform.ac.util.MetaNameUtil;
import com.baidu.rigel.biplatform.ac.util.TimeRangeDetail;
import com.baidu.rigel.biplatform.ac.util.TimeUtils;
import com.baidu.rigel.biplatform.ma.model.service.PositionType;
import com.baidu.rigel.biplatform.ma.model.utils.UuidGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.exception.PivotTableParseException;
import com.baidu.rigel.biplatform.ma.report.exception.QueryModelBuildException;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.ExtendAreaType;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.report.model.LiteOlapExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.LogicModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.query.QueryAction;
import com.baidu.rigel.biplatform.ma.report.query.QueryContext;
import com.baidu.rigel.biplatform.ma.report.query.ReportRuntimeModel;
import com.baidu.rigel.biplatform.ma.report.query.ResultSet;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.PivotTable;
import com.baidu.rigel.biplatform.ma.report.service.AnalysisChartBuildService;
import com.baidu.rigel.biplatform.ma.report.service.QueryBuildService;
import com.baidu.rigel.biplatform.ma.report.utils.ItemUtils;
import com.baidu.rigel.biplatform.ma.report.utils.ReportDesignModelUtils;
import com.baidu.rigel.biplatform.ma.resource.utils.DataModelUtils;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 
 * QueryAction构建服务
 * 
 * @author zhongyi
 *
 *         2014-8-5
 */
@Service
public class QueryActionBuildServiceImpl implements QueryBuildService {
    
    /**
     * logger
     */
    private static Logger logger = LoggerFactory.getLogger(QueryActionBuildServiceImpl.class);
    
    /**
     * analysisChartBuildService
     */
    @Resource
    private AnalysisChartBuildService analysisChartBuildService;
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.report.service.QueryActionBuildService#
     * generateQueryAction()
     */
    @Override
    public QueryAction generateTableQueryAction(ReportDesignModel model, String areaId,
            Map<String, Object> context) {
        
        ExtendArea targetArea = getRealExtendArea(model, areaId, context);
        LogicModel targetLogicModel = targetArea.getLogicModel();
        String cubeId = targetArea.getCubeId();
        return generateQueryAction(model.getSchema(),
                cubeId, targetLogicModel, context, areaId, false);
    }

    /* (non-Javadoc)
     * @see com.baidu.rigel.biplatform.ma.report.service.QueryBuildService#generateTableQueryActionForDrill(com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel, java.lang.String, java.util.Map)
     */
    @Override
    public QueryAction generateTableQueryActionForDrill(ReportDesignModel model, String areaId,
            Map<String, Object> contextParams, int targetIndex) {
        
        ReportDesignModel drillModel = DeepcopyUtils.deepCopy(model);
        ExtendArea targetArea = getRealExtendArea(drillModel, areaId, contextParams);
        LogicModel targetLogicModel = targetArea.getLogicModel();
        String cubeId = targetArea.getCubeId();
        List<String> rowDimsAhead = Lists.newArrayList();
        int target = targetIndex;
        for (int i = 0; i < targetIndex; i++) {
            Item rowDim = targetLogicModel.getRows()[i];
            rowDimsAhead.add(rowDim.getOlapElementId());
        }
        for (String rowAhead : rowDimsAhead) {
            Item item = targetLogicModel.removeRow(rowAhead);
            targetLogicModel.addSlice(item);
            target--;
        }
        QueryAction action = generateQueryAction(drillModel.getSchema(),
                cubeId, targetLogicModel, contextParams, areaId, false);
        /**
         * 把下钻的值存下来
         */
        Item item = targetLogicModel.getRows()[target];
        if (item != null && contextParams.containsKey(item.getOlapElementId())) {
            action.getDrillDimValues().put(item,
                    contextParams.get(item.getOlapElementId()));
        }
        return action;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public QueryAction generateChartQueryAction(ReportDesignModel model, String areaId,
            Map<String, Object> context, String[] indNames, ReportRuntimeModel runTimeModel)
                    throws QueryModelBuildException {
        
        ExtendArea targetArea = model.getExtendById(areaId);
        LogicModel targetLogicModel = null;
        String cubeId = targetArea.getCubeId();
        /**
         * generateQueryAction方法中需要指定logicModel所在的区域id，
         * logicModelAreaId即该区域id
         */
        String logicModelAreaId = areaId;
        if (targetArea.getType() == ExtendAreaType.LITEOLAP_CHART) {
            /**
             * 针对liteOlap表的查询
             */
            ExtendArea referenceArea = model.getExtendById(targetArea.getReferenceAreaId());
            logicModelAreaId = referenceArea.getId();
            cubeId = referenceArea.getCubeId();
            /**
             * 找到liteOlap的父区域，获取logicModel
             */
            LiteOlapExtendArea liteOlapArea = (LiteOlapExtendArea) referenceArea;
            targetLogicModel = referenceArea.getLogicModel();
            /**
             * 针对liteOlap表的图形分析区查询，产生新的logicModel row和col来自用户选中的行和指标
             * row和col的获取步骤： 1. 拿到前端传来的指标id，拿到存储在runtimeModel中的selectedRowIds 2.
             * 根据当前状态，生成查询表所使用的queryAction 3. 根据queryAction得到结果缓存中表的查询结果 4.
             * 按照1中得到的参数，从结果中找到行上的维度和指标 5. 将维度、指标拼成rows和cols
             */
            List<Item> rows = Lists.newArrayList();
            List<Item> cols = Lists.newArrayList();
            /**
             * 1.
             */
            
            String[] selectedRowIds = runTimeModel.getSelectedRowIds().toArray(new String[0]);
            if (selectedRowIds.length > 1) {
                logger.warn("More than one line selected, do not support! Query as One line!");
            }
            /**
             * 2.
             */
            QueryContext queryContextForTable = runTimeModel.getLocalContextByAreaId(
                    liteOlapArea.getTableAreaId());
            QueryAction actionForTable = generateTableQueryAction(model, liteOlapArea.getTableAreaId(),
                    queryContextForTable.getParams());
            /**
             * 3.
             */
            ResultSet resultSet = runTimeModel.getPreviousQueryResult(actionForTable);
            if (resultSet == null) {
                logger.error("There is no result of table for querying liteOlap Chart!!");
                throw new RuntimeException("There is no result of table for querying liteOlap Chart!!");
            }
            /**
             * 按照选中行ID得到行上的维度值
             */
            String[] uniqNames = com.baidu.rigel.biplatform.ac.util
                    .DataModelUtils.parseNodeUniqueNameToNodeValueArray(selectedRowIds[0]);
            /**
             * 从logicmodel里面找到时间维度
             */
            List<String> timeItemIds = runTimeModel.getTimeDimItemIds();
            Item timeDimItem = null;
            for (String timeItemId : timeItemIds) {
                timeDimItem = targetLogicModel.getItemByOlapElementId(timeItemId);
                if (timeDimItem != null) {
                    break;
                }
            }
            /**
             * 从context里面查看，否是有时间维度
             */
            if (timeDimItem == null) {
                for (String key : context.keySet()) {
                    OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(model.getSchema(),
                            cubeId, key);
                    if (element != null && element instanceof TimeDimension) {
                        timeDimItem = new Item();
                        timeDimItem.setAreaId(areaId);
                        timeDimItem.setCubeId(cubeId);
                        timeDimItem.setId(element.getId());
                        timeDimItem.setOlapElementId(element.getId());
                        timeDimItem.setPositionType(PositionType.X);
                        timeDimItem.setSchemaId(model.getSchema().getId());
                    }
                }
            }
            for (String uniqName : uniqNames) {
                String dimName = MetaNameUtil.getDimNameFromUniqueName(uniqName);
                Map<String, Item> store = runTimeModel.getUniversalItemStore().get(liteOlapArea.getId());
                if (CollectionUtils.isEmpty(store)) {
                    String msg = "The item map of area (" + liteOlapArea.getId() + ") is Empty!";
                    logger.error(msg);
                    throw new RuntimeException(msg);
                }
                Item row = store.get(dimName);
                if (row == null) {
                    String msg = String.format("Dimension(%s) Not found in the store of Area(%s)!",
                            dimName, liteOlapArea.getId());
                    logger.error(msg);
                    throw new RuntimeException(msg);
                }
                rows.add(row);
                context.put(row.getOlapElementId(), uniqName);
            }
            for (String indName : indNames) {
                cols.add(liteOlapArea.getAllItems().get(indName));
            }
            targetLogicModel = analysisChartBuildService.generateTrendChartModel(targetLogicModel,
                    model.getSchema(), liteOlapArea.getCubeId(), rows, cols, timeDimItem);
            return generateQueryAction(model.getSchema(),
                    cubeId, targetLogicModel, context, logicModelAreaId, true);
        } else {
            targetLogicModel = targetArea.getLogicModel();
            List<String> timeItemIds = runTimeModel.getTimeDimItemIds();
            Item timeDimItem = null;
            for (String timeItemId : timeItemIds) {
                timeDimItem = targetLogicModel.getItemByOlapElementId(timeItemId);
                if (timeDimItem != null) {
                    break;
                }
            }
            if (timeDimItem != null && timeDimItem.getPositionType() == PositionType.X) { // 时间序列图
            		Map<String, Object> params = DeepcopyUtils.deepCopy(timeDimItem.getParams());
            		params.put("range", true);
            		timeDimItem.setParams(params);
            }
           return generateQueryAction(model.getSchema(),
        		       cubeId, targetLogicModel, context, logicModelAreaId, false);
        }
        
    }
    
    /**
     * 生成QueryAction
     * 
     * @param targetLogicModel
     * @param context
     * @return
     */
    private QueryAction generateQueryAction(Schema schema, String cubeId,
            LogicModel targetLogicModel, Map<String, Object> context,
            String areaId, boolean needTimeRange) {
        QueryAction action = new QueryAction();
        
        action.setExtendAreaId(areaId);
        
        /**
         * 从context里面查看，否是有时间维度
         */
        for (String key : context.keySet()) {
            OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(schema, cubeId, key);
            if (element != null && !targetLogicModel.containsOlapElement(element.getId())) {
                Item item = new Item();
                item.setAreaId(areaId);
                item.setCubeId(cubeId);
                item.setId(element.getId());
                item.setOlapElementId(element.getId());
                item.setPositionType(PositionType.S);
                item.setSchemaId(schema.getId());
                targetLogicModel.addSlice(item);
            }
        }
        
        if (targetLogicModel == null) {
            return null;
        }
        Map<Item, Object> columns = genereateItemValues(schema,
                cubeId, targetLogicModel.getColumns(), context, needTimeRange);
        action.setColumns(columns);
        
        Map<Item, Object> rows = genereateItemValues(schema,
                cubeId, targetLogicModel.getRows(), context, needTimeRange);
        action.setRows(rows);
        
        Map<Item, Object> slices = genereateItemValues(schema,
                cubeId, targetLogicModel.getSlices(), context, needTimeRange);
        action.setSlices(slices);
        
        /**
         * TODO 生成一个独立的id
         */
        String id = UuidGeneratorUtils.generate();
        action.setId(id);
        
        /**
         * TODO 生成path
         */
        String queryPath = "";
        action.setQueryPath(queryPath);
        
        return action;
    }
    
    /**
     * 
     * @param items
     * @param values
     * @return
     */
    private Map<Item, Object> genereateItemValues(Schema schema,
            String cubeId, Item[] items, Map<String, Object> values,
            boolean timeRange) {
        /**
         * item必须保证顺序
         */
        Map<Item, Object> itemValues = Maps.newLinkedHashMap();
        boolean update = true;
        if (CollectionUtils.isEmpty(values)) {
            update = false;
        }
        for (Item item : items) {
            String elementId = item.getOlapElementId();
            if (StringUtils.isEmpty(elementId)) {
                continue;
            }
            Object value = update && values.containsKey(elementId) ? values.get(elementId) : item
                    .getParams().get(elementId);
            OlapElement element = ItemUtils.getOlapElementByItem(item, schema, cubeId);
            if (value != null && element instanceof TimeDimension && 
            		!value.toString().toLowerCase().contains("all")) {
                String start;
                String end;
                try {
                    JSONObject json = new JSONObject(String.valueOf(value));
                    /**
                     * TODO 考虑月/周/年等
                     */
                    start = json.getString("start").replace("-", "");
                    end = json.getString("end").replace("-", "");
                    if (item.getParams().get("range") != null && start.equals(end)) {
                    		TimeRangeDetail tail = TimeUtils.getMonthDays(TimeRangeDetail.getTime(start));
						start = tail.getStart();
						end = tail.getEnd();
                    } else {
	                    	TimeDimension timeDim = (TimeDimension) element;
	                    	Map<String, String> time= TimeUtils.getTimeCondition(start, end, timeDim.getDataTimeType());
	                    	start = time.get("start");
	                    	end = time.get("end");
                    }
                } catch (Exception e) {
                    logger.warn(
                            "Time Condition not Correct. Maybe from row."
                            + " Try to use it as UniqueName. Time: " + value, e);
                    if (value instanceof String[]) {
                        String[] dates = (String[]) value;
                        /**
                         * TODO 如果有多选时间，把第一个时间和最后一个时间作为start和end，不支持间断时间
                         * 以后要考虑重构，支持间断时间
                         */
                        start = parseToDate(dates[0]);
                        end = parseToDate(dates[dates.length - 1]);
                    } else {
                        start = parseToDate(String.valueOf(value));
                        end = parseToDate(String.valueOf(value));
                    }
                    
                }
                TimeRangeDetail range = new TimeRangeDetail(start, end);
                if (timeRange && start.equals(end)) {
                    /**
                     * 如果是时间区域，并且时间参数中起始和结束相同，把时间扩展为start过去一个月以来的数据
                     */
                    SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");
                    Date startDate = new Date();
                    try {
                        startDate = df.parse(start);
                    } catch (ParseException e) {
                        logger.error("Date Format Error. Use current date instead. ", e);
                    }
                    Calendar calendar = Calendar.getInstance();
                    calendar.setTime(startDate);
                    calendar.add(Calendar.MONTH, -1);
                    range = new TimeRangeDetail(df.format(calendar.getTime()), end);
                }
                /**
				 * TODO 
                 * modify by jiangyichao at 2014-11-10
                 *  仅处理单选
                 */
                String[] days = new String[range.getDays().length];
                for (int i = 0; i < days.length; i++) {
                    days[i] = "[" + element.getName() + "].[" + range.getDays()[i] + "]";
                }
                value = days;
                logger.debug(value.toString());
            }
            itemValues.put(item, value);
        }
        return itemValues;
    }
    
    private String parseToDate(String uniqueName) {
        String[] valueParts = StringUtils.split(uniqueName, "].[");
        /**
         * TODO 假定时间的uniqueName是[***].[yyyyMMdd]这种，以后要考虑兼容性
         */
        if (valueParts.length > 1) {
            String part = valueParts[valueParts.length - 1];
            return part.replace("]", "");
        }
        return uniqueName;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.report.service.QueryActionBuildService#
     * generateQueryContext(java.util.Map)
     */
    @Override
    public QueryContext generateQueryContext(String areaId, Map<String, String[]> contextParams) {
        
        QueryContext context = new QueryContext();
        context.setExtendAreaId(areaId);
        Map<String, Object> params = Maps.newHashMap();
        context.setParams(params);
        return context;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.ma.report.service.QueryBuildService#
     * parseToPivotTable(com.baidu.rigel.biplatform.ma.report.query.DataModel)
     */
    @Override
    public PivotTable parseToPivotTable(DataModel dataModel) throws PivotTableParseException {
        
        PivotTable table = DataModelUtils.transDataModel2PivotTable(dataModel, false, 0, false);
        // TODO Auto-generated method stub
        return table;
    }

    private ExtendArea getRealExtendArea(ReportDesignModel model, String areaId,
            Map<String, Object> contextParams) {
        
        ExtendArea targetArea = model.getExtendById(areaId);
        if (targetArea.getType() == ExtendAreaType.LITEOLAP_TABLE) {
            /**
             * 针对liteOlap表的查询
             */
            targetArea = model.getExtendById(targetArea.getReferenceAreaId());
        } 
        return targetArea;
    }
    
}