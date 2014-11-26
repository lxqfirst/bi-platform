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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ac.exception.MiniCubeQueryException;
import com.baidu.rigel.biplatform.ac.minicube.MiniCube;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeLevel;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMember;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.Level;
import com.baidu.rigel.biplatform.ac.model.LevelType;
import com.baidu.rigel.biplatform.ac.model.Member;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.ac.util.MetaNameUtil;
import com.baidu.rigel.biplatform.tesseract.exception.MetaException;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexAndSearchException;
import com.baidu.rigel.biplatform.tesseract.isservice.search.service.SearchService;
import com.baidu.rigel.biplatform.tesseract.meta.DimensionMemberService;
import com.baidu.rigel.biplatform.tesseract.meta.MetaDataService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.Expression;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.From;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryObject;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.Where;
import com.baidu.rigel.biplatform.tesseract.resultset.TesseractResultSet;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.ResultRecord;

/**
 * sql类型维度维值获取实现
 * 
 * @author xiaoming.chen
 *
 */
@Service(DimensionMemberService.SQL_MEMBER_SERVICE)
public class SqlDimensionMemberServiceImpl implements DimensionMemberService {

    /**
     * log
     */
    private Logger log = Logger.getLogger(this.getClass());

    /**
     * searchService
     */
    @Resource
    private SearchService searchService;
    
    @Resource
    private TaskExecutor taskExecutor;

    @Override
    public List<MiniCubeMember> getMembers(Cube cube, Level level, DataSourceInfo dataSourceInfo, Member parentMember,
            Map<String, String> params) throws MiniCubeQueryException {
        if (cube == null || level == null || dataSourceInfo == null || !dataSourceInfo.validate()) {
            StringBuilder sb = new StringBuilder();
            sb.append("param illegal,cube:").append(cube).append(" level:").append(level).append(" datasourceInfo:")
                    .append(dataSourceInfo);
            throw new IllegalArgumentException(sb.toString());
        }
        MiniCubeLevel queryLevel = (MiniCubeLevel) level;
        // 发出的查询SQL类似 select name,caption from dim_table where pid = 1 and parentValue=0 group by name,caption
        QueryRequest nameQuery = buildQueryRequest(cube, queryLevel, parentMember, dataSourceInfo);
        nameQuery.setDataSourceInfo(dataSourceInfo);
        // 调用查询接口开始查询，查询返回一个resultSet
        List<MiniCubeMember> members = null;
        try {
            TesseractResultSet resultSet = searchService.query(nameQuery);
            members = buildMembersFromCellSet(resultSet, queryLevel, parentMember, dataSourceInfo, cube);
        } catch (MiniCubeQueryException e) {
            log.error("get members error,queryLevel:" + queryLevel + " parentMember:" + parentMember, e);
            throw e;
        } catch (IndexAndSearchException e) {
            log.error("get members error,queryLevel:" + queryLevel + " parentMember:" + parentMember, e);
            throw new MiniCubeQueryException("get members error,queryLevel:" + queryLevel + " parentMember:"
                    + parentMember, e);
        }
        return members;

    }

