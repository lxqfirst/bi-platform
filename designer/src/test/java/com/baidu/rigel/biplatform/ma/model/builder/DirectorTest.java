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
package com.baidu.rigel.biplatform.ma.model.builder;

import java.util.List;

import org.junit.Assert;
import org.junit.Test;

import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.Measure;
import com.baidu.rigel.biplatform.ac.model.Schema;
import com.baidu.rigel.biplatform.ma.model.builder.impl.DirectorImpl;
import com.baidu.rigel.biplatform.ma.model.meta.CallbackDimTableMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.ColumnMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.DimTableMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.FactTableMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.ReferenceDefine;
import com.baidu.rigel.biplatform.ma.model.meta.StandardDimTableMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.StarModel;
import com.baidu.rigel.biplatform.ma.model.meta.TimeDimTableMetaDefine;
import com.baidu.rigel.biplatform.ma.model.meta.TimeDimType;
import com.google.common.collect.Lists;

/**
 * 
 * test class
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class DirectorTest {
    
    /**
     * 
     */
    Director director = new DirectorImpl();
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithNull() {
        Assert.assertNull(director.getSchema(null));
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithEmptyArray() {
        Assert.assertNull(director.getSchema(new StarModel[0]));
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithNullDsId() {
        StarModel starModel = new StarModel();
        StarModel[] starModels = new StarModel[]{starModel};
        try {
            director.getSchema(starModels);
            Assert.fail();
        } catch (Throwable e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithDsId() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(0, schema.getCubes().size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithFactableWithNullColumn() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        starModel.setFactTable(factTable);
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes().values().toArray(new Cube[0])[0];
        Assert.assertEquals(0, cube.getMeasures().size());
        Assert.assertEquals(0, cube.getDimensions().size());
    }
    
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithFactableWithColumn() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        ColumnMetaDefine column = new ColumnMetaDefine();
        column.setName("abc");
        factTable.addColumn(column);
        starModel.setFactTable(factTable);
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes()
                .values().toArray(new Cube[0])[0];
        Assert.assertEquals(1, cube.getMeasures().size());
        Assert.assertEquals(0, cube.getDimensions().size());
        
        Measure m = cube.getMeasures()
                .values().toArray(new Measure[0])[0];
        Assert.assertEquals("abc", m.getName());
    }
    
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithNullDimTable() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("def");
        factTable.addColumn(def);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = Lists.newArrayList();
        starModel.setDimTables(dimTables);
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes()
                .values().toArray(new Cube[0])[0];
        Assert.assertEquals(2, cube.getMeasures().size());
        Assert.assertEquals(0, cube.getDimensions().size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithEmptyDimTable() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("def");
        factTable.addColumn(def);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = Lists.newArrayList();
        DimTableMetaDefine dimTable = new StandardDimTableMetaDefine();
        dimTables.add(dimTable);
        starModel.setDimTables(dimTables);
        StarModel[] starModels = new StarModel[]{starModel};
        try {
            director.getSchema(starModels);
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
        
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithDimTableEmptyRef() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("def");
        factTable.addColumn(def);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = Lists.newArrayList();
        DimTableMetaDefine dimTable = new StandardDimTableMetaDefine();
        dimTable.setName("dim");
        dimTables.add(dimTable);
        starModel.setDimTables(dimTables);
        StarModel[] starModels = new StarModel[]{starModel};
        try {
            director.getSchema(starModels);
            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithDimTableNotCorrectRef() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("def");
        factTable.addColumn(def);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = Lists.newArrayList();
        DimTableMetaDefine dimTable = new StandardDimTableMetaDefine();
        dimTable.setName("dim");
        ReferenceDefine reference = new ReferenceDefine();
        reference.setMajorColumn(null);
        reference.setMajorTable(null);
        reference.setSalveColumn(null);
        dimTable.setReference(reference);
        dimTables.add(dimTable);
        starModel.setDimTables(dimTables);
        StarModel[] starModels = new StarModel[]{starModel};
        try {
            director.getSchema(starModels);
//            Assert.fail();
        } catch (Exception e) {
            Assert.assertNotNull(e);
        }
    }
    /**
     * 
     */
    @Test
    public void testGetSchemaWithDimTableCorrectRefNoneDimColumn() {
        StarModel starModel = new StarModel();
        starModel.setDsId("fact");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("test");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("def");
        factTable.addColumn(def);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = Lists.newArrayList();
        DimTableMetaDefine dimTable = new StandardDimTableMetaDefine();
        dimTable.setName("dim");
        ReferenceDefine reference = new ReferenceDefine();
        reference.setMajorColumn("abc");
        reference.setMajorTable("fact");
        reference.setSalveColumn("aaa");
        dimTable.setReference(reference);
        dimTables.add(dimTable);
        starModel.setDimTables(dimTables);
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes()
                .values().toArray(new Cube[0])[0];
        Assert.assertEquals(1, cube.getMeasures().size());
        Assert.assertEquals(0, cube.getDimensions().size());
    }
    
    /**
     * 
     */
    @Test
    public void testGetSchemaWithDimTableCorrectRefDimColumn() {
        StarModel starModel = new StarModel();
        starModel.setDsId("fact");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("test");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("fact_abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("fact_def");
        factTable.addColumn(def);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = buildBaseDimTables();
        starModel.setDimTables(dimTables);
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes()
                .values().toArray(new Cube[0])[0];
        Assert.assertEquals(1, cube.getMeasures().size());
        Assert.assertEquals(1, cube.getDimensions().size());
    }
    
    /**
     * 
     */
//    @Test
    public void testGetSchemaWithTimeDimension() {
        StarModel starModel = new StarModel();
        starModel.setDsId("fact");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("test");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("fact_abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("fact_def");
        factTable.addColumn(def);
        
        ColumnMetaDefine timeCol = new ColumnMetaDefine();
        timeCol.setName("fact_time_id");
        factTable.addColumn(timeCol);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = buildDimTablesWithTimeDim();
        
        starModel.setDimTables(dimTables);
        
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes()
                .values().toArray(new Cube[0])[0];
        Assert.assertEquals(1, cube.getMeasures().size());
        Assert.assertEquals(2, cube.getDimensions().size());
    }

    /**
     * 
     */
//    @Test
    public void testGetSchemaWithCallbackDim() {
        Schema schema = genSchema();
        Assert.assertNotNull(schema);
        Assert.assertEquals(1, schema.getCubes().size());
        Cube cube = schema.getCubes()
                .values().toArray(new Cube[0])[0];
        Assert.assertEquals(1, cube.getMeasures().size());
        Assert.assertEquals(3, cube.getDimensions().size());
    }

    /**
     * 
     */
//    @Test
//    public void testGetStarModel() {
//        Schema schema = this.genSchema();
//        StarModel[] starModels = this.director.getStarModel(schema);
//        Assert.assertNotNull(starModels);
//        Assert.assertEquals(1, starModels.length);
//        StarModel starModel = starModels[0];
//        Assert.assertEquals(3, starModel.getDimTables().size());
//        Assert.assertEquals("fact", starModel.getFactTable().getName());
//    }
    
    /**
     * 
     */
//    @Test
    public void testModifySchemaWithNewModel() {
        Schema schema = this.genSchema(); 
        StarModel starModel = genStarModel();
        StarModel[] starModels = new StarModel[]{starModel};
        Schema newSchema = this.director.modifySchemaWithNewModel(schema, starModels);
        Assert.assertNotNull(newSchema);
        Assert.assertEquals(schema.getId(), newSchema.getId());
        Assert.assertEquals(schema.getName(), newSchema.getName());
        Assert.assertEquals(schema.getCubes().size(), newSchema.getCubes().size());
    }

    /**
     * @return
     */
    private Schema genSchema() {
        StarModel starModel = genStarModel();
        
        StarModel[] starModels = new StarModel[]{starModel};
        Schema schema = director.getSchema(starModels);
        return schema;
    }
    
    /**
     * @return
     */
    private StarModel genStarModel() {
        StarModel starModel = new StarModel();
        starModel.setDsId("test");
        FactTableMetaDefine factTable = new FactTableMetaDefine();
        factTable.setName("fact");
        ColumnMetaDefine abc = new ColumnMetaDefine();
        abc.setName("fact_abc");
        factTable.addColumn(abc);
        
        ColumnMetaDefine def = new ColumnMetaDefine();
        def.setName("fact_def");
        factTable.addColumn(def);
        
        ColumnMetaDefine calback = new ColumnMetaDefine();
        calback.setName("fact_callback");
        factTable.addColumn(calback);
        
        ColumnMetaDefine timeCol = new ColumnMetaDefine();
        timeCol.setName("fact_time_id");
        factTable.addColumn(timeCol);
        starModel.setFactTable(factTable);
        
        List<DimTableMetaDefine> dimTables = buildDimTablesWithTimeDim();
        
        CallbackDimTableMetaDefine callBackDim = new CallbackDimTableMetaDefine();
        callBackDim.setName("call_back");
        callBackDim.setUrl("http://host:port/callbackService");
        ColumnMetaDefine callBackCol = new ColumnMetaDefine();
        callBackCol.setName("fact_callback");
        callBackCol.setCaption("fact_callback");
        callBackDim.addColumn(callBackCol);
        ReferenceDefine callbackRef = new ReferenceDefine();
        callbackRef.setMajorColumn("fact_callback");
        callbackRef.setMajorTable("fact");
        callbackRef.setSalveColumn("gen_call_back_id");
        callBackDim.setReference(callbackRef);
        
        dimTables.add(callBackDim);
        
        starModel.setDimTables(dimTables);
        return starModel;
    }
    
    /**
     * @return
     */
    private List<DimTableMetaDefine> buildDimTablesWithTimeDim() {
        List<DimTableMetaDefine> dimTables = buildBaseDimTables();
        
        TimeDimTableMetaDefine timeDimTable = 
                new TimeDimTableMetaDefine(TimeDimType.STANDARD_TIME);
        ColumnMetaDefine timeId = new ColumnMetaDefine();
        timeId.setName("time_id");
        timeId.setCaption("time_id");
        timeDimTable.addColumn(timeId);
        ColumnMetaDefine timeYear = new ColumnMetaDefine();
        timeYear.setName("time_year");
        timeYear.setCaption("time_year");
        timeDimTable.addColumn(timeYear);
        ReferenceDefine timeReference = new ReferenceDefine();
        timeReference.setMajorColumn("fact_time_id");
        timeReference.setMajorTable("fact");
        timeReference.setSalveColumn("time_id");
        timeDimTable.setReference(timeReference);
        dimTables.add(timeDimTable);
        return dimTables;
    }
    
    /**
     * @return
     */
    private List<DimTableMetaDefine> buildBaseDimTables() {
        List<DimTableMetaDefine> dimTables = Lists.newArrayList();
        DimTableMetaDefine dimTable = new StandardDimTableMetaDefine();
        dimTable.setName("dim");
        ColumnMetaDefine dimColumn = new ColumnMetaDefine();
        dimColumn.setName("dim_abc");
        dimColumn.setCaption("dim_abc");
        dimTable.addColumn(dimColumn);
        ColumnMetaDefine anotherDimCol = new ColumnMetaDefine();
        anotherDimCol.setName("dim_def");
        anotherDimCol.setCaption("dim_def");
        dimTable.addColumn(anotherDimCol);
        ReferenceDefine reference = new ReferenceDefine();
        reference.setMajorColumn("fact_abc");
        reference.setMajorTable("fact");
        reference.setSalveColumn("dim_abc");
        dimTable.setReference(reference);
        dimTables.add(dimTable);
        return dimTables;
    }
    
}
