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
package com.baidu.rigel.biplatform.tesseract.isservice.netty.service;

import io.netty.channel.ChannelHandler.Sharable;
import io.netty.channel.ChannelHandlerContext;

import java.io.File;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field;
import org.apache.lucene.document.StringField;
import org.apache.lucene.index.IndexWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.baidu.rigel.biplatform.tesseract.isservice.index.service.IndexWriterFactory;
import com.baidu.rigel.biplatform.tesseract.netty.AbstractChannelInboundHandler;
import com.baidu.rigel.biplatform.tesseract.netty.message.AbstractMessage;
import com.baidu.rigel.biplatform.tesseract.netty.message.MessageHeader;
import com.baidu.rigel.biplatform.tesseract.netty.message.NettyAction;
import com.baidu.rigel.biplatform.tesseract.netty.message.isservice.IndexMessage;
import com.baidu.rigel.biplatform.tesseract.resultset.TesseractResultSet;
import com.baidu.rigel.biplatform.tesseract.util.FileUtils;
import com.baidu.rigel.biplatform.tesseract.util.isservice.LogInfoConstants;

/**
 * IndexServerHandler 处理建索引请求,并返回IndexMessage给client
 * 
 * @author lijin
 *
 */
@Sharable
public class IndexServerHandler extends AbstractChannelInboundHandler {
    /**
     * logger
     */
    private Logger logger = LoggerFactory.getLogger(IndexServerHandler.class);
    
    /**
     * ACTION_SUPPORT_SET 支持的处理请求类型
     */
    private static final Set<NettyAction> ACTION_SUPPORT_SET = new HashSet<NettyAction>();
    /**
     * 返回消息的action
     */
    private static final NettyAction ACTION_FEEDBACK = NettyAction.NETTY_ACTION_INDEX_FEEDBACK;
    
    /**
     * init ACTION_SUPPORT_SET
     */
    static {
        ACTION_SUPPORT_SET.add(NettyAction.NETTY_ACTION_INDEX);
        ACTION_SUPPORT_SET.add(NettyAction.NETTY_ACTION_UPDATE);
        ACTION_SUPPORT_SET.add(NettyAction.NETTY_ACTION_INITINDEX);
    }
    
    
    
    /**
     * Constructor by 
     */
    public IndexServerHandler() {
        super(ACTION_FEEDBACK);
    }

    /**
     * 单例
     */
    private static IndexServerHandler INDEX_SERVER_HANDLER;
    
