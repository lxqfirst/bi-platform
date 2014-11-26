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
package com.baidu.rigel.biplatform.ma.resource;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.baidu.rigel.biplatform.ac.model.Dimension;
import com.baidu.rigel.biplatform.ac.model.Measure;
import com.baidu.rigel.biplatform.ac.model.OlapElement;
import com.baidu.rigel.biplatform.ma.ds.service.DataSourceService;
import com.baidu.rigel.biplatform.ma.model.builder.Director;
import com.baidu.rigel.biplatform.ma.model.service.CubeBuildService;
import com.baidu.rigel.biplatform.ma.model.service.PositionType;
import com.baidu.rigel.biplatform.ma.model.service.StarModelBuildService;
import com.baidu.rigel.biplatform.ma.report.exception.CacheOperationException;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.ExtendAreaType;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.report.model.LiteOlapExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.LogicModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.query.ReportRuntimeModel;
import com.baidu.rigel.biplatform.ma.report.service.AnalysisChartBuildService;
import com.baidu.rigel.biplatform.ma.report.service.ChartBuildService;
import com.baidu.rigel.biplatform.ma.report.service.QueryBuildService;
import com.baidu.rigel.biplatform.ma.report.service.ReportModelQueryService;
import com.baidu.rigel.biplatform.ma.report.utils.ReportDesignModelUtils;
import com.baidu.rigel.biplatform.ma.resource.cache.ReportModelCacheManager;
import com.baidu.rigel.biplatform.ma.resource.utils.LiteOlapViewUtils;
import com.baidu.rigel.biplatform.ma.resource.utils.ResourceUtils;
import com.baidu.rigel.biplatform.ma.resource.view.liteolap.IndCandicateForChart;
import com.baidu.rigel.biplatform.ma.resource.view.liteolap.MetaData;
import com.baidu.rigel.biplatform.ma.resource.view.liteolap.MetaStatusData;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * CubeTable的页面交互
 * 
 * @author zhongyi
 * 
 *         2014-7-30
 */
@RestController
@RequestMapping("/silkroad/reports")
public class LiteOlapResource {
    
    /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(LiteOlapResource.class);
    
    /**
     * reportModelCacheManager
     */
    @Resource
    private ReportModelCacheManager reportModelCacheManager;
    
    /**
     * cubeBuildService
     */
    @Resource
    private CubeBuildService cubeBuildService;
    
    /**
     * starModelBuildService
     */
    @Resource
    private StarModelBuildService starModelBuildService;
    
    /**
     * queryBuildService
     */
    @Resource
    private QueryBuildService queryBuildService;
    
    /**
     * analysisChartBuildService
     */
    @Resource
    private AnalysisChartBuildService analysisChartBuildService;
    
    /**
     * 报表数据查询服务
     */
    @Resource
    private ReportModelQueryService reportModelQueryService;
    
    /**
     * chartBuildService
     */
    @Resource
    private ChartBuildService chartBuildService;
    
    /**
     * director
     */
    @Resource
    private Director director;
    
    /**
     * dsService
     */
    @Resource
    private DataSourceService dsService;
    
