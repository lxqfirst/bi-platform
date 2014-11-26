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
package com.baidu.rigel.biplatform.tesseract.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

/**
 * Tesseract项目启动入口
 * 
 * @author xiaoming.chen
 *
 */
@Configuration
@ComponentScan(basePackages = "com.baidu.rigel.biplatform.tesseract")
@EnableAutoConfiguration(exclude = DataSourceAutoConfiguration.class)
@ImportResource("conf/applicationContext-tesseract.xml")
public class TesseractApplication {

    /**
     * 启动Tesseract
     * 
     * @param args 启动参数
     */
    public static void main(String[] args) {

        SpringApplication.run(TesseractApplication.class);
    }
}