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
package com.baidu.rigel.biplatform.ac.util;

import org.junit.Assert;
import org.junit.Test;

/**
 * md5 工具类单测
 * 
 * @author xiaoming.chen
 *
 */
public class Md5UtilTest {
    
    /**
     * Test method for
     * {@link com.baidu.rigel.biplatform.ac.util.Md5Util#encode(java.lang.String)}
     * .
     */
    @Test
    public void testEncodeString() {
        String expectMD5 = "36cd38f49b9afa08222c0dc9ebfe35eb";
        
        String sourceStr = null;
        String result = null;
        
        try {
            result = Md5Util.encode(sourceStr);
            Assert.fail("no check source");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        sourceStr = "source";
        result = Md5Util.encode(sourceStr);
        Assert.assertEquals(expectMD5, result);
    }
    
    /**
     * Test method for
     * {@link com.baidu.rigel.biplatform.ac.util.Md5Util#encode(java.lang.String, java.lang.Object)}
     * .
     */
    @Test
    public void testEncodeStringObject() {
        String expectMD5 = "36cd38f49b9afa08222c0dc9ebfe35eb";
        String expectMD5WithSalt = "d822d2f9e8498607f12e1b30baefb99c";
        
        String sourceStr = null;
        String result = null;
        String salt = "  ";
        
        try {
            result = Md5Util.encode(sourceStr, salt);
            Assert.fail("no check source");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        
        sourceStr = "source";
        result = Md5Util.encode(sourceStr, salt);
        Assert.assertEquals(expectMD5, result);
        
        salt = "salt";
        result = Md5Util.encode(sourceStr, salt);
        Assert.assertEquals(expectMD5WithSalt, result);
    }
    
    /**
     * 
     */
    @Test
    public void testEnchder() {
        String test = Md5Util.encode("test");
        String othTest = Md5Util.encode("test");
        Assert.assertEquals(test, othTest);
    }
    
}
