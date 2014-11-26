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
package com.baidu.rigel.biplatform.ma.report.utils;

import com.baidu.rigel.biplatform.ma.utils.ThreadLocalResourceHolder;

/**
 * 
 * 上下文管理器
 * 
 * @author zhongyi
 *
 *         2014-8-13
 */
public class ContextManager {
    
    /**
     * SESSOIN_ID
     */
    private static final String SESSOIN_ID = "sessionID";
    
    /**
     * PRODUCT_LINE
     */
    private static final String PRODUCT_LINE = "biplatform_productline";
    
    /**
     * 存入Session的key
     * 
     * @param sessionKey
     *            sessionKey
     */
    public static void setSessionId(String sessionId) {
        ThreadLocalResourceHolder.bindProperty(SESSOIN_ID, sessionId);
    }
    
    /**
     * 获取Session的key
     * 
     * @return sessionKey
     */
    public static String getSessionId() {
        return (String) ThreadLocalResourceHolder.getProperty(SESSOIN_ID);
    }
    
    /**
     * 清除SessionKey
     */
    public static void cleanSessionId() {
        ThreadLocalResourceHolder.unbindProperty(SESSOIN_ID);
    }
    
    /**
     * 
     * @param productLine
     */
    public static void setProductLine(String productLine) {
        ThreadLocalResourceHolder.bindProperty(PRODUCT_LINE, productLine);
    }
    
    /**
     * 
     * @return
     */
    public static String getProductLine() {
        return (String) ThreadLocalResourceHolder.getProperty(PRODUCT_LINE);
    }
    
    /**
     * 
     */
    public static void cleanProductLine() {
        ThreadLocalResourceHolder.unbindProperty(PRODUCT_LINE);
    }
    
}