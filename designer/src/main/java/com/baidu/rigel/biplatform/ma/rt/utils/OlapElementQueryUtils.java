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

import java.util.Collection;
import java.util.stream.Stream;

import com.baidu.rigel.biplatform.ac.model.Cube;
import com.baidu.rigel.biplatform.ac.model.OlapElement;

/**
 * 
 * OlapElementQueryUtils
 * @author david.wang
 * @version 1.0.0.1
 * 
 */
public class OlapElementQueryUtils {
    
    /**
     * OlapElementQueryUtils
     */
    private OlapElementQueryUtils() {
    }

    /**
     * 依据OlapElement的id查询OlapElement
     * @param cube 
     * @param id olapelement's id
     * @return OlapElement is not exist return null
     */
    public static OlapElement queryElementById(Cube cube, String id) {
    		OlapElement rs = null;
    		if (cube.getDimensions() != null) {
    			rs  = filterElement(id, cube.getDimensions().values());
    		}
    		if (rs == null && cube.getMeasures() != null) {
    			return filterElement(id, cube.getMeasures().values());
    		}
        return rs;
    }

    /**
     * 根据id过滤维度或者指标
     * @param id olapelement id
     * @param Collection<OlapElement>
     * @return OlapElement
     */
	private static OlapElement filterElement(String id, Collection<? extends OlapElement> collection) {
		if (collection == null || collection.isEmpty()) {
			return null;
		}
		Stream<? extends OlapElement> stream = collection.parallelStream().filter(dim -> {
			return dim.getId().equals(id);
		});
		if (stream.count() == 1) {
			return (OlapElement) stream.toArray()[0];
		}
		return null;
	}
    
}
