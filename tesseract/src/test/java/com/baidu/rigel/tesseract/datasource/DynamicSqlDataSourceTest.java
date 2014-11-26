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
package com.baidu.rigel.tesseract.datasource;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.sql.DataSource;

import org.junit.Assert;
import org.junit.Test;

import com.baidu.rigel.biplatform.ac.query.data.DataSourceInfo;
import com.baidu.rigel.biplatform.tesseract.datasource.DynamicSqlDataSource;
import com.baidu.rigel.biplatform.tesseract.datasource.impl.SqlDataSourceWrap;
import com.baidu.rigel.tesseract.util.db.H2Util;
import com.mchange.v2.c3p0.DriverManagerDataSource;

/**
 * 动态数据源管理单测
 * 
 * @author xiaoming.chen
 *
 */
public class DynamicSqlDataSourceTest {

    /**
     * 获取DataSource的测试
     * 
     * @throws Exception 单测抛出的异常
     */
    /**
     * @throws Exception
     */
    @Test
    public void testGetDataSource() throws Exception {
        Map<String, SqlDataSourceWrap> dataSources = new HashMap<String, SqlDataSourceWrap>();
        DynamicSqlDataSource dynamicDataSource = new DynamicSqlDataSource(1000l, dataSources, "select 1");
        DataSource result = null;

        try {
            result = dynamicDataSource.getDataSource();
            Assert.fail("no check empty datasources");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        dynamicDataSource.destroy();

        DriverManagerDataSource faildDs = new DriverManagerDataSource();
        faildDs.setDriverClass(DataSourceInfo.MYSQL_DRIVERMANAGER);
        faildDs.setUser("root");
        faildDs.setPassword("password");
        faildDs.setJdbcUrl("jdbc:mysql://127.0.0.1:8801/datainsight_QA");
        dataSources.put("failedDS1", new SqlDataSourceWrap(faildDs));
        dynamicDataSource = new DynamicSqlDataSource(dataSources);

        try {
            result = dynamicDataSource.getDataSource();
            Assert.fail("no check no validate datasource");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        dataSources.put("ds1", new SqlDataSourceWrap(H2Util.getH2MemDataSource()));
        dataSources.put("ds2", new SqlDataSourceWrap(H2Util.getH2MemDataSource()));
        dynamicDataSource = new DynamicSqlDataSource(dataSources);
        result = dynamicDataSource.getDataSource();
        Assert.assertNotNull(result);

        // 关闭心跳线程池
        dynamicDataSource.destroy();

        dynamicDataSource = new DynamicSqlDataSource(dataSources);

        final DynamicSqlDataSource threadDynamicDataSource = dynamicDataSource;

        // 定义2个线程同步标记

        // 并发结束标记（表示想要有多少并发）
        final CountDownLatch countDownLatch = new CountDownLatch(5);
        // 并发同步开始标记（一定构造参数为1）
        final CountDownLatch startCountDown = new CountDownLatch(1);
        // 定义一个并发的线程池（固定大小线程池，用完记得关）
        ExecutorService executor = Executors.newFixedThreadPool(5);

        // 将并发任务添加到线程池
        for (int i = 0; i < 5; i++) {
            // 模拟5个并发同时获取DataSource（lambda表达式）
            executor.execute(() -> {
                try {
                    // 让所有的线程都等待在这里，保证所有线程同步开始执行同步测试内容
                    startCountDown.await();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                // 并发测试的内容
                DataSource ds = threadDynamicDataSource.getDataSource();
                Assert.assertNotNull(ds);

                // 表示这个任务测试完成
                countDownLatch.countDown();
            });
        }
        // 让初始标记执行，表示开始执行并发内容
        startCountDown.countDown();
        // 等待线程池中线程执行完成
        countDownLatch.await();

        final CountDownLatch startCountDownnew = new CountDownLatch(1);
        final CountDownLatch newCountDown = new CountDownLatch(5);
        threadDynamicDataSource.addDataSource("failedDs2", new SqlDataSourceWrap(faildDs));
        for (int i = 0; i < 5; i++) {
            // 模拟5个并发同时获取DataSource
            executor.execute(() -> {
                try {
                    startCountDownnew.await();
                } catch (Exception e) {
                    e.printStackTrace();
                }
                DataSource ds = threadDynamicDataSource.getDataSource();
                Assert.assertNotNull(ds);
                newCountDown.countDown();
            });
        }
        startCountDownnew.countDown();
        // 等待10s，保证获取数据源的逻辑执行完成
        newCountDown.await();

        // 关闭测试线程池
        executor.shutdown();

    }

    /**
     * 测试动态移除数据源信息
     */
    @Test
    public void testAddDataSource() {
        Map<String, SqlDataSourceWrap> dataSources = new HashMap<String, SqlDataSourceWrap>();
        DynamicSqlDataSource dynamicDataSource = new DynamicSqlDataSource(1000l, dataSources, "select 1");
        String key = null;
        SqlDataSourceWrap dataSource = null;

        try {
            dynamicDataSource.addDataSource(key, dataSource);
            Assert.fail("no check null argumengs");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        key = "ds1";
        try {
            dynamicDataSource.addDataSource(key, dataSource);
            Assert.fail("no check null argumengs");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        dataSource = new SqlDataSourceWrap(H2Util.getH2MemDataSource());
        dynamicDataSource.addDataSource(key, dataSource);
        Assert.assertNotNull(dynamicDataSource.getDataSource());
    }

    /**
     * 测试动态添加数据源信息
     */
    @Test
    public void testRemoveDataSourceByKey() {
        Map<String, SqlDataSourceWrap> dataSources = new HashMap<String, SqlDataSourceWrap>();
        DynamicSqlDataSource dynamicDataSource = new DynamicSqlDataSource(1000l, dataSources, "select 1");

        dynamicDataSource.addDataSource("ds1", new SqlDataSourceWrap(H2Util.getH2MemDataSource()));
        Assert.assertNotNull(dynamicDataSource.getDataSource());

        try {
            dynamicDataSource.removeDataSourceByKey(null);
            Assert.fail("no check null argumengs");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        DataSource result = dynamicDataSource.removeDataSourceByKey("ds1");
        Assert.assertNotNull(result);
    }

}
