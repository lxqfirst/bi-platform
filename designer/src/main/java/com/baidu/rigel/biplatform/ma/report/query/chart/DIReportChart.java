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
package com.baidu.rigel.biplatform.ma.report.query.chart;

import java.io.Serializable;
import java.util.List;

/**
 * HighCharts图表对象
 * 
 * @author zhongyi
 *
 */
public class DIReportChart implements Serializable {
    
    /**
     * serialized id
     */
    private static final long serialVersionUID = 3417297142845383674L;
    
    private String title;
    private String subTitle;
    
    private String xAxisType; // catagory: 'asdf', datatime 2012-12-12, month
                              // 2012-12 ， quarter: 2012-Q1
    private String[] xAxisCategories;
    
    private List<YAxis> yAxises;
    
    private List<SeriesDataUnit> seriesData;
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getSubTitle() {
        return subTitle;
    }
    
    public void setSubTitle(String subTitle) {
        this.subTitle = subTitle;
    }
    
    public String getxAxisType() {
        return xAxisType;
    }
    
    public void setxAxisType(String xAxisType) {
        this.xAxisType = xAxisType;
    }
    
    public String[] getxAxisCategories() {
        return xAxisCategories;
    }
    
    public void setxAxisCategories(String[] xAxisCategories) {
        this.xAxisCategories = xAxisCategories;
    }
    
    public List<SeriesDataUnit> getSeriesData() {
        return seriesData;
    }
    
    public void setSeriesData(List<SeriesDataUnit> seriesData) {
        this.seriesData = seriesData;
    }
    
    public List<YAxis> getyAxises() {
        return yAxises;
    }
    
    public void setyAxises(List<YAxis> yAxises) {
        this.yAxises = yAxises;
    }
}
