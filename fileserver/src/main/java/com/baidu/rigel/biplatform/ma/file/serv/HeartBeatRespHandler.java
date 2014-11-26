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
package com.baidu.rigel.biplatform.ma.file.serv;

import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * 心跳检测：用于检测文件服务客户端和服务端能否正常通信
 * @author david.wang
 * @version 1.0.0.1
 */
public class HeartBeatRespHandler extends ChannelHandlerAdapter {
    
    /**
     * 日志记录器
     */
    private Logger logger = LoggerFactory.getLogger(HeartBeatRespHandler.class);
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        logger.info("Receive message form client ---->" + msg);
        if ("handshake".equals(msg)) {
            ctx.writeAndFlush("handshake");
        } else if ("ping".equals(msg)) {
            ctx.writeAndFlush("pang"); 
        } else {
            ctx.fireChannelRead(msg);
        }
    }
    
}
