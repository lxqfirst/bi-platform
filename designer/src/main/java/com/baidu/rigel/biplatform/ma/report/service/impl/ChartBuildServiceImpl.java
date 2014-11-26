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
package com.baidu.rigel.biplatform.ma.report.service.impl;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ma.report.query.chart.DIReportChart;
import com.baidu.rigel.biplatform.ma.report.query.chart.SeriesDataUnit;
import com.baidu.rigel.biplatform.ma.report.query.chart.SeriesInputInfo;
import com.baidu.rigel.biplatform.ma.report.query.chart.SeriesInputInfo.SeriesUnitType;
import com.baidu.rigel.biplatform.ma.report.query.chart.XAxisType;
import com.baidu.rigel.biplatform.ma.report.query.chart.YAxis;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.CellData;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.ColDefine;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.PivotTable;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.RowDefine;
import com.baidu.rigel.biplatform.ma.report.service.ChartBuildService;
import com.google.common.collect.Lists;

/**
 * 
 * 透视表转换成报表图形服务实现
 * 
 * @author zhongyi
 * 
 *         2014-8-14
 */
@Service("chartBuildService")
public class ChartBuildServiceImpl implements ChartBuildService {

    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.ma.report.service.ChartBuildService#parseToChart
     * (com.baidu.rigel.biplatform.ma.report.query.pivotTable.PivotTable)
     */
    @Override
    public DIReportChart parseToChart(PivotTable tableResult, String[] chartType, boolean isTimeChart) {

        DIReportChart reportChart = new DIReportChart();
//        reportChart.setTitle("趋势图");
//        reportChart.setSubTitle("");
        reportChart.setSeriesData(Lists.<SeriesDataUnit> newArrayList());
        // for(int i=0; i<tableResult.getColDefine().size(); i++){
        // SeriesInputInfo seriesInput = chartMeta.getSeriesSet().get(i);
        // if(!dataSets.containsKey(String.valueOf(i))){
        // continue;
        // }
        List<SeriesInputInfo> seriesInputs = Lists.newArrayList();
        for(String type : chartType) {
	        	SeriesInputInfo seriesInput = new SeriesInputInfo();
        		if (isTimeChart) {
        			seriesInput.setType(SeriesUnitType.LINE);
        		} else {
        			seriesInput.setType(SeriesUnitType.valueOf(type));
        		}
	        	seriesInput.setyAxisName(type);
	        	seriesInputs.add(seriesInput);
        	
        }
        List<SeriesDataUnit> seriesUnits = getSeriesUnitsByInputUnit(seriesInputs, tableResult);
        reportChart.getSeriesData().addAll(seriesUnits);
        // }
        // ChartMetaData chartMeta = new ChartMetaData();
        reportChart.setyAxises(Lists.<YAxis> newArrayList());
        YAxis yAxis = new YAxis(); // chartMeta.getYAxises().get("test_axis");
        yAxis.setName("纵轴");
        yAxis.setUnitName("单位");
        reportChart.getyAxises().add(yAxis);

        /**
         * use the x axis from query result from first series.
         */
        reportChart.setxAxisCategories(getXAxisCategories(tableResult, isTimeChart));
		if (isTimeChart) {
            reportChart.setxAxisType(XAxisType.DATETIME.getName());
        } else {
            reportChart.setxAxisType(XAxisType.CATEGORY.getName());
        }
        return reportChart;
    }

    /**
     * 
     * @param pTable
     * @return
     */
    private String[] getXAxisCategories(PivotTable pTable, boolean isTimeDimOnXAxis) {
        if (pTable.getRowDefine() == null || pTable.getRowDefine().size() == 0) {
            return new String[0];
        }
        List<String> categories = Lists.newArrayList();
        for (int i = 0; i < pTable.getRowDefine().size(); i++) {
            RowDefine row = pTable.getRowDefine().get(i);
            if (StringUtils.isEmpty(row.getShowXAxis())) {
                continue;
            }
            /**
             * showXAxis will be used as x axis for chart
             */
            if (isTimeDimOnXAxis) {
                String dateStr = row.getShowXAxis();
                SimpleDateFormat sf = new SimpleDateFormat("yyyyMMdd");
                SimpleDateFormat sfTarget = new SimpleDateFormat("yyyy-MM-dd");
                try {
                    Date date = sf.parse(dateStr);
                    dateStr = sfTarget.format(date);
                } catch (ParseException e) {
                    /**
                     * TODO 格式不对忽略怎么样？
                     */
                    e.printStackTrace();
                }
                categories.add(dateStr);
            } else {
                categories.add(row.getShowXAxis());
            }
        }
        return categories.toArray(new String[0]);
    }

    /**
     * 
     * @param seriesInput
     * @param pTable
     * @return
     */
    private List<SeriesDataUnit> getSeriesUnitsByInputUnit(List<SeriesInputInfo> seriesInput, PivotTable pTable) {

        List<SeriesDataUnit> units = Lists.newArrayList();

        List<ColDefine> columnDefs = pTable.getColDefine();

        for (int i = 0; i < columnDefs.size(); i++) {
            ColDefine col = columnDefs.get(i);
            // TODO the showName should be put in generateSeriesBranch method as
            // third parameter.
            SeriesInputInfo info = seriesInput.get(i);
            SeriesDataUnit branchData = generateSeriesBranch(pTable, col.getUniqueName(), col.getCaption(), info
                    .getType().getName(), col.getFormat(), info.getyAxisName(), i);
            units.add(branchData);
        }
        return units;
    }

    /**
     * 
     * @param pTable
     * @param columnUniqName
     * @param showName
     * @param type
     * @param format
     * @param yAxisName
     * @return
     */
    private SeriesDataUnit generateSeriesBranch(PivotTable pTable, String columnUniqName, String showName, String type,
            String format, String yAxisName, int i) {

        List<CellData> columnData = pTable.getDataSourceColumnBased().get(i);
        SeriesDataUnit seriesUnit = new SeriesDataUnit();
        seriesUnit.setData(getDataFromCells(columnData));
        seriesUnit.setName(showName);
        seriesUnit.setType(type);
        seriesUnit.setFormat(format);
        seriesUnit.setyAxisName(yAxisName);
        return seriesUnit;
    }

    /**
     * 
     * @param columnData
     * @return
     */
    private BigDecimal[] getDataFromCells(List<CellData> columnData) {

        BigDecimal[] result = new BigDecimal[columnData.size()];
        for (int i = 0; i < columnData.size(); i++) {
            result[i] = columnData.get(i).getV();
        }
        return result;
    }

}