    /**
     * 
     * @param reportId
     * @param request
     * @return
     */
    @RequestMapping(value = "/{reportId}/runtime/extend_area/{areaId}/item", method = { RequestMethod.POST })
    public ResponseResult dragAndDrop(@PathVariable("reportId") String reportId,
            @PathVariable("areaId") String areaId,
            HttpServletRequest request) {
        
        String from = request.getParameter("from");
        String to = request.getParameter("to");
        int toPosition = Integer.valueOf(request.getParameter("toPosition"));
        String targetName = request.getParameter("uniqNameList");
        
        if (StringUtils.isEmpty(from) && StringUtils.isEmpty(to)) {
            return ResourceUtils.getCorrectResult("OK", "");
        }
        ReportDesignModel model = null;
        try {
            model = reportModelCacheManager.getReportModel(reportId);
        } catch (CacheOperationException e) {
            logger.error("There are no such model in cache. Report Id: " + reportId, e);
            return ResourceUtils.getErrorResult("没有运行时的报表实例！报表ID：" + reportId, 1);
        }
        ExtendArea sourceArea = model.getExtendById(areaId);
        if (sourceArea.getType() != ExtendAreaType.SELECTION_AREA) {
            logger.error("Drag Operation is Not supported for type of non-SELECTION_AREA !");
            return ResourceUtils.getErrorResult("Drag Operation is Not supported for type of non-SELECTION_AREA !", 1);
        }
        /**
         * 
         */
        ExtendArea parent = model.getExtendById(sourceArea.getReferenceAreaId());
        if (parent.getType() != ExtendAreaType.LITEOLAP) {
            logger.error("Drag Operation is Not supported for type of non-LITEOLAP !");
            return ResourceUtils.getErrorResult("Drag Operation is Not supported for type of non-LITEOLAP !", 1);
        }
        LiteOlapExtendArea liteOlapArea = (LiteOlapExtendArea) parent;
        LogicModel logicModel = liteOlapArea.getLogicModel();
        Item targetItem = null;
        if (StringUtils.isEmpty(from)) {
            if (liteOlapArea.getCandDims().containsKey(targetName)) {
                /**
                 * 移动候选维度
                 */
                targetItem = liteOlapArea.getCandDims().get(targetName);
            } else if (liteOlapArea.getCandInds().containsKey(targetName)) {
                /**
                 * 移动候选指标
                 */
                targetItem = liteOlapArea.getCandInds().get(targetName);
            }
        } else {
            switch (from) {
                case "ROW":
                    targetItem = logicModel.removeRow(targetName);
                    break;
                case "COLUMN":
                    targetItem = logicModel.removeColumn(targetName);
                    break;
                case "FILTER":
                    targetItem = logicModel.removeSlice(targetName);
                    break;
                default:
                    return ResourceUtils.getErrorResult("不认识的位置！From: " + from, 1);
            }
        }
        /**
         * 
         */
        OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(model.getSchema(),
                liteOlapArea.getCubeId(), targetItem.getOlapElementId());
        if (!StringUtils.hasText(to)) {
            /**
             * 根据item的类型加入到候选维度或者候选指标中
             */
            if (element instanceof Dimension) {
                liteOlapArea.getCandDims().put(element.getId(), targetItem);
            } else if (element instanceof Measure) {
                liteOlapArea.getCandInds().put(element.getId(), targetItem);
            }
        } else {
            switch (to) {
                case "ROW":
                    targetItem.setPositionType(PositionType.X);
                    logicModel.addRow(targetItem, toPosition);
                    break;
                case "COLUMN":
                    targetItem.setPositionType(PositionType.Y);
                    logicModel.addColumn(targetItem, toPosition);
                    break;
                case "FILTER":
                    targetItem.setPositionType(PositionType.S);
                    logicModel.addSlice(targetItem, toPosition);
                    break;
                default:
                    return ResourceUtils.getErrorResult("不认识的位置！To: " + to, 1);
            }
        }
        reportModelCacheManager.updateReportModelToCache(reportId, model);
        ReportRuntimeModel runTimeModel = reportModelCacheManager.getRuntimeModel(reportId);
        runTimeModel.updateDimStores(model);
        reportModelCacheManager.updateRunTimeModelToCache(reportId, runTimeModel);
        ResponseResult rs = ResourceUtils.getCorrectResult("OK", "");
        return rs;
    }
    
    /**
     * 
     * @param reportId
     * @param request
     * @return
     */
    @RequestMapping(value = "/{reportId}/runtime/extend_area/{areaId}/config", method = { RequestMethod.POST })
    public ResponseResult getConfigOfArea(@PathVariable("reportId") String reportId,
            @PathVariable("areaId") String areaId,
            HttpServletRequest request) {
        
        ReportDesignModel model = null;
        try {
            model = reportModelCacheManager.getReportModel(reportId);
        } catch (CacheOperationException e) {
            logger.error("There are no such model in cache. Report Id: " + reportId, e);
            return ResourceUtils.getErrorResult("没有运行时的报表实例！报表ID：" + reportId, 1);
        }
        ExtendArea target = model.getExtendById(areaId);
        if (target.getType() != ExtendAreaType.SELECTION_AREA) {
            logger.debug("not support for getting config of non-SELECTION area! ");
            return ResourceUtils.getCorrectResult("OK", "");
        }
        ExtendArea parent = model.getExtendById(target.getReferenceAreaId());
        if (parent.getType() != ExtendAreaType.LITEOLAP) {
            logger.error("Get Config Operation is Not supported for type of non-LITEOLAP !");
            return ResourceUtils.getErrorResult("Drag Operation is Not supported for type of non-LITEOLAP !", 1);
        }
        LiteOlapExtendArea liteOlapArea = (LiteOlapExtendArea) parent;
        MetaData metaData = LiteOlapViewUtils.parseMetaData(liteOlapArea, model.getSchema());
        MetaStatusData metaStatusData = LiteOlapViewUtils.parseMetaStatusData(liteOlapArea, model.getSchema());
        Map<String, Object> selected = LiteOlapViewUtils.parseSelectedItemMap(liteOlapArea, model.getSchema());
        /*
         * wrap the result
         */
        Map<String, Object> resultMap = Maps.newHashMap();
        resultMap.put("index4Selected", new String[]{"COLUMN", "ROW", "FILTER"});
        resultMap.put("metaData", metaData);
        resultMap.put("metaStatusData", metaStatusData);
        resultMap.put("selected", selected);
        return ResourceUtils.getCorrectResult("OK", resultMap);
    }
    
