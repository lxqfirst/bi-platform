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
package com.baidu.rigel.biplatform.ma.rt.query.result.trans;

import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryResult;

/**
 * 
 * QueryResultBuildService
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryResultBuildService {
    
    /**
     * 结果集构造器
     */
    private final QueryResultBuilderWrapper builder;
    
    /**
     * 构造器
     * @param builder
     * QueryResultBuildService
     */
    private QueryResultBuildService (QueryResultBuilderWrapper builder) {
        this.builder = builder;
    }
    
    /**
     * 构建查询结果
     * @param action 查询请求
     * @param dataModel 本次查询数据
     * @return 查询结果
     */
    public QueryResult buildQueryResult(QueryAction action, DataModel dataModel) {
        return builder.buildQueryResult(action, dataModel);
    }

    /**
     * 实例化结果构建服务
     * @return QueryResultBuildService
     */
    public static QueryResultBuildService getInstance() {
        QueryResultBuildService service = new QueryResultBuildService(QueryResultBuilderUtil.getDefault());
        return service;
    }
}
