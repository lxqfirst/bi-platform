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
package com.baidu.rigel.biplatform.ma.rt.query.model;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ma.rt.ExtendAreaContext;
import com.google.common.collect.Maps;

/**
 *
 * 查询请求对象：封装用户的查询请求
 * 
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryRequest implements Serializable {

    /**
     * QueryRequest.java -- long
     * description:
     */
    private static final long serialVersionUID = -5852815624932993668L;
    
    /**
     * 请求参数：封装用户请求的个性化参数
     */
    private Map<String, Object> params = Maps.newHashMap();
    
    /**
     * 区域id
     */
    private String areaId;
    
    /**
     * 行轴字段
     */
    private Map<String, String[]> rows;
    
    /**
     * 列轴字段
     */
    private Map<String, String[]> cols;
    
    
    /**
     * 过滤字段以及默认值
     */
    private Map<String, String[]> filter;
    
    /**
     * 查询条件，如果时LiteOlap查询策略，忽略该属性
     */
    private Map<String, String[]> conditions;
    
    /**
     * 排序字段
     */
    private LinkedHashMap<String, OrderType> orders;
    
    /**
     * 查询策略
     */
    private final QueryStrategy queryStrategy;
    
    /**
     * 当前请求报表查询对应的运行时上下文
     */
    private ExtendAreaContext context;
    
    /**
     * 数据源定义
     */

    
    /**
     * 构造函数
     * @param queryStrategy 查询策略
     * QueryRequest
     */
    public QueryRequest(QueryStrategy queryStrategy, ExtendAreaContext context) {
        this.queryStrategy = queryStrategy;
        this.context = context;
    }
    
    /**
     * @return the queryStrategy
     */
    public QueryStrategy getQueryStrategy() {
        return queryStrategy;
    }


    /**
     * 查询请求定义的个性化参数
     * @return the params
     * 
     */
    public Map<String, Object> getParams() {
        return params;
    }


    /**
     * 与维度、指标无关参数，如与acl相关参数等
     * @param params the params to set
     * 
     */
    public void setParams(Map<String, Object> params) {
        this.params = params;
    }

    /**
     * @return the areaId
     */
    public String getAreaId() {
        return areaId;
    }


    /**
     * @param areaId the areaId to set
     */
    public void setAreaId(String areaId) {
        this.areaId = areaId;
    }


    /**
     * 动态构建查询模型的行，普通查询返回null
     * @return the rows
     * 
     */
    public Map<String, String[]> getRows() {
        return rows;
    }


    /**
     * 设置查询行，非必要条件
     * @param rows the rows to set
     */
    public void setRows(Map<String, String[]> rows) {
        this.rows = rows;
    }


    /**
     * 动态构建查询模型的列 普通查询返回null
     * @return the cols
     */
    public Map<String, String[]> getCols() {
        return cols;
    }


    /**
     * 设置查询的列，非必要条件
     * @param cols the cols to set
     */
    public void setCols(Map<String, String[]> cols) {
        this.cols = cols;
    }


    /**
     * 查询过滤条件
     * @return the filter
     */
    public Map<String, String[]> getFilter() {
        return filter;
    }


    /**
     * 设置查询的过滤条件，非必要条件
     * @param filter the filter to set
     */
    public void setFilter(Map<String, String[]> filter) {
        this.filter = filter;
    }


    /**
     * 排序列以及排序方式
     * @return the orders
     */
    public LinkedHashMap<String, OrderType> getOrders() {
        return orders;
    }


    /**
     * 设置排序方式
     * @param orders the orders to set
     */
    public void setOrders(LinkedHashMap<String, OrderType> orders) {
        this.orders = orders;
    }

    /**
     * 维度过滤条件，主要为静态模型提供，动态查询模型(LiteOlap)，返回null
     * @return the conditions
     */
    public Map<String, String[]> getConditions() {
        return conditions;
    }

    /**
     * Notice: LiteOlap查询忽略改属性，默认值需要在行、列、过滤轴上指定
     * @param conditions the conditions to set
     */
    public void setConditions(Map<String, String[]> conditions) {
        this.conditions = conditions;
    }

	/**
	 * 查询请求对应报表的运行时上下文
	 * @return the context
	 */
	public ExtendAreaContext getContext() {
		return context;
	}


	/**
	 * @return the dataSourceInfo
	 */
	public DataSourceInfo getDataSourceInfo() {
		return context.getDefaultDsInfo();
	}

}
