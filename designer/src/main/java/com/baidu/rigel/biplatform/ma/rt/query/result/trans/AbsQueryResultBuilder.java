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

import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryResult;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy;

/**
 *
 * @author david.wang
 * @version 1.0.0.1
 */
abstract class AbsQueryResultBuilder {
    
    /**
     * nextBuilder
     */
    private AbsQueryResultBuilder nextBuilder;
    
    /**
     * AbsQueryResultBuilder
     */
    protected AbsQueryResultBuilder () {
    }
    
    
    /**
     * @param nextBuilder the nextBuilder to set
     */
    public void setNextBuilder(AbsQueryResultBuilder nextBuilder) {
        this.nextBuilder = nextBuilder;
    }


    /**
     * 
     * @param action
     * @param model
     * @return QueryResult
     */
    QueryResult build(QueryAction action, DataModel model) {
        if (isCanBuildResult(action.getQueryStrategy())) {
            return innerBuild(action, model);
        } else if (this.nextBuilder != null) {
            return nextBuilder.build(action, model);
        }
        throw new IllegalArgumentException("未知错误");
    }
    
    /**
     * 当前构造器是否能够构建此类查询的结果集
     * @param queryStrategy
     * @return true 能够支持 false 不能支持
     */
    abstract boolean isCanBuildResult(QueryStrategy queryStrategy);
    
    /**
     * 构建结果集
     * @param queryAction
     * @param model
     * @return QueryResult
     */
    abstract QueryResult innerBuild(QueryAction queryAction, DataModel model);
}
