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
package com.baidu.rigel.biplatform.tesseract.qsservice.query.vo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryContextSplitService.QueryContextSplitStrategy;

/**
 * 查询上下文拆分结果
 * 
 * @author xiaoming.chen
 *
 */
public class QueryContextSplitResult {

    /**
     * splitQueryContexts 拆分后的查询上下文
     */
    private List<QueryContext> splitQueryContexts;

    /**
     * measureCaculateExpression 指标的计算公式， 后续的Value应该会变成计算公式解析后的对象
     */
    private Map<String, String> measureCaculateExpression;

    /**
     * splitStrategy 拆分策略，根据不同策略最后做数据合并的时候需要进行不同处理
     */
    private QueryContextSplitStrategy splitStrategy;

    /**
     * constructor
     * 
     * @param splitStrategy
     */
    public QueryContextSplitResult(QueryContextSplitStrategy splitStrategy) {
        this.splitStrategy = splitStrategy;
    }

    /**
     * get splitQueryContexts
     * 
     * @return the splitQueryContexts
     */
    public List<QueryContext> getSplitQueryContexts() {
        if (this.splitQueryContexts == null) {
            this.splitQueryContexts = new ArrayList<QueryContext>(1);
        }
        return splitQueryContexts;
    }

    /**
     * set splitQueryContexts with splitQueryContexts
     * 
     * @param splitQueryContexts the splitQueryContexts to set
     */
    public void setSplitQueryContexts(List<QueryContext> splitQueryContexts) {
        this.splitQueryContexts = splitQueryContexts;
    }

    /**
     * get measureCaculateExpression
     * 
     * @return the measureCaculateExpression
     */
    public Map<String, String> getMeasureCaculateExpression() {
        return measureCaculateExpression;
    }

    /**
     * set measureCaculateExpression with measureCaculateExpression
     * 
     * @param measureCaculateExpression the measureCaculateExpression to set
     */
    public void setMeasureCaculateExpression(Map<String, String> measureCaculateExpression) {
        this.measureCaculateExpression = measureCaculateExpression;
    }

    /**
     * get splitStrategy
     * 
     * @return the splitStrategy
     */
    public QueryContextSplitStrategy getSplitStrategy() {
        return splitStrategy;
    }

    /**
     * set splitStrategy with splitStrategy
     * 
     * @param splitStrategy the splitStrategy to set
     */
    public void setSplitStrategy(QueryContextSplitStrategy splitStrategy) {
        this.splitStrategy = splitStrategy;
    }

}
