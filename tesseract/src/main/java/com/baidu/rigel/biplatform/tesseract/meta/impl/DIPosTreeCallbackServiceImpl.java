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
package com.baidu.rigel.biplatform.tesseract.meta.impl;

import java.io.Serializable;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ac.util.AnswerCoreConstant;
import com.baidu.rigel.biplatform.tesseract.meta.DICallBackServiceFetch;
import com.baidu.rigel.biplatform.tesseract.meta.vo.FetchUrlResult;
import com.baidu.rigel.biplatform.tesseract.meta.vo.PosTreeFetchUrlResult;
import com.baidu.rigel.biplatform.tesseract.model.PosTreeNode;

/**
 * 类DIPosTreeCallbackServiceImpl.java的实现描述：TODO 类实现描述
 * 
 * @author xiaoming.chen 2013-12-19 下午10:11:56
 */
@Service
public class DIPosTreeCallbackServiceImpl extends DICallBackServiceFetch<List<PosTreeNode>> implements Serializable {

    /**
     * default generate serialVersionUID
     */
    private static final long serialVersionUID = -2641019846513992875L;

    @Override
    public List<PosTreeNode> parseFromJson(String jsonStr) {
        FetchUrlResult fetchUrlResult = AnswerCoreConstant.GSON.fromJson(jsonStr, FetchUrlResult.class);
        List<PosTreeNode> result = null;
        if (StringUtils.equals(CALLBACK_VERSION_1, fetchUrlResult.getVersion())) {
            PosTreeFetchUrlResult posTreeFetchResult =
                    AnswerCoreConstant.GSON.fromJson(jsonStr, PosTreeFetchUrlResult.class);
            result = posTreeFetchResult.getData();
        } else {
            // 其他版本的待定
            throw new UnsupportedOperationException("no implement yet");
        }
        return result;
    }

}