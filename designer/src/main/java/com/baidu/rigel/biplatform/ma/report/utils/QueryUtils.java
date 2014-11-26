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
package com.baidu.rigel.biplatform.ma.report.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ac.minicube.MiniCube;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeDimension;
import com.baidu.rigel.biplatform.ac.minicube.StandardDimension;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.Dimension;
import com.baidu.rigel.biplatform.ac.model.Level;
import com.baidu.rigel.biplatform.ac.model.Measure;
import com.baidu.rigel.biplatform.ac.model.OlapElement;
import com.baidu.rigel.biplatform.ac.model.Schema;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.model.AxisMeta;
import com.baidu.rigel.biplatform.ac.query.model.AxisMeta.AxisType;
import com.baidu.rigel.biplatform.ac.query.model.ConfigQuestionModel;
import com.baidu.rigel.biplatform.ac.query.model.DimensionCondition;
import com.baidu.rigel.biplatform.ac.query.model.MetaCondition;
import com.baidu.rigel.biplatform.ac.query.model.QueryData;
import com.baidu.rigel.biplatform.ac.query.model.QuestionModel;
import com.baidu.rigel.biplatform.ac.util.DeepcopyUtils;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.service.PositionType;
import com.baidu.rigel.biplatform.ma.model.utils.DBUrlGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.exception.QueryModelBuildException;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.ExtendAreaType;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.report.model.LiteOlapExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.LogicModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.query.QueryAction;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;

