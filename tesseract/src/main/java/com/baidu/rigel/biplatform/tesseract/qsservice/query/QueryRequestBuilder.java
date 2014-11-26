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
package com.baidu.rigel.biplatform.tesseract.qsservice.query;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;

import com.baidu.rigel.biplatform.ac.minicube.MiniCube;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeLevel;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMeasure;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.model.QuestionModel;
import com.baidu.rigel.biplatform.ac.util.MetaNameUtil;
import com.baidu.rigel.biplatform.tesseract.model.MemberNodeTree;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.Expression;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.From;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.Limit;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryContext;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryMeasure;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryObject;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.Select;

/**
 * build一个查询请求
 * 
 * @author xiaoming.chen
 *
 */
public class QueryRequestBuilder {

    /**
     * @param questionModel
     * @param dsInfo
     * @param cube
     * @param queryContext
     * @return
     */
    public static QueryRequest buildQueryRequest(QuestionModel questionModel, DataSourceInfo dsInfo, Cube cube,
            QueryContext queryContext) {
        MiniCube miniCube = (MiniCube) cube;
        QueryRequest request = new QueryRequest();
        request.setCubeId(cube.getId());
        request.setDataSourceInfo(dsInfo);
        // 好像cubeName没有用了吧。
        request.setCubeName(cube.getName());
        request.setFrom(new From(miniCube.getSource()));
        request.setUseIndex(questionModel.isUseIndex());

        // 先构建查询中的指标
        request.setSelect(buildSelectMeasure(queryContext.getQueryMeasures()));
        // 在分析行列中的字段，将维度信息添加到select和group by中
        Map<String, Expression> expressions = new HashMap<String, Expression>();
        buildSelectAndGroupBy(queryContext.getColumnMemberTrees(), request, expressions);
        buildSelectAndGroupBy(queryContext.getRowMemberTrees(), request, expressions);

        request.getWhere().getAndList().addAll(expressions.values());
        // 构造filter的条件
        if (MapUtils.isNotEmpty(queryContext.getFilterMemberValues())) {
            queryContext.getFilterMemberValues().forEach((properties, values) -> {
                Expression expression = new Expression(properties);
                expression.getQueryValues().add(new QueryObject(null, values));
                request.getWhere().getAndList().add(expression);
            });
        }

        int start = 0;
        int size = -1;
        if (questionModel.getPageInfo() != null) {
            start = questionModel.getPageInfo().getPageNo() * questionModel.getPageInfo().getPageSize();
            size = questionModel.getPageInfo().getPageSize();
        }
        request.setLimit(new Limit(start, size));
        return request;
    }

    /**
     * @param nodeTrees
     * @param request
     * @param expressions
     */
    private static void buildSelectAndGroupBy(List<MemberNodeTree> nodeTrees, QueryRequest request,
            Map<String, Expression> expressions) {
        if (expressions == null) {
            expressions = new HashMap<String, Expression>();
        }
        if (CollectionUtils.isNotEmpty(nodeTrees)) {
            for (MemberNodeTree node : nodeTrees) {
                if ((!MetaNameUtil.isAllMemberName(node.getName()) || !node.getChildren().isEmpty())
                        && StringUtils.isNotBlank(node.getQuerySource())) {
                    request.selectAndGroupBy(node.getQuerySource());
                    Expression expression = expressions.get(node.getQuerySource());
                    if (expression == null) {
                        expression = new Expression(node.getQuerySource());
                        expressions.put(node.getQuerySource(), expression);
                    }
                    expression.getQueryValues().add(new QueryObject(node.getName(), node.getLeafIds(), node.isSummary()));
                }
                buildSelectAndGroupBy(node.getChildren(), request, expressions);
            }
        }
    }

    /**
     * @param measures
     * @return
     */
    private static Select buildSelectMeasure(List<MiniCubeMeasure> measures) {
        Select select = new Select();
        if (CollectionUtils.isNotEmpty(measures)) {
            for (MiniCubeMeasure measure : measures) {
                select.getQueryMeasures().add(new QueryMeasure(measure.getAggregator(), measure.getDefine()));
            }
        }
        return select;
    }

    /**
     * @param level
     * @param cubeName
     * @param factTable
     * @param dataSourceInfo
     * @return
     */
    public static QueryRequest buildQueryRequest(MiniCubeLevel level, String cubeName, String factTable,
            DataSourceInfo dataSourceInfo) {
        QueryRequest queryRequest = new QueryRequest();
        queryRequest.setCubeName(cubeName);
        queryRequest.setDataSourceInfo(dataSourceInfo);
        queryRequest.setFrom(new From(level.getDimTable()));

        if (StringUtils.isNotBlank(level.getSource())) {
            // 如果主键和key的来源不一致，需要查询对应的主键
            queryRequest.selectAndGroupBy(level.getSource());
        }
        if (StringUtils.isNotBlank(level.getCaptionColumn())
                && StringUtils.equals(level.getSource(), level.getCaptionColumn())) {
            queryRequest.getSelect().getQueryProperties().add(level.getCaptionColumn());
        }

        return queryRequest;
    }

}
