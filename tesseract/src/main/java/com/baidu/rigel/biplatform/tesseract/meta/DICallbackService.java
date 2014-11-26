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
package com.baidu.rigel.biplatform.tesseract.meta;

import java.util.Map;

/**
 * 类DICallbackService.java的实现描述：不同Callback的参数封装以及获取对象方法
 * 
 * @author xiaoming.chen 2013-12-19 下午10:00:58
 */
public interface DICallbackService<T> {

    /**
     * CALLBACK接口版本号1.0
     */
    public static final String CALLBACK_VERSION_1 = "1.0";

    /**
     * 封装请求callback的参数
     * 
     * @param oriParams 原始参数信息
     * @return 返回callback需要的参数
     */
    Map<String, String> warpParams(Map<String, String> oriParams);

    /**
     * 将callback接口返回的json转换成各自需要的对象
     * 
     * @param jsonStr callback返回的字符串
     * @return 想要转换的对象
     */
    T parseFromJson(String jsonStr);

}