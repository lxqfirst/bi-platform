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
package com.baidu.rigel.biplatform.tesseract.isservice.index.service.impl;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.tesseract.dataquery.service.DataQueryService;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourcePoolService;
import com.baidu.rigel.biplatform.tesseract.datasource.impl.SqlDataSourceWrap;
import com.baidu.rigel.biplatform.tesseract.exception.DataSourceException;
import com.baidu.rigel.biplatform.tesseract.isservice.event.IndexUpdateEvent;
import com.baidu.rigel.biplatform.tesseract.isservice.event.IndexUpdateEvent.IndexUpdateInfo;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexAndSearchException;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexAndSearchExceptionType;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexMetaIsNullException;
import com.baidu.rigel.biplatform.tesseract.isservice.index.service.IndexMetaService;
import com.baidu.rigel.biplatform.tesseract.isservice.index.service.IndexService;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexAction;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexMeta;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexShard;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexState;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.SqlQuery;
import com.baidu.rigel.biplatform.tesseract.netty.message.isservice.IndexMessage;
import com.baidu.rigel.biplatform.tesseract.netty.message.isservice.ServerFeedbackMessage;
import com.baidu.rigel.biplatform.tesseract.node.meta.Node;
import com.baidu.rigel.biplatform.tesseract.node.meta.NodeState;
import com.baidu.rigel.biplatform.tesseract.node.service.IndexAndSearchClient;
import com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService;
import com.baidu.rigel.biplatform.tesseract.resultset.TesseractResultSet;
import com.baidu.rigel.biplatform.tesseract.store.service.StoreManager;
import com.baidu.rigel.biplatform.tesseract.util.FileUtils;
import com.baidu.rigel.biplatform.tesseract.util.IndexFileSystemConstants;
import com.baidu.rigel.biplatform.tesseract.util.TesseractConstant;
import com.baidu.rigel.biplatform.tesseract.util.TesseractExceptionUtils;
import com.baidu.rigel.biplatform.tesseract.util.isservice.LogInfoConstants;

/**
 * IndexService 实现类
 * 
 * @author lijin
 *
 */
@Service("indexService")
public class IndexServiceImpl implements IndexService {
    /**
     * LOGGER
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(IndexServiceImpl.class);
    /**
     * LOGGER
     */
    private static final String RESULT_KEY_DATA = "RESULT_KEY_DATA";
    /**
     * RESULT_KEY_INDEXSHARD
     */
    private static final String RESULT_KEY_INDEXSHARD = "RESULT_KEY_INDEXSHARD";
    
    /**
     * RESULT_KEY_MAXID
     */
    private static final String RESULT_KEY_MAXID = "RESULT_KEY_MAXID";
    
    /**
     * indexMetaService
     */
    @Resource
    private IndexMetaService indexMetaService;
    
    @Resource
    private IsNodeService isNodeService;
    
    @Resource
    private StoreManager storeManager;
    
    @Resource
    private DataSourcePoolService dataSourcePoolService;
    
    /**
     * dataQueryService
     */
    @Resource(name = "sqlDataQueryService")
    private DataQueryService dataQueryService;
    
    /**
     * dataQueryService
     */
    
    private IndexAndSearchClient isClient;
    
