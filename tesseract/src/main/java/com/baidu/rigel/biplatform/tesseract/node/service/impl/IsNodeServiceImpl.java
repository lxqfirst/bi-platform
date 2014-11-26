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
package com.baidu.rigel.biplatform.tesseract.node.service.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.commons.lang.SerializationUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.baidu.rigel.biplatform.ac.util.Md5Util;
import com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexShard;
import com.baidu.rigel.biplatform.tesseract.node.meta.Node;
import com.baidu.rigel.biplatform.tesseract.node.meta.NodeState;
import com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService;
import com.baidu.rigel.biplatform.tesseract.store.service.impl.AbstractMetaService;
import com.baidu.rigel.biplatform.tesseract.util.FileUtils;
import com.baidu.rigel.biplatform.tesseract.util.isservice.LogInfoConstants;

/**
 * 
 * ISNodeService的实现类，AbstractMetaService的一个子类
 * 
 * @author lijin
 *
 */
@Service("isNodeService")
public class IsNodeServiceImpl extends AbstractMetaService implements IsNodeService {
    /**
     * 节点更新状态最大间隔 即，上次更新时间距当前时间间隔大于这个值，就认为节点挂掉了
     */
    @Value("${indexServer.nodeStateUpdateMaxIntervalTime}")
    private long nodeStateUpdateMaxIntervalTime;
    
