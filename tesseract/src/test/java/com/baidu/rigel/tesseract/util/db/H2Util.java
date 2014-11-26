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
package com.baidu.rigel.tesseract.util.db;

import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.regex.Pattern;

import javax.sql.DataSource;

import org.apache.log4j.Logger;
import org.h2.tools.RunScript;

import com.mchange.v2.c3p0.DriverManagerDataSource;

/**
 * H2内存数据库测试专用工具
 * 
 * @author xiaoming.chen
 *
 */
public class H2Util {

    /**
     * LOGGER 日志
     */
    private static Logger LOGGER = Logger.getLogger(H2Util.class);

    /**
     * 返回默认用户名和密码的h2数据源
     * 
     * @return h2数据源
     */
    public static DataSource getH2MemDataSource() {
        return getH2MemDataSource("sa", "password");
    }

    /**
     * 创建指定用户名和密码的h2内存数据库
     * 
     * @param username 用户名
     * @param password 密码
     * @return h2数据源
     */
    public static DataSource getH2MemDataSource(String username, String password) {
        if (LOGGER.isDebugEnabled()) {
            LOGGER.debug("get H2 data source.");
        }
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClass("org.h2.Driver");
        dataSource.setUser(username);
        dataSource.setPassword(password);
        dataSource.setJdbcUrl("jdbc:h2:mem:testdb;");
        LOGGER.info("get H2 datasource by username:" + username);

        return dataSource;
    }

    /**
     * 将sql文件导入到h2数据库中，SQL文件例子：/conf/H2Test.sql
     * 
     * @param conn h2数据库连接
     * @param location 文件路径，一般放在 test的 resources文件夹的conf目录下
     * @throws SQLException 抛出SQL异常
     */
    public static void initSqlFile(Connection conn, String location) throws SQLException {
        // for example:
        // RunScript.execute(conn, new
        // InputStreamReader(H2Util.class.getResourceAsStream("/conf/H2Test.sql")));
        RunScript.execute(conn, new InputStreamReader(H2Util.class.getResourceAsStream(location)));
    }

    /**
     * 清理内存数据库
     * 
     * @param conn 内存数据库连接
     */
    public static void clearMemDB(Connection conn) {
        String clearSql = "truncate testdb";
        try {
            conn.createStatement().executeUpdate(clearSql);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws SQLException {
        String pattern = "[1-9][0-9]{3}-[0-1][0-9]-([0-2][0-9]|[3][0,1])";
        System.out.println(Pattern.matches(pattern, "2014-01-33"));

        DataSource ds = getH2MemDataSource("sa", "pass");
        initSqlFile(ds.getConnection(), "/conf/H2Test.sql");

        String sql = "select id from TEST_MEM";
        ResultSet rs = ds.getConnection().createStatement().executeQuery(sql);
        while (rs.next()) {
            System.out.println(rs.getInt(1));
        }
        ds.getConnection().close();
        clearMemDB(ds.getConnection());

        rs = ds.getConnection().createStatement().executeQuery(sql);
        while (rs.next()) {
            System.out.println(rs.getInt(1));
        }
    }

}
