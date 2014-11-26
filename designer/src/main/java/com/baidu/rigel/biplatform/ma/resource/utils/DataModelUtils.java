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
package com.baidu.rigel.biplatform.ma.resource.utils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.util.CollectionUtils;

import com.baidu.rigel.biplatform.ac.query.data.DataModel;
import com.baidu.rigel.biplatform.ac.query.data.HeadField;
import com.baidu.rigel.biplatform.ac.util.DeepcopyUtils;
import com.baidu.rigel.biplatform.ma.report.exception.PivotTableParseException;
import com.baidu.rigel.biplatform.ma.report.model.FormatModel;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.CellData;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.ColDefine;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.ColField;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.PivotTable;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.RowDefine;
import com.baidu.rigel.biplatform.ma.report.query.pivottable.RowHeadField;
import com.google.common.collect.Lists;

/**
 * 类DataModelUtils.java的实现描述：DataModel操作工具类
 * 
 * @author xiaoming.chen 2013-12-5 下午2:51:58
 */
public class DataModelUtils {
    
    /**
     * logger
     */
    private static Logger logger = Logger.getLogger(DataModelUtils.class);
    
    /**
     * memeber的uniqname
     */
    public static String EXT_INFOS_MEM_UNIQNAME = "mem_uniqname";

    /**
     *member的dim 
     */
    public static String EXT_INFOS_MEM_DIMNAME = "mem_dimname";
     
    /**
     * member的leveltype
     */
    public static String EXT_INFOS_MEM_LEVELTYPE = "mem_leveltype";
    
    /**
     * member的child信息
     */
    public static String EXT_INFOS_MEM_HASCHILD = "mem_haschild";
    
    /**
     * DIV_DIM
     */
    public static final String DIV_DIM = "_12345FORDIV_";
    
    /**
	 * POS_PREFIX
	 */
    public static final String POS_PREFIX = "[Rights]";
    
    /**
     * POS_DIV
     */
    public static final String POS_DIV = "_=_";
    
    /**
     * DIV_DIM_NODE
     */
    public static final String DIV_DIM_NODE = "  -  ";
    
    /**
     * DIV_NODE
     */
    public static final String DIV_NODE = ": ";
    
    /**
     * HTTP_CACHE_KEY_GENERATE_FACTOR_PAIR
     */
    public static final String HTTP_CACHE_KEY_GENERATE_FACTOR_PAIR = "*_^";
    
    /**
     * PARAM_VALUES_SPLIT
     */
    public static final String PARAM_VALUES_SPLIT = "^_^";
    
    /**
     * REPORT_IMAGE_POSTFIX
     */
    public static final String REPORT_IMAGE_POSTFIX = "_*_imageof_*_";
    
    /**
     * USE_IMAGE
     */
    public static final String USE_IMAGE = "useImage";
    
    /**
     * member节点是否已经展开
     */
    public static String EXT_INFOS_MEM_EXPAND = "mem_expand";
    
