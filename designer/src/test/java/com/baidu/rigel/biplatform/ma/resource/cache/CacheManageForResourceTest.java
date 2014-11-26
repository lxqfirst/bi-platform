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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.cache.Cache;
import org.springframework.cache.Cache.ValueWrapper;
import org.springframework.cache.CacheManager;

/**
 * test class
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class CacheManageForResourceTest {
    
    @InjectMocks
    CacheManagerForResource resource = new CacheManagerForResource();
    
    @Mock
    CacheManager cacheManager;
  
    /**
     * 
     */
    @Test
    public void testGetFromCacheWithNullCache() {
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Mockito.doReturn(null).when(cacheManager).getCache("bi_platform");
        Object rs = resource.getFromCache("test");
        Assert.assertNull(rs);
    }
    
    /**
     * 
     */
    @Test
    public void testGetFromCacheWithNullValue() {
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Cache cache = Mockito.mock(Cache.class);
        Mockito.doReturn(cache).when(cacheManager).getCache("bi_platform");
        Object rs = resource.getFromCache("test");
        Assert.assertNull(rs);
    }
    
    /**
     * 
     */
    @Test
    public void testGetFromCacheWithNullObject() {
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Cache cache = Mockito.mock(Cache.class);
        ValueWrapper wrapper = Mockito.mock(ValueWrapper.class);
        Mockito.doReturn(wrapper).when(cache).get("test");
        Mockito.doReturn(cache).when(cacheManager).getCache("bi_platform");
        Object rs = resource.getFromCache("test");
        Assert.assertNull(rs);
    }
    
    /**
     * 
     */
    @Test
    public void testGetFromCache() {
        Cache cache = Mockito.mock(Cache.class);
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Mockito.doReturn(cache).when(this.cacheManager).getCache("bi_platform");
        ValueWrapper wrapper = Mockito.mock(ValueWrapper.class);
        Mockito.doReturn(wrapper).when(cache).get("test");
        Assert.assertNotNull(cache.get("test"));
        Mockito.doReturn("test").when(wrapper).get();
        Assert.assertEquals("test", wrapper.get());
        Object rs = this.resource.getFromCache("test");
        Assert.assertNotNull(rs);
    }
    
    /**
     * 
     */
    @Test
    public void testSetToCacheWithEmptyKey() {
        Cache cache = Mockito.mock(Cache.class);
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Mockito.doReturn(cache).when(this.cacheManager).getCache("bi_platform");
        try {
            this.resource.setToCache(null, new Object());
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
        try {
            this.resource.setToCache("", new Object());
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testSetToCache() {
        Cache cache = Mockito.mock(Cache.class);
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Mockito.doReturn(cache).when(cacheManager).getCache("bi_platform");
        try {
            this.resource.setToCache("test", "test");
        } catch (Exception e) {
            e.printStackTrace();
            Assert.fail();
        }
    }
    
    /**
     * 
     */
    @Test
    public void testDeleteFromCacheWithEmptyKey() {
        Cache cache = Mockito.mock(Cache.class);
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Mockito.doReturn(cache).when(this.cacheManager).getCache("bi_platform");
        try {
            this.resource.deleteFromCache(null);
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
        try {
            this.resource.deleteFromCache("");
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testDeleteFromCache() {
        Cache cache = Mockito.mock(Cache.class);
        cacheManager = Mockito.mock(CacheManager.class);
        resource.setCacheManager(cacheManager);
        Mockito.doReturn(cache).when(this.cacheManager).getCache("bi_platform");
        try {
            this.resource.deleteFromCache("test");
        } catch (Exception e) {
            Assert.fail();
        }
    }
}
