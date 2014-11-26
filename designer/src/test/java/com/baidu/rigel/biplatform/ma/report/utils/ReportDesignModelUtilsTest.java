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
package com.baidu.rigel.biplatform.ma.report.utils;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.Assert;
import org.junit.Test;

import com.baidu.rigel.biplatform.ac.minicube.MiniCube;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeDimension;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeMeasure;
import com.baidu.rigel.biplatform.ac.minicube.MiniCubeSchema;
import com.baidu.rigel.biplatform.ac.minicube.StandardDimension;
import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.Dimension;
import com.baidu.rigel.biplatform.ac.model.Measure;
import com.baidu.rigel.biplatform.ma.model.utils.UuidGeneratorUtils;
import com.baidu.rigel.biplatform.ma.report.model.ExtendArea;
import com.baidu.rigel.biplatform.ma.report.model.Item;
import com.baidu.rigel.biplatform.ma.report.model.LogicModel;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;

/**
 * 
 * 报表模型工具测试类
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class ReportDesignModelUtilsTest {
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithNullModel() {
        List<Cube> cubes = ReportDesignModelUtils.getCubes(null);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithNullArea() {
        ReportDesignModel model = new ReportDesignModel();
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithEmptyArea() {
        ReportDesignModel model = new ReportDesignModel();
        Map<String, ExtendArea> area = new HashMap<String, ExtendArea>();
        model.setExtendAreas(area);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithNullLogicModel() {
        ReportDesignModel model = new ReportDesignModel();
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setId(UuidGeneratorUtils.generate());
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithNullItem() {
        ReportDesignModel model = new ReportDesignModel();
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithNullSchema() {
        ReportDesignModel model = new ReportDesignModel();
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCubesWithNullCubes() {
        ReportDesignModel model = new ReportDesignModel();
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        model.setSchema(schema);
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 找不到逻辑模型中引用的立方体
     */
    @Test
    public void testGetCubesWithNullReference() {
        ReportDesignModel model = new ReportDesignModel();
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        model.setSchema(schema);
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 找不到逻辑模型中引用的立方体
     */
    @Test
    public void anotherTestGetCubesWithNullReference() {
        ReportDesignModel model = new ReportDesignModel();
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        model.setSchema(schema);
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setCubeId("test");
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        item.setCubeId("test");
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 找不到逻辑模型中引用的立方体
     */
    @Test
    public void testGetCubesWithNullDimensionAndMeasure() {
        ReportDesignModel model = new ReportDesignModel();
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        model.setSchema(schema);
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setCubeId(id);
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        item.setCubeId(id);
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(0, cubes.size());
    }
    
    /**
     * 找不到逻辑模型中引用的立方体
     */
    @Test
    public void testGetCubesWithNullMeasure() {
        ReportDesignModel model = new ReportDesignModel();
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        model.setSchema(schema);
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        dimensions.put(dimension.getId(), dimension);
        cube.setDimensions(dimensions);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setCubeId(id);
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        item.setOlapElementId(dimId);
        item.setCubeId(id);
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(1, cubes.size());
    }
    
    /**
     * 找不到逻辑模型中引用的立方体
     */
    @Test
    public void testGetCubes() {
        ReportDesignModel model = new ReportDesignModel();
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        model.setSchema(schema);
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        dimensions.put(dimension.getId(), dimension);
        cube.setDimensions(dimensions);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Map<String, ExtendArea> areas = new HashMap<String, ExtendArea>();
        ExtendArea area = new ExtendArea();
        area.setCubeId(id);
        area.setId(UuidGeneratorUtils.generate());
        LogicModel logicModel = new LogicModel();
        area.setLogicModel(logicModel);
        Item item = new Item();
        item.setOlapElementId(dimId);
        item.setCubeId(id);
        logicModel.addColumn(item);
        areas.put(area.getId(), area);
        model.setExtendAreas(areas);
        List<Cube> cubes = ReportDesignModelUtils.getCubes(model);
        Assert.assertNotNull(cubes);
        Assert.assertEquals(1, cubes.size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndDefineWithIdWithEmptySchema() {
        Assert.assertNull(ReportDesignModelUtils.getDimOrIndDefineWithId(null, null, null));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithEmptyCube() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        Assert.assertNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, null, null));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithNotExistCube() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Assert.assertNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, "test", null));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithEmptyDim() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Assert.assertNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, id, null));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithNotExistDim() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        dimensions.put(dimension.getId(), dimension);
        cube.setDimensions(dimensions);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Assert.assertNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, id, null));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithExistDim() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        dimensions.put(dimension.getId(), dimension);
        cube.setDimensions(dimensions);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Assert.assertNotNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, id, dimId));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithNotExistMeasrue() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        dimensions.put(dimension.getId(), dimension);
        cube.setDimensions(dimensions);
        
        Map<String, Measure> measures = new HashMap<String, Measure>();
        cube.setMeasures(measures);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Assert.assertNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, id, "test"));
    }
    
    /**
     * 
     */
    @Test
    public void testGetDimOrIndWithExistMeasrue() {
        MiniCubeSchema schema = new MiniCubeSchema("mini_schema");
        MiniCube cube = new MiniCube();
        String id = UuidGeneratorUtils.generate();
        cube.setId(id);
        String dimId = UuidGeneratorUtils.generate();
        MiniCubeDimension dimension = new StandardDimension("test");
        dimension.setId(dimId);
        Map<String, Dimension> dimensions = new HashMap<String, Dimension>();
        dimensions.put(dimension.getId(), dimension);
        cube.setDimensions(dimensions);
        
        Map<String, Measure> measures = new HashMap<String, Measure>();
        MiniCubeMeasure measure = new MiniCubeMeasure("test");
        String measureId = UuidGeneratorUtils.generate();
        measure.setId(measureId);
        measures.put(measureId, measure);
        cube.setMeasures(measures);
        Map<String, MiniCube> tmp = new HashMap<String, MiniCube>();
        tmp.put(cube.getId(), cube);
        schema.setCubes(tmp);
        Assert.assertNotNull(ReportDesignModelUtils.getDimOrIndDefineWithId(schema, id, measureId));
    }
}
