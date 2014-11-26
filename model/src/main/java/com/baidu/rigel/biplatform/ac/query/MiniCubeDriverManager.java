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
package com.baidu.rigel.biplatform.ac.query;

import com.baidu.rigel.biplatform.ac.query.MiniCubeConnection.DataSourceType;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo;

/**
 * 接入接口
 * 
 * @author xiaoming.chen
 *
 */
public class MiniCubeDriverManager {

    /**
     * 根据cube对象创建连接
     * 
     * @param cube
     * @param dataSourceInfo
     * @return
     */
    public static MiniCubeConnection getConnection(DataSourceInfo dataSourceInfo) {
        if (dataSourceInfo == null || !dataSourceInfo.validate()) {
            throw new IllegalArgumentException("dataSourceInfo:" + dataSourceInfo);
        }
        if (dataSourceInfo.getDataSourceType().equals(DataSourceType.SQL)) {
            return new MiniCubeSqlConnection((SqlDataSourceInfo) dataSourceInfo);
        }
        throw new UnsupportedOperationException("only support SQL type dataSourceinfo.");
    }

    // /**
    // * 动态转换Schema文件，为后续预留
    // * @param schemaFile
    // * @param dataSourceInfo
    // * @return
    // */
    // public MiniCubeConnection getConnection(File schemaFile, DataSourceInfo dataSourceInfo){
    // throw new UnsupportedOperationException("not implement.");
    // }

}