    /**
     * 将DataModel转换成前端展现需要的PivotTable
     * 
     * @param oriDataModel
     *            待转换的DataModel
     * @param needLimit
     *            是否需要限制输出结果
     * @param limitSize
     *            限制的大小
     * @param hideWhiteRow
     *            是否隐藏空白行
     * @return 转换后的PivotTable
     * @throws Exception
     */
    public static PivotTable transDataModel2PivotTable(DataModel oriDataModel, boolean needLimit,
        int limitSize, boolean hideWhiteRow) throws PivotTableParseException {

        PivotTable pTable = new PivotTable();
        if (oriDataModel == null) {
            return pTable;
        }
        long current = System.currentTimeMillis();
        DataModel dataModel = oriDataModel;
        if (hideWhiteRow) {
            try {
                dataModel = (DataModel) DeepcopyUtils.deepCopy(oriDataModel);
            } catch (Exception e) {
                logger.error("Fail in deepCopy datamodel. ");
                PivotTableParseException parseEx = new PivotTableParseException(e);
                throw parseEx;
            }
        }
        
        List<HeadField> colHeadFields = dataModel.getColumnHeadFields();
        List<HeadField> rowHeadFields = dataModel.getRowHeadFields();
        
        // build colField
        List<List<ColField>> colFields = new ArrayList<List<ColField>>();
        
        int colHeight = getHeightOfHeadFieldList(colHeadFields);
        pTable.setColHeadHeight(colHeight);
        // s2. trans colField
        colFields = transColHeadFields2ColFields(colHeadFields);
        // s1. calc colHeight
        // s2. trans colField
        // s3. if rowAxis's exists,fill the first col of colFields
        int rowWidth = getHeightOfHeadFieldList(rowHeadFields);
        if (rowHeadFields != null && rowHeadFields.size() != 0) {
            List<ColField> firstColFields = colFields.get(0);
            for (int i = 0; i < rowWidth; i++) {
                ColField firstColField = new ColField();
                firstColField.setRowspan(colHeight);
                firstColField.setColSpan(1);
                firstColField.setUniqName("test");
                firstColField.setV(StringUtils.EMPTY);
                firstColFields.add(0, firstColField);
            }
        }
        pTable.setColFields(colFields);
        
        // build colDefine
        List<ColDefine> colDefineList = new ArrayList<ColDefine>(); // 长度即列数即宽度
        // 获取叶子节点
        List<HeadField> leafNodeList = getLeafNodeList(colHeadFields);
        
        for (HeadField headField : leafNodeList) {
            ColDefine colDefine = new ColDefine();
            colDefine.setUniqueName(headField.getValue());
            colDefine.setCaption(transStrList2Str(getAllCaptionofHeadField(headField), "-", true));
            colDefine.setShowUniqueName(transStrList2Str(getAllMemberDimConcatUniqname(headField),
                DIV_DIM, true));
            // membershowname,当前member的caption
            colDefine.setShowAxis(transStrList2Str(getAllCaptionofHeadField(headField),
                DIV_DIM_NODE, true));
            colDefine.setCurrentSort("NONE");
            colDefineList.add(colDefine);
            
        }
        pTable.setColDefine(colDefineList);
        
        // build rowDefine;
        // s1. calc actual size
        // s2. fill rowDefine
        List<RowDefine> rowDefineList = new ArrayList<RowDefine>();
        if (rowHeadFields == null) {
            rowHeadFields = Lists.newArrayList();
        }
        List<HeadField> rowLeafNodeList = getLeafNodeList(rowHeadFields);
        int maxRowSpan = getRowSpan(rowHeadFields);
        if (needLimit && limitSize != 0 && maxRowSpan > 1) {
            int count = 1;
            while (maxRowSpan * (count + 1) < limitSize) {
                count++;
            }
            limitSize = maxRowSpan * count;
        }
        
        // int actualSize=getLeafFileds(rowHeadFields).size();
        pTable.setActualSize(rowLeafNodeList.size());
        int count = 0;
        for (HeadField headField : rowLeafNodeList) {
            
            RowDefine rowDefine = new RowDefine();
            /**
             * TODO 删除
             */
            String lineUniqueName = headField.getNodeUniqueName();
//            lineUniqueName = lineUniqueName.replace("}.{", "}: {");
//            lineUniqueName = lineUniqueName.replace("{", "");
//            lineUniqueName = lineUniqueName.replace("}", "");
            rowDefine.setUniqueName(lineUniqueName);
            rowDefine.setShowXAxis(transStrList2Str(getAllCaptionofHeadField(headField),
                DIV_DIM_NODE, true));
            /**
             * 默认第一行是选中的
             */
            if (count == 0) {
                rowDefine.setSelected(true);
            }
            rowDefineList.add(rowDefine);
            
            // 增加展现条数限定
            count++;
            if (needLimit && count >= limitSize) {
                break;
            }
        }
        pTable.setRowDefine(rowDefineList);
        
        // build rowHeadFields;
        // s1. fill rowFields
        List<List<RowHeadField>> rowFields = new ArrayList<List<RowHeadField>>();
        
        // 增加展现条数限定
        // 按展现条数截取rowHeadFields-->limitedRowHeadFields
        // List<HeadField>
        // limitedRowHeadFields=getLimitedRowHeads(rowHeadFields,needLimit,limitSize);
        
        rowFields = transRowHeadFields2RowFields(rowHeadFields, needLimit, limitSize);
        modify(rowFields);
        pTable.setRowHeadFields(rowFields);
        pTable.setRowHeadWidth(rowWidth);
        
        // 按展现条数截取columnBaseData
        List<List<BigDecimal>> source = dataModel.getColumnBaseData();
        List<List<CellData>> cellDataSource = parseCellDatas(source);
        List<List<CellData>> columnBasedData = getColumnBasedDataCut(cellDataSource,
            needLimit, limitSize);
        
        // build cellDataSetRowBased;
        List<List<CellData>> rowBasedData = transColumnBasedData2RowBasedData(columnBasedData);
        pTable.setDataSourceRowBased(rowBasedData);
        
        // build cellDataSetColumnBased;
        pTable.setDataSourceColumnBased(columnBasedData);
        
        // build stat;
        pTable.setDataColumns(pTable.getDataSourceColumnBased().size());
        pTable.setDataRows(pTable.getDataSourceRowBased().size());
        
        logger.info("transfer datamodel 2 pivotTable cost:"
            + (System.currentTimeMillis() - current) + "ms!");
        
        // PivotTableUtils.addSummaryRowHead(pTable);
        return pTable;
    }
    
