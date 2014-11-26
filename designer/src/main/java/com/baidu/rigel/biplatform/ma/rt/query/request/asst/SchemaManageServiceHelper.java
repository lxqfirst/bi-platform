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
/**
 * 
 */
package com.baidu.rigel.biplatform.ma.rt.query.request.asst;

import com.baidu.rigel.biplatform.ac.minicube.MiniCube;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ma.report.exception.QueryModelBuildException;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.LogicModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.utils.QueryUtils;

/**
 * 主要功能：提供从报表定义中查找报表中所使用的逻辑模型的工具方法。
 * 	方便用户直接从报表模型查找逻辑模型定义
 * @author david.wang
 * @version 1.0.0.1
 */
public class SchemaManageServiceHelper {
    
	private final ReportDesignModel reportModel;
	
    /**
     * 
     * SchemaManageServiceHelper
     */
    public SchemaManageServiceHelper(ReportDesignModel  reportModel) {
    		this.reportModel = reportModel;
    }
    
    /**
     * 依据区域模型构建cube
     * @param areaId
     * @return Cube
     */
    public Cube getCube(String areaId) {
        ExtendArea area = queryArea(areaId);
        try {
            MiniCube cube =  (MiniCube) QueryUtils.getCubeWithExtendArea(reportModel, area);
            // TODO 设置产品线名称
            return cube;
        } catch (QueryModelBuildException e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
    

    /**
     * 依据报表id和区域id查询对应区域的cube定义模型
     * @param areaId 区域id
     * @return LogicModel
     */
    public LogicModel queryLogicModel(String areaId) {
        ExtendArea area = queryArea(areaId);
        return area.getLogicModel();
    }

    /**
     * @param reportId
     * @param areaId
     * @return ExtendArea
     */
    public ExtendArea queryArea(String areaId) {
        ExtendArea area = reportModel.getExtendById(areaId);
        return area;
    }

    /**
     * 依据报表id与区域id获得cube的定义模型
     * @param areaId 区域id
     * @return Cube
     */
    public Cube getCubeDefine(String areaId) {
        ExtendArea area = queryArea(areaId);
        String cubeId = area.getCubeId();
        return reportModel.getSchema().getCubes().get(cubeId);
    }
    
}
