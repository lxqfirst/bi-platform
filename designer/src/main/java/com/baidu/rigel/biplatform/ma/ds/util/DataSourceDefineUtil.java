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
package com.baidu.rigel.biplatform.ma.ds.util;

import java.io.File;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo.DataBase;
import com.baidu.rigel.biplatform.ma.comm.util.ConfigUtil;
import com.baidu.rigel.biplatform.ma.model.consts.DatasourceType;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.utils.DBUrlGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.utils.ContextManager;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 
 * 数据源定义工具类：用于生成存储文件id
 * 
 * @author david.wang
 *
 */
public class DataSourceDefineUtil {
    
    /**
     * LOGGER
     */
    private static Logger logger = LoggerFactory.getLogger(DataSourceDefineUtil.class);
    
    /**
     * 获取数据源文件的文件名（含路径）
     * 
     * @param ds
     * @return 返回数据源定义文件文件名（绝对路径）
     */
    public static String getDsFileName(DataSourceDefine ds) {
        String basePath = getDsFileStoreDir();
        return basePath + File.separator + ds.getId() + "_" + ds.getName();
    }
    
    /**
     * 获取数据源的存储路径
     * 
     * @return
     */
    public static String getDsFileStoreDir() {
        String productLine = ContextManager.getProductLine();
        String basePath = productLine + File.separator + ConfigUtil.getDsBaseDir();
        return basePath;
    }

    /**
     * 生成SqlDataSourceInfo
     * 
     * @param dsDefine 数据源定义
     * @return SqlDataSourceInfo
     */
    public static SqlDataSourceInfo parseToDataSourceInfo(DataSourceDefine dsDefine) {
        SqlDataSourceInfo dsInfo = new SqlDataSourceInfo(dsDefine.getId());
        dsInfo.setDataBase(parseToDataBase(dsDefine.getType()));
        dsInfo.setDBProxy(true);
        try {
            dsInfo.setPassword(dsDefine.getDbPwd());
        } catch (Exception e) {
            logger.error("Encrypt password Fail !!", e);
            throw new RuntimeException(e);
        }
        dsInfo.setUsername(dsDefine.getDbUser());
        dsInfo.setProductLine(dsDefine.getProductLine());
        dsInfo.setInstanceName(dsDefine.getDbInstance());
        dsInfo.setDataSourceKey(dsDefine.getName());
        dsInfo.setDBProxy(true);
        List<String> urls = Lists.newArrayList();
        urls.add(DBUrlGeneratorUtils.getConnUrl(dsDefine));
        dsInfo.setJdbcUrls(urls);
        List<String> hosts = Lists.newArrayList();
        hosts.add(dsDefine.getHostAndPort());
        dsInfo.setHosts(hosts);
        dsInfo.setDbPoolInfo(Maps.newHashMap());
        return dsInfo;
    }
    
    private static DataBase parseToDataBase(DatasourceType dsType) {
        switch (dsType) {
            case MYSQL:
                return DataBase.MYSQL;
            case ORACLE:
                return DataBase.ORACLE;
            default:
                return DataBase.OTHER;
        }
    }
}