    /**
     * @param rowFields
     */
    private static void modify(List<List<RowHeadField>> rowFields) {
        /**
         * 设置默认的下钻、展开策略
         */
        if (CollectionUtils.isEmpty(rowFields)) {
            return;
        }
        
        int rowHeadWith = rowFields.get(0).size();
        for (List<RowHeadField> rowHeads : rowFields) {
            if (CollectionUtils.isEmpty(rowHeads)) {
                return;
            }
            int rowSize = rowHeads.size();
            int strategyIndex = rowHeadWith - rowSize;
            for (int i = strategyIndex; i < rowSize; i++) {
                RowHeadField rowHead = rowHeads.get(i);
                if (rowHeadWith != 1 && i == 0) {
                    /**
                     * 多个维度中的第一个维度，用链接下钻方式
                     */
                    if (rowHead.getExpand() != null && rowHead.getExpand()) {
                        /**
                         * 原来是加号的，要设置成链接下钻为true，否则为false
                         */
                        rowHead.setDrillByLink(true);
                        rowHead.setExpand(null);
                    } else {
                        rowHead.setDrillByLink(false);
                        rowHead.setExpand(null);
                    }
                } else {
                    rowHead.setDrillByLink(false);
                }
            }
        }
    }

    private static List<List<CellData>> parseCellDatas(List<List<BigDecimal>> source) {
        List<List<CellData>> cellDatas = Lists.newArrayList();
        for (List<BigDecimal> sourcePiece : source) {
            List<CellData> cellRow = Lists.newArrayList();
            for (BigDecimal data : sourcePiece) {
                cellRow.add(parseCellData(data));
            }
            cellDatas.add(cellRow);
        }
        return cellDatas;
    }
    
    private static CellData parseCellData(BigDecimal value) {
        CellData data = new CellData();
        data.setCellId("");
        data.setFormattedValue("I,III.DD");
        if (value != null) {
            data.setV(value);
        }
        return data;
    }
    
    /**
     * 转换数据
     * @param columnBasedData
     * @return
     */
    private static List<List<CellData>> transColumnBasedData2RowBasedData(
        List<List<CellData>> columnBasedData) {
        List<List<CellData>> rowBasedData = new ArrayList<List<CellData>>();
        
        for (List<CellData> currColumnData : columnBasedData) {
            for (int i = 0; i < currColumnData.size(); i++) {
                // 当前列的第i行
                List<CellData> currRowData = new ArrayList<CellData>();
                if (rowBasedData.size() >= i + 1) {
                    currRowData = rowBasedData.get(i);
                } else {
                    rowBasedData.add(currRowData);
                }
                
                currRowData.add(currColumnData.get(i));
                
            }
        }
        
        return rowBasedData;
        
    }
    
    /**
     * 
     * @param headFields
     * @return
     */
    private static boolean ifAllHeadFieldsHasSubChild(List<HeadField> headFields) {
        boolean result = false;
        for (HeadField headField : headFields) {
            if (headField != null
                && (headField.getNodeList().size() > 0 || headField.getChildren().size() > 0)) {
                result = true;
                break;
            }
        }
        return result;
    }
    
    /**
     * 
     * @param columnBasedData
     * @param needLimit
     * @param limitSize
     * @return
     */
    private static List<List<CellData>> getColumnBasedDataCut(List<List<CellData>> columnBasedData,
        boolean needLimit, int limitSize) {
        if (!needLimit) {
            return columnBasedData;
        }
        
        List<List<CellData>> result = new ArrayList<List<CellData>>();
        
        for (List<CellData> currList : columnBasedData) {
            if (currList.size() > limitSize) {
                currList = currList.subList(0, limitSize);
            }
            if (needLimit && limitSize > 0 && result.size() >= limitSize) {
                break;
            }
            result.add(currList);
            
        }
        return result;
    }
    
