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
package com.baidu.rigel.biplatform.ma.rt.query.result.trans;

import org.apache.log4j.Logger;

import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ma.report.exception.PivotTableParseException;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.PivotTable;
import com.baidu.rigel.biplatform.ma.report.service.QueryBuildService;
import com.baidu.rigel.biplatform.ma.report.service.impl.QueryActionBuildServiceImpl;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryResult;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy;

/**
 * QueryTableResultBuilder
 * 
 * @author wangyuxue
 * @version 1.0.0.1
 */
public class QueryTableResultBuilder extends AbsQueryResultBuilder {

    /**
     * 日志
     */
    private Logger logger = Logger.getLogger(QueryTableResultBuilder.class);
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.rt.query.result.trans.AbsQueryResultBuilder#isCanBuildResult(com.baidu.rigel.biplatform
     * .ma.rt.query.service.QueryStrategy)
     */
    @Override
    boolean isCanBuildResult(QueryStrategy queryStrategy) {
        return queryStrategy == QueryStrategy.TABLE_QUERY;
    }

    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.rt.query.result.trans.AbsQueryResultBuilder#innerBuild(com.baidu.rigel.biplatform
     * .ma.rt.query.service.QueryAction, com.baidu.rigel.biplatform.ac.query.data.DataModel)
     */
    @Override
    QueryResult innerBuild(QueryAction queryAction, DataModel model) {
        QueryResult queryResult = new QueryResult();
        PivotTable table = null;
        try {
            QueryBuildService queryBuildService = new QueryActionBuildServiceImpl();
            table = queryBuildService.parseToPivotTable(model);
            String[] dims = new String[0];
            queryResult.addData("pivottable", table);
            queryResult.addData("rowCheckMin", 1);
            queryResult.addData("rowCheckMax", 5);
            queryResult.addData("mainDimNodes", dims);
            queryResult.addData("reportTemplateId", queryAction.getReportId());
            queryResult.addData("totalSize", table.getDataRows());
            return queryResult;
        } catch (PivotTableParseException e) {
            logger.error(e.getMessage(), e);
            queryResult.addData("1", "Fail in parsing result. ");
            return queryResult;
        }

    }

}
