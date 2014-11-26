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
package com.baidu.rigel.biplatform.ma.report.service.impl;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.Resource;

import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.SerializationUtils;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ac.minicube.MiniCubeSchema;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.query.MiniCubeConnection;
import com.baidu.rigel.biplatform.ac.query.MiniCubeDriverManager;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ma.ds.exception.DataSourceOperationException;
import com.baidu.rigel.biplatform.ma.ds.service.DataSourceService;
import com.baidu.rigel.biplatform.ma.ds.util.DataSourceDefineUtil;
import com.baidu.rigel.biplatform.ma.file.client.service.FileService;
import com.baidu.rigel.biplatform.ma.file.client.service.FileServiceException;
import com.baidu.rigel.biplatform.ma.model.consts.Constants;
import com.baidu.rigel.biplatform.ma.model.ds.DataSourceDefine;
import com.baidu.rigel.biplatform.ma.model.utils.UuidGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.exception.QueryModelBuildException;
import com.baidu.rigel.biplatform.ma.report.exception.ReportModelOperationException;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.ExtendAreaType;
import com.baidu.rigel.biplatform.ma.report.model.FormatModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.service.ReportDesignModelService;
import com.baidu.rigel.biplatform.ma.report.utils.ContextManager;
import com.baidu.rigel.biplatform.ma.report.utils.QueryUtils;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * 
 * ReportModel服务接口实现
 * 
 * @author david.wang
 *
 */
@Service("reportDesignModelService")
public class ReportDesignModelServiceImpl implements ReportDesignModelService {
    
    /**
     * 文件管理服务
     */
    @Resource
    private FileService fileService;
    
    /**
     * dsService
     */
    @Resource
    private DataSourceService dsService;
    
    @Value("${biplatform.ma.report.location}")
    private String reportBaseDir;
    
    /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(this.getClass());
    