    /**
     * 
     * @param rowHeadFields
     * @param needLimit
     * @param limitSize
     * @return
     */
    private static List<List<RowHeadField>> transRowHeadFields2RowFields(List<HeadField> rowHeadFields,
        boolean needLimit, int limitSize) {
        List<List<RowHeadField>> rowFieldList = new ArrayList<List<RowHeadField>>();
        // int rowHeight=getHeightOfHeadFieldList(rowHeadFields);
        if (rowHeadFields == null || rowHeadFields.size() == 0) {
            return null;
        }
        // List<String> allMemUniqNameList=getAllMemUniqNameList(rowHeadFields);
        // int rowWidth=DataModelUtils.getLeafFileds(rowHeadFields).size();
        
        List<HeadField> leafFileds = DataModelUtils.getLeafNodeList(rowHeadFields);
        // hasStoredMap用于记录已经存过的rowField
        Map<String, HeadField> hasStoredMap = new HashMap<String, HeadField>();
        
        List<HeadField> ancestorFileds = null;
        for (HeadField filed : leafFileds) {
            ancestorFileds = getHeadListOutofHead(filed);
            Collections.reverse(ancestorFileds);
            List<RowHeadField> idxRowField = new ArrayList<RowHeadField>();
            for (int i = 0; i < ancestorFileds.size(); i++) {
                HeadField headField = ancestorFileds.get(i);
                if (i == 0 && hasStoredMap.get(headField.getValue()) != null) {
                    continue;
                } else {
                    hasStoredMap.put(headField.getValue(), headField);
                }
                
                RowHeadField rowField = new RowHeadField();
                // List<HeadField> tmpList=new ArrayList<HeadField>();
                // tmpList.add(headField);
                int currWidth = headField.getLeafSize();
                rowField.setIndent(getIndentOfHeadField(headField,0));
//                rowField.setColspan(1);
                rowField.setRowspan(currWidth == 0 ? 1 : currWidth);
                String lineUniqueName = headField.getNodeUniqueName();
                rowField.setUniqueNameAll(lineUniqueName);
                rowField.setUniqueName(headField.getValue());
                String caption = headField.getCaption();
                /**
                 * 把周的开始caption换成完整的caption
                 */
                rowField.setV(caption);
                /**
                 * 设置原始展开状态
                 */
                if (!headField.isHasChildren()) {
                    rowField.setExpand(null);
                } else if (!CollectionUtils.isEmpty(headField.getChildren())) {
                    rowField.setExpand(false);
                } else {
                    rowField.setExpand(true);
                }
                rowField.setDrillByLink(false);
                rowField.setDimName((String) headField.getExtInfos().get(EXT_INFOS_MEM_DIMNAME));
                rowField.setIndent(getIndentOfHeadField(headField, 0));
                rowField.setValueAll(transStrList2Str(getAllCaptionofHeadField(headField), "-", true));
                idxRowField.add(rowField);
            }
            if (needLimit && rowFieldList.size() >= limitSize) {
                break;
            }
            if (idxRowField.isEmpty()) {
                continue;
            }
            rowFieldList.add(idxRowField);
            
        }
        
        return rowFieldList;
        
    }
    
    /**
     * 给出任意一个headField的祖先链
     * 
     * @param headField
     * @return
     */
    private static List<HeadField> getHeadListOutofHead(HeadField headField) {
        List<HeadField> resultList = new ArrayList<HeadField>();
        if (headField == null) {
            return resultList;
        } else {
            resultList.add(headField);
            resultList.addAll(getHeadListOutofHead(headField.getParentLevelField()));
        }
        return resultList;
    }
    
    /**
     * 
     * @param headField
     * @param indent
     * @return
     */
    private static int getIndentOfHeadField(HeadField headField, int indent) {
        if (headField.getParent() != null) {
            return getIndentOfHeadField(headField.getParent(), indent + 1);
        } else {
            return indent;
        }
    }
    
