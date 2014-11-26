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
package com.baidu.rigel.biplatform.tesseract.isservice.meta;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;

import com.baidu.rigel.biplatform.ac.model.Dimension;
import com.baidu.rigel.biplatform.ac.model.Level;
import com.baidu.rigel.biplatform.ac.model.Measure;
import com.baidu.rigel.biplatform.ac.model.MeasureType;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.tesseract.store.meta.StoreMeta;

/**
 * 
 * 索引元数据
 * 
 * @author lijin
 *
 */
public class IndexMeta extends StoreMeta implements Serializable {
    /**
     * 存储区名称
     */
    private static final String DATA_STORE_NAME_INDEX_META = "DATA_STORE_NAME_INDEX_META";
    /**
     * 索引元数据中key的联字符
     */
    // private static final String INDEX_META_KEY_SPLITTER = "_";
    /**
     * 如果是分表的话，表前缀与正则的分隔符
     */
    private static final String FACTTABLE_REGEX_SPLITTER = "_";
    /**
     * 提供索引服务的路径前缀
     */
    private static final String INDEX_FILE_PATH_INDEX = "index_0/";
    /**
     * 更新索引的路径前缀
     */
    private static final String INDEX_FILE_PATH_UPDATE = "index_1/";
    
    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = 3211554735307147462L;
    
    /**
     * clusterName 所属集群名称
     */
    private String clusterName;
    
    /**
     * indexMetaId 索引元数据ID
     */
    private String indexMetaId;
    
    /**
     * cube名称集合
     */
    private Set<String> cubeIdSet;
    
    /**
     * 所属产品线
     */
    private String productLine;
    /**
     * 数据描述信息
     */
    private DataDescInfo dataDescInfo;
    /**
     * 数据源信息
     */
    private DataSourceInfo dataSourceInfo;
    /**
     * 维度信息
     */
    private Map<String, Dimension> dimInfoMap;
    /**
     * 指标信息
     */
    private Map<String, Measure> measureInfoMap;
    
    // /**
    // * 索引分片规则
    // */
    // private Set<IndexShardRule> idxShardRule;
    
    /**
     * 索引分片列表，在建索引时创建
     */
    private List<IndexShard> idxShardList;
    /**
     * 复本个数
     */
    private int replicaNum;
    /**
     * 索引元数据状态，索引元数据有如下几个状态 1、INDEX_AVAILABLE，对应的索引数据已完成初始化可以提供服务
     * 2、INDEX_UNINIT，对应的索引数据还没有，不能提供服务 3、INDEX_AVAILABLE_NEEDMERGE，需要进行索引合并
     */
    private IndexState idxState;
    
    /**
     * 记录索引更新的版本（以第一个索引分片更新完的时间：System.currentTimeMillis()为当前的版本） 其它分片在执行：
     * 1、查询前，先看一下当前的idxVersion是否比整体版本号小，如果小，则暂停服务；
     * 2、更新索引时，取idxMeta的idxVersion更新到自己的idxVersion中
     */
    private long idxVersion;
    
    /**
     * ------------------------------索引元数据进行合并时，设置如下属性--------------------------
     * 
     **/
    
    /**
     * 待合并的cubeId
     */
    private Set<String> cubeIdMergeSet;
    /**
     * 待合并的维度
     */
    private Map<String, Dimension> dimInfoMergeMap;
    /**
     * 待合并的指标
     */
    private Map<String, Measure> measureInfoMergeMap;
    
    /**
     * 默认构造函数
     */
    public IndexMeta() {
        
    }
    
    /**
     * 构造函数
     * 
     * @param cubeIdSet
     *            cubeId
     * @param productLine
     *            所属产品线
     */
    public IndexMeta(Set<String> cubeIdSet, String productLine) {
        super();
        this.cubeIdSet = cubeIdSet;
        this.productLine = productLine;
    }
    
    /**
     * 
     * getCubeNameSet
     * 
     * @return Set<String>
     */
    public Set<String> getCubeIdSet() {
        if (this.cubeIdSet == null) {
            this.cubeIdSet = new HashSet<String>();
        }
        return cubeIdSet;
    }
    
