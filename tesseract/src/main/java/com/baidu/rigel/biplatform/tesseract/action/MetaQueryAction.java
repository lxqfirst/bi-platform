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
package com.baidu.rigel.biplatform.tesseract.action;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.baidu.rigel.biplatform.ac.exception.MiniCubeQueryException;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMember;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.query.MiniCubeConnection;
import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.data.vo.MetaJsonDataInfo;
import com.baidu.rigel.biplatform.ac.query.model.ConfigQuestionModel;
import com.baidu.rigel.biplatform.ac.query.model.DimensionCondition;
import com.baidu.rigel.biplatform.ac.query.model.MetaCondition;
import com.baidu.rigel.biplatform.ac.util.AnswerCoreConstant;
import com.baidu.rigel.biplatform.ac.util.JsonUnSeriallizableUtils;
import com.baidu.rigel.biplatform.ac.util.MetaNameUtil;
import com.baidu.rigel.biplatform.ac.util.ResponseResult;
import com.baidu.rigel.biplatform.ac.util.ResponseResultUtils;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourcePoolService;
import com.baidu.rigel.biplatform.tesseract.exception.DataSourceException;
import com.baidu.rigel.biplatform.tesseract.exception.MetaException;
import com.baidu.rigel.biplatform.tesseract.meta.MetaDataService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryContextSplitService.QueryContextSplitStrategy;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.QueryService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryContext;
import com.google.gson.JsonSyntaxException;
import com.google.gson.reflect.TypeToken;

/**
 * 元数据查询相关接口，包括取维度的members和children
 * 
 * @author xiaoming.chen
 *
 */

@RestController
public class MetaQueryAction {
    
    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Resource
    private MetaDataService metaDataService;

    @Resource
    private QueryService queryService;

    @Resource
    private DataSourcePoolService dataSourcePoolService;