    /**
     * 
     * @param headField
     * @return
     */
    private static List<String> getAllMemberDimConcatUniqname(HeadField headField) {
        List<String> resultList = new ArrayList<String>();
        if (headField == null) {
            return resultList;
        } else {
            Map<String, Object> extInfos = headField.getExtInfos();
            
            if (extInfos != null && extInfos.get(EXT_INFOS_MEM_UNIQNAME) != null) {
                String uniqueName = (String) headField.getExtInfos().get(EXT_INFOS_MEM_UNIQNAME);
                if (headField.getExtInfos().get(EXT_INFOS_MEM_DIMNAME) != null
                    && StringUtils.isNotBlank((String) headField.getExtInfos().get(
                        EXT_INFOS_MEM_DIMNAME))) {
                    uniqueName = headField.getExtInfos().get(EXT_INFOS_MEM_DIMNAME) + "_"
                        + uniqueName;
                }
                resultList.add(uniqueName);
            }
            
            resultList.addAll(getAllMemberDimConcatUniqname(headField.getParentLevelField()));
        }
        return resultList;
    }
    
    /**
     * 
     * @param headField
     * @return
     */
    private static List<String> getAllCaptionofHeadField(HeadField headField) {
        List<String> resultList = new ArrayList<String>();
        if (headField == null) {
            return resultList;
        } else {
            resultList.add(headField.getCaption());
            resultList.addAll(getAllCaptionofHeadField(headField.getParentLevelField()));
        }
        return resultList;
    }
    
    /**
     * 
     * @param headFields
     * @return
     */
    private static int getHeightOfHeadFieldList(List<HeadField> headFields) {
        int maxHeight = 0;
        if (headFields == null || headFields.size() == 0) {
            return 0;
        } else if (!ifAllHeadFieldsHasSubChild(headFields)) {
            return 1;
        } else {
            for (HeadField headField : headFields) {
                int currHeight = 1 + getHeightOfHeadFieldList(headField.getNodeList());
                if (currHeight > maxHeight) {
                    maxHeight = currHeight;
                }
            }
        }
        return maxHeight;
    }
    
    /**
     * 
     * @param strList
     * @param split
     * @param isRevert
     * @return
     */
    private static String transStrList2Str(List<String> strList, String split, boolean isRevert) {
        StringBuffer sb = new StringBuffer();
        if (strList == null || strList.size() == 0) {
            return sb.toString();
        }
        
        if (isRevert) {
            Collections.reverse(strList);
        }
        
        sb.append(strList.get(0));
        for (int i = 1; i < strList.size(); i++) {
            sb.append(split);
            sb.append(strList.get(i));
        }
        return sb.toString();
        
    }
    
    /**
     * 获取List<HeadField>结构下的所有叶子节点
     * 
     * @param headFields
     * @return
     */
    private static List<HeadField> getLeafNodeList(List<HeadField> headFields) {
        List<HeadField> resultList = new ArrayList<HeadField>();
        
        for (HeadField headField : headFields) {
            resultList.addAll(headField.getLeafFileds(true));
        }
        return resultList;
        
    }
    
    /**
     * 获取第一行的rowspan
     * 
     * @param rowHeadFields
     *            行上的节点
     * @return 返回第一行的rowspan
     */
    private static int getRowSpan(List<HeadField> rowHeadFields) {
        if (!CollectionUtils.isEmpty(rowHeadFields)) {
            for (HeadField filed : rowHeadFields) {
                return filed.getLeafSize();
            }
        }
        return 0;
    }
    
    /**
     * 
     * @param colHeadFields
     * @return
     */
    private static List<List<ColField>> transColHeadFields2ColFields(List<HeadField> colHeadFields) {
        List<List<ColField>> colFieldList = new ArrayList<List<ColField>>();
        int colHeight = getHeightOfHeadFieldList(colHeadFields);
        if (colHeadFields == null || colHeadFields.size() == 0) {
            return null;
        }
        Map<String, HeadField> hasStoredMap = new HashMap<String, HeadField>();
        
        for (int i = 0; i < colHeight; i++) {
            // 当前处理第i层数据
            List<ColField> idxColField = new ArrayList<ColField>();
            if (colFieldList.size() >= i + 1) {
                idxColField = colFieldList.get(i);
            } else {
                colFieldList.add(idxColField);
            }
            // 第i层节点数据
            List<HeadField> idxHeadFieldList = getIdxHeadFieldsForCol(colHeadFields, i + 1);
            for (HeadField headField : idxHeadFieldList) {
                if (hasStoredMap.get(headField.getValue()) != null) {
                    continue;
                } else {
                    hasStoredMap.put(headField.getValue(), headField);
                }
                ColField colField = new ColField();
                colField.setColSpan(headField.getLeafSize());
                colField.setUniqName(headField.getNodeUniqueName());
                colField.setV(headField.getCaption());
                if ((i + 1 < colHeight)
                    && (headField.getNodeList() == null || headField.getNodeList().size() == 0)) {
                    colField.setRowspan(colHeight - i);
                } else {
                    colField.setRowspan(1);
                }
                idxColField.add(colField);
            }
            // colFieldList.add(idxColField);
            
        }
        
        return colFieldList;
        
    }
    