    /**
     * 构造函数
     * 
     */
    public ReportDesignModelServiceImpl() {
        
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public ReportDesignModel[] queryAllModels() {
        try {
            String[] listFile = fileService.ls(this.getDevReportDir());
            if (listFile == null || listFile.length == 0) {
                return new ReportDesignModel[0];
            }
            List<String> tmp = Lists.newArrayList();
            Collections.addAll(tmp, listFile);
            Collections.sort(tmp, new Comparator<String>() {

                @Override
                public int compare(String firstStr, String secondStr) {
                    if (firstStr.startsWith(".") || secondStr.startsWith(".")) {
                        return -1;
                    }
                    String tmp = firstStr.substring(firstStr.indexOf(Constants.FILE_NAME_SEPERATOR) 
                            + Constants.FILE_NAME_SEPERATOR.length(), 
                            firstStr.lastIndexOf(Constants.FILE_NAME_SEPERATOR));
                    String tmp2 = secondStr.substring(secondStr.indexOf(Constants.FILE_NAME_SEPERATOR) 
                            + Constants.FILE_NAME_SEPERATOR.length(), 
                            secondStr.lastIndexOf(Constants.FILE_NAME_SEPERATOR) );
                    return tmp.compareTo(tmp2);
                }
            });
            return buildResult(tmp.toArray(new String[0]));
            
        } catch (FileServiceException e) {
            logger.error(e.getMessage(), e);
        }
        return new ReportDesignModel[0];
    }
    
    /**
     * 通过文件内容构建报表模型
     * 
     * @param listFile
     * @return
     */
    private ReportDesignModel[] buildResult(String[] listFile) {
        final List<ReportDesignModel> rs = new ArrayList<ReportDesignModel>();
        final String reportDir = getDevReportDir();
        for (final String f : listFile) {
            if (f.contains(".")) {
                continue;
            }
            try {
                byte[] content = fileService.read(reportDir + File.separator + f);
                ReportDesignModel model = (ReportDesignModel) SerializationUtils
                    .deserialize(content);
                rs.add(model);
            } catch (Exception e) {
                logger.error(e.getMessage(), e);
            }
        }
        return rs.toArray(new ReportDesignModel[0]);
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public ReportDesignModel getModelByIdOrName(String idOrName, boolean isRelease) {
        String baseDir = null;
        if (!isRelease) {
            baseDir = getDevReportDir();
        } else {
            baseDir = getReleaseReportDir();
        }
        String[] modelFileList = null;
        try {
            modelFileList = fileService.ls(baseDir);
        } catch (FileServiceException e) {
            logger.debug(e.getMessage(), e);
        }
        if (modelFileList == null || modelFileList.length == 0) {
            logger.warn("can not get report model define in directory: " + baseDir);
            return null;
        }
        
        try {
            for (String modelFile : modelFileList) {
                if (modelFile.startsWith(idOrName) || modelFile.endsWith(idOrName)) {
                    byte[] content = fileService.read(baseDir + File.separator + modelFile);
                    ReportDesignModel model = (ReportDesignModel) SerializationUtils
                        .deserialize(content);
                    return model;
                }
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean deleteModel(String id, boolean removeFromDisk)
            throws ReportModelOperationException {
        try {
            ReportDesignModel model = this.getModelByIdOrName(id, false);
            if (model != null) {
                boolean result = true;
                // 如果存在发布态报表，删除发布态报表
                if (this.getModelByIdOrName(id, true) != null) {
                    /**
                     * 已经发布了，不能删除
                     * TODO 应该有下线操作，下线以后把发布的报表删除，才能够进一步删除正在开发的报表
                     */
                    return false;
                }
                result = fileService.rm(generateDevReportLocation(model));
                logger.info("delete report " + (result ? "successfully" : "failed"));
                return result;
            }
            return false;
        } catch (FileServiceException e) {
            logger.error(e.getMessage(), e);
            throw new ReportModelOperationException(e);
        }
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean isNameExist(String name) {
        if (name == null) {
            return false;
        }
        String[] listFile = null;
        try {
            listFile = fileService.ls(this.getDevReportDir());
        } catch (FileServiceException e) {
            logger.debug(e.getMessage(), e);
        }
        if (listFile == null || listFile.length == 0) {
            return false;
        }
        String idTarget = name + Constants.FILE_NAME_SEPERATOR;
        String nameTarget = Constants.FILE_NAME_SEPERATOR + name + Constants.FILE_NAME_SEPERATOR;
        for (String file : listFile) {
            if (file.startsWith(idTarget) || file.contains(nameTarget)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public ReportDesignModel saveOrUpdateModel(ReportDesignModel model)
            throws ReportModelOperationException {
        if (model == null) {
            logger.warn("current model is null");
            throw new ReportModelOperationException("model can not be null");
        }
        if (StringUtils.isEmpty(model.getName())) {
            logger.debug("model's name can not be empty");
            throw new ReportModelOperationException("model's name can not be empty");
        }
        if (StringUtils.isEmpty(model.getId())) {
            model.setId(UuidGeneratorUtils.generate());
        }
        try {
            boolean rs = fileService.write(generateDevReportLocation(model),
                    SerializationUtils.serialize(model));
            if (rs) {
                return model;
            }
        } catch (FileServiceException e) {
            logger.error(e.getMessage(), e);
        }
        
        return null;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public ReportDesignModel copyModel(String src, String targetName)
            throws ReportModelOperationException {
        if (StringUtils.isEmpty(src)) {
            logger.warn("source name is empty");
            throw new ReportModelOperationException("source name is empty");
        }
        if (StringUtils.isEmpty(targetName)) {
            logger.warn("target name is empty");
            throw new ReportModelOperationException("target name is empty");
        }
        if (isNameExist(targetName)) {
            throw new ReportModelOperationException("target name already exists: " + targetName);
        }
        
        if (isNameExist(src)) {
            ReportDesignModel model = getModelByIdOrName(src, false);
            model.setId(UuidGeneratorUtils.generate());
            model.setName(targetName);
            MiniCubeSchema schema = (MiniCubeSchema) model.getSchema();
            if (schema != null) {
                schema.setId(UuidGeneratorUtils.generate());
            }
            return saveOrUpdateModel(model);
        }
        throw new ReportModelOperationException("source not exists: " + src);
    }
    
    /**
     * 获取开发状态报表存储路径
     * 
     * @return
     */
    private String getDevReportDir() {
        String productLine = ContextManager.getProductLine();
        return productLine + File.separator + reportBaseDir + File.separator
            + "dev";
    }
    
    /**
     * 获取开发状态报表存储路径
     * 
     * @return
     */
    private String getReleaseReportDir() {
        String productLine = ContextManager.getProductLine();
        return productLine + File.separator + reportBaseDir + File.separator
            + "release";
    }
    
    /**
     * 获取发布的报表的存储路径
     * 
     * @return
     */
    private String getReleaseReportLocation(ReportDesignModel model) {
        if(model == null) {
            return null;
        }
        String productLine = ContextManager.getProductLine();
        return productLine + File.separator + reportBaseDir + File.separator
            + "release" + File.separator + model.getId() + Constants.FILE_NAME_SEPERATOR + model.getName();
    }
    
    /**
     * 依据model对象生成持久化文件名称
     * 
     * @param model
     * @return
     */
    private String generateDevReportLocation(ReportDesignModel model) {
        if(model == null) {
            return null;
        }
        StringBuilder builder = new StringBuilder();
        builder.append(getDevReportDir());
        builder.append(File.separator);
        builder.append(model.getId());
        builder.append(Constants.FILE_NAME_SEPERATOR);
        builder.append(model.getName());
        builder.append(Constants.FILE_NAME_SEPERATOR);
        builder.append(model.getDsId());
        return builder.toString();
    }

    /**
     * {@inheritDoc}
     * @throws DataSourceOperationException 
     */
    @Override
    public boolean publishReport(ReportDesignModel model)
            throws ReportModelOperationException, DataSourceOperationException {
        
        boolean result = false;
        String devReportLocation = this.generateDevReportLocation(model);
        String realeaseLocation = this.getReleaseReportLocation(model);
        try {
            result = this.fileService.copy(devReportLocation, realeaseLocation);
        } catch (FileServiceException e) {
            logger.error(e.getMessage(), e);
            throw new ReportModelOperationException("发布报表失败！");
        }
        if (!result) {
            logger.error("拷贝报表失败！");
            throw new ReportModelOperationException("发布报表失败！");
        }
        /**
         * 发布
         */
        DataSourceDefine dsDefine;
        try {
            dsDefine = dsService.getDsDefine(model.getDsId());
        } catch (DataSourceOperationException e) {
            logger.error("Fail in Finding datasource define. ", e);
            throw e;
        }
        DataSourceInfo dsInfo = DataSourceDefineUtil.parseToDataSourceInfo(dsDefine);
        List<Cube> cubes = Lists.newArrayList();
        for (ExtendArea area : model.getExtendAreaList()) {
            try {
            		// 忽略此类区域
            		if (area.getType() == ExtendAreaType.TIME_COMP 
            				|| area.getType() == ExtendAreaType.LITEOLAP_TABLE
            				|| area.getType() == ExtendAreaType.SELECTION_AREA 
            				|| area.getType() == ExtendAreaType.LITEOLAP_CHART) {
            			continue;
            		}  
        			Cube cube = QueryUtils.getCubeWithExtendArea(model, area);
        			cubes.add(cube);
            } catch (QueryModelBuildException e) {
                logger.warn("It seems that logicmodel of area is null. Ingore this area. ");
                continue;
            }
        }
        ExecutorService executor = Executors.newFixedThreadPool(1);
        executor.submit(new Runnable() {
            public void run() {
                MiniCubeConnection connection = MiniCubeDriverManager.getConnection(dsInfo);
                connection.publishCubes(cubes, dsInfo);
            }
        });
        return true;
    }

	@Override
	public void updateAreaWithDataFormat(ExtendArea area, String dataFormat) {
		FormatModel model = area.getFormatModel();
		model.getDataFormat().putAll(convertStr2Map(dataFormat));
	}

	/**
	 * 讲json串转换为map
	 * @param dataFormat
	 * @return Map<String, String>
	 */
	private Map<String, String> convertStr2Map(String dataFormat) {
		try {
			JSONObject json = new JSONObject(dataFormat);
			Map<String, String> rs = Maps.newHashMap();
			for (String str : JSONObject.getNames(json)) {
				rs.put(str, json.getString(str));
			}
			return rs;
		} catch (JSONException e) {
			throw new IllegalArgumentException("数据格式必须为Json格式， dataFormat = " + dataFormat);
		}
	}
    
}
