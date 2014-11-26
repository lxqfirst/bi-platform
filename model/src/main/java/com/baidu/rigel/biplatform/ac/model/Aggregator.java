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
package com.baidu.rigel.biplatform.ac.model;

/**
 * 指标汇总类型
 * 
 * @author xiaoming.chen
 *
 */
public enum Aggregator {
    /**
     * SUM
     */
    SUM, // 加和
    
    /**
     * COUNT
     */
    COUNT, // 计数
    
    /**
     * DISTINCT_COUNT
     */
    DISTINCT_COUNT, // 去重计数
    /**
     * CALCULATED
     */
    CALCULATED, // 计算类型指标
    
    /**
     * DISTINCT
     */
    DISTINCT; 
    
//    /**
//     * 平均值
//     */
//    AVERAGE;
}
