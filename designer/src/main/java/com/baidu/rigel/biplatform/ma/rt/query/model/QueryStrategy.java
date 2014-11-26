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
package com.baidu.rigel.biplatform.ma.rt.query.model;

import java.util.Map;

/**
 * 
 * 查询策略：用户此次查询请求的策略，比如：更新全局上下文、查询不同报表、查询图形等
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public enum QueryStrategy {
    
    /**
     * 更新全局上下文
     */
    CONTEXT_UPDATE,
    
    /**
     * 查询表
     */
    TABLE_QUERY,
    
    /**
     * 查询图
     */
    CHART_QUERY,
    
    /**
     * 查询成员
     */
    DIM_MEMBER_QUERY,
    
    /**
     * LiteOlap表查询
     */
    LITE_OLAP_TABLE_QUERY,
    
    /**
     * LiteOlap图查询
     */
    LITE_OLAP_CHART_QUERY,
    
    /**
     * 链接下钻查询
     */
    DRILL_BY_LINK_QUERY,
    
    /**
     * 下钻展开查询
     */
    DRILL_EXPAND_QUERY,
    
    /**
     * 上卷操作
     */
    ROLL_UP_EXPAND_QUERY,
    
    /**
     * 未知
     */
    UNKNOW;
    
    /**
     * 额外信息，比如查询图时需要制定图形类型
     */
    private Map<String, String> extInfo;

    /**
     * 
     * @return the extInfo
     * 
     */
    public Map<String, String> getExtInfo() {
        return extInfo;
    }

    /**
     * 
     * @param extInfo the extInfo to set
     * 
     */
    public void setExtInfo(Map<String, String> extInfo) {
        this.extInfo = extInfo;
    }
    
}
