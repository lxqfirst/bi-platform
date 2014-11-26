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
package com.baidu.rigel.biplatform.tesseract.isservice.search.service.impl;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import javax.annotation.Resource;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.tesseract.dataquery.service.DataQueryService;
import com.baidu.rigel.biplatform.tesseract.datasource.DataSourcePoolService;
import com.baidu.rigel.biplatform.tesseract.datasource.impl.SqlDataSourceWrap;
import com.baidu.rigel.biplatform.tesseract.exception.DataSourceException;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexAndSearchException;
import com.baidu.rigel.biplatform.tesseract.isservice.exception.IndexAndSearchExceptionType;
import com.baidu.rigel.biplatform.tesseract.isservice.index.service.IndexMetaService;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexMeta;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexShard;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexState;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.SqlQuery;
import com.baidu.rigel.biplatform.tesseract.isservice.search.agg.AggregateCompute;
import com.baidu.rigel.biplatform.tesseract.isservice.search.service.SearchService;
import com.baidu.rigel.biplatform.tesseract.node.meta.Node;
import com.baidu.rigel.biplatform.tesseract.node.service.IndexAndSearchClient;
import com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryMeasure;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest;
import com.baidu.rigel.biplatform.tesseract.resultset.TesseractResultSet;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.ResultRecord;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.SearchResultSet;
import com.baidu.rigel.biplatform.tesseract.util.QueryRequestUtil;
import com.baidu.rigel.biplatform.tesseract.util.TesseractExceptionUtils;
import com.baidu.rigel.biplatform.tesseract.util.isservice.LogInfoConstants;

/**
 * SearchService 实现类
 * 
 * @author lijin
 *
 */
