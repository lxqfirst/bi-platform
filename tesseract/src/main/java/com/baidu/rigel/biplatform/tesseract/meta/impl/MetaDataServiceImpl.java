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
 */
package com.baidu.rigel.biplatform.tesseract.meta.impl;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.BeanFactoryAware;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.cache.Cache;
import org.springframework.stereotype.Service;

import com.baidu.rigel.biplatform.ac.exception.MiniCubeQueryException;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMember;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.Dimension;
import com.baidu.rigel.biplatform.ac.model.Level;
import com.baidu.rigel.biplatform.ac.model.LevelType;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourcePoolService;
import com.baidu.rigel.biplatform.tesseract.exception.MetaException;
import com.baidu.rigel.biplatform.tesseract.isservice.event.InitMiniCubeEvent;
import com.baidu.rigel.biplatform.tesseract.isservice.event.InitMiniCubeEvent.InitMiniCubeInfo;
import com.baidu.rigel.biplatform.tesseract.meta.DimensionMemberService;
import com.baidu.rigel.biplatform.tesseract.meta.MetaDataService;
import com.baidu.rigel.biplatform.tesseract.store.service.StoreManager;
import com.google.common.collect.Lists;

/**
 * 元数据实际查询操作实现
 * 
 * @author xiaoming.chen
 *
 */
@Service
public class MetaDataServiceImpl implements MetaDataService, BeanFactoryAware {

    /**
     * dataSourcePoolService
     */
    @Resource
    private DataSourcePoolService dataSourcePoolService;

    /**
     * storeManager
     */
    @Resource
    private StoreManager storeManager;

    /**
     * dimensionMemberServiceMap 获取维值的所有实现
     */
    private Map<String, DimensionMemberService> dimensionMemberServiceMap;

    @Override
    public Cube getCube(String cubeId) throws MiniCubeQueryException {
        if (StringUtils.isBlank(cubeId)) {
            throw new IllegalArgumentException("can not get cube by empty cube id.");
        }
        Cache cache = storeManager.getDataStore(CUBE_CACHE_NAME);
        Cube result = StoreManager.getFromCache(cache, cubeId, Cube.class);
        if (result == null) {
            throw new MiniCubeQueryException("can not get cube by cackeKey:" + cubeId);
        }
        return result;
    }

    @Override
    public void cacheCube(Cube cube) {
        if (cube == null) {
            throw new IllegalArgumentException("cube is null");
        }
        Cache cache = storeManager.getDataStore(CUBE_CACHE_NAME);

        cache.put(cube.getId(), cube);
        // 后续需要考虑如果cache中已经存在对应ID的cube是覆盖还是抛异常

    }

    @Override
    public List<MiniCubeMember> getMembers(String dataSourceInfoKey, String cubeId, String dimensionName,
            String levelName, Map<String, String> params) throws MiniCubeQueryException, MetaException {
        DataSourceInfo dataSourceInfo = dataSourcePoolService.getDataSourceInfo(dataSourceInfoKey);
        if (dataSourceInfo == null || !dataSourceInfo.validate()) {
            throw new MiniCubeQueryException("dataSourceInfo is null or invalidate :" + dataSourceInfo);
        }
        Cube cube = getCube(cubeId);
        if (cube == null) {
            throw new MiniCubeQueryException("can not get cube by cubeId:" + cubeId);
        }
        return getMembers(dataSourceInfo, cube, dimensionName, levelName, params);

    }

