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
package com.baidu.rigel.biplatform.ma.rt.query.result.trans;

import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryResult;
import com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy;

/**
 * 展开下钻结果集处理操作
 * @author david.wang
 *
 */
public class ExpandQueryResultBuilder extends AbsQueryResultBuilder {

	/* (non-Javadoc)
	 * @see com.baidu.rigel.biplatform.ma.rt.query.result.trans.AbsQueryResultBuilder#isCanBuildResult(com.baidu.rigel.biplatform.ma.rt.query.model.QueryStrategy)
	 */
	@Override
	boolean isCanBuildResult(QueryStrategy queryStrategy) {
		return queryStrategy == QueryStrategy.DRILL_EXPAND_QUERY;
	}

	/* (non-Javadoc)
	 * @see com.baidu.rigel.biplatform.ma.rt.query.result.trans.AbsQueryResultBuilder#innerBuild(com.baidu.rigel.biplatform.ma.rt.query.model.QueryAction, com.baidu.rigel.biplatform.ac.query.data.DataModel)
	 */
	@Override
	QueryResult innerBuild(QueryAction queryAction, DataModel model) {
		return null;
	}

}
