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

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.http.Header;
import org.apache.http.HttpEntity;
import org.apache.http.HttpHeaders;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.ParseException;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.client.methods.RequestBuilder;
import org.apache.http.client.utils.HttpClientUtils;
import org.apache.http.config.Lookup;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.cookie.Cookie;
import org.apache.http.cookie.CookieOrigin;
import org.apache.http.cookie.CookieSpec;
import org.apache.http.cookie.CookieSpecProvider;
import org.apache.http.cookie.MalformedCookieException;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.cookie.BestMatchSpecFactory;
import org.apache.http.impl.cookie.BrowserCompatSpec;
import org.apache.http.impl.cookie.BrowserCompatSpecFactory;
import org.apache.http.impl.cookie.IgnoreSpecFactory;
import org.apache.http.impl.cookie.NetscapeDraftSpecFactory;
import org.apache.http.impl.cookie.RFC2109SpecFactory;
import org.apache.http.impl.cookie.RFC2965SpecFactory;
import org.apache.http.message.BasicHeader;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.protocol.HttpContext;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * httpclient 4.3 的post和get实现
 * 
 * @author xiaoming.chen
 *
 */
public class HttpRequest {

    /**
     * NO_CHECK_COOKIES
     */
    public static final String NO_CHECK_COOKIES = "NO_CHECK_COOKIES";

    /**
     * COOKIE_PARAM_NAME cookie参数的名称，参数如果是这个名称，自动放到请求的头信息中
     */
    public static final String COOKIE_PARAM_NAME = "Cookie";

    /**
     * LOGGER
     */
    private static Logger LOGGER = LoggerFactory.getLogger(HttpRequest.class);

    /**
     * 获取一个默认的HttpClient，默认的是指了默认返回结果的head为application/json
     * 
     * @return 默认的HttpClient
     */
    public static HttpClient getDefaultHttpClient() {
        Header header = new BasicHeader(HttpHeaders.CONTENT_TYPE, "application/json");
        List<Header> headers = new ArrayList<Header>(1);
        headers.add(header);
        
        CookieSpecProvider cookieSpecProvider = new CookieSpecProvider() {

            @Override
            public CookieSpec create(HttpContext context) {
                return new BrowserCompatSpec() {
                    
                    @Override
                    public void validate(Cookie cookie, CookieOrigin origin) throws MalformedCookieException{
                        //no check cookie
                    }
                };
            }
        };
        
        Lookup<CookieSpecProvider> cookieSpecRegistry = RegistryBuilder.<CookieSpecProvider>create()
                .register(CookieSpecs.BEST_MATCH, new BestMatchSpecFactory())
                .register(CookieSpecs.STANDARD, new RFC2965SpecFactory())
                .register(CookieSpecs.BROWSER_COMPATIBILITY, new BrowserCompatSpecFactory())
                .register(CookieSpecs.NETSCAPE, new NetscapeDraftSpecFactory())
                .register(CookieSpecs.IGNORE_COOKIES, new IgnoreSpecFactory())
                .register("rfc2109", new RFC2109SpecFactory())
                .register("rfc2965", new RFC2965SpecFactory())
                .register(NO_CHECK_COOKIES, cookieSpecProvider)
                .build();
        // 设置默认的cookie的安全策略为不校验
        RequestConfig requestConfigBuilder = RequestConfig.custom().setCookieSpec(NO_CHECK_COOKIES).build();
        HttpClient client = HttpClients.custom()
                .setDefaultCookieSpecRegistry(cookieSpecRegistry)
                .setDefaultRequestConfig(requestConfigBuilder)
                .setDefaultHeaders(headers).build();
        return client;
    }

    /**
     * 将url中的占位符用传过来的参数进行替换 需要预先解析好占位符信息，把参数封装好。推荐在传到工具类前处理好占位符。
     * 
     * @param url url
     * @param params 参数
     * @return 替换完成的url
     */
    private static String processPlaceHolder(String url, Map<String, String> params) {
        if (StringUtils.isBlank(url)) {
            throw new IllegalArgumentException("url is blank.");
        }
        List<String> placeHolders = PlaceHolderUtils.getPlaceHolders(url);
        if (CollectionUtils.isNotEmpty(placeHolders)) {
            String newUrl = url;
            for (String placeHolder : placeHolders) {
                String key =
                        params.containsKey(placeHolder) ? placeHolder : PlaceHolderUtils
                                .getKeyFromPlaceHolder(placeHolder);
                if (params.containsKey(key)) {
                    newUrl = PlaceHolderUtils.replacePlaceHolderWithValue(newUrl, placeHolder, params.get(key));
                }
            }
            return newUrl;
        } else {
            return url;
        }
    }

