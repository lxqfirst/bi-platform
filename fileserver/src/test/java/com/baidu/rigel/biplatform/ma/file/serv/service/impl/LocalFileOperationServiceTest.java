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
package com.baidu.rigel.biplatform.ma.file.serv.service.impl;

import java.io.File;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.modules.junit4.PowerMockRunner;

import com.baidu.rigel.biplatform.ma.file.serv.service.FileLocation;
import com.baidu.rigel.biplatform.ma.file.serv.service.impl.LocalFileOperationServiceImpl;
import com.baidu.rigel.biplatform.ma.file.serv.util.LocalFileOperationUtils;

/**
 * 
 * test class
 * @author david.wang
 * @version 1.0.0.1
 */
@RunWith(PowerMockRunner.class)
public class LocalFileOperationServiceTest {
    
    /**
     * 系统临时目录
     */
    private String dir = System.getProperty("user.dir");
    
    /**
     * 文件服务
     */
    private LocalFileOperationServiceImpl service = new LocalFileOperationServiceImpl(
            new FileLocation(dir));
    
    /**
     * 
     */
    @Test
    public void testGetFileAttributeWithEmptyPath() {
        Map<String, Object> rs = service.getFileAttributes(null);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("文件名称为空", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testGetFileAttributesWithUnexistFile() {
        File file = PowerMockito.mock(File.class);
        Mockito.when(file.exists()).thenReturn(false);
        Map<String, Object> rs = service.getFileAttributes(dir + "/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("文件不存在", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testFileIsDir() {
        File file = PowerMockito.mock(File.class);
        Mockito.when(file.exists()).thenReturn(true);
        Mockito.when(file.isDirectory()).thenReturn(true);
        Map<String, Object> rs = service.getFileAttributes(dir);
        Assert.assertNotNull(rs);
        Assert.assertEquals("success", rs.get("result"));
        Assert.assertEquals("directory", rs.get("type"));
    }
    
    /**
     * 
     */
    @Test
    public void testGetFileAttribute() {
        File file = PowerMockito.mock(File.class);
        Mockito.when(file.exists()).thenReturn(true);
        Mockito.when(file.isDirectory()).thenReturn(true);
        Map<String, Object> rs = service.getFileAttributes(dir);
        Assert.assertNotNull(rs);
    }
    
    /**
     * 
     */
    @Test
    public void testRmWithEmptyName() {
        Map<String, Object> rs = service.rm(null);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("文件路径为空", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testRmUnexistFile() {
        File file = PowerMockito.mock(File.class);
        Mockito.when(file.exists()).thenReturn(false);
        Map<String, Object> rs = service.rm(dir + "/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("删除文件不存在", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void tetRmFailed() {
        File file = PowerMockito.mock(File.class);
        Mockito.when(file.exists()).thenReturn(false);
        Map<String, Object> rs = service.rm(dir + "/");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("文件删除失败", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testRm() {
        service.mkdir(dir + "/test");
        Map<String, Object> rs = service.rm(dir + "/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("success", rs.get("result"));
        Assert.assertEquals("文件删除成功", rs.get("msg"));
        service.rm(dir + "/test");
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirWithEmptyPath() {
        Map<String, Object> rs = service.mkdir(null);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("目标地址为空", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void tetMkdirWithInvalidePath() {
        Map<String, Object> rs = service.mkdir(".");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("目标地址不能为[.]或者[..]", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void tetMkdirWithParentPath() {
        Map<String, Object> rs = service.mkdir("..");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("目标地址不能为[.]或者[..]", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void tetMkdirWithExistPath() {
        Map<String, Object> rs = service.mkdir(dir);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("目录已经存在", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testMkdir() {
        Map<String, Object> rs = service.mkdir(dir + "/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("success", rs.get("result"));
        Assert.assertEquals("创建目录成功", rs.get("msg"));
        service.rm(dir + "/test");
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirFailed() {
        Map<String, Object> rs = service.mkdir(dir + "/test/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("创建目录失败", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirs() {
        Map<String, Object> rs = service.mkdirs(dir + "/test/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("success", rs.get("result"));
        Assert.assertEquals("创建目录成功", rs.get("msg"));
        service.rm(dir + "/test/test");
    }
    
    /**
     * 
     */
    @Test
    public void testWriteWithEmptyPath() {
        Map<String, Object> rs = service.write(null, null, true);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("文件路径为null", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testWriteWithEmptyContent() {
        Map<String, Object> rs = service.write(dir + "/test", null, true);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("文件内容为空", rs.get("msg"));
        service.rm(dir + "/test");
    }
    
    /**
     * 
     */
    @Test
    public void testWriteWithNotOverride() {
        Map<String, Object> rs = service.write(dir, new byte[10], false);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("该文件已经存在", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testWrite() {
        Map<String, Object> rs = service.write(dir + "/test", new byte[10], false);
        Assert.assertNotNull(rs);
        Assert.assertEquals("success", rs.get("result"));
        Assert.assertEquals("新文件写入成功", rs.get("msg"));
        service.rm(dir + "/test");
    }
    
    /**
     * 
     */
    @Test
    public void testLsWithEmptyPath() {
        Map<String, Object> rs = service.ls(null);
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("请求路径为空", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testLsWithNotExistsPath() {
        Map<String, Object> rs = service.ls(dir + "/test/test");
        Assert.assertNotNull(rs);
        Assert.assertEquals("fail", rs.get("result"));
        Assert.assertEquals("请求路径不存在", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testLs() {
        Map<String, Object> rs = service.ls(dir);
        Assert.assertNotNull(rs);
        Assert.assertEquals("success", rs.get("result"));
        Assert.assertEquals("请求文件列表成功", rs.get("msg"));
    }
    
    /**
     * 
     */
    @Test
    public void testMv() {
        Map<String, Object> rs = LocalFileOperationUtils.mv(dir + "/test", "/test_mv", true);
        Assert.assertNotNull(rs);
    }
    
    /**
     * 
     */
    @Test
    public void testCopy() {
        Map<String, Object> rs = LocalFileOperationUtils.copy(dir + "/test", "/test_cp", true);
        Assert.assertNotNull(rs);
    }
}
