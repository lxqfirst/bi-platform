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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;

/**
 * SQLQuery
 * 
 * @author lijin
 *
 */
public class SqlQuery {
    /**
     * 查询字段
     */
    private List<String> selectList;
    /**
     * idName
     */
    private String idName ;
    /**
     * 查询的表
     */
    private LinkedList<String> fromList;
    /**
     * where 条件 (所有的where都是and关系，其它关系，请写到where内部)
     */
    private List<String> whereList;
    
    /**
     * limit条件，key有两个：limitStart及limitEnd,其中limitStart默认为0
     */
    private Map<String, Long> limitMap;
    
    /**
     * LIMITMAP_KEY_LIMITSTART
     */
    private static final String LIMITMAP_KEY_LIMITSTART = "limitStart";
    /**
     * LIMITMAP_KEY_LIMITEND
     */
    private static final String LIMITMAP_KEY_LIMITEND = "limitEnd";
    
    /**
     * groupBy
     */
    private Set<String> groupBy;
    
    /**
     * getter method for property selectList
     * 
     * @return the selectList
     */
    public List<String> getSelectList() {
        if (this.selectList == null) {
            this.selectList = new ArrayList<String>();
        }
        
        return selectList;
    }
    
    /**
     * setter method for property selectList
     * 
     * @param selectList
     *            the selectList to set
     */
    public void setSelectList(List<String> selectList) {
        this.selectList = selectList;
    }
    
    /**
     * getter method for property fromList
     * 
     * @return the fromList
     */
    public LinkedList<String> getFromList() {
        return fromList;
    }
    
    /**
     * setter method for property fromList
     * 
     * @param fromList
     *            the fromList to set
     */
    public void setFromList(LinkedList<String> fromList) {
        this.fromList = fromList;
    }
    
    /**
     * getter method for property whereList
     * 
     * @return the whereList
     */
    public List<String> getWhereList() {
        if (this.whereList == null) {
            this.whereList = new ArrayList<String>();
        }
        return whereList;
    }
    
    /**
     * setter method for property whereList
     * 
     * @param whereList
     *            the whereList to set
     */
    public void setWhereList(List<String> whereList) {
        this.whereList = whereList;
    }
    
    /**
     * getter method for property limitMap
     * 
     * @return the limitMap
     */
    public Map<String, Long> getLimitMap() {
        return limitMap;
    }
    
    /**
     * setter method for property limitMap
     * 
     * @param limitMap
     *            the limitMap to set
     */
    public void setLimitMap(Map<String, Long> limitMap) {
        this.limitMap = limitMap;
    }
    
    /**
     * setLimitMap
     * 
     * @param limitStart
     *            起始
     * @param limitEnd
     *            条数
     */
    public void setLimitMap(long limitStart, long limitEnd) {
        long start = limitStart;
        long end = limitEnd;
        if (start < 0) {
            start = 0;
        }
        if (this.limitMap == null) {
            this.limitMap = new HashMap<String, Long>();
        }
        this.limitMap.put(LIMITMAP_KEY_LIMITSTART, start);
        if (end > 0) {
            this.limitMap.put(LIMITMAP_KEY_LIMITEND, end);
        }
    }
    
    /**
     * 
     * 转换成SQL
     * 
     * @return String
     */
    public String toSql() {
        StringBuffer sb = new StringBuffer();
        // 处理select
        if (this.selectList != null) {
            sb.append("select");
//            if (!StringUtils.isEmpty(this.idName)) {
//                sb.append(" " + this.idName + ",");
//            }
            
            for (int i = 0; i < selectList.size(); i++) {
                String select = selectList.get(i);
                sb.append(" ");
                sb.append(select);
                if (i < selectList.size() - 1) {
                    sb.append(",");
                }
            }
            
            if (this.fromList != null) {
                // 处理from
                sb.append(" from ");
                for (int i = 0; i < fromList.size(); i++) {
                    String from = fromList.get(i);
                    sb.append(" ");
                    sb.append(from);
                    if (i < fromList.size() - 1) {
                        sb.append(",");
                    }
                }
            }
            if (CollectionUtils.isNotEmpty(this.whereList)) {
                sb.append(" where ");
                for (int i = 0; i < whereList.size(); i++) {
                    String where = whereList.get(i);
                    sb.append(" ");
                    sb.append(where);
                    if (i < whereList.size() - 1) {
                        sb.append(" and ");
                    }
                }
                
            }
            if (this.limitMap != null) {
                // 处理limit
                StringBuffer limitStringBuffer = new StringBuffer();
                
                long limitStart = 0;
                if (this.limitMap.get(LIMITMAP_KEY_LIMITSTART) != null) {
                    limitStart = this.limitMap.get(LIMITMAP_KEY_LIMITSTART);
                }
                long limitEnd = 0;
                if (this.limitMap.get(LIMITMAP_KEY_LIMITEND) != null) {
                    limitEnd = this.limitMap.get(LIMITMAP_KEY_LIMITEND);
                }
                if (limitStart >= 0 && limitEnd > 0) {
                	limitStringBuffer.append(" limit ");
                    limitStringBuffer.append(limitStart);
                    limitStringBuffer.append(",");
                    limitStringBuffer.append(limitEnd);
				} else if (limitEnd > 0) {
					limitStringBuffer.append(" limit ");
					limitStringBuffer.append(limitEnd);
				}
                
                
                sb.append(limitStringBuffer);
            }
        }
        return sb.toString();
    }
    
    /**
     * getter method for property idName
     * 
     * @return the idName
     */
    public String getIdName() {
        return idName;
    }
    
    /**
     * setter method for property idName
     * 
     * @param idName
     *            the idName to set
     */
    public void setIdName(String idName) {
        this.idName = idName;
    }

    /**
     * get groupBy
     * @return the groupBy
     */
    public Set<String> getGroupBy() {
        return groupBy;
    }

    /**
     * set groupBy with groupBy
     * @param groupBy the groupBy to set
     */
    public void setGroupBy(Set<String> groupBy) {
        this.groupBy = groupBy;
    }
    
}
