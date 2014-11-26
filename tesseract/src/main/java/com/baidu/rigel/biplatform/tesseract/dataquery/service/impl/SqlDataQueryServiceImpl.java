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
package com.baidu.rigel.biplatform.tesseract.dataquery.service.impl;

import java.io.Serializable;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.apache.commons.collections.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.tesseract.dataquery.service.DataQueryService;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.SqlQuery;
import com.baidu.rigel.biplatform.tesseract.isservice.search.agg.AggregateCompute;
import com.baidu.rigel.biplatform.tesseract.qsservice.query.vo.QueryRequest;
import com.baidu.rigel.biplatform.tesseract.resultset.TesseractResultSet;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.Meta;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.ResultRecord;
import com.baidu.rigel.biplatform.tesseract.resultset.isservice.SearchResultSet;
import com.baidu.rigel.biplatform.tesseract.util.isservice.LogInfoConstants;
import com.google.common.collect.Lists;

/**
 * 
 * SQLDataQueryService的实现类
 * 
 * @author lijin
 *
 */
@Service("sqlDataQueryService")
public class SqlDataQueryServiceImpl implements DataQueryService {
    /**
     * LOGGER
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(SqlDataQueryServiceImpl.class);
    /**
     * jdbcTemplate
     */
    private JdbcTemplate jdbcTemplate = null;
    
    /**
     * 
     * initJdbcTemplate
     * 
     * @param dataSource
     *            dataSource
     */
    private void initJdbcTemplate(DataSource dataSource) {
        if (jdbcTemplate == null || !this.jdbcTemplate.getDataSource().equals(dataSource)) {
            this.jdbcTemplate = null;
            jdbcTemplate = new JdbcTemplate(dataSource);
        }
        
    }
    
    @Override
    public List<Map<String, Object>> queryForListWithSql(String sql, DataSource dataSource) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "queryForListWithSql", "[sql:" + sql + "][dataSource:" + dataSource + "]"));
        initJdbcTemplate(dataSource);
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END,
            "queryForListWithSql", "[sql:" + sql + "][dataSource:" + dataSource + "]"));
        return this.jdbcTemplate.queryForList(sql);
        
    }
    
    /**
     * getter method for property jdbcTemplate
     * 
     * @param dataSource
     *            获取某数据源下的jdbcTemplate
     * @return the jdbcTemplate
     */
    @Override
    public JdbcTemplate getJdbcTemplate(DataSource dataSource) {
        this.initJdbcTemplate(dataSource);
        return jdbcTemplate;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.dataquery.service.DataQueryService
     * #queryForDocListWithSQLQuery
     * (com.baidu.rigel.biplatform.tesseract.isservice.meta.SQLQuery,
     * javax.sql.DataSource, long, long)
     */
    @Override
    public TesseractResultSet queryForDocListWithSQLQuery(SqlQuery sqlQuery, DataSource dataSource, long limitStart,
            long limitEnd) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "queryForDocListWithSQLQuery",
                "[sqlQuery:" + sqlQuery + "][dataSource:" + dataSource + "][limitStart:" + limitStart + "][limitEnd:"
                        + limitEnd + "]"));
        long current = System.currentTimeMillis();

        TesseractResultSet result = new SearchResultSet(querySqlList(sqlQuery, dataSource, limitStart, limitEnd));
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "queryForDocListWithSQLQuery",
                "[sqlQuery:" + sqlQuery + "][dataSource:" + dataSource + "][limitStart:" + limitStart + "][limitEnd:"
                        + limitEnd + "] cost" + (System.currentTimeMillis() - current + "ms!")));
        return result;
    }
    
    
    /**
     * 通过数据库查询指定SQL，并转换成resultRecord list
     * @param sqlQuery
     * @param dataSource
     * @param limitStart
     * @param limitEnd
     * @return
     */
    private LinkedList<ResultRecord> querySqlList(SqlQuery sqlQuery, DataSource dataSource, long limitStart,
            long limitEnd) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "querySqlList", "[sqlQuery:" + sqlQuery.toSql()
                + "][dataSource:" + dataSource + "][limitStart:" + limitStart + "][limitEnd:" + limitEnd + "]"));
        long current = System.currentTimeMillis();
        if (sqlQuery == null || dataSource == null || limitEnd < 0) {
            throw new IllegalArgumentException();
        }

        sqlQuery.setLimitMap(limitStart, limitEnd);

        this.initJdbcTemplate(dataSource);

        LinkedList<ResultRecord> resultList = Lists.newLinkedList();

        Meta meta = new Meta(sqlQuery.getSelectList().toArray(new String[0]));

        jdbcTemplate.query(new PreparedStatementCreator() {

            @Override
            public PreparedStatement createPreparedStatement(Connection con) throws SQLException {
                PreparedStatement pstmt =
                        con.prepareStatement(sqlQuery.toSql(), ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
                pstmt.setFetchSize(Integer.MIN_VALUE);
                return pstmt;
            }
        }, new RowCallbackHandler() {

            @Override
            public void processRow(ResultSet rs) throws SQLException {
                List<Object> fieldValues = new ArrayList<Object>();
                String groupBy = "";
                for (String select : sqlQuery.getSelectList()) {
                    fieldValues.add(rs.getObject(select));
                    if (sqlQuery.getGroupBy() != null && sqlQuery.getGroupBy().contains(select)) {
                        groupBy += rs.getString(select) + ",";
                    }
                }

                ResultRecord record = new ResultRecord(fieldValues.toArray(new Serializable[0]), meta);
                record.setGroupBy(groupBy);
                resultList.add(record);
            }
        });
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "querySqlList", "[sqlQuery:" + sqlQuery
                + "][dataSource:" + dataSource + "][limitStart:" + limitStart + "][limitEnd:" + limitEnd + "] cost"
                + (System.currentTimeMillis() - current + "ms!")));
        return resultList;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.dataquery.service.DataQueryService
     * #queryForLongWithSql(java.lang.String, javax.sql.DataSource)
     */
    @Override
    public long queryForLongWithSql(String sql, DataSource dataSource) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "queryForListWithSql", "[sql:" + sql + "][dataSource:" + dataSource + "]"));
        long result = -1;
        if (StringUtils.isEmpty(sql) || dataSource == null) {
            throw new IllegalArgumentException();
        }
        this.initJdbcTemplate(dataSource);
        
        result = this.jdbcTemplate.queryForObject(sql, Long.class);
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END,
            "queryForListWithSql", "[sql:" + sql + "][dataSource:" + dataSource + "]"));
        return result;
    }

    @Override
    public TesseractResultSet queryForListWithSQLQueryAndGroupBy(SqlQuery sqlQuery, DataSource dataSource,
            long limitStart, long limitEnd, QueryRequest queryRequest) {

        long current = System.currentTimeMillis();

        LinkedList<ResultRecord> resultList = querySqlList(sqlQuery, dataSource, limitStart, limitEnd);
        
        LOGGER.info("query sql:" + sqlQuery.toSql() + "result size: " + resultList.size() + " cost:" + (System.currentTimeMillis() - current));
        current = System.currentTimeMillis();
        
        if (CollectionUtils.isEmpty(resultList)) {
            LOGGER.warn("no result from sql query:" + sqlQuery.toSql());
            return new SearchResultSet(null);
        }
        TesseractResultSet result = new SearchResultSet(AggregateCompute.aggregate(resultList, queryRequest));
        LOGGER.info("group by cost:" + (System.currentTimeMillis() - current));

        return result;
    }

}
