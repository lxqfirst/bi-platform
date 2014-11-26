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

import java.io.Serializable;
import java.util.Map;

import com.google.common.collect.Maps;

/**
 * 格式定义
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class FormatModel implements Serializable {
    
    /**
     * serialize id
     */
    private static final long serialVersionUID = 452576215631369839L;
    
    /**
     * 数据格式
     */
    private Map<String, String> dataFormat = Maps.newHashMap();
    
    /**
     * 条件格式
     */
    private Map<String, String> conditionFormat = Maps.newHashMap();

    /**
     * @return the dataFormat
     */
    public Map<String, String> getDataFormat() {
        return dataFormat;
    }

    /**
     * @return the conditionFormat
     */
    public Map<String, String> getConditionFormat() {
        return conditionFormat;
    }

}
