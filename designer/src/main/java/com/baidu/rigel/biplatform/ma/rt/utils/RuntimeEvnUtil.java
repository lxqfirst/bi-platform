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
package com.baidu.rigel.biplatform.ma.rt.utils;

import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.rt.Context;

/**
 * 工具类：用于提供运行时环境初始化、运行时上下文操作等
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public final class RuntimeEvnUtil {
    
	/**
	 * 构造函数
	 */
	private RuntimeEvnUtil () {
	}
	
	/**
	 * 根据报表id初始化报表对应运行时啥下文
	 * @param designModel 报表模型
	 * @return Context 运行时上下文
	 */
	public static final Context initContext(ReportDesignModel designModel) {
		return null;
	}
}