    /**
     * 将查询的结果集封装成member
     * 
     * @param resultSet
     * @param queryLevel
     * @param parentMember
     * @param dataSourceInfo
     * @param cube
     * @return
     * @throws MiniCubeQueryException
     */
    private List<MiniCubeMember> buildMembersFromCellSet(TesseractResultSet resultSet, MiniCubeLevel queryLevel,
            Member parentMember, DataSourceInfo dataSourceInfo, Cube cube) throws MiniCubeQueryException {
        try {
            List<MiniCubeMember> result = new ArrayList<MiniCubeMember>(resultSet.size());
            // CountDownLatch latch = new CountDownLatch(resultSet.size());
            while (resultSet.next()) {
                ResultRecord record = resultSet.getCurrentRecord();
                // taskExecutor.execute(new Runnable() {
                // @Override
                // public void run() {
                // try {
                String value = record.getField(queryLevel.getSource()).toString();
                if (value == null) {
                    log.warn("can not get:" + queryLevel.getSource() + " from record:" + record);
                    continue;
                    // return;
                }
                MiniCubeMember member = new MiniCubeMember(value);
                member.setLevel(queryLevel);
                if (StringUtils.isNotBlank(queryLevel.getCaptionColumn())) {
                    member.setCaption(record.getField(queryLevel.getCaptionColumn()).toString());
                }
                member.setParent(parentMember);
                // 手动调用生成一下UniqueName，这时候生成代价最小
                member.generateUniqueName(null);
                // 需要查询Member对应的最细粒度节点，即与事实表关联的字段的外键
                if (StringUtils.isNotBlank(queryLevel.getPrimaryKey())
                        && !StringUtils.equals(queryLevel.getSource(), queryLevel.getPrimaryKey())) {
                    QueryRequest request = createQueryRequest(cube, queryLevel, dataSourceInfo);
                    request.selectAndGroupBy(queryLevel.getPrimaryKey());

                    request.setWhere(new Where());
                    Expression expression = new Expression(queryLevel.getSource());
                    expression.getQueryValues().add(new QueryObject(member.getName()));
                    request.getWhere().getAndList().add(expression);
                    // 发起查询叶子节点的查询
                    TesseractResultSet leafResultSet = searchService.query(request);
                    while (leafResultSet.next()) {
                        member.getQueryNodes().add(leafResultSet.getString(queryLevel.getPrimaryKey()));
                    }
                } else if (queryLevel.isParentChildLevel()) {
                	QueryRequest request = createQueryRequest(cube, queryLevel, dataSourceInfo);
                    request.selectAndGroupBy(queryLevel.getPrimaryKey());

                    request.setWhere(new Where());
                    Expression expression = new Expression(queryLevel.getParent());
                    expression.getQueryValues().add(new QueryObject(member.getName()));
                    request.getWhere().getAndList().add(expression);
                    log.info("query member leaf nodes,queryRequest:" + request);
                    TesseractResultSet leafResultSet = searchService.query(request);
                    if(leafResultSet == null || leafResultSet.size() == 0) {
                        member.getQueryNodes().add(member.getName());
                    }else {
                        while (leafResultSet.next()) {
                            member.getQueryNodes().add(leafResultSet.getString(queryLevel.getPrimaryKey()));
                        }
                    }
                } else {
                    member.getQueryNodes().add(member.getName());
                }
                result.add(member);
                // latch.countDown();
                // } catch (Exception e) {
                // e.printStackTrace();
                // throw new RuntimeException(e);
                // }
                // }
                // });
            }
//            latch.await();
            Collections.sort(result, (m1,m2) -> {
               return m1.getName().compareTo(m2.getName());
            });
            return result;
        } catch (Exception e) {
            log.error("build members error:" + e.getMessage(), e);
            throw new MiniCubeQueryException(e.getMessage(), e);
        }
    }

    /**
     * @param cube
     * @param queryLevel
     * @return
     */
    private QueryRequest createQueryRequest(Cube cube, MiniCubeLevel queryLevel, DataSourceInfo dataSourceInfo) {
        QueryRequest queryRequest = new QueryRequest();
        queryRequest.setDataSourceInfo(dataSourceInfo);
        queryRequest.setCubeName(cube.getName());
        queryRequest.setCubeId(cube.getId());
        From from = new From(queryLevel.getDimTable());
        queryRequest.setFrom(from);
        if (StringUtils.isBlank(queryLevel.getDimTable())) {
            from.setFrom(((MiniCube) cube).getSource());
        }
        return queryRequest;
    }

