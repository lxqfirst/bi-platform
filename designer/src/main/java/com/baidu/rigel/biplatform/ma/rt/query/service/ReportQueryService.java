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
package com.baidu.rigel.biplatform.ma.rt.query.service;

import com.baidu.rigel.biplatform.ma.rt.query.model.QueryRequest;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryResult;


/**
 * 
 *  报表查询服务
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public interface ReportQueryService {
    
    /**
     * 数据查询服务
     * @param request 查询请求
     * @return 查询结果
     * @throws QueryException 异常
     */
    QueryResult query(QueryRequest request) throws QueryException;
    
}
