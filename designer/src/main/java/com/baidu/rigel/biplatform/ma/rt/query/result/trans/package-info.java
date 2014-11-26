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
 * 查询结果协议转换包：负责将查询的DataModel转换成能够适应客户端展现的结果
 * 展现结果包括：查询状态、查询结果、查询异常信息等，不同的查询请求策略，有不同的转换方式
 * 
 * @author david.wang
 * @version 1.0.0.1
 */
package com.baidu.rigel.biplatform.ma.rt.query.result.trans;