/**
 * 
 * 
 * 查询工具类，负责将QueryAction转化城QuestionModel
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryUtils {
    
    /**
     * 将查询动作转化成问题模型
     * @param dsDefine 
     * 
     * @param queryAction
     *            查询动作
     * @return 问题模型
     * @throws QueryModelBuildException
     *             构建失败异常
     */
    public static QuestionModel convert2QuestionModel(DataSourceDefine dsDefine, ReportDesignModel reportModel,
        QueryAction queryAction) throws QueryModelBuildException {
        if (queryAction == null) {
            throw new QueryModelBuildException("query action is null");
        }
        ConfigQuestionModel questionModel = new ConfigQuestionModel();
        String areaId = queryAction.getExtendAreaId();
        if (StringUtils.isEmpty(areaId)) {
            throw new QueryModelBuildException("area id is empty");
        }
        ExtendArea area = reportModel.getExtendById(areaId);
        if (area == null) {
            throw new QueryModelBuildException("can not get area with id : " + areaId);
        }
        Cube cube = getCubeWithExtendArea(reportModel, area);
        if (cube == null) {
            throw new QueryModelBuildException("can not get cube define in area : " + areaId);
        }
        // 设置轴信息
        questionModel.setAxisMetas(buildAxisMeta(reportModel.getSchema(), area, queryAction));
        // 构建查询信息
        questionModel.setQueryConditions(buildQueryConditions(reportModel, area, queryAction));
        questionModel.setCubeId(area.getCubeId());
        ((MiniCube) cube).setProductLine(dsDefine.getProductLine());
        // TODO 动态更新cube 针对查询过程中动态添加的属性 需要仔细考虑此处逻辑
        Set<Item> tmp = Sets.newHashSet();
        tmp.addAll(queryAction.getSlices().keySet());
        tmp.addAll(queryAction.getRows().keySet());
        updateLogicCubeWithSlices(cube, tmp,
                reportModel.getSchema().getCubes().get(area.getCubeId()));
        questionModel.setCube(cube);
        questionModel.setDataSourceInfo(buidDataSourceInfo(dsDefine));
        return questionModel;
    }
    
    /**
     * 
     * @param cube
     * @param keySet
     * @param defineCube
     */
    private static void updateLogicCubeWithSlices(final Cube cube, Set<Item> keySet, final Cube defineCube) {
        if (keySet == null || keySet.isEmpty()) {
            return;
        }
        
        keySet.forEach(item -> {
            Dimension dim = defineCube.getDimensions().get(item.getOlapElementId());
            if (dim != null) {
                Dimension tmp = DeepcopyUtils.deepCopy(dim);
                tmp.getLevels().clear();
                dim.getLevels().values().forEach(level -> {
                    tmp.getLevels().put(level.getName(), level);
                });
                cube.getDimensions().put(tmp.getName(), tmp);
            }
        });
    }

    /**
     * 
     * @param dsDefine
     * @return DataSourceInfo
     */
    private static DataSourceInfo buidDataSourceInfo(DataSourceDefine dsDefine) {
        SqlDataSourceInfo ds = new SqlDataSourceInfo(dsDefine.getName());
        ds.setDBProxy(true);
        try {
            ds.setPassword(dsDefine.getDbPwd());
        } catch (Exception e) {
            e.printStackTrace();
        }
        ds.setUsername(dsDefine.getDbUser());
        ds.setProductLine(dsDefine.getProductLine());
        ds.setInstanceName(dsDefine.getDbInstance());
        List<String> hosts = Lists.newArrayList();
        hosts.add(dsDefine.getHostAndPort());
        ds.setHosts(hosts);
        List<String> jdbcUrls = Lists.newArrayList();
        try {
            jdbcUrls.add(DBUrlGeneratorUtils.getConnUrl(dsDefine));
        } catch (Exception e) {
            e.printStackTrace();
        }
        ds.setJdbcUrls(jdbcUrls);
        return ds;
    }

    /**
     * 构建查询条件信息
     * 
     * @param reportModel
     * @param area
     * @param queryAction
     * @return
     * @throws QueryModelBuildException
     */
    private static Map<String, MetaCondition> buildQueryConditions(ReportDesignModel reportModel,
        ExtendArea area, QueryAction queryAction) throws QueryModelBuildException {
        Map<String, MetaCondition> rs = new HashMap<String, MetaCondition>();
        Map<Item, Object> items = new HashMap<Item, Object>();
        items.putAll(queryAction.getColumns());
        items.putAll(queryAction.getRows());
        items.putAll(queryAction.getSlices());
        for (Map.Entry<Item, Object> entry : items.entrySet()) {
            Item item = entry.getKey();
            OlapElement olapElement = ReportDesignModelUtils.getDimOrIndDefineWithId(reportModel.getSchema(),
                    area.getCubeId(), item.getOlapElementId());
            if (olapElement == null) {
                continue;
            }
            
            if (olapElement instanceof Dimension) {
                DimensionCondition condition = new DimensionCondition(olapElement.getName());
                Object valueObj = entry.getValue();
                if (valueObj != null) {
                    List<String> values = Lists.newArrayList();
                    if (valueObj instanceof String[]) {
                        values = Lists.newArrayList();
                        CollectionUtils.addAll(values, (String[]) valueObj);
                    } else {
                        values.add(valueObj.toString());
                    }
                   
                    List<QueryData> datas = Lists.newArrayList();
                    // TODO QeuryData value如何处理
                    for (String value : values) {
                        if (!queryAction.isChartQuery() && value.toLowerCase().contains("all")) {
                            datas.clear();
                            break;
                        }
                        QueryData data = new QueryData(value);
                        Object drillValue = queryAction.getDrillDimValues().get(item);
                        if (drillValue != null && valueObj.equals(drillValue)) {
                            data.setExpand(true);
                        } else if (item.getPositionType() == PositionType.X && queryAction.isChartQuery()) {
                            data.setExpand(true);
                            data.setShow(false);
                        }
                        datas.add(data);
                    }
                    condition.setQueryDataNodes(datas);
                } else {
                    List<QueryData> datas = new ArrayList<QueryData>();
                    Dimension dim = (Dimension) olapElement;
                    if (item.getPositionType() == PositionType.X && queryAction.isChartQuery()) {
                        QueryData data = new QueryData(dim.getAllMember().getUniqueName());
                        data.setExpand(true);
                        data.setShow(false);
                        datas.add(data);
                    }
                    condition.setQueryDataNodes(datas);
                }
                rs.put(condition.getMetaName(), condition);
                
            }
        }
        return rs;
    }
    
    /**
     * 通过查询
     * 
     * @param reportModel
     * @param area
     * @param queryAction
     * @return Map<AxisType, AxisMeta>
     */
    private static Map<AxisType, AxisMeta> buildAxisMeta(Schema schema,
        ExtendArea area, QueryAction queryAction) throws QueryModelBuildException {
        Map<Item, Object> columns = queryAction.getColumns();
        Map<AxisType, AxisMeta> rs = new HashMap<AxisType, AxisMeta>();
        AxisMeta columnMeta = buildAxisMeta(schema, area, columns, AxisType.COLUMN);
        rs.put(columnMeta.getAxisType(), columnMeta);
        
        Map<Item, Object> rows = queryAction.getRows();
        AxisMeta rowMeta = buildAxisMeta(schema, area, rows, AxisType.ROW);
        rs.put(rowMeta.getAxisType(), rowMeta);
        
        AxisMeta filterMeta = buildAxisMeta(schema, area, queryAction.getSlices(),
                AxisType.FILTER);
        rs.put(filterMeta.getAxisType(), filterMeta);
        return rs;
    }
    
    /**
     * 
     * @param schema
     * @param area
     * @param items
     * @param axisType
     * @return
     * @throws QueryModelBuildException
     */
    private static AxisMeta buildAxisMeta(Schema schema, ExtendArea area,
        Map<Item, Object> items, AxisType axisType) throws QueryModelBuildException {
        AxisMeta meta = new AxisMeta(axisType);
        for (Map.Entry<Item, Object> entry : items.entrySet()) {
            Item item = entry.getKey();
            OlapElement olapElement = ReportDesignModelUtils.getDimOrIndDefineWithId(schema,
                    area.getCubeId(), item.getOlapElementId());
            if (olapElement == null) {
                continue;
            }
            if (olapElement instanceof Dimension) {
                meta.getCrossjoinDims().add(olapElement.getName());
            } else {
                meta.getQueryMeasures().add(olapElement.getName());
            }
        }
        return meta;
    }
    
    /**
     * 
     * @param reportModel
     * @param area
     * @return
     * @throws QueryModelBuildException
     */
    private static Cube getCubeFromReportModel(ReportDesignModel reportModel, ExtendArea area)
            throws QueryModelBuildException {
        String cubeId = area.getCubeId();
        if (StringUtils.isEmpty(cubeId)) {
            throw new QueryModelBuildException("cube id is empty");
        }
        Schema schema = reportModel.getSchema();
        if (schema == null) {
            throw new QueryModelBuildException("schema is not define");
        }
        Map<String, ? extends Cube> cubes = schema.getCubes();
        if (cubes == null) {
            throw new QueryModelBuildException("can not get cube define from schema : " + schema.getId());
        }
        Cube oriCube = cubes.get(area.getCubeId());
        if (oriCube == null) {
            throw new QueryModelBuildException("can not get cube define from schema : " + area.getCubeId());
        }
        return oriCube;
    }
    
    /**
     * 获取扩展区域包含的立方体定义
     * 
     * @param reportModel
     *            报表模型
     * @param area
     *            扩展区域
     * @return 立方体定义
     * @throws QueryModelBuildException
     */
    public static Cube getCubeWithExtendArea(ReportDesignModel reportModel, ExtendArea area)
            throws QueryModelBuildException {
        Cube oriCube = getCubeFromReportModel(reportModel, area);
        Map<String, List<Dimension>> filterDims = collectFilterDim(reportModel);
        MiniCube cube = new MiniCube(area.getCubeId());
        LogicModel logicModel = area.getLogicModel();
        if (area.getType() == ExtendAreaType.SELECTION_AREA
                || area.getType() == ExtendAreaType.LITEOLAP_CHART 
                || area.getType() == ExtendAreaType.LITEOLAP_TABLE) {
            LiteOlapExtendArea liteOlapArea = (LiteOlapExtendArea) reportModel.getExtendById(area.getReferenceAreaId());
            logicModel = liteOlapArea.getLogicModel();
        }
        if (logicModel == null) {
            throw new QueryModelBuildException("logic model is empty");
        }
        Item[] items = logicModel.getItems();
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        Map<String, Measure> measures = new HashMap<String, Measure>();
        
        for (Item item : items) {
            OlapElement olapElement = oriCube.getDimensions().get(item.getOlapElementId());
            if (olapElement == null) { // 维度不存在或者可能是指标信息
                olapElement = oriCube.getMeasures().get(item.getOlapElementId());
                if (olapElement != null) {
                    Measure measure = (Measure) olapElement;
                    measures.put(measure.getName(), measure);
                } 
            } else {
                MiniCubeDimension dim = (MiniCubeDimension) DeepcopyUtils.deepCopy(olapElement);
                dim.setLevels(Maps.newLinkedHashMap());;
                ((Dimension) olapElement).getLevels().values().forEach(level ->{
                    dim.getLevels().put(level.getName(), level);
                });
                dimensions.put(dim.getName(), dim);
            }
        }
        if (area.getType() == ExtendAreaType.LITEOLAP) {
            /**
             * TODO 把liteOlap中候选的维度和指标加入到items里面
             */
            Map<String, Item> candDims = ((LiteOlapExtendArea) area).getCandDims();
            for (String elementId : candDims.keySet()) {
                OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(reportModel.getSchema(),
                        area.getCubeId(), elementId);
                MiniCubeDimension dim = (MiniCubeDimension) DeepcopyUtils.deepCopy(element);
                dim.setLevels(Maps.newLinkedHashMap());
                ((Dimension) element).getLevels().values().forEach(level ->{
                    dim.getLevels().put(level.getName(), level);
                });
                dimensions.put(element.getName(), (Dimension) element);
            }
            Map<String, Item> candInds = ((LiteOlapExtendArea) area).getCandInds();
            for (String elementId : candInds.keySet()) {
                OlapElement element = ReportDesignModelUtils.getDimOrIndDefineWithId(reportModel.getSchema(),
                        area.getCubeId(), elementId);
                measures.put(element.getName(), (Measure) element);
            }
        }
        if (filterDims != null && filterDims.get(area.getCubeId()) != null) {
        		List<Dimension> dims = filterDims.get(area.getCubeId());
        		for(Dimension dim : dims) {
        			dimensions.put(dim.getName(), dim);
        		}
        }
        cube.setDimensions(dimensions);
        cube.setMeasures(measures);
        cube.setSource(((MiniCube) oriCube).getSource());
        cube.setPrimaryKey(((MiniCube) oriCube).getPrimaryKey());
        cube.setId(oriCube.getId() + "_" + area.getId());
        return cube;
    }

    /**
     * 
     * @param dim -- Dimension
     * @return Dimension
     */
    public static Dimension convertDim2Dim(Dimension dim) {
        StandardDimension rs = new StandardDimension(dim.getName());
        rs.setCaption(dim.getCaption());
        rs.setDescription(dim.getDescription());
        rs.setTableName(dim.getTableName());
        rs.setFacttableCaption(dim.getFacttableCaption());
        rs.setFacttableColumn(dim.getFacttableColumn());
        rs.setPrimaryKey(dim.getPrimaryKey());
        rs.setType(dim.getType());
        rs.setVisible(true);
        rs.setId(dim.getId());
        rs.setName(dim.getName());
        LinkedHashMap<String, Level> levels = Maps.newLinkedHashMap();
        dim.getLevels().values().forEach(level -> {
            level.setDimension(dim);
            levels.put(level.getName(), level);
        });
        rs.setLevels(levels);
        return rs;
    }

    /**
     * 
     * @param model
     * @return Map<String, List<Dimension>>
     */
    private static Map<String, List<Dimension>> collectFilterDim(ReportDesignModel model) {
		Map<String, List<Dimension>> rs = Maps.newHashMap();
		for (ExtendArea area : model.getExtendAreaList()) {
			if (area.getType() == ExtendAreaType.TIME_COMP) {
				Cube cube = model.getSchema().getCubes().get(area.getCubeId());
				if (rs.get(area.getCubeId()) == null) {
					List<Dimension> dims = Lists.newArrayList();
					area.getAllItems().values().forEach(key -> {
						dims.add(cube.getDimensions().get(key.getId()));
					});
					rs.put(area.getCubeId(), dims);
				}
	    		} 
		}
		return rs;
	}
    

}
