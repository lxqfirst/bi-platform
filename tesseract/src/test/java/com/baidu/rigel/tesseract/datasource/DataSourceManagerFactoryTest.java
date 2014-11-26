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
package com.baidu.rigel.tesseract.datasource;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import com.baidu.rigel.biplatform.ac.query.MiniCubeConnection.DataSourceType;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourceManager;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourceManagerFactory;
import com.baidu.rigel.biplatform.tesseract.exception.DataSourceException;
import com.google.common.collect.Lists;

/**
 * 数据源管理实例创建工厂
 * 
 * @author xiaoming.chen
 *
 */
public class DataSourceManagerFactoryTest {
    
    @Test
    public void testGetDataSourceManagerInstance() throws Exception {
        DataSourceInfo dataSourceInfo = null;
        
        DataSourceManager result = null;
        try {
            result = DataSourceManagerFactory.getDataSourceManagerInstance(dataSourceInfo);
            Assert.fail("no check null datasourceinfo");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        dataSourceInfo = new SqlDataSourceInfo("sqlDataSource_3_unique");
        try {
            result = DataSourceManagerFactory.getDataSourceManagerInstance(dataSourceInfo);
            Assert.fail("no check invalidate datasourceinfo");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        dataSourceInfo = Mockito.mock(DataSourceInfo.class);
        Mockito.doReturn(DataSourceType.FILE).when(dataSourceInfo).getDataSourceType();
        Mockito.doReturn(true).when(dataSourceInfo).validate();
        try {
            result = DataSourceManagerFactory.getDataSourceManagerInstance(dataSourceInfo);
            Assert.fail("no check not implement datasourceinfo");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof DataSourceException);
        }
        
        SqlDataSourceInfo sqlDataSourceInfo = new SqlDataSourceInfo("sqlDataSource_4_unique");
        sqlDataSourceInfo.setHosts(Lists.newArrayList("host1:port"));
        sqlDataSourceInfo.setInstanceName("instance");
        sqlDataSourceInfo.setPassword("pass");
        sqlDataSourceInfo.setUsername("user");
        sqlDataSourceInfo.setJdbcUrls(Lists.newArrayList("jdbcurl"));
        sqlDataSourceInfo.setProductLine("productline");
        
        result = DataSourceManagerFactory.getDataSourceManagerInstance(sqlDataSourceInfo);
        Assert.assertNotNull(result);
        
    }
    
}
