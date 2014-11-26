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
package com.baidu.rigel.biplatform.tesseract.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

import org.junit.Assert;
import org.junit.Test;

import com.baidu.rigel.biplatform.ac.util.TimeRangeDetail;

/**
 * 
 * 测试类
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class TimeUtilsTest {
    
    /**
     * 
     */
    @Test
    public void testGetDaysWithDayIsNull() {
        TimeRangeDetail range = TimeUtils.getDays(null,  0, 0);
        String timeStr = TimeRangeDetail.toTime(null);
        Assert.assertEquals(timeStr, range.getStart());
        Assert.assertEquals(timeStr, range.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetGetDaysWithBeforeMinerZero() {
        TimeRangeDetail range = TimeUtils.getDays(null,  -5, 0);
        String timeStr = TimeRangeDetail.toTime(null);
        Assert.assertEquals(timeStr, range.getStart());
        Assert.assertEquals(timeStr, range.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetGetDaysWithAfterMinerZero() {
        TimeRangeDetail range = TimeUtils.getDays(null,  -5, -5);
        String timeStr = TimeRangeDetail.toTime(null);
        Assert.assertEquals(timeStr, range.getStart());
        Assert.assertEquals(timeStr, range.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetGetDaysWithBeforeMoreThanZero() {
        TimeRangeDetail range = TimeUtils.getDays(null,  5, 0);
        String timeStr = TimeRangeDetail.toTime(null);
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, 0 - 5);
        Assert.assertEquals(TimeRangeDetail.toTime(calendar.getTime()), range.getStart());
        Assert.assertEquals(timeStr, range.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetGetDaysWithAfterMoreThanZero() {
        TimeRangeDetail range = TimeUtils.getDays(null,  5, 5);
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, 0 - 5);
        Assert.assertEquals(TimeRangeDetail.toTime(calendar.getTime()), range.getStart());
        Calendar end = Calendar.getInstance();
        end.add(Calendar.DAY_OF_YEAR, 5);
        Assert.assertEquals(TimeRangeDetail.toTime(end.getTime()), range.getEnd());
    }
    
    /**
     * 
     * @throws Exception
     */
    @Test
    public void testGetGetDays() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        TimeRangeDetail range = TimeUtils.getDays(format.parse("20140910"),  5, 5);
        Assert.assertEquals("20140905", range.getStart());
        Assert.assertEquals("20140915", range.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetCurrentDayWeekDays() {
        TimeRangeDetail weekDays = TimeUtils.getWeekDays(null);
        Date currentDay = TimeUtils.getCurrentDay();
        Date firstDay = TimeUtils.getMondayOfThisWeek(currentDay);
        Date lastDay = TimeUtils.getSundayOfThisWeek(currentDay);
        Assert.assertEquals(TimeRangeDetail.toTime(firstDay), weekDays.getStart());
        Assert.assertEquals(TimeRangeDetail.toTime(lastDay), weekDays.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetDayWeekDays() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140101");
        TimeRangeDetail weekDays = TimeUtils.getWeekDays(date);
        Assert.assertEquals("20131230", weekDays.getStart());
        Assert.assertEquals("20140105", weekDays.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetDayWeekDaysWithBegoreMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140101");
        TimeRangeDetail weekDays = TimeUtils.getWeekDays(date, 2, 0);
        Assert.assertEquals("20131216", weekDays.getStart());
        Assert.assertEquals("20140105", weekDays.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetDayWeekDaysWithAfterMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140101");
        TimeRangeDetail weekDays = TimeUtils.getWeekDays(date, 2, 2);
        Assert.assertEquals("20131216", weekDays.getStart());
        Assert.assertEquals("20140119", weekDays.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetMonthDayWithNull() {
        TimeRangeDetail monthDay = TimeUtils.getMonthDays(null);
        Date currentDay = TimeUtils.getCurrentDay();
        String firstDay = TimeUtils.getFirstDayOfMonth(currentDay);
        String endDay = TimeUtils.getLastDayOfMonth(currentDay);
        Assert.assertEquals(firstDay, monthDay.getStart());
        Assert.assertEquals(endDay, monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetMonthDayWithDay() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getMonthDays(date);
        Assert.assertEquals("20140101", monthDay.getStart());
        Assert.assertEquals("20140131", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetMonthDayWithBeforeMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getMonthDays(date, 1, 0);
        Assert.assertEquals("20131201", monthDay.getStart());
        Assert.assertEquals("20140131", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetMonthDayAfterMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getMonthDays(date, 1, 1);
        Assert.assertEquals("20131201", monthDay.getStart());
        Assert.assertEquals("20140228", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetYearDaysWithNull() {
        TimeRangeDetail yearDay = TimeUtils.getYearDays(null);
        Date currentDay = TimeUtils.getCurrentDay();
        String firstDay = TimeUtils.getFirstDayOfYear(currentDay);
        String endDay = TimeUtils.getLastDayOfYear(currentDay);
        Assert.assertEquals(firstDay, yearDay.getStart());
        Assert.assertEquals(endDay, yearDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetYearDayWithDay() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getYearDays(date);
        Assert.assertEquals("20140101", monthDay.getStart());
        Assert.assertEquals("20141231", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetYearDayWithBeforeMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getYearDays(date, 1, 0);
        Assert.assertEquals("20130101", monthDay.getStart());
        Assert.assertEquals("20141231", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetYearDayAfterMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getYearDays(date, 1, 1);
        Assert.assertEquals("20130101", monthDay.getStart());
        Assert.assertEquals("20151231", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetQuareDaysWithNull() {
        TimeRangeDetail quareterDay = TimeUtils.getQuarterDays(null);
        Date currentDay = TimeUtils.getCurrentDay();
        String firstDay = TimeUtils.getFirstDayOfQuarter(currentDay);
        String endDay = TimeUtils.getLastDayOfQuarter(currentDay);
        Assert.assertEquals(firstDay, quareterDay.getStart());
        Assert.assertEquals(endDay, quareterDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetQuarterDayWithDay() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail quearterDay = TimeUtils.getQuarterDays(date);
        Assert.assertEquals("20140101", quearterDay.getStart());
        Assert.assertEquals("20140331", quearterDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetQuearterDayWithBeforeMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getQuarterDays(date, 1, 0);
        Assert.assertEquals("20131001", monthDay.getStart());
        Assert.assertEquals("20140331", monthDay.getEnd());
    }
    
    /**
     * 
     */
    @Test
    public void testGetQuarterDayAfterMoreThanZero() throws Exception {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(TimeRangeDetail.FORMAT_STRING);
        Date date = format.parse("20140106");
        TimeRangeDetail monthDay = TimeUtils.getQuarterDays(date, 1, 1);
        Assert.assertEquals("20131001", monthDay.getStart());
        Assert.assertEquals("20140630", monthDay.getEnd());
    }
}
