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
package com.baidu.rigel.biplatform.tesseract.isservice.search.agg;

import java.io.Serializable;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.baidu.rigel.biplatform.ac.util.DeepcopyUtils;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryMeasure;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest;
import com.baidu.rigel.biplatform.tesseract.resultset.Aggregate;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.Meta;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.ResultRecord;
import com.google.common.base.Splitter;

/**
 * 
 * 聚集计算
 * 
 * @author lijin
 *
 */
public class AggregateCompute {
    
    private static Logger LOGGER = LoggerFactory.getLogger(AggregateCompute.class);
    
    public static LinkedList<ResultRecord> distinct(LinkedList<ResultRecord> dataList){
        Stream<ResultRecord> stream = dataList.stream();
        LinkedList<ResultRecord> result= new LinkedList<ResultRecord>();
        stream.distinct().forEach(record -> {
            result.add(record);
        });
//        for(Object os:stream.distinct().toArray()){
//            if(os instanceof ResultRecord){
//            }
//        }
        //result.addAll(stream.distinct().collect(Collectors.toList()));
        return result;
    }
    
    /**
     * 聚集计算
     * 
     * @param dataList
     *            待计算的数据
     * @param query
     *            原始查询请求
     * @return LinkedList<ResultRecord> 计算后的数据
     */
    public static LinkedList<ResultRecord> aggregate(LinkedList<ResultRecord> dataList,
        int dimSize, List<QueryMeasure> queryMeasures) {
        
        if (CollectionUtils.isEmpty(queryMeasures) || CollectionUtils.isEmpty(dataList) ||dataList.size() == 1) {
            LOGGER.info("no need to group.");
            return dataList;
        }
        LinkedList<ResultRecord> result = new LinkedList<ResultRecord>();
        
//        Set<Integer> countIndex = Sets.newHashSet();
//        for (int i = 0 ; i < queryMeasures.size() ; i++) {
//            if (queryMeasures.get(i).getAggregator().equals(Aggregator.COUNT)) {
//                countIndex.add(dimSize + i);
//            }
//        }
        
        Meta meta = dataList.get(0).getMeta();
        long current = System.currentTimeMillis();
        Map<String, ResultRecord> groupResult = dataList.parallelStream().collect(Collectors.groupingByConcurrent(ResultRecord::getGroupBy,
                Collectors.reducing(new ResultRecord(new Serializable[meta.getFieldNameArray().length], DeepcopyUtils.deepCopy(meta)), (x,y) ->{
                    ResultRecord var = new ResultRecord(new Serializable[meta.getFieldNameArray().length], meta);
                    var.setGroupBy(y.getGroupBy());
                    try {
                        for(int i = 0; i < queryMeasures.size(); i++){
                            QueryMeasure measure = queryMeasures.get(i);
                            int index = i + dimSize;
                            var.setField(i+dimSize, Aggregate.aggregate(x.getField(index), y.getField(index), measure.getAggregator()));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        throw new RuntimeException(e);
                    }
                    return var;
                })));
        LOGGER.info("group agg(sum) cost: {}ms!", (System.currentTimeMillis() - current));
//        if (CollectionUtils.isNotEmpty(countIndex)) {
//            current = System.currentTimeMillis();
//           countRes = dataList.parallelStream().collect(Collectors.groupingBy(ResultRecord::getGroupBy,Collectors.counting()));
//           LOGGER.info("group count cost:" + (System.currentTimeMillis() - current) + "ms!");
//        }
        
        for(String key : groupResult.keySet()) {
            int i = 0 ;
            for(String value : Splitter.on(',').omitEmptyStrings().split(key)) {
                groupResult.get(key).setField(i, value);
                i++;
            }
//            for (int index : countIndex) {
//                groupResult.get(key).setField(index, countRes.get(key));
//            }
        }
        result.addAll(groupResult.values());
        
        return result;
    }

    /**
     * @param resultQ
     * @param query
     * @return
     */
    public static Queue<ResultRecord> aggregate(LinkedList<ResultRecord> resultQ, QueryRequest query) {
        if (query.getGroupBy() != null && CollectionUtils.isNotEmpty(resultQ)) {
            int dimSize = query.getSelect().getQueryProperties().size();
            List<QueryMeasure> queryMeasures = query.getSelect().getQueryMeasures();
            return aggregate(resultQ, dimSize, queryMeasures);
        } else {
            return resultQ;
        }
    }
    
}