@Service("searchService")
public class SearchIndexServiceImpl implements SearchService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SearchIndexServiceImpl.class);

    /**
     * IndexAndSearchClient
     */

    private IndexAndSearchClient isClient;

    /**
     * 索引元数据服务
     */
    @Resource(name = "indexMetaService")
    private IndexMetaService idxMetaService;

    @Resource
    private IsNodeService isNodeService;

    /**
     * dataQueryService
     */
    @Resource(name = "sqlDataQueryService")
    private DataQueryService dataQueryService;

    /**
     * dataSourcePoolService
     */
    @Resource
    private DataSourcePoolService dataSourcePoolService;

    /**
     * Constructor by no param
     */
    public SearchIndexServiceImpl() {
        super();
        this.isClient = IndexAndSearchClient.getNodeClient();
    }

    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.isservice.search.SearchService#query
     * (com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest)
     */
    @Override
    public TesseractResultSet query(QueryRequest query) throws IndexAndSearchException {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "query", "[query:" + query + "]"));
        // 1. Does all the existed index cover this query
        // 2. get index meta and index shard
        // 3. trans query to Query that can used for searching
        // 4. dispatch search query
        // 5. do search
        // 6. merge result
        // 7. return

        if (query == null || StringUtils.isEmpty(query.getCubeId())) {
            LOGGER.error(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION, "query", "[query:" + query
                    + "]"));
            throw new IndexAndSearchException(TesseractExceptionUtils.getExceptionMessage(
                    IndexAndSearchException.QUERYEXCEPTION_MESSAGE,
                    IndexAndSearchExceptionType.ILLEGALARGUMENT_EXCEPTION),
                    IndexAndSearchExceptionType.ILLEGALARGUMENT_EXCEPTION);
        }
        IndexMeta idxMeta =
                this.idxMetaService.getIndexMetaByCubeId(query.getCubeId(), query.getDataSourceInfo()
                        .getDataSourceKey());

        TesseractResultSet result = null;
        long current = System.currentTimeMillis();
        if (idxMeta == null
                || idxMeta.getIdxState().equals(IndexState.INDEX_UNAVAILABLE)
                || idxMeta.getIdxState().equals(IndexState.INDEX_UNINIT)
                || !query.isUseIndex()
                || (query.getFrom() != null && query.getFrom().getFrom() != null && !idxMeta.getDataDescInfo()
                        .getTableNameList().contains(query.getFrom().getFrom()))
                || !indexMetaContains(idxMeta, query)) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "query", "use database"));
            // index does not exist or unavailable,use db query
            SqlQuery sqlQuery = QueryRequestUtil.transQueryRequest2SqlQuery(query);
            SqlDataSourceWrap dataSourceWrape = null;
            try {
                dataSourceWrape =
                        (SqlDataSourceWrap) this.dataSourcePoolService.getDataSourceByKey(query.getDataSourceInfo());
            } catch (DataSourceException e) {
                LOGGER.error(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION, "query", "[query:" + query
                        + "]", e));
                throw new IndexAndSearchException(TesseractExceptionUtils.getExceptionMessage(
                        IndexAndSearchException.QUERYEXCEPTION_MESSAGE, IndexAndSearchExceptionType.SQL_EXCEPTION), e,
                        IndexAndSearchExceptionType.SQL_EXCEPTION);
            }
            if (dataSourceWrape == null) {
                throw new IllegalArgumentException();
            }

            long limitStart = 0;
            long limitSize = 0;
            if (query.getLimit() != null) {
                limitStart = query.getLimit().getStart();
				if (query.getLimit().getSize() > 0) {
					limitSize = query.getLimit().getSize();
				}
                
            }
            TesseractResultSet currResult =
                    this.dataQueryService.queryForListWithSQLQueryAndGroupBy(sqlQuery, dataSourceWrape, limitStart,
                            limitSize, query);
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "query", "db return "
                    + currResult.size() + " records"));
            result = currResult;
        } else {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "query", "use index"));

            LOGGER.info("cost :" + (System.currentTimeMillis() - current) + " before prepare get record.");
            current = System.currentTimeMillis();

            List<TesseractResultSet> idxShardResultSetList = new ArrayList<TesseractResultSet>();
            for (IndexShard idxShard : idxMeta.getIdxShardList()) {
                TesseractResultSet curr = null;
                Node searchNode = isNodeService.getFreeSearchNodeByIndexShard(idxShard);
                searchNode.searchRequestCountAdd();
                this.isNodeService.saveOrUpdateNodeInfo(searchNode);
                try {
                    curr = (TesseractResultSet) this.isClient.search(query, idxShard, searchNode).getMessageBody();
                    idxShardResultSetList.add(curr);
                    searchNode.searchrequestCountSub();
                    this.isNodeService.saveOrUpdateNodeInfo(searchNode);

                } catch (Exception e) {
                    throw new IndexAndSearchException(TesseractExceptionUtils.getExceptionMessage(
                            IndexAndSearchException.QUERYEXCEPTION_MESSAGE,
                            IndexAndSearchExceptionType.NETWORK_EXCEPTION), e,
                            IndexAndSearchExceptionType.NETWORK_EXCEPTION);
                }

            }
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "query",
                    "merging result from multiple index"));
            result = mergeResultSet(idxShardResultSetList, query);
            StringBuilder sb = new StringBuilder();
            sb.append("cost :").append(System.currentTimeMillis() - current)
                    .append(" in get result record,result size:").append(result.size()).append(" shard size:")
                    .append(idxShardResultSetList.size());

            LOGGER.info(sb.toString());
            current = System.currentTimeMillis();
        }

        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_PROCESS_NO_PARAM, "query",
                "merging final result"));
        if (query.getGroupBy() != null) {
            try {
                result = QueryRequestUtil.processGroupBy(result, query);
            } catch (NoSuchFieldException e) {
                e.printStackTrace();
                LOGGER.error(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION, "query", "[query:" + query
                        + "]", e));
                throw new IndexAndSearchException(TesseractExceptionUtils.getExceptionMessage(
                        IndexAndSearchException.QUERYEXCEPTION_MESSAGE, IndexAndSearchExceptionType.SEARCH_EXCEPTION),
                        e, IndexAndSearchExceptionType.SEARCH_EXCEPTION);
            }

        }

        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "query", "[query:" + query + "]"));
        return result;
    }

    /**
     * 
     * mergeResultSet
     * 
     * @param resultList 要合并的TesseractResultSet集合
     * @return TesseractResultSet
     */
    private TesseractResultSet mergeResultSet(List<TesseractResultSet> resultList, QueryRequest query) {
        TesseractResultSet result = null;
        LinkedList<ResultRecord> resultQ = new LinkedList<ResultRecord>();
        for (TesseractResultSet tr : resultList) {
            SearchResultSet sr = (SearchResultSet) tr;
            resultQ.addAll(sr.getResultQ());
        }

        result = new SearchResultSet(AggregateCompute.aggregate(resultQ, query));
        return result;

    }
    
    /**
     * 
     * 当前查询的指标与维度是否存在于索引元数据中
     * @param idxMeta 索引元数据
     * @param query 查询
     * @return boolean
     */
    private boolean indexMetaContains(IndexMeta idxMeta, QueryRequest query) {
        boolean result = false;
        if (idxMeta == null || query == null) {
            return result;
        }
        Set<String> idxSelect = idxMeta.getSelectList();
        
        if (!CollectionUtils.isEmpty(idxSelect)
                && idxSelect.containsAll(query.getSelect().getQueryProperties())) {
            for (QueryMeasure qm : query.getSelect().getQueryMeasures()) {
                if (!idxSelect.contains(qm.getProperties())) {
                    result = false;
                    break;
                } else {
                    result = true;
                }
            }
            
        }
        return result;
        
    }

}
