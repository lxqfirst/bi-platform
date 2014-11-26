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
package com.baidu.rigel.biplatform.tesseract.qsservice.query.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ac.exception.MiniCubeQueryException;
import com.baidu.rigel.biplatform.ac.minicube.CallbackLevel;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMeasure;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMember;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.Dimension;
import com.baidu.rigel.biplatform.ac.model.LevelType;
import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.model.AxisMeta;
import com.baidu.rigel.biplatform.ac.query.model.AxisMeta.AxisType;
import com.baidu.rigel.biplatform.ac.query.model.ConfigQuestionModel;
import com.baidu.rigel.biplatform.ac.query.model.DimensionCondition;
import com.baidu.rigel.biplatform.ac.query.model.MeasureCondition;
import com.baidu.rigel.biplatform.ac.query.model.MetaCondition;
import com.baidu.rigel.biplatform.ac.query.model.QueryData;
import com.baidu.rigel.biplatform.ac.query.model.QuestionModel;
import com.baidu.rigel.biplatform.ac.util.DeepcopyUtils;
import com.baidu.rigel.biplatform.ac.util.MetaNameUtil;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourcePoolService;
import com.baidu.rigel.biplatform.tesseract.exception.MetaException;
import com.baidu.rigel.biplatform.tesseract.exception.OverflowQueryConditionException;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexAndSearchException;
import com.baidu.rigel.biplatform.tesseract.isservice.search.service.SearchService;
import com.baidu.rigel.biplatform.tesseract.meta.MetaDataService;
import com.baidu.rigel.biplatform.tesseract.model.MemberNodeTree;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryContextSplitService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryContextSplitService.QueryContextSplitStrategy;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryRequestBuilder;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryContext;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryContextSplitResult;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest;
import com.baidu.rigel.biplatform.tesseract.resultset.TesseractResultSet;
import com.baidu.rigel.biplatform.tesseract.util.DataModelBuilder;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

/**
 * 查询接口实现
 * 
 * @author xiaoming.chen
 *
 */
@Service
public class QueryServiceImpl implements QueryService {

    /**
     * Logger
     */
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    /**
     * searchService
     */
    @Resource
    private SearchService searchService;

    /**
     * metaDataService
     */
    @Resource
    private MetaDataService metaDataService;

    /**
     * dataSourcePoolService
     */
    @Resource
    private DataSourcePoolService dataSourcePoolService;

    /**
     * queryContextSplitService
     */
    @Resource
    private QueryContextSplitService queryContextSplitService;

