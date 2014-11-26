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
package com.baidu.rigel.biplatform.ma.report.model;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * 扩展区域定义： 扩展区域指报表中的一片数据区域。数据区域中可能是 报表、图、部件等，
 * 我们可以认为一张报表由扩展区域组成。每一扩展区域包含区域的定义信息（逻辑模型） 参数信息（参数定义）格式样式信息（格式模型）以及扩展区域类型。
 * 通常一种扩展区域类型对应一类数据模型（待验证）
 * 
 * @author david.wang
 *
 */
public class ExtendArea implements Serializable {
    
    /**
     * serialize id
     */
    private static final long serialVersionUID = -2067586365024353351L;
    
    /**
     * id
     * 
     */
    private String id;
    
    /**
     * cube id
     */
    private String cubeId;
    
    /**
     * 逻辑模型定义
     */
    private LogicModel logicModel;
    
    /**
     * 引用区域的ID
     */
    private String referenceAreaId;
    
    /**
     * 类型定义
     */
    private ExtendAreaType type = ExtendAreaType.TABLE;
    
    /**
     * TODO 扩展区域包含的部件
     */
    private Widget widget;
    
    /**
     * 数据格式定义
     */
    private FormatModel formatModel = new FormatModel();;
    
    
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public LogicModel getLogicModel() {
        return logicModel;
    }
    
    public void setLogicModel(LogicModel logicModel) {
        this.logicModel = logicModel;
    }
    
    public ExtendAreaType getType() {
        return type;
    }
    
    public void setType(ExtendAreaType type) {
        this.type = type;
    }
    
    public Widget getWidget() {
        return widget;
    }
    
    public void setWidget(Widget widget) {
        this.widget = widget;
    }
    
    public String getCubeId() {
        return cubeId;
    }
    
    public void setCubeId(String cubeId) {
        this.cubeId = cubeId;
    }
    
    /**
     * 获取所有条目定义
     * 
     * @return 所有条目定义
     */
    public Map<String, Item> getAllItems() {
        Map<String, Item> allItems = new HashMap<String, Item>();
        
        
        if (this.logicModel == null) {
            return allItems;
        }
        
        if (this.getType() == ExtendAreaType.TIME_COMP) {
            if (((TimerAreaLogicModel) getLogicModel()).getTimeDimensions() == null) {
                return allItems;
            }
            ((TimerAreaLogicModel) getLogicModel()).getTimeDimensions().keySet().forEach(item ->{
                allItems.put(item.getId(), item);
            });
            return allItems;
        }
        for (Item item : logicModel.getColumns()) {
            allItems.put(item.getOlapElementId(), item);
        }
        for (Item item : logicModel.getRows()) {
            allItems.put(item.getOlapElementId(), item);
        }
        for (Item item : logicModel.getSlices()) {
            allItems.put(item.getOlapElementId(), item);
        }
        return allItems;
    }
    
    /**
     * get the referenceAreaId
     * 
     * @return the referenceAreaId
     */
    public String getReferenceAreaId() {
        return referenceAreaId;
    }
    
    /**
     * set the referenceAreaId
     * 
     * @param referenceAreaId
     *            the referenceAreaId to set
     */
    public void setReferenceAreaId(String referenceAreaId) {
        this.referenceAreaId = referenceAreaId;
    }

    /**
     * 
     * @param itemId
     */
    public void removeItem(String olapElementId) {
        if (this.logicModel == null) {
            return;
        }
        // only one operation successful, other is duty
        logicModel.removeColumn(olapElementId);
        logicModel.removeRow(olapElementId);
        logicModel.removeSlice(olapElementId);
    }
    
    public Item getItem(String itemId) {
        return this.logicModel.getItem(itemId);
    }

	/**
	 * @return the formatModel
	 */
	public FormatModel getFormatModel() {
	    if (this.formatModel == null) {
	        this.formatModel = new FormatModel();
	    }
		return formatModel;
	}

}