    /**
     * 
     * @param headFields
     * @param i
     * @return
     */
    private static List<HeadField> getIdxHeadFieldsForCol(List<HeadField> headFields, int i) {
        List<HeadField> resultList = new ArrayList<HeadField>();
        if (i == 1) {
            for (HeadField head : headFields) {
                resultList.add(head);
                resultList.addAll(head.getChildren());
            }
        } else {
            for (HeadField head : headFields) {
                List<HeadField> currList = getIdxHeadFieldsForCol(head.getNodeList(), i - 1);
                if (currList != null && currList.size() != 0) {
                    resultList.addAll(currList);
                }
                for (HeadField child : head.getChildren()) {
                    resultList.addAll(getIdxHeadFieldsForCol(child.getNodeList(), i - 1));
                }
            }
        }
        return resultList;
    }
    
    

    /**
     * @param oriDataModel
     * @param newDataModel
     * @param rowNum
     * @return
     */
    public static DataModel merageDataModel(DataModel oriDataModel, DataModel newDataModel,
            int rowNum) {
        DataModel dataModel = new DataModel();
        dataModel.setColumnBaseData(oriDataModel.getColumnBaseData());
        dataModel.setColumnHeadFields(oriDataModel.getColumnHeadFields());
        dataModel.setRowHeadFields(oriDataModel.getRowHeadFields());
        dataModel.setOperateIndex(oriDataModel.getOperateIndex());
        List<HeadField> rowHeadFields = dataModel.getRowHeadFields();
        // 设置缩进以及父子关系
        System.out.println();
        HeadField realRowHead = getRealRowHeadByRowNum(rowNum, rowHeadFields);
        if (realRowHead == null) {
            throw new IllegalStateException("can not found head field with row number " + rowNum);
        }
        realRowHead.getExtInfos().put(EXT_INFOS_MEM_EXPAND, false);
        realRowHead.setChildren(newDataModel.getRowHeadFields().get(0).getChildren());
        realRowHead.getChildren().forEach(tmp -> {
            tmp.setNodeUniqueName(null);
            tmp.setParentLevelField(realRowHead.getParentLevelField());
            tmp.setParent(realRowHead);
            tmp.getNodeUniqueName();
        });
        realRowHead.setNodeList(newDataModel.getRowHeadFields().get(0).getNodeList());
        realRowHead.getNodeList().forEach(tmp -> {
            tmp.setNodeUniqueName(null);
            tmp.getNodeUniqueName();
        });
        realRowHead.setNodeUniqueName(null);
        realRowHead.getNodeUniqueName();
        List<List<BigDecimal>> rowBaseData = transData(dataModel.getColumnBaseData());
        List<List<BigDecimal>> tmp = transData(newDataModel.getColumnBaseData());
        for (int i = 1; i < tmp.size(); ++i) {
            rowBaseData.add(rowNum + i, tmp.get(i));
        }
//        rowBaseData.addAll(rowNum, transData(newDataModel.getColumnBaseData()));
        dataModel.setColumnBaseData(transData(rowBaseData));
        return dataModel;
    }

    /**
     * @param rowNum
     * @param rowHeadFields
     * @return
     */
    private static HeadField getRealRowHeadByRowNum(int rowNum, List<HeadField> rowHeadFields) {
        List<HeadField> tmp = com.baidu.rigel.biplatform.ac.util.DataModelUtils.getLeafNodeList(rowHeadFields);
        return tmp.get(rowNum);
//        for(int i = 0; i < rowHeadFields.size(); ++i) {
//            if (i == rowNum) {
//                return rowHeadFields.get(i);
//            }
//            List<HeadField> list = rowHeadFields.get(i).getChildren();
//            
//            if (list != null && !list.isEmpty()) {
//                HeadField headField = getRealRowHeadByRowNum(rowNum - i - 1, list);
//                if (headField != null) {
//                    return headField;
//                }
//            }
//        }
//        return null;
    }


