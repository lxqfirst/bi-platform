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

import javax.crypto.BadPaddingException;

import org.junit.Assert;
import org.junit.Test;

/**
 * AES加密测试
 * 
 * @author xiaoming.chen
 *
 */
public class AesUtilTest {

    /**
     * util aes工具类instantce
     */
    private AesUtil util = AesUtil.getInstance();

    /**
     * 测试使用密钥的加密
     * 
     * @throws Exception 调用异常
     */
    @Test
    public void testEncrypt() throws Exception {
        String data = null;
        String keyValue = null;
        String result = null;

        try {
            result = util.encrypt(data);
            Assert.fail("no check blank data");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        try {
            result = util.encrypt(data, keyValue);
            Assert.fail("no check blank data");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        data = "password";
        try {
            result = util.encrypt(data, keyValue);
            Assert.fail("no check blank keyValue");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        result = util.encrypt(data);
        Assert.assertEquals("4tLTUniMDrkL3kerxp7few==", result);

        keyValue = "12345678901234567890";
        result = util.encrypt(data, keyValue);
        Assert.assertEquals("mcM3yWWT+8sre6MjlFUpww==", result);

        keyValue = "123";
        result = util.encrypt(data, keyValue);
        Assert.assertEquals("QjmEdnTkKujG6zcLFzz+nw==", result);

        long current = System.nanoTime();
        keyValue = "tieba";
        result = util.encrypt(data, keyValue);
        Assert.assertEquals("QsWyLU5MmJOqlnrnGJ/NcA==", result);
        System.out.println("ss:" + (System.nanoTime() - current) / 1000);

    }

    /**
     * 解密测试
     * 
     * @throws Exception 调用异常
     */
    @Test
    public void testDecrypt() throws Exception {
        String encryptedData = null;
        String keyValue = null;
        String result = null;

        try {
            result = util.decrypt(encryptedData);
            Assert.fail("no check blank data");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        try {
            result = util.decrypt(encryptedData, keyValue);
            Assert.fail("no check blank data");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }

        encryptedData = "QjmEdnTkKujG6zcLFzz+nw==";
        try {
            result = util.decrypt(encryptedData, keyValue);
            Assert.fail("no check blank data");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof IllegalArgumentException);
        }
        keyValue = "123";
        result = util.decrypt(encryptedData, keyValue);
        Assert.assertEquals("password", result);

        encryptedData = "QjmEdnTkKujG6zcLFzz+nw==";
        try {
            result = util.decrypt(encryptedData);
            Assert.fail("no throw padding exception");
        } catch (Exception e) {
            Assert.assertTrue(e instanceof BadPaddingException);
        }

    }

}
