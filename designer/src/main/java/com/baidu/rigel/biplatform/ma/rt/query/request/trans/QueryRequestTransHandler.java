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

import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryRequest;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy;

/**
 * 
 * @author david.wang
 * @version 1.0.0.1
 */
abstract class QueryRequestTransHandler {
    
    /**
     * 转换器
     */
    protected QueryRequestTransHandler handler;
    
    /**
     * 构造函数
     * @param queryStrategy
     * QueryRequestTransHandler
     */
    public QueryRequestTransHandler() {
    }
    
    /**
     * @param handler the handler to set
     */
    public void setNextHandler(QueryRequestTransHandler handler) {
        this.handler = handler;
    }

    /**
     * 
     * 将{@link QueryRequest}转换成{@link QueryAction}
     * @param request 查询请求
     * @return QueryAction
     * 
     */
    abstract QueryAction transRequest(QueryRequest request) ;
    
    /**
     * 当前handler支持的查询策略
     * @return 当前handler支持的查询策略
     */
    abstract boolean isSupportedQueryStrategy(QueryStrategy queryStrategy);
    
    /**
     * 将查询请求转换为QueryAction服务
     * @param request 查询请求
     * @return QueryAction
     * @throws IllegalStateException 未找到相应查询策略，抛出异常
     */
    public QueryAction transRequest2Action(QueryRequest request) {
        if (isSupportedQueryStrategy(request.getQueryStrategy())) {
            return transRequest(request);
        } else if (this.handler != null) {
            return handler.transRequest2Action(request);
        }
        throw new IllegalStateException("未知的查询请求 ："  + request.getQueryStrategy());
    }
    
}