    /**
     * 
     * getChannelHandler
     * 
     * @return IndexServerHandler
     */
    public static synchronized IndexServerHandler getChannelHandler() {
        if (INDEX_SERVER_HANDLER == null) {
            INDEX_SERVER_HANDLER = new IndexServerHandler();
        }
        return INDEX_SERVER_HANDLER;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.netty.AbstractChannelInboundHandler
     * #support(com.baidu.rigel.biplatform.tesseract.netty.message.NettyAction)
     */
    @Override
    public boolean support(NettyAction action) {
        if (ACTION_SUPPORT_SET.contains(action)) {
            logger.info("IndexServerHandler support action:" + action);
            return true;
        } else {
            return false;
        }
    }
    
    
    public void messageReceived_00(ChannelHandlerContext ctx, Object msg) throws Exception {
        logger.info(String.format(LogInfoConstants.INFO_PATTERN_MESSAGE_RECEIVED_BEGIN,
            "IndexServerHandler"));
        IndexMessage indexMsg = (IndexMessage) msg;
        // 从消息中获取索引路径
        File idxFile = new File(indexMsg.getIdxPath());
        File idxServiceFile = new File(indexMsg.getIdxServicePath());
        
        if (indexMsg.getMessageHeader().getAction().equals(NettyAction.NETTY_ACTION_UPDATE)
                || indexMsg.getMessageHeader().getAction().equals(NettyAction.NETTY_ACTION_INITINDEX)) {
            // 如果是索引更新、初始化过程
            // 清理写索引路径
            FileUtils.deleteFile(idxFile);
            if (indexMsg.getMessageHeader().getAction().equals(NettyAction.NETTY_ACTION_UPDATE)
                    && idxServiceFile.exists()) {
                // 索引更新，复制索引目录
                FileUtils.copyFolder(indexMsg.getIdxServicePath(), indexMsg.getIdxPath());
            }
        }     
        
        
        IndexWriter idxWriter = IndexWriterFactory.getIndexWriterWithSingleSlot(indexMsg.getIdxPath());
        
        TesseractResultSet data = indexMsg.getDataBody();
        long currDiskSize = FileUtils.getDiskSize(indexMsg.getIdxPath());
        BigDecimal currMaxId = null;
        // 读取数据建索引
        if (currDiskSize < indexMsg.getBlockSize()) {
            while (data.next() && currDiskSize < indexMsg.getBlockSize()) {
                Document doc = new Document();
                String[] fieldNameArr = data.getFieldNameArray();
                for (String select : fieldNameArr) {
                    if (select.equals(indexMsg.getIdName())) {
                        currMaxId = data.getBigDecimal(select);
                    }

                    doc.add(new StringField(select, data.getString(select), Field.Store.NO));
                }
                
                idxWriter.addDocument(doc);
            }
            idxWriter.commit();
            idxWriter.close();
            
        }
        
        String feedBackIndexServicePath = null;
        String feedBackIndexFilePath = null;
        
        // 如果当前分片写满了 or 是当前数据的最后一片，释放indexWriter\设置服务路径
        long totalDiskSize = FileUtils.getDiskSize(indexMsg.getIdxPath());
        if (totalDiskSize > indexMsg.getBlockSize() || indexMsg.isLastPiece()) {
            IndexWriterFactory.destoryWriters(indexMsg.getIdxPath());
            feedBackIndexServicePath = indexMsg.getIdxPath();
            feedBackIndexFilePath = indexMsg.getIdxServicePath();
        } else {
            feedBackIndexServicePath = indexMsg.getIdxServicePath();
            feedBackIndexFilePath = indexMsg.getIdxPath();
        }
        
        
        MessageHeader messageHeader = new MessageHeader(NettyAction.NETTY_ACTION_INDEX_FEEDBACK);
        
        IndexMessage indexFeedbackMsg = new IndexMessage(messageHeader, indexMsg.getDataBody());
        indexFeedbackMsg.setBlockSize(indexMsg.getBlockSize());
        indexFeedbackMsg.setDiskSize(totalDiskSize);
        indexFeedbackMsg.setIdxServicePath(feedBackIndexServicePath);
        indexFeedbackMsg.setIdxPath(feedBackIndexFilePath);
        indexFeedbackMsg.setIdName(indexMsg.getIdName());
        indexFeedbackMsg.setMaxId(currMaxId);
        ctx.writeAndFlush(indexFeedbackMsg);
        ctx.channel().close();
        logger.info(String.format(LogInfoConstants.INFO_PATTERN_MESSAGE_RECEIVED_END,
            "IndexServerHandler"));
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.netty.AbstractChannelInboundHandler
     * #messageReceived(io.netty.channel.ChannelHandlerContext,
     * java.lang.Object)
     */
    @Override
    public void messageReceived(ChannelHandlerContext ctx, Object msg) throws Exception {
        logger.info(String.format(LogInfoConstants.INFO_PATTERN_MESSAGE_RECEIVED_BEGIN,
            "IndexServerHandler"));
        IndexMessage indexMsg = (IndexMessage) msg;
        // 从消息中获取索引路径
        File idxFile = new File(indexMsg.getIdxPath());
        File idxServiceFile = new File(indexMsg.getIdxServicePath());
        
        if (indexMsg.getMessageHeader().getAction().equals(NettyAction.NETTY_ACTION_UPDATE)
                || indexMsg.getMessageHeader().getAction().equals(NettyAction.NETTY_ACTION_INITINDEX)) {
            // 如果是索引更新、初始化过程
            // 清理写索引路径
            FileUtils.deleteFile(idxFile);
            if (indexMsg.getMessageHeader().getAction().equals(NettyAction.NETTY_ACTION_UPDATE)
                    && idxServiceFile.exists()) {
                // 索引更新，复制索引目录
                FileUtils.copyFolder(indexMsg.getIdxServicePath(), indexMsg.getIdxPath());
            }
        }     
        
        
        IndexWriter idxWriter = IndexWriterFactory.getIndexWriter(indexMsg.getIdxPath());
        
        TesseractResultSet data = indexMsg.getDataBody();
        long currDiskSize = FileUtils.getDiskSize(indexMsg.getIdxPath());
        BigDecimal currMaxId = null;
        // 读取数据建索引
        if (currDiskSize < indexMsg.getBlockSize()) {
            while (data.next() && currDiskSize < indexMsg.getBlockSize()) {
                Document doc = new Document();
                String[] fieldNameArr = data.getFieldNameArray();
                for (String select : fieldNameArr) {
                    if (select.equals(indexMsg.getIdName())) {
                        currMaxId = data.getBigDecimal(select);
                    }

                    doc.add(new StringField(select, data.getString(select), Field.Store.NO));
                }
                
                idxWriter.addDocument(doc);
                
                if ((currDiskSize + idxWriter.ramBytesUsed()) > indexMsg.getBlockSize()) {
                    // 预估数据大于分片大小，则提交当前的数据
                    idxWriter.commit();
                    // 重计算实际索引目示大小
                    currDiskSize = FileUtils.getDiskSize(indexMsg.getIdxPath());
                }
            }
            idxWriter.commit();
            
        }
        
        String feedBackIndexServicePath = null;
        String feedBackIndexFilePath = null;
        // 如果当前分片写满了 or 是当前数据的最后一片，释放indexWriter\设置服务路径
        long totalDiskSize = FileUtils.getDiskSize(indexMsg.getIdxPath());
        if (totalDiskSize > indexMsg.getBlockSize() || indexMsg.isLastPiece()) {
            IndexWriterFactory.destoryWriters(indexMsg.getIdxPath());
            feedBackIndexServicePath = indexMsg.getIdxPath();
            feedBackIndexFilePath = indexMsg.getIdxServicePath();
        } else {
            feedBackIndexServicePath = indexMsg.getIdxServicePath();
            feedBackIndexFilePath = indexMsg.getIdxPath();
        }
        
        
        MessageHeader messageHeader = new MessageHeader(NettyAction.NETTY_ACTION_INDEX_FEEDBACK);
        
        IndexMessage indexFeedbackMsg = new IndexMessage(messageHeader, indexMsg.getDataBody());
        indexFeedbackMsg.setBlockSize(indexMsg.getBlockSize());
        indexFeedbackMsg.setDiskSize(totalDiskSize);
        indexFeedbackMsg.setIdxServicePath(feedBackIndexServicePath);
        indexFeedbackMsg.setIdxPath(feedBackIndexFilePath);
        indexFeedbackMsg.setIdName(indexMsg.getIdName());
        indexFeedbackMsg.setMaxId(currMaxId);
        ctx.writeAndFlush(indexFeedbackMsg);
        ctx.channel().close();
        logger.info(String.format(LogInfoConstants.INFO_PATTERN_MESSAGE_RECEIVED_END,
            "IndexServerHandler"));
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.netty.AbstractChannelInboundHandler
     * #getMessage()
     */
    @Override
    public <T extends AbstractMessage> T getMessage() {
        // Server do not need getMessage
        return null;
    }
    
}