    /**
     * getIdxShardList
     * 
     * @return List<IndexShard>
     */
    public List<IndexShard> getIdxShardList() {
        if (this.idxShardList == null) {
            this.idxShardList = new ArrayList<IndexShard>();
        }
        return idxShardList;
    }
    
    /**
     * 
     * getDimInfoMap
     * 
     * @return Map<String, Dimension>
     */
    public Map<String, Dimension> getDimInfoMap() {
        if (this.dimInfoMap == null) {
            this.dimInfoMap = new HashMap<String, Dimension>();
        }
        return dimInfoMap;
    }
    
    /**
     * 
     * getMeasureInfoMap
     * 
     * @return Map<String, Measure>
     */
    public Map<String, Measure> getMeasureInfoMap() {
        if (this.measureInfoMap == null) {
            this.measureInfoMap = new HashMap<String, Measure>();
        }
        return measureInfoMap;
    }
    
    /**
     * 
     * 获取存储区域名称
     * 
     * @return String 字符串
     */
    public static String getDataStoreName() {
        return DATA_STORE_NAME_INDEX_META;
    }
    
    @Override
    public String getStoreKey() {
        StringBuffer sb = new StringBuffer();
        // if (this.clusterName != null && this.productLine != null &&
        // this.dataSourceInfo != null
        // && this.dataSourceInfo.getDataSourceKey() != null &&
        // !("").equals(this.clusterName)
        // && !this.productLine.equals("") &&
        // !("").equals(this.dataSourceInfo.getDataSourceKey())) {
        // sb.append(this.clusterName);
        // sb.append(INDEX_META_KEY_SPLITTER);
        // sb.append(this.productLine);
        // sb.append(INDEX_META_KEY_SPLITTER);
        // sb.append(this.dataSourceInfo.getDataSourceKey());
        // }
        if (this.dataSourceInfo != null
            && !StringUtils.isEmpty(this.dataSourceInfo.getDataSourceKey())) {
            sb.append(this.dataSourceInfo.getDataSourceKey());
        }
        
        return sb.toString();
    }
    
    /**
     * getter method for property clusterName
     * 
     * @return the clusterName
     */
    public String getClusterName() {
        return clusterName;
    }
    
    /**
     * setter method for property clusterName
     * 
     * @param clusterName
     *            the clusterName to set
     */
    public void setClusterName(String clusterName) {
        this.clusterName = clusterName;
    }
    
    /**
     * getter method for property productLine
     * 
     * @return the productLine
     */
    public String getProductLine() {
        return productLine;
    }
    
    /**
     * setter method for property productLine
     * 
     * @param productLine
     *            the productLine to set
     */
    public void setProductLine(String productLine) {
        this.productLine = productLine;
    }
    
    /**
     * getter method for property dataDescInfo
     * 
     * @return the dataDescInfo
     */
    public DataDescInfo getDataDescInfo() {
        return dataDescInfo;
    }
    
    /**
     * setter method for property dataDescInfo
     * 
     * @param dataDescInfo
     *            the dataDescInfo to set
     */
    public void setDataDescInfo(DataDescInfo dataDescInfo) {
        this.dataDescInfo = dataDescInfo;
    }
    
    /**
     * getter method for property dataSourceInfo
     * 
     * @return the dataSourceInfo
     */
    public DataSourceInfo getDataSourceInfo() {
        return dataSourceInfo;
    }
    
    /**
     * setter method for property dataSourceInfo
     * 
     * @param dataSourceInfo
     *            the dataSourceInfo to set
     */
    public void setDataSourceInfo(DataSourceInfo dataSourceInfo) {
        this.dataSourceInfo = dataSourceInfo;
    }
    
    /**
     * getter method for property replicaNum
     * 
     * @return the replicaNum
     */
    public int getReplicaNum() {
        return replicaNum;
    }
    
