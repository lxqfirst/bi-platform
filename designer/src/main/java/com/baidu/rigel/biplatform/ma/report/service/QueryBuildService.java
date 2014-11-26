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
package com.baidu.rigel.biplatform.ma.report.service;

import java.util.Map;

import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ma.report.exception.PivotTableParseException;
import com.baidu.rigel.biplatform.ma.report.exception.QueryModelBuildException;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.query.QueryAction;
import com.baidu.rigel.biplatform.ma.report.query.QueryContext;
import com.baidu.rigel.biplatform.ma.report.query.ReportRuntimeModel;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.PivotTable;

/**
 * 
 * 查询构建服务
 * @author david.wang
 * @version 1.0.0.1
 */
public interface QueryBuildService {
    
    /**
     * 
     * @param logicModel
     * @param contextParams
     * @return
     */
    QueryAction generateTableQueryAction(ReportDesignModel model, String areaId,
            Map<String, Object> context);
    
    /**
     * 
     * @param model
     * @param areaId
     * @param contextParams
     * @return
     */
    QueryAction generateTableQueryActionForDrill(ReportDesignModel model, String areaId,
            Map<String, Object> contextParams, int targetIndex);
    
    /**
     * 
     * @param areaId
     * @param contextParams
     * @return
     */
    QueryContext generateQueryContext(String areaId, Map<String, String[]> contextParams);
    
    /**
     * 
     * @param dataModel
     * @return
     * @throws Exception
     */
    PivotTable parseToPivotTable(DataModel dataModel) throws PivotTableParseException;

    /**
     * @param model
     * @param areaId
     * @param context
     * @param indNames
     * @return
     * @throws QueryModelBuildException 
     */
    QueryAction generateChartQueryAction(ReportDesignModel model, String areaId,
            Map<String, Object> context, String[] indNames, ReportRuntimeModel runTimeModel)
                    throws QueryModelBuildException;
}