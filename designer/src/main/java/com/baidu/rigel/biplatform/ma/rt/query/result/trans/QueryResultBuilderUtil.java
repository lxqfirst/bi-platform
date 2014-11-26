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

/**
 * 
 * QueryResultBuilderUtil
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryResultBuilderUtil {
    
    /**
     * 工具类
     * QueryResultBuilderUtil
     */
    private QueryResultBuilderUtil() {
    }
    
    /**
     * default builder wrapper
     * @return QueryResultBuilderWrapper
     */
    public static QueryResultBuilderWrapper getDefault() {
        UpdateContextResultBuilder builder = new UpdateContextResultBuilder();
        
        QueryMemberResultBuilder memberRsBuilder = new QueryMemberResultBuilder();
        builder.setNextBuilder(memberRsBuilder);
        
        QueryTableResultBuilder tableRsBuilder = new QueryTableResultBuilder();
        memberRsBuilder.setNextBuilder(tableRsBuilder);
        
        QueryChartResultBuilder chartRsBuilder = new QueryChartResultBuilder();
        tableRsBuilder.setNextBuilder(chartRsBuilder);
        
        QueryResultBuilderWrapper wrapper = new QueryResultBuilderWrapper(builder);
        return wrapper;
    }
    
}