    /**
     * @param cube
     * @param queryLevel
     * @param parentMember
     * @param dataSourceInfo
     * @return
     */
    private QueryRequest buildQueryRequest(Cube cube, MiniCubeLevel queryLevel, Member parentMember,
            DataSourceInfo dataSourceInfo) {
        // 查询节点信息需要分2次查询，
        // 1.查询节点的ID和对应的显示名称（必须）
        // 2.查询节点对应事实表的字段查询的ID，如果该字段和本身的ID字段一致，可忽略
        QueryRequest queryRequest = new QueryRequest();
        queryRequest.setDataSourceInfo(dataSourceInfo);
        queryRequest.setCubeName(cube.getName());
        queryRequest.setCubeId(cube.getId());
        From from = new From(queryLevel.getDimTable());
        queryRequest.setFrom(from);
        if (StringUtils.isBlank(queryLevel.getDimTable())) {
            from.setFrom(((MiniCube) cube).getSource());
        }
        // 查询的ID字段，需要groupBy
        queryRequest.selectAndGroupBy(queryLevel.getSource());
        // 先把caption也进行groupby吧，要不一个ID对应多个名称不知道怎么取
        if (StringUtils.isNotBlank(queryLevel.getCaptionColumn())) {
            queryRequest.selectAndGroupBy(queryLevel.getCaptionColumn());
        }
        // 父节点不为空，且和当前查询level查的是同一个表，那么需要添加父节点的限制
        Where where = new Where();
        if (queryLevel.isParentChildLevel()) {
            Expression expression = null;
            if (parentMember == null || parentMember.isAll()) {
                expression = new Expression(queryLevel.getParent());
                expression.getQueryValues().add(new QueryObject(queryLevel.getNullParentValue()));
                // 判断2个level从同一个维度表获取
            } else if (parentMember != null && parentMember.getLevel() != null
                    && StringUtils.equals(parentMember.getLevel().getDimTable(), queryLevel.getDimTable())) {
                if (parentMember.getLevel().getType().equals(LevelType.USER_CUSTOM)) {
                    throw new UnsupportedOperationException("no supported user custom group level");
                    // 父节点的level和当前查询的level为同一个level，说明直接用parent=父节点的名称
                } else if (StringUtils.equals(parentMember.getLevel().getName(), queryLevel.getName())) {
                    expression = new Expression(queryLevel.getParent());
                    expression.getQueryValues().add(new QueryObject(parentMember.getName()));
                } else {
                    // 先获取parentMember所属的Level
                    if (parentMember.getLevel().getType().equals(LevelType.CALL_BACK)) {
                        expression = new Expression(parentMember.getLevel().getPrimaryKey());
                        expression.getQueryValues().add(new QueryObject(parentMember.getName()));

                    } else if (!parentMember.getLevel().getType().equals(LevelType.USER_CUSTOM)) {
                        MiniCubeLevel parentLevel = (MiniCubeLevel) parentMember.getLevel();
                        expression = new Expression(parentLevel.getSource());
                        expression.getQueryValues().add(new QueryObject(parentMember.getName()));
                    }
                    Expression parentExpression = new Expression(queryLevel.getParent());
                    parentExpression.getQueryValues().add(new QueryObject(queryLevel.getNullParentValue()));
                    where.getAndList().add(parentExpression);
                }
            }
            if (expression != null) {
                where.getAndList().add(expression);
            }
        } else {
            Expression expression = null;
            if (parentMember != null && !parentMember.isAll() && parentMember.getLevel() != null
                    && StringUtils.equals(parentMember.getLevel().getDimTable(), queryLevel.getDimTable())) {
                if (parentMember.getLevel().getType().equals(LevelType.CALL_BACK)) {
                    expression = new Expression(parentMember.getLevel().getPrimaryKey());
                    expression.getQueryValues().add(new QueryObject(parentMember.getName()));
                } else if (!parentMember.getLevel().getType().equals(LevelType.USER_CUSTOM)) {
                    MiniCubeLevel parentLevel = (MiniCubeLevel) parentMember.getLevel();
                    expression = new Expression(parentLevel.getSource());
                    expression.getQueryValues().add(new QueryObject(parentMember.getName()));
                }
            }

            if (expression != null) {
                where.getAndList().add(expression);
            }
        }
        queryRequest.setWhere(where);

        return queryRequest;
    }

    @Override
    public MiniCubeMember getMemberFromLevelByName(DataSourceInfo dataSourceInfo, Cube cube, Level level, String name,
            MiniCubeMember parent, Map<String, String> params) throws MiniCubeQueryException, MetaException {
        if (level == null || StringUtils.isBlank(name)) {
            throw new IllegalArgumentException("level is null or name is blank");
        }
        MetaDataService.checkCube(cube);
        MetaDataService.checkDataSourceInfo(dataSourceInfo);

        MiniCubeLevel queryLevel = (MiniCubeLevel) level;
        QueryRequest queryRequest = buildQueryRequest(cube, queryLevel, parent, dataSourceInfo);
        Expression expression = new Expression(queryLevel.getSource());
        expression.getQueryValues().add(new QueryObject(name));
        queryRequest.getWhere().getAndList().add(expression);
        log.info("query members,queryRequest:" + queryRequest);
        MiniCubeMember result = new MiniCubeMember(name);
        result.setLevel(queryLevel);
        try {
        	// 这里的查询主要为了校验数据库是否存在，如果不存在抛异常，后续需要对这个加上配置处理。如果不存在可以不抛异常，直接跳过。。
            TesseractResultSet resultSet = searchService.query(queryRequest);
            if(!resultSet.next()){
            	log.error("no result return by query:" + queryRequest);
            	throw new MetaException("no result return by query:" + queryRequest);
            }
            if (StringUtils.isNotBlank(queryLevel.getCaptionColumn())) {
                result.setCaption(resultSet.getString(queryLevel.getCaptionColumn()));
            }
            result.setParent(parent);
            if (MetaNameUtil.isAllMemberName(name)) {
                QueryRequest request = createQueryRequest(cube, queryLevel, dataSourceInfo);
                if (StringUtils.isNotBlank(queryLevel.getPrimaryKey())) {
                    request.selectAndGroupBy(queryLevel.getPrimaryKey());
                } else {
                    request.selectAndGroupBy(queryLevel.getSource());
                }

                request.setWhere(new Where());
                if (queryLevel.isParentChildLevel()) {
                    expression = new Expression(queryLevel.getParent());
                    expression.getQueryValues().add(new QueryObject(queryLevel.getNullParentValue()));
                }
                request.getWhere().getAndList().add(expression);
                TesseractResultSet leafResultSet = searchService.query(request);
                while (leafResultSet.next()) {
                    result.getQueryNodes().add(leafResultSet.getString(queryLevel.getPrimaryKey()));
                }

            } else if (StringUtils.isNotBlank(queryLevel.getPrimaryKey())
                    && !StringUtils.equals(queryLevel.getSource(), queryLevel.getPrimaryKey())) {
                QueryRequest request = createQueryRequest(cube, queryLevel, dataSourceInfo);
                request.selectAndGroupBy(queryLevel.getPrimaryKey());

                request.setWhere(new Where());
                expression = new Expression(queryLevel.getSource());
                expression.getQueryValues().add(new QueryObject(result.getName()));
                request.getWhere().getAndList().add(expression);
                log.info("query member leaf nodes,queryRequest:" + request);
                TesseractResultSet leafResultSet = searchService.query(request);
                while (leafResultSet.next()) {
                    result.getQueryNodes().add(leafResultSet.getString(queryLevel.getPrimaryKey()));
                }
            } else if (queryLevel.isParentChildLevel()){
            	QueryRequest request = createQueryRequest(cube, queryLevel, dataSourceInfo);
                request.selectAndGroupBy(queryLevel.getPrimaryKey());

                request.setWhere(new Where());
                expression = new Expression(queryLevel.getParent());
                expression.getQueryValues().add(new QueryObject(result.getName()));
                request.getWhere().getAndList().add(expression);
                log.info("query member leaf nodes,queryRequest:" + request);
                TesseractResultSet leafResultSet = searchService.query(request);
                while (leafResultSet.next()) {
                    result.getQueryNodes().add(leafResultSet.getString(queryLevel.getPrimaryKey()));
                }
            } else {
                result.getQueryNodes().add(name);
            }

        } catch (Exception e) {
            log.error("error occur when get name:" + name + " from level:" + level, e);
            throw new MiniCubeQueryException(e);
        }
        return result;
    }

}
