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

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Map;

import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.report.query.ResultSet;

/**
 * 查询请求动作
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryAction implements Serializable {
    
    /**
     * QueryAction.java -- long description:
     */
    private static final long serialVersionUID = -1039924813166211171L;
    
    /**
     * 数据源信息
     */
    private DataSourceInfo dataSource;
    
    /**
     * 立方体信息
     */
    private Cube cube;
    
    /**
     * 上次查询结果
     */
    private ResultSet previousResult;
    
    /**
     * 查询策略
     */
    private QueryStrategy queryStrategy;
    
    /**
     * 报表ID
     */
    private String reportId;
    /**
     * 查询列轴信息 key item's id
     */
    private LinkedHashMap<Item, Object> columns = new LinkedHashMap<Item, Object>();
    
    /**
     * 下钻的维度值
     */
    private LinkedHashMap<Item, Object> drillDimValues = new LinkedHashMap<Item, Object>();
    
    /**
     * 查询行轴信息 key为具体 item's id
     */
    private LinkedHashMap<Item, Object> rows = new LinkedHashMap<Item, Object>();
    
    /**
     * 查询过滤描述信息 key为具体维度或者指标id，value为过滤值
     */
    private LinkedHashMap<Item, Object> slices = new LinkedHashMap<Item, Object>();
    
    /**
     * 排序方式
     */
    private LinkedHashMap<Item, OrderType> orders = new LinkedHashMap<Item, OrderType>();
    
    /**
     * 请求参数
     */
    private Map<String, Object> requestParams;

    /**
     * @return the dataSource
     */
    public DataSourceInfo getDataSource() {
        return dataSource;
    }

    /**
     * @param dataSource the dataSource to set
     */
    public void setDataSource(DataSourceInfo dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * @return the cube
     */
    public Cube getCube() {
        return cube;
    }

    /**
     * @param cube the cube to set
     */
    public void setCube(Cube cube) {
        this.cube = cube;
    }

    /**
     * @return the previousResult
     */
    public ResultSet getPreviousResult() {
        return previousResult;
    }

    /**
     * @param previousResult the previousResult to set
     */
    public void setPreviousResult(ResultSet previousResult) {
        this.previousResult = previousResult;
    }

    /**
     * @return the queryStrategy
     */
    public QueryStrategy getQueryStrategy() {
        return queryStrategy;
    }

    /**
     * @param queryStrategy the queryStrategy to set
     */
    public void setQueryStrategy(QueryStrategy queryStrategy) {
        this.queryStrategy = queryStrategy;
    }

    /**
     * @return the columns
     */
    public LinkedHashMap<Item, Object> getColumns() {
        return columns;
    }

    /**
     * @param columns the columns to set
     */
    public void setColumns(LinkedHashMap<Item, Object> columns) {
        this.columns = columns;
    }

    /**
     * @return the drillDimValues
     */
    public LinkedHashMap<Item, Object> getDrillDimValues() {
        return drillDimValues;
    }

    /**
     * @param drillDimValues the drillDimValues to set
     */
    public void setDrillDimValues(LinkedHashMap<Item, Object> drillDimValues) {
        this.drillDimValues = drillDimValues;
    }

    /**
     * @return the rows
     */
    public LinkedHashMap<Item, Object> getRows() {
        return rows;
    }

    /**
     * @param rows the rows to set
     */
    public void setRows(LinkedHashMap<Item, Object> rows) {
        this.rows = rows;
    }

    /**
     * @return the slices
     */
    public LinkedHashMap<Item, Object> getSlices() {
        return slices;
    }

    /**
     * @param slices the slices to set
     */
    public void setSlices(LinkedHashMap<Item, Object> slices) {
        this.slices = slices;
    }

    /**
     * @return the orders
     */
    public LinkedHashMap<Item, OrderType> getOrders() {
        return orders;
    }

    /**
     * @param orders the orders to set
     */
    public void setOrders(LinkedHashMap<Item, OrderType> orders) {
        this.orders = orders;
    }

    /**
     * @return the requestParams
     */
    public Map<String, Object> getRequestParams() {
        return requestParams;
    }

    /**
     * @param requestParams the requestParams to set
     */
    public void setRequestParams(Map<String, Object> requestParams) {
        this.requestParams = requestParams;
    }

    
    /** 
     * 获取 reportId 
     * @return the reportId 
     */
    public String getReportId() {
        
        return reportId;
        
    }

    
    /** 
     * 设置 reportId 
     * @param reportId the reportId to set 
     */
    public void setReportId(String reportId) {
        
        this.reportId = reportId;
        
    }
    
}
