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
package com.baidu.rigel.biplatform.ma.report.model;

/**
 * 
 * 扩展区域类型定义
 * 
 * @author david.wang
 * @version 1.0.0.1
 */
public enum ExtendAreaType {
    
    /**
     * 表格
     */
    TABLE,
    
    /**
     * 图表
     */
    CHART,
    
    /**
     * LITEOLAP中的图
     */
    LITEOLAP_CHART,
    
    /**
     * LITEOLAP中的表
     */
    LITEOLAP_TABLE,
    
    /**
     * 时间控件
     */
    TIME_COMP,
    
    /**
     * 查询控件
     */
    QUERY_COMP,
    
    /**
     * 功能按钮控件
     */
    FUNC_COMP,
    
    /**
     * 待选区域控件
     */
    SELECTION_AREA,
    
    /**
     * LiteOlap组件
     */
    LITEOLAP;
}
