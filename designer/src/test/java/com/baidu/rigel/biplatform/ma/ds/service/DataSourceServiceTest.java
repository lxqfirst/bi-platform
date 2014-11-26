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
package com.baidu.rigel.biplatform.ma.ds.service;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.BDDMockito;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.springframework.util.SerializationUtils;

import com.baidu.rigel.biplatform.ma.ds.exception.DataSourceOperationException;
import com.baidu.rigel.biplatform.ma.ds.service.impl.DataSourceServiceImpl;
import com.baidu.rigel.biplatform.ma.file.client.service.FileService;
import com.baidu.rigel.biplatform.ma.model.consts.DatasourceType;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.utils.DBInfoReader;

/**
 * 
 * test class
 *
 * @author david.wang
 * @version 1.0.0.1
 */
@RunWith(PowerMockRunner.class)
@PrepareForTest({ DBInfoReader.class })
public class DataSourceServiceTest {
    
    /**
     * dataSourceService
     */
    private DataSourceServiceImpl dataSourceService = new DataSourceServiceImpl();
    
    /**
     * FileService
     */
    @Mock
    private FileService fileService;
    
    /**
     * 
     */
    @Before
    public void before() {
        fileService = Mockito.mock(FileService.class);
        dataSourceService.setFileService(fileService);
    }
    
