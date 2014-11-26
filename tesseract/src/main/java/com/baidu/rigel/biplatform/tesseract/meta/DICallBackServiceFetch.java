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

import java.io.IOException;
import java.util.Map;

import org.apache.log4j.Logger;

import com.baidu.rigel.biplatform.ac.util.HttpRequest;

/**
 * 类DICallBackServiceFetch.java的实现描述：默认获取callBack接口
 * 
 * @author xiaoming.chen 2013-12-19 下午10:16:32
 */
public abstract class DICallBackServiceFetch<T> implements DICallbackService<T> {

    /**
     * log
     */
    private Logger log = Logger.getLogger(this.getClass());

    @Override
    public Map<String, String> warpParams(Map<String, String> oriParams) {

        // Map<String, String> httpParams = new HashMap<String, String>();
        //
        // httpParams.putAll(oriParams);

        return oriParams;
    }

    /**
     * 根据URL获取接口，并返回指定对象
     * 
     * @param url callback接口的URL
     * @param oriParams 请求的原始参数
     * @return 返回需要的对象
     * @throws IOException
     */
    public T fetchCallback(String url, Map<String, String> oriParams) throws IOException {
        Map<String, String> params = this.warpParams(oriParams);
        log.info("start to fetch url:" + url + " params:" + oriParams);
        long current = System.currentTimeMillis();
        String fetchResutStr = HttpRequest.sendGet(url, params);
        if (log.isDebugEnabled()) {
            StringBuilder sb = new StringBuilder();
            sb.append("fetch url:").append(url).append(" params:").append(oriParams).append(" result:")
                    .append(fetchResutStr);
            log.debug(sb.toString());
        }

        StringBuilder sb = new StringBuilder();
        sb.append("end fetch url :").append(url).append(" params:").append(oriParams).append(" cost:")
                .append(System.currentTimeMillis() - current);
        log.info(sb.toString());
        return this.parseFromJson(fetchResutStr);
    }

}