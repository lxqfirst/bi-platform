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
package com.baidu.rigel.biplatform.ma.rt.query.service.impl;

import java.util.Date;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ac.exception.MiniCubeQueryException;
import com.baidu.rigel.biplatform.ac.query.MiniCubeConnection;
import com.baidu.rigel.biplatform.ac.query.MiniCubeDriverManager;
import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ac.query.model.QuestionModel;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryRequest;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryResult;
import com.baidu.rigel.biplatform.ma.rt.query.request.trans.QueryRequestTransService;
import com.baidu.rigel.biplatform.ma.rt.query.result.trans.QueryResultBuildService;
import com.baidu.rigel.biplatform.ma.rt.query.service.QueryException;
import com.baidu.rigel.biplatform.ma.rt.query.service.QuestionModelBuildService;
import com.baidu.rigel.biplatform.ma.rt.query.service.ReportQueryService;

/**
 *
 * @author david.wang
 * @version 1.0.0.1
 */
@Service("reportQueryService")
public class ReportQueryServiceImpl  implements ReportQueryService {
   
    /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(ReportQueryServiceImpl.class);
    
    /**
     * 问题模型构建服务
     */
    @Resource
    private QuestionModelBuildService questionModelBuildService;
    
    
    /**
     * 
     * ReportQueryServiceImpl
     */
    public ReportQueryServiceImpl() {
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public QueryResult query(QueryRequest request) throws QueryException {
        logger.info("begin query data");
        long begin = System.nanoTime();
        QueryRequestTransService service = QueryRequestTransService.getInstance();
        QueryAction action = service.tranRequest2QueryAction(request);
        if (action == null) {
            throw new QueryException("未知错误，不能正确解析查询请求");
        }
        QuestionModel model = questionModelBuildService.buildQuestionModel(action);
        if (model == null) {
            throw new QueryException("不能正确的将查询请求转换为问题模型。[QueryAction : + " + action + "]");
        }
        try {
            QueryResult rs = executeQuery(action, model);
            logger.info("successfully exexute query , cost " + (System.nanoTime() - begin) + " ns");
            return rs;
        } catch (MiniCubeQueryException e) {
            logger.error("Fail in quering data ! ", e);
            throw new QueryException(e.getMessage(), e);
        }
    }

    /**
     * 
     * @param action 查询动作
     * @param model 问题模型
     * @throws MiniCubeQueryException 查询异常
     * 
     */
    private QueryResult executeQuery(QueryAction action, QuestionModel model)
        throws MiniCubeQueryException {
        long start = new Date().getTime();
        MiniCubeConnection connection = MiniCubeDriverManager.getConnection(action.getDataSource());
        DataModel dataModel = connection.query(model);
        QueryResult  rs = QueryResultBuildService.getInstance().buildQueryResult(action, dataModel);
        long end = new Date().getTime();
        long seconds = (end - start) / 1000;
        logger.debug("Query Cost: " + seconds + " s");
        return rs;
    }
    
}