    @Override
    public DataModel query(QuestionModel questionModel, QueryContext queryContext,
            QueryContextSplitStrategy preSplitStrategy) throws MiniCubeQueryException {
        long current = System.currentTimeMillis();
        if (questionModel == null) {
            throw new IllegalArgumentException("questionModel is null");
        }
        DataSourceInfo dataSourceInfo = null;
        Cube cube = null;
        // 如果是
        if (questionModel instanceof ConfigQuestionModel) {
            ConfigQuestionModel configQuestionModel = (ConfigQuestionModel) questionModel;
            dataSourceInfo = configQuestionModel.getDataSourceInfo();
            cube = configQuestionModel.getCube();
            // 如果是配置端查询的话，默认不使用cache
//            questionModel.setUseIndex(false);
        }
        if (cube == null) {
            cube = metaDataService.getCube(questionModel.getCubeId());
        }
        if (dataSourceInfo == null) {
            dataSourceInfo = dataSourcePoolService.getDataSourceInfo(questionModel.getDataSourceInfoKey());
        }
        logger.info("cost :" + (System.currentTimeMillis() - current) + " to get datasource and other data");
        current = System.currentTimeMillis();
        try {
            queryContext =
                    buildQueryContext(questionModel, dataSourceInfo, cube, queryContext,
                            questionModel.getRequestParams());
        } catch (MetaException e1) {
            e1.printStackTrace();
            throw new MiniCubeQueryException(e1);
        }
        logger.info("cost :" + (System.currentTimeMillis() - current) + " to build query context.");
        current = System.currentTimeMillis();
        // 条件笛卡尔积，计算查询中条件数和根据汇总条件填充汇总条件
        int conditionDescartes = stateQueryContextConditionCount(queryContext, questionModel.isNeedSummary());
        logger.info("query condition descarte:" + conditionDescartes);
        logger.debug("question model:" + questionModel);
        if (questionModel.getQueryConditionLimit().isWarningAtOverFlow()
                && conditionDescartes > questionModel.getQueryConditionLimit().getWarnningConditionSize()) {
            StringBuilder sb = new StringBuilder();
            sb.append("condition descartes :").append(conditionDescartes).append(" over :")
                    .append(questionModel.getQueryConditionLimit()).append("");
            logger.error(sb.toString());
            throw new OverflowQueryConditionException(sb.toString());
        }
        // 调用拆解自动进行拆解
        QueryContextSplitResult splitResult = queryContextSplitService.split(cube, queryContext, preSplitStrategy);

        // 无法拆分或者 拆分出的结果为空，说明直接处理本地就行
        if (splitResult != null && CollectionUtils.isNotEmpty(splitResult.getSplitQueryContexts())
                && splitResult.getSplitQueryContexts().size() > 1) {
            // 说明已经拆解出子问题了
            if (splitResult.getSplitQueryContexts().size() > 1) {
                // for (QueryContext childQueryContext : splitResult.getSplitQueryContexts()) {
                // // TODO 调用Tesseract节点集群的查询问题模型接口
                // // 这里会返回一堆的DataModel，每个QueryContext对应一个DataModel
                // }
                // TODO 需要将查询出来的结果集按照拆分策略进行合并，合并成最终的一个整体Datamodel

                return null;
            } else {
                return executeQuery(questionModel, dataSourceInfo, cube, splitResult.getSplitQueryContexts().get(0));
            }
        } else {
            return executeQuery(questionModel, dataSourceInfo, cube, queryContext);
        }

    }

    private DataModel executeQuery(QuestionModel questionModel, DataSourceInfo dataSourceInfo, Cube cube,
            QueryContext queryContext) throws MiniCubeQueryException {
        long current = System.currentTimeMillis();
        QueryRequest queryRequest =
                QueryRequestBuilder.buildQueryRequest(questionModel, dataSourceInfo, cube, queryContext);
        logger.info("queryContext:" + queryContext + " queryRequest:" + queryRequest);

        if (statDimensionNode(queryContext.getRowMemberTrees(), false, false) == 0
                || (statDimensionNode(queryContext.getColumnMemberTrees(), false, false) == 0 && CollectionUtils
                        .isEmpty(queryContext.getQueryMeasures()))) {
            return new DataModelBuilder(null, queryContext).build();
        }
        logger.info("cost :" + (System.currentTimeMillis() - current) + " to build query request.");
        current = System.currentTimeMillis();
        DataModel result = null;
        try {
            TesseractResultSet resultSet = searchService.query(queryRequest);
            result = new DataModelBuilder(resultSet, queryContext).build();
        } catch (IndexAndSearchException e) {
            logger.error("query occur when search queryRequest：" + queryContext, e);
            throw new MiniCubeQueryException(e);
        }
        logger.info("cost :" + (System.currentTimeMillis() - current) + " to execute query.");
        return result;
    }

    private int stateQueryContextConditionCount(QueryContext context, boolean needSummary) {
        if (context == null) {
            throw new IllegalArgumentException("querycontext is null.");
        }
        // 统计行上的总条件数
        int rowConditionCount = statDimensionNode(context.getRowMemberTrees(), needSummary, true);
        // 列上的维度叶子数
        int columnConditionCount = statDimensionNode(context.getColumnMemberTrees(), needSummary, false);

        int filterConditionCount = 1;
        if (MapUtils.isNotEmpty(context.getFilterMemberValues())) {
            for (Set<String> nodeIds : context.getFilterMemberValues().values()) {
                filterConditionCount *= nodeIds.size();
            }
        }

        return rowConditionCount * columnConditionCount * filterConditionCount;
    }

    /**
     * 统计维值信息，根据是否需要查询汇总节点，补全汇总节点查询条件
     * 
     * @param treeNodes
     * @param needSummary
     * @return
     */
    private int statDimensionNode(List<MemberNodeTree> treeNodes, boolean needSummary, boolean isRow) {
        int rowConditionCount = 0;
        if (CollectionUtils.isNotEmpty(treeNodes)) {
            for (MemberNodeTree nodeTree : treeNodes) {
                int dimensionLeafIdCount = 0;
                // 如果根节点的name不为空，那么说明根节点是汇总节点，只需要获取根节点就可以
                if (StringUtils.isBlank(nodeTree.getName()) || MetaNameUtil.isAllMemberName(nodeTree.getName())) {
                    // 统计节点下孩子节点对应的叶子数，如果需要展现汇总节点的话，那么还需要将子节点的叶子节点合并到一起构造汇总节点的查询条件
                    for (MemberNodeTree child : nodeTree.getChildren()) {
                        // 暂时只支持在行上汇总，列上汇总有点怪怪的。。需要再开启
                        if (isRow && needSummary) {
                            nodeTree.setName(MiniCubeMember.SUMMARY_NODE_NAME);
                            nodeTree.setCaption(MiniCubeMember.SUMMARY_NODE_CAPTION);
                            nodeTree.setQuerySource(child.getQuerySource());
                            nodeTree.getLeafIds().addAll(child.getLeafIds());
                        }
                        if (nodeTree.getLeafIds().size() == 1
                                && MetaNameUtil.isAllMemberName(nodeTree.getLeafIds().iterator().next())) {
                            continue;
                        } else {
                            dimensionLeafIdCount += child.getLeafIds().size();
                        }
                    }
                } else {
                    dimensionLeafIdCount = nodeTree.getLeafIds().size();
                }
                if (rowConditionCount == 0) {
                    rowConditionCount = dimensionLeafIdCount;
                }else{
                    // 需要保证dimensionLeafIdCount不能为0
                    rowConditionCount *= (dimensionLeafIdCount == 0 ? 1 : dimensionLeafIdCount);
                }
            }
        }
        return rowConditionCount;
    }

