百度开源，业内领先的Holap敏捷BI分析平台，提供高性能、准实时、可扩展的、一站式的BI建模、分析平台。

##如何快速构建BI－Platform
构建前提：需在指定环境中安装maven 3 以上、java8

##项目模块功能描述：
* fileserver －－ 静态文件服务器 存储平台生成的静态文件
* model －－ 模型组建层 定义分析、问答模型
* designer －－ 设计器 
* tesseract －－ 执行引擎

##构建流程：
1. clone项目到本地指定目录
2. 分别在fileserver、tesseract、designer目录下执行 mvn install构建项目
3. 找到fileserver构建后的jar文件，执行java －jar 指定端口和有效文件路径，启动文件服务器， 如：
 ```
 java -jar fileserver-0.0.1-SNAPSHOT.jar 9090 /tmp/ > log/fileserver.log &
 ```

4. 找到tesseract构建后的jar文件，执行java －jar 启动执行引擎， 如：
 ```
 java -jar tesseract-0.0.1-SNAPSHOT.jar > log/ter.log & 
 ```

5. 找到designer构建后的jar文件，执行java －jar 启动建模工具, 如：
 ```
 java -jar designer-0.0.1-SNAPSHOT.jar --server.port=8999 > log/designer.log &
 ```

##开发文档：
构建中（To be soon）

##用户手册：
[官网完善前，请参考WIKI](https://github.com/Baidu-ecom/bi-platform/wiki/BI-Platform项目文档-1.1.0 "BI-Platform项目文档-1.1.0")
（内容完善中，和[Milestonev1.1.0](https://github.com/Baidu-ecom/bi-platform/milestones/BI_Platform%201.1.0 "v1.1.0")同步发布）