    /**
     * 获取当前图上可选的指标
     */
    @RequestMapping(value = "/{reportId}/runtime/extend_area/{areaId}/ind_for_chart", method = { RequestMethod.POST })
    public ResponseResult getIndsForChart(@PathVariable("reportId") String reportId,
            @PathVariable("areaId") String areaId,
            HttpServletRequest request) {
        
        ReportDesignModel model = null;
        try {
            model = reportModelCacheManager.getReportModel(reportId);
        } catch (CacheOperationException e) {
            logger.error("There are no such model in cache. Report Id: " + reportId, e);
            return ResourceUtils.getErrorResult("没有运行时的报表实例！报表ID：" + reportId, 1);
        }
        ExtendArea target = model.getExtendById(areaId);
        if (target.getType() != ExtendAreaType.LITEOLAP_CHART) {
            logger.debug("not support for getting config of non-SELECTION area! ");
            return ResourceUtils.getCorrectResult("OK", "");
        }
        ExtendArea parent = model.getExtendById(target.getReferenceAreaId());
        if (parent.getType() != ExtendAreaType.LITEOLAP) {
            logger.error("Get Config Operation is Not supported for type of non-LITEOLAP !");
            return ResourceUtils.getErrorResult("Drag Operation is Not supported for type of non-LITEOLAP !", 1);
        }
        LogicModel logicModel = parent.getLogicModel();
        Map<String, Object> resultMap = Maps.newHashMap();
        List<IndCandicateForChart> inds = Lists.newArrayList();
        for (Item item : logicModel.getColumns()) {
            OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(model.getSchema(),
                    item.getCubeId(), item.getOlapElementId());
            IndCandicateForChart indForChart = LiteOlapViewUtils.parseIndForChart(element);
            inds.add(indForChart);
        }
        resultMap.put("currentInds", new String[0]);
        resultMap.put("inds", inds.toArray(new IndCandicateForChart[0]));
        return ResourceUtils.getCorrectResult("OK", resultMap);
    }
    
    /**
     * 选中表上的行
     */
    @RequestMapping(value = "/{reportId}/runtime/extend_area/{areaId}/selected_row", method = { RequestMethod.POST })
    public ResponseResult selectRow(@PathVariable("reportId") String reportId,
            @PathVariable("areaId") String areaId,
            HttpServletRequest request) {
        String rowId = request.getParameter("uniqueName");
        if (!StringUtils.hasText(rowId)) {
            logger.error("Empty Row Id when Select! ");
            return ResourceUtils.getErrorResult("Empty Row Id when Select! ", 1);
        }
        ReportRuntimeModel runTimeModel = null;
        try {
            runTimeModel = reportModelCacheManager.getRuntimeModel(reportId);
        } catch (CacheOperationException e) {
            logger.error("There are no such model in cache. Report Id: " + reportId, e);
            return ResourceUtils.getErrorResult("没有运行时的报表实例！报表ID：" + reportId, 1);
        }
        /**
         * 清楚当前选中行，增加一行
         */
        runTimeModel.getSelectedRowIds().clear();
        runTimeModel.getSelectedRowIds().add(rowId);
        reportModelCacheManager.updateRunTimeModelToCache(reportId, runTimeModel);
        Map<String, Object> resultMap = Maps.newHashMap();
        resultMap.put("selected", true);
        return ResourceUtils.getCorrectResult("OK", resultMap);
    }
}