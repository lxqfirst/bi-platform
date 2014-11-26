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

import javax.annotation.Resource;

import org.springframework.stereotype.Service;
import org.springframework.util.SerializationUtils;

import com.baidu.rigel.biplatform.ma.report.exception.CacheOperationException;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.query.ReportRuntimeModel;
import com.baidu.rigel.biplatform.ma.report.service.ReportDesignModelService;
import com.baidu.rigel.biplatform.ma.report.utils.ContextManager;
import com.baidu.rigel.biplatform.ma.rt.ExtendAreaContext;

/**
 * 
 * 报表缓存管理服务
 * 
 * @author zhongyi
 * 
 *         2014-7-31
 */
@Service("reportModelCacheManager")
public class ReportModelCacheManager {
    
    /**
     * cacheManagerForReource
     */
    @Resource
    private CacheManagerForResource cacheManagerForReource;
    
    /**
     * reportDesignModelService
     */
    @Resource
    private ReportDesignModelService reportDesignModelService;
    
    /**
     * 从缓存中获取报表模型
     * 
     * @param reportId
     * @return
     * @throws Exception
     */
    public ReportDesignModel getReportModel(String reportId) throws CacheOperationException {
        String sessionId = ContextManager.getSessionId();
        String productLine = ContextManager.getProductLine();
        String key = CacheKeyGenerator.generateSessionReportKey(sessionId, reportId, productLine);
        // ReportDesignModel model = (ReportDesignModel)
        // cacheManagerForReource.getFromCache(key);
        byte[] modelBytes = (byte[]) cacheManagerForReource.getFromCache(key);
        ReportDesignModel model = (ReportDesignModel) SerializationUtils.deserialize(modelBytes);
        
        if (model == null) {
            throw new CacheOperationException("No such Model in cache!");
        }
        return model;
    }
    
    /**
     * 加载报表模型到cache
     * 
     * @param reportId
     * @throws Exception
     */
    public ReportDesignModel loadReportModelToCache(String reportId) throws CacheOperationException {
        ReportDesignModel reportModel = reportDesignModelService.getModelByIdOrName(reportId, false);
        try {
            updateReportModelToCache(reportId, reportModel);
        } catch (CacheOperationException e1) {
            throw e1;
        }
        return reportModel;
    }
    
    /**
     * 加载报表模型到cache
     * 
     * @param reportId
     * @throws Exception
     */
    public ReportDesignModel loadReleaseReportModelToCache(String reportId) throws CacheOperationException {
        ReportDesignModel reportModel = reportDesignModelService.getModelByIdOrName(reportId, true);
        try {
            updateReportModelToCache(reportId, reportModel);
        } catch (CacheOperationException e1) {
            throw e1;
        }
        return reportModel;
    }
    
    /**
     * 删除缓存中报表模型
     * 
     * @param reportId
     * @throws Exception
     */
    public void deleteReportModel(String reportId) throws CacheOperationException {
        String sessionId = ContextManager.getSessionId();
        String productLine = ContextManager.getProductLine();
        String key = CacheKeyGenerator.generateSessionReportKey(sessionId, reportId, productLine);
        cacheManagerForReource.deleteFromCache(key);
    }
    
    /**
     * 更新报表模型到cache
     * 
     * @param reportId
     * @param reportModel
     * @throws Exception
     */
    public void updateReportModelToCache(String reportId, ReportDesignModel reportModel)
            throws CacheOperationException {
        String sessionId = ContextManager.getSessionId();
        String productLine = ContextManager.getProductLine();
        String sessionReportKey = CacheKeyGenerator.generateSessionReportKey(sessionId, reportId,
            productLine);
        try {
            byte[] modelBytes = SerializationUtils.serialize(reportModel);
            cacheManagerForReource.setToCache(sessionReportKey, modelBytes);
        } catch (CacheOperationException e) {
            throw e;
        }
    }
    
    /**
     * 从缓存中获取运行时模型
     * 
     * @param reportId
     * @return
     * @throws CacheOperationException
     */
    public ReportRuntimeModel getRuntimeModel(String reportId) throws CacheOperationException {
        String sessionId = ContextManager.getSessionId();
        String productLine = ContextManager.getProductLine();
        String runtimeReportKey = CacheKeyGenerator.generateRuntimeReportKey(sessionId, reportId,
            productLine);
        byte[] modelBytes = (byte[]) cacheManagerForReource.getFromCache(runtimeReportKey);
        ReportRuntimeModel runTimeModel = (ReportRuntimeModel) SerializationUtils
            .deserialize(modelBytes);
        if (runTimeModel == null) {
            throw new CacheOperationException("No such Model in cache!");
        }
        return runTimeModel;
    }
    
    /**
     * 加载运行模型到分布式缓存
     * 定义未同步操作，避免多次加载重复初始化并且避免runtime model壮体啊不一致
     * @param reportId
     * @throws Exception
     */
    public synchronized ReportRuntimeModel loadRunTimeModelToCache(String reportId) throws CacheOperationException {
        
        ReportDesignModel reportModel = getReportModel(reportId);
        if (reportModel == null) {
            throw new CacheOperationException("No session design model. So fail in loading runtime mode. ");
        }
        ReportRuntimeModel runTimeModel = new ReportRuntimeModel(reportId);
        try {
            // 运形态调用，应当并且仅应当初始化一次
            runTimeModel.init(reportModel, true);
            updateRunTimeModelToCache(reportId, runTimeModel);
        } catch (CacheOperationException e) {
            throw e;
        }
        return runTimeModel;
    }
    
    /**
     * 更新缓存中的报表运行模型
     * 
     * @param reportId
     * @param newRunTimeModel
     * @throws Exception
     */
    public synchronized void updateRunTimeModelToCache(String reportId, ReportRuntimeModel newRunTimeModel)
            throws CacheOperationException {
        String sessionId = ContextManager.getSessionId();
        String productLine = ContextManager.getProductLine();
        String runTimeKey = CacheKeyGenerator.generateRuntimeReportKey(sessionId, reportId,
            productLine);
        try {
            byte[] modelBytes = SerializationUtils.serialize(newRunTimeModel);
            cacheManagerForReource.setToCache(runTimeKey, modelBytes);
        } catch (CacheOperationException e) {
            throw e;
        } 
    }

    /**
     * 
     * @param resource
     */
    protected void setCacheManagerForResource(CacheManagerForResource resource) {
        this.cacheManagerForReource = resource;
    }
    
    /**
     * 更新区域上下文
     * @param areaId 区域id
     * @param context 区域上下文
     */
    public void updateAreaContext(String areaId, ExtendAreaContext context) {
    		int key = genAreaKey(areaId);
    		cacheManagerForReource.setToCache(String.valueOf(key), context);
    }

	/**
	 * 区域id
	 * @param areaId
	 * @return int
	 */
	private int genAreaKey(String areaId) {
		int key = new StringBuilder()
			    .append(areaId)
			    .append("_^-^_")
			    .append(ContextManager.getSessionId())
			    .append("_^-^_")
			    .append(ContextManager.getProductLine())
			    .toString().hashCode();
		return key;
	}
    
    /**
     * 
     * 依据区域id获取区域上下文
     * @param areaId 区域id
     * @return ExtendAreaContext
     * 
     */
    public ExtendAreaContext getAreaContext(String areaId) {
	    	int key = genAreaKey(areaId);
		if (cacheManagerForReource.getFromCache(String.valueOf(key)) == null) {
			return new ExtendAreaContext();
		}
		return (ExtendAreaContext) cacheManagerForReource.getFromCache(String.valueOf(key));
    }
    
}