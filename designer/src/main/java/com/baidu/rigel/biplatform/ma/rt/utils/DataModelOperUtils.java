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
package com.baidu.rigel.biplatform.ma.rt.utils;

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
import com.baidu.rigel.biplatform.ac.util.DataModelUtils;
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
 * 数据模型操作工具类，提供针对数据模型的元数据查询操作，比如：数据模型的行信息，列信息等
 * @author david.wang
 *
 */
public final class DataModelOperUtils {

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
     * DIV_DIM
     */
    public static final String DIV_DIM = "_12345FORDIV_";

    /**
     * DIV_DIM_NODE
     */
    public static final String DIV_DIM_NODE = "  -  ";
   
    /**
     * member节点是否已经展开
     */
    public static String EXT_INFOS_MEM_EXPAND = "mem_expand";
    
    /**
	 * 构造函数
	 */
	private DataModelOperUtils() {
	}
    
    /**
     * 
     * 将DataModel转换成前端展现需要的PivotTable
     * @param oriDataModel 待转换的DataModel
     * @param needLimit 是否需要限制输出结果
     * @param limitSize 限制的大小
     * @param hideWhiteRow 是否隐藏空白行
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
        DataModel dataModel = copyDataModel(oriDataModel, hideWhiteRow);
        List<HeadField> rowHeadFields = dataModel.getRowHeadFields();
        // build rowDefine;
        // s1. calc actual size
        // s2. fill rowDefine
        if (rowHeadFields == null) {
            rowHeadFields = Lists.newArrayList();
        }
        List<HeadField> rowLeafNodeList = getLeafNodeList(rowHeadFields);
        limitSize = changeLimitSizeValue(needLimit, limitSize, rowHeadFields);
        pTable.setActualSize(rowLeafNodeList.size());
        List<RowDefine> rowDefineList = buildRowDefines(needLimit, limitSize, rowLeafNodeList);
        pTable.setRowDefine(rowDefineList);
        // build rowHeadFields;
        // s1. fill rowFields
        List<List<RowHeadField>> rowFields = buildRowHeadFields(needLimit, limitSize, rowHeadFields);
        pTable.setRowHeadFields(rowFields);
        List<HeadField> colHeadFields = dataModel.getColumnHeadFields();
        // build colField
        int colHeight = getHeightOfHeadFieldList(colHeadFields);
        pTable.setColHeadHeight(colHeight);
        int rowWidth = getHeightOfHeadFieldList(rowHeadFields);
        List<List<ColField>> colFields = buildColFields(colHeadFields,rowHeadFields, colHeight, rowWidth);
        pTable.setColFields(colFields);
        // build colDefine
        List<ColDefine> colDefineList = buildColDefine(colHeadFields);
        pTable.setColDefine(colDefineList);
        pTable.setRowHeadWidth(rowWidth);
        fillData(needLimit, limitSize, pTable, dataModel);
        logger.info("transfer datamodel 2 pivotTable cost:" + (System.currentTimeMillis() - current) + "ms!");
        return pTable;
    }

	/**
	 * 
	 * 填充数据到透视表模型
	 * @param needLimit
	 * @param limitSize
	 * @param pTable 透视表模型
	 * @param dataModel 数据模型
	 * 
	 */
	private static void fillData(boolean needLimit, int limitSize,
			PivotTable pTable, DataModel dataModel) {
		// 按展现条数截取columnBaseData
        List<List<BigDecimal>> source = dataModel.getColumnBaseData();
        List<List<CellData>> cellDataSource = parseCellDatas(source);
        // build cellDataSetColumnBased;
        List<List<CellData>> columnBasedData = getColumnBasedDataCut(cellDataSource, needLimit, limitSize);
        pTable.setDataSourceColumnBased(columnBasedData);
        // build cellDataSetRowBased;
        List<List<CellData>> rowBasedData = transColumnBasedData2RowBasedData(columnBasedData);
        pTable.setDataSourceRowBased(rowBasedData);
        // build stat;
        pTable.setDataColumns(pTable.getDataSourceColumnBased().size());
        pTable.setDataRows(pTable.getDataSourceRowBased().size());
	}

	/**
	 * 
	 * 拷贝数据模型
	 * @param oriDataModel
	 * @param hideWhiteRow
	 * @return DataModel
	 * 
	 */
	private static DataModel copyDataModel(DataModel oriDataModel, boolean hideWhiteRow) {
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
		return dataModel;
	}

