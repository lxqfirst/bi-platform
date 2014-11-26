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
package com.baidu.rigel.biplatform.ma.auth.resource;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.baidu.rigel.biplatform.ac.util.AesUtil;
import com.baidu.rigel.biplatform.ma.auth.bo.ProductlineInfo;
import com.baidu.rigel.biplatform.ma.auth.service.ProductLineManageService;
import com.baidu.rigel.biplatform.ma.auth.service.ProductLineRegisterService;
import com.baidu.rigel.biplatform.ma.resource.BaseResource;
import com.baidu.rigel.biplatform.ma.resource.ResponseResult;

/**
 * 产品线注册
 * @author jiangyichao
 *
 */
@RestController
@RequestMapping("/silkroad/register")
public class RegisterController extends BaseResource {
    /**
     * 日志对象
     */
    private static final Logger LOG = Logger.getLogger(RegisterController.class);
    
    /**
     * 用户服务对象
     */
    @Resource
    ProductLineManageService userManageService;
    
    /**
     * 产品线注册服务对象
     */
    @Resource
    ProductLineRegisterService productLineRegisterService;
    
    /**
     * 注册处理
     * @param request http请求
     * @param response http响应
     * @return 处理结果
     */
    @RequestMapping(method = { RequestMethod.POST })
    @ResponseBody
    public ResponseResult register(HttpServletRequest request, HttpServletResponse response) {        
        ResponseResult rs = new ResponseResult();
        try {
            // 服务器请求地址
            String hostAddress = request.getRequestURL().toString();
            ProductlineInfo user = this.getUserFromUrl(request, true);
            // 校验用户名是否已经存在
            if (userManageService.existsUser(user.getName())) {
                throw new Exception("the name " + user.getName() 
                        + " is already exist, please change");
            }
            // 向管理员发送注册信息，返回0代表发送成功，返回-1代表发送失败
            int status = productLineRegisterService
                    .sendRegisterMsgToAdministrator(user, hostAddress);
            if (status == -1) {
                throw new Exception("send register message to "
                        + "Administrator happens exception");
            }
            LOG.info("send [" + user.getName() + "]'s register"
                    + " messgage to Administrator successfully");
            // 返回处理结果
            rs.setStatus(0);
            rs.setStatusInfo("successfully");
        } catch (Exception e) {
            LOG.debug(e.getMessage(), e);
            // 返回异常信息
            rs.setStatus(1);
            rs.setStatusInfo(e.getMessage());
        }
        return rs;
    }
    
    /**
     * 开通线上服务产品线
     * @param request
     * @param response
     */
    @RequestMapping(value = "/onlineService", method = { RequestMethod.GET })
    @ResponseBody
    public ResponseResult openOnlineService(HttpServletRequest request, HttpServletResponse response) {
        ResponseResult rs = new ResponseResult();
        try {
            // 获取用户信息        
            ProductlineInfo user = this.getUserFromUrl(request, false);
            LOG.info("begin open online service for user [" + user.getName() + "]");
            // 开通线上服务
            productLineRegisterService.openOnlineService(user);
            // 发送开通服务信息给用户
            productLineRegisterService.sendOpenServiceMsgToUser(user, 1);           
            LOG.info("open online service for user [" 
                    + user.getName() + "] successfully");
            // 返回成功结果
            rs.setStatus(0);
            rs.setStatusInfo("successfully");
        } catch (Exception e) {
            LOG.debug(e.getMessage(), e);
            // 返回异常信息
            rs.setStatus(1);
            rs.setStatusInfo(e.getMessage());
        }
        return rs;
    }
    
    /**
     * 开通线下服务产品线
     */
    @RequestMapping(value = "/offlineService", method = { RequestMethod.GET })
    @ResponseBody
    public ResponseResult openOfflineService(HttpServletRequest request, HttpServletResponse response) {
        ResponseResult rs = new ResponseResult();
        try {   
            // 获取用户信息
            ProductlineInfo user = this.getUserFromUrl(request, false);
            LOG.info("begin open offline service for user [" + user.getName() + "]");
            // 开通线下服务
            productLineRegisterService.openOfflineService(user);
            // 发送开通服务信息给用户
            productLineRegisterService.sendOpenServiceMsgToUser(user, 0);
            LOG.info("open offline service for user [" + user.getName() + "] successfully");
            // 返回成功结果
            rs.setStatus(0);
            rs.setStatusInfo("successfully");
        } catch (Exception e) {
            LOG.debug(e.getMessage(), e);
            // 返回异常信息
            rs.setStatus(1);
            rs.setStatusInfo(e.getMessage());
        }
        return rs;
    }
    
    /**
     * 从requst请求中读取用户信息
     * @param request http请求
     * @param needEncryptPwd 用户密码是否需要加密
     * @return
     * @throws Exception
     */
    private ProductlineInfo getUserFromUrl(HttpServletRequest request, boolean needEncryptPwd) throws Exception {
        /**
         * 获取参数，封装成User对象
         */
        ProductlineInfo user = new ProductlineInfo();
        String name = request.getParameter("name");
        String pwd = request.getParameter("pwd");
        String email = request.getParameter("email");
        String department = request.getParameter("department");
        String serviceType = request.getParameter("serviceType");
       
        if (needEncryptPwd) {
            // 对用户密码进行加密
            try {
                pwd = AesUtil.getInstance().encryptAndUrlEncoding(pwd, securityKey);
            } catch (Exception e) {
                throw new IllegalArgumentException("user's password encryt throw exception");
            }
        }
        user.setName(name);
        user.setPwd(pwd);
        user.setEmail(email);
        user.setDepartment(department);
        
        // 转换服务类型
        try {
            user.setServiceType(Integer.valueOf(serviceType));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("service type is wrong , "
                    + "it's value must be 0 ro 1");
        }
        return user;
    }
}