    /**
     * 
     * @param datas
     * @return
     */
    private static List<List<BigDecimal>> transData(List<List<BigDecimal>> datas) {
        List<List<BigDecimal>> rs = Lists.newArrayList();
        for (int i = 0; i < datas.size(); ++i) {
            for (int j = 0; j < datas.get(i).size(); ++j) {
                if (rs.size() <= j) {
                    rs.add(Lists.newArrayList());
                }
                rs.get(j).add(datas.get(i).get(j));
            }
        }
        return rs;
    }

    /**
     * 
     * @param dataModel
     * @param rowNum
     * @return
     */
    public static DataModel removeDataFromDataModel(DataModel dataModel, int rowNum) {
        if (dataModel == null) {
            throw new IllegalArgumentException("previous result is empty");
        }
        DataModel newDataModel = DeepcopyUtils.deepCopy(dataModel);
        List<HeadField> rowHeadFields = newDataModel.getRowHeadFields();
        HeadField headField = getRealRowHeadByRowNum(rowNum, rowHeadFields);
        if (headField == null) {
            throw new IllegalStateException("can not found head field with row number " + rowNum);
        }
        int childSize = getChildSize(headField.getChildren());
        childSize = childSize + headField.getChildren().size();
        headField.setChildren(Lists.newArrayList());
        headField.getExtInfos().put(EXT_INFOS_MEM_EXPAND, true);
        rowHeadFields = replaceHeadFieldToCorrectLocation(rowHeadFields, headField);
        List<List<BigDecimal>> datas = transData(newDataModel.getColumnBaseData());
        List<List<BigDecimal>> newDatas = Lists.newArrayList();
        for (int i = 0; i < datas.size() ; ++i) {
            if (i > rowNum && i <= childSize + rowNum) {
                continue;
            }
            newDatas.add(datas.get(i));
        }
        newDataModel.setColumnBaseData(transData(newDatas));
        return newDataModel;
    }

    /**
     * 
     * @param rowHeadFields
     * @param headField
     */
    private static List<HeadField> replaceHeadFieldToCorrectLocation(List<HeadField> rowHeadFields,
            HeadField headField) {
        List<HeadField> rs = Lists.newArrayList();
        for (HeadField tmp : rowHeadFields) {
            if (tmp.getNodeUniqueName().equals(headField.getNodeUniqueName())) {
                rs.add(headField);
            } else {
                rs.add(tmp);
            }
            if (tmp.getChildren() == null || tmp.getChildren().isEmpty()) {
                tmp.setChildren(replaceHeadFieldToCorrectLocation(tmp.getChildren(), headField));
            }
        }
        return rs;
    }
    
    /**
     * 
     * @param fields
     * @return int 孩子节点个数
     */
    private static int getChildSize(List<HeadField> fields) {
        if (fields == null || fields.isEmpty()) {
            return 0;
        }
        return fields.stream().map(field -> {
            return getChildSize(field.getChildren()) + field.getChildren().size(); 
        }).reduce(0, (x, y) -> x + y);
    }

    /**
     * 
     * @param formatModel 格式模型
     * @param table 透视表
     */
	public static void decorateTable(FormatModel formatModel, PivotTable table) {
		if (formatModel == null) {
			return;
		}
		
		Map<String, String> dataFormat = formatModel.getDataFormat();
		if (CollectionUtils.isEmpty(dataFormat)) {
			return;
		}
		
		List<List<CellData>> colDatas = table.getDataSourceColumnBased();
		for (int i = 0; i < colDatas.size(); ++i) {
			ColDefine define = table.getColDefine().get(i);
			String uniqueName = define.getUniqueName();
			String formatStr = dataFormat.get("defaultFormat");
			uniqueName = uniqueName.replace("[", "").replace("]", "").replace("Measure","");
			if (!StringUtils.isEmpty(dataFormat.get(uniqueName))) {
				formatStr = dataFormat.get(uniqueName);
			}
			if (!StringUtils.isEmpty(formatStr)) {
//				DecimalFormat format = new DecimalFormat(formatStr);
				define.setFormat(formatStr);
//				for (CellData data : colDatas.get(i)) {
//					data.setFormattedValue(format.format(data.getV()));
//				}
			}
		}
	}
    
}