    /**
     * setter method for property replicaNum
     * 
     * @param replicaNum
     *            the replicaNum to set
     */
    public void setReplicaNum(int replicaNum) {
        this.replicaNum = replicaNum;
    }
    
    /**
     * getter method for property idxState
     * 
     * @return the idxState
     */
    public IndexState getIdxState() {
        return idxState;
    }
    
    /**
     * setter method for property idxState
     * 
     * @param idxState
     *            the idxState to set
     */
    public void setIdxState(IndexState idxState) {
        this.idxState = idxState;
    }
    
    /**
     * setter method for property cubeNameSet
     * 
     * @param cubeIdSet
     *            the cubeNameSet to set
     */
    public void setCubeIdSet(Set<String> cubeIdSet) {
        this.cubeIdSet = cubeIdSet;
    }
    
    /**
     * setter method for property dimInfoMap
     * 
     * @param dimInfoMap
     *            the dimInfoMap to set
     */
    public void setDimInfoMap(Map<String, Dimension> dimInfoMap) {
        this.dimInfoMap = dimInfoMap;
    }
    
    /**
     * setter method for property measureInfoMap
     * 
     * @param measureInfoMap
     *            the measureInfoMap to set
     */
    public void setMeasureInfoMap(Map<String, Measure> measureInfoMap) {
        this.measureInfoMap = measureInfoMap;
    }
    
    /**
     * setter method for property idxShardList
     * 
     * @param idxShardList
     *            the idxShardList to set
     */
    public void setIdxShardList(List<IndexShard> idxShardList) {
        this.idxShardList = idxShardList;
    }
    
