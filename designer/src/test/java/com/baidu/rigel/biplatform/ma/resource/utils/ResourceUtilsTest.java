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
package com.baidu.rigel.biplatform.ma.resource.utils;

import org.junit.Assert;
import org.junit.Test;

import com.baidu.rigel.biplatform.ma.resource.ResponseResult;

/**
 * Rest 结果封装工具测试类
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class ResourceUtilsTest {
    
    /**
     * 
     */
    @Test
    public void testGetResultWithNullData() {
        ResponseResult rs = ResourceUtils.getResult("success", "failed", null);
        Assert.assertNotNull(rs);
        Assert.assertEquals(ResponseResult.FAILED, rs.getStatus());
        Assert.assertEquals("failed", rs.getStatusInfo());
    }
    
    /**
     * 
     */
    @Test
    public void testGetResult() {
        ResponseResult rs = ResourceUtils.getResult("success", "failed", "data");
        Assert.assertNotNull(rs);
        Assert.assertEquals(ResponseResult.SUCCESS, rs.getStatus());
        Assert.assertEquals("success", rs.getStatusInfo());
        Assert.assertEquals("data", rs.getData());
    }
    
    /**
     * 
     */
    @Test
    public void testGetErrorResult() {
        ResponseResult rs = ResourceUtils.getErrorResult("failed", ResponseResult.FAILED);
        Assert.assertNotNull(rs);
        Assert.assertEquals(ResponseResult.FAILED, rs.getStatus());
        Assert.assertEquals("failed", rs.getStatusInfo());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCorrectResult() {
        ResponseResult rs = ResourceUtils.getCorrectResult("success", "data");
        Assert.assertNotNull(rs);
        Assert.assertEquals(ResponseResult.SUCCESS, rs.getStatus());
        Assert.assertEquals("success", rs.getStatusInfo());
        Assert.assertEquals("data", rs.getData());
    }
}