    @Override
    public List<MiniCubeMember> getMembers(DataSourceInfo dataSource, Cube cube, String dimensionName,
            String levelName, Map<String, String> params) throws MiniCubeQueryException, MetaException {
        MetaDataService.checkCube(cube);
        MetaDataService.checkDataSourceInfo(dataSource);
        Dimension dimension = cube.getDimensions().get(dimensionName);
        if (dimension == null) {
            throw new MiniCubeQueryException("cube:" + cube + " not contain dimension:" + dimensionName);
        }
        Level level = dimension.getLevels().get(levelName);
        if (level == null) {
            throw new MiniCubeQueryException("can not get level by name:" + levelName + " in dimension:" + dimension);
        }
        return DimensionMemberService.getDimensionMemberServiceByLevelType(level.getType()).getMembers(cube, level,
                dataSource, null, params);
    }

    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        ListableBeanFactory listBeanFactory = (ListableBeanFactory) beanFactory;
        dimensionMemberServiceMap = listBeanFactory.getBeansOfType(DimensionMemberService.class);
    }

    @Override
    public List<MiniCubeMember> getChildren(String dataSourceInfoKey, String cubeId, String uniqueName,
            Map<String, String> params) throws MiniCubeQueryException, MetaException {

        DataSourceInfo dataSourceInfo = dataSourcePoolService.getDataSourceInfo(dataSourceInfoKey);
        Cube cube = getCube(cubeId);
        return getChildren(dataSourceInfo, cube, uniqueName, params);

    }

    @Override
    public List<MiniCubeMember> getChildren(DataSourceInfo dataSource, Cube cube, String uniqueName,
            Map<String, String> params) throws MiniCubeQueryException, MetaException {

        DimensionMemberService memberService = dimensionMemberServiceMap.get(DimensionMemberService.SQL_MEMBER_SERVICE);
        MiniCubeMember member = memberService.lookUp(dataSource, cube, uniqueName, params);
        return getChildren(dataSource, cube, member, params);
    }

    @Override
    public List<MiniCubeMember> getChildren(String dataSourceInfoKey, String cubeId, MiniCubeMember member,
            Map<String, String> params) throws MiniCubeQueryException, MetaException {
        DataSourceInfo dataSourceInfo = dataSourcePoolService.getDataSourceInfo(dataSourceInfoKey);
        Cube cube = getCube(cubeId);
        return getChildren(dataSourceInfo, cube, member, params);
    }

    @Override
    public List<MiniCubeMember> getChildren(DataSourceInfo dataSource, Cube cube, MiniCubeMember member,
            Map<String, String> params) throws MiniCubeQueryException, MetaException {
        MetaDataService.checkCube(cube);
        MetaDataService.checkDataSourceInfo(dataSource);
        Dimension dimension = member.getLevel().getDimension();
        Level level = member.getLevel();
        if (!member.isAll() && !level.getType().equals(LevelType.CALL_BACK)) {
            List<Level> levels = Lists.newArrayList(dimension.getLevels().values());
            int levelIndex = -1;
            for (int i = 0; i < levels.size(); i++) {
                if (levels.get(i).getName().equals(member.getLevel().getName())) {
                    levelIndex = i;
                    break;
                }
            }
            if (level.getType().equals(LevelType.PARENT_CHILD)) {
                level = levels.get(levelIndex);
            } else if (levelIndex == -1 || (levelIndex + 1) >= levels.size()) {
                return Lists.newArrayList();
                // LOG.error("can not get level :" + member.getLevel().getName() + " in dimension:" + dimension);
                // throw new MetaException("can not get level :" + member.getLevel().getName() + " in dimension:" +
                // dimension);
            } else {
                // 取当前层级的下一层级
                level = levels.get(levelIndex + 1);
            }
        }

        return DimensionMemberService.getDimensionMemberServiceByLevelType(level.getType()).getMembers(cube, level,
                dataSource, member, params);
    }

    @Override
    public MiniCubeMember lookUp(String dataSourceKey, String cubeId, String uniqueName, Map<String, String> params)
            throws MiniCubeQueryException, MetaException {
        DataSourceInfo dataSourceInfo = dataSourcePoolService.getDataSourceInfo(dataSourceKey);
        MetaDataService.checkDataSourceInfo(dataSourceInfo);
        Cube cube = getCube(cubeId);
        MetaDataService.checkCube(cube);
        return lookUp(dataSourceInfo, cube, uniqueName, params);
    }

    @Override
    public MiniCubeMember lookUp(DataSourceInfo dataSource, Cube cube, String uniqueName, Map<String, String> params)
            throws MiniCubeQueryException, MetaException {
        MetaDataService.checkCube(cube);
        MetaDataService.checkDataSourceInfo(dataSource);
        DimensionMemberService memberService = dimensionMemberServiceMap.get(DimensionMemberService.SQL_MEMBER_SERVICE);
        return memberService.lookUp(dataSource, cube, uniqueName, params);
    }

    @Override
    public void publish(List<Cube> cubes, DataSourceInfo dataSourceInfo) throws Exception {
        // 将数据源信息和cube信息先扔到缓存中
        dataSourcePoolService.initDataSourceInfo(dataSourceInfo);
        if (CollectionUtils.isNotEmpty(cubes)) {
            cubes.forEach((cube) -> cacheCube(cube));
        }
        // TODO 测试完成后，需要将最后一个参数改成false
        InitMiniCubeInfo miniCubeInfo = new InitMiniCubeInfo(cubes, dataSourceInfo, true, false);

        InitMiniCubeEvent miniCubeEvent = new InitMiniCubeEvent(miniCubeInfo);
        storeManager.putEvent(miniCubeEvent);
    }

}
