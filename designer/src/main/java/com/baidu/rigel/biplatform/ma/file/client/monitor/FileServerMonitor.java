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
package com.baidu.rigel.biplatform.ma.file.client.monitor;

import io.netty.bootstrap.Bootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelHandlerAdapter;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioSocketChannel;
import io.netty.handler.codec.serialization.ClassResolvers;
import io.netty.handler.codec.serialization.ObjectDecoder;
import io.netty.handler.codec.serialization.ObjectEncoder;
import io.netty.util.concurrent.ScheduledFuture;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * 文件服务器监控器类，要求在启动配置端服务时启动该监控服务 监控文件服务器状态，如果状态异常，及时报警
 * 如果由于文件服务器宕机导致不能正常连接文件服务器，当文件服务器回复工作后，需要重新尝试连接并检测
 *
 * @author david.wang
 * @version 1.0.0.1
 */
public class FileServerMonitor extends ChannelHandlerAdapter {
    
    /**
     * 心跳消息channel
     */
    private volatile ScheduledFuture<?> heartBeat;
    
    /**
     * 日志记录器
     */
    private Logger logger = LoggerFactory.getLogger(FileServerMonitor.class);
    
    /**
     * 文件服务器ip地址
     */
    private String host;
    
    /**
     * 文件服务器端口号
     */
    private int port;
    
    /**
     * 重连server工作线程
     */
    private ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
    
    /**
     * 构造函数
     */
    private FileServerMonitor() {
    }
    
    /**
     * 开启监控
     */
    public void start() throws Exception {
        EventLoopGroup work = new NioEventLoopGroup();
        Bootstrap strap = new Bootstrap();
        try {
            strap.group(work).option(ChannelOption.TCP_NODELAY, true)
                .channel(NioSocketChannel.class)
                .handler(new ChannelInitializer<NioSocketChannel>() {
                    
                    @Override
                    protected void initChannel(NioSocketChannel chl) throws Exception {
                        // 对象序列化解码器
                        chl.pipeline().addLast(
                            new ObjectDecoder(1024, ClassResolvers
                                .cacheDisabled(FileServerMonitor.class.getClassLoader())));
                        chl.pipeline().addLast(new ObjectEncoder());
                        chl.pipeline().addLast(new FileServerMonitor());
                    }
                    
                });
            
            ChannelFuture future = strap.connect(new InetSocketAddress(host, port));
            future.channel().closeFuture().sync();
        } finally {
            executor.execute(new Runnable() {
                
                @Override
                public void run() {
                    try {
                        TimeUnit.SECONDS.sleep(3);
                        ChannelFuture future = strap.connect("localhost", 9090).sync();
                        future.channel().closeFuture().sync();
                    } catch (InterruptedException e) {
                        logger.error(e.getMessage(), e);
                    }
                }
                
            });
        }
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        // 需要重新定义心跳信息
        ctx.writeAndFlush("handshake");
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public void channelRead(ChannelHandlerContext ctx, Object msg) throws Exception {
        logger.info("receive message from server --> " + msg);
        if ("handshake".equals(msg)) {
            heartBeat = ctx.executor().scheduleAtFixedRate(new HeartBeatTask(ctx), 0, 1,
                TimeUnit.SECONDS);
        } else if ("pang".equals(msg)) {
            logger.info("Client receive server heart beat message : -->" + msg);
        } else {
            ctx.fireChannelRead(msg);
        }
    }
    
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        ctx.close();
    }
    
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        if (heartBeat != null) {
            heartBeat.cancel(true);
            heartBeat = null;
        }
        logger.error(cause.getMessage());
        ctx.fireExceptionCaught(cause);
    }
    
    /**
     * 
     * 心跳信息工作线程
     * 
     * @author david.wang
     * @version 1.0.0.1
     */
    private class HeartBeatTask implements Runnable {
        
        /**
         * ChannelHandlerContext
         */
        private final ChannelHandlerContext ctx;
        
        /**
         * 构造函数
         * 
         * @param ctx
         */
        public HeartBeatTask(ChannelHandlerContext ctx) {
            this.ctx = ctx;
        }
        
        /**
         * {@inheritDoc}
         */
        @Override
        public void run() {
            String msg = "ping";
            logger.info("Client send heart beat message to server : ---> " + msg);
            ctx.writeAndFlush(msg);
        }
        
    }
}