    /**
     * 向指定URL发送GET方法的请求
     * 
     * @param client httpclient对象
     * @param url 发送请求的URL
     * @param param 请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
     * @return URL 所代表远程资源的响应结果
     */
    public static String sendGet(HttpClient client, String url, Map<String, String> params) {
        if(client == null || StringUtils.isBlank(url)) {
            throw new IllegalArgumentException("client is null");
        }
        if(params == null) {
            params = new HashMap<String, String>(1);
        }
        
        String newUrl = processPlaceHolder(url, params);
        String cookie = params.remove(COOKIE_PARAM_NAME);

        List<String> paramList = checkUrlAndWrapParam(newUrl, params, true);
        String urlNameString = "";
        if (newUrl.contains("?")) {
            paramList.add(0, newUrl);
            urlNameString = StringUtils.join(paramList, "&");
        } else {
            urlNameString = newUrl + "?" + StringUtils.join(paramList, "&");
        }

        String prefix = "", suffix = "";
        String[] addresses = new String[] { urlNameString };
        if (urlNameString.contains("[") && urlNameString.contains("]")) {
            addresses = urlNameString.substring(urlNameString.indexOf("[") + 1, urlNameString.indexOf("]")).split(" ");
            prefix = urlNameString.substring(0, urlNameString.indexOf("["));
            suffix = urlNameString.substring(urlNameString.indexOf("]") + 1);
        }
        LOGGER.info("start to send get:" + urlNameString);
        long current = System.currentTimeMillis();

        for (String address : addresses) {
            String requestUrl = prefix + address + suffix;
            try {
                HttpUriRequest request = RequestBuilder.get().setUri(requestUrl).build();
                if (StringUtils.isNotBlank(cookie)) {
                    // 需要将cookie添加进去
                    request.addHeader(new BasicHeader(COOKIE_PARAM_NAME, cookie));
                }

                HttpResponse response = client.execute(request);
                String content = processHttpResponse(client, response, params, true);
                LOGGER.info("end send get :" + urlNameString + " cost:" + (System.currentTimeMillis() - current));
                return content;
            } catch (Exception e) {
                LOGGER.warn("send get error " + requestUrl + ",retry next one", e);
            }
        }
        throw new RuntimeException("send get failed[" + urlNameString + "].");
    }

    /**
     * 向指定URL发送GET方法的请求（采用默认的HttpClient）
     * 
     * @param url 发送请求的URL
     * @param param 请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
     * @return URL 所代表远程资源的响应结果
     */
    public static String sendGet(String url, Map<String, String> params) {
        return sendGet(getDefaultHttpClient(), url, params);
    }

    /**
     * 向指定URL发送POST方法的请求
     * 
     * @param client httpclient对象
     * @param url 发送请求的URL
     * @param param 请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
     * @return URL 所代表远程资源的响应结果
     */
    public static String sendPost(HttpClient client, String url, Map<String, String> params) {
        if(client == null) {
            throw new IllegalArgumentException("client is null");
        }
        
        if(params == null) {
            params = new HashMap<String, String>(1);
        }
        String requestUrl = processPlaceHolder(url, params);
        
        String cookie = params.remove(COOKIE_PARAM_NAME);
        if (requestUrl.contains("?")) {
            String[] urls = requestUrl.split("?");
            requestUrl = urls[0];
            String[] urlParams = urls[1].split("&");
            for (String param : urlParams) {
                String[] paramSplit = param.split("=");
                params.put(paramSplit[0], paramSplit[1]);
            }
        }

        List<NameValuePair> nameValues = new ArrayList<NameValuePair>();
        params.forEach((k, v) -> {
            NameValuePair nameValuePair = new BasicNameValuePair(k, v);
            nameValues.add(nameValuePair);
        });

        String prefix = "", suffix = "";
        String[] addresses = new String[] { requestUrl };
        if (requestUrl.contains("[") && requestUrl.contains("]")) {
            addresses = requestUrl.substring(requestUrl.indexOf("[") + 1, requestUrl.indexOf("]")).split(" ");
            prefix = requestUrl.substring(0, requestUrl.indexOf("["));
            suffix = requestUrl.substring(requestUrl.indexOf("]") + 1);
        }
        LOGGER.info("start to send get:" + requestUrl);
        long current = System.currentTimeMillis();
        for (String address : addresses) {
            String postUrl = prefix + address + suffix;
            try {
                HttpUriRequest request =
                        RequestBuilder.post().setUri(postUrl).setEntity(new UrlEncodedFormEntity(nameValues, "utf-8"))
                                .build();
                if (StringUtils.isNotBlank(cookie)) {
                    // 需要将cookie添加进去
                    request.addHeader(new BasicHeader(COOKIE_PARAM_NAME, cookie));
                }
                HttpResponse response = client.execute(request);
                String content = processHttpResponse(client, response, params, false);
                StringBuilder sb = new StringBuilder();
                sb.append("end send post :").append(postUrl).append(" params:").append(nameValues).append(" cost:")
                        .append(System.currentTimeMillis() - current);
                LOGGER.info(sb.toString());
                return content;
            } catch (Exception e) {
                LOGGER.warn("send post error " + requestUrl + ",retry next one", e);
            }
        }
        throw new RuntimeException("send post failed[" + requestUrl + "]. params :" + nameValues);

    }