    @RequestMapping(value = "/meta/getMembers", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getMembers(@RequestBody String requestJson) {
        // 将请求信息全部JSON化，需要
        if (StringUtils.isBlank(requestJson)) {
            return ResponseResultUtils.getErrorResult("get members question is null", 100);
        }
        List<MiniCubeMember> members;
        String errorMsg = null;
        try {
            Map<String, String> requestParams = parseRequestJson(requestJson);

            ConfigQuestionModel questionModel =
                    AnswerCoreConstant.GSON.fromJson(requestParams.get(MiniCubeConnection.QUESTIONMODEL_PARAM_KEY),
                            ConfigQuestionModel.class);
            members = null;
            // 普通查询，认为查询相关信息在queryCondition中
            String dimName = null;
            String levelName = null;
            if (MapUtils.isNotEmpty(questionModel.getQueryConditions())) {
                // 这种肯定只有一个，如果超过一个，忽略
                dimName = questionModel.getQueryConditions().keySet().toArray(new String[] {})[0];
                // 转换失败，
                MetaCondition dimConfition = questionModel.getQueryConditions().get(dimName);
                if (dimConfition instanceof DimensionCondition) {
                    // 查询level的members的时候，查询条件的UniqueName存放的是level的name
                    levelName = ((DimensionCondition) dimConfition).getQueryDataNodes().get(0).getUniqueName();
                } else {
                    errorMsg = "meta condition is illegal";
                }
                DataSourceInfo dataSourceInfo = questionModel.getDataSourceInfo();
                if (dataSourceInfo == null) {
                    dataSourceInfo = dataSourcePoolService.getDataSourceInfo(questionModel.getDataSourceInfoKey());
                }
                Cube cube = questionModel.getCube();
                if (cube == null) {
                    cube = metaDataService.getCube(questionModel.getCubeId());
                }
                JsonUnSeriallizableUtils.fillCubeInfo(cube);
                levelName = MetaNameUtil.parseUnique2NameArray(levelName)[1];

                members =
                        metaDataService.getMembers(dataSourceInfo, cube, dimName, levelName,
                                questionModel.getRequestParams());
                List<MetaJsonDataInfo> metaJsons = new ArrayList<MetaJsonDataInfo>(members.size());
                if (CollectionUtils.isNotEmpty(members)) {
                    for (MiniCubeMember member : members) {
                        metaJsons.add(JsonUnSeriallizableUtils.parseMember2MetaJson(member));
                    }
                }
                StringBuilder sb = new StringBuilder();
                sb.append("get ").append(members.size()).append(" members from dimension:").append(dimName)
                        .append(" in level:").append(levelName);
                return ResponseResultUtils.getCorrectResult(sb.toString(), metaJsons);
            }
        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            // 一般不会出现，出现了说明模型有问题了
            errorMsg = "json syntax exception:" + e.getMessage();
        } catch (MiniCubeQueryException e) {
            e.printStackTrace();
            errorMsg = "query members error:" + e.getMessage();
        } catch (MetaException e) {
            e.printStackTrace();
            errorMsg = "meta is illegal," + e.getMessage();
        }
        // 走到这里说明已经出错了，状态码暂时设为100，后续加个状态码表
        return ResponseResultUtils.getErrorResult(errorMsg, 100);
    }

    @RequestMapping(value = "/meta/getChildren", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult getChildren(@RequestBody String requestJson) {
        // 将请求信息全部JSON化，需要
        if (StringUtils.isBlank(requestJson)) {
            return ResponseResultUtils.getErrorResult("get members question is null", 100);
        }
        List<MiniCubeMember> children;
        String errorMsg = null;
        try {
            Map<String, String> requestParams = parseRequestJson(requestJson);

            ConfigQuestionModel questionModel =
                    AnswerCoreConstant.GSON.fromJson(requestParams.get(MiniCubeConnection.QUESTIONMODEL_PARAM_KEY),
                            ConfigQuestionModel.class);
            children = null;
            // 普通查询，认为查询相关信息在queryCondition中
            String uniqueName = null;
            String metaName = null;
            if (MapUtils.isNotEmpty(questionModel.getQueryConditions())) {
                // 这种肯定只有一个，如果超过一个，忽略
                metaName = questionModel.getQueryConditions().keySet().toArray(new String[] {})[0];
                // 转换失败，
                MetaCondition dimConfition = questionModel.getQueryConditions().get(metaName);
                if (dimConfition instanceof DimensionCondition) {
                    uniqueName = ((DimensionCondition) dimConfition).getQueryDataNodes().get(0).getUniqueName();
                } else {
                    errorMsg = "meta condition is illegal";
                }
                DataSourceInfo dataSourceInfo = questionModel.getDataSourceInfo();
                if (dataSourceInfo == null) {
                    dataSourceInfo = dataSourcePoolService.getDataSourceInfo(questionModel.getDataSourceInfoKey());
                }
                Cube cube = questionModel.getCube();
                if (cube == null) {
                    cube = metaDataService.getCube(questionModel.getCubeId());
                }
                JsonUnSeriallizableUtils.fillCubeInfo(cube);

                children =
                        metaDataService.getChildren(dataSourceInfo, cube, uniqueName, questionModel.getRequestParams());
                if (CollectionUtils.isNotEmpty(children)) {
                    List<MetaJsonDataInfo> metaJsons = new ArrayList<MetaJsonDataInfo>(children.size());
                    for (MiniCubeMember member : children) {
                        metaJsons.add(JsonUnSeriallizableUtils.parseMember2MetaJson(member));
                    }
                    StringBuilder sb = new StringBuilder();
                    sb.append("get ").append(children.size()).append(" children from dimension:").append(metaName)
                            .append(" by uniqueName:").append(uniqueName);
                    return ResponseResultUtils.getCorrectResult(sb.toString(), metaJsons);
                }
            }
        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            // 一般不会出现，出现了说明模型有问题了
            errorMsg = "json syntax exception:" + e.getMessage();
        } catch (MiniCubeQueryException e) {
            e.printStackTrace();
            errorMsg = "query children error:" + e.getMessage();
        } catch (MetaException e) {
            e.printStackTrace();
            errorMsg = "meta is illegal," + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            errorMsg = "server error,msg" + e.getMessage();
        }
        // 走到这里说明已经出错了，状态码暂时设为100，后续加个状态码表
        return ResponseResultUtils.getErrorResult(errorMsg, 100);
    }

    @RequestMapping(value = "/query", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult query(@RequestBody String requestJson) {
    	long current = System.currentTimeMillis();
        // 将请求信息全部JSON化，需要
        if (StringUtils.isBlank(requestJson)) {
            return ResponseResultUtils.getErrorResult("get members question is null", 100);
        }
        String errorMsg = null;
        try {
            Map<String, String> requestParams = parseRequestJson(requestJson);

            ConfigQuestionModel questionModel =
                    AnswerCoreConstant.GSON.fromJson(requestParams.get(MiniCubeConnection.QUESTIONMODEL_PARAM_KEY),
                            ConfigQuestionModel.class);
            DataSourceInfo dataSourceInfo = questionModel.getDataSourceInfo();
            if (dataSourceInfo == null) {
                dataSourceInfo = dataSourcePoolService.getDataSourceInfo(questionModel.getDataSourceInfoKey());
            }
            Cube cube = questionModel.getCube();
            if (cube == null) {
                cube = metaDataService.getCube(questionModel.getCubeId());
            }
            JsonUnSeriallizableUtils.fillCubeInfo(cube);
            questionModel.setDataSourceInfo(dataSourceInfo);
            questionModel.setCube(cube);

            QueryContext queryContext = null;
            QueryContextSplitStrategy preSplitStrategy = null;
            // 拆分的查询会有查询上下文和当前拆分策略参数
            if (requestParams.containsKey(MiniCubeConnection.QUERYCONTEXT_PARAM_KEY)) {
                queryContext =
                        AnswerCoreConstant.GSON.fromJson(requestParams.get(MiniCubeConnection.QUERYCONTEXT_PARAM_KEY),
                                QueryContext.class);
            }
            if (requestParams.containsKey(MiniCubeConnection.SPLITSTRATEGY_PARAM_KEY)) {
                preSplitStrategy =
                        AnswerCoreConstant.GSON.fromJson(requestParams.get(MiniCubeConnection.SPLITSTRATEGY_PARAM_KEY),
                                QueryContextSplitStrategy.class);
            }

            DataModel dataModel = queryService.query(questionModel, queryContext, preSplitStrategy);
            logger.info("cost:" + (System.currentTimeMillis() - current) + " success to execute query.");
            return ResponseResultUtils.getCorrectResult("query success.", AnswerCoreConstant.GSON.toJson(dataModel));

        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            // 一般不会出现，出现了说明模型有问题了
            errorMsg = "json syntax exception:" + e.getMessage();
        } catch (MiniCubeQueryException e) {
            e.printStackTrace();
            errorMsg = "query error:" + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            errorMsg = "unexpected error:" + e.getMessage();
        }
        logger.error("cost:" + (System.currentTimeMillis() - current) + " error,errorMsg:" + errorMsg);
        // 走到这里说明已经出错了，状态码暂时设为100，后续加个状态码表
        return ResponseResultUtils.getErrorResult(errorMsg, 100);
    }

    private Map<String, String> parseRequestJson(String requestJson) {
        String[] requestArray = requestJson.split("&");
        Map<String, String> requestParams = new HashMap<String, String>();
        for (String request : requestArray) {
            String[] keyValue = request.split("=");
            String value = keyValue[1];
            try {
                value = URLDecoder.decode(value, "utf-8");
            } catch (UnsupportedEncodingException e) {
                logger.warn("decode value:" + value + " error", e);
            }
            requestParams.put(keyValue[0], value);
        }
        return requestParams;
    }

    @RequestMapping(value = "/publish", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult publish(@RequestBody String requestJson) {
        String errorMsg = null;
        try {
            if (StringUtils.isBlank(requestJson)) {
                return ResponseResultUtils.getErrorResult("get members question is null", 100);
            }

            Map<String, String> requestParams = parseRequestJson(requestJson);

            String listCubeJson = requestParams.get(MiniCubeConnection.CUBE_PARAM_KEY);
            String dataSourceJson = requestParams.get(MiniCubeConnection.DATASOURCEINFO_PARAM_KEY);
            List<Cube> cubes = AnswerCoreConstant.GSON.fromJson(listCubeJson, new TypeToken<List<Cube>>() {
            }.getType());
            DataSourceInfo dataSourceInfo = AnswerCoreConstant.GSON.fromJson(dataSourceJson, DataSourceInfo.class);
            metaDataService.publish(cubes, dataSourceInfo);
            return ResponseResultUtils.getCorrectResult("success", "public cubes success.");
        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            errorMsg = "json parse error," + e.getMessage();
        } catch (DataSourceException e) {
            e.printStackTrace();
            errorMsg = "init datasource error." + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            errorMsg = "unexpected error:" + e.getMessage();
        }

        // 走到这里说明已经出错了，状态码暂时设为100，后续加个状态码表
        return ResponseResultUtils.getErrorResult(errorMsg, 100);
    }

    @RequestMapping(value = "/lookUp", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult lookUp(@RequestBody String requestJson) {
        String errorMsg = null;
        try {
            if (StringUtils.isBlank(requestJson)) {
                return ResponseResultUtils.getErrorResult("get members question is null", 100);
            }

            Map<String, String> requestParams = parseRequestJson(requestJson);

            ConfigQuestionModel questionModel =
                    AnswerCoreConstant.GSON.fromJson(requestParams.get(MiniCubeConnection.QUESTIONMODEL_PARAM_KEY),
                            ConfigQuestionModel.class);

            MetaCondition uniqueNameCondition =
                    questionModel.getQueryConditions().get(MiniCubeConnection.UNIQUENAME_PARAM_KEY);

            if (uniqueNameCondition != null && uniqueNameCondition instanceof DimensionCondition) {
                DimensionCondition dimCondition = (DimensionCondition) uniqueNameCondition;
                String uniqueName =
                        CollectionUtils.isNotEmpty(dimCondition.getQueryDataNodes()) ? dimCondition.getQueryDataNodes()
                                .get(0).getUniqueName() : null;
                MiniCubeMember member =
                        metaDataService.lookUp(questionModel.getDataSourceInfo(), questionModel.getCube(), uniqueName,
                                questionModel.getRequestParams());

                return ResponseResultUtils.getCorrectResult("return member:" + member.getName(),
                        JsonUnSeriallizableUtils.parseMember2MetaJson(member));
            }
            errorMsg =
                    "can not get uniquename info from questionmodel:"
                            + requestParams.get(MiniCubeConnection.QUESTIONMODEL_PARAM_KEY);

        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            errorMsg = "json parse error," + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            errorMsg = "unexpected error:" + e.getMessage();
        }

        // 走到这里说明已经出错了，状态码暂时设为100，后续加个状态码表
        return ResponseResultUtils.getErrorResult(errorMsg, 100);
    }

    @RequestMapping(value = "/refresh", method = RequestMethod.POST)
    @ResponseBody
    public ResponseResult refresh(@RequestBody String requestJson) {
        // 将请求信息全部JSON化，需要
        String errorMsg = null;
        try {
            if (StringUtils.isBlank(requestJson)) {
                return ResponseResultUtils.getErrorResult("get members question is null", 100);
            }

            Map<String, String> requestParams = parseRequestJson(requestJson);

            String listCubeJson = requestParams.get(MiniCubeConnection.CUBE_PARAM_KEY);
            String dataSourceJson = requestParams.get(MiniCubeConnection.DATASOURCEINFO_PARAM_KEY);
            List<Cube> cubes = AnswerCoreConstant.GSON.fromJson(listCubeJson, new TypeToken<List<Cube>>() {
            }.getType());
            DataSourceInfo dataSourceInfo = AnswerCoreConstant.GSON.fromJson(dataSourceJson, DataSourceInfo.class);
            metaDataService.publish(cubes, dataSourceInfo);
            return ResponseResultUtils.getCorrectResult("success", "public cubes success.");
        } catch (JsonSyntaxException e) {
            e.printStackTrace();
            errorMsg = "json parse error," + e.getMessage();
        } catch (DataSourceException e) {
            e.printStackTrace();
            errorMsg = "init datasource error." + e.getMessage();
        } catch (Exception e) {
            e.printStackTrace();
            errorMsg = "unexpected error:" + e.getMessage();
        }

        // 走到这里说明已经出错了，状态码暂时设为100，后续加个状态码表
        return ResponseResultUtils.getErrorResult(errorMsg, 100);

    }

}
