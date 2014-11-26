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

import javax.annotation.Resource;

import org.apache.commons.collections.CollectionUtils;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.MeasureParseService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryContextSplitService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryContext;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryContextSplitResult;

/**
 * 按照查询上下文自动拆分实现
 * 
 * @author xiaoming.chen
 *
 */
@Service
public class QueryContextSplitServiceImpl implements QueryContextSplitService {

    /**
     * measureParseService
     */
    @Resource
    private MeasureParseService measureParseService;

    @Override
    public QueryContextSplitResult split(Cube cube, QueryContext queryContext,
            QueryContextSplitStrategy preSplitStrategy) {
        QueryContextSplitStrategy splitStrategy = QueryContextSplitStrategy.getNextStrategy(preSplitStrategy);
        // 如果下一次拆分已经没有可拆分的了，那么说明已经不需要再进行拆分了
        if (splitStrategy != null) {
            if (splitStrategy.equals(QueryContextSplitStrategy.MeasureType)) {
                return splitByMeasureTypeStrategy(cube, queryContext);
            } else if (splitStrategy.equals(QueryContextSplitStrategy.Column)) {
                return splitByColumnStrategy(queryContext);
            } else {
                return splitByRowStrategy(queryContext);
            }
        }
        return null;
    }

    /**
     * @param cube
     * @param queryContext
     * @return
     */
    private QueryContextSplitResult splitByMeasureTypeStrategy(Cube cube, QueryContext queryContext) {
        QueryContextSplitResult result = new QueryContextSplitResult(QueryContextSplitStrategy.MeasureType);
        // 按照指标类型拆分，只考虑指标类型
        if (CollectionUtils.isNotEmpty(queryContext.getQueryMeasures())) {

            // MeasureParseResult parseResult = null;
            // 查询指标分类，KEY为指标条件，主要有 distinct-count, 普通, 偏移（偏移对象）
            // Map<Object, Set<String>> queryMeasureCategory = new HashMap<Object, Set<String>>(1);
            // for(String measureName : queryContext.getQueryMeasures()){
            // // 判断是否是同环比的指标名称，比如 自定义的关键字
            // parseResult = measureParseService.parseMeasure(cube, measureName);
            // // TODO 按照指标类型进行分类,对于distinct-count和计算列的需要分组
            //
            // }

            // TODO 应该判断指标分组，按照分组进行拆分，先简单实现
            result.getSplitQueryContexts().add(queryContext);

        } else {
            result.getSplitQueryContexts().add(queryContext);
        }

        return result;
    }

    /**
     * @param queryContext
     * @return
     */
    private QueryContextSplitResult splitByColumnStrategy(QueryContext queryContext) {
        QueryContextSplitResult result = new QueryContextSplitResult(QueryContextSplitStrategy.Column);
        if (CollectionUtils.isNotEmpty(queryContext.getColumnMemberTrees())) {
            for (int i = 0; i < queryContext.getColumnMemberTrees().size(); i++) {
                // TODO 按照查询的节点数进行拆分，按照拆分的节点封装QueryContext
            }
        }

        result.getSplitQueryContexts().add(queryContext);
        return result;
    }

    /**
     * @param queryContext
     * @return
     */
    private QueryContextSplitResult splitByRowStrategy(QueryContext queryContext) {
        QueryContextSplitResult result = new QueryContextSplitResult(QueryContextSplitStrategy.Row);

        if (CollectionUtils.isNotEmpty(queryContext.getRowMemberTrees())) {
            for (int i = 0; i < queryContext.getRowMemberTrees().size(); i++) {
                // TODO 按照查询的节点数进行拆分，按照拆分的节点封装QueryContext
            }
        }

        result.getSplitQueryContexts().add(queryContext);
        return result;
    }

}
