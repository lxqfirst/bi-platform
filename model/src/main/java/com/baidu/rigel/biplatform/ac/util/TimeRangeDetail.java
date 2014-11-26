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
package com.baidu.rigel.biplatform.ac.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import org.apache.commons.lang.StringUtils;

import com.google.common.collect.Lists;

/**
 * 时间范围：比如2014年9月8日到2014年9月14日是一周，那TimeRange将记录start日期为20140908，end时间为20140914
 * 时间范围表示闭区间，为计算与表示方便，起至时间均用字符串表示，对于任何时间粒度的时间值，均表示为一个闭区间，如果表示当前
 * 起至时间一致
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class TimeRangeDetail {
    
    /**
     * 默认时间字符串格式
     */
    public static final String FORMAT_STRING = "yyyyMMdd";
    
    /**
     * 开始时间
     */
    private final String start;
    
    /**
     * 中指时间
     */
    private final String end;

    /**
     * 构造函数
     * @param start
     * @param end
     * TimeRange
     */
    public TimeRangeDetail(String start, String end) {
        super();
        this.start = start;
        this.end = end;
    }

    /**
     * @return the start
     */
    public String getStart() {
        return start;
    }

    /**
     * @return the end
     */
    public String getEnd() {
        return end;
    }

    /**
     * 将起至时间转换成日期类型
     * @return 已经转换的开始时间
     * @throws Exception 格式或者字符串内容正确
     */
    public Date getStartTime() throws Exception {
        return getTime(start);
    }
    
    /**
     * 将结束时间转换成日期类型
     * @return 已经转换的时间
     * @throws Exception 格式或者字符串内容正确
     */
    public Date getEndTime() throws Exception {
        return getTime(end);
    }
    
    /**
     * 将给定字符串转换成时间类型
     * @param timeStr 时间字符串，要求yyyyMMdd格式
     * @return 转换成时间类型字符串
     * @throws Exception 格式或者字符串内容正确
     */
    public static Date getTime(String timeStr) throws Exception {
        SimpleDateFormat format = initDateFormat();
        return format.parse(timeStr);
    }
    
    /**
     * 将时间转换为字符串时间
     * @param date 日期
     * @return 日期为空，返回当前日期，否则返回指定日期字符串
     */
    public static String toTime(Date date) {
        if (date == null) {
            date = new GregorianCalendar().getTime();
        }
        SimpleDateFormat format = initDateFormat();
        return format.format(date);
    }
    
    /**
     * 获取当前时间范围内的所有天成员
     * @return 
     */
    public String[] getDays() {
        if (StringUtils.isBlank(this.start)) {
            throw new IllegalArgumentException("start can not be null for timerange");
        }
        if (StringUtils.isBlank(this.end)) {
            throw new IllegalArgumentException("end can not be null for timerange");
        }
        int beginYear = Integer.valueOf(this.start.substring(0, 4));
        int beginMonth = Integer.valueOf(
                StringUtils.isEmpty(start.substring(4, 6)) ? "1" : this.start.substring(4, 6));
        int beginDay = Integer.valueOf(
                StringUtils.isEmpty(start.substring(6)) ? "1" : this.start.substring(6));
        
        int endYear = Integer.valueOf(this.end.substring(0, 4));
        int endMonth = Integer.valueOf(
                StringUtils.isEmpty(end.substring(4, 6)) ? "1" : this.end.substring(4, 6));
        int endDay = Integer.valueOf(
                StringUtils.isEmpty(end.substring(6)) ? "1" : this.end.substring(6));
        
        if (beginYear > endYear) {
            throw new IllegalArgumentException("beginYear must less than end year, "
                    + "but : begin = " + beginYear + " end = " + endYear);
        }
        if (this.start.equals(this.end)) {
            return new String[]{this.start};
        }
        
        List<String> days = Lists.newArrayList();
        if (endYear - beginYear >= 1) {
            String[] allDays = getDaysMoreThanOneYear(beginYear, beginMonth, 
                    beginDay, endYear, endMonth, endDay);
            Collections.addAll(days, allDays); 
        } else {
            // beginYear与endYear没有跨年 比如20110303到20130506
            // 先求当前月和结尾月的天，再求整月的天
            // 跨月
            if (endMonth - beginMonth >= 1) {
                Collections.addAll(days, getDayOfMonth(beginYear, beginMonth, beginDay));
                for (int begin = endMonth - beginMonth - 1; begin > 0; --begin) {
                    Collections.addAll(days, getDayOfMonth(beginYear, begin + beginMonth));
                }
                int startDay = 1;
                Collections.addAll(days, getDayOfMonth(endYear, endMonth, startDay, endDay));
            } else {
                Collections.addAll(days, getDayOfMonth(beginYear, beginMonth, beginDay, endDay));
            }
        }
        return days.toArray(new String[0]);
    }

    /**
     * 
     * @param beginYear
     * @param beginMonth
     * @param beginDay
     * @param endYear
     * @param endMonth
     * @param endDay
     * 
     * 
     */
    private String[] getDaysMoreThanOneYear(int beginYear, int beginMonth, int beginDay, int endYear,
        int endMonth, int endDay) {
        List<String> days = Lists.newArrayList();
        // 先求起至时间到当年年底的时间成员，再求终止时间到年初的成员，最后求整年的成员
        Collections.addAll(days, getDaysFromDayToEndOfYear(beginYear, beginMonth, beginDay));
        Collections.addAll(days, getDaysToDayFromBeginOfYear(endYear, endMonth, endDay));
        for (int begin = endYear - beginYear - 1; begin > 0; --begin) {
            Collections.addAll(days, genDaysOfYear(beginYear + begin));
        }
        if (beginYear - endYear >= 2) {
            // beginYear与endYear中包含整年，先计算整年的时间，比如20110203到20130506中包含整年2012
            for (int begin = endYear - beginYear - 1; begin > 0; --begin) {
                Collections.addAll(days, genDaysOfYear(beginYear + begin));
            }
        }
        return days.toArray(new String[0]);
    }
    
    /**
     * 获取年初到指定时间的日期成员
     * @param endYear
     * @param endMonth
     * @param endDay
     * @return
     */
    private String[] getDaysToDayFromBeginOfYear(int endYear, int endMonth, int endDay) {
        List<String> days = Lists.newArrayList();
        // modify by jiangyichao at 2014-11-12 获取截止月到截止日期
        Collections.addAll(days, getDayOfMonth(endYear, endMonth, 1, endDay));
        for (int begin = endMonth - 1; begin >= 1; --begin) {
            Collections.addAll(days, getDayOfMonth(endYear, begin));
        }
        return days.toArray(new String[0]);
    }

    /**
     * 获取从指定年份、月份、天起，到当前年底所有的时间成员
     * @param beginYear
     * @param beginMonth
     * @param beginDay
     * @return 
     */
    private String[] getDaysFromDayToEndOfYear(int beginYear, int beginMonth, int beginDay) {
        List<String> days = Lists.newArrayList();
        Collections.addAll(days, getDayOfMonth(beginYear, beginMonth, beginDay));
        for (int begin = beginMonth + 1; begin <= 11; ++begin) {
            Collections.addAll(days, getDayOfMonth(beginYear, begin));
        }
        return days.toArray(new String[0]);
    }

    /**
     * 获取指定月份指定日期之间的时间成员
     * @param year
     * @param month
     * @param beginDay
     * @param endDay
     * @return
     */
    private String[] getDayOfMonth(int year, int month, int beginDay, int endDay) {
        List<String> days = Lists.newArrayList();
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, year);
        cal.set(Calendar.MONTH, month - 1);
        SimpleDateFormat format = initDateFormat();
        for (int j = beginDay; j <= endDay; ++j) {
            cal.set(Calendar.DAY_OF_MONTH, j);
            days.add(format.format(cal.getTime()));
        }
        return days.toArray(new String[0]);
    }
    
    /**
     * 获取指定月份的时间成员信息
     * @param year
     * @param month
     * @return
     */
    private String[] getDayOfMonth (int year, int month) {
        return getDayOfMonth(year, month, 1);
    }

    /**
     * 获取指定月份指定天到月底的时间成员
     * @param year
     * @param month
     * @param day
     * @return
     */
    private String[] getDayOfMonth(int year, int month, int day) {
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, year);
        cal.set(Calendar.MONTH, month - 1);
        int maxDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
        return this.getDayOfMonth(year, month, day, maxDay);
    }

    /**
     * 
     * @return
     * 
     */
    private static SimpleDateFormat initDateFormat() {
        SimpleDateFormat format = new SimpleDateFormat();
        format.applyPattern(FORMAT_STRING);
        return format;
    }

    /**
     * 
     */
    private static String[] genDaysOfYear(int year) {
        List<String> days = Lists.newArrayList();
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.YEAR, year);
        SimpleDateFormat format = initDateFormat();
        for (int i = 0; i < 12; ++i ) {
            cal.set(Calendar.MONTH, i);
            int maxDay = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
            for (int j = 1; j <= maxDay; ++j) {
                cal.set(Calendar.DAY_OF_MONTH, j);
                days.add(format.format(cal.getTime()));
            }
        }
        return days.toArray(new String[0]);
    }
}
