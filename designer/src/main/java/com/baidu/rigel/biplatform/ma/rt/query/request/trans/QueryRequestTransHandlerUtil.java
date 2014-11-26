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
package com.baidu.rigel.biplatform.ma.rt.query.request.trans;


/**
 * 工具类：查询请求转换处理器工具类，负载组装查询请求处理器
 * 目前提供默认支持，后续支持动态创建
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryRequestTransHandlerUtil {
    
    private QueryRequestTransHandlerUtil() {
    }
    
    /**
     * 生成默认QueryRequest转换处理器
     * @return QueryRequestTransHandler
     */
    public static QueryRequestTransHandlerWrapper getDefault() {
        
        UpdateContextQueryTransHandler handler = new UpdateContextQueryTransHandler();
        MemberQueryTransHandler memberQueryHandler = new MemberQueryTransHandler();
        handler.setNextHandler(memberQueryHandler);
        
        TableQueryTransHandler tableQueryHandler = new TableQueryTransHandler();
        memberQueryHandler.setNextHandler(tableQueryHandler);
        
        ChartQueryTransHandler chartQueryHandler = new ChartQueryTransHandler();
        tableQueryHandler.setNextHandler(chartQueryHandler);
        
        QueryRequestTransHandlerWrapper wrapper = new QueryRequestTransHandlerWrapper(handler);
        return wrapper;
        
    }
}
