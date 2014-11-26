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
package com.baidu.rigel.biplatform.ma.comm.util;

import java.io.InputStream;
import java.util.Properties;

/**
 * 
 * 配置信息工具类
 * 
 * @author david.wang
 *
 */
public class ConfigUtil {
    
    /**
     * 配置信息内存缓存对象
     */
    private static final Properties DICT = new Properties();
    
    /**
     * 数据源默认存储目录
     */
    private static final String DATASOURCE_DEFAULT_BASE_DIR = "ds";
    
    /**
     * 报表模版默认存储目录
     */
    private static final String REPORT_DEFAULT_BASE_DIR = "report";
    
    static {
        InputStream is = null;
        try {
            is = ConfigUtil.class.getClassLoader().getResourceAsStream("application.properties");
            DICT.load(is);
        } catch (Throwable t) {
            throw new RuntimeException(t);
        } finally {
            if (is != null) {
                try {
                    is.close();
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }
    }
    
    /**
     * 构造函数
     */
    private ConfigUtil() {
    }
    
    /**
     * 获取系统持久化文件的根路径
     * 
     * @return 返回持久化文件的根路径，默认为/local
     */
    public static String getFileStoreLocation() {
        return DICT.getProperty("file_store_location", "/local");
    }
    
    /**
     * 获取数据源文件的默认存储路径
     * 
     * @return
     */
    public static String getDsBaseDir() {
        return DICT.getProperty("ds_default_dir", DATASOURCE_DEFAULT_BASE_DIR);
    }
    
    /**
     * 报表模版默认存储目录
     * 
     * @return
     */
    public static String getReportBaseDir() {
        return DICT.getProperty("report_default_dir", REPORT_DEFAULT_BASE_DIR);
    }
}
