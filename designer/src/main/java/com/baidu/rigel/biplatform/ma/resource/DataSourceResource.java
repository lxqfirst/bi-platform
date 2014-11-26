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
package com.baidu.rigel.biplatform.ma.resource;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.baidu.rigel.biplatform.ac.util.AesUtil;
import com.baidu.rigel.biplatform.ma.ds.exception.DataSourceOperationException;
import com.baidu.rigel.biplatform.ma.ds.service.DataSourceService;
import com.baidu.rigel.biplatform.ma.model.consts.DatasourceType;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.meta.TableInfo;
import com.baidu.rigel.biplatform.ma.model.service.CubeBuildService;
import com.baidu.rigel.biplatform.ma.model.utils.UuidGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.service.ReportDesignModelService;
import com.baidu.rigel.biplatform.ma.report.utils.ContextManager;
import com.baidu.rigel.biplatform.ma.resource.cache.CacheManagerForResource;
import com.baidu.rigel.biplatform.ma.resource.cache.NameCheckCacheManager;
import com.baidu.rigel.biplatform.ma.resource.utils.ResourceUtils;
import com.google.common.collect.Maps;

/**
 * 
 * 数据源管理Rest服务接口：提供对客户端进行数据源管理操作的支持
 * 
 * @author david.wang
 *
 */
@RestController
@RequestMapping("/silkroad/datasources")
public class DataSourceResource extends BaseResource {
    
    /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(DataSourceResource.class);
    
    /**
     * dsService
     */
    @Resource
    private DataSourceService dsService;
    
    /**
     * cubeBuildService
     */
    @Resource
    private CubeBuildService cubeBuildService;
    
    /**
     * reportDesignModelService
     */
    @Resource
    private ReportDesignModelService reportDesignModelService;
    
    /**
     * cacheManagerForResource
     */
    @Resource
    private CacheManagerForResource cacheManagerForResource;
    
    /**
     * nameCheckCacheManager
     */
    @Resource
    private NameCheckCacheManager nameCheckCacheManager;
    
    /**
     * 
     * @param dsId
     * @return
     */
    @RequestMapping(value = "/{id}/tables", method = { RequestMethod.GET })
    public ResponseResult getAllTables(@PathVariable("id") String dsId) {
        List<TableInfo> tables = null;
        try {
            tables = cubeBuildService.getAllTable(dsId);
        } catch (DataSourceOperationException e) {
            logger.error("fail in get all table from ds. ds id: " + dsId, e);
            return ResourceUtils.getErrorResult("未能查到相关数据库表信息，由于 " + e.getMessage(), 1);
        }
        Map<String, Object> data = Maps.newHashMap();
        data.put("tables", tables);
        ResponseResult rs = ResourceUtils.getResult("successfully", "can not get mode define info",
            tables);
        logger.info("query operation rs is : " + rs.toString());
        return rs;
    }
    
    /**
     * 获取当前产品线所有数据源信息
     * 
     * @param productLine
     * @return
     */
    @RequestMapping(method = { RequestMethod.GET })
    public ResponseResult listAll() {
        ResponseResult rs = new ResponseResult();
        try {
            DataSourceDefine[] listFiles = dsService.listAll();
            if (listFiles == null) {
                rs.setStatus(1);
                rs.setStatusInfo("当前产品线未定义任何数据源");
            } else {
                rs.setStatus(0);
                rs.setStatusInfo("successfully");
                rs.setData(listFiles);
            }
        } catch (DataSourceOperationException e) {
            logger.error(e.getMessage());
            rs.setStatus(1);
            rs.setStatusInfo(e.getMessage());
        }
        return rs;
    }
    
    /**
     * 依据数据源id获取数据源信息
     * 
     * @param productLine
     * @return
     */
    @RequestMapping(value = "/{id}", method = { RequestMethod.GET })
    public ResponseResult getDataSourceById(@PathVariable("id") String id) {
        ResponseResult rs = new ResponseResult();
        try {
            DataSourceDefine define = dsService.getDsDefine(id);
            if (define == null) {
                rs.setStatus(1);
                rs.setStatusInfo("未能找到对于数据源定义，id : " + id);
            } else {
                define.setDbPwd(AesUtil.getInstance().encrypt(define.getDbPwd(), securityKey));
                rs.setStatus(0);
                rs.setStatusInfo("successfully");
                rs.setData(define);
            }
        } catch (Exception e) {
            rs.setStatus(1);
            rs.setStatusInfo("error : " + e.getMessage());
            logger.error(e.getMessage(), e);
        }
        return rs;
    }
    