    /**
     * 向指定URL发送POST方法的请求
     * 
     * @param url 发送请求的URL
     * @param param 请求参数，请求参数应该是 name1=value1&name2=value2 的形式。
     * @return URL 所代表远程资源的响应结果
     */
    public static String sendPost(String url, Map<String, String> params) {
        return sendPost(getDefaultHttpClient(), url, params);
    }

    /**
     * 处理HttpClient返回的结果
     * @param client HttpClient实例，为了30X状态码调用
     * @param response 返回结果
     * @param params 调用参数
     * @param isGet 是否是get方式
     * @return 返回结果
     * @throws ParseException 结果转换异常
     * @throws IOException
     */
    private static String processHttpResponse(HttpClient client, HttpResponse response, Map<String, String> params,
            boolean isGet) throws ParseException, IOException {
        try {
            StatusLine statusLine = response.getStatusLine();
            // 301 ，302 重定向支持
            if (statusLine.getStatusCode() == 301
                    || statusLine.getStatusCode() == 302) {
                Header header = response.getFirstHeader(HttpHeaders.LOCATION);
                LOGGER.info("get status code:" + statusLine.getStatusCode() + " redirect:" + header.getValue());
                if (isGet) {
                    return sendGet(client, header.getValue(), params);
                } else {
                    return sendPost(client, header.getValue(), params);
                }
            }
            if (statusLine.getStatusCode() != 200) {
                throw new IllegalStateException("Server internal error[" + statusLine.getStatusCode() + "]");
            }

            HttpEntity entity = response.getEntity();
            return EntityUtils.toString(entity, "utf-8");
        } catch (Exception e) {
            LOGGER.warn(e.getMessage(), e);
            throw e;
        } finally {
            HttpClientUtils.closeQuietly(response);
        }

    }

    /**
     * 校验URL，并且将参数抽取整合成 key=value&key=value形式
     * 
     * @param url 访问的url
     * @param params 请求参数
     * @return 返回参数拼成字符串
     */
    private static List<String> checkUrlAndWrapParam(String url, Map<String, String> params, boolean uriEncoder) {
        if (StringUtils.isBlank(url)) {
            throw new IllegalArgumentException("can not send get by null url");
        }
        List<String> paramList = new ArrayList<String>();
        if (MapUtils.isNotEmpty(params)) {
            for(Map.Entry<String, String> entry : params.entrySet()){
                if(StringUtils.isBlank(entry.getKey()) || StringUtils.isBlank(entry.getValue())){
                    continue;
                }else{
                    String value = entry.getValue();
                    if (uriEncoder) {
                        try {
                            value = URLEncoder.encode(value, "utf-8");
                        } catch (UnsupportedEncodingException e) {
                            LOGGER.warn("encode value:" + value + "error");
                            e.printStackTrace();
                        }
                    }
                    
                    paramList.add(entry.getKey() + "=" + value);
                }
            }
            
        }
        return paramList;
    }

//     public static void main(String[] args) throws Exception {
//         SqlDataSourceInfo sqlDataSourceInfo = new SqlDataSourceInfo("sqlDataSource_4_unique");
//         List<String> hosts = new ArrayList<String>();
//         hosts.add("host1:port");
//        
//         sqlDataSourceInfo.setHosts(hosts);
//         sqlDataSourceInfo.setInstanceName("instance");
//         sqlDataSourceInfo.setPassword("pass");
//         sqlDataSourceInfo.setUsername("user");
//         List<String> urls = new ArrayList<String>();
//         urls.add("jdbcurl");
//         sqlDataSourceInfo.setJdbcUrls(urls);
//         sqlDataSourceInfo.setProductLine("productline");
//         Map<String,String> params = new HashMap<String, String>();
//         params.put("dataSourceInfoStr", AnswerCoreConstant.GSON.toJson(sqlDataSourceInfo));
//         params.put("cubeXml", "cubeXML");
//         params.put("Cookie", "cookies");
//        
//         String result = sendPost("http://localhost:8080/meta/publishInfo",params);
//         System.out.println(result);
//     }

}
