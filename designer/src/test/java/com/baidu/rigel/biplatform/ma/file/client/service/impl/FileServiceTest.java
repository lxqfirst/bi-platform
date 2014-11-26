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
package com.baidu.rigel.biplatform.ma.file.client.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mockito;

import com.baidu.rigel.biplatform.ma.common.file.protocol.Request;
import com.baidu.rigel.biplatform.ma.file.client.service.FileServiceException;

/**
 *
 * test class
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class FileServiceTest {
    
    /**
     * FileService
     */
    FileServiceImpl fileService = new FileServiceImpl();
    
    /**
     * RequestProxy
     */
    RequestProxy requestProxy;
    
    /**
     * 
     */
    @Before
    public void before() {
        requestProxy = Mockito.mock(RequestProxy.class);
        fileService.setRequestProxy(requestProxy);
    }
    
    /**
     * 
     */
    @Test
    public void testLsWithEmptyDir() {
        try {
            fileService.ls(null);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     * @throws Exception
     */
    @Test
    public void testLsOperationFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, null);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.ls("test");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     * @throws Exception
     */
    @Test
    public void testLsOperationFailedResponse() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.ls("test");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     * @throws Exception
     */
    @Test
    public void testLs() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        rs.put(FileServiceImpl.MSG, "success");
        rs.put("fileList", new String[] { "a", "b" });
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            String[] list = fileService.ls("test");
            Assert.assertNotNull(list);
            Assert.assertEquals(2, list.length);
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testCopyWithEmptySrcPath() {
        try {
            fileService.copy(null, "abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testCopyWithEmptyTargetPath() {
        try {
            fileService.copy("abc", "");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testCopySuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            Assert.assertTrue(fileService.copy("a", "abc"));
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testCopyFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.copy(null, "abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testCopyThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.copy("a", "abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMvWithEmptySrcPath() {
        try {
            fileService.mv(null, "abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMvWithEmptyTargetPath() {
        try {
            fileService.mv("abc", "");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMvSuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            Assert.assertTrue(fileService.mv("a", "abc"));
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMvFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.mv(null, "abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMvThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.mv("a", "abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirsWithEmptySrcPath() {
        try {
            fileService.mkdirs(null);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirsSuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            Assert.assertTrue(fileService.mkdirs("abc"));
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkidrsFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.mkdirs("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirsThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.mkdirs("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirWithEmptySrcPath() {
        try {
            fileService.mkdir(null);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirSuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            Assert.assertTrue(fileService.mkdir("abc"));
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkidrFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.mkdir("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testMkdirThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.mkdir("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRmWithEmptySrcPath() {
        try {
            fileService.rm(null);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRmSuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            Assert.assertTrue(fileService.rm("abc"));
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRmFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.rm("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testRmThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.rm("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testWriteSuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            Assert.assertTrue(fileService.write("abc", new byte[0]));
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testWriteFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.write("abc", new byte[0]);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testWriteThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.write("abc", new byte[0]);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testWriteEmptySrcPath() {
        try {
            fileService.write(null, "abc".getBytes());
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testReadWithEmptyTargetPath() {
        try {
            fileService.read(null);
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testReadDir() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        rs.put("type", "dir");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.read("a");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testReadSuccessfully() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.SUCCESS);
        rs.put("data", new byte[0]);
        rs.put("type", "file");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            byte[] tmp = fileService.read("a");
            Assert.assertNotNull(tmp);
            Assert.assertEquals(0, tmp.length);
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testReadFailed() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doReturn(rs).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.read("abc");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testReadThrowException() throws Exception {
        Map<String, Object> rs = new HashMap<String, Object>();
        rs.put(FileServiceImpl.RESULT, FileServiceImpl.FAIL);
        rs.put(FileServiceImpl.MSG, "failed");
        Mockito.doThrow(FileServiceException.class).when(requestProxy)
                .doActionOnRemoteFileSystem(Mockito.any(Request.class));
        try {
            fileService.read("a");
            Assert.fail();
        } catch (FileServiceException e) {
            Assert.assertNotNull(e);
        }
    }
}
