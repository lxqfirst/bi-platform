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
package com.baidu.rigel.biplatform.ac.util;

import java.io.IOException;
import java.util.Properties;

import org.springframework.core.io.support.PropertiesLoaderUtils;

/**
 * 服务器配置信息，暂时只有Tesseract服务器地址配置
 * 
 * @author xiaoming.chen
 *
 */
public class ConfigInfoUtils {

    private static final String DEFAULT_SERVER_ADDRESS = "http://127.0.0.1:8080";
    /**
     * serverAddress
     */
    private static String SERVERADDRESS = null;

    static {
        try {
            Properties properties = PropertiesLoaderUtils.loadAllProperties("/config/ac.properties");
            SERVERADDRESS = properties.getProperty("server.tesseract.address", DEFAULT_SERVER_ADDRESS);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * 设置服务器地址
     * 
     * @param serverAddress Tesseract服务器地址
     */
    public static void setServerAddress(String serverAddress) {
        ConfigInfoUtils.SERVERADDRESS = serverAddress;
    }

    /**
     * get sERVERADDRESS
     * 
     * @return the sERVERADDRESS
     */
    public static String getServerAddress() {
        return SERVERADDRESS;
    }

}
