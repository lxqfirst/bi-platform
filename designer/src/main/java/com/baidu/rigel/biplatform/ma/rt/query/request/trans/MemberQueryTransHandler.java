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
class MemberQueryTransHandler extends QueryRequestTransHandler {
    
    /**
     * 
     * MemberQueryTransHandler
     */
    protected MemberQueryTransHandler() {
    }
    
    /* (non-Javadoc)
     * @see com.baidu.rigel.biplatform.ma.runtime.QueryRequestTransHandler#transRequest(com.baidu.rigel.biplatform.ma.runtime.QueryRequest)
     */
    @Override
    QueryAction transRequest(QueryRequest request) {
        // TODO Auto-generated method stub
        return null;
    }
    
    /* (non-Javadoc)
     * @see com.baidu.rigel.biplatform.ma.runtime.QueryRequestTransHandler#isSupportedQueryStrategy(com.baidu.rigel.biplatform.ma.runtime.QueryStrategy)
     */
    @Override
    boolean isSupportedQueryStrategy(QueryStrategy queryStrategy) {
        return QueryStrategy.DIM_MEMBER_QUERY == queryStrategy;
    }
    
}