	/**
	 * @param needLimit
	 * @param limitSize
	 * @param rowHeadFields
	 * @return List<List<RowHeadField>> 
	 */
	private static List<List<RowHeadField>> buildRowHeadFields(
			boolean needLimit, int limitSize, List<HeadField> rowHeadFields) {
		List<List<RowHeadField>> rowFields = new ArrayList<List<RowHeadField>>();
        rowFields = transRowHeadFields2RowFields(rowHeadFields, needLimit, limitSize);
        modify(rowFields);
		return rowFields;
	}

	/**
	 * 构建行定义信息
	 * @param needLimit
	 * @param limitSize
	 * @param rowLeafNodeList
	 * @param count
	 * @return List<RowDefine>
	 */
	private static List<RowDefine> buildRowDefines(boolean needLimit,
			int limitSize, List<HeadField> rowLeafNodeList) {
		int count = 0;
		List<RowDefine> rowDefineList = new ArrayList<RowDefine>();
        for (HeadField headField : rowLeafNodeList) {
            
            RowDefine rowDefine = new RowDefine();
            String lineUniqueName = headField.getNodeUniqueName();
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
		return rowDefineList;
	}

	/**
	 * 构建行头字段信息
	 * @param colHeadFields 列头定义
	 * @param rowHeadFields 行头定义
	 * @param colHeight 列高
	 * @param rowWidth 行宽
	 * @return List<List<ColField>>
	 * 
	 */
	private static List<List<ColField>> buildColFields(
			List<HeadField> colHeadFields, List<HeadField> rowHeadFields,
			int colHeight, int rowWidth) {
		List<List<ColField>> colFields = new ArrayList<List<ColField>>();
        // s2. trans colField
        colFields = transColHeadFields2ColFields(colHeadFields);
        // s1. calc colHeight
        // s2. trans colField
        // s3. if rowAxis's exists,fill the first col of colFields
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
		return colFields;
	}

	/**
	 * 
	 * 依据行头定义信息确定行头大小
	 * @param needLimit 是否需要限制数据大小
	 * @param limitSize 指定限制大小
	 * @param rowHeadFields 数据模型行头定义
	 * @return int limitSize新的大小
	 * 
	 */
	private static int changeLimitSizeValue(boolean needLimit, int limitSize,
			List<HeadField> rowHeadFields) {
		int maxRowSpan = getRowSpan(rowHeadFields);
        if (needLimit && limitSize != 0 && maxRowSpan > 1) {
            int count = 1;
            while (maxRowSpan * (count + 1) < limitSize) {
                count++;
            }
            limitSize = maxRowSpan * count;
        }
		return limitSize;
	}

	/**
	 * 构建列定义信息
	 * @param colHeadFields 列头信息
	 * @return List<ColDefine> 列定义信息
	 */
	private static List<ColDefine> buildColDefine(List<HeadField> colHeadFields) {
		List<ColDefine> colDefineList = new ArrayList<ColDefine>(); // 长度即列数即宽度
        // 获取叶子节点
        List<HeadField> leafNodeList = getLeafNodeList(colHeadFields);
        for (HeadField headField : leafNodeList) {
            ColDefine colDefine = new ColDefine();
            colDefine.setUniqueName(headField.getValue());
            colDefine.setCaption(transStrList2Str(getAllCaptionofHeadField(headField), "-", true));
            colDefine.setShowUniqueName(transStrList2Str(getAllMemberDimConcatUniqname(headField), DIV_DIM, true));
            // membershowname,当前member的caption
            colDefine.setShowAxis(transStrList2Str(getAllCaptionofHeadField(headField),
                DIV_DIM_NODE, true));
            colDefine.setCurrentSort("NONE");
            colDefineList.add(colDefine);
        }
		return colDefineList;
	}
    
    /**
     * 
     * @param rowFields
     * 
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
                setRowHeadStatus(rowHeadWith, rowHeads, i);
            }
        }
    }

	/**
	 * @param rowHeadWith
	 * @param rowHeads
	 * @param index
	 */
	private static void setRowHeadStatus(int rowHeadWith, List<RowHeadField> rowHeads, int index) {
		RowHeadField rowHead = rowHeads.get(index);
		if (rowHeadWith != 1 && index == 0) {
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

    /**
     * 
     * @param source
     * @return List<List<CellData>>
     */
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
    
    /**
     * 
     * @param value
     * @return CellData
     */
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
     * @return List<List<CellData>> 
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
     * @return boolean
     */
    private static boolean ifAllHeadFieldsHasSubChild(List<HeadField> headFields) {
        boolean result = false;
        for (HeadField headField : headFields) {
            if (headField != null
                && (headField.getNodeList().size() > 0 || headField.getChildren().size() > 0)) {
                return true;
            }
        }
        return result;
    }
    
    /**
     * 
     * @param columnBasedData
     * @param needLimit
     * @param limitSize
     * @return List<List<CellData>>
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
     * @return List<List<RowHeadField>>
     */
    private static List<List<RowHeadField>> transRowHeadFields2RowFields(List<HeadField> rowHeadFields,
        boolean needLimit, int limitSize) {
        List<List<RowHeadField>> rowFieldList = new ArrayList<List<RowHeadField>>();
        if (rowHeadFields == null || rowHeadFields.size() == 0) {
            return null;
        }
        List<HeadField> leafFileds = DataModelUtils.getLeafNodeList(rowHeadFields);
        Map<String, HeadField> hasStoredMap = new HashMap<String, HeadField>();
        List<HeadField> ancestorFileds = null;
        for (HeadField filed : leafFileds) {
            ancestorFileds = getHeadListOutofHead(filed);
            Collections.reverse(ancestorFileds);
            List<RowHeadField> idxRowField = new ArrayList<RowHeadField>();
            buildRowHeadField(hasStoredMap, ancestorFileds, idxRowField);
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
	 * 
	 * @param hasStoredMap
	 * @param ancestorFileds
	 * @param idxRowField
	 * 
	 */
	private static void buildRowHeadField(Map<String, HeadField> hasStoredMap,
			List<HeadField> ancestorFileds, List<RowHeadField> idxRowField) {
		for (int i = 0; i < ancestorFileds.size(); i++) {
		    HeadField headField = ancestorFileds.get(i);
		    if (i == 0 && hasStoredMap.get(headField.getValue()) != null) {
		        continue;
		    } else {
		        hasStoredMap.put(headField.getValue(), headField);
		    }
		    RowHeadField rowField = new RowHeadField();
		    int currWidth = headField.getLeafSize();
		    rowField.setIndent(getIndentOfHeadField(headField,0));
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
	}
    
    /**
     * 
     * 给出任意一个headField的祖先链
     * @param headField
     * @return List<HeadField>
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
     * @return int
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
     * @return List<String>
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
     * @return List<String>
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
     * @param headFields
     * @return int
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
     * @return String
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
     * @return List<HeadField>
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
     * @param rowHeadFields 行上的节点
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
     * @return List<List<ColField>>
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
            buildColField(colHeight, hasStoredMap, i, idxColField, idxHeadFieldList);
        }
        
        return colFieldList;
        
    }

	/**
	 * @param colHeight
	 * @param hasStoredMap
	 * @param index
	 * @param idxColField
	 * @param idxHeadFieldList
	 */
	private static void buildColField(int colHeight,
			Map<String, HeadField> hasStoredMap, int index,
			List<ColField> idxColField, List<HeadField> idxHeadFieldList) {
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
		    if ((index + 1 < colHeight)
		        && (headField.getNodeList() == null || headField.getNodeList().size() == 0)) {
		        colField.setRowspan(colHeight - index);
		    } else {
		        colField.setRowspan(1);
		    }
		    idxColField.add(colField);
		}
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
        dataModel.setColumnBaseData(transData(rowBaseData));
        return dataModel;
    }

    /**
     * @param rowNum
     * @param rowHeadFields
     * @return HeadField
     */
    private static HeadField getRealRowHeadByRowNum(int rowNum, List<HeadField> rowHeadFields) {
        List<HeadField> tmp = DataModelUtils.getLeafNodeList(rowHeadFields);
        return tmp.get(rowNum);
    }

    /**
     * 
     * @param datas
     * @return List<List<BigDecimal>>
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
     * @return DataModel
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
     * 合并行头定义
     * @param rowHeadFields 行头字段列表
     * @param headField 行头字段定义
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
     * 获取孩子节点个数
     * @param fields 行头字段定义
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
     * 依据格式模型定义装饰数据表中数据
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
				define.setFormat(formatStr);
			}
		}
	}
	
	/**
	 * 根据指定行行头数据信息返回行数
	 * @param dataModel 数据模型
	 * @param uniqueName 行头信息，指定行定义的维度节点的uniqueName
	 * @return int 给定行头信息所在的行数
	 */
	public static int getRowNum(DataModel dataModel, String uniqueName) {
		if (dataModel == null) {
			throw new IllegalStateException("数据模型为null");
		}
		List<HeadField> headField = dataModel.getRowHeadFields();
        List<HeadField> tmp = DataModelUtils.getLeafNodeList(headField);
        for (int rowNum = 0; rowNum < tmp.size(); ++rowNum) {
            String lineUniqueName = tmp.get(rowNum).getNodeUniqueName();
            if (lineUniqueName.equals(uniqueName)) {
                return rowNum;
            }
        }
		throw new IllegalStateException("不能根据指定的行名称信息找到对应行：" + uniqueName);
	}
}
