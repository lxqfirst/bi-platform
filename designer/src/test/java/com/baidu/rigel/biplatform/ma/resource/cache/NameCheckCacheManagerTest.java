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
package com.baidu.rigel.biplatform.ma.resource.cache;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

/**
 * 
 * test class
 * @author david.wang
 * @version 1.0.0.1
 */
public class NameCheckCacheManagerTest {
    
    /**
     * 
     */
    @Test
    public void testNoExistsReportName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        Mockito.doReturn(null).when(resource).getFromCache("REPORT_NAME__null_test");
        Assert.assertFalse(nameCheckCacheManager.existsReportName("test"));
    }
    
    /**
     * 
     */
    @Test
    public void testExistsReportName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        Mockito.doReturn("test").when(resource).getFromCache("REPORT_NAME__null_test");
        Assert.assertTrue(nameCheckCacheManager.existsReportName("test"));
    }
    
    /**
     * 
     */
    @Test
    public void testUseReportName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        try {
            nameCheckCacheManager.useReportName("test");
        } catch (Throwable e) {
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testUseReportNameWithEmptyName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        try {
            nameCheckCacheManager.useReportName(null);
            Assert.fail();
        } catch (Throwable e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testNoExistsDSName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        Mockito.doReturn(null).when(resource).getFromCache("null_test");
        Assert.assertFalse(nameCheckCacheManager.existsDSName("test"));
    }
    
    /**
     * 
     */
    @Test
    public void testExistsDSName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        Mockito.doReturn("test").when(resource).getFromCache("null_test");
        Assert.assertTrue(nameCheckCacheManager.existsDSName("test"));
    }
    
    /**
     * 
     */
    @Test
    public void testUseDsName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        try {
            nameCheckCacheManager.useDSName("test");
        } catch (Throwable e) {
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testUseDSNameWithEmptyName() {
        NameCheckCacheManager nameCheckCacheManager = new NameCheckCacheManager();
        CacheManagerForResource resource = Mockito.mock(CacheManagerForResource.class);
        nameCheckCacheManager.setCacheManagerForResource(resource);
        try {
            nameCheckCacheManager.useDSName(null);
            Assert.fail();
        } catch (Throwable e) {
            Assert.assertNotNull(e);
        }
    }
    
}