    /**
     * 保存数据源
     * 
     * @param productLine
     * @return
     */
    @RequestMapping(method = { RequestMethod.POST })
    public ResponseResult saveDataSource(HttpServletRequest request) {
        
        String name = request.getParameter("name");
        ResponseResult rs = new ResponseResult();
        if (StringUtils.isEmpty(name) || name.length() > 255) {
            logger.debug("name is empty or length more than 255");
            rs.setStatus(1);
            rs.setStatusInfo("名称为空或者太长，请重新输入合法名称，长度不能超过255个字符");
            return rs;
        }
        DataSourceDefine define = new DataSourceDefine();
        define.setId(UuidGeneratorUtils.generate());
        String productLine = ContextManager.getProductLine();
        assignNewValue(productLine, request, define);
        try {
            define = dsService.saveOrUpdateDataSource(define);
            rs.setStatus(0);
            rs.setStatusInfo("successfully");
            rs.setData(define);
            logger.info("save data source successfully!");
        } catch (DataSourceOperationException e) {
            logger.debug(e.getMessage(), e);
            rs.setStatus(1);
            rs.setStatusInfo("未能正确存储数据源定义信息，原因: " + e.getMessage());
        }
        return rs;
    }
    
    /**
     * 更新数据源
     * 
     * @param id
     * @param productLine
     * @return
     */
    @RequestMapping(value = "/{id}", method = { RequestMethod.PUT, RequestMethod.POST })
    public ResponseResult updateDataSource(@PathVariable("id") String id, HttpServletRequest request) {
        ResponseResult rs = new ResponseResult();
        try {
            DataSourceDefine define = dsService.getDsDefine(id);
            /*
             * modified by jiangyichao 从cache中获取数据源id 2014-08-12
             */
            Object dsIdInCache = cacheManagerForResource.getFromCache(id);
            // 如果cache中存在此id，那么不允许更新
            if (dsIdInCache != null) {
                rs.setStatus(1);
                rs.setStatusInfo("数据源被其他报表引用，请确认未有正在运行的报表引用数据源，数据源id ： " + id);
                logger.warn("the datasource with id " + id + " is using");
            }
            if (define == null) {
                rs.setStatus(1);
                rs.setStatusInfo("未能找到数据源的相应定义 : " + id);
                logger.warn("can not get datasource by id : " + id);
            } else {
                String productLine = ContextManager.getProductLine();
                assignNewValue(productLine, request, define);
                dsService.saveOrUpdateDataSource(define);
                logger.info("successfully update datasource with id " + id);
                rs.setStatus(0);
                rs.setStatusInfo("successfully");
                define.setDbPwd(AesUtil.getInstance().encrypt(define.getDbPwd(), securityKey));
                rs.setData(define);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            rs.setStatus(1);
            rs.setStatusInfo("error : " + e.getMessage());
        }
        return rs;
    }
    
    /**
     * 修改数据源定义信息
     * 
     * @param productLine
     * @param request
     * @param define
     */
    private void assignNewValue(String productLine, HttpServletRequest request,
        DataSourceDefine define) {
        define.setName(request.getParameter("name"));
        define.setDbInstance(request.getParameter("dbInstance"));
        define.setProductLine(productLine);
        define.setEncoding(request.getParameter("encoding"));
        if (StringUtils.hasText(request.getParameter("connUrl"))) {
            define.setHostAndPort(request.getParameter("connUrl"));
        } else {
            define.setHostAndPort(request.getParameter("hostAndPort"));
        }
        define.setDbUser(request.getParameter("dbUser"));
        define.setDbPwd(request.getParameter("dbPwd"));
        define.setType(DatasourceType.valueOf(request.getParameter("type")));
    }
    
    /**
     * 删除数据源
     * 
     * @param id
     * @param productLine
     * @return
     */
    @RequestMapping(value = "/{id}", method = { RequestMethod.DELETE })
    public ResponseResult removeDataSource(@PathVariable("id") String id) {
        ResponseResult rs = new ResponseResult();
        try {
            /*
             * modified by jiangyichao 删除前校验 2014-08-12
             */
            // 报表设计模型服务对象
            
            // 如果cache中存在此数据源的id，或者报表目录中存在使用此数据源的报表，则不允许删除数据源
            if (nameCheckCacheManager.existsDSName(id) || reportDesignModelService.isNameExist(id)) {
                rs.setStatus(1);
                rs.setStatusInfo("数据源正在被使用，请先删除引用该数据源的报表 " + id);
                logger.warn("the database with id " + id + " is using");
            } else {
                boolean result = dsService.removeDataSource(id);
                rs.setStatus(0);
                rs.setStatusInfo(String.valueOf(result));
            }
        } catch (DataSourceOperationException e) {
            rs.setStatus(1);
            rs.setStatusInfo(e.getMessage());
            logger.error(e.getMessage(), e);
        }
        return rs;
    }
}
