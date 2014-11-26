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
package com.baidu.rigel.biplatform.ac.query.model;

import java.io.Serializable;

/**
 * 分页信息
 * @author xiaoming.chen
 *
 */
public class PageInfo implements Serializable {

    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = -7767822498708728360L;
    
    /**
     * DEFAULT_PAGE_SIZE 默认每页记录数
     */
    public static final int DEFAULT_PAGE_SIZE = 500;
    
    /**
     * totalSize 总记录数
     */
    private int totalSize;
    
    /**
     * pageNo 当前第几页
     */
    private int pageNo;
    
    /**
     * totalPage 总页数
     */
    private int totalPage;
    
    /**
     * pageSize 每页的记录数
     */
    private int pageSize = PageInfo.DEFAULT_PAGE_SIZE;

    /**
     * getter method for property totalSize
     * @return the totalSize
     */
    public int getTotalSize() {
        return totalSize;
    }

    /**
     * setter method for property totalSize
     * @param totalSize the totalSize to set
     */
    public void setTotalSize(int totalSize) {
        this.totalSize = totalSize;
    }

    /**
     * getter method for property pageNo
     * @return the pageNo
     */
    public int getPageNo() {
        return pageNo;
    }

    /**
     * setter method for property pageNo
     * @param pageNo the pageNo to set
     */
    public void setPageNo(int pageNo) {
        this.pageNo = pageNo;
    }

    /**
     * getter method for property totalPage
     * @return the totalPage
     */
    public int getTotalPage() {
        return totalPage;
    }

    /**
     * setter method for property totalPage
     * @param totalPage the totalPage to set
     */
    public void setTotalPage(int totalPage) {
        this.totalPage = totalPage;
    }

    /**
     * getter method for property pageSize
     * @return the pageSize
     */
    public int getPageSize() {
        return pageSize;
    }

    /**
     * setter method for property pageSize
     * @param pageSize the pageSize to set
     */
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    /* (non-Javadoc)
     * @see java.lang.Object#toString()
     */
    @Override
    public String toString() {
        return "PageInfo [totalSize=" + totalSize + ", pageNo=" + pageNo + ", totalPage="
            + totalPage + ", pageSize=" + pageSize + "]";
    }
    
}
