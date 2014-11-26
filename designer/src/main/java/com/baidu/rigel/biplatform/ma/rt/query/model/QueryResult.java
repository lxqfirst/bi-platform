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
import java.util.Map;

import com.google.common.collect.Maps;

/**
 * 
 * 查询结果集封装
 * @author david.wang
 * @version 1.0.0.1
 */
public class QueryResult implements Serializable {

    /**
     * QueryResult.java -- long
     * description:
     */
    private static final long serialVersionUID = 7182582173101126929L;
    
    /**
     * rest service的JSON结构结果，将查询结果封装成map结构
     */
    private final Map<String, Serializable> mapDatas;
    
    /**
     * 构造函数
     * QueryResult
     */
    public QueryResult() {
        this.mapDatas = Maps.newConcurrentMap();
    }

    /**
     * 
     * @return the mapDatas
     * 
     */
    public Map<String, ? extends Serializable> getMapDatas() {
        return mapDatas;
    }
    
    /**
     * 
     * @param key
     * @param value
     */
    public <T extends Serializable> void addData (String key, T value) {
        this.mapDatas.put(key, value);
    }
    
    /**
     * 
     * @param key
     * @return
     */
    public Serializable removeData (String key) {
        return this.mapDatas.remove(key);
    }
    
    /**
     * 
     * @param key
     * @return
     */
    public Serializable getData (String key) {
        return this.mapDatas.get(key);
    }
 }
