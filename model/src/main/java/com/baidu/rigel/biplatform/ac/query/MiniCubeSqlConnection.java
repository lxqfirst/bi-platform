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
package com.baidu.rigel.biplatform.ac.query;

import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.baidu.rigel.biplatform.ac.exception.MiniCubeQueryException;
import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ac.query.data.impl.SqlDataSourceInfo;
import com.baidu.rigel.biplatform.ac.query.model.QuestionModel;
import com.baidu.rigel.biplatform.ac.util.AnswerCoreConstant;
import com.baidu.rigel.biplatform.ac.util.ConfigInfoUtils;
import com.baidu.rigel.biplatform.ac.util.HttpRequest;
import com.baidu.rigel.biplatform.ac.util.JsonUnSeriallizableUtils;
import com.baidu.rigel.biplatform.ac.util.ResponseResult;

/**
 * minicube sql 连接
 * 
 * @author xiaoming.chen
 *
 */
public class MiniCubeSqlConnection implements MiniCubeConnection {

    private Logger log = LoggerFactory.getLogger(this.getClass());
    /**
     * sqlDataSourceInfo
     */
    private SqlDataSourceInfo sqlDataSourceInfo;

    /**
     * construct with
     * 
     * @param cube cube对象
     * @param dataSourceInfo 数据源信息
     */
    protected MiniCubeSqlConnection(SqlDataSourceInfo dataSourceInfo) {
        this.sqlDataSourceInfo = dataSourceInfo;
    }

    @Override
    public DataModel query(QuestionModel questionModel) throws MiniCubeQueryException {
        long current = System.currentTimeMillis();
        Map<String, String> params = new HashMap<String, String>();

        params.put(QUESTIONMODEL_PARAM_KEY, AnswerCoreConstant.GSON.toJson(questionModel));
        String response = HttpRequest.sendPost(ConfigInfoUtils.getServerAddress() + "/query", params);
        ResponseResult responseResult = AnswerCoreConstant.GSON.fromJson(response, ResponseResult.class);
        if (StringUtils.isNotBlank(responseResult.getData())) {
            String dataModelJson = responseResult.getData().replace("\\", "");
            dataModelJson = dataModelJson.substring(1, dataModelJson.length() - 1);
            DataModel dataModel = JsonUnSeriallizableUtils.dataModelFromJson(dataModelJson);
            StringBuilder sb = new StringBuilder();
            sb.append("execute query questionModel:").append(questionModel).append(" cost:")
                    .append(System.currentTimeMillis() - current).append("ms");
            log.info(sb.toString());
            return dataModel;
        }
        throw new MiniCubeQueryException("query occur error,msg:" + responseResult.getStatusInfo());
    }

    /**
     * getter method for property sqlDataSourceInfo
     * 
     * @return the sqlDataSourceInfo
     */
    public SqlDataSourceInfo getSqlDataSourceInfo() {
        return sqlDataSourceInfo;
    }

    @Override
    public void close() {
        // 发起远程清理cube池子的请求 close的话，close当前connection的cube
        throw new UnsupportedOperationException("not implement yet.");
    }

    @Override
    public void refresh() {
        // 发布刷新
        throw new UnsupportedOperationException("not implement yet.");
    }

    // public static void main(String[] args) throws IOException, MiniCubeQueryException {
    // File f = new File("c:/questioModel.json");
    // BufferedReader br = new BufferedReader(new FileReader(f));
    // StringBuilder sb = new StringBuilder();
    // String lineStr = null;
    // while ((lineStr = br.readLine()) != null) {
    // sb.append(lineStr);
    // sb.append(System.getProperty("line.separator"));
    // }
    // System.out.println(sb.toString());
    // ConfigQuestionModel question = AnswerCoreConstant.GSON.fromJson(sb.toString(), ConfigQuestionModel.class);
    // System.out.println(question);
    //
    // br.close();
    //
    // JsonUnSeriallizableUtils.fillCubeInfo(question.getCube());
    // Map<String, String> params = new HashMap<String, String>();
    // params.put("question", sb.toString());
    //
    // // System.out.println(question.getCube().lookUp(question.getDataSourceInfo(), "[trade].[All_trades]",
    // question.getRequestParams()));
    //
    //
    // MiniCubeConnection connection = MiniCubeDriverManager.getConnection(question.getDataSourceInfo());
    //
    // List<Cube> cubes = new ArrayList<Cube>();
    // cubes.add(question.getCube());
    // // connection.publishCubes(cubes, question.getDataSourceInfo());
    //
    //
    //
    // // Dimension tradeDim = question.getCube().getDimensions().get("dim_pos");
    // // Level tLevel = tradeDim.getLevels().get("shw");
    // //
    // // Member allMember = tradeDim.getAllMember();
    // //
    // // List<Member> members = allMember.getChildMembers(question.getCube(), question.getDataSourceInfo(), null);
    // // System.out.println(members);
    // //
    // // List<Member> children = members.get(0).getChildMembers(question.getCube(), question.getDataSourceInfo(),
    // null);
    // //
    // // System.out.println(tLevel.getMembers(question.getCube(), question.getDataSourceInfo(), null));
    //
    //
    //
    // String result = HttpRequest.sendPost("http://127.0.0.1:8080/query", params);
    // System.out.println(result);
    // ResponseResult responseResu = AnswerCoreConstant.GSON.fromJson(result, ResponseResult.class);
    // System.out.println(responseResu.getData());
    // System.out.println(responseResu.getData().replace("\\", ""));
    // String dataModelJson = responseResu.getData().replace("\\", "");
    // dataModelJson = dataModelJson.substring(1, dataModelJson.length() - 1);
    // System.out.println("++" + dataModelJson);
    // System.out.println(AnswerCoreConstant.GSON.fromJson(dataModelJson, DataModel.class));
    //
    //
    //
    //
    // sb.setLength(0);
    // br = new BufferedReader(new FileReader("c:/测试.txt"));
    // while ((lineStr = br.readLine()) != null) {
    // sb.append(lineStr);
    // sb.append(System.getProperty("line.separator"));
    // }
    // System.out.println(sb.toString());
    //
    // // MiniCubeSchema schema = AnswerCoreConstant.GSON.fromJson(sb.toString(), MiniCubeSchema.class);
    // //
    // //
    // // MiniCube cube = schema.getCubes().get("27da32f1b32b73e66fba136bd13ee106");
    // // JsonUnSeriallizableUtils.parseCubeJson(AnswerCoreConstant.GSON.toJson(cube));
    //
    // br.close();
    //
    // MetaJsonDataInfo test = new MetaJsonDataInfo(MetaType.Member);
    // test.setCubeId("cubeId");
    // test.setMemberUniqueName("[dim].[test]");
    //
    // String testStr = AnswerCoreConstant.GSON.toJson(test);
    // System.out.println(testStr);
    // MetaJsonDataInfo testFromJson = AnswerCoreConstant.GSON.fromJson(testStr, MetaJsonDataInfo.class);
    // System.out.println(testFromJson);
    // }

}