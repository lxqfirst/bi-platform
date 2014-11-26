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
package com.baidu.rigel.tesseract.datasource.impl;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo.DataBase;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourceWrap;
import com.baidu.rigel.biplatform.tesseract.datasource.impl.SqlDataSourceManagerImpl;
import com.baidu.rigel.biplatform.tesseract.exception.DataSourceException;
import com.google.common.collect.Lists;


/**
 * sql数据源管理单测
 * 
 * @author xiaoming.chen
 *
 */
public class SqlDataSourceManagerImplTest {
    
    private SqlDataSourceManagerImpl sqlDataSourceManager = SqlDataSourceManagerImpl.getInstance();
    
    /**
     * 根据数据源的MD5的KEY查找数据源的单测
     * 
     * @throws Exception encode password exception
     */
    @Test
    public void testGetDataSourceByKey() throws Exception {
        String key = null;
        
        DataSourceWrap result = null;
        
        try {
            result = sqlDataSourceManager.getDataSourceByKey(key);
            Assert.fail("no check empty key");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        key = "notExistKey";
        try {
            result = sqlDataSourceManager.getDataSourceByKey(key);
            Assert.fail("no chekc datasource exist");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof DataSourceException);
        }
        
        sqlDataSourceManager.initDataSource(mockValidateSqlDataSourceInfo());
        
        result = sqlDataSourceManager.getDataSourceByKey("dataSourceKey1");
        Assert.assertNotNull(result);
        
        SqlDataSourceInfo sqlDataSource = new SqlDataSourceInfo("sqlDataSource_1_unique");
        sqlDataSource.setHosts(Lists.newArrayList("127.0.0.1:3306"));
        sqlDataSource.setUsername("user");
        sqlDataSource.setPassword("pass");
        sqlDataSource.setDBProxy(true);
        sqlDataSource.setInstanceName("db");
        sqlDataSource.setJdbcUrls(Lists.newArrayList("jdbc:mysql://127.0.0.1:3306/test"));
        sqlDataSource.setProductLine("productLine");
        
        sqlDataSourceManager.initDataSource(sqlDataSource);
        
        try {
            result = sqlDataSourceManager.getDataSourceByKey(sqlDataSource.getDataSourceKey());
            Assert.fail("no check datasource useable");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof DataSourceException);
        }
    }
    
    /**
     * Mock一个可用的数据源信息
     * 
     * @return mock一个h2数据源
     * @throws Exception  加密异常
     */
    private DataSourceInfo mockValidateSqlDataSourceInfo() throws Exception {
        SqlDataSourceInfo result = Mockito.mock(SqlDataSourceInfo.class);
        Mockito.doReturn("dataSourceKey1").when(result).getDataSourceKey();
        
        Mockito.doCallRealMethod().when(result)
            .getConnectionProperties(Mockito.anyString(), Mockito.anyString());
        Mockito.doReturn(Lists.newArrayList("jdbc:h2:mem:sqlTestdb;MODE=MYSQL;DB_CLOSE_DELAY=-1")).when(result)
            .getJdbcUrls();
        Mockito.doReturn(true).when(result).validate();
        Mockito.doReturn("TestDB").when(result).getInstanceName();
        Mockito.doReturn(Lists.newArrayList("127.0.0.1:3306")).when(result).getHosts();
        Mockito.doReturn("sa").when(result).getUsername();
        Mockito.doReturn("password").when(result).getPassword();
        Mockito.doReturn("productline").when(result).getProductLine();
        
        Mockito.doReturn(DataBase.H2).when(result).getDataBase();
        return result;
    }
    
    /**
     * Test method for
     * {@link com.baidu.rigel.biplatform.tesseract.datasource.impl.SqlDataSourceManagerImpl#initDataSource(com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo)}
     * .
     * 
     * @throws Exception
     */
    @Test
    public void testInitDataSource() throws Exception {
        DataSourceInfo dataSourceInfo = null;
        
        try {
            sqlDataSourceManager.initDataSource(dataSourceInfo);
            Assert.fail("no chekc null paras");
        } catch (IllegalArgumentException e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        SqlDataSourceInfo sqlDataSource = new SqlDataSourceInfo("sqlDataSource_1_unique");
        sqlDataSource.setHosts(Lists.newArrayList("127.0.0.1:3306"));
        sqlDataSource.setUsername("user");
        sqlDataSource.setPassword("pass");
        sqlDataSource.setDBProxy(true);
        sqlDataSource.setInstanceName("db");
        sqlDataSource.setProductLine("productline");
        sqlDataSource.setJdbcUrls(Lists.newArrayList("jdbc:h2:mem:sqlTestdb;MODE=MYSQL;DB_CLOSE_DELAY=-1"));
        
//        try {
            sqlDataSourceManager.initDataSource(sqlDataSource);
//            Assert.fail("no chekc null paras");
//        } catch (DataSourceException e) {
//            Assert.assertTrue(e instanceof DataSourceException);
//        }
        
        sqlDataSource.setDataSourceKey("newKey");
        sqlDataSource.setInstanceName(null);
        try {
            sqlDataSourceManager.initDataSource(sqlDataSource);
            Assert.fail("no chekc null paras");
        } catch (IllegalArgumentException e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
    }
    
    /**
     * Test method for
     * {@link com.baidu.rigel.biplatform.tesseract.datasource.impl.SqlDataSourceManagerImpl#removeDataSource(java.lang.String)}
     * .
     */
    @Test
    public void testRemoveDataSource() throws DataSourceException {
        String key = null;
        try {
            sqlDataSourceManager.removeDataSource(key);
            Assert.fail("no chekc null paras");
        } catch (IllegalArgumentException e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        key = "notExistKey";
        sqlDataSourceManager.removeDataSource(key);
        
        key = "dataSourceKey1";
        sqlDataSourceManager.removeDataSource(key);
        
        try {
            sqlDataSourceManager.getDataSourceByKey(key);
            Assert.fail("no chekc datasource exist");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof DataSourceException);
        }
        
    }
    
}