    /**
     * 
     */
    @Test
    public void testIsNameExistWithEmptyDir() throws Exception {
        Mockito.doReturn(new String[] {}).when(fileService).ls("null/null");
        try {
            Assert.assertFalse(dataSourceService.isNameExist("test"));
        } catch (Exception e) {
            Assert.assertNotNull(e);
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testIsNameExistWithNullDir() throws Exception {
        Mockito.doReturn(null).when(fileService).ls("null/null");
        try {
            Assert.assertFalse(dataSourceService.isNameExist("test"));
        } catch (Exception e) {
            Assert.assertNotNull(e);
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testIsNameExistWithDir() throws Exception {
        Mockito.doReturn(new String[] { "a", "b" }).when(fileService).ls("null/null");
        try {
            Assert.assertFalse(dataSourceService.isNameExist("test"));
        } catch (Exception e) {
            Assert.assertNotNull(e);
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testIsNameExist() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        try {
//            Assert.assertTrue(dataSourceService.isNameExist("test"));
        } catch (Exception e) {
            Assert.assertNotNull(e);
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testGetDefineWithNotExistDs() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        Assert.assertNull(dataSourceService.getDsDefine("abc"));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDefineWithEmptyDir() throws Exception {
        Mockito.doReturn(null).when(fileService).ls("null/null");
        Assert.assertNull(dataSourceService.getDsDefine("abc"));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDefine() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        Mockito.doReturn(SerializationUtils.serialize(new DataSourceDefine())).when(fileService)
                .read("null/null/test");
//        Assert.assertNotNull(dataSourceService.getDsDefine("test"));
    }
    
    /**
     * 
     */
    @Test
    public void testListAllWithNullDir() throws Exception {
        Mockito.doReturn(null).when(fileService).ls("null/null");
        Assert.assertEquals(0, dataSourceService.listAll().length);
    }
    
    /**
     * 
     */
    @Test
    public void testListAllWithEmptyDir() throws Exception {
        Mockito.doReturn(new String[] {}).when(fileService).ls("null/null");
        Assert.assertEquals(0, dataSourceService.listAll().length);
    }
    
    /**
     * 
     */
    @Test
    public void testListAll() throws Exception {
        Mockito.doReturn(new String[] { "test" }).when(fileService).ls("null/null");
        Mockito.doReturn(SerializationUtils.serialize(new DataSourceDefine())).when(fileService)
                .read("null/null/test");
        Assert.assertNotNull(dataSourceService.listAll());
//        Assert.assertEquals(1, dataSourceService.listAll().length);
    }
    
    /**
     * 
     */
    @Test
    public void testIsValidateConnWithNull() {
        Assert.assertFalse(dataSourceService.isValidateConn(null));
    }
    
    /**
     * 
     */
    @Test
    public void testIsValidateConnWithInvalidDs() {
        Assert.assertFalse(dataSourceService.isValidateConn(new DataSourceDefine()));
    }
    
    /**
     * 
     */
    @Test
    public void testRemoveDsWithEmptyDir() throws Exception {
        Mockito.doReturn(null).when(fileService).ls("null/null");
        try {
            dataSourceService.removeDataSource("abc");
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRemoveDs() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        Mockito.doReturn(SerializationUtils.serialize(new DataSourceDefine())).when(fileService)
                .read("null/null/test");
        Mockito.doReturn(true).when(fileService).rm("null/null/test");
        try {
            Assert.assertTrue(dataSourceService.removeDataSource("test"));
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRemoveDsFailed() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        Mockito.doReturn(SerializationUtils.serialize(new DataSourceDefine())).when(fileService)
                .read("null/null/test");
        Mockito.doReturn(false).when(fileService).rm("null/null/test");
        try {
            Assert.assertFalse(dataSourceService.removeDataSource("test"));
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRemoveDsThrow() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        Mockito.doReturn(SerializationUtils.serialize(new DataSourceDefine())).when(fileService)
                .read("null/null/test");
        Mockito.doThrow(DataSourceOperationException.class).when(fileService).rm("null/null/test");
        try {
            dataSourceService.removeDataSource("test");
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSaveOrUpdateDsWithNullDs() {
        try {
            dataSourceService.saveOrUpdateDataSource(null);
            Assert.fail();
        } catch (DataSourceOperationException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSaveOrUpdateDsWithInvalidDs() {
        try {
            dataSourceService.saveOrUpdateDataSource(new DataSourceDefine());
            Assert.fail();
        } catch (DataSourceOperationException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSaveOrUpdateDsWithInvalidDsName() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        try {
            DataSourceDefine ds = new DataSourceDefine();
            ds.setProductLine("test");
            ds.setName("test");
            ds.setId("abc");
            dataSourceService.saveOrUpdateDataSource(ds);
            Assert.fail();
        } catch (DataSourceOperationException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSaveOrUpdateDsWithInvalidConn() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        try {
            DataSourceDefine ds = new DataSourceDefine();
            ds.setProductLine("test");
            ds.setName("test");
            ds.setId("test");
            dataSourceService.saveOrUpdateDataSource(ds);
            Assert.fail();
        } catch (DataSourceOperationException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSaveOrUpdateDsWithValidConn() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        DataSourceDefine ds = new DataSourceDefine();
        ds.setProductLine("test");
        ds.setName("test");
        ds.setId("test");
        ds.setHostAndPort("localhost:8080");
        PowerMockito.mockStatic(DBInfoReader.class);
        BDDMockito.given(
                DBInfoReader.build(Mockito.any(DatasourceType.class), Mockito.anyString(),
                        Mockito.anyString(), Mockito.anyString())).willReturn(null);
        Mockito.doReturn(true).when(fileService)
            .write("null/test_test", SerializationUtils.serialize(ds));
        try {
            Assert.assertNotNull(dataSourceService.saveOrUpdateDataSource(ds));
        } catch (DataSourceOperationException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSaveOrUpdateDsThrowException() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        DataSourceDefine ds = new DataSourceDefine();
        ds.setProductLine("test");
        ds.setName("test");
        ds.setId("test");
        ds.setHostAndPort("localhost:8080");
        PowerMockito.mockStatic(DBInfoReader.class);
        BDDMockito.given(
                DBInfoReader.build(Mockito.any(DatasourceType.class), Mockito.anyString(),
                        Mockito.anyString(), Mockito.anyString())).willReturn(null);
        Mockito.doThrow(Exception.class).when(fileService)
            .write("null/test_test", SerializationUtils.serialize(ds));
        try {
            dataSourceService.saveOrUpdateDataSource(ds);
//            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testInvokeSaveOrUpdateDsWhenModifiedDsName() throws Exception {
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        DataSourceDefine ds = new DataSourceDefine();
        ds.setProductLine("test");
        ds.setName("test");
        ds.setId("test");
        ds.setHostAndPort("localhost:8080");
        Mockito.doReturn(new String[] { "test", "abcdefg" }).when(fileService).ls("null/null");
        DataSourceDefine oldDefine = Mockito.mock(DataSourceDefine.class);
        Mockito.doReturn(SerializationUtils.serialize(oldDefine)).when(fileService)
                .read("null/null/test");
        Mockito.doReturn("abc").when(oldDefine).getName();
        PowerMockito.mockStatic(DBInfoReader.class);
        BDDMockito.given(
                DBInfoReader.build(Mockito.any(DatasourceType.class), Mockito.anyString(),
                        Mockito.anyString(), Mockito.anyString())).willReturn(null);
        Mockito.doThrow(Exception.class).when(fileService)
                .write("null/test_test", SerializationUtils.serialize(ds));
        try {
            dataSourceService.saveOrUpdateDataSource(ds);
//            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
}
