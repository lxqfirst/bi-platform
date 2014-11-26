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
package com.baidu.rigel.biplatform.ma.model.service.impl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ma.ds.exception.DataSourceOperationException;
import com.baidu.rigel.biplatform.ma.ds.service.DataSourceService;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.meta.ColumnInfo;
import com.baidu.rigel.biplatform.ma.model.meta.ColumnMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.FactTableMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.TableInfo;
import com.baidu.rigel.biplatform.ma.model.service.CubeBuildService;
import com.baidu.rigel.biplatform.ma.model.utils.DBInfoReader;
import com.baidu.rigel.biplatform.ma.model.utils.DBUrlGeneratorUtils;
import com.baidu.rigel.biplatform.ma.model.utils.RegExUtils;
import com.google.common.collect.Lists;

/**
 * 
 * 立方体构建服务
 * @author zhongyi
 *
 *         2014-8-1
 */
@Service("cubeBuildService")
public class CubeBuildServiceImpl implements CubeBuildService {
    
    /**
     * dsService
     */
    @Resource
    private DataSourceService dsService;
    
    /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(CubeBuildServiceImpl.class);
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.model.service.CubeBuildService#getAllTable
     * (java.lang.String)
     */
    @Override
    public List<TableInfo> getAllTable(String dsId) throws DataSourceOperationException {
        DataSourceDefine ds = null;
        try {
            ds = dsService.getDsDefine(dsId);
        } catch (DataSourceOperationException e) {
            logger.error("Fail in get ds by id: " + dsId, e);
            throw e;
        }
        DBInfoReader reader = DBInfoReader.build(ds.getType(), ds.getDbUser(), ds.getDbPwd(),
                DBUrlGeneratorUtils.getConnUrl(ds));
        try {
            List<TableInfo> tables = reader.getAllTableInfos();
            return tables;
        } finally {
            reader.closeConn();
        }
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.model.service.CubeBuildService#initCubeTables
     * (java.util.List, java.util.List)
     */
    @Override
    public List<FactTableMetaDefine> initCubeTables(String dsId, List<String> tableIds,
            List<String> regxs) throws DataSourceOperationException {
        
        List<FactTableMetaDefine> tableMetas = Lists.newArrayList();
        Map<String, String[]> tableMap = RegExUtils.regExTableName(tableIds, regxs);
        
        DataSourceDefine ds = null;
        try {
            ds = dsService.getDsDefine(dsId);
        } catch (DataSourceOperationException e) {
            logger.info("can not get datasource define with id : " + dsId, e);
            throw e;
        }
        DBInfoReader reader = DBInfoReader.build(ds.getType(), ds.getDbUser(), ds.getDbPwd(),
                    DBUrlGeneratorUtils.getConnUrl(ds));
        try {
            for (String key : tableMap.keySet()) {
                String[] tables = tableMap.get(key);
                FactTableMetaDefine tableMeta = null;
                if ("other".equals(key)) {
                    for (String table : tables) {
                        tableMeta = new FactTableMetaDefine();
                        tableMeta.setCubeId(table);
                        tableMeta.setName(table);
                        tableMeta.setMutilple(false);
                        List<ColumnInfo> cols = reader.getColumnInfos(table);
                        addColumnToTableMeta(tableMeta, cols);
                        tableMetas.add(tableMeta);
                    }
                } else {
                    tableMeta = new FactTableMetaDefine();
                    tableMeta.setCubeId(key);
                    tableMeta.setName(key);
                    tableMeta.setMutilple(true);
                    tableMeta.setRegExp(key);
                    if (tables != null && tables.length > 0) {
                        String tableExample = tables[0];
                        List<ColumnInfo> cols = reader.getColumnInfos(tableExample);
                        addColumnToTableMeta(tableMeta, cols);
                    }
                    tableMetas.add(tableMeta);
                }
            }
        } finally {
            reader.closeConn();
        }
        return tableMetas;
    }
    
    private void addColumnToTableMeta(FactTableMetaDefine tableMeta, List<ColumnInfo> cols) {
        for (ColumnInfo col : cols) {
            ColumnMetaDefine column = new ColumnMetaDefine();
            column.setName(col.getId());
            column.setCaption(col.getName());
            tableMeta.addColumn(column);
        }
    }
}