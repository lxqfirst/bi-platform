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

import java.util.Map;

import com.baidu.rigel.biplatform.ac.query.model.QuestionModel;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.service.QuestionModelBuildService;
import com.baidu.rigel.biplatform.ma.rt.utils.QueryUtils;

/**
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class QuestionModelBuildServiceImpl implements QuestionModelBuildService {
    
    /**
     * 
     * QuestionModelBuildServiceImpl
     */
    public QuestionModelBuildServiceImpl() {
    }
    
    /* 
     * (non-Javadoc)
     * @see com.baidu.rigel.biplatform.ma.rt.query.service.QuestionModelBuildService#buildQuestionModel(com.baidu.rigel.biplatform.ma.rt.query.service.QueryAction)
     */
    @Override
    public QuestionModel buildQuestionModel(QueryAction action) {
        try {
            QuestionModel questionModel = QueryUtils.convert2QuestionModel(action);
            questionModel.setNeedSummary(false);
            questionModel.setUseIndex(false);
            questionModel.setUseIndex(true);
            if (action.getRequestParams() != null) {
                for (Map.Entry<String, Object> entry : action.getRequestParams().entrySet()) {
                    Object value = entry.getValue();
                    if (value != null && value instanceof String) {
                        questionModel.getRequestParams().put(entry.getKey(), (String) value);
                    }
                } 
            }
            return questionModel;
        } catch (Exception e) {
            
            throw new RuntimeException("构建问题模型出错，请检查查询条件");
        }
    }
}
