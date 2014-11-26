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
/**
 * 
 */
package com.baidu.rigel.biplatform.ma.rt.query.request.trans;

import java.util.LinkedHashMap;

import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.rt.query.model.OrderType;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryRequest;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy;
import com.google.common.collect.Maps;

/**
 *
 * @author david.wang
 * @version 1.0.0.1
 */
class TableQueryTransHandler extends QueryRequestTransHandler {
    
    /**
     * logger
     */
//    private Logger logger = LoggerFactory.getLogger(TableQueryTransHandler.class);
    
    /**
     * 
     * QueryRequestBaseTransHandler
     */
    protected TableQueryTransHandler() {
    }
    
    /* (non-Javadoc)
     * @see com.baidu.rigel.biplatform.ma.runtime.QueryRequestTransHandler#transRequest(com.baidu.rigel.biplatform.ma.runtime.QueryRequest)
     */
    @Override
    QueryAction transRequest(QueryRequest request) {
        QueryAction action = new QueryAction();
        // 数据源
        DataSourceInfo dataSource = request.getDataSourceInfo();
        action.setDataSource(dataSource);
        // 立方体
        Cube cube  = request.getContext().getCubeDefine();
        action.setCube(cube);
        // 纵轴
        LinkedHashMap<Item, Object> columns = genColumns(request);
        action.setColumns(columns);
        // 横轴
        LinkedHashMap<Item, Object> rows = genRows(request);;
        action.setRows(rows);
        // 过滤轴
        LinkedHashMap<Item, Object> slices = genSlice(request);
        action.setSlices(slices);
        // TODO 排序轴 排序支持
        LinkedHashMap<Item, OrderType> orders = Maps.newLinkedHashMap();
        action.setOrders(orders);
        
        return action;
    }
    
    /**
     * 获取查询动作横轴定义
     * @param request 查询请求
     * @return 查询动作横轴定义
     */
    private LinkedHashMap<Item, Object> genRows(QueryRequest request) {
//        ReportDesignModel model = request.getReportModel();
//        ExtendArea area = model.getExtendById(request.getAreaId());
//        // 由于表结构是静态的，因此逻辑模型中轴的定义就是静态表的查询轴定义
//        Item[] items = area.getLogicModel().getRows();
//        return generateItemValues(request, model, area, items);
    		return request.getContext().getX();
    }

//    /**
//     * 构建查询行或者列轴，并设置默认值值
//     * @param request 查询请求
//     * @param model 报表定义模型
//     * @param area 查询区域
//     * @param rowOrColDef  行或者列的元定义
//     * @return LinkedHashMap<Item, Object>  查询条目以及对应的默认值
//     * 
//     */
//    private LinkedHashMap<Item, Object> generateItemValues(QueryRequest request, 
//            ReportDesignModel model, ExtendArea area, Item[] rowOrColDef) {
//        LinkedHashMap<Item, Object> itemValues = Maps.newLinkedHashMap();
//        Map<String, String[]> values = request.getConditions();
//        for (Item item : rowOrColDef) {
//            String elementId = item.getOlapElementId();
//            if (StringUtils.isEmpty(elementId)) {
//                continue;
//            }
//            Object value =  values.containsKey(elementId) 
//                    ? values.get(elementId) : item.getParams().get(elementId);
//            OlapElement element = ItemUtils.getOlapElementByItem(item, model.getSchema(), area.getCubeId());
//            if (value != null && element instanceof TimeDimension) {
//                value = genTimeDimMemberValues(value, element);
//            }
//            itemValues.put(item, value);
//        }
//        return itemValues;
//    }

