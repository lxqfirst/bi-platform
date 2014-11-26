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
package com.baidu.rigel.biplatform.tesseract.resultset;

import java.io.Serializable;
import java.math.BigDecimal;

import org.apache.commons.lang.StringUtils;

import com.baidu.rigel.biplatform.ac.model.Aggregator;

/**
 * 聚集计算
 * 
 * @author xiaoming.chen
 *
 */
public class Aggregate {

    /**
     * AGGREGATE_SUM
     */
    public static final String AGGREGATE_SUM = "SUM";

    /**
     * AGGREGATE_COUNT
     */
    public static final String AGGREGATE_COUNT = "COUNT";

    /**
     * AGGREGATE_DISTINCT_COUNT
     */
    public static final String AGGREGATE_DISTINCT_COUNT = "DISTINCT_COUNT";

    /**
     * 计算
     * @param src1 参数1
     * @param src2 参数2
     * @param aggregator 聚集方式
     * @return 结果
     */
    public static Serializable aggregate(Serializable src1, Serializable src2, Aggregator aggregator) {
        switch (aggregator.name()) {
            case AGGREGATE_SUM:
                if(src2 == null || StringUtils.isBlank(src2.toString())) {
                    return src1; 
                }
                if(src1 == null) {
                    return src2;
                }
                BigDecimal arg1 = new BigDecimal(src1.toString());
                BigDecimal arg2 = new BigDecimal(src2.toString());
                return arg1.add(arg2);
            case AGGREGATE_COUNT:
                if(src1 == null || src2 == null) {
                    return 1;
                }else {
                    return Integer.parseInt(src1.toString()) + 1;
                }
            default:
                throw new UnsupportedOperationException("unsupported aggregator:" + aggregator);
        }
    }

}
