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
package com.baidu.rigel.biplatform.tesseract.store.service.impl;

import java.util.EventObject;
import java.util.concurrent.locks.Lock;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.tesseract.store.service.StoreManager;
import com.baidu.rigel.biplatform.tesseract.util.isservice.LogInfoConstants;
import com.hazelcast.config.ClasspathXmlConfig;
import com.hazelcast.config.Config;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.IQueue;
import com.hazelcast.core.ITopic;
import com.hazelcast.spring.cache.HazelcastCacheManager;

/**
 * 
 * StoreManager 实现类 <li>动态加载hazelcast的配置启动hazelcast集群</li>
 * 
 * @author lijin
 */

// TODO 需要通过factory返回StoryManager的实例，不要直接用Spring的注解 --Add by xiaoming.chen
@Service("hazelcastStoreManager")
public class HazelcastStoreManager implements StoreManager {
    private static final Logger LOGGER = LoggerFactory.getLogger(HazelcastStoreManager.class);
    
    /**
     * cacheManager
     */
    private CacheManager cacheManager;
    
    /**
     * hazelcast
     */
    private HazelcastInstance hazelcast;
    
    /**
     * 通过加载HZ的配置文件，动态创建HZ集群
     * 
     * @param configPath
     *            hz的配置文件
     */
    public HazelcastStoreManager(String configPath) {
        Config cfg = new ClasspathXmlConfig(configPath);
        this.hazelcast = Hazelcast.newHazelcastInstance(cfg);
        this.cacheManager = new HazelcastCacheManager(this.hazelcast);
    }
    
    /**
     * constructor 采用默认配置文件
     */
    public HazelcastStoreManager() {
        this("conf/applicationContext-hazelcast.xml");
    }
    
    @Override
    public Cache getDataStore(String name) {
        Cache cache = cacheManager.getCache(name);
        return cache;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.store.service.StoreManager#putEvent
     * (java.util.EventObject)
     */
    @Override
    public void putEvent(EventObject event) throws Exception {
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "putEvent",
            "[event:" + event + "]"));
        if (event == null) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION, "putEvent",
                "[event:" + event + "]"));
            throw new IllegalArgumentException();
        }
        IQueue<EventObject> queue = this.hazelcast.getQueue("eventQueue");
        try {
            queue.put(event);
        } catch (InterruptedException e) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION, "putEvent",
                "[event:" + event + "]"));
            throw e;
        }
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "putEvent", "[event:"
            + event + "]"));
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.store.service.StoreManager#getNextEvent
     * ()
     */
    @Override
    public EventObject getNextEvent() throws Exception {
        IQueue<EventObject> queue = this.hazelcast.getQueue("eventQueue");
        return queue.take();
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.store.service.StoreManager#postEvent
     * (java.util.EventObject)
     */
    @Override
    public void postEvent(EventObject event) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "postEvent",
            "[event:" + event + "]"));
        if (event == null) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "postEvent", "[event:" + event + "]"));
            throw new IllegalArgumentException();
        }
        ITopic<Object> topics = this.hazelcast.getTopic("topics");
        topics.publish(event);
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "postEvent",
            "[event:" + event + "]"));
    }
    
    public Lock getClusterLock() {
        Lock lock = this.hazelcast.getLock("hzLock");
        
        return lock;
    }
    
}
