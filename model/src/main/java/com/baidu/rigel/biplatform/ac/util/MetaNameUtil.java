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
/**
 * 
 */
package com.baidu.rigel.biplatform.ac.util;

import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.baidu.rigel.biplatform.ac.minicube.MiniCubeDimension;
import com.baidu.rigel.biplatform.ac.model.Member;
import com.baidu.rigel.biplatform.ac.model.OlapElement;

/**
 * 元数据名称操作的工具类
 * 
 * @author xiaoming.chen
 * 
 */
public class MetaNameUtil {

    /**
     * UNIQUE_NAME_PATTERN 元数据UniqueName的模板
     */
    public static final String UNIQUE_NAME_FORMAT = "[%s]";

    /**
     * SUMMARY_MEMBER_NAME_PRE all节点的名称开头 \\[ [^\\]\\[] \\]
     */
    public static final String SUMMARY_MEMBER_NAME_PRE = "All_";

    /**
     * UNIQUE_NAME_REGEX uniqueName的正则
     */
    public static final String UNIQUE_NAME_REGEX = "^\\[[^\\]\\[]+\\](\\.\\[[^\\]\\[]+\\])*$";

    /**
     * LOGGER
     */
    private static final Logger LOGGER = LoggerFactory.getLogger(MetaNameUtil.class);

    /**
     * 构造UniqueName
     * 
     * @param parent 当前节点的父节点
     * @param name 当前节点的名称
     * @return 当前节点的UniqueName
     */
    public static String makeUniqueName(OlapElement parent, String name) {
        // 如果父节点为空或者父节点为all节点，直接跳过父节点
        if (parent == null) {
            return makeUniqueName(name);
        } else {
            if (isAllMemberName(parent.getName()) && (parent instanceof Member)) {
                Member member = (Member) parent;
                parent = member.getLevel().getDimension();
            }
            StringBuilder buf = new StringBuilder(64);
            buf.append(parent.getUniqueName());
            buf.append('.');
            buf.append(makeUniqueName(name));
            return buf.toString();
        }
    }

    /**
     * 判断一个字符串是否是符合UniqueName格式
     * 
     * @param uniqueName UniqueName字符串
     * @return 是否UniqueName
     */
    public static boolean isUniqueName(String uniqueName) {
        if (StringUtils.isNotBlank(uniqueName) && Pattern.matches(UNIQUE_NAME_REGEX, uniqueName)) {
            return true;
        }
        return false;
    }

    /**
     * 用中括号将Member的name包住
     * 
     * @param metaName member的name
     * @return 封装好的UniqueName
     */
    public static String makeUniqueName(String metaName) {
        if (StringUtils.isBlank(metaName)) {
            throw new IllegalArgumentException("metaName can not be empty");
        }

        return String.format(UNIQUE_NAME_FORMAT, metaName);
    }

    /**
     * 将一个UniqueName转换成字符串数组
     * 
     * @param uniqueName 一个UniqueName
     * @return 字符串数组
     */
    public static String[] parseUnique2NameArray(String uniqueName) {
        if (!isUniqueName(uniqueName)) {
            throw new IllegalArgumentException("uniqueName is illegal:" + uniqueName);
        }
        String preSplitUniqueName = uniqueName;
        if (preSplitUniqueName.startsWith("[")) {
            preSplitUniqueName = preSplitUniqueName.substring(1);
        }
        if (preSplitUniqueName.endsWith("]")) {
            preSplitUniqueName = preSplitUniqueName.substring(0, preSplitUniqueName.length() - 2);
        }
        // 先按照].[去截取，以后考虑更好方法
        return StringUtils.split(uniqueName, "].[");
    }

    /**
     * 判断一个UniqueName是否是一个all节点的UniqueName
     * 
     * @param uniqueName 节点的UniqueName
     * @return 是否是all节点
     * @throws IllegalArgumentException unique格式不正确
     */
    public static boolean isAllMemberUniqueName(String uniqueName) {
        if (!isUniqueName(uniqueName)) {
            LOGGER.warn("uniqueName is illegal:" + uniqueName);
            return false;
        }
        String[] names = parseUnique2NameArray(uniqueName);
        if (names.length == 2 && isAllMemberName(names[1])) {
            return true;
        }
        return false;
    }

    /**
     * 判断一个字符串是否是维度的All节点的name
     * 
     * @param name 节点的name
     * @return 是否是all节点的name
     */
    public static boolean isAllMemberName(String name) {
        if (StringUtils.startsWith(name, SUMMARY_MEMBER_NAME_PRE)) {
            return true;
        }
        return false;
    }

    /**
     * 根据UniqueName获取父节点的UniqueName
     * 
     * @param uniqueName 指定节点的UniqueName
     * @return 父节点的UniqueName，为null表示没有父节点
     * @throws IllegalArgumentException unique格式不正确
     */
    public static String getParentUniqueName(String uniqueName) {
        if (!isUniqueName(uniqueName)) {
            throw new IllegalArgumentException("uniqueName is illegal:" + uniqueName);
        }
        String[] names = parseUnique2NameArray(uniqueName);
        if (names.length == 2) {
            return makeUniqueName(names[0]) + "."
                    + makeUniqueName(String.format(MiniCubeDimension.ALL_DIMENSION_NAME_PATTERN, names[0]));
        } else if (names.length < 2) {
            return null;
        }
        return uniqueName.substring(0, uniqueName.lastIndexOf(".["));
    }
    
    /**
     * 从UniqueName中获取维度名称
     * @param uniqueName
     * @return
     */
    public static String getDimNameFromUniqueName(String uniqueName){
        String[] metaNames = parseUnique2NameArray(uniqueName);
        return metaNames[0];
    }

    // public static void main(String[] args) {
    // String unique = "[trade].[1]";
    //
    // System.out.println(Pattern.matches("^\\[[^\\]\\[]+\\](\\.\\[[^\\]\\[]+\\])*$", unique));
    // System.out.println(getParentUniqueName(unique));
    //
    // }

}
