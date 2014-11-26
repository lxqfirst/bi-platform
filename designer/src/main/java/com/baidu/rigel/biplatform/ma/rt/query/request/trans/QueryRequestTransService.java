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

import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryRequest;

/**
 * 查询请求转换服务类
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public final class QueryRequestTransService {
    
    /**
     * QueryRequest 转换请求拦截器
     */
    private QueryRequestTransHandlerWrapper handler;
    
    private QueryRequestTransService() {
    }
    
    /**
     * 将查询请求转换为QueryAction
     * @param request
     * @return QueryAction
     */
    public QueryAction tranRequest2QueryAction (QueryRequest request) {
        
        if (this.handler == null) {
            throw new IllegalStateException("未找到合适的请求处理拦截器。Service 未正确初始化");
        }
        
        if (request.getQueryStrategy() == null) {
            throw new IllegalArgumentException("查询请求异常，未指定正确请求策略。当前策略为null");
        }
        
        if (StringUtils.isEmpty(request.getAreaId())) {
            throw new IllegalArgumentException("查询请求异常，未指定正确报表扩展区域id。当前报表areaId为nulll");
        }
        
        return this.handler.transRequest2Action(request);
    }
    
    /**
     * 获取查询服务实例
     * @return QueryRequestTransService
     */
    public static QueryRequestTransService getInstance() {
        //TODO 考虑是否单例
        QueryRequestTransService instance = new QueryRequestTransService();
        instance.handler = QueryRequestTransHandlerUtil.getDefault();
        return instance;
    }
    
}
