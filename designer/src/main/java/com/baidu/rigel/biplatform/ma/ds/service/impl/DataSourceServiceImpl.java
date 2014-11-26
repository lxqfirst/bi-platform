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
package com.baidu.rigel.biplatform.ma.ds.service.impl;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.SerializationUtils;

import com.baidu.rigel.biplatform.ma.ds.exception.DataSourceOperationException;
import com.baidu.rigel.biplatform.ma.ds.service.DataSourceService;
import com.baidu.rigel.biplatform.ma.file.client.service.FileService;
import com.baidu.rigel.biplatform.ma.file.client.service.FileServiceException;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.utils.DBInfoReader;
import com.baidu.rigel.biplatform.ma.model.utils.DBUrlGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.utils.ContextManager;

/**
 * 
 * 数据源服务实现类
 * 
 * @author david.wang
 *
 */
@Service("dsService")
public class DataSourceServiceImpl implements DataSourceService {
    
    /**
     * logger 
     */
    private Logger logger = LoggerFactory.getLogger(DataSourceService.class);
    
    /**
     * 文件服务接口
     */
    @Resource(name = "fileService")
    private FileService fileService;
    
    @Value("${biplatform.ma.ds.location}")
    private String dsFileBaseDir;
    
    /**
     * 构造函数
     * 
     * @param productLine
     */
    public DataSourceServiceImpl() {
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public synchronized DataSourceDefine saveOrUpdateDataSource(DataSourceDefine ds)
            throws DataSourceOperationException {
        
        checkDataSourceDefine(ds);
        try {
            // 如果修改了数据源的名称，则先写新的数据源，然后删除原来的数据源文件
            DataSourceDefine oldDs = getDsDefine(ds.getId());
            String oldDsFileName = null;
            if (oldDs != null && !oldDs.getName().equals(ds.getName())) { // 修改了数据源名称
                oldDsFileName = getDsFileName(oldDs);
                if (this.isNameExist(ds.getName())) {
                    throw new DataSourceOperationException("name already exist : " + ds.getName());
                }
            }
            String fileName = getDsFileName(ds);
            boolean rmOperResult = false;
            if (oldDsFileName != null) { // 此处操作意味用户做了修改数据源名称操作
                rmOperResult = fileService.rm(oldDsFileName);
            }
            if (oldDsFileName == null || rmOperResult) { // 删除操作成功
                fileService.write(fileName, SerializationUtils.serialize(ds));
            }
        } catch (Exception e) {
            // 如果发生异常 考虑回滚或者其他容错操作
            logger.error(e.getMessage(), e);
            throw new DataSourceOperationException("Error Happend for save or update datasource :"
                    + e);
        }
        return ds;
    }
    
    /**
     * 校验数据源合法性 不合法抛出异常
     * 
     * @param ds
     * @throws DataSourceOperationException
     */
    private void checkDataSourceDefine(DataSourceDefine ds) throws DataSourceOperationException {
        if (ds == null) {
            logger.error("datasource can not be null");
            throw new DataSourceOperationException("datasource can not be null");
        }
        if (StringUtils.isBlank(ds.getProductLine())) {
            logger.error("product line can not be null");
            throw new DataSourceOperationException("product line can not be null");
        }
        // 名称一样，id不同认为是新加重名数据源，如果名称，id均相同，则认为是修改数据源
        if (isNameExist(ds.getName()) && !isNameExist(ds.getId())) {
            logger.debug("ds name alread exist");
            throw new DataSourceOperationException("ds name alread exist");
        }
        /*
         * modified by jiangyichao 验证数据库连接字符串有效性 2014-08-12
         */
        if (!isValidateConn(ds)) {
            logger.debug("db connection info not correct");
            throw new DataSourceOperationException("db connection info not correct");
        }
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean isNameExist(String name) throws DataSourceOperationException {
        
        String dir = getDsFileStoreDir();
        try {
            String[] fileList = fileService.ls(dir);
            if (fileList == null || fileList.length == 0) {
                return false;
            }
            for (String fileName : fileList) {
                if (fileName.contains(name)) {
                    return true;
                }
            }
            return false;
        } catch (FileServiceException e) {
            logger.debug(e.getMessage(), e);
            throw new DataSourceOperationException(e);
        }
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean isValidateConn(DataSourceDefine ds) {
        DBInfoReader dBInfoReader = new DBInfoReader();
        try {
            // 创建数据库连接，如果不抛出异常，说明连接字符串正确，返回true
            DBInfoReader.build(ds.getType(), ds.getDbUser(), ds.getDbPwd(), DBUrlGeneratorUtils.getConnUrl(ds));
            return true;
        } catch (Exception e) {
            logger.debug(e.getMessage(), e);
        } finally {
            // 关闭数据库连接
            dBInfoReader.closeConn();
        }
        return false;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public DataSourceDefine[] listAll() throws DataSourceOperationException {
        String[] listFile = null;
        try {
            listFile = fileService.ls(getDsFileStoreDir());
        } catch (FileServiceException e) {
            logger.error(e.getMessage(), e);
            throw new DataSourceOperationException(e);
        }
        if (listFile == null || listFile.length == 0) {
            return new DataSourceDefine[0];
        }
        final List<DataSourceDefine> rs = buildResult(listFile);
        if (rs.size() != listFile.length) {
            return new DataSourceDefine[0];
        }
        return rs.toArray(new DataSourceDefine[0]);
    }
    
    /**
     * 
     * 将文件列表转换为数据源定义
     * 
     * @param productLine
     * @param listFile
     * @return
     */
    private List<DataSourceDefine> buildResult(final String[] listFile) {
        final List<DataSourceDefine> rs = new ArrayList<DataSourceDefine>();
        for (final String f : listFile) {
            try {
                DataSourceDefine ds = buildResult(f);
                rs.add(ds);
            } catch (FileServiceException e) {
                logger.debug(e.getMessage(), e);
            }
        }
        logger.info("read file successfully");
        return rs;
    }
    
    /**
     * 
     * 将文件列表转换为数据源定义
     * 
     * @param productLine
     * @param listFile
     * @return
     * @throws FileManageOperationException
     * @throws UnsupportedEncodingException
     */
    private DataSourceDefine buildResult(String file) throws FileServiceException {
        
        byte[] content = (byte[]) fileService.read(genDsFilePath(file));
        return (DataSourceDefine) SerializationUtils.deserialize(content);
    }
    
    /**
     * @param file
     * @return
     */
    private String genDsFilePath(String file) {
        return getDsFileStoreDir() + File.separator + file;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public DataSourceDefine getDsDefine(String id) throws DataSourceOperationException {
        String fileName = getDatasourceDefineNameByIdOrName(id);
        if (fileName == null) {
            return null;
        }
        try {
            return buildResult(fileName);
        } catch (FileServiceException e) {
            logger.error("error : " + e.getMessage());
            throw new DataSourceOperationException("未找到正确的数据源定义信息", e);
        }
    }
    
    /**
     * 依据数据源id或者name获取数据源定义
     * 
     * @param idOrName
     * @return
     */
    private String getDatasourceDefineNameByIdOrName(String idOrName) {
        String dir = getDsFileStoreDir();
        String[] ds = null;
        try {
            ds = fileService.ls(dir);
        } catch (FileServiceException e1) {
            logger.debug(e1.getMessage(), e1);
        }
        if (ds == null || ds.length == 0) {
            String msg = "can not get ds define by id : " + idOrName;
            logger.error(msg);
            return null;
        }
        Set<String> tmp = new HashSet<String>();
        Collections.addAll(tmp, ds);
        Set<String> dict = new HashSet<String>();
        tmp.stream().map((String s) -> {
            return s.split("_");
        }).forEach((String[] ids) ->{
            Collections.addAll(dict, ids);
        });
        if (!dict.contains(idOrName)) {
            return null;
        }
        
        String fileName = null;
        for (String dsFileName : ds) {
            if (dsFileName.contains(idOrName)) {
                fileName = dsFileName;
                break;
            }
        }
        return fileName;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean removeDataSource(String id) throws DataSourceOperationException {
        DataSourceDefine ds = getDsDefine(id);
        if (ds == null) {
            String msg = "cant't get ds define info by id : " + id;
            logger.error(msg);
            throw new DataSourceOperationException("不能通过指定数据源id找到数据源定义： id ＝ " + id);
        }
        try {
            return fileService.rm(genDsFilePath(getDatasourceDefineNameByIdOrName(id)));
        } catch (FileServiceException e) {
            logger.error(e.getMessage(), e);
            throw new DataSourceOperationException(e);
        }
    }
    
    /**
     * 获取数据源文件的文件名（含路径）
     * 
     * @param ds
     * @return 返回数据源定义文件文件名（绝对路径）
     */
    private String getDsFileName(DataSourceDefine ds) {
        return getDsFileStoreDir() + File.separator + ds.getId() + "_" + ds.getName();
    }
    
    /**
     * 获取数据源的存储路径
     * 
     * @return
     */
    private String getDsFileStoreDir() {
        String productLine = ContextManager.getProductLine();
        String basePath = productLine + File.separator + dsFileBaseDir;
        return basePath;
    }

    public FileService getFileService() {
        return fileService;
    }

    /**
     * 
     * @param fileService
     * 
     */
    public void setFileService(FileService fileService) {
        this.fileService = fileService;
    }
    
}
