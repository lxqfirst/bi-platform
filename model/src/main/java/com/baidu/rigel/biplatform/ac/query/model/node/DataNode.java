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
package com.baidu.rigel.biplatform.ac.query.model.node;

import java.math.BigDecimal;

/**
 * 数据节点
 * @author xiaoming.chen
 *
 */
public class DataNode implements Node {
    
    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = -2648103012012236498L;
    
    /**
     * name
     */
    private String name;

    /**
     * data 数据
     */
    private BigDecimal data;

    /**
     * constructor
     * @param name
     * @param data
     */
    public DataNode(String name, BigDecimal data) {
        this.name = name;
        this.data = data;
    }
    
    /**
     * constructor
     * @param data
     */
    public DataNode(BigDecimal data) {
        this.data = data;
    }

    @Override
    public BigDecimal getResult() {
        return data;
    }

    /**
     * get name
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * set name with name
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * get data
     * @return the data
     */
    public BigDecimal getData() {
        return data;
    }

    /**
     * set data with data
     * @param data the data to set
     */
    public void setData(BigDecimal data) {
        this.data = data;
    }
}