    /**
     * Constructor by no param
     */
    public IndexServiceImpl() {
        super();
        this.isClient = IndexAndSearchClient.getNodeClient();
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.isservice.index.service.IndexService
     * #initMiniCubeIndex(java.util.List,
     * com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo, boolean,
     * boolean)
     */
    @Override
    public boolean initMiniCubeIndex(List<Cube> cubeList, DataSourceInfo dataSourceInfo,
        boolean indexAsap, boolean limited) throws IndexAndSearchException {
        /**
         * 当通过MiniCubeConnection.publishCubes(List<String> cubes, DataSourceInfo
         * dataSourceInfo);通知索引服务端建立索引数据
         */
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "initMiniCubeIndex", "[cubeList:" + cubeList + "][dataSourceInfo:" + dataSourceInfo
                + "][indexAsap:" + indexAsap + "][limited:" + limited + "]"));
        
        // step 1 process cubeList and fill indexMeta infomation
        List<IndexMeta> idxMetaList = this.indexMetaService.initMiniCubeIndexMeta(cubeList,
            dataSourceInfo);
        
        if (idxMetaList.size() == 0) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS,
                "initMiniCubeIndex", "[cubeList:" + cubeList + "][dataSourceInfo:" + dataSourceInfo
                    + "][indexAsap:" + indexAsap + "][limited:" + limited + "]",
                "Init MiniCube IndexMeta failed"));
            return false;
        } else {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                "initMiniCubeIndex", "Success init " + idxMetaList.size() + " MiniCube"));
        }
        
        // step 2 merge indexMeta with exist indexMetas and update indexMeta
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
            "initMiniCubeIndex", "Merging IndexMeta with exist indexMetas"));
        
        LinkedList<IndexMeta> idxMetaListForIndex = new LinkedList<IndexMeta>();
        for (IndexMeta idxMeta : idxMetaList) {
            idxMeta = this.indexMetaService.mergeIndexMeta(idxMeta);
            
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                "initMiniCubeIndex", "Merge indexMeta success. After merge:[" + idxMeta.toString()
                    + "]"));
            
            idxMetaListForIndex.add(idxMeta);
        }
        
        // step 3 if(indexAsap) then call doIndex else return
        
        if (indexAsap) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                "initMiniCubeIndex", "index as soon as possible"));
            // if need index as soon as possible
            IndexAction idxAction = IndexAction.INDEX_INIT;
            if (limited) {
                idxAction = IndexAction.INDEX_INIT_LIMITED;
            }
            while (idxMetaListForIndex.size() > 0) {
                
                IndexMeta idxMeta = idxMetaListForIndex.poll();
                if (idxMeta.getIdxState().equals(IndexState.INDEX_AVAILABLE_MERGE)) {
                    idxMeta.setIdxState(IndexState.INDEX_AVAILABLE);
                    this.indexMetaService.saveOrUpdateIndexMeta(idxMeta);
                    continue;
                } else if (idxMeta.getIdxState().equals(IndexState.INDEX_AVAILABLE_NEEDMERGE)) {
                    idxAction = IndexAction.INDEX_UPDATE;
                }
                boolean idxResult = false;
                
                try {
                    
                    idxResult = doIndex(idxMeta, idxAction);
                    
                } catch (IllegalArgumentException | IndexMetaIsNullException | DataSourceException e) {
                    LOGGER.error(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                        "initMiniCubeIndex", "[cubeList:" + cubeList + "][dataSourceInfo:"
                            + dataSourceInfo + "][indexAsap:" + indexAsap + "][limited:" + limited
                            + "]"), e);
                    
                    String message = TesseractExceptionUtils.getExceptionMessage(
                        IndexAndSearchException.INDEXEXCEPTION_MESSAGE,
                        IndexAndSearchExceptionType.INDEX_EXCEPTION);
                    throw new IndexAndSearchException(message, e,
                        IndexAndSearchExceptionType.INDEX_EXCEPTION);
                } finally {
                    LOGGER.info(String.format(
                        LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                        "initMiniCubeIndex", "[Index indexmeta : " + idxMeta.toString() + " "
                            + Boolean.toString(idxResult) + "]"));
                }
            }
        }
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "initMiniCubeIndex",
            "[cubeList:" + cubeList + "][dataSourceInfo:" + dataSourceInfo + "][indexAsap:"
                + indexAsap + "][limited:" + limited + "]"));
        return true;
    }
    
    private void publishIndexUpdateEvent(List<IndexMeta> metaList) throws Exception {
        if (metaList != null && metaList.size() > 0) {
            List<String> idxServiceList = new ArrayList<String>();
            List<String> idxNoServiceList = new ArrayList<String>();
            for (IndexMeta meta : metaList) {
                for (IndexShard idxShard : meta.getIdxShardList()) {
                    idxServiceList.add(idxShard.getAbsoluteIdxFilePath(this.isNodeService
                        .getCurrentNode()));
                    idxNoServiceList.add(idxShard.getAbsoluteFilePath(this.isNodeService
                        .getCurrentNode()));
                }
            }
            IndexUpdateInfo udpateInfo = new IndexUpdateInfo(idxServiceList, idxNoServiceList);
            IndexUpdateEvent updateEvent = new IndexUpdateEvent(udpateInfo);
            this.storeManager.postEvent(updateEvent);
        }
    }
    
    public void updateIndexByDataSourceKey(String dataSourceKey) throws IndexAndSearchException {
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "updateIndexByDataSourceKey", dataSourceKey));
        if (StringUtils.isEmpty(dataSourceKey)) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "updateIndexByDataSourceKey", dataSourceKey));
            throw new IllegalArgumentException();
        }
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
            "updateIndexByDataSourceKey", dataSourceKey));
        List<IndexMeta> metaList = this.indexMetaService
            .getIndexMetasByDataSourceKey(dataSourceKey);
        for (IndexMeta meta : metaList) {
            try {
                this.doIndex(meta, IndexAction.INDEX_UPDATE);
            } catch (Exception e) {
                LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                    "updateIndexByDataSourceKey", dataSourceKey));
                String message = TesseractExceptionUtils.getExceptionMessage(
                    IndexAndSearchException.INDEXEXCEPTION_MESSAGE,
                    IndexAndSearchExceptionType.INDEX_EXCEPTION);
                throw new IndexAndSearchException(message, e.getCause(),
                    IndexAndSearchExceptionType.INDEX_EXCEPTION);
            }
        }
        try {
            publishIndexUpdateEvent(metaList);
        } catch (Exception e) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "updateIndexByDataSourceKey", dataSourceKey));
            String message = TesseractExceptionUtils.getExceptionMessage(
                IndexAndSearchException.INDEXEXCEPTION_MESSAGE,
                IndexAndSearchExceptionType.INDEX_UPDATE_EXCEPTION);
            throw new IndexAndSearchException(message, e.getCause(),
                IndexAndSearchExceptionType.INDEX_EXCEPTION);
        }
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END,
            "updateIndexByDataSourceKey", dataSourceKey));
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.isservice.index.service.IndexService
     * #doIndex(com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexMeta)
     */
    @Override
    public boolean doIndex(IndexMeta indexMeta, IndexAction idxAction)
        throws IndexMetaIsNullException, DataSourceException, IndexAndSearchException {
        // 在进行索引更新时，需要提供每个表的更新规则
        
        // 检查idxMeta是否需要初始化处理
        // if 需要初始化：
        // 1、IndexMeta-->SQLQuery
        // 2、初始化索引分片
        // 2、索引文件路径准备（如果是初始化，则直接创建路径，否则cp出一个新的路径）
        // 3、获取数据连接
        // 4、查询数据
        // 5、写索引（涉及将通过socket发送数据写数据的过程进行封装），一个分片一个分片的写，也就是说当前分片写满了，除非是修改这个分片中的数据，否则后续更新时也不会向这个分片写文件
        // 6、一块写满了，换另一块
        // 7、写数据结束
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "doIndex",
            "[indexMeta:" + indexMeta + "][idxAction:" + idxAction + "]"));
        
        IndexMeta idxMeta = indexMeta;
        if (idxMeta == null || idxAction == null) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION, "doIndex",
                "[indexMeta:" + indexMeta + "][idxAction:" + idxAction + "]"));
            throw new IllegalArgumentException();
        }
        // s1. transfer indexMeta to SQLQuery
        Map<String, SqlQuery> sqlQueryMap = transIndexMeta2SQLQuery(idxMeta);
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
            "doIndex", "transIndexMeta2SQLQuery success"));
        
        // s2. prepare index depends on idxState and indexAction
        boolean isUpdate = false;
        
        // init params depend on action and idxState
        if (idxMeta.getIdxState().equals(IndexState.INDEX_UNINIT)
            && (idxAction.equals(IndexAction.INDEX_INIT) || idxAction
                .equals(IndexAction.INDEX_INIT_LIMITED))) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                "doIndex", "process init before index"));
            // 索引分片申请
            idxMeta = this.indexMetaService.assignIndexShard(idxMeta, this.isNodeService
                .getCurrentNode().getClusterName());
            
        } else if ((idxMeta.getIdxState().equals(IndexState.INDEX_AVAILABLE_NEEDMERGE) || !idxMeta
            .getIdxState().equals(IndexState.INDEX_UNAVAILABLE))
            && idxAction.equals(IndexAction.INDEX_UPDATE)) {
            
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                "doIndex", "index merge and update before index"));
            // 索引更新
            if (idxMeta.getIdxState().equals(IndexState.INDEX_AVAILABLE_NEEDMERGE)) {
                LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                    "doIndex", "process merge"));
                // Map<String, Measure> measureAllMap = new HashMap<String,
                // Measure>();
                // measureAllMap.putAll(idxMeta.getMeasureInfoMap());
                // measureAllMap.putAll(idxMeta.getMeasureInfoMergeMap());
                idxMeta.getMeasureInfoMap().putAll(idxMeta.getMeasureInfoMergeMap());
                // Map<String, Dimension> dimAllMap = new HashMap<String,
                // Dimension>();
                // dimAllMap.putAll(idxMeta.getDimInfoMap());
                // dimAllMap.putAll(idxMeta.getDimInfoMergeMap());
                idxMeta.getDimInfoMap().putAll(idxMeta.getDimInfoMergeMap());
                sqlQueryMap = transIndexMeta2SQLQuery(idxMeta);
                //
                // List<String> selectMergeList = new ArrayList<String>();
                // for (String measureKey : measureAllMap.keySet()) {
                // Measure measure = measureAllMap.get(measureKey);
                // if (measure.getType().equals(MeasureType.COMMON)) {
                // // 普通指标，直接加入到select表列中
                // selectMergeList.add(measure.getDefine());
                // }
                // }
                
                // 需要合并列的更新
                // for (String tableName : sqlQueryMap.keySet()) {
                // List<String> selectList =
                // sqlQueryMap.get(tableName).getSelectList();
                // if (selectList == null) {
                // selectList = new ArrayList<String>();
                // }
                // selectList.clear();
                // selectList.addAll(selectMergeList);
                // sqlQueryMap.get(tableName).setSelectList(selectList);
                // }
                /*
                 * for (String tableName :
                 * idxMeta.getDataDescInfo().getTableNameList()) { List<String>
                 * whereList = sqlQueryMap.get(tableName).getWhereList(); if
                 * (whereList == null) { whereList = new ArrayList<String>(); }
                 * BigDecimal maxId =
                 * idxMeta.getDataDescInfo().getMaxDataId(tableName); if
                 * (!maxId.equals(BigDecimal.ZERO)) { String where = "id > " +
                 * maxId.longValue(); whereList.add(where); }
                 * sqlQueryMap.get(tableName).setWhereList(whereList); }
                 */
                
            } else if (!idxMeta.getIdxState().equals(IndexState.INDEX_UNAVAILABLE)) {
                LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
                    "doIndex", "process update before index"));
                // 正常更新               
                
                isUpdate = Boolean.TRUE;
                
            }
            
        } else {
            throw new IllegalArgumentException();
        }
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM,
            "doIndex", "init before index done"));
        // s3. get connection
        
        SqlDataSourceWrap dataSourceWrape = (SqlDataSourceWrap) this.dataSourcePoolService
            .getDataSourceByKey(idxMeta.getDataSourceInfo());
        if (dataSourceWrape == null) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS, "doIndex",
                "[indexMeta:" + indexMeta + "][idxAction:" + idxAction + "]"),
                "getDataSourceByKey return null");
            throw new DataSourceException();
        }
        
        // s4. get data & write index
        Map<String, BigDecimal> maxDataIdMap = new HashMap<String, BigDecimal>();
        
        //8888888888888888888888888888888888888888888888
        long startIndex=System.nanoTime();
        
        long totalTime=0;
        IndexShard currIdxShard = getFreeIndexShardForIndex(idxMeta);
        for (String tableName : sqlQueryMap.keySet()) {
            SqlQuery sqlQuery = sqlQueryMap.get(tableName);
            long total = 0;
            if (idxAction.equals(IndexAction.INDEX_INIT_LIMITED)) {
                total = IndexFileSystemConstants.INDEX_DATA_TOTAL_IN_LIMITEDMODEL;
            } else {
                total = this.dataQueryService.queryForLongWithSql(getCountSQLBySQLQuery(sqlQuery),
                    dataSourceWrape);
            }
            
            boolean isLastPiece = false;
            boolean isInit = true;
            BigDecimal currMaxId = BigDecimal.ZERO;
            
            //初始化maxId
            if(idxMeta.getDataDescInfo().getMaxDataId(tableName)!=null){
            	currMaxId=idxMeta.getDataDescInfo().getMaxDataId(tableName);
            }
            
            long pcount = IndexFileSystemConstants.FETCH_SIZE_FROM_DATASOURCE;
            // 目前是跟据数据量进行划分
            if (pcount > total) {
                pcount = total;
            }
            if (!StringUtils.isEmpty(sqlQuery.getIdName())
                    && !CollectionUtils.isEmpty(sqlQuery.getSelectList())) {
                sqlQuery.getSelectList().add(sqlQuery.getIdName());
            }
            
            String currWhereStr="";
            for (int i = 0; i * pcount < total; i++) {
                long limitStart = 0;
                long limitEnd = pcount;
                if ((i + 1) * pcount >= total) {
                    isLastPiece = true;
                }
                
                if(sqlQuery.getWhereList().contains(currWhereStr)){
                	sqlQuery.getWhereList().remove(currWhereStr);
                }
                
                currWhereStr=sqlQuery.getIdName() + " > " + currMaxId.longValue();
				sqlQuery.getWhereList().add(currWhereStr);
                
                TesseractResultSet currResult = this.dataQueryService.queryForDocListWithSQLQuery(
                    sqlQuery, dataSourceWrape, limitStart, limitEnd);
                
                
                
                while (currResult.size() != 0) {
                    // 向索引分片中写入数据
					if (currIdxShard == null) {
						currIdxShard = getFreeIndexShardForIndex(idxMeta);
					}
                    long startWriteIndex=System.nanoTime();
                    Map<String, Object> result = writeIndex(currResult, isInit, isUpdate, currIdxShard,
                        isLastPiece, sqlQuery.getIdName());
                    long endWriteIndex=System.nanoTime();
                    
                    totalTime=totalTime+(endWriteIndex-startWriteIndex);
                    System.out.println("******************************************write index cost : "+(endWriteIndex-startWriteIndex)+" ns ******************************************");
                    currResult = (TesseractResultSet) result.get(RESULT_KEY_DATA);
                    currMaxId = (BigDecimal) result.get(RESULT_KEY_MAXID);
                    // 更新数据
                    currIdxShard = (IndexShard) result.get(RESULT_KEY_INDEXSHARD);
                    
                    if (currIdxShard.isFull() || isLastPiece) {
                        // 当一个分片更新后，整个cube数据存在不一致的情况，这个状态会持续到所有分片都更新完成后
                        // 这时，需要设置cube数据不可用
                        idxMeta.setIdxState(IndexState.INDEX_UNAVAILABLE);
                        idxMeta = saveIndexShardIntoIndexMeta(currIdxShard, idxMeta);
						currIdxShard = null;
                    }
                    
                    if (isInit) {
                        isInit = Boolean.FALSE;
                    }
                    if (isUpdate) {
                        isUpdate = Boolean.FALSE;
                    }
                    
                }
                
                
            }
            maxDataIdMap.put(tableName, currMaxId);
            
        }
        //8888888888888888888888888888888888888888888888
        long endIndex=System.nanoTime();
        System.out.println("******************************************index cost : "+(endIndex-startIndex)+" ns ******************************************");
        System.out.println("******************************************write index cost : "+totalTime +" ns ***************************************");
        idxMeta.getDataDescInfo().setMaxDataIdMap(maxDataIdMap);
        if (idxMeta.getIdxState().equals(IndexState.INDEX_AVAILABLE_NEEDMERGE)) {
            idxMeta.getCubeIdSet().addAll(idxMeta.getCubeIdMergeSet());
            idxMeta.getCubeIdMergeSet().clear();
            idxMeta.getDimInfoMap().putAll(idxMeta.getDimInfoMergeMap());
            idxMeta.getMeasureInfoMap().putAll(idxMeta.getMeasureInfoMergeMap());
            idxMeta.getDimInfoMergeMap().clear();
            idxMeta.getMeasureInfoMergeMap().clear();
        }
        
        idxMeta.setIdxState(IndexState.INDEX_AVAILABLE);
        this.indexMetaService.saveOrUpdateIndexMeta(idxMeta);
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "doIndex",
            "[indexMeta:" + indexMeta + "][idxAction:" + idxAction + "]"));
        return true;
    }
    
    /**
     * 
     * getFreeIndexShardForIndex 从idxMeta中获取空闲的索引分片
     * 
     * @param indexMeta
     *            索引元数据
     * @return IndexShard 如果有未满的分片，则返回对应分片;否则申请新的分片;
     */
    private IndexShard getFreeIndexShardForIndex(IndexMeta indexMeta) {
        IndexMeta idxMeta = indexMeta;
        IndexShard result = null;
        if (idxMeta == null || idxMeta.getIdxShardList() == null) {
            throw new IllegalArgumentException();
        }
        
        if (this.indexMetaService.isIndexShardFull(idxMeta)) {
            idxMeta = this.indexMetaService.assignIndexShard(idxMeta, this.isNodeService
                    .getCurrentNode().getClusterName());
        }
        
        for (IndexShard idxShard : idxMeta.getIdxShardList()) {
            if (!idxShard.isFull()) {
                result = idxShard;
                break;
            }
        }
        
        return result;
    }
    
    /**
     * 
     * saveIndexShardIntoIndexMeta 保存索引分片到元数据中
     * 
     * @param idxShard
     *            索引分片
     * @param idxMeta
     *            索引元数据
     * @return IndexMeta 保存后的索引元数据
     */
    private IndexMeta saveIndexShardIntoIndexMeta(IndexShard idxShard, IndexMeta idxMeta) {
        if (idxMeta == null || idxShard == null || idxMeta.getIdxShardList() == null
                || !idxMeta.getIdxShardList().contains(idxShard)) {
            throw new IllegalArgumentException();
        }
        idxMeta.getIdxShardList().remove(idxShard);
        idxShard.setIdxMeta(idxMeta);
        idxMeta.getIdxShardList().add(idxShard);
        this.indexMetaService.saveOrUpdateIndexMeta(idxMeta);
        return idxMeta;
    }
    
    /**
     * 
     * 跟据sqlQuery得到select count语句
     * 
     * @param sqlQuery
     *            sqlQuery
     * @return String select count语句
     */
    private String getCountSQLBySQLQuery(SqlQuery sqlQuery) {
        StringBuffer sb = new StringBuffer();
        sb.append("select count(*) from (");
        sb.append(sqlQuery.toSql());
        sb.append(") as t");
        return sb.toString();
    }
    
    /**
     * 
     * writeIndex 向指定的分片中写数据，如果该分片写满或者写入的数据是最后一片，则启动数据拷贝线程
     * 
     * @param data
     *            要写的数据
     * @param isUpdate
     *            是否是更新
     * @param idxShard
     *            索引分片
     * @param lastPiece
     *            是否是最后一片数据
     * @return Map<String,Object>
     * @throws IndexAndSearchException
     *             可能抛出的异常
     * 
     */
    public Map<String, Object> writeIndex(TesseractResultSet data, boolean isInit,
            boolean isUpdate, IndexShard idxShard, boolean lastPiece, String idName)
            throws IndexAndSearchException {
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "writeIndex",
            "[data:" + data + "][isUpdate:" + isUpdate + "][idxShard:" + idxShard + "][lastPiece:"
                + lastPiece + "][idName:" + idName + "]"));
        // 数据分片规则
        // 调用
        
        IndexMessage message = null;
        message = isClient.index(data, isInit, isUpdate, idxShard, idName, lastPiece);
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, 
                "writeIndex", "index success"));
        
        
        
        idxShard.setDiskSize(message.getDiskSize());
        
        if (idxShard.isFull() || lastPiece) {
            // 设置提供服务的目录：
            String absoluteFilePath = message.getIdxPath();
            String absoluteIdxFilePath = message.getIdxServicePath();
            
            idxShard.setFilePathWithAbsoluteFilePath(absoluteFilePath, idxShard.getNode());
            idxShard.setIdxFilePathWithAbsoluteIdxFilePath(absoluteIdxFilePath, idxShard.getNode());
            
            // 启动数据copy线程拷贝数据到备分节点上
            if (CollectionUtils.isEmpty(idxShard.getReplicaNodeList())) {
                List<Node> assignedNodeList = this.isNodeService.assignFreeNodeForReplica(
                        IndexShard.getDefaultShardReplicaNum() - 1, idxShard.getNode());
                
                if (assignedNodeList != null && assignedNodeList.size() > 0) {
                    if (assignedNodeList.contains(idxShard.getNode())) {
                        assignedNodeList.remove(idxShard.getNode());
                    }
                    idxShard.setReplicaNodeList(assignedNodeList);
                }
                
            }
            
            for (Node node : idxShard.getReplicaNodeList()) {
                node.setNodeState(NodeState.NODE_UNAVAILABLE);
                this.isNodeService.saveOrUpdateNodeInfo(node);
                
            }
            
            for (Node node : idxShard.getReplicaNodeList()) {
                int retryTimes = 0;
                String targetFilePath = idxShard.getAbsoluteFilePath(node);
                ServerFeedbackMessage backMessage = null;
                while (retryTimes < TesseractConstant.RETRY_TIMES) {
                    backMessage = isClient.copyIndexDataToRemoteNode(absoluteIdxFilePath,
                        targetFilePath, true, node);
                    if (backMessage.getResult().equals(FileUtils.SUCC)) {
                        node.setNodeState(NodeState.NODE_AVAILABLE);
                        this.isNodeService.saveOrUpdateNodeInfo(node);
                        LOGGER.info(String.format(
                            LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "writeIndex",
                            "copy index success to " + node));
                        break;
                    } else {
                        LOGGER.info(String.format(
                            LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "writeIndex",
                            "retry copy index to " + node));
                        retryTimes++;
                    }
                    
                }
                
            }
        }
        
        Map<String, Object> result = new HashMap<String, Object>();
        result.put(RESULT_KEY_INDEXSHARD, idxShard);
        result.put(RESULT_KEY_DATA, message.getDataBody());
        result.put(RESULT_KEY_MAXID, message.getMaxId());
        
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "writeIndex",
            "[data:" + data + "][isUpdate:" + isUpdate + "][idxShard:" + idxShard + "][lastPiece:"
                + lastPiece + "][idName:" + idName + "]"));
        return result;
        
    }
    
    /**
     * 
     * 根据IndexMeta获取从事实表中取数据的SQLQuery对像
     * 
     * @param idxMeta
     *            当前的idxMeta
     * @return List<SQLQuery> 返回sqlquery对像
     * @throws IndexMetaIsNullException
     *             当idxMeta为空时会抛出异常
     */
    private Map<String, SqlQuery> transIndexMeta2SQLQuery(IndexMeta idxMeta)
            throws IndexMetaIsNullException {
        Map<String, SqlQuery> result = new HashMap<String, SqlQuery>();
        if (idxMeta == null || idxMeta.getDataDescInfo() == null) {
            throw generateIndexMetaIsNullException(idxMeta);
        }
        
        Set<String> selectList = idxMeta.getSelectList();
        if (selectList == null) {
            selectList = new HashSet<String>();
        }
        String idName=idxMeta.getDataDescInfo().getIdStr();
        for (String tableName : idxMeta.getDataDescInfo().getTableNameList()) {
            SqlQuery sqlQuery = new SqlQuery();
            LinkedList<String> fromList = new LinkedList<String>();
            fromList.add(tableName);
            sqlQuery.setFromList(fromList);
            sqlQuery.getSelectList().addAll(selectList);
            result.put(tableName, sqlQuery);
            if(!StringUtils.isEmpty(idName)){
                sqlQuery.setIdName(idName);
            }
        }
        
        return result;
    }
    
    /**
     * 
     * 统一的生成IndexMetaIsNullException
     * 
     * @param idxMeta
     *            索引元数据
     * @return IndexMetaIsNullException
     */
    private IndexMetaIsNullException generateIndexMetaIsNullException(IndexMeta idxMeta) {
        StringBuffer sb = new StringBuffer();
        if (idxMeta == null) {
            sb.append("IndexMeta [");
            sb.append(idxMeta);
            sb.append("]");
        } else {
            sb.append(idxMeta.toString());
        }
        LOGGER.info("IndexMetaIsNullException ocurred:" + sb.toString());
        return new IndexMetaIsNullException(sb.toString());
    }
    
}
