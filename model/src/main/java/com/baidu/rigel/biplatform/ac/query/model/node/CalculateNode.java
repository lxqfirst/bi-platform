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
package com.baidu.rigel.biplatform.ac.query.model.node;

import java.math.BigDecimal;
import java.util.List;

import org.apache.commons.lang.NotImplementedException;

/**
 * 需要进行计算的节点
 * 
 * @author xiaoming.chen
 *
 */
public class CalculateNode implements Node {

    /**
     * serialVersionUID
     */
    private static final long serialVersionUID = 5875038668013750461L;

    /**
     * nodes 计算的节点信息
     */
    private List<Node> nodes;

    /**
     * operation 计算方式
     */
    private CalculateOperation operation;

    @Override
    public BigDecimal getResult() {
        throw new NotImplementedException("not implement yet.");
    }

    /**
     * 计算的方式
     * @author xiaoming.chen
     *
     */
    public enum CalculateOperation {
        Add('+'), Subtract('-'), Multiply('*'), Divide('/');

        /**
         * symbol 计算符号
         */
        private char symbol;

        private CalculateOperation(char symbol) {
            this.symbol = symbol;
        }

        /**
         * get symbol
         * 
         * @return the symbol
         */
        public char getSymbol() {
            return symbol;
        }
    }

    /**
     * get nodes
     * 
     * @return the nodes
     */
    public List<Node> getNodes() {
        return nodes;
    }

    /**
     * set nodes with nodes
     * 
     * @param nodes the nodes to set
     */
    public void setNodes(List<Node> nodes) {
        this.nodes = nodes;
    }

    /**
     * get operation
     * 
     * @return the operation
     */
    public CalculateOperation getOperation() {
        return operation;
    }

    /**
     * set operation with operation
     * 
     * @param operation the operation to set
     */
    public void setOperation(CalculateOperation operation) {
        this.operation = operation;
    }

}