    // /**
    // * getter method for property idxShardRule
    // *
    // * @return the idxShardRule
    // */
    // public Set<IndexShardRule> getIdxShardRule() {
    // return idxShardRule;
    // }
    //
    // /**
    // * setter method for property idxShardRule
    // *
    // * @param idxShardRule
    // * the idxShardRule to set
    // */
    // public void setIdxShardRule(Set<IndexShardRule> idxShardRule) {
    // this.idxShardRule = idxShardRule;
    // }
    
    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("IndexMeta [clusterName=" + clusterName + ", cubeIdSet=" + cubeIdSet
            + ", productLine=" + productLine + ", dataDescInfo=" + dataDescInfo
            + ", dataSourceInfo=" + dataSourceInfo + ", dimInfoMap=" + dimInfoMap
            + ", measureInfoMap=" + "");
        sb.append(measureInfoMap == null ? "[null]" : measureInfoMap.keySet());
        sb.append(", idxShardList=" + idxShardList + ", replicaNum=" + replicaNum + ", idxState="
            + idxState + "]");
        return sb.toString();
    }
    
    /**
     * 获取事实表名
     * 
     * @return String
     */
    public String getFacttableName() {
        String factTable = "";
        if (this.dataDescInfo != null && !StringUtils.isEmpty(this.dataDescInfo.getTableName())) {
            factTable = this.dataDescInfo.getTableName();
            if (this.dataDescInfo.isSplitTable()) {
                factTable = this.dataDescInfo.getTableName().split(FACTTABLE_REGEX_SPLITTER)[0];
            }
        }
        return factTable;
    }
    
    /**
     * getter method for property indexFilePathIndex
     * 
     * @return the indexFilePathIndex
     */
    public static String getIndexFilePathIndex() {
        return INDEX_FILE_PATH_INDEX;
    }
    
    /**
     * getter method for property indexFilePathUpdate
     * 
     * @return the indexFilePathUpdate
     */
    public static String getIndexFilePathUpdate() {
        return INDEX_FILE_PATH_UPDATE;
    }
    
    /**
     * getter method for property idxVersion
     * 
     * @return the idxVersion
     */
    public long getIdxVersion() {
        return idxVersion;
    }
    
    /**
     * setter method for property idxVersion
     * 
     * @param idxVersion
     *            the idxVersion to set
     */
    public void setIdxVersion(long idxVersion) {
        this.idxVersion = idxVersion;
    }
    
    /**
     * getter method for property dimInfoMergeMap
     * 
     * @return the dimInfoMergeMap
     */
    public Map<String, Dimension> getDimInfoMergeMap() {
        if (dimInfoMergeMap == null) {
            dimInfoMergeMap = new HashMap<String, Dimension>();
        }
        return dimInfoMergeMap;
    }
    
    /**
     * setter method for property dimInfoMergeMap
     * 
     * @param dimInfoMergeMap
     *            the dimInfoMergeMap to set
     */
    public void setDimInfoMergeMap(Map<String, Dimension> dimInfoMergeMap) {
        this.dimInfoMergeMap = dimInfoMergeMap;
    }
    
    /**
     * getter method for property measureInfoMergeMap
     * 
     * @return the measureInfoMergeMap
     */
    public Map<String, Measure> getMeasureInfoMergeMap() {
        if (measureInfoMergeMap == null) {
            measureInfoMergeMap = new HashMap<String, Measure>();
        }
        return measureInfoMergeMap;
    }
    
    /**
     * setter method for property measureInfoMergeMap
     * 
     * @param measureInfoMergeMap
     *            the measureInfoMergeMap to set
     */
    public void setMeasureInfoMergeMap(Map<String, Measure> measureInfoMergeMap) {
        this.measureInfoMergeMap = measureInfoMergeMap;
    }
    
    /**
     * getter method for property cubeIdMergeSet
     * 
     * @return the cubeIdMergeSet
     */
    public Set<String> getCubeIdMergeSet() {
        if (this.cubeIdMergeSet == null) {
            this.cubeIdMergeSet = new HashSet<String>();
        }
        return cubeIdMergeSet;
    }
    
    /**
     * setter method for property cubeIdMergeSet
     * 
     * @param cubeIdMergeSet
     *            the cubeIdMergeSet to set
     */
    public void setCubeIdMergeSet(Set<String> cubeIdMergeSet) {
        this.cubeIdMergeSet = cubeIdMergeSet;
    }
    
    /**
     * getter method for property indexMetaId
     * 
     * @return the indexMetaId
     */
    public String getIndexMetaId() {
        return indexMetaId;
    }
    
    /**
     * setter method for property indexMetaId
     * 
     * @param indexMetaId
     *            the indexMetaId to set
     */
    public void setIndexMetaId(String indexMetaId) {
        this.indexMetaId = indexMetaId;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#hashCode()
     */
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((indexMetaId == null) ? 0 : indexMetaId.hashCode());
        return result;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see java.lang.Object#equals(java.lang.Object)
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        IndexMeta other = (IndexMeta) obj;
        if (indexMetaId == null) {
            if (other.indexMetaId != null) {
                return false;
            }
        } else if (!indexMetaId.equals(other.indexMetaId)) {
            return false;
        }
        return true;
    }
    
    /**
     * 
     * getSelectList 抽取索引元数据中的指标与维度字段，生成集合
     * 
     * @return Set<String> 如果指标与维度为空，则反回空集，而不是null
     */
    public Set<String> getSelectList() {
        Set<String> selectList = new HashSet<String>();
        // 处理维度
        for (String dimKey : this.dimInfoMap.keySet()) {
            Dimension dim = this.dimInfoMap.get(dimKey);
            
            // selectList.add(dim.getFacttableColumn());
            // 处理维度不同层级
            if (dim.getLevels() != null) {
                for (String levelKey : dim.getLevels().keySet()) {
                    Level dimLevel = dim.getLevels().get(levelKey);
                    selectList.add(dimLevel.getFactTableColumn());
                }
            }
        }
        // 处理指标
        for (String measureKey : this.measureInfoMap.keySet()) {
            Measure measure = this.measureInfoMap.get(measureKey);
            if (measure.getType().equals(MeasureType.COMMON)) {
                // 普通指标，直接加入到select表列中
                selectList.add(measure.getDefine());
            } else if (measure.getType().equals(MeasureType.DEFINE)) {
                // 当前不支持
            } else if (measure.getType().equals(MeasureType.CAL)) {
                // 当前不支持
            }
        }
        
        return selectList;
    }
    
}