    /**
     * 
     * 解析时间维度值并生成正确的时间维度成员表达式
     * @param value 查询请求中的时间范围
     * @param element 时间维度对应的原定义
     * @return  String[] 当前时间维度所在粒度对应的时间维度成员值
     * 
     */
//    private String[] genTimeDimMemberValues(final Object value,  final OlapElement element) {
//        String start;
//        String end;
//        try {
//            JSONObject json = new JSONObject(String.valueOf(value));
//            /**
//             * TODO 考虑月/周/年等
//             */
//            start = json.getString("start").replace("-", "");
//            end = json.getString("end").replace("-", "");
//        } catch (JSONException e) {
//            logger.warn(
//                    "Time Condition not Correct. Maybe from row."
//                    + " Try to use it as UniqueName. Time: " + value, e);
//            String[] realValueList = exceptionCatched(value);
//            start = realValueList[0];
//            end = realValueList[1];
//        }
//        TimeRangeDetail range = genTimeRangeDetail(start, end);
//        String[] days = new String[range.getDays().length];
//        for (int i = 0; i < days.length; i++) {
//            days[i] = "[" + element.getName() + "].[" + range.getDays()[i] + "]";
//        }
//        return days;
//    }

//    /**
//     * 
//     * 依据起始时间获取时间维度范围明细定义信息
//     * @param start 起始时间
//     * @param end 结束时间
//     * @return TimeRangeDetail 时间维度范围明细信息
//     * 
//     */
//    private TimeRangeDetail genTimeRangeDetail(final String start, final String end) {
//        TimeRangeDetail range = new TimeRangeDetail(start, end);
//        if (start.equals(end)) {
//            /**
//             * 如果是时间区域，并且时间参数中起始和结束相同，把时间扩展为start过去一个月以来的数据
//             */
//            SimpleDateFormat df = new SimpleDateFormat("yyyyMMdd");
//            Date startDate = new Date();
//            try {
//                startDate = df.parse(start);
//            } catch (ParseException e) {
//                logger.error("Date Format Error. Use current date instead. ", e);
//            }
//            Calendar calendar = Calendar.getInstance();
//            calendar.setTime(startDate);
//            calendar.add(Calendar.MONTH, -1);
//            range = new TimeRangeDetail(df.format(calendar.getTime()), end);
//        }
//        return range;
//    }
//
//    /**
//     * 异常处理 ：处理由于解析时间维度请求json的异常处理
//     * @param value 请求时间维度默认值信息
//     * @return  String[] 时间范围定义表达式
//     */
//    private String[] exceptionCatched(Object value) {
//        String[] realValues = new String[2];
//        if (value instanceof String[]) {
//            String[] dates = (String[]) value;
//            /**
//             * TODO 如果有多选时间，把第一个时间和最后一个时间作为start和end，不支持间断时间
//             * 以后要考虑重构，支持间断时间
//             */
//            realValues[0] = parseToDate(dates[0]);
//            realValues[1] = parseToDate(dates[dates.length - 1]);
//        } else  if (value instanceof String) {
//            realValues[0] = parseToDate(String.valueOf(value));
//            realValues[1] = realValues[0];
//        } else {
//            throw new IllegalArgumentException("时间维度参数信息非法，请检查输入 ： " + value);
//        }
//        return realValues;
//    }

    /**
     * 依据查询请求生成查询轴的定义
     * @param request 查询请求
     * @return LinkedHashMap<Item, Object>
     */
    private LinkedHashMap<Item, Object> genColumns(QueryRequest request) {
//        ReportDesignModel model = request.getReportModel();
        return request.getContext().getY();
//        return generateItemValues(request, model, area, items);
    }

    /**
     * 依据查询请求生成查询列的定义
     * @param request 查询请求
     * @return LinkedHashMap<Item, Object>  过滤轴定义以及默认值
     */
    private LinkedHashMap<Item, Object> genSlice(QueryRequest request) {
    		return request.getContext().getS();
//        LinkedHashMap<Item, Object> slices = Maps.newLinkedHashMap();
//        Map<String, String[]> conditions = request.getConditions();
//        String areaId = request.getAreaId();
//        SchemaManageServiceHelper helper = new SchemaManageServiceHelper(request.getReportModel());
//        LogicModel logicModel = helper.queryLogicModel( areaId);
//        Cube defineCube = helper.getCubeDefine(areaId);
//        conditions.keySet().parallelStream().forEach(key -> {
//            OlapElement element = OlapElementQueryUtils.queryElementById(defineCube, key);
//            if (element != null && !logicModel.containsOlapElement(element.getId())) {
//                Item item = new Item();
//                item.setAreaId(areaId);
//                item.setId(element.getId());
//                item.setOlapElementId(element.getId());
//                item.setPositionType(PositionType.S);
//                slices.put(item, conditions.get(key));
//            }
//        });
//        return slices;
    }

    /*
     *  (non-Javadoc)
     * @see com.baidu.rigel.biplatform.ma.runtime.QueryRequestTransHandler#isSupportedQueryStrategy(com.baidu.rigel.biplatform.ma.runtime.QueryStrategy)
     */
    @Override
    boolean isSupportedQueryStrategy(QueryStrategy queryStrategy) {
        return QueryStrategy.TABLE_QUERY == queryStrategy;
    }
    
//    /**
//     * 将时间维度的uniqueName解析为正确的时间表达式
//     * @param uniqueName 时间维度 uniqueName
//     * @return String 时间表达式，默认yyyyMMdd格式，如：20141103
//     */
//    private String parseToDate(String uniqueName) {
//        String[] valueParts = StringUtils.split(uniqueName, "].[");
//        /**
//         * TODO 假定时间的uniqueName是[***].[yyyyMMdd]这种，以后要考虑兼容性
//         */
//        if (valueParts.length > 1) {
//            String part = valueParts[valueParts.length - 1];
//            return part.replace("]", "");
//        }
//        return uniqueName;
//    }
    
}
