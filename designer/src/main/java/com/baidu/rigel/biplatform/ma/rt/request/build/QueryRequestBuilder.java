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
package com.baidu.rigel.biplatform.ma.rt.request.build;

import java.util.Map;
import java.util.function.BiFunction;

import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.rt.ExtendAreaContext;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryRequest;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy;

/**
 * 查询请求构建工具类：负责将用户的请求封装成查询请求（QueryRequest）
 * @author david.wang
 * @since 1.1.0
 * 
 */
public final class QueryRequestBuilder {
	
	/**
	 * 查询请求
	 */
	private QueryRequestBuilder() {
	}
	
	/**
	 * 查询请求构建对象
	 * @param context ExtendAreaContext 扩展区域上下文
	 * @param golbalParams Map<String, Object> 请求参数
	 * @param queryStrategy QueryStrategy 查询策略
	 * @param callBack BiFunction 回调函数
	 * @param params 回调函数需要的额外参数，比如:drillItemValue等
	 * @return QueryRequest 查询请求
	 */
	public static QueryRequest buildQueryRequest(ExtendAreaContext context, QueryStrategy queryStrategy, 
			Map<String, Object> golbalParams, BiFunction<Map<String, Object>, QueryRequest, QueryRequest> callBack, 
			Map<String, Object> params) {
		Map<String, Object> localParams = context.getParams();
        /**
         * TODO 添加到函数处理，仅保留一个时间条件
         */
        for (String key : localParams.keySet()) {
            String value = localParams.get(key).toString();
            if (value.contains("start") && value.contains("end")) {
                localParams.remove(key);
            }
        }
        localParams.putAll(params);
        context.setParams(localParams);
        
        final QueryRequest queryRequest = new QueryRequest(queryStrategy, context, params);
        queryRequest.setAreaId(context.getAreaId());
        // 行
        Map<Item, Object> x = context.getX();
        x.keySet().stream().forEach(item -> {
            queryRequest.getRows().put(item.getOlapElementId(), null);
        });
        // 列
        Map<Item, Object> y = context.getY();
        y.keySet().stream().forEach(item -> {
            queryRequest.getCols().put(item.getOlapElementId(), null);
        });
        // 切片轴
        Map<Item, Object> s = context.getS();
        s.keySet().stream().forEach(item -> {
           queryRequest.getFilter().put(item.getOlapElementId(), null); 
        });
        // 设置报表ID
		queryRequest.setReportId(context.getReportId());
		// 自定义处理函数
		if (callBack != null) {
		    return callBack.apply(params, queryRequest);
		}
        return queryRequest;
	}
}