    @Resource
    private Node node;
    /**
     * LOGGER
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(IsNodeServiceImpl.class);
    
    @Override
    public Map<Node, Integer> assignFreeNode(int blockCount, String clusterName) {
        List<Node> currentNodeList = getNodeListByClusterName(clusterName);
        Map<Node, Integer> result = assignFreeNodeByNodeList(currentNodeList, blockCount,
            clusterName);
        return result;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService#
     * assignFreeNodeForReplica(int,
     * com.baidu.rigel.biplatform.tesseract.node.meta.Node)
     */
    @Override
    public List<Node> assignFreeNodeForReplica(int blockCount, Node node) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "assignFreeNodeForReplica", "[blockCount:" + blockCount + "][node:" + node + "]"));
        List<Node> currentNodeList = getNodeListByClusterName(node.getClusterName());
        sortNodeListByFreeBlockCount(currentNodeList);
        List<Node> result = new ArrayList<Node>();
        if (blockCount < 1) {
            return new ArrayList<Node>();
        }
        for (Node currNode : currentNodeList) {
            if (currNode.getNodeState().equals(NodeState.NODE_AVAILABLE)
                    && currNode.equals(currNode) && currNode.getFreeBlockNum() > 0) {
                result.add(currNode);
                if (result.size() == blockCount) {
                    break;
                }
            }
        }
        if (result.size() > 0) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END,
                "assignFreeNodeForReplica", "[blockCount:" + blockCount + "][node:" + node + "]",
                "assign node success,node count:" + result.size()));
        } else {
            // 没有合适的分片，把本机分给它
            // for (Node currNode : currentNodeList) {
            // if (currNode.equals(node)) {
            // result.add(currNode);
            // }
            // }
        }
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END,
            "assignFreeNodeForReplica", "[blockCount:" + blockCount + "][node:" + node + "]"));
        return result;
    }
    
    @Override
    public Map<Node, Integer> assignFreeNodeByNodeList(List<Node> existNodeList, int blockCount,
        String clusterName) {
        if (existNodeList == null || existNodeList.size() == 0) {
            return assignFreeNode(blockCount, clusterName);
        }
        Map<Node, Integer> result = new HashMap<Node, Integer>();
        sortNodeListByFreeBlockCount(existNodeList);
        int blockCountLeft = blockCount;
        for (int i = existNodeList.size() - 1; (i >= 0 && blockCountLeft > 0); i--) {
            if (existNodeList.get(i).getFreeBlockNum() > 0
                    && existNodeList.get(i).getNodeState().equals(NodeState.NODE_AVAILABLE)) {
                Node currNode = existNodeList.get(i);
                int currBlockCount = currNode.getFreeBlockNum() > blockCountLeft ? blockCountLeft
                    : currNode.getFreeBlockNum();
                // 记录当前索引块使用情况
                currNode.setCurrBlockUsed(currNode.getCurrBlockUsed() + currBlockCount);
                result.put(currNode, currBlockCount);
                blockCountLeft = blockCountLeft - currBlockCount;
                
            }
        }
        if (blockCountLeft > 0) {
            LOGGER.info("No more Node for another " + blockCountLeft + " blocks");
        }
        return result;
    }
    
    /**
     * 
     * 跟据空闲的数据块数对节点列表进行排序
     * 
     * @param nodeList
     *            待排序的节点列表
     */
    private void sortNodeListByFreeBlockCount(List<Node> nodeList) {
        if (nodeList == null || nodeList.size() == 0) {
            return;
        }
        nodeList.sort(new Comparator<Node>() {
            @Override
            public int compare(Node o1, Node o2) {
                
                if (o1 != null && o2 != null) {
                    if (o1.getFreeBlockNum() > o2.getFreeBlockNum()) {
                        return 1;
                    } else if (o1.getFreeBlockNum() != 0
                        && o1.getFreeBlockNum() == o2.getFreeBlockNum()) {
                        return 0;
                    } else {
                        return -1;
                    }
                } else if (o1 == null && o2 != null) {
                    return -1;
                } else if (o1 != null && o2 == null) {
                    return 1;
                }
                return 0;
            }
        });
        return;
    }
    
    @Override
    public List<Node> getNodeListByClusterName(String clusterName) {
        if (StringUtils.isEmpty(clusterName)) {
            throw new IllegalArgumentException();
        }
        String storeKey = Md5Util.encode(clusterName);
        List<Node> result = new ArrayList<Node>();
        result = super.getStoreMetaListByStoreKey(Node.getDataStoreName(), storeKey);
        if (result == null) {
            LOGGER.info("Can not find any node for Cluster:[" + clusterName + "]");
        }
        return result;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService#
     * getNodeByCurrNode(com.baidu.rigel.biplatform.tesseract.node.meta.Node)
     */
    @Override
    public Node getNodeByCurrNode(Node node) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "getNodeByCurrNode", "[node:" + node + "]"));
        if (node == null || StringUtils.isEmpty(node.getAddress()) || node.getPort() <= 0
                || StringUtils.isEmpty(node.getClusterName())) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "getNodeByIpAndPort", "[node:" + node + "]"));
            throw new IllegalArgumentException();
        }
        List<Node> nodeList = this.getNodeListByClusterName(node.getClusterName());
        Node result = null;
        if (nodeList != null) {
            for (Node currNode : nodeList) {
                if (currNode.equals(node)) {
                    result = currNode;
                    break;
                }
            }
        }
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "getNodeByIpAndPort",
            "[node:" + node + "]"));
        return result;
    }
    
    public Node getNodeByIpAndPort(Node node, String clusterName) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "getNodeByIpAndPort", "[node:" + node + "][clusterName:" + clusterName + "]"));
        if (node == null || StringUtils.isEmpty(node.getAddress()) || node.getPort() <= 0
                || StringUtils.isEmpty(clusterName)) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "getNodeByIpAndPort", "[node:" + node + "][clusterName:" + clusterName + "]"));
            throw new IllegalArgumentException();
        }
        List<Node> nodeList = this.getNodeListByClusterName(clusterName);
        Node result = null;
        if (nodeList != null) {
            for (Node currNode : nodeList) {
                if (currNode.equals(node)) {
                    result = currNode;
                    break;
                }
            }
        }
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "getNodeByIpAndPort",
            "[node:" + node + "][clusterName:" + clusterName + "]"));
        return result;
    }
    
    @Override
    public boolean saveOrUpdateNodeInfo(Node node) {
        node.setLastStateUpdateTime(System.currentTimeMillis());
        return super.saveOrUpdateMetaStore(node, Node.getDataStoreName());
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.ISNodeService#
     * getAvailableNodeListByClusterName(java.lang.String)
     */
    @Override
    public List<Node> getAvailableNodeListByClusterName(String clusterName) {
        List<Node> result = getNodeListByClusterName(clusterName);
        if (result == null) {
            LOGGER.info("Can not find any node for Cluster:[" + clusterName + "]");
        }
        Iterator<Node> it = result.iterator();
        while (it.hasNext()) {
            Node node = it.next();
            if (node.getNodeState() == null
                    || !node.getNodeState().equals(NodeState.NODE_AVAILABLE)) {
                it.remove();
            }
        }
        
        return result;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.ISNodeService#
     * getAvailableNodeListByIndexShard
     * (com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexShard)
     */
    @Override
    public List<Node> getAvailableNodeListByIndexShard(IndexShard idxShard) {
        if (idxShard == null
                || (idxShard.getNode() == null && (idxShard.getReplicaNodeList() == null || idxShard
                .getReplicaNodeList().size() == 0))) {
            throw new IllegalArgumentException();
        }
        List<Node> currNodeList = new ArrayList<Node>();
        currNodeList.add(idxShard.getNode());
        currNodeList.addAll(idxShard.getReplicaNodeList());
        
        List<Node> availableNodeList = getAvailableNodeListByClusterName(idxShard.getNode()
            .getClusterName());
        currNodeList.retainAll(availableNodeList);
        
        return currNodeList;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.ISNodeService#
     * getFreeSearchNodeByIndexShard
     * (com.baidu.rigel.biplatform.tesseract.isservice.meta.IndexShard)
     */
    @Override
    public Node getFreeSearchNodeByIndexShard(IndexShard idxShard) {
        if (idxShard == null
                || (idxShard.getNode() == null && (idxShard.getReplicaNodeList() == null || idxShard
                .getReplicaNodeList().size() == 0))) {
            throw new IllegalArgumentException();
        }
        List<Node> currNodeList = getAvailableNodeListByIndexShard(idxShard);
        int minRequestCount = 0;
        Node result = null;
        
        for (int i = 0; i < currNodeList.size(); i++) {
            Node node = currNodeList.get(i);
            if (i == 0) {
                minRequestCount = node.getSearchRequestCount();
            }
            if (node.getSearchRequestCount() <= minRequestCount) {
                minRequestCount = node.getSearchRequestCount();
                result = node;
            }
        }
        return result;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService#
     * markClusterBadNode(com.baidu.rigel.biplatform.tesseract.node.meta.Node)
     */
    @Override
    public void markClusterBadNode(Node node) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "markClusterBadNode", "[no param]"));
        if (node == null || StringUtils.isEmpty(node.getClusterName())) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "markClusterBadNode", "[no param]"));
            throw new IllegalArgumentException();
        }
        List<Node> nodeList = this.getNodeListByClusterName(node.getClusterName());
        long currTime = System.currentTimeMillis();
        if (nodeList != null) {
            for (Node currNode : nodeList) {
                if (currNode.getNodeState().equals(NodeState.NODE_AVAILABLE)
                        && ((currTime - currNode.getLastStateUpdateTime()) > this.nodeStateUpdateMaxIntervalTime)) {
                    currNode.setNodeState(NodeState.NODE_UNAVAILABLE);
                    currNode.setLastStateUpdateTime(currTime);
                    this.saveOrUpdateNodeInfo(currNode);
                }
            }
        }
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "markClusterBadNode",
            "[no param]"));
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see
     * com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService#saveNodeImage
     * (com.baidu.rigel.biplatform.tesseract.node.meta.Node)
     */
    @Override
    public void saveNodeImage(Node node) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN, "saveNodeImage",
            "[node:" + node + "]"));
        if (node == null || StringUtils.isEmpty(node.getClusterName())) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "saveNodeImage", "[node:" + node + "]"));
            throw new IllegalArgumentException();
        }
        FileUtils.write(node.getImageFilePath(), SerializationUtils.serialize(node), true);
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "saveNodeImage",
            "[node:" + node + "]"));
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService#
     * loadLocalNodeImage(com.baidu.rigel.biplatform.tesseract.node.meta.Node)
     */
    @Override
    public Node loadLocalNodeImage(Node node) {
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_BEGIN,
            "loadLocalNodeImage", "[node:" + node + "]"));
        if (node == null || StringUtils.isEmpty(node.getClusterName())) {
            LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_EXCEPTION,
                "loadLocalNodeImage", "[node:" + node + "]"));
            throw new IllegalArgumentException();
        }
        byte[] nodeInfoByteArr = FileUtils.readFile(node.getImageFilePath());
        Node localNodeInfo = null;
        if (nodeInfoByteArr != null) {
            localNodeInfo = (Node) SerializationUtils.deserialize(nodeInfoByteArr);
            // IP和端口都有可能发生变化，所以从本地镜像不读取这些
            // node.setAddress(localNodeInfo.getAddress());
            // node.setPort(localNodeInfo.getPort());
            node.setBlockSize(localNodeInfo.getBlockSize());
            node.setClusterName(localNodeInfo.getClusterName());
            node.setCurrBlockUsed(localNodeInfo.getCurrBlockUsed());
            node.setUsedIndexShardList(localNodeInfo.getUsedIndexShardList());
            
        }
        
        // 更新节点信息
        this.saveOrUpdateNodeInfo(node);
        LOGGER.info(String.format(LogInfoConstants.INFO_PATTERN_FUNCTION_END, "loadLocalNodeImage",
            "[node:" + node + "]"));
        return node;
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.baidu.rigel.biplatform.tesseract.node.service.IsNodeService#
     * getCurrentNode()
     */
    @Override
    public Node getCurrentNode() {
        return this.node;
    }
    
}