    /**
     * 构建查询上下文
     * 
     * @param questionModel 问题模型
     * @param dsInfo 数据源信息
     * @param cube cube模型
     * @param queryContext 查询上下文
     * @return 根据问题模型构建的查询上下文
     * @throws MiniCubeQueryException 查询维值异常
     * @throws MetaException
     */
    private QueryContext buildQueryContext(QuestionModel questionModel, DataSourceInfo dsInfo, Cube cube,
            QueryContext queryContext, Map<String, String> params) throws MiniCubeQueryException, MetaException {
        if (queryContext == null) {
            queryContext = new QueryContext();
            QuestionModel cloneQuestionModel = DeepcopyUtils.deepCopy(questionModel);

            AxisMeta axisMeta = null;
            AxisType axisType = AxisType.COLUMN;
            while (axisType != null && (axisMeta = cloneQuestionModel.getAxisMetas().get(axisType)) != null) {
                if (CollectionUtils.isNotEmpty(axisMeta.getCrossjoinDims())) {
                    int i = 0;
                    for (String dimName : axisMeta.getCrossjoinDims()) {
                        DimensionCondition dimCondition =
                                (DimensionCondition) cloneQuestionModel.getQueryConditions().remove(dimName);
                        if (dimCondition == null) {
                            dimCondition = new DimensionCondition(dimName);
                        }
                        queryContext.addMemberNodeTreeByAxisType(axisType,
                                buildQueryMemberTree(dsInfo, cube, dimCondition, i == 0, params));
                        i++;
                    }
                }
                if (CollectionUtils.isNotEmpty(axisMeta.getQueryMeasures())) {
                    for (String measureName : axisMeta.getQueryMeasures()) {
                        if (cube.getMeasures().containsKey(measureName)) {
                            queryContext.getQueryMeasures().add((MiniCubeMeasure) cube.getMeasures().get(measureName));
                        }
                        // 需要判断，如果cube里面不包含的话，那么这个名称可能是个计算公式，需要进行构造一个虚拟的名称扔进去
                    }
                }
                if (axisType.equals(AxisType.ROW)) {
                    axisType = null;
                } else {
                    axisType = AxisType.ROW;
                }
            }
            if (!cloneQuestionModel.getQueryConditions().isEmpty()) {
                for (MetaCondition condition : cloneQuestionModel.getQueryConditions().values()) {
                    if (condition == null) {
                        logger.warn("meta condition is null,skip.");
                        continue;
                    }
                    if (condition instanceof DimensionCondition) {
                        DimensionCondition dimCondition = (DimensionCondition) condition;
                        Map<String, Set<String>> filterCondition = buildFilterCondition(dsInfo, cube, dimCondition, params);
                        if (MapUtils.isNotEmpty(filterCondition)) {
                            queryContext.getFilterMemberValues().putAll(filterCondition);
                        }
                    } else {
                        MeasureCondition measureCon = (MeasureCondition) condition;
                        // 暂时这个还不会生效
                        queryContext.getFilterExpression().put(measureCon.getMetaName(),
                                measureCon.getMeasureConditions());
                    }
                }
            }
        }
        return queryContext;
    }
    
    /**
     * 构造过滤条件
     * 
     * @param dataSourceInfo 数据源信息
     * @param cube cube信息
     * @param dimCondition 维度信息
     * @param params 查询条件
     * @return 过滤条件
     * @throws MiniCubeQueryException 查询异常
     * @throws MetaException 元数据异常信息
     */
    public Map<String, Set<String>> buildFilterCondition(DataSourceInfo dataSourceInfo, Cube cube,
            DimensionCondition dimCondition, Map<String, String> params) throws MiniCubeQueryException, MetaException {
        if (dimCondition == null) {
            throw new IllegalArgumentException("dimension condition is null");
        }
        if (dimCondition.getQueryDataNodes().isEmpty()) {
            logger.info("filter axises ignore all member filter");
            return null;
        }
        Map<String, Set<String>> filterValues = new HashMap<>();
        for (QueryData queryData : dimCondition.getQueryDataNodes()) {
            if (MetaNameUtil.isAllMemberUniqueName(queryData.getUniqueName())) {
                logger.info("filter axises ignore all member filter");
                return null;
            }
            MiniCubeMember member = metaDataService.lookUp(dataSourceInfo, cube, queryData.getUniqueName(), params);
            if (member != null) {
                String querySource = member.getLevel().getFactTableColumn();
                Set<String> nodes =
                        CollectionUtils.isEmpty(member.getQueryNodes()) ? Sets.newHashSet(member.getName()) : member
                                .getQueryNodes();
                if (filterValues.containsKey(querySource)) {
                    filterValues.get(querySource).addAll(nodes);
                } else {
                    filterValues.put(querySource, nodes);
                }
            } else {
                logger.warn("can not found member by query data:" + queryData);
            }
        }

        return filterValues;
    }

