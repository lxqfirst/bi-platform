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
package com.baidu.rigel.biplatform.ma.rt.resource;

import java.util.Date;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.baidu.rigel.biplatform.ma.ds.service.DataSourceService;
import com.baidu.rigel.biplatform.ma.report.exception.CacheOperationException;
import com.baidu.rigel.biplatform.ma.report.model.ReportDesignModel;
import com.baidu.rigel.biplatform.ma.report.service.ReportDesignModelService;
import com.baidu.rigel.biplatform.ma.resource.cache.ReportModelCacheManager;

/**
 * 
 * 报表查询服务入口，接收客户端的http请求，将查询数据以json格式返回给客户端
 * @author david.wang
 *
 */
@RestController
@RequestMapping("/silkroad/reports")
public class ReportQueryResource {

	 /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(ReportQueryResource.class);
    
    /**
     * 报表缓存服务接口
     */
    @Resource
    private ReportModelCacheManager reportModelCacheManager;
    
    /**
     * 报表模型管理服务接口
     */
    @Resource(name = "reportDesignModelService")
    private ReportDesignModelService reportDesignModelService;
    
    /**
     * 数据源管理服务接口
     */
    @Resource
    private DataSourceService dsService;
    
    /**
     * 运行态报表查询服务请求入口：用户查询报表模型定义中的vm信息，用于展现报表时客户端布局
     * @param reportId 报表id
     * @param request HttpServletRequest
     * @param response HttpServletResponse
     * @return String vm字符串
     * 
     */
    @RequestMapping(value = "/{reportId}/report_vm", method = { RequestMethod.GET },
            produces = "text/html;charset=utf-8")
    public String queryVM(@PathVariable("reportId") String reportId, HttpServletRequest request,
            HttpServletResponse response) {
        ReportDesignModel model = null;
        try {
            model = reportModelCacheManager.loadReleaseReportModelToCache(reportId);
        } catch (CacheOperationException e1) {
            logger.error("Fail in loading release report model into cache. ", e1);
        }
        StringBuilder builder = genVm(model);
        response.setCharacterEncoding("utf-8");
        return builder.toString();
    }
    
    

	/**
	 * TODO 临时方案，后续需要调整，删除此处
	 * @param model
	 * @return StringBuilder
	 */
	private StringBuilder genVm(ReportDesignModel model) {
		String reportId = model.getId();
		String vm = model.getVmContent();
        String js = "<script type='text/javascript'>" + "\r\n" + "        (function(NS) {" + "\r\n"
                + "            NS.xui.XView.start(" + "\r\n"
                + "                'di.product.display.ui.LayoutPage'," + "\r\n"
                + "                {" + "\r\n" + "                    externalParam: {" + "\r\n"
                + "                    'reportId':'"
                + reportId
                + "','phase':'dev','token':'tieba'},"
                + "\r\n"
                + "                    globalType: 'PRODUCT',"
                + "\r\n"
                + "                    diAgent: '',"
                + "\r\n"
                + "                    reportId: '"
                + reportId
                + "',"
                + "\r\n"
                + "                    webRoot: '/silkroad',"
                + "\r\n"
                + "                    phase: 'dev',"
                + "\r\n"
                + "                    serverTime: ' " + new Date().getTime() + "',"
                + "\r\n"
                + "                    funcAuth: null,"
                + "\r\n"
                + "                    extraOpt: (window.__$DI__NS$__ || {}).OPTIONS"
                + "\r\n"
                + "                }"
                + "\r\n"
                + "            );"
                + "\r\n"
                + "        })(window);"
                + "\r\n" + "    </script>" + "\r\n";
        StringBuilder builder = new StringBuilder();
        builder.append("<!DOCTYPE html>");
        builder.append("<html>");
        builder.append("<head>");
        builder.append("<meta content='text/html' 'charset=UTF-8'>");
        builder.append("<link rel='stylesheet' href='/silkroad/asset/css/-di-product-min.css'/>");
        builder.append("</head>");
        builder.append("<body>");
        builder.append(vm);
        
        builder.append("<script src='/silkroad/asset/-di-product-min.js'>");
        builder.append("</script>");
        builder.append(js);
        builder.append("</body>");
        builder.append("</html>");
		return builder;
	}
    
}