    /**
     * 根据维值选中条件构造维值查询的树
     * 
     * @param dataSourceInfo 数据源信息
     * @param cube cube模型
     * @param dimCondition 维值查询条件
     * @param isFirstInRow 是否是行上的第一个维度
     * @return 维值树
     * @throws MiniCubeQueryException 查询维值异常
     * @throws MetaException
     */
    private MemberNodeTree buildQueryMemberTree(DataSourceInfo dataSourceInfo, Cube cube,
            DimensionCondition dimCondition, boolean isFirstInRow, Map<String, String> params)
            throws MiniCubeQueryException, MetaException {
        if (dimCondition == null) {
            throw new IllegalArgumentException("dimension condition is null");
        }
        MemberNodeTree nodeTree = new MemberNodeTree(null);
        if (dimCondition.getQueryDataNodes().isEmpty()) {
            String allMemberUniqueName =
                    cube.getDimensions().get(dimCondition.getMetaName()).getAllMember().getUniqueName();
            QueryData queryData = new QueryData(allMemberUniqueName);
            queryData.setExpand(isFirstInRow);
            queryData.setShow(true);
            dimCondition.getQueryDataNodes().add(queryData);
        }
        for (QueryData queryData : dimCondition.getQueryDataNodes()) {
            MiniCubeMember member = metaDataService.lookUp(dataSourceInfo, cube, queryData.getUniqueName(), params);

            MemberNodeTree memberNode = new MemberNodeTree(nodeTree);
            List<MemberNodeTree> childNodes = new ArrayList<MemberNodeTree>();
            boolean isCallBack = member.getLevel().getType().equals(LevelType.CALL_BACK);
            // 如果接到设置了下钻 或者 当前维度在行上第一个并且只有一个选中节点
            if (queryData.isExpand() || isCallBack) {
            	memberNode.setSummary(true);
                List<MiniCubeMember> children = metaDataService.getChildren(dataSourceInfo, cube, member, params);
                if (CollectionUtils.isNotEmpty(children)) {
                    children.forEach((child) -> {
                        MemberNodeTree childNode = new MemberNodeTree(nodeTree);
                        buildMemberNodeByMember(childNode, child);
                        childNodes.add(childNode);
                        member.getQueryNodes().addAll(child.getQueryNodes());
                    });
                }
            }
            // 如果当前孩子为空或者当前节点是要展现，那么直接把本身扔到要展现列表中
            if (queryData.isShow() || CollectionUtils.isEmpty(childNodes)) {
                buildMemberNodeByMember(memberNode, member);
                memberNode.setChildren(childNodes);
                nodeTree.getChildren().add(memberNode);
//                return memberNode;
            } else {
                nodeTree.getChildren().addAll(childNodes);
            }
        }

        return nodeTree;
    }

    /**
     * 根据维值创建查询树的节点
     * @param node 查询节点
     * @param member 维值
     */
    private void buildMemberNodeByMember(MemberNodeTree node, MiniCubeMember member) {
        node.setCaption(member.getCaption());
        if (CollectionUtils.isNotEmpty(member.getQueryNodes())) {
            node.setLeafIds(member.getQueryNodes());
        } else {
            node.getLeafIds().add(member.getName());
        }
        node.setName(member.getName());
        node.setUniqueName(member.getUniqueName());
        node.setOrdinal(member.getName());
        // 设置查询的来源，如事实表的字段
        node.setQuerySource(member.getLevel().getFactTableColumn());

        // 后续需要对孩子节点进行下查询，本次对是否有孩子的判断只是按照是否有下一个层级
        if (member.isAll()) {
            node.setHasChildren(true);
        } else if (member.getLevel() instanceof CallbackLevel) {
            if (CollectionUtils.isNotEmpty(member.getQueryNodes())) {
                node.setHasChildren(true);
            }
        } else {
            Dimension dim = member.getLevel().getDimension();
            List<String> levelNames = Lists.newArrayList(dim.getLevels().keySet());
            for (int i = 0; i < levelNames.size(); i++) {
                if (member.getLevel().getName().equals(levelNames.get(i))) {
                    if (i < levelNames.size() - 1) {
                        node.setHasChildren(true);
                    }
                    break;
                }
            }
        }

    }

}
