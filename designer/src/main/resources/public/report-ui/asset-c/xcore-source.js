/**
 * xui
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:   工程基础
 * @author:  sushuang(sushuang)
 */

/**
 * @namespace
 */
var xui = {};
/**
 * xui.XPorject
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    一种Javascript工程组织方法
 *          [功能]
 *              (1) 各级名空间建立
 *              (2) 交叉引用/文件依赖的一种解决方案（闭包变量注入）
 * @author:  sushuang(sushuang)
 * @version: 1.0.1
 */

/**
 * @usage [引入XProject]
 *          为了在代码中方便使用XProject提供的方法，
 *          可以在工程开始时在全局定义方法的别名。
 *
 *          例如：
 *          window.$ns = xui.XProject.namespace;
 *          window.$link = xui.XProject.link;
 *          （下文中为书写简便假设已经做了如上别名定义）
 * 
 * @usage [名空间建立]
 *          假设准备建立一个类：
 *
 *          // 直接建立了名空间
 *          $ns('aaa.bbb.ccc');
 *  
 *          // 类的构造函数
 *          aaa.bbb.ccc.SomeClass = function () {
 *              // do something ...
 *          }
 *
 *          或者直接：
 *          // 类的构造函数
 *          $ns('aaa.bbb.ccc').SomeClass = function () { 
 *              // do something ...
 *          }
 *
 *          或者这种风格：
 *          // 文件开头声明名空间
 *          $ns('aaa.bbb.ccc'); 
 *          (function () {
 *              // $ns()会返回最近一次声明名空间的结果
 *              $ns().SomeClass = function () { 
 *                  // do something ...
 *              }
 *          })();
 *        
 * @usage [依赖/交叉引用/link]
 *          工程中对象的交叉引用不在这里考虑，
 *          这里考虑的是类型/全局结构定义阶段的交叉引用，
 *          如下例类型定义时：
 *
 *          (function () {
 *              // 在闭包中定义外部引用的类，
 *              // 这么做的好处至少有：方便压缩，易适应路径改动，代码简洁。
 *              var OTHER_CONTROL1 = aaa.bbb.SomeClass;
 *              var OTHER_SERVICE2 = tt.ee.SomeService;
 *              var OTHER_MODEL3 = qq.uu.ii.SomeModel;
 *              
 *              // 构造函数，定义本类
 *              $ns('aaa.bb').MyControl = function () { 
 *                  this.otherControl = new OTHER_CONTROL();
 *                  ...
 *              }
 *              ...
 *          })();
 *          这种情况下，如果多个类互相有引用（形成闭环），
 *          则不知道如何排文件顺序，来使闭包中的类型/函数引用OK，
 *          而C++/Java等常用的编译型面向对象语言都默认支持不需关心这些问题。
 * 
 *          这里使用这种解决方式：
 *          (function () {
 *              // 先在闭包中声明
 *              var OTHER_CONTROL1, OTHER_SERVICE2, OTHER_MODEL3;
 *              // 连接
 *              $link(function () {
 *                  OTHER_CONTROL1 = aaa.bbb.SomeClass;
 *                  OTHER_SERVICE2 = tt.ee.SomeService;
 *                  OTHER_MODEL3 = qq.uu.ii.SomeModel;
 *              });
 *              //构造函数，定义本类
 *              $ns('aa.bb').MyControl = function () { 
 *                  this.otherControl = new OTHER_CONTROL();
 *                  // ...
 *              }
 *              // ...
 *          })();
 *            
 *          在所有文件的最后，调用xui.XProject.doLink()，则实际注入所有的引用。
 */

(function () {
    
    var XPROJECT = xui.XProject = {};
    var NS_BASE = window;
    var TRIMER = new RegExp(
            "(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"
        );

    /**
     * 延迟执行函数的集合
     *
     * @type {Array.<Function>}
     * @private
     */
    var linkSet = [];
    /**
     * 最终执行的函数集合
     *
     * @type {Array.<Function>}
     * @private
     */
    var endSet = [];
    /**
     * 最近一次的名空间
     *
     * @type {Object}
     * @private
     */
    var lastNameSpace;
    
    /**
     * (1) 创建名空间：如调用namespace("aaa.bbb.ccc")，如果不存在，则建立。
     * (2) 获得指定名空间：如上，如果存在NS_BASE.aaa.bbb.ccc，则返回。
     * (3) 获得最近一次声明的名空间：调用namespace()，不传参数，
     *      则返回最近一次调用namespace（且isRecord参数不为false）得到的结果
     * 
     * NS_BASE默认是window (@see setNamespaceBase)。 
     *
     * @public
     * @param {string=} namespacePath 名空间路径，
     *              以"."分隔，如"aaa.bbb.ccc"，
     *              如果不传参，则返回最近一次调用结果。
     * @param {boolean} isRecord 是否记录此次调用结果，缺省则表示true
     * @return {Object} 名空间对象
     */
    XPROJECT.namespace = function (namespacePath, isRecord) {
        if (arguments.length == 0) {
            return lastNameSpace;
        }
        
        var context = NS_BASE;
        var pathArr = parseInput(namespacePath).split('.');
        for (var i = 0 ;i < pathArr.length; i ++) {
            context = getOrCreateObj(context, parseInput(pathArr[i]));
        }
        
        if (isRecord !== false) {
            lastNameSpace = context
        }
        
        return context;
    };
    
    /**
     * 注册一个连接
     *
     * @public
     * @param {Function} func 链接函数
     */
    XPROJECT.link = function (func) {
        if (!isFunction(func)) {
            throw new Error (
                'Input of link must be a function but not ' + func
            );
        }
        linkSet.push(func);
    };
    
    /**
     * 执行所有连接并清空注册
     *
     * @public
     */
    XPROJECT.doLink = function () {
        for(var i = 0, o; o = linkSet[i]; i++) {
            o.call(null);
        }
        linkSet = []; 
    };
    
    /**
     * 注册一个最后执行的函数
     *
     * @public
     * @param {Function} func 链接函数
     */
    XPROJECT.end = function (func) {
        if (!isFunction(func)) {
            throw new Error (
                'Input of link must be a function but not ' + func
            );
        }
        endSet.push(func);
    };
    
    /**
     * 执行所有最后执行的注册并清空注册
     *
     * @public
     */
    XPROJECT.doEnd = function () {
        for(var i = 0, o; o = endSet[i]; i++) {
            o.call(null);
        }
        endSet = []; 
    };
    
    /**
     * 设置名空间查找根基，默认是window
     *
     * @public
     * @param {Object} namespaceBase 名空间根基
     */
    XPROJECT.setNamespaceBase = function (namespaceBase) {
        namespaceBase && (NS_BASE = namespaceBase);
    };

    /**
     * 得到名空间查找根基，默认是window
     *
     * @public
     * @return {Object} 名空间根基
     */
    XPROJECT.getNamespaceBase = function () {
        return NS_BASE;
    };
    
    /**
     * Parse输入
     *
     * @private
     * @param {string} input 输入
     * @return {boolean} parse结果
     */
    function parseInput(input) {
        var o;
        if ((o = trim(input)) == '') {
            throw new Error('Error input: ' + str);   
        } 
        else {
            return o;
        }
    }
    
    /**
     * 创建及获得路径对象
     *
     * @private
     * @param {Object} context 上下文
     * @param {string} attrName 属性名
     * @return {Object} 得到的对象
     */
    function getOrCreateObj(context, attrName) {
        var o = context[attrName];
        return o != null ? o : (context[attrName] = {});
    }
    
    /**
     * 是否函数
     *
     * @private
     * @param {*} variable 输入
     * @return {boolean} 是否函数
     */
    function isFunction(variable) {
        return Object.prototype.toString.call(variable) == '[object Function]';
    }
    
    /**
     * 字符串trim
     *
     * @private
     * @param {string} 输入
     * @return {string} 结果
     */
    function trim(source) {
        return source == null ? '' : String(source).replace(TRIMER, '');
    }
    
})();
// Copyright (c) 2009, Baidu Inc. All rights reserved.
// 
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http:// tangram.baidu.com/license.html
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
 /**
 * @namespace T Tangram七巧板
 * @name T
 * @version 1.5.2.2
*/

/**
 * 修改点：
 * ajax加入 charset=UTF-8
 */

/**
 * 声明baidu包
 * @author: allstar, erik, meizz, berg
 */
var T,
    baidu = T = baidu || {version: "1.5.2.2"}; 

//提出guid，防止在与老版本Tangram混用时
//在下一行错误的修改window[undefined]
baidu.guid = "$BAIDU$";

//Tangram可能被放在闭包中
//一些页面级别唯一的属性，需要挂载在window[baidu.guid]上
baidu.$$ = window[baidu.guid] = window[baidu.guid] || {global:{}};

/**
 * 对XMLHttpRequest请求的封装
 * @namespace baidu.ajax
 */
baidu.ajax = baidu.ajax || {};

/**
 * 对方法的操作，解决内存泄露问题
 * @namespace baidu.fn
 */
baidu.fn = baidu.fn || {};


/**
 * 这是一个空函数，用于需要排除函数作用域链干扰的情况.
 * @author rocy
 * @name baidu.fn.blank
 * @function
 * @grammar baidu.fn.blank()
 * @meta standard
 * @return {Function} 一个空函数
 * @version 1.3.3
 */
baidu.fn.blank = function () {};


/**
 * 发送一个ajax请求
 * @author: allstar, erik, berg
 * @name baidu.ajax.request
 * @function
 * @grammar baidu.ajax.request(url[, options])
 * @param {string} 	url 发送请求的url
 * @param {Object} 	options 发送请求的选项参数
 * @config {String} 	[method] 			请求发送的类型。默认为GET
 * @config {Boolean}  [async] 			是否异步请求。默认为true（异步）
 * @config {String} 	[data] 				需要发送的数据。如果是GET请求的话，不需要这个属性
 * @config {Object} 	[headers] 			要设置的http request header
 * @config {number}   [timeout]       超时时间，单位ms
 * @config {String} 	[username] 			用户名
 * @config {String} 	[password] 			密码
 * @config {Function} [onsuccess] 		请求成功时触发，function(XMLHttpRequest xhr, string responseText)。
 * @config {Function} [onfailure] 		请求失败时触发，function(XMLHttpRequest xhr)。
 * @config {Function} [onbeforerequest]	发送请求之前触发，function(XMLHttpRequest xhr)。
 * @config {Function} [on{STATUS_CODE}] 	当请求为相应状态码时触发的事件，如on302、on404、on500，function(XMLHttpRequest xhr)。3XX的状态码浏览器无法获取，4xx的，可能因为未知问题导致获取失败。
 * @config {Boolean}  [noCache] 			是否需要缓存，默认为false（缓存），1.1.1起支持。
 * 
 * @meta standard
 * @see baidu.ajax.get,baidu.ajax.post,baidu.ajax.form
 *             
 * @returns {XMLHttpRequest} 发送请求的XMLHttpRequest对象
 */
baidu.ajax.request = function (url, opt_options) {
    var options     = opt_options || {},
        data        = options.data || "",
        async       = !(options.async === false),
        username    = options.username || "",
        password    = options.password || "",
        method      = (options.method || "GET").toUpperCase(),
        headers     = options.headers || {},
        // 基本的逻辑来自lili同学提供的patch
        timeout     = options.timeout || 0,
        eventHandlers = {},
        tick, key, xhr;

    /**
     * readyState发生变更时调用
     * 
     * @ignore
     */
    function stateChangeHandler() {
        if (xhr.readyState == 4) {
            try {
                var stat = xhr.status;
            } catch (ex) {
                // 在请求时，如果网络中断，Firefox会无法取得status
                fire('failure');
                return;
            }
            
            fire(stat);
            
            // http://www.never-online.net/blog/article.asp?id=261
            // case 12002: // Server timeout      
            // case 12029: // dropped connections
            // case 12030: // dropped connections
            // case 12031: // dropped connections
            // case 12152: // closed by server
            // case 13030: // status and statusText are unavailable
            
            // IE error sometimes returns 1223 when it 
            // should be 204, so treat it as success
            if ((stat >= 200 && stat < 300)
                || stat == 304
                || stat == 1223) {
                fire('success');
            } else {
                fire('failure');
            }
            
            /*
             * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
             * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
             * function maybe still be called after it is deleted. The theory is that the
             * callback is cached somewhere. Setting it to null or an empty function does
             * seem to work properly, though.
             * 
             * On IE, there are two problems: Setting onreadystatechange to null (as
             * opposed to an empty function) sometimes throws an exception. With
             * particular (rare) versions of jscript.dll, setting onreadystatechange from
             * within onreadystatechange causes a crash. Setting it from within a timeout
             * fixes this bug (see issue 1610).
             * 
             * End result: *always* set onreadystatechange to an empty function (never to
             * null). Never set onreadystatechange from within onreadystatechange (always
             * in a setTimeout()).
             */
            window.setTimeout(
                function() {
                    // 避免内存泄露.
                    // 由new Function改成不含此作用域链的 baidu.fn.blank 函数,
                    // 以避免作用域链带来的隐性循环引用导致的IE下内存泄露. By rocy 2011-01-05 .
                    xhr.onreadystatechange = baidu.fn.blank;
                    if (async) {
                        xhr = null;
                    }
                }, 0);
        }
    }
    
    /**
     * 获取XMLHttpRequest对象
     * 
     * @ignore
     * @return {XMLHttpRequest} XMLHttpRequest对象
     */
    function getXHR() {
        if (window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {}
            }
        }
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }
    
    /**
     * 触发事件
     * 
     * @ignore
     * @param {String} type 事件类型
     */
    function fire(type) {
        type = 'on' + type;
        var handler = eventHandlers[type],
            globelHandler = baidu.ajax[type];
        
        // 不对事件类型进行验证
        if (handler) {
            if (tick) {
              clearTimeout(tick);
            }

            if (type != 'onsuccess') {
                handler(xhr);
            } else {
                //处理获取xhr.responseText导致出错的情况,比如请求图片地址.
                try {
                    xhr.responseText;
                } catch(error) {
                    return handler(xhr);
                }
                handler(xhr, xhr.responseText);
            }
        } else if (globelHandler) {
            //onsuccess不支持全局事件
            if (type == 'onsuccess') {
                return;
            }
            globelHandler(xhr);
        }
    }
    
    
    for (key in options) {
        // 将options参数中的事件参数复制到eventHandlers对象中
        // 这里复制所有options的成员，eventHandlers有冗余
        // 但是不会产生任何影响，并且代码紧凑
        eventHandlers[key] = options[key];
    }
    
    headers['X-Requested-With'] = 'XMLHttpRequest';
    
    
    try {
        xhr = getXHR();
        
        if (method == 'GET') {
            if (data) {
                url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                data = null;
            }
            if(options['noCache'])
                url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + (+ new Date) + '=1';
        }
        
        if (username) {
            xhr.open(method, url, async, username, password);
        } else {
            xhr.open(method, url, async);
        }
        
        if (async) {
            xhr.onreadystatechange = stateChangeHandler;
        }
        
        // 在open之后再进行http请求头设定
        // FIXME 是否需要添加; charset=UTF-8呢
        if (method == 'POST') {
            xhr.setRequestHeader("Content-Type",
                (headers['Content-Type'] || "application/x-www-form-urlencoded; charset=UTF-8"));
        }
        
        for (key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
        
        fire('beforerequest');

        if (timeout) {
          tick = setTimeout(function(){
            xhr.onreadystatechange = baidu.fn.blank;
            xhr.abort();
            fire("timeout");
          }, timeout);
        }
        xhr.send(data);
        
        if (!async) {
            stateChangeHandler();
        }
    } catch (ex) {
        fire('failure');
    }
    
    return xhr;
};


/**
 * 发送一个get请求
 * @name baidu.ajax.get
 * @function
 * @grammar baidu.ajax.get(url[, onsuccess])
 * @param {string} 	url 		发送请求的url地址
 * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
 * @meta standard
 * @see baidu.ajax.post,baidu.ajax.request
 *             
 * @returns {XMLHttpRequest} 	发送请求的XMLHttpRequest对象
 */
baidu.ajax.get = function (url, onsuccess) {
    return baidu.ajax.request(url, {'onsuccess': onsuccess});
};

/**
 * 发送一个post请求
 * @name baidu.ajax.post
 * @function
 * @grammar baidu.ajax.post(url, data[, onsuccess])
 * @param {string} 	url 		发送请求的url地址
 * @param {string} 	data 		发送的数据
 * @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
 * @meta standard
 * @see baidu.ajax.get,baidu.ajax.request
 *             
 * @returns {XMLHttpRequest} 	发送请求的XMLHttpRequest对象
 */
baidu.ajax.post = function (url, data, onsuccess) {
    return baidu.ajax.request(
        url, 
        {
            'onsuccess': onsuccess,
            'method': 'POST',
            'data': data
        }
    );
};

/**
 * 操作json对象的方法
 * @namespace baidu.json
 */
baidu.json = baidu.json || {};


/**
 * 将json对象序列化
 * @name baidu.json.stringify
 * @function
 * @grammar baidu.json.stringify(value)
 * @param {JSON} value 需要序列化的json对象
 * @remark
 * 该方法的实现与ecma-262第五版中规定的JSON.stringify不同，暂时只支持传入一个参数。后续会进行功能丰富。
 * @meta standard
 * @see baidu.json.parse,baidu.json.encode
 *             
 * @returns {string} 序列化后的字符串
 */
baidu.json.stringify = (function () {
    /**
     * 字符串处理时需要转义的字符表
     * @private
     */
    var escapeMap = {
        "\b": '\\b',
        "\t": '\\t',
        "\n": '\\n',
        "\f": '\\f',
        "\r": '\\r',
        '"' : '\\"',
        "\\": '\\\\'
    };
    
    /**
     * 字符串序列化
     * @private
     */
    function encodeString(source) {
        if (/["\\\x00-\x1f]/.test(source)) {
            source = source.replace(
                /["\\\x00-\x1f]/g, 
                function (match) {
                    var c = escapeMap[match];
                    if (c) {
                        return c;
                    }
                    c = match.charCodeAt();
                    return "\\u00" 
                            + Math.floor(c / 16).toString(16) 
                            + (c % 16).toString(16);
                });
        }
        return '"' + source + '"';
    }
    
    /**
     * 数组序列化
     * @private
     */
    function encodeArray(source) {
        var result = ["["], 
            l = source.length,
            preComma, i, item;
            
        for (i = 0; i < l; i++) {
            item = source[i];
            
            switch (typeof item) {
            case "undefined":
            case "function":
            case "unknown":
                break;
            default:
                if(preComma) {
                    result.push(',');
                }
                result.push(baidu.json.stringify(item));
                preComma = 1;
            }
        }
        result.push("]");
        return result.join("");
    }
    
    /**
     * 处理日期序列化时的补零
     * @private
     */
    function pad(source) {
        return source < 10 ? '0' + source : source;
    }
    
    /**
     * 日期序列化
     * @private
     */
    function encodeDate(source){
        return '"' + source.getFullYear() + "-" 
                + pad(source.getMonth() + 1) + "-" 
                + pad(source.getDate()) + "T" 
                + pad(source.getHours()) + ":" 
                + pad(source.getMinutes()) + ":" 
                + pad(source.getSeconds()) + '"';
    }
    
    return function (value) {
        switch (typeof value) {
        case 'undefined':
            return 'undefined';
            
        case 'number':
            return isFinite(value) ? String(value) : "null";
            
        case 'string':
            return encodeString(value);
            
        case 'boolean':
            return String(value);
            
        default:
            if (value === null) {
                return 'null';
            } else if (value instanceof Array) {
                return encodeArray(value);
            } else if (value instanceof Date) {
                return encodeDate(value);
            } else {
                var result = ['{'],
                    encode = baidu.json.stringify,
                    preComma,
                    item;
                    
                for (var key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        item = value[key];
                        switch (typeof item) {
                        case 'undefined':
                        case 'unknown':
                        case 'function':
                            break;
                        default:
                            if (preComma) {
                                result.push(',');
                            }
                            preComma = 1;
                            result.push(encode(key) + ':' + encode(item));
                        }
                    }
                }
                result.push('}');
                return result.join('');
            }
        }
    };
})();

/**
 * 将字符串解析成json对象。注：不会自动祛除空格
 * @name baidu.json.parse
 * @function
 * @grammar baidu.json.parse(data)
 * @param {string} source 需要解析的字符串
 * @remark
 * 该方法的实现与ecma-262第五版中规定的JSON.parse不同，暂时只支持传入一个参数。后续会进行功能丰富。
 * @meta standard
 * @see baidu.json.stringify,baidu.json.decode
 *             
 * @returns {JSON} 解析结果json对象
 */
baidu.json.parse = function (data) {
    //2010/12/09：更新至不使用原生parse，不检测用户输入是否正确
    return (new Function("return (" + data + ")"))();
};

/**
 * 将json对象序列化，为过时接口，今后会被baidu.json.stringify代替
 * @name baidu.json.encode
 * @function
 * @grammar baidu.json.encode(value)
 * @param {JSON} value 需要序列化的json对象
 * @meta out
 * @see baidu.json.decode,baidu.json.stringify
 *             
 * @returns {string} 序列化后的字符串
 */
baidu.json.encode = baidu.json.stringify;

/**
 * 将字符串解析成json对象，为过时接口，今后会被baidu.json.parse代替
 * @name baidu.json.decode
 * @function
 * @grammar baidu.json.decode(source)
 * @param {string} source 需要解析的字符串
 * @meta out
 * @see baidu.json.encode,baidu.json.parse
 *             
 * @returns {JSON} 解析结果json对象
 */
baidu.json.decode = baidu.json.parse;

/**
 * 判断浏览器类型和特性的属性
 * @namespace baidu.browser
 */
baidu.browser = baidu.browser || {};


(function(){
    var ua = navigator.userAgent;
    /*
     * 兼容浏览器为safari或ipad,其中,一段典型的ipad UA 如下:
     * Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10
     */
    
    /**
     * 判断是否为safari浏览器, 支持ipad
     * @property safari safari版本号
     * @grammar baidu.browser.safari
     * @meta standard
     * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.opera,baidu.browser.chrome   
     */
    baidu.browser.safari = /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) ? + (RegExp['\x241'] || RegExp['\x242']) : undefined;
})();

//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241
/**
 * 判断是否为ie浏览器
 * @name baidu.browser.ie
 * @field
 * @grammar baidu.browser.ie
 * @returns {Number} IE版本号
 */
baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;

/**
 * 判断是否为opera浏览器
 * @property opera opera版本号
 * @grammar baidu.browser.opera
 * @meta standard
 * @see baidu.browser.ie,baidu.browser.firefox,baidu.browser.safari,baidu.browser.chrome
 * @returns {Number} opera版本号
 */

/**
 * opera 从10开始不是用opera后面的字符串进行版本的判断
 * 在Browser identification最后添加Version + 数字进行版本标识
 * opera后面的数字保持在9.80不变
 */
baidu.browser.opera = /opera(\/| )(\d+(\.\d+)?)(.+?(version\/(\d+(\.\d+)?)))?/i.test(navigator.userAgent) ?  + ( RegExp["\x246"] || RegExp["\x242"] ) : undefined;

/**
 * 操作dom的方法
 * @namespace baidu.dom 
 */
baidu.dom = baidu.dom || {};


/**
 * 使函数在页面dom节点加载完毕时调用
 * @author allstar
 * @name baidu.dom.ready
 * @function
 * @grammar baidu.dom.ready(callback)
 * @param {Function} callback 页面加载完毕时调用的函数.
 * @remark
 * 如果有条件将js放在页面最底部, 也能达到同样效果，不必使用该方法。
 * @meta standard
 */
(function() {

    var ready = baidu.dom.ready = function() {
        var readyBound = false,
            readyList = [],
            DOMContentLoaded;

        if (document.addEventListener) {
            DOMContentLoaded = function() {
                document.removeEventListener('DOMContentLoaded', DOMContentLoaded, false);
                ready();
            };

        } else if (document.attachEvent) {
            DOMContentLoaded = function() {
                if (document.readyState === 'complete') {
                    document.detachEvent('onreadystatechange', DOMContentLoaded);
                    ready();
                }
            };
        }
        /**
         * @private
         */
        function ready() {
            if (!ready.isReady) {
                ready.isReady = true;
                for (var i = 0, j = readyList.length; i < j; i++) {
                    readyList[i]();
                }
            }
        }
        /**
         * @private
         */
        function doScrollCheck(){
            try {
                document.documentElement.doScroll("left");
            } catch(e) {
                setTimeout( doScrollCheck, 1 );
                return;
            }   
            ready();
        }
        /**
         * @private
         */
        function bindReady() {
            if (readyBound) {
                return;
            }
            readyBound = true;

            if (document.readyState === 'complete') {
                ready.isReady = true;
            } else {
                if (document.addEventListener) {
                    document.addEventListener('DOMContentLoaded', DOMContentLoaded, false);
                    window.addEventListener('load', ready, false);
                } else if (document.attachEvent) {
                    document.attachEvent('onreadystatechange', DOMContentLoaded);
                    window.attachEvent('onload', ready);

                    var toplevel = false;

                    try {
                        toplevel = window.frameElement == null;
                    } catch (e) {}

                    if (document.documentElement.doScroll && toplevel) {
                        doScrollCheck();
                    }
                }
            }
        }
        bindReady();

        return function(callback) {
            ready.isReady ? callback() : readyList.push(callback);
        };
    }();

    ready.isReady = false;
})();
;T.undope=true;
/*
 * e-json
 * Copyright 2010 Baidu Inc. All rights reserved.
 * 
 * path:          e-json.js
 * desc:          提供E-JSON标准格式的请求与解析功能
 * author:        erik
 * depend:        baidu.ajax.request, baidu.json.parse
 * modification:  (1) 修改status在fail时可能为0的bug
 *                (2) 返回值非json而是各种html页面时不抛异常，这样就可以使后台统一定制失效页面，不同json非json分别处理 
 *                (by sushuang)
 */

/**
 * E-JSON标准格式的请求与解析功能
 */
baidu.ejson = function () {

    DEFAULT_ERROR_STATUS = 99999;

    /**
     * 发送一个数据格式为E-JSON标准的请求
     *
     * @inner
     */
    function request(url, options) {
        var onsuccess = options.onsuccess;
        var onfailure = options.onfailure;

        // 包装baidu.ajax.request的success回调
        options.onsuccess = function (xhr) {
            process(xhr.responseText, onsuccess, onfailure);
            options = null;
        };

        // 状态码异常时，触发e-json的proccess，status为请求返回的状态码
        options.onfailure = function (xhr) {
            process({
                    status: (xhr.status || DEFAULT_ERROR_STATUS), // 当abort时，以及一些浏览器302时，xhr.stauts为0且tangram会走onfailure, 故此处也应强制走onfailure
                    statusInfo: xhr.statusText,
                    data: xhr.responseText
                },
                onsuccess,
                onfailure);
            options = null;
        };

        return baidu.ajax.request(url, options);
    }

    /**
     * 解析处理E-JSON标准的数据
     *
     * @inner
     */ 
    function process(source, onsuccess, onfailure) {
        onfailure = onfailure || new Function();
        onsuccess = onsuccess || new Function();

//        //测试用，防止自定义用例不符合json规范，正式联调时去掉
//        baidu.json.parse = function(source){
//            return eval("(" + source + ")");
//        };
//        
        var obj;
        try { 
            obj = typeof source == 'string' ? baidu.json.parse(source) : source;
        } catch (e) { 
            // source可能为异常页面的HTML，用catch处理这类情况
            obj = source;
        }
        
        // 不存在值或不为Object时，认为是failure状态，状态码为普通异常
        if (!obj || typeof obj != 'object') {
            onfailure(1, obj);
            return;
        }

        // 请求状态正常
        if (!obj.status) {
            onsuccess(obj.data, obj);
        } else {
            onfailure(obj.status, obj);
        }
    }
 
    return {        
        DEFAULT_ERROR_STATUS: DEFAULT_ERROR_STATUS,

        /**
         * 发送一个数据格式为E-JSON标准的请求
         * 
         * @public
         * @param {string} url 发送请求的url
         * @param {Object} options 发送请求的可选参数
         */
        request: request,
        
        /**
         * 通过get的方式请求E-JSON标准的数据
         * 
         * @public
         * @param {string}   url 发送请求的url
         * @param {Function} onsuccess 状态正常的处理函数，(data字段值，整体数据)
         * @param {Function} onfailure 状态异常的处理函数，(异常状态码，整体数据)
         */
        get: function (url, onsuccess, onfailure) {
            request(url, 
                {
                    method      : 'get', 
                    onsuccess   : onsuccess, 
                    onfailure   : onfailure
                });
        },
        
        /**
         * 通过post的方式请求E-JSON标准的数据
         *
         * @public
         * @param {string} url         发送请求的url
         * @param {string} postData    post发送的数据
         * @param {Function} onsuccess 状态正常的处理函数，(data字段值，整体数据)
         * @param {Function} onfailure 状态异常的处理函数，(异常状态码，整体数据)
         */
        post: function (url, postData, onsuccess, onfailure) {
            return request(url, 
                {
                    method      : 'post', 
                    data        : postData, 
                    onsuccess   : onsuccess, 
                    onfailure   : onfailure
                });
        },

        /**
         * 解析处理E-JSON标准的数据
         *
         * @public
         * @param {string|Object}   source    数据对象或字符串形式
         * @param {Function}        onsuccess 状态正常的处理函数，(data字段值，整体数据)
         * @param {Function}        onfailure 状态异常的处理函数，(异常状态码，整体数据)
         */
        process: process
    };
}();


/**
 * xutil
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    工程直接使用的工具集
 *          在基础提供的工具函数之外，可根据每个工程需要添加工具函数
 * @author:  sushuang(sushuang)
 */

/**
 * @namespace
 */
var xutil = {
    lang: {},
    number: {},
    string: {},
    fn: {},
    object: {},
    date: {},
    url: {},
    collection: {},
    file: {},
    dom: {},
    uid: {},
    graphic: {},
    ajax: {}
};
/**
 * xutil.LinkedHashMap
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    节点有序的哈希表
 *           为哈希表提供线性表能力，适合管理有唯一性id的数据集合，
 *           做为队列、链表等结构使用
 * @author:  sushuang(sushuang)
 * @depend:  none
 */

/**
 * @usage 
 *    (1) 作为HashMap
 *        var h1 = new LinkedHashMap();
 *        h1.set('name', 'ss');
 *        h1.set('age', 123);
 *        var name = h1.get('name');
 * 
 *    (2) 作为数组、链表（支持环链表，见next、previous方法）、队列
 *        // 从id字段中取值做为HashMap的key
 *        var h2 = new LinkedHashMap(null, 'id'); 
 *        h2.addLast({ id: 23, name: 'ss' });
 *        h2.addFirst({ id: 34, name: 'bbb' });
 *        h2.appendAll(
 *          [
 *              { id: 99, name: 'xx' }, 
 *              { id: 543, name: 'trr' }
 *          ]
 *        );
 *        // 得到{id:23, name: 'ss'}
 *        var data1 = h2.get(23); 
 *        // 得到{id: 23, name: 'ss'}，按index取值
 *        var data2 = h2.getAt(1); 
 *        // 得到{id: 34, name: 'bbb'}
 *        var data3 = h2.first(); 
 *        // 遍历
 *        foreach(function(key, item, index) { ... }) 
 * 
 *    (3) 从list中自动取得key，value初始化
 *        // 如下设置为自动从'id'字段中取值做为HashMap的key，
 *        // 以{id: 55, name: 'aa'}整个为数据项
 *        var h3 = new LinkedHashMap([{ id: 55, name: 'aa' }], 'id');
 *        h3.addLast({ id: 23, name: 'ss' });
 *        // 如下设置为自动从id字段中取值做为HashMap的key，
 *        // 以name字段值做为数据项
 *        var h4 = new LinkedHashMap(null, 'id', 'name');
 *        h4.addLast({ id: 23, name: 'ss' });
 *        h4.addFirst('bb', 24); //同样效果
 */
(function () {

    var namespace = xutil;
    
    /**
     * 构造函数
     * 可构造空LinkedHashMap，也可以list进行初始化
     * 
     * @public
     * @constructor
     * @param {Array.<Object>} list 初始化列表
     *          为null则得到空LinkedHashMap
     * @param {(string|Function)=} defautlKeyAttr 
     *          表示list每个节点的哪个字段要做为HashMap的key，可缺省，
     *          如果为Function：
     *              param {*} list的每个节点
     *              return {*} HashMap的key
     * @param {(string|Function)=} defaultValueAttr 
     *          表示list每个节点的哪个字段要做为HashMap的value，可缺省，
     *          缺省则取list每个节点本身做为HashMap的value
     *          如果为Function：
     *              param {*} list的每个节点
     *              return {*} HashMap的value
     * @return {LinkedHashMap} 返回新实例
     */
    var LINKED_HASH_MAP = namespace.LinkedHashMap = 
            function (list, defautlKeyAttr, defaultValueAttr) {
                this._oMap = {};
                this._oHead = null;
                this._oTail = null;
                this._nLength = 0;
                this.setDefaultAttr(defautlKeyAttr, defaultValueAttr);
                list && this.appendAll(list);
            };
    var LINKED_HASH_MAP_CLASS = LINKED_HASH_MAP.prototype;

    /**
     * 设置defautlKeyAttr和defaultValueAttr
     *
     * @public
     * @param {(string|Function)=} defautlKeyAttr 参见构造函数中描述
     * @param {(string|Function)=} defaultValueAttr 参见构造函数中描述
     */
    LINKED_HASH_MAP_CLASS.setDefaultAttr = function (
        defautlKeyAttr, defaultValueAttr
    ) {
        this._sDefaultKeyAttr = defautlKeyAttr;
        this._sDefaultValueAttr = defaultValueAttr;
    };

    /**
     * 批量在最后追加数据
     * 
     * @public
     * @param {Array} list 要增加的列表
     * @param {(string|Function)=} keyAttr 
     *      表示list每个节点的哪个字段要做为HashMap的key，
     *      缺省则按defautlKeyAttr从list每个节点中取key
     * @param {(string|Function)=} valueAttr 
     *      表示list每个节点的哪个字段要做为HashMap的value，
     *      缺省则按defautlValueAttr从list每个节点中取value，
     *      无defautlValueAttr则取list每个节点本身做为HashMap的value
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.appendAll = function (list, keyAttr, valueAttr) {
        keyAttr == null && (keyAttr = this._sDefaultKeyAttr);
        if (keyAttr == null) { return this; }
        valueAttr == null && (valueAttr = this._sDefaultValueAttr);

        list = list || [];
        for (var i = 0, len = list.length, item; i < len; i ++) {
            if (!(item = list[i])) { continue; }
            this.addLast(
                this.$retieval(item, valueAttr), 
                this.$retieval(item, keyAttr)
            );
        }
        return this;
    };

    /**
     * 在最后增加
     * 用法一：
     *      my.addLast('asdf', 11)
     *      11为key，'asdf'为value
     * 用法二：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa', 'vv');
     *      则可以
     *      my.addLast({ aa: 11, vv: 'asdf' })
     *      自动提取11做为key，'asdf'做为value
     * 用法三：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa');
     *      则可以
     *      my.addLast({ aa: 11, vv: 'asdf' })
     *      自动提取11做为key，{ aa: 11, vv: 'asdf' }做为value
     * 传两个参数则表示用法一，
     * 传一个参数则表示用法二、三（即不传key参数）
     *
     * @public
     * @param {(*|Object)} item 增加的数据
     * @param {string=} key HashMap的关键字
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.addLast = function (item, key) {
        if (key == null) {
            // 用法一
            key = this.$retieval(item, this._sDefaultKeyAttr);
            item = this.$retieval(item, this._sDefaultValueAttr);
        }

        var node = { key: key, item: item, pre: null, next: null }; 
        this._oMap[key] = node;
        this.$insert(node, this._oTail, null);
        return this;
    };

    /**
     * 在最前增加
     * 用法一：
     *      my.addFirst('asdf', 11)
     *      11为key，'asdf'为value
     * 用法二：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa', 'vv');
     *      则可以
     *      my.addFirst({ aa: 11, vv: 'asdf' })
     *      自动提取11做为key，'asdf'做为value
     * 用法三：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa');
     *      则可以
     *      my.addFirst({ aa: 11, vv: 'asdf' })
     *      自动提取11做为key，{ aa: 11, vv: 'asdf' }做为value
     * 传两个参数则表示用法一，
     * 传一个参数则表示用法二、三（即不传key参数）
     *
     * @public
     * @param {(*|Object)} item 增加的数据
     * @param {string=} key HashMap的关键字
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.addFirst = function (item, key) {
        if (key == null) {
            // 用法一
            key = this.$retieval(item, this._sDefaultKeyAttr);
            item = this.$retieval(item, this._sDefaultValueAttr);
        }

        var node = { key: key, item: item, pre: null, next: null };
        this._oMap[key] = node;
        this.$insert(node, null, this._oHead);
        return this;
    };

    /**
     * 在某项前插入
     * 用法一：
     *      my.insertBefore('asdf', 11, 333)
     *      11为key，'asdf'为value，333为插入位置refKey  
     * 用法二：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa', 'vv');
     *      则可以
     *      my.insertBefore({ aa: 11, vv: 'asdf' }, 333)
     *      自动提取11做为key，'asdf'做为value
     * 用法三：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa');
     *      则可以
     *      my.insertBefore({ aa: 11, vv: 'asdf' }, 333)
     *      自动提取11做为key，{ aa: 11, vv: 'asdf' }做为value
     * 传三个参数则表示用法一，
     * 传两个参数则表示用法二、三（即不传key参数）
     *
     * @public
     * @param {(*|Object)} item 增加的数据
     * @param {string=} key item对应的HashMap的关键字
     * @param {string} refKey 在refKey项前插入
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.insertBefore = function () {
        var item;
        var key;
        var refKey;
        var arg = arguments;
        if (arg.length == 2) {
            // 用法二、三
            item = this.$retieval(arg[0], this._sDefaultValueAttr);
            key = this.$retieval(arg[0], this._sDefaultKeyAttr);
            refKey = arg[1];
        }
        else {
            // 用法一
            item = arg[0];
            key = arg[1];
            refKey = arg[2];
        }        

        var refNode = this._oMap[refKey];
        var node = { key: key, item: item, pre: null, next: null };
        if (refNode) {
            this._oMap[key] = node;
            this.$insert(node, refNode.pre, refNode);
        }
        return this;
    };

    /**
     * 在某项后插入
     * 用法一：
     *      my.insertAfter('asdf', 11, 333)
     *      11为key，'asdf'为value，333为插入位置refKey  
     * 用法二：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa', 'vv');
     *      则可以
     *      my.insertAfter({ aa: 11, vv: 'asdf' }, 333)
     *      自动提取11做为key，'asdf'做为value
     * 用法三：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa');
     *      则可以
     *      my.insertAfter({ aa: 11, vv: 'asdf' }, 333)
     *      自动提取11做为key，{ aa: 11, vv: 'asdf' }做为value
     * 传三个参数则表示用法一，
     * 传两个参数则表示用法二、三（即不传key参数）
     * 
     * @public
     * @param {(*|Object)} item 增加的数据
     * @param {string=} key item对应的HashMap的关键字，
     * @param {string} refKey 在refKey项后插入
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.insertAfter = function () {
        var item;
        var key;
        var refKey;
        var arg = arguments;
        if (arg.length == 2) {
            // 用法二、三
            item = this.$retieval(arg[0], this._sDefaultValueAttr);
            key = this.$retieval(arg[0], this._sDefaultKeyAttr);
            refKey = arg[1];
        }
        else {
            // 用法一
            item = arg[0];
            key = arg[1];
            refKey = arg[2];
        }

        var refNode = this._oMap[refKey];
        var node = { key: key, item: item, pre: null, next: null };
        if (refNode) {
            this._oMap[key] = node;
            this.$insert(node, refNode, refNode.next);
        }
        return this;
    };

    /**
     * 在某位置插入
     * 用法一：
     *      my.insertAt('asdf', 11, 0)
     *      11为key，'asdf'为value，0为插入位置index     
     * 用法二：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa', 'vv');
     *      则可以
     *      my.insertAt({ aa: 11, vv: 'asdf' }, 0)
     *      自动提取11做为key，'asdf'做为value
     * 用法三：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa');
     *      则可以
     *      my.insertAt({ aa: 11, vv: 'asdf' }, 0)
     *      自动提取11做为key，{ aa: 11, vv: 'asdf' }做为value
     * 传三个参数则表示用法一，
     * 传两个参数则表示用法二、三（即不传key参数）
     *
     * @public
     * @param {(*|Object)} item 增加的数据
     * @param {string=} key item对应的HashMap的关键字
     * @param {Object} index 插入位置，从0开始
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.insertAt = function () {
        var item;
        var key;
        var index;
        var arg = arguments;
        if (arg.length == 2) {
            // 用法二、三
            item = this.$retieval(arg[0], this._sDefaultValueAttr);
            key = this.$retieval(arg[0], this._sDefaultKeyAttr);
            index = arg[1];
        }
        else {
            // 用法一
            item = arg[0];
            key = arg[1];
            index = arg[2];
        }

        if (index != null && index == this.size()) {
            this.addLast(item, key);
        }
        else {
            var ref = this.getAt(index);
            if (ref && ref.key != null) {
                this.insertBefore(item, key, ref.key);
            }
        }
        return this;
    };

    /**
     * 全部清除LinkedHashMap内容
     *
     * @public
     */
    LINKED_HASH_MAP_CLASS.clean = function () {
        this._oMap = {};
        this._oHead = null;
        this._oTail = null;
        this._nLength = 0;
        this._sDefaultKeyAttr = null;
        this._sDefaultValueAttr = null;
    };

    /**
     * 清除LinkedHashMap内容，但是不清除defaultKeyAttr和defaultValueAttr
     *
     * @public
     */
    LINKED_HASH_MAP_CLASS.cleanWithoutDefaultAttr = function () {
        this._oMap = {};
        this._oHead = null;
        this._oTail = null;
        this._nLength = 0;
    };

    /**
     * 设置数据
     * 用法一：
     *      my.set(11, 'asdf')
     *      11为key，'asdf'为value
     * 用法二：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa', 'vv');
     *      则可以
     *      my.set({ aa: 11, vv: 'asdf' })
     *      自动提取11做为key，'asdf'做为value
     * 用法三：
     *      如果这样初始化
     *      var my = new LinkedHashMap(null, 'aa');
     *      则可以
     *      my.set({ aa: 11, vv: 'asdf' })
     *      自动提取11做为key，{ aa: 11, vv: 'asdf' }做为value
     * 传两个参数则表示用法一，
     * 传一个参数则表示用法二、三（即不传key参数）
     * 
     * @public
     * @param {Object=} key item对应的HashMap的关键字
     * @param {(*|Object)} item 增加的数据
     * @return {LinkedHashMap} 返回自身
     */
    LINKED_HASH_MAP_CLASS.set = function () {
        var key;
        var item;
        var arg = arguments;
        if (arg.length == 1) {
            // 用法二、三
            item = arg[0];
        } 
        else {
            // 用法一
            key = arg[0];
            item = arg[1];
        }

        this.addLast(item, key);
        return this;
    };
    
    /**
     * 取得数据
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @return {*} 取得的数据，未取到则返回null
     */
    LINKED_HASH_MAP_CLASS.get = function (key) {
        var node = this._oMap[key];
        return node ? node.item : null;
    };
    
    /**
     * 按index取得数据
     * 
     * @public
     * @param {Object} index 序号，从0开始
     * @return {Object} ret 取得的数据，
     *              例如：
     *              { key:'321', value: { id: '321', name: 'ss' } }，
     *              未取到则返回null
     * @return {number} ret.key HashMap的key
     * @return {*} ret.item 数据本身
     */
    LINKED_HASH_MAP_CLASS.getAt = function (index) {
        var ret = {};
        this.foreach(function (key, item, i) {
            if (index == i) {
                ret.key = key;
                ret.item = item;
                return false;
            }
        });
        return ret.key != null ? ret : null;
    };

    /**
     * 按key得到index
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @param {number} index 序号，从0开始，如果未找到，返回-1
     */
    LINKED_HASH_MAP_CLASS.getIndex = function (key) {
        var index = -1;
        this.foreach(function (k, item, i) {
            if (k == key) {
                index = i;
                return false;
            }
        });
        return index;
    };
    
    /**
     * 根据内容遍历，获取key
     * 
     * @public
     * @param {Object} item 内容
     * @param {Object} key item对应的HashMap的关键字
     */
    LINKED_HASH_MAP_CLASS.getKey = function (item) {
        var key;
        this.foreach(function (k, o, i) {
            if (o.item == item) {
                key = k;
                return false;   
            }
        });
        return key;
    };

    /**
     * 是否包含
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @return {boolean} 是否包含
     */
    LINKED_HASH_MAP_CLASS.containsKey = function (key) {
        return !!this.get(key);
    };

    /**
     * 将所有数据以Array形式返回
     * 
     * @public
     * @return {Array} 所有数据
     */
    LINKED_HASH_MAP_CLASS.list = function () {
        var ret = [];
        this.foreach(function (key, item) { ret.push(item); });
        return ret;
    };

    /**
     * 从链表首顺序遍历
     * 
     * @public
     * @param {Function} visitFunc 每个节点的访问函数
     *          param {string} key 每项的key
     *          param {*} item 每项
     *          param {number} index 遍历的计数
     *          return {boolan} 如果返回为false，则不再继续遍历
     */
    LINKED_HASH_MAP_CLASS.foreach = function (visitFunc) {
        var node = this._oHead;
        var i = 0;
        var goOn = true;
        while (node) {
            if (visitFunc(node.key, node.item, i++) === false) { 
                break; 
            }
            node = node.next;
        }
    };

    /**
     * 删除key对应的项
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @return {*} 被删除的项
     */
    LINKED_HASH_MAP_CLASS.remove = function (key) {
        var node = this._oMap[key];
        if (node) {
            delete this._oMap[key];
            var preNode = node.pre;
            var nextNode = node.next;
            preNode && (preNode.next = nextNode);
            nextNode && (nextNode.pre = preNode);
            this._nLength --; 
            (this._oHead == node) && (this._oHead = nextNode); 
            (this._oTail == node) && (this._oTail = preNode);
        }
        return node ? node.item : null;
    };

    /**
     * 得到LinkedHashMap大小
     * 
     * @public
     * @return {number} LinkedHashMap大小
     */
    LINKED_HASH_MAP_CLASS.size = function () {
        return this._nLength;
    };

    /**
     * 得到第一个数据
     * 
     * @public
     * @return {*} 第一个数据
     */
    LINKED_HASH_MAP_CLASS.first = function () {
        return this._oHead ? this._oHead.item : null;
    };
    
    /**
     * 得到第一个key
     * 
     * @public
     * @return {string} 第一个key
     */
    LINKED_HASH_MAP_CLASS.firstKey = function () {
        return this._oHead ? this._oHead.key : null;
    };

    /**
     * 得到最后一个数据
     * 
     * @public
     * @return {*} 最后一个数据
     */
    LINKED_HASH_MAP_CLASS.last = function () {
        return this._oTail ? this._oTail.item : null;
    };
    
    /**
     * 得到最后一个key
     * 
     * @public
     * @return {string} 最后一个key
     */
    LINKED_HASH_MAP_CLASS.lastKey = function () {
        return this._oTail ? this._oTail.key : null;
    };

    
    /**
     * 得到key对应的下一个项，未取到则返回null
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @param {boolean=} circular 如果到链尾，是否循环到链首，默认为false
     * @return {*} 取得的数据
     */
    LINKED_HASH_MAP_CLASS.next = function (key, circular) {
        var node = this.$next(key, circular);
        return node ? node.item : null;
    };
    
    /**
     * 得到key对应的下一个key，未取到则返回null
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @param {boolean=} circular 如果到链尾，是否循环到链首，默认为false
     * @return {string} 取得的key
     */
    LINKED_HASH_MAP_CLASS.nextKey = function (key, circular) {
        var node = this.$next(key, circular);
        return node ? node.key : null;
    };
    

    /**
     * 得到key对应的上一个项，未取到则返回null
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @param {boolean=} circular 如果到链尾，是否循环到链首，默认为false
     * @return {*} 取得的数据
     */
    LINKED_HASH_MAP_CLASS.previous = function (key, circular) {
        var node = this.$previous(key, circular);
        return node ? node.item : null;
    };
    
    /**
     * 得到key对应的上一个key，未取到则返回null
     * 
     * @public
     * @param {Object} key item对应的HashMap的关键字
     * @param {boolean=} circular 如果到链尾，是否循环到链首，默认为false
     * @return {string} 取得的key
     */
    LINKED_HASH_MAP_CLASS.previousKey = function (key, circular) {
        var node = this.$previous(key, circular);
        return node ? node.key : null;
    };
    
    /**
     * @protected
     */
    LINKED_HASH_MAP_CLASS.$next = function (key, circular) {
        var node = this._oMap[key];
        if (!node) { return null; }
        var next = (circular && node == this._oTail) 
                ? this._oHead : node.next;
        return next;
    };
    
    /**
     * @protected
     */
    LINKED_HASH_MAP_CLASS.$previous = function (key, circular) {
        var node = this._oMap[key];
        if (!node) { return null; }
        var pre = (circular && node == this._oHead) 
                ? this._oTail : node.pre;
        return pre;
    };
    
    /**
     * @protected
     */
    LINKED_HASH_MAP_CLASS.$retieval = function (item, attr) {
        var k;
        if (Object.prototype.toString.call(attr) == '[object Function]') {
            k = attr(item);
        } 
        else if (attr == null) {
            k = item;
        } 
        else {
            k = item[attr];
        }
        return (k === void 0) ? null : k;
    };   

    /**
     * @protected
     */
    LINKED_HASH_MAP_CLASS.$insert = function (node, preNode, nextNode) {
        node.pre = preNode;
        node.next = nextNode;
        preNode ? (preNode.next = node) : (this._oHead = node);
        nextNode ? (nextNode.pre = node) : (this._oTail = node);
        this._nLength ++;
    };
    
})();
/**
 * xutil.ajax
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    工程中Ajax的统一入口。基于基本的ajax封装实现，提供便于工程开发的附加功能。
 *          功能：
 *          (1) 全局的的请求失败处理定义接口
 *          (2) 全局的等待提示定义接口
 *             （使用方式：请求时传参数showWaiting）
 *          (3) 请求超时设定及全局的超时处理定义接口
 *          (4) 提供complete和finalize事件，便于不论请求成功与否的时的处理（如某些清理）
 *          (5) 返回的一致性保证
 *              用于在不屏蔽二次点击/重复请求情况下保证只是最新的请求返回被处理。
 *              用abort方式实现，可abort重复发出的请求。
 *              没有使用为每个请求挂唯一性tokenId方式的原因是，
 *              tokenId方式不易处理这种问题：
 *              如果pending的连接已超过浏览器连接上限，用户看无响应继续点击，
 *              会造成自激性连接堆积，难以恢复。
 *              但是abort方式的缺点是，如果重复请求过于频繁（例如由用户点击过快造成），
 *              容易对后台造成压力。暂时未支持对请求过频繁的限制（TODO）。
 *              （使用方式：请求时传参数businessKey）
 *          (6) abort支持的完善
 *              在多局部刷新的web应用中，在适当时点可以abort掉未完成的请求，
 *              防止返回处理时因相应的dom已不存在而出错。
 *          (7) 多个请求同步（最后一个请求返回时才执行回调）的支持。
 *              参见createSyncWrap方法
 * @author:  sushuang(sushuang)
 * @depend:  tangram.ajax, e-json, xutil.ajax
 */

(function () {
    
    var AJAX = xutil.ajax;
    var exRequest = baidu.ejson.request;
        
    /**
     * 外部接口，可以在工程中定义这些方法的实现或变量的赋值（也均可缺省）
     */
    /**
     * 默认的ajax调用选项，常用于工程的统一配置。
     * 可以被真正调用ajax时传的options覆盖
     *
     * @type {Object}
     * @public
     * @see ajax.request
     */
    AJAX.DEFAULT_OPTIONS = null;
    /**
     * 全局统一的请求失败处理函数
     * 先调用自定义的失败处理函数，再调用此统一的失败处理函数。
     * 如果前者返回false，则不会调用后者。
     *
     * @type {Function}
     * @public
     * @param {number} status ajax返回状态
     * @param {(Object|string)} obj e-json整体返回的数据
     * @param {Function} defaultCase 可用此函数替换默认情况的处理函数
     */
    AJAX.DEFAULT_FAILURE_HANDLER = null;
    /**
     * 全局统一的请求超时处理函数
     * （无参数返回值）
     *
     * @type {Function}
     * @public
     */
    AJAX.DEFAULT_TIMEOUT_HANDLER = null;
    /**
     * 全局统一的请求函数
     *
     * @type {Function}
     * @public
     * @return {string} 参数字符串，如a=5&a=2&b=xxx
     */
    AJAX.DEFAULT_PARAM = null;
    /**
     * 用于显示全局的等待提示，当第一个需要显示等待的请求发生时会调用
     *
     * @type {Function}
     * @public
     */
    AJAX.SHOW_WAITING_HANDLER = null;
    /**
     * 用于隐藏全局的等待提示，当最后一个需要显示等待的请求结束时会调用
     *
     * @type {Function}
     * @public
     */
    AJAX.HIDE_WAITING_HANDLER = null;
    /**
     * 默认是否显示等待提示，默认为false，可在工程中修改此默认定义
     *
     * @type {Function}
     * @public
     */
    AJAX.DEFAULT_SHOW_WAITING = false;
        
    /**
     * 记录所有请求未结束的xhr，
     * 格式：{requestId: {xhr: <xhr>, clear: <clear>}}
     * 
     * @type {Object}
     * @private
     */
    var xhrSet = {};
    /**
     * 记录指定了businessKey的请求，
     * 格式：{businessKey: requestId}
     *
     * @type {Object}
     * @private
     */
    var businessSet = {};
    /**
     * 记录所有需要显示等待的requestId，
     * 是xhrSet的子集，
     * 格式：{requestId: 1}
     *
     * @type {Object}
     * @private
     */
    var waitingSet = {};
    /**
     * waitingSet的大小
     *
     * @type {number}
     * @private
     */
    var waitingCount = 0;
    /**
     * 唯一性ID
     *
     * @type {number}
     * @private
     */
    var uniqueIndex = 1;
    
    /**
     * append默认的参数
     *
     * @private
     * @param {string} data 参数
     */
    function appendDefaultParams(data) {
        var paramArr = [];

        if (hasValue(data) && data !== '') {
            paramArr.push(data);
        }

        var defaultParamStr = AJAX.DEFAULT_PARAM ? AJAX.DEFAULT_PARAM() : '';
        if (hasValue(defaultParamStr) && defaultParamStr !== '') {
            paramArr.push(defaultParamStr);
        }

        return paramArr.join('&');
    }
    
    /**
     * 打印日志
     *
     * @private
     * @param {string} msg 日志信息
     */
    function log(msg) {
        isObject(window.console) 
            && isFunction(window.console.log) 
            && window.console.log(msg);
    }
    
    /**
     * 显示等待处理
     *
     * @private
     * @param {string} requestId 请求ID
     * @param {boolean} showWaiting 是否显示等待
     */
    function handleShowWaiting(requestId, showWaiting) {
        if (showWaiting) {
            waitingSet[requestId] = 1;
            (waitingCount ++) == 0
                && AJAX.SHOW_WAITING_HANDLER 
                && AJAX.SHOW_WAITING_HANDLER();
        }
    }
    
    /**
     * 隐藏等待处理
     *
     * @private
     * @param {string} requestId 请求ID
     */
    function handleHideWaiting(requestId) {
        if (waitingSet[requestId]) {
            delete waitingSet[requestId];
            (-- waitingCount) <= 0 
                && AJAX.HIDE_WAITING_HANDLER 
                && AJAX.HIDE_WAITING_HANDLER();
        }
    }
    
    /**
     * abort处理
     *
     * @private
     * @param {string} businessKey 业务键
     * @param {string} requestId 请求ID
     */
    function handleBusinessAbort(businessKey, requestId) {
        var oldRequestId;
        if (hasValue(businessKey)) {
            (oldRequestId = businessSet[businessKey]) 
                && AJAX.abort(oldRequestId, true);
            businessSet[businessKey] = requestId;
        }
    }
    
    /**
     * 业务键清除处理
     *
     * @private
     * @param {string} businessKey 业务键
     */
    function handleBusinessClear(businessKey) {
        if (hasValue(businessKey)) {
            delete businessSet[businessKey];   
        }
    }
    
    /**
     * 发送请求
     * 
     * @public
     * @param {string} url
     * @param {Objet} options
     * @param {string} options.data 发送参数字符串，GET时会拼装到URL
     * @param {string} options.method 表示http method, 'POST'或'GET', 默认'POST'
     * @param {string} options.businessKey 业务键，提供自动abort功能。
     *              缺省则不用此功能。
     *              如果某业务键的请求尚未返回，又发起了同一业务键的请求，
     *              则前者自动被abort。
     *              这样保证了请求返回处理的一致性，
     *              在请求可以重复发起的环境下较有意义
     *              （例如用户连续点击“下一页”按钮刷新列表，
     *              同时为用户体验而不会在返回前屏蔽点击时）。
     * @param {boolean} options.showWaiting 是否需要显示等待，true则计入等待集合，
     *              在相应时机调用SHOW_WAITING_HANDLER和HIDE_WAITING_HANDLER；
     *              false则忽略。默认值由DEFAULT_SHOW_WAITING指定。
     * @param {Function} options.onsuccess 请求成功的回调函数
     *              param {Object} data e-json解析出的业务数据
     *              param {Object} obj e-json返回数据整体
     * @param {Function} options.onfailure 请求失败的回调函数
     *              param {number} status e-json返回状态
     *              param {(Object|string)} obj e-json返回数据整体
     * @param {Function} options.oncomplete 返回时触发的回调函数，
     *              先于onsuccess或onfailure执行
     *              param {(Object|string)} obj e-json返回的数据整体 
     *              return {boolean} 如果返回false，则onsucces和onfailure都不执行
     * @param {Function} options.onfinalize 返回时触发的回调函数，
     *              后于onsuccess或onfailure执行
     *              param {(Object|string)} obj e-json返回的数据整体
     * @param {Function} options.defaultFailureHandler 
     *              请求自定的默认的失败处理函数，可缺省
     *              param {number} status e-json返回状态
     *              param {(Object|string)} obj e-json返回数据整体
     * @param {number} options.timeout 请求超时时间，默认是无限大
     * @param {Function} options.ontimeout 超时时的回调
     * @param {string} options.syncName 用于请求的同步，参见createSyncWrap方法
     * @param {Object} options.syncWrap 用于请求的同步，参见createSyncWrap方法
     * @return {string} options.requestId request的标志，用于abort
     */
    AJAX.request = function (url, options) {
        options = extend(
            extend(
                {}, AJAX.DEFAULT_OPTIONS || {}
            ), 
            options || {}
        );
        var requestId = 'AJAX_' + (++uniqueIndex);
        var businessKey = options.businessKey;
        var defaultFailureHandler = 
                options.defaultFailureHandler || null;
        var timeout = options.timeout || 0;
        var ontimeout = options.ontimeout;
        var onfailure = options.onfailure;
        var onsuccess = options.onsuccess;
        var oncomplete = options.oncomplete;
        var onfinalize = options.onfinalize;
        var showWaiting = options.showWaiting || AJAX.DEFAULT_SHOW_WAITING;
        var syncWrap = options.syncWrap;
        var syncName = options.syncName;
        var xhr;
        
        function clear() {
            defaultFailureHandler = ontimeout = 
            onfailure = onsuccess = 
            onfinalize = oncomplete = xhr = options = null;

            delete xhrSet[requestId];
            handleBusinessClear(businessKey);
            handleHideWaiting(requestId);
        }

        // tangram的ajax提供的屏蔽浏览器缓存
        options.noCache = true;

        options.method = options.method || 'POST';

        options.data = appendDefaultParams(options.data || '');

        // 构造sucess handler
        options.onsuccess = function (data, obj) {
            if (requestId in xhrSet) { // 判断abort
                try {
                    if (!oncomplete || oncomplete(obj) !== false) {
                        onsuccess(data, obj);
                    }
                    onfinalize && onfinalize(obj);
                } 
                finally {
                    syncWrap && syncWrap.done(syncName);
                    clear();
                }
            }
        };

        // 构造failure handler
        options.onfailure = function (status, obj) {
            var needDef;
            if (requestId in xhrSet) { // 判断abort
                try {
                    if (!oncomplete || oncomplete(obj) !== false) {
                        needDef = onfailure(status, obj);
                    }
                    onfinalize && onfinalize(obj);
                } 
                finally {
                    if (needDef !== false) {
                        if (AJAX.DEFAULT_FAILURE_HANDLER) {
                            AJAX.DEFAULT_FAILURE_HANDLER(
                                status, obj, defaultFailureHandler
                            );
                        }
                        else if (defaultFailureHandler) {
                            defaultFailureHandler(status, obj);
                        }
                    }
                    syncWrap && syncWrap.done(syncName);
                    clear();
                }
            }
        };

        // 构造timeout handler
        options.ontimeout = function () {
            try {
                if (!oncomplete || oncomplete(obj) !== false) {
                    ontimeout && ontimeout();
                }
                onfinalize && onfinalize(obj);
            } 
            finally {
                AJAX.DEFAULT_TIMEOUT_HANDLER 
                    && AJAX.DEFAULT_TIMEOUT_HANDLER();
                syncWrap && syncWrap.done(syncName);
                clear();
            }
        };

        if (timeout > 0) {
            options.timeout = timeout;
            options.ontimeout = timeoutHandler;
        } 
        else {
            delete options.timeout;
        }
        
        handleShowWaiting(requestId, showWaiting);
        
        handleBusinessAbort(requestId, businessKey);
        
        // 发送请求
        xhrSet[requestId] = {
            xhr: exRequest(url, options),
            clear: clear
        };
        
        return requestId;
    }

    /**
     * 发送POST请求
     * 
     * @public
     * @param {string} url
     * @param {string} data 发送参数字符串，GET时会拼装到URL
     * @param {Function} onsuccess @see AJAX.request
     * @param {Function} onfailure @see AJAX.request
     * @param {Objet} options @see AJAX.request
     * @return {string} requestId request的标志，用于abort
     */
    AJAX.post = function (url, data, onsuccess, onfailure, options) {
        options = options || {};
        options.method = 'POST';
        options.data = data;
        options.onsuccess = onsuccess;
        options.onfailure = onfailure;
        return AJAX.request(url, options);
    };

    /**
     * 发送GET请求
     * 
     * @public
     * @param {string} url
     * @param {string} data 发送参数字符串，GET时会拼装到URL
     * @param {Function} onsuccess @see AJAX.request
     * @param {Function} onfailure @see AJAX.request
     * @param {Objet} options @see AJAX.request
     * @return {string} requestId request的标志，用于abort
     */
    AJAX.get = function (url, data, onsuccess, onfailure, options) {
        options = options || {};
        options.method = 'GET';
        options.data = data;
        options.onsuccess = onsuccess;
        options.onfailure = onfailure;
        return AJAX.request(url, options);        
    };

    /**
     * 按requestId终止请求，或终止所有请求
     * 如果已经中断或结束后还调用此方法，不执行任何操作。
     * 
     * @public
     * @param {string} requestId request的标志，
     *          如果缺省则abort所有未完成的请求
     * @param {boolean} silence abort后是否触发回调函数（即onfailure）
     *          true则不触发，false则触发，缺省为true
     */
    AJAX.abort = function (requestId, silence) {
        var willAbort = [];
        var i;
        var wrap;
        silence = silence || true;
        
        if (hasValue(requestId)) {
            (requestId in xhrSet) && willAbort.push(requestId);
        } 
        else {
            for (i in xhrSet) { willAbort.push(i); }
        }
        
        for (i = 0; requestId = willAbort[i]; i++) {
            try {
                wrap = xhrSet[requestId];
                silence && delete xhrSet[requestId];
                wrap.xhr.abort();
                wrap.clear.call(null);
            } catch (e) {
                log(
                    '[ERROR] abort ajax error. requestId=' + 
                        requestId + ', e=' + e
                );
            }
        }
    };
    
    /**
     * 按业务键（businessKey）终止请求
     * 如果已经中断或结束后还调用此方法，不执行任何操作。
     * 
     * @public
     * @param {string} businessKey 业务键
     * @param {boolean} silence abort后是否触发回调函数（即onfailure）
     *          true则不触发，false则触发，缺省为true
     */
    AJAX.abortBusiness = function (businessKey, silence) {
        var requestId = businessSet[businessKey];
        if (hasValue(requestId)) {
            delete businessSet[businessKey];
            AJAX.abort(requestId);
        }
    };

    /**
     * 创建一个同步对象，用于多个请求同步返回
     * 
     * @public
     * @usage 假如回调函数callbackX需要在请求a和请求b都返回后才被调用，则这样做：
     *        (1) 创建个“同步对象”
     *          var reqWrap = ajax.syncRequest(
     *              ['a', 'b'], 
     *              function() { ... this is the callback } 
     *          );
     *        (2) 请求时作为参数传入
     *          // 请求a
     *          ajax.request(url, { syncName: 'a', syncWrap: reqWrap }); 
     *          // 请求b
     *          ajax.request(url, { syncName: 'b', syncWrap: reqWrap });
     *          这样，reqWrap中定义的回调函数就会在a和b都返回后被执行了。
     * 
     * @param {Array} syncNameList 命名集合
     * @param {Function} callback 回调函数
     * @return {Object} 同步对象，用作request参数
     */
    AJAX.createSyncWrap = function (syncNameList, callback) {
        return new SyncWrap(syncNameList, callback);
    };

    /**
     * 用于多个请求同步的包装
     *
     * @constructor
     * @private
     * @param {Array} syncNameList 同步名列表
     * @param {Array} callback 结束回调
     */
    function SyncWrap(syncNameList, callback) {
        var i;
        this.syncNameMap = {};
        for (i = 0, syncNameList = syncNameList || []; i < syncNameList.length; i ++) {
            this.syncNameMap[syncNameList[i]] = 0;
        }
        this.callback = callback || new Function();
    }

    /**
     * 同步结束
     *
     * @public
     * @param {string} syncName 同步名
     */
    SyncWrap.prototype.done = function (syncName) {
        var name;
        this.syncNameMap[syncName] = 1;
        for (name in this.syncNameMap) {
            if (!this.syncNameMap[name]) { return; }
        }
        this.callback.call(null);
    };

    /**
     * 扩展
     *
     * @private
     * @param {Object} target 目标对象
     * @param {Object} source 源对象
     * @return {Object} 扩展结果
     */
    function extend(target, source) {
        for (var key in source) { target[key] = source[key]; }
        return target;
    }

    /**
     * 是否函数
     *
     * @private
     * @param {*} variable 输入
     * @return {boolean} 是否函数
     */
    function isFunction(variable) {
        return Object.prototype.toString.call(variable) == '[object Function]';        
    }

    /**
     * 是否有值
     *
     * @private
     * @param {*} variable 输入
     * @return {boolean} 是否有值
     */
    function hasValue(variable) {
        return variable != null;
    }

    /**
     * 是否对象
     *
     * @private
     * @param {*} variable 输入
     * @return {boolean} 是否对象
     */
    function isObject(variable) {
        return variable === Object(variable);
    }

})();
/**
 * xutil.collection
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    列表、数组、集合相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  xutil.object
 */

(function () {
    
    var COLLECTION = xutil.collection;
    var OBJECT = xutil.object;
    
    /**
     * target是否在list的field域中存在
     * 
     * @public
     * @param {*} target 被检测的目标
     * @param {Array} list 被检测的数组
     * @param {string} field 数组元素的域的名字，
     *      如果为空则用list节点本身做比较的valueInList
     * @param {Function} equalsFunc 比较函数，缺省则使用“==”做比较函数
     *          参数为：
     *          param {*} target 被检测的目标
     *          param {*} valueInList list中的项
     *          return {boolean} 是否相等
     * @return {boolean} 判断结果
     */
    COLLECTION.inList = function (target, list, field, equalsFunc) {
        if (target == null || !list) {
            return false;
        }

        for(var i = 0, l = list.length, v; i < l; i ++) {
            v = list[i];
            if (v == null && field) { continue; }

            v = field ? v[field] : v;
            if (equalsFunc ? equalsFunc(target, v) : (target == v)) {
                return true;
            }
        }

        return false;
    };

    /**
     * 用类似SQL的方式检索列表
     * 
     * @public
     * @param {*} target 被检测的目标
     * @param {Array} list 被检测的数组
     * @param {string} selectField 数组元素的域的名字，用于select
     * @param {string} whereField 数组元素的域的名字，用于where
     * @param {*} whereValue 数组元素的相应域的值，用于where
     * @param {Function} equalsFunc 比较函数，缺省则使用“==”做比较函数
     *          参数为：
     *          param {*} target 被检测的目标
     *          param {8} valueInList list中的项
     *          return {boolean} 是否相等
     * @return {Array} 检索结果
     */
    COLLECTION.selectFromWhere = function (
        fromList, selectField, whereField, whereValue, equalsFunc
    ) {
        var ret = [];

        if (whereValue == null || !fromList || !whereField || !selectField) {
            return ret;
        }

        for(var i = 0, l = fromList.length, v, s; i < l; i ++) {
            if (!(v = fromList[i])) { continue };

            s = v[whereField];
            if (equalsFunc ? equalsFunc(whereValue, s) : whereValue == s) {
                ret.push(v[selectField]);
            }
        }

        return ret;
    };
    
    /**
     * 用类似SQL的方式检索列表，返回单值
     * 
     * @public
     * @param {*} target 被检测的目标
     * @param {Array} list 被检测的数组
     * @param {string} selectField 数组元素的域的名字，用于select
     * @param {string} whereField 数组元素的域的名字，用于where
     * @param {*} whereValue 数组元素的相应域的值，用于where
     * @param {Function} equalsFunc 比较函数，缺省则使用“==”做比较函数
     *          param {*} target 被检测的目标
     *          param {*} valueInList list中的项
     *          return {boolean} 是否相等
     * @return {*} 检索结果，单值
     */
    COLLECTION.selectSingleFromWhere = function (
        fromList, selectField, whereField, whereValue, compareFunc
    ) {
        var result = COLLECTION.selectFromWhere(
                fromList, selectField, whereField, whereValue, compareFunc
            );
        return (result && result.length>0) ? result[0] : null;
    };
    
    /**
     * 排序 (用冒泡实现，是稳定排序)
     * 
     * @public
     * @param {string} field 数组元素的域的名字，如果为空则用list节点本身做比较的valueInList
     * @param {(string|Function)} compareFunc 比较函数，
     *          可以传string或Function，compareFunc缺省则相当于传"<" 
     *          如果为String: 可以传：">"（即使用算术比较得出的降序）, 
     *                                "<"（即使用算术比较得出的升序）
     *          如果为Function: 意为：v1是否应排在v2前面，参数为
     *              param {*} v1 参与比较的第一个值
     *              param {*} v2 参与比较的第二个值
     *              return {boolean} 比较结果，true:v1应在v2前面；false:v1不应在v2前面
     * @param {boolean} willNew 如果为true:原list不动，新创建一个list; 
     *          如果为false:在原list上排序; 缺省:false
     * @return {Array} 排序结果
     */
    COLLECTION.sortList = function (list, field, compareFunc, willNew) {
        
        willNew && (list = OBJECT.clone(list));
        field = field != null ? field : null;    
        
        if (compareFunc == '>') {
            compareFunc = function (v1, v2) { 
                var b1 = v1 != null;
                var b2 = v2 != null;
                return (b1 && b2) 
                            ? (v1 >= v2) /*大于等于，保证稳定*/ 
                            : (b1 || !b2); /*空值算最小，同为空值返回true保证稳定*/
            }
        } 
        else if (compareFunc == '<') {
            compareFunc = function (v1, v2) { 
                var b1 = v1 != null;
                var b2 = v2 != null;
                return (b1 && b2) 
                            ? (v1 <= v2) /*小于等于，保证稳定*/ 
                            : (!b1 || b2); /*空值算最大，同为空值返回true保证稳定*/
            }
        }
        
        var item1;
        var item2; 
        var v1;
        var v2;
        var switched = true;

        for (var i = 0, li = list.length - 1; i < li && switched; i ++) {
            switched = false;
            
            for (var j = 0, lj = list.length - i - 1; j < lj; j ++) {
                item1 = list[j];
                v1 = item1 != null ? (field ? item1[field] : item1) : null;
                item2 = list[j + 1];
                v2 = item2 != null ? (field ? item2[field] : item2) : null;
                if (!compareFunc(v1, v2)) {
                    list[j] = item2;
                    list[j + 1] = item1;
                    switched = true;
                }
            }
        }

        return list;    
    };
    
    /**
     * 遍历树
     * 支持先序遍历、后序遍历、中途停止
     * 
     * @public
     * @usage
     *      travelTree(root, funciton (node, options) { 
     *          do something ... 
     *      }, '_aChildren');
     * 
     * @param {Object} travelRoot 遍历的初始
     * @param {Function} callback 每个节点的回调
     *          参数为：
     *          param {Object} node 当前访问的节点
     *          param {Object} options 一些遍历中的状态
     *          param {number} options.level 当前层级，0层为根
     *          param {number} options.index 遍历的总计数，从0开始计
     *          param {Object} options.parent 当前节点的父亲
     *          param {Object} options.globalParam 全局用的参数，在遍历的任何环节可以填入
     *          param {Object} options.parentParam
     *              先序遍历时，此对象用于在callback中取出父节点传递来的数据
     *              后序遍历时，此对象用于在callback中填入的要传递给父节点的数据
     *          param {Object} options.childrenParam 
     *              先序遍历时，此对象用于在callback中填入的要传递给子节点的数据
     *              后序遍历时，此对象用于在callback中取出子节点传递来的数据
     *          return {number} 如果为STOP_ALL_TRAVEL则停止所有遍历，
     *              如果为STOP_SUB_TREE_TRAVEL则停止遍历当前子树
     * @param {string} childrenField 子节点列表属性名，缺省为'children'
     * @param {boolean} postorder true则先序遍历（缺省值），false则后序遍历
     * @param {Object} globalParam 全局参数
     */
    COLLECTION.travelTree = function (
        travelRoot, callback, childrenField, postorder, globalParam
    ) {
        $travelTree(
            travelRoot, 
            callback, 
            childrenField, 
            postorder, 
            0, 
            null, 
            { index:0 }, 
            {}, 
            {}, 
            globalParam || {}
        );
    }

    // 用于停止所有遍历
    COLLECTION.STOP_ALL_TRAVEL = 1; 
    // 用于停止遍历当前子树
    COLLECTION.STOP_SUB_TREE_TRAVEL = 2; 
    
    function $travelTree(
        travelRoot, 
        callback, 
        childrenField, 
        postorder, 
        level, 
        parent, 
        indexRef, 
        inToChildrenParam, 
        inToParentParam, 
        globalParam
    ) {
        if (travelRoot == null) {
            return;
        }
            
        postorder = !!postorder;
        
        var conti;
        var toChildrenParam;
        var toParentParam;

        if (!postorder) {
            conti = callback.call(
                null, 
                travelRoot, 
                {
                    level: level, 
                    index: indexRef.index, 
                    parent: parent, 
                    childrenParam: (toChildrenParam = {}), 
                    parentParam: inToChildrenParam,
                    globalParam: globalParam
                }
            );
            indexRef.index ++;
        }
        
        if (conti === COLLECTION.STOP_ALL_TRAVEL) {
            return conti; 
        }
        if (conti === COLLECTION.STOP_SUB_TREE_TRAVEL) { 
            return; 
        }
        
        var children = travelRoot[childrenField || 'children'] || [];
        for (var i = 0, len = children.length, node; i < len; i ++) {
            node = children[i];
            
            conti = $travelTree(
                node, 
                callback, 
                childrenField, 
                postorder, 
                level + 1, 
                travelRoot, 
                indexRef, 
                toChildrenParam, 
                (toParentParam = {}), 
                globalParam
            );
                
            if (conti === COLLECTION.STOP_ALL_TRAVEL) { 
                return conti; 
            }
        }
        
        if (postorder && conti !== COLLECTION.STOP_ALL_TRAVEL) { 
            conti = callback.call(
                null, 
                travelRoot, 
                {
                    level: level, 
                    index: indexRef.index, 
                    parent: parent, 
                    childrenParam: toParentParam, 
                    parentParam: inToParentParam,
                    globalParam: globalParam
                }
            );
            indexRef.index ++;
        }
        
        if (conti === COLLECTION.STOP_ALL_TRAVEL) { 
            return conti; 
        }
    };    

})();
/**
 * xutil.date
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:   时间相关工具函数集合。
 *          便于工程中统一时间格式，并提供时间相关的数学操作。
 * @author: sushuang(sushuang)
 * @depend: xutil.lang, xutil.number
 */

(function () {
    
    var DATE = xutil.date;
    var LANG = xutil.lang;
    var NUMBER = xutil.number;
        
    var DAY_MILLISECOND = 24*60*60*1000;
    
    /**
     * 默认通用的日期字符串格式为：
     * 'yyyy-MM-dd hh:mm'或'yyyy-MM-dd'或'yyyy-MM'或'yyyy'，
     * 如果要修改默认日期格式，修改如下诸属性。
     *
     * @type {string}
     * @public
     */
    DATE.DATE_FORMAT = 'yyyy-MM-dd';
    DATE.MINUTE_FORMAT = 'yyyy-MM-dd hh:mm';
    
    /**
     * 日期对象转换成字符串的简写
     * 
     * @public
     * @param {Date} currDate 日期对象
     * @param {string} format 格式，缺省为yyyy-MM-dd
     * @return {string} 日期字符串
     */
    DATE.dateToString = function (date, format) {
        if (!date) { return ''; }
        format = format || DATE.DATE_FORMAT;
        return DATE.format(date, format);
    };
    
    /**
     * 日期对象转换成字符串的简写，到分钟精度
     * 
     * @public
     * @param {Date} date 日期对象
     * @param {string} format 格式，缺省为yyyy-MM-dd
     * @return {string} 日期字符串
     */
    DATE.dateToStringM = function (date) {
        return DATE.dateToString(date, DATE.MINUTE_FORMAT);
    };
    
    
    /**
     * 字符串转换成日期对象的简写
     * 
     * @public
     * @param {string} dateStr 字符串格式的日期，yyyy-MM-dd 或  yyyy-MM 或 yyyy
     * @return {Date} 日期对象，如果输入为空则返回null
     */
    DATE.stringToDate = function (dateStr) {
        if (dateStr) {
            return DATE.parse(dateStr);
        }
        return null;
    };
    
    /**
     * 得到昨天的日期对象
     * 
     * @public
     * @param {Date} date 目标日期对象
     * @return {Date} 结果
     */
    DATE.getYesterday = function (date) {
        if (!date) { return null; }
        return DATE.addDay(date, -1, true);
    };
    
    /**
     * 得到昨天的日期字符串
     * 
     * @public
     * @param {Date} date 目标日期对象
     * @return {string} 结果
     */
    DATE.getYesterdayString = function (date) {
        if (!date) { return null; }
        return DATE.dateToString(DATE.getYesterday(date));
    };
    
    /**
     * 得到周末
     * 
     * @public
     * @param {Date} date 目标日期对象
     * @param {boolean=} mode 
     *      true:得到星期六作为周末   false:得到星期日作为周末（默认）
     * @param {boolean=} remain 为false则新建日期对象（默认）；
     *                         为true则在输入的日期对象中改；
     *                         缺省为false
     */
    DATE.getWeekend = function (date, mode, remain) {
        var weekend = remain ? date : new Date(date);
        var offset = mode 
                ? (6 - weekend.getDay()) 
                : (7 - weekend.getDay()) % 7;
        weekend.setDate(weekend.getDate() + offset);
        return weekend;
    }
    
    /**
     * 得到周开始日期
     * 
     * @public
     * @param {Date} date 目标日期对象
     * @param {boolean=} mode 
     *      true:得到星期日作为周开始   false:得到星期一作为周开始（默认）
     * @param {boolean=} remain 为false则新建日期对象（默认）；
     *                         为true则在输入的日期对象中改；
     *                         缺省为false
     */
    DATE.getWorkday = function (date, mode, remain) {
        var workday = remain ? date : new Date(date);
        var d = workday.getDate();
        d = mode 
                ? (d - workday.getDay()) 
                : (d - (6 + workday.getDay()) % 7);
        workday.setDate(d);
        return workday;
    }
    
    /**
     * 获得某天是当前年的第几天
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @return {number} 结果天数
     */
    DATE.dateCountFromYearBegin = function (date) {
        if (!date) { return null; }
        LANG.isString(date) && (date = DATE.stringToDate(date)); 
        var startDate = new Date(date.getTime());
        startDate.setDate(1);
        startDate.setMonth(0);
        return DATE.dateMinus(date, startDate) + 1;
    };
    
    /**
     * 获得某天是当前季度的第几天
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @return {number} 结果天数
     */
    DATE.dateCountFromQuarterBegin = function (date) {
        if (!date) { return null; }
        LANG.isString(date) && (date = DATE.stringToDate(date)); 
        return DATE.dateMinus(date, DATE.getQuarterBegin(date)) + 1;
    };
    
    /**
     * 获得某天是当前月的第几天
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @return {number} 结果天数
     */
    DATE.dateCountFromMonthBegin = function (date) {
        if (!date) { return null; }
        LANG.isString(date) && (date = DATE.stringToDate(date)); 
        var startDate = new Date(date.getTime());
        startDate.setDate(1);
        return DATE.dateMinus(date, startDate) + 1;
    };
    
    /**
     * 获得某日期属于哪个季度，1~4
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @return {number} 季度号，1~4
     */
    DATE.getQuarter = function (date) {
        if (!date) { return null; }
        LANG.isString(date) && (date = DATE.stringToDate(date)); 
        return Math.floor(date.getMonth() / 3) + 1 ;
    };
    
    /**
     * 获得该季度的第一天
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @return {Date} 该季度的第一天
     */
    DATE.getQuarterBegin = function (date) {
        if (!date) { return null; }
        LANG.isString(date) && (date = DATE.stringToDate(date)); 
        var quarter = DATE.getQuarter(date);
        var mon = [0, 0, 3, 6, 9];
        return new Date(date.getFullYear(), mon[quarter], 1);
    };

    
    /**
     * 比较日期相同与否（两者有一者为空就认为是不同）
     * 
     * @public
     * @param {(string|Date)} date1 目标日期对象或日期字符串1
     * @param {(string|Date)} date2 目标日期对象或日期字符串2
     * @return {string} 比较结果
     */
    DATE.sameDate = function (date1, date2) {
        if (!date1 || !date2) { return false; }
        LANG.isString(date1) && (date1 = DATE.stringToDate(date1));
        LANG.isString(date2) && (date2 = DATE.stringToDate(date2));
        return date1.getFullYear() == date2.getFullYear() 
               && date1.getMonth() == date2.getMonth()
               && date1.getDate() == date2.getDate();
    };
    
    /**
     * 比较日期大小
     * 
     * @public
     * @param {(string|Date)} date1 目标日期对象或日期字符串1
     * @param {(string|Date)} date2 目标日期对象或日期字符串2
     * @return {string} 比较结果，
     *      -1: date1 < date2;  0: date1 == date2;  1: date1 > date2
     */
    DATE.compareDate = function (date1, date2) {
        var year1;
        var year2;
        var month1;
        var month2;
        var date1;
        var date2;

        LANG.isString(date1) && (date1 = DATE.stringToDate(date1));
        LANG.isString(date2) && (date2 = DATE.stringToDate(date2));
        if ((year1 = date1.getFullYear()) == (year2 = date2.getFullYear())) {
            if ((month1 = date1.getMonth()) == (month2 = date2.getMonth())) {
                if ((date1 = date1.getDate()) == (date2 = date2.getDate())) {
                    return 0;
                } 
                else { return date1 < date2 ? -1 : 1; }
            } 
            else { return month1 < month2 ? -1 : 1; }
        } 
        else { return year1 < year2 ? -1 : 1; }
    };
    
    /**
     * 用日做减法：date1 - date2
     * 如：date1为2012-03-13，date2为2012-03-15，则结果为-2。1.3天算2天。
     * 
     * @public
     * @param {(string|Date)} date1 目标日期对象或日期字符串1
     * @param {(string|Date)} date2 目标日期对象或日期字符串2
     * @return {string} 比较结果，
     *      -1: date1 < date2;  0: date1 == date2;  1: date1 > date2
     * @return {number} 减法结果天数
     */
    DATE.dateMinus = function (date1, date2) {
        // 格式化成一天最开始
        date1 = DATE.stringToDate(DATE.dateToString(date1)); 
        // 格式化成一天最开始
        date2 = DATE.stringToDate(DATE.dateToString(date2)); 
        var t = date1.getTime() - date2.getTime();
        var d = Math.round(t / DAY_MILLISECOND);
        return d;
    };
    
    /**
     * 增加天
     * 
     * @public
     * @param {Date} date 目标日期对象
     * @param {number} num 增加的天数，可为负数
     * @param {boolean} willNew 为true则新建日期对象；
     *                          为false则在输入的日期对象中改；
     *                          缺省为false
     * @return {Date} 结果
     */
    DATE.addDay = function (date, num, willNew) {
        if (!date) { return null; }
        num = num || 0;
        if (willNew) {
            return new Date(date.getTime() + num * DAY_MILLISECOND);
        } 
        else {
            date.setDate(date.getDate() + num);
            return date;
        }
    };
    
    /**
     * 增加月
     * 
     * @public
     * @param {Date} date 目标日期对象
     * @param {number} num 增加的月数，可为负数
     * @param {boolean} willNew 为true则新建日期对象；
     *                          为false则在输入的日期对象中改；
     *                          缺省为false
     * @return {Date} 结果
     */    
    DATE.addMonth = function (date, num, willNew) {
        if (!date) { return null; }
        num = num || 0;
        willNew && (date = new Date(date.getTime()));
        date.setMonth(date.getMonth() + num);
        return date;
    };  
    
    /**
     * 得到某日加num个月是几月
     * 
     * @public
     * @param {(string|Date)} date
     * @param {number} num 任意整数值，可以为负值
     * @return {Object} 
     *              {number} year 年
     *              {number} month 月号：1~12
     */
    DATE.nextMonth = function (date, num) {
        var year = date.getFullYear();
        var month = date.getMonth();
        return {
            year: year + Math.floor((month + num) / 12),
            month: (month + num + Math.abs(num * 12)) % 12 + 1
        }
    };
    
    /**
     * 得到某日加num个季度是几季度
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @param {number} num 任意整数值，可为负值
     * @return {Object} 
     *              {number} year 年
     *              {number} quarter 季度号：1~4
     */
    DATE.nextQuarter = function (date, num) {
        if (!date) { return null; }
        LANG.isString(date) && (date = DATE.stringToDate(date));

        var quarter = DATE.getQuarter(date);
        var year = date.getFullYear();
        return {
            year: year + Math.floor((quarter - 1 + num) / 4),
            quarter: (quarter - 1 + num + Math.abs(num * 4)) % 4 + 1
        };
    };
    
    /**
     * 返回某日的星期几字符串
     * 
     * @public
     * @param {(string|Date)} date 目标日期
     * @param {string} weekPrefix 星期几字符串前缀，缺省为'周'
     * @return {string} 星期几字符串
     */
    DATE.getDay = function (date, weekPrefix) {
        if (!date) { return ''; }
        LANG.isString(date) && (date = DATE.stringToDate(date));
        weekPrefix = weekPrefix || '周';
        var ret;
        switch (date.getDay()) {
            case 1: ret = weekPrefix + '一'; break;
            case 2: ret = weekPrefix + '二'; break;
            case 3: ret = weekPrefix + '三'; break;
            case 4: ret = weekPrefix + '四'; break;
            case 5: ret = weekPrefix + '五'; break;
            case 6: ret = weekPrefix + '六'; break;
            case 0: ret = weekPrefix + '日'; break;
            default: ret = ''; break;
        }
        return ret;
    };
    
    /**
     * 对目标日期对象进行格式化 (@see tangram)
     * 格式表达式，变量含义：
     * hh: 带 0 补齐的两位 12 进制时表示
     * h: 不带 0 补齐的 12 进制时表示
     * HH: 带 0 补齐的两位 24 进制时表示
     * H: 不带 0 补齐的 24 进制时表示
     * mm: 带 0 补齐两位分表示
     * m: 不带 0 补齐分表示
     * ss: 带 0 补齐两位秒表示
     * s: 不带 0 补齐秒表示
     * yyyy: 带 0 补齐的四位年表示
     * yy: 带 0 补齐的两位年表示
     * MM: 带 0 补齐的两位月表示
     * M: 不带 0 补齐的月表示
     * dd: 带 0 补齐的两位日表示
     * d: 不带 0 补齐的日表示
     * 
     * @public
     * @param {Date} source 目标日期对象
     * @param {string} pattern 日期格式化规则
     * @return {string} 格式化后的字符串
     */
    DATE.format = function (source, pattern) {
        var pad = NUMBER.pad;
        if (!LANG.isString(pattern)) {
            return source.toString();
        }
    
        function replacer(patternPart, result) {
            pattern = pattern.replace(patternPart, result);
        }
        
        var year    = source.getFullYear();
        var month   = source.getMonth() + 1;
        var date2   = source.getDate();
        var hours   = source.getHours();
        var minutes = source.getMinutes();
        var seconds = source.getSeconds();
    
        replacer(/yyyy/g, pad(year, 4));
        replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
        replacer(/MM/g, pad(month, 2));
        replacer(/M/g, month);
        replacer(/dd/g, pad(date2, 2));
        replacer(/d/g, date2);
    
        replacer(/HH/g, pad(hours, 2));
        replacer(/H/g, hours);
        replacer(/hh/g, pad(hours % 12, 2));
        replacer(/h/g, hours % 12);
        replacer(/mm/g, pad(minutes, 2));
        replacer(/m/g, minutes);
        replacer(/ss/g, pad(seconds, 2));
        replacer(/s/g, seconds);
    
        return pattern;
    };
    
    
    /**
     * 将目标字符串转换成日期对象 (@see tangram)
     * 对于目标字符串，下面这些规则决定了 parse 方法能够成功地解析：
     * 短日期可以使用“/”或“-”作为日期分隔符，但是必须用月/日/年的格式来表示，例如"7/20/96"。
     * 以 "July 10 1995" 形式表示的长日期中的年、月、日可以按任何顺序排列，年份值可以用 2 位数字表示也可以用 4 位数字表示。如果使用 2 位数字来表示年份，那么该年份必须大于或等于 70。
     * 括号中的任何文本都被视为注释。这些括号可以嵌套使用。
     * 逗号和空格被视为分隔符。允许使用多个分隔符。
     * 月和日的名称必须具有两个或两个以上的字符。如果两个字符所组成的名称不是独一无二的，那么该名称就被解析成最后一个符合条件的月或日。例如，"Ju" 被解释为七月而不是六月。
     * 在所提供的日期中，如果所指定的星期几的值与按照该日期中剩余部分所确定的星期几的值不符合，那么该指定值就会被忽略。例如，尽管 1996 年 11 月 9 日实际上是星期五，"Tuesday November 9 1996" 也还是可以被接受并进行解析的。但是结果 date 对象中包含的是 "Friday November 9 1996"。
     * JScript 处理所有的标准时区，以及全球标准时间 (UTC) 和格林威治标准时间 (GMT)。 
     * 小时、分钟、和秒钟之间用冒号分隔，尽管不是这三项都需要指明。"10:"、"10:11"、和 "10:11:12" 都是有效的。
     * 如果使用 24 小时计时的时钟，那么为中午 12 点之后的时间指定 "PM" 是错误的。例如 "23:15 PM" 就是错误的。 
     * 包含无效日期的字符串是错误的。例如，一个包含有两个年份或两个月份的字符串就是错误的。
     *             
     * @public
     * @param {string} source 目标字符串
     * @return {Date} 转换后的日期对象
     */
    DATE.parse = function (source) {
        var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
        if ('string' == typeof source) {
            if (reg.test(source) || isNaN(Date.parse(source))) {
                var d = source.split(/ |T/);
                var d1 = d.length > 1 
                        ? d[1].split(/[^\d]/)
                        : [0, 0, 0];
                var d0 = d[0].split(/[^\d]/);
                
                return new Date(
                    d0[0],
                    (d0[1] != null ? (d0[1] - 1) : 0 ), 
                    (d0[2] != null ? d0[2] : 1), 
                    (d1[0] != null ? d1[0] : 0), 
                    (d1[1] != null ? d1[1] : 0), 
                    (d1[2] != null ? d1[2] : 0)
                );
            } 
            else {
                return new Date(source);
            }
        }
        
        return new Date();
    };

})();
/**
 * xutil.dom
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    DOM相关工具函数
 * @author:  sushuang(sushuang)
 */

(function () {
    
    var DOM = xutil.dom;
    var objProtoToString = Object.prototype.toString;
    var TRIMER_REG = new RegExp(
            "(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"
        );
    var SPACE_REG = /\s/;
    var USER_AGENT = navigator.userAgent;
    var DOCUMENT = document;
    var REGEXP = RegExp;

    DOM.isStrict = DOCUMENT.compatMode == 'CSS1Compat';
    DOM.ieVersion = /msie (\d+\.\d)/i.test(USER_AGENT) 
        ? DOCUMENT.documentMode || (REGEXP.$1 - 0) : undefined;
    DOM.firefoxVersion = /firefox\/(\d+\.\d)/i.test(USER_AGENT) 
        ? REGEXP.$1 - 0 : undefined;
    DOM.operaVersion = /opera\/(\d+\.\d)/i.test(USER_AGENT) 
        ? REGEXP.$1 - 0 : undefined;
    DOM.safariVersion = /(\d+\.\d)(\.\d)?\s+safari/i.test(USER_AGENT) 
        && !/chrome/i.test(USER_AGENT) ? REGEXP.$1 - 0 : undefined;
    
    /**
     * 从文档中获取指定的DOM元素 (@see tangram)
     * 
     * @public
     * @param {(string|HTMLElement)} id 元素的id或DOM元素
     * @return {(HTMLElement|null)} 获取的元素，查找不到时返回null
     */
    DOM.g = function (id) {
        if (objProtoToString.call(id) == '[object String]') {
            return document.getElementById(id);
        } 
        else if (id && id.nodeName && (id.nodeType == 1 || id.nodeType == 9)) {
            return id;
        }
        return null;
    };
    
    /**
     * 通过className获取元素 
     * （不保证返回数组中DOM节点的顺序和文档中DOM节点的顺序一致）
     * @public
     * 
     * @param {string} className 元素的class，只能指定单一的class，
     *          如果为空字符串或者纯空白的字符串，返回空数组。
     * @param {(string|HTMLElement)} element 开始搜索的元素，默认是document。
     * @return {Array} 获取的元素集合，查找不到或className参数错误时返回空数组.
     */
    DOM.q = function (className, element) {
        var result = [];

        if (!className 
            || !(className = String(className).replace(TRIMER_REG, ''))
        ) {
            return result;
        }
        
        if (element == null) {
            element = document;
        } 
        else if (!(element = DOM.g(element))) {
            return result;
        }
        
        if (element.getElementsByClassName) {
            return element.getElementsByClassName(className);
        } 
        else {
            var elements = element.all || element.getElementsByTagName("*");
            for (var i = 0, node, clzz; node = elements[i]; i++) {
                if ((clzz = node.className) != null) {
                    var startIndex = clzz.indexOf(className);
                    var endIndex = startIndex + className.length;
                    if (startIndex >= 0
                        && (
                            clzz.charAt(startIndex - 1) == '' 
                            || SPACE_REG.test(clzz.charAt(startIndex - 1))
                        )
                        && (
                            clzz.charAt(endIndex) == '' 
                            || SPACE_REG.test(clzz.charAt(endIndex))
                        )
                    ) {
                        result[result.length] = node;
                    }
                }
            }
        }
    
        return result;
    };

    /**
     * 为 Element 对象添加新的样式。
     * 
     * @public
     * @param {HTMLElement} el Element 对象
     * @param {string} className 样式名，可以是多个，中间使用空白符分隔
     */
    DOM.addClass = function (el, className) {
        // 这里直接添加是为了提高效率，因此对于可能重复添加的属性，请使用标志位判断是否已经存在，
        // 或者先使用 removeClass 方法删除之前的样式
        el.className += ' ' + className;
    };

    /**
     * 删除 Element 对象中的样式。
     * 
     * @public
     * @param {HTMLElement} el Element 对象
     * @param {string} className 样式名，可以是多个，中间用空白符分隔
     */
    DOM.removeClass = function (el, className) {
        var oldClasses = el.className.split(/\s+/).sort();
        var newClasses = className.split(/\s+/).sort();
        var i = oldClasses.length;
        var j = newClasses.length;

        for (; i && j; ) {
            if (oldClasses[i - 1] == newClasses[j - 1]) {
                oldClasses.splice(--i, 1);
            }
            else if (oldClasses[i - 1] < newClasses[j - 1]) {
                j--;
            }
            else {
                i--;
            }
        }
        el.className = oldClasses.join(' ');
    };    

    /**
     * 获取 Element 对象的父 Element 对象。
     * 在 IE 下，Element 对象被 removeChild 方法移除时，parentNode 仍然指向原来的父 Element 对象，
     * 并且input的parentNode可能为空。
     * 与 W3C 标准兼容的属性应该是 parentElement。
     *
     * @public
     * @param {HTMLElement} el Element 对象
     * @return {HTMLElement} 父 Element 对象，如果没有，返回 null
     */
    DOM.getParent = DOM.ieVersion 
        ? function (el) {
            return el.parentElement;
        } 
        : function (el) {
            return el.parentNode;
        };

    /**
     * 获取子节点
     *
     * @public
     * @param {HTMLElement} el Element 对象
     * @return {Array.<HTMLElement>} 子节点列表
     */
    DOM.children = function (el) {
        if (!el) { return []; }

        for (var result = [], o = el.firstChild; o; o = o.nextSibling) {
            if (o.nodeType == 1) {
                result.push(o);
            }
        }
        return result;    
    };

    /**
     * 删除
     *
     * @public
     * @param {HTMLElement} el Element 对象
     */
    DOM.remove = function (el) {
        if (el) {
            var tmpEl = el.parentNode;
            tmpEl && tmpEl.removeChild(el);
        }
    }

})();

/**
 * xutil.file
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    文件相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  none
 */

(function () {
    
    var FILE = xutil.file;
            
    /**
     * 过滤文件名的非法字符
     * 只考虑了windows和linux
     * windows文件名非法字符：\/:*?"<>|
     * linux文件名非法字符：/
     */
    FILE.FILE_NAME_FORBIDEN_CHARACTER = {
        '\\' : '＼',
        '/' : '／',
        ':' : '：',
        '*' : '＊',
        '?' : '？', 
        '"' : '＂',
        '<' : '＜',
        '>' : '＞',
        '|' : '｜'
    };
    
    /**
     * 修正文件名
     * 只考虑了windows和linux，
     * 有些字符被禁止做文件名，用类似的字符（如对应的全角字符）替代。
     * 
     * @public
     * @param {string} name 日期对象
     * @return {string} 修正后的文件名
     */    
    FILE.fixFileName = function (name) {
        if (name == null) {
            return name;
        }
        return name.replace(
            /./g, 
            function (w) {
                return FILE.FILE_NAME_FORBIDEN_CHARACTER[w] || w;
            }
        );
    };
    
})();
/**
 * xutil.fn
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    函数相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  xutil.lang
 */

(function () {
    
    var FN = xutil.fn;
    var LANG = xutil.lang;
    var slice = Array.prototype.slice;
    var nativeBind = Function.prototype.bind;
    
    /**
     * 为一个函数绑定一个作用域
     * 如果可用，使用**ECMAScript 5**的 native `Function.bind`
     * 
     * @public
     * @param {Function|string} func 要绑定的函数，缺省则为函数本身
     * @param {Object} context 作用域
     * @param {Any...} 绑定附加的执行参数，可缺省
     * @rerturn {Funtion} 绑定完得到的函数
     */
    FN.bind = function (func, context) {
        var args;
        if (nativeBind && func.bind === nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        func = LANG.isString(func) ? context[func] : func;
        args = slice.call(arguments, 2);
        return function () {
            return func.apply(
                context || func, args.concat(slice.call(arguments))
            );
        };
    };

})();
/**
 * xutil.graphic
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    图形图像相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  none
 */

(function () {
    
    var GRAPHIC = xutil.graphic; 

    /**
     * 合并外界矩形
     *
     * @public
     * @param {Object...} bound...，可传入多个。
     *      bound格式：{left:..,top:..,width:..height:..}
     * @return {Object} 最大外界构成的新bound。如果为null则表示输入全为空。
     */
    GRAPHIC.unionBoundBox = function () {
        var left;
        var top;
        var right;
        var bottom;
        var width;
        var height;
        var bound = null, subBound;

        for(var i = 0, l = arguments.length; i < l; i ++) {
            if( !( subBound = arguments[i])) {
                continue;
            }

            if( !bound) {
                bound = subBound;
            } 
            else {
                left = subBound.left < bound.left 
                    ? subBound.left : bound.left;
                top = subBound.top < bound.top 
                    ? subBound.top : bound.top;
                right = subBound.left + subBound.width;
                width = right > bound.left + bound.width 
                    ? right - bound.left : bound.width;
                bottom = subBound.top + subBound.height;
                height = bottom > bound.top + bound.height 
                    ? bottom - bound.top : bound.height;
                bound.left = left;
                bound.top = top;
                bound.width = width;
                bound.height = height;
            }
        }
        return bound;
    };

})();
        
/**
 * xutil.lang
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    基本工具函数
 * @author:  sushuang(sushuang)
 * @depend:  xutil.lang, xutil.string
 */

(function () {
    
    var LANG = xutil.lang;
    var STRING = xutil.string;
    var objProto = Object.prototype;
    var objProtoToString = objProto.toString;
    var hasOwnProperty = objProto.hasOwnProperty;
 
    /**
     * 判断变量是否有值
     * null或undefined时返回false。
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */
    LANG.hasValue = function (variable) {
        // undefined和null返回true，其他都返回false
        return variable != null;
    };
    
    /**
     * 判断变量是否有值，且不是空白字符串
     * null或undefined时返回false。
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */
    LANG.hasValueNotBlank = function (variable) {
        return LANG.hasValue(variable)
           && (!LANG.isString(variable) || STRING.trim(variable) != '');
    };

    /**
     * 判断变量是否是空白
     * 如果variable是string，则判断其是否是空字符串或者只有空白字符的字符串
     * 如果variable是Array，则判断其是否为空
     * 如果variable是Object，则判断其是否全没有直接属性（原型上的属性不计）
     * 
     * @public
     * @param {(string|Array|Object)} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isBlank = function (variable) {
        if (LANG.isString(variable)) { 
            return trim(variable) == '';
        } 
        else if (LANG.isArray(variable)) {
            return variable.length == 0;
        } 
        else if (LANG.isObject(variable)) {
            for (var k in variable) {
                if (hasOwnProperty.call(variable, k)) {
                    return false;   
                }
            }
            return true;
        } 
        else {
            return !!variable;
        }
    };

    /**
     * 判断变量是否为undefined
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isUndefined = function (variable) {
        return typeof variable == 'undefined';
    };
    
    /**
     * 判断变量是否为null
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isNull = function (variable) {
        return variable === null;
    };
    
    /**
     * 判断变量是否为number
     * NaN和Finite时也会返回true。
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isNumber = function (variable) {
        return objProtoToString.call(variable) == '[object Number]';
    };
    
    /**
     * 判断变量是否为number
     * NaN和Finite时也会返回false。
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isNormalNumber = function (variable) {
        return LANG.isNumber(variable) 
            && !isNaN(variable) && isFinite(variable);
    };

    /**
     * 判断变量是否为Finite
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isFinite = function (variable) {
        return LANG.isNumber(variable) && isFinite(variable);
    };
    
    /**
     * 判断变量是否为NaN
     * 不同于js本身的isNaN，undefined情况不会返回true
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isNaN = function (variable) {
        // NaN是唯一一个对于'==='操作符不自反的
        return variable !== variable;
    };

    /**
     * 判断变量是否为string
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isString = function (variable) {
        return objProtoToString.call(variable) == '[object String]';
    };
    
    /**
     * 判断变量是否为boolean
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isBoolean = function (variable) {
        return variable === true 
            || variable === false 
            || objProtoToString.call(variable) == '[object Boolean]';        
    };
    
    /**
     * 判断是否为Function
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isFunction = function (variable) {
        return objProtoToString.call(variable) == '[object Function]';
    };
    
    /**
     * 判断是否为Object
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isObject = function (variable) {
         return variable === Object(variable);
    };
    
    /**
     * 判断是否为Array
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isArray = Array.isArray || function (variable) {
        return objProtoToString.call(variable) == '[object Array]';
    };
       
    /**
     * 判断是否为Date
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isDate = function (variable) {
        return objProtoToString.call(variable) == '[object Date]';
    };  
    
    /**
     * 判断是否为RegExp
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */    
    LANG.isRegExp = function (variable) {
        return objProtoToString.call(variable) == '[object RegExp]';
    };  
    
    /**
     * 判断是否为DOM Element
     * 
     * @public
     * @param {*} variable 输入变量
     * @return {boolean} 判断结果
     */
    LANG.isElement = function (variable) {
        return !!(variable && variable.nodeType == 1);
    };
      
    /**
     * 转换为number
     * 此函数一般用于string类型的数值向number类型数值的转换, 如：'123'转换为123, '44px'转换为44
     * 遵循parseFloat的法则
     * 转换失败返回默认值（从而避免转换失败后返回NaN等）。
     * 
     * @public
     * @param {*} input 要转换的东西
     * @param {*} defaultValue 转换失败时，返回此默认值。如果defaultValue为undefined则返回input本身。
     * @return {(number|*)} 转换结果。转换成功则为number；转换失败则为defaultValue
     */
    LANG.toNumber = function (input, defaultValue) {
        defaultValue = 
            typeof defaultValue != 'undefined' ? defaultValue : input;
        return isFinite(input = parseFloat(input)) ? input : defaultValue;
    };
    
    /**
     * 用于将string类型的"true"和"false"转成boolean型
     * 如果输入参数是string类型，输入参数不为"true"时均转成false。
     * 如果输入参数不是string类型，则按照js本身的强制类型转换转成boolean（从而可以应对不知道input类型的情况）。
     * 
     * @public
     * @param {(string|*)} input 要转换的东西
     * @return {boolean} 转换结果
     */
    LANG.stringToBoolean = function (input) {
        if (LANG.isString(input)) {
            return trim(input) == 'true';
        } 
        else {
            return !!input; 
        }
    };

})();
/**
 * xutil.number
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    数值相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  none
 */

(function () {
    
    var NUMBER = xutil.number;
            
    /**
     * 得到序数词(1st, 2nd, 3rd, 4th, ...)的英文后缀
     * 
     * @public
     * @param {number} number 序数的数值
     * @return {string} 序数词英文后缀
     */    
    NUMBER.ordinalSuffix = function (number) {
        if (number == 1) {
            return 'st';
        } 
        else if (number == 2) {
            return 'nd';
        } 
        else if (number == 3) {
            return 'rd';
        } 
        else {
            return 'th';
        }
    };
    
    /**
     * 数值前部补0
     * 
     * @public
     * @param {(number|string)} source 输入数值, 可以整数或小数
     * @param {number} length 输出数值长度
     * @return {string} 输出数值
     */
    NUMBER.pad = function (source, length) {
        var pre = "";
        var negative = (source < 0);
        var string = String(Math.abs(source));
    
        if (string.length < length) {
            pre = (new Array(length - string.length + 1)).join('0');
        }
    
        return (negative ?  "-" : "") + pre + string;
    };
    
    /**
     * 将数值按照指定格式进行格式化
     * 支持：
     *      三位一撇，如：'23,444,12.98'
     *      前后缀，如：'23,444$', '23,444%', '#23,444'
     *      四舍五入
     *      四舍六入中凑偶（IEEE 754标准，欧洲金融常用）
     *      正数加上正号，如：'+23.45%'
     *      
     * @public
     * @example formatNumber(10000/3, "I,III.DD%"); 返回"3,333.33%"
     * @param {number} num 要格式化的数字
     * @param {string} formatStr 指定的格式
     *              I代表整数部分,可以通过逗号的位置来设定逗号分隔的位数 
     *              D代表小数部分，可以通过D的重复次数指定小数部分的显示位数
     * @param {string} usePositiveSign 是否正数加上正号
     * @param {number} cutMode 舍入方式：
     *                      0或默认:四舍五入；
     *                      2:IEEE 754标准的五舍六入中凑偶；
     *                      other：只是纯截取
     * @param {boolean} percentMultiply 百分数（formatStr满足/[ID]%/）是否要乘以100
     *                      默认为false
     * @return {string} 格式化过的字符串
     */
    NUMBER.formatNumber = function (
        num, formatStr, usePositiveSign, cutMode, percentMultiply
    ) {
        if (!formatStr) {
            return num;
        }

        if (percentMultiply && /[ID]%/.test(formatStr)) {
            num = num * 100;
        }

        num = NUMBER.fixNumber(num, formatStr, cutMode); 
        var str;
        var numStr = num.toString();
        var tempAry = numStr.split('.');
        var intStr = tempAry[0];
        var decStr = (tempAry.length > 1) ? tempAry[1] : "";
            
        str = formatStr.replace(/I+,*I*/g, function () {
            var matchStr = arguments[0];
            var commaIndex = matchStr.lastIndexOf(",");
            var replaceStr;
            var splitPos;
            var parts = [];
                
            if (commaIndex >= 0 && commaIndex != intStr.length - 1) {
                splitPos = matchStr.length - 1 - commaIndex; 
                while (intStr.length > splitPos) {
                    parts.push(intStr.substr(intStr.length-splitPos,splitPos));
                    intStr = intStr.substring(0, intStr.length - splitPos);
                }
                parts.push(intStr);
                parts.reverse();
                if (parts[0] == "-") {
                    parts.shift();
                    replaceStr = "-" + parts.join(",");
                } 
                else {
                    replaceStr = parts.join(",");
                }
            } 
            else {
                replaceStr = intStr;
            }
            
            if (usePositiveSign && replaceStr && replaceStr.indexOf('-') < 0) {
                replaceStr = '+' + replaceStr;
            }
            
            return replaceStr;
        });
        
        str = str.replace(/D+/g, function () {
            var matchStr = arguments[0]; 
            var replaceStr = decStr;
            
            if (replaceStr.length > matchStr.length) {
                replaceStr = replaceStr.substr(0, matchStr.length);
            } 
            else {
                while (replaceStr.length < matchStr.length) {
                    replaceStr += "0";
                }
            }
            return replaceStr;
        });
        // if ( !/[1-9]+/.test(str) ) { // 全零去除加减号，都不是效率高的写法
            // str.replace(/^(\+|\-)./, '');
        // } 
        return str;
    };
    
    /**
     * 不同方式的舍入
     * 支持：
     *      四舍五入
     *      四舍六入中凑偶（IEEE 754标准，欧洲金融常用）
     * 
     * @public
     * @param {number} cutMode 舍入方式
     *                      0或默认:四舍五入；
     *                      2:IEEE 754标准的五舍六入中凑偶
     */
    NUMBER.fixNumber = function (num, formatStr, cutMode) {
        var formatDec = /D+/.exec(formatStr);
        var formatDecLen = (formatDec && formatDec.length>0) 
                ? formatDec[0].length : 0;
        var p;
            
        if (!cutMode) { // 四舍五入
            p = Math.pow(10, formatDecLen);
            return ( Math.round (num * p ) ) / p ;
        } 
        else if (cutMode == 2) { // 五舍六入中凑偶
            return Number(num).toFixed(formatDecLen);
        } 
        else { // 原样
            return Number(num);
        }
    };

})();
/**
 * xutil.object
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    对象相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  none
 */

(function () {
    
    var OBJECT = xutil.object;
    var objProtoToString = Object.prototype.toString;
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var arraySlice = Array.prototype.slice;
    
    /**
     * getByPath和setByPath的默认context。
     * 可以在工程中修改。
     */
    OBJECT.PATH_DEFAULT_CONTEXT = window;

    /**
     * 根据对象路径得到数据。
     * 默认根是window。
     * 路径中支持特殊字符（只要不和分隔符冲突即可）。
     * 路径分隔符可以定制，默认是点号和中括号。
     * 如果未取到目标，返回null。
     * 注意：此方法不会去trim路径中的空格。
     * 例如：
     *      在window中
     *      已有var obj = { asdf: { zxcv: { qwer: 12 } } };
     *      可用getByPath('obj.asdf.zxcv.qwer'); 得到数值12。
     *      已有var obj = { aaa: [123, { fff: 678 }] };（路径中有数组）
     *      可用getByPath('aaa.2.fff', obj);
     *      或getByPath('aaa[2].fff', obj);得到数值678。
     * 
     * @public
     * @param {string} path 如xxx.sss.aaa[2][3].SomeObj，
     *      如果为null或undefined，返回context。
     * @param {Object=} context 根，缺省是window，
     *     另外可使用OBJECT.PATH_DEFAULT_CONTEXT配置缺省值
     * @param {Object=} options 选项
     * @param {string=} objDelimiter 对象定界符，默认是点号
     * @param {string=} arrBegin 数组起始标志符，默认是左方括号
     * @param {string=} arrEnd 数组结束标志符，默认是右方括号
     * @return {*} 取得的数据，如上例得到SomeObj
     */
    OBJECT.getByPath = function (path, context, options) {
        options = options || {};
        context = context || OBJECT.PATH_DEFAULT_CONTEXT;

        if (path == null) { return context; }

        var arrBegin = options.arrBegin || '[';
        var arrEnd = options.arrEnd || ']';
        var pathArr = path.split(
                options.objDelimiter != null ? options.objDelimiter : '.'
            );

        for (var i = 0, j, pai, pajs, paj; i < pathArr.length; i ++) {
            pai = pathArr[i];
            pajs = pai.split(arrBegin);

            for (j = 0; j < pajs.length; j ++) {
                paj = pajs[j];
                j > 0 && (paj = paj.split(arrEnd)[0]);

                // 如果未取到目标时context就非对象了
                if (context !== Object(context)) {
                    return;
                }

                context = context[paj];
            }
        }
        return context;
    };

    /**
     * 根据对象路径设置数据。
     * 默认根是window。
     * 如果路径中没有对象/数组，则创建之。
     * 路径中支持特殊字符（只要不和分隔符冲突即可）。
     * 路径分隔符可以定制，默认是点号和中括号。
     * 注意：此方法不会去trim路径中的空格。
     * 例如：
     *      可用setByPath('obj.asdf.zxcv', 12); 
     *      在window中生成对象obj，其内容为{ asdf: { zxcv: 12 } };
     *      又可用setByPath('asdf.aaa[2].fff', 678, obj);
     *      或者setByPath('obj.asdf.aaa[2].fff', 678);
     *      对obj赋值，使obj值最终为：
     *          { 
     *              asdf: { 
     *                  zxcv: 12,
     *                  aaa: [undefined, { fff: 678 }] 
     *              } 
     *          };（路径中有数组）
     * 
     * @public
     * @param {string} path 如xxx.sss.aaa[2][3].SomeObj
     * @param {*} value 要设置的值
     * @param {Object=} context 根，缺省是window
     *     另外可使用OBJECT.PATH_DEFAULT_CONTEXT配置缺省值
     * @param {Object=} options 选项
     * @param {string=} objDelimiter 对象定界符，默认是点号
     * @param {string=} arrBegin 数组起始标志符，默认是左方括号
     * @param {string=} arrEnd 数组结束标志符，默认是右方括号
     * @param {string=} conflict 当路径冲突时的处理.
     *      路径冲突指路径上已有值（即非undefined或null）但不是对象，
     *      例如假设当前已经有var obj = { a: 5 };
     *      又想setByPath('a.c.d', obj, 444)。
     *      conflict值可为：
     *          'THROW': 路径冲突时抛出异常（默认）；
     *          'IGNORE': 路径冲突时不做任何操作直接返回；
     *          'OVERLAP': 路径冲突时直接覆盖。
     */
    OBJECT.setByPath = function (path, value, context, options) {
        options = options || {};
        context = context || OBJECT.PATH_DEFAULT_CONTEXT;
        
        if (path == null) { return; }

        var arrBegin = options.arrBegin || '[';
        var arrEnd = options.arrEnd || ']';
        var conflict = options.conflict || 'THROW';
        var pathArr = path.split(
                options.objDelimiter != null ? options.objDelimiter : '.'
            );

        for (var i = 0, j, pai, pajs, paj, pv; i < pathArr.length; i ++) {
            pai = pathArr[i];
            pajs = pai.split(arrBegin);

            for (j = 0; j < pajs.length; j ++) {
                paj = pajs[j];
                j > 0 && (paj = paj.split(arrEnd)[0]);
                pv = context[paj];

                // 最终赋值
                if (i == pathArr.length - 1 && j == pajs.length - 1) {
                    context[paj] = value;
                    return;
                }
                else {
                    // 如果路径上已有值但不是对象
                    if (pv != null && pv !== Object(pv)) {
                        if (conflict == 'THROW') {
                            throw new Error('Path conflict: ' + path);
                        }
                        else if (conflict == 'IGNORE') {
                            return;
                        }
                    }

                    context = pv !== Object(pv)
                        // 如果路径上没有对象则创建
                        ? (
                            context[paj] = pajs.length > 1 && j < pajs.length - 1 
                            ? [] : {}
                        )
                        : context[paj];
                }
            }
        }
    };
    
    /**
     * 兼容性的setter，向一个对象中set数据
     * 
     * @public
     * @param {Object} container 目标对象
     * @param {string} key 关键字
     * @param {*} value 数据
     */
    OBJECT.set = function (container, key, value) {
        if (isFunction(container['set'])) {
            container['set'](key, value);
        } 
        else {
            container[key];
        }
    };

    /**
     * 在某对象中记录key/检查是否有key的方便方法
     * 
     * @public
     * @param {string=} key 如果为空，则fanhuitrue
     * @param {Object} context 需要enable/disable的对象
     * @return {boolean} 是否可以enable
     */
    OBJECT.objKey = (function () {

        /**
         * 在目标对象中会占用此成员记录key
         */
        var KEY_ATTR_NAME = '\x07__OBJ__KEY__';

        /**
         * 检查对象中是否有记录的key
         * 
         * @public
         * @param {Object} context 目标对象
         * @param {string=} key 如果为null或undefined，则返回false
         * @param {string=} keyName key种类名称，
         *      如果在对象中使用一种以上的key时，用此区别，否则缺省即可。
         * @return {boolean} 是否有key
         */
        function has(context, key, keyName) {
            if (key == null) { return false; }

            var hasKey = false;
            var keyList = getKeyList(context, keyName);

            for (var i = 0; i < keyList.length; i ++) {
                if (key == keyList[i]) {
                    hasKey = true;
                }
            }

            return hasKey;        
        }

        /**
         * 对象中key的数量
         * 
         * @public
         * @param {Object} context 目标对象
         * @param {string=} keyName key种类名称，
         *      如果在对象中使用一种以上的key时，用此区别，否则缺省即可。
         * @return {number} key的数量
         */
        function size(context, keyName) {
            return getKeyList(context, keyName).length;
        }

        /**
         * 在对象中记录key
         * 
         * @public
         * @param {Object} context 需要enable/disable的对象
         * @param {string=} key 如果为null或undefined，则不记录key
         * @param {string=} keyName key种类名称，
         *      如果在对象中使用一种以上的key时，用此区别，否则缺省即可。
         */
        function add(context, key, keyName) {
            if (key == null) { return; }

            if (!has(context, key, keyName)) {
                getKeyList(context, keyName).push(key);
            }
        }

        /**
         * 在对象中删除key
         * 
         * @public
         * @param {Object} context 需要enable/disable的对象
         * @param {string=} key 如果为null或undefined，则不删除key
         * @param {string=} keyName key种类名称，
         *      如果在对象中使用一种以上的key时，用此区别，否则缺省即可。
         */
        function remove(context, key, keyName) {
            if (key == null) { return; }

            var keyList = getKeyList(context, keyName);

            for (var i = 0; i < keyList.length; ) {
                if (key == keyList[i]) {
                    keyList.splice(i, 1);
                }
                else {
                    i ++;
                }
            }
        }

        /**
         * 得到keylist
         * 
         * @private
         * @param {Object} context 目标对象
         * @param {string=} keyName key种类名称，
         *      如果在对象中使用一种以上的key时，用此区别，否则缺省即可。
         * @return {Array} 
         */
        function getKeyList(context, keyName) {
            if (keyName == null) {
                keyName = '';
            }

            if (!context[KEY_ATTR_NAME + keyName]) {
                context[KEY_ATTR_NAME + keyName] = [];
            }

            return context[KEY_ATTR_NAME + keyName];
        }

        return {
            add: add,
            remove: remove,
            has: has,
            size: size,
            KEY_ATTR_NAME: KEY_ATTR_NAME
        };

    })();

    /**
     * 兼容性的getter，从一个对象中get数据
     * 
     * @public
     * @param {Object} container 目标对象
     * @param {string} key 关键字
     * @return {*} 数据
     */
    OBJECT.get = function (container, key) {
        if (isFunction(container['get'])) {
            return container['get'](key);
        } 
        else {
            return container[key];
        }
    };

    /**
     * 是否是空对象
     * 
     * @public
     * @param {Object} o 输入对象
     * @return {boolean} 是否是空对象
     */
    OBJECT.isEmptyObj = function (o) {    
        if (o !== Object(o)) {
            return false;
        }
        for (var i in o) {
            return false;
        }
        return true;
    };
                
    /**
     * 属性拷贝（对象浅拷贝）
     * target中与source中相同的属性会被覆盖。
     * prototype属性不会被拷贝。
     * 
     * @public
     * @usage extend(target, source1, source2, source3);
     * @param {(Object|Array)} target
     * @param {(Object|Array)...} source 可传多个对象，
     *          从第一个source开始往后逐次extend到target中
     * @return {(Object|Array)} 目标对象
     */
    OBJECT.extend = function (target) {
        var sourceList = arraySlice.call(arguments, 1);
        for (var i = 0, source, key; i < sourceList.length; i ++) {
            if (source = sourceList[i]) {
                for (key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
    
    /**
     * 属性赋值（对象浅拷贝）
     * 与extend的不同点在于，可以指定拷贝的属性，
     * 但是不能同时进行多个对象的拷贝。
     * target中与source中相同的属性会被覆盖。
     * prototype属性不会被拷贝。
     * 
     * @public
     * @param {(Object|Array)} target 目标对象
     * @param {(Object|Array)} source 源对象
     * @param {(Array.<string>|Object)} inclusion 包含的属性列表
     *          如果为{Array.<string>}，则意为要拷贝的属性名列表，
     *              如['aa', 'bb']表示将source的aa、bb属性
     *              分别拷贝到target的aa、aa上
     *          如果为{Object}，则意为属性名映射，
     *              如{'sAa': 'aa', 'sBb': 'bb'}表示将source的aa、bb属性
     *              分别拷贝到target的sAa、sBb上
     *          如果为null或undefined，
     *              则认为所有source属性都要拷贝到target中
     * @param {Array.<string>} exclusion 不包含的属性列表，
     *              如果与inclusion冲突，以exclusion为准.
     *          如果为{Array.<string>}，则意为要拷贝的属性名列表，
     *              如['aa', 'bb']表示将source的aa、bb属性分别拷贝到target的aa、aa上
     *          如果为null或undefined，则忽略此参数
     * @return {(Object|Array)} 目标对象
     */
    OBJECT.assign = function (target, source, inclusion, exclusion) {
        var i;
        var len;
        var inclusionMap = makeClusionMap(inclusion);
        var exclusionMap = makeClusionMap(exclusion);

        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                if (!inclusion) {
                    if (exclusionMap[i] == null) {
                        target[i] = source[i];
                    }
                }
                else {
                    if (inclusionMap[i] != null && exclusionMap[i] == null) {
                        target[inclusionMap[i]] = source[i];
                    }
                }
            }
        }

        return target;
    };       
    
    /**
     * 对象深拷贝
     * 原型上的属性不会被拷贝。
     * 非原型上的属性中，
     * 会进行克隆的属性：
     *      值属性
     *      数组
     *      Date
     *      字面量对象(literal object @see isPlainObject)
     * 不会进行克隆只引用拷贝的属性：
     *      其他类型对象（如DOM对象，RegExp，new somefunc()创建的对象等）
     * 
     * @public
     * @param {(Object|Array)} source 源对象
     * @param {Object=} options 选项
     * @param {Array.<string>} options.exclusion 不包含的属性列表
     * @return {(Object|Array)} 新对象
     */
    OBJECT.clone = function (source, options) {
        options = options || {};
        var result;
        var i;
        var isArr;
        var exclusionMap = makeClusionMap(options.exclusion);

        if (isPlainObject(source)
            // 对于数组也使用下面方式，把非数字key的属性也拷贝
            || (isArr = isArray(source))
        ) {
            result = isArr ? [] : {};
            for (i in source) {
                if (source.hasOwnProperty(i) && !(i in exclusionMap)) {
                    result[i] = OBJECT.clone(source[i]);
                }
            }
        } 
        else if (isDate(source)) {
            result = new Date(source.getTime());
        } 
        else {
            result = source;
        }
        return result;
    };

    /**
     * 两个对象融合
     * 
     * @public
     * @param {(Object|Array)} target 目标对象
     * @param {(Object|Array)} source 源对象
     * @param {Object} options 参数
     * @param {boolean} options.overwrite 是否用源对象的属性覆盖目标对象的属性（默认true）
     * @param {(boolean|string)} options.clone 对于对象属性，
     *      如果值为true则使用clone（默认），
     *      如果值为false则直接引用，
     *      如果值为'WITHOUT_ARRAY'，则克隆数组以外的东西
     * @param {Array.<string>} options.exclusion 不包含的属性列表
     * @return {(Object|Array)} 目标对象
     */
    OBJECT.merge = function (target, source, options) {
        options = options || {};
        var overwrite = options.overwrite;
        overwrite == null && (overwrite = true);
        var clone = options.clone;
        clone == null && (clone = true);

        var exclusionMap = makeClusionMap(options.exclusion);

        if (isPlainObject(target) && isPlainObject(source)) {
            doMerge(target, source, overwrite, clone, exclusionMap);
        }
        return target;
    };

    function doMerge(target, source, overwrite, clone, exclusionMap) {
        var s;
        var t;
        
        for (var i in source) {
            s = source[i];
            t = target[i];

            if (!(i in exclusionMap) && source.hasOwnProperty(i)) {
                if (isPlainObject(t) && isPlainObject(s)) {
                    doMerge(t, s, overwrite, clone, exclusionMap);
                } 
                else if (overwrite || !(i in target)) {
                    target[i] = clone && (
                            clone != 'WITHOUT_ARRAY' || !isArray(s)
                        )
                        ? OBJECT.clone(s) 
                        : s;
                }
            }
        }
    }

    /**
     * 类继承
     *
     * @public
     * @param {Function} subClass 子类构造函数
     * @param {Function} superClass 父类
     * @return {Object} 生成的新构造函数的原型
     */
    OBJECT.inherits = function (subClass, superClass) {
        var oldPrototype = subClass.prototype;
        var clazz = new Function();

        clazz.prototype = superClass.prototype;
        OBJECT.extend(subClass.prototype = new clazz(), oldPrototype);
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;

        return subClass.prototype;
    };

    /**
     * 模型继承
     * 生成的构造函数含有父类的构造函数的自动调用
     *
     * @public
     * @param {Function} superClass 父类，如果无父类则为null
     * @param {Function} subClassConstructor 子类的标准构造函数，
     *          如果忽略将直接调用父控件类的构造函数
     * @return {Function} 新类的构造函数
     */
    OBJECT.inheritsObject = function (superClass, subClassConstructor) {
        var agent = function (options) {
                return new agent.client(options);
            }; 
        var client = agent.client = function (options) {
                options = options || {};
                superClass && superClass.client.call(this, options);
                subClassConstructor && subClassConstructor.call(this, options);
            };
            
        superClass && OBJECT.inherits(agent, superClass);
        OBJECT.inherits(client, agent);
        client.agent = agent;

        return agent;
    };

    /**
     * 创建单例
     * 生成的构造函数含有父类的构造函数的自动调用
     *
     * @public
     * @param {Function} superClass 父类，如果无父类则为null
     * @param {Function} subClassConstructor 子类的标准构造函数，
     *          如果忽略将直接调用父控件类的构造函数
     * @return {Function} 新类的构造函数
     */
    OBJECT.createSingleton = function (superClass, subClassConstructor) {
        var instance;
        var agent = function (options) {
                return instance || (instance = new agent.client(options));
            };
        var client = agent.client = function (options) {
                options = options || {};
                superClass && superClass.client.call(this, options);
                subClassConstructor && subClassConstructor.call(this, options);
            };
            
        superClass && OBJECT.inherits(agent, superClass);
        OBJECT.inherits(client, agent);
        client.agent = agent;

        return agent;
    };

    /**
     * 试图判断是否是字面量对象 (@see jquery, tangram)
     * 字面量(literal)对象，简单来讲，
     * 即由{}、new Object()类似方式创建的对象，
     * 而DOM对象，函数对象，Date对象，RegExp对象，
     * 继承/new somefunc()自定义得到的对象都不是字面量对象。
     * 此方法尽力按通常情况排除通非字面量对象，
     * 但是不可能完全排除所有的非字面量对象。
     * 
     * @public
     * @param {Object} obj 输入对象
     * @return {boolean} 是否是字面量对象
     */
    var isPlainObject = OBJECT.isPlainObject = function (obj) {
        
        // 首先必须是Object（特别地，排除DOM元素）
        if (!obj || Object.prototype.toString.call(obj) != '[object Object]'
            // 但是在IE中，DOM元素对上一句话返回true，
            // 所以使用字面量对象的原型上的isPrototypeOf来判断
            || !('isPrototypeOf' in obj)) {
            return false;
        }

        try {
            // 试图排除new somefunc()创建出的对象
            if (// 如果没有constructor肯定是字面量对象
                obj.constructor
                // 有constructor但不在原型上时通过
                && !hasOwnProperty.call(obj, 'constructor') 
                // 用isPrototypeOf判断constructor是否为Object对象本身
                && !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')
            ) {
                return false;
            }
        } catch ( e ) {
            // IE8,9时，某些情况下访问某些host objects(如window.location)的constructor时，
            // 可能抛异常，@see jquery #9897
            return false;
        }

        // 有一个继承的属性就不算字面量对象，
        // 因原型上的属性会在后面遍历，所以直接检查最后一个
        for (var key in obj) {}
        return key === undefined || hasOwnProperty.call(obj, key);
    };

    /**
     * 是否为数组
     */
    function isArray(o) {
        return objProtoToString.call(o) == '[object Array]';
    }

    /**
     * 是否为function
     */
    function isFunction(o) {
        return objProtoToString.call(o) == '[object Function]';
    }

    /**
     * 是否为Date
     */
    function isDate(o) {
        return objProtoToString.call(o) == '[object Date]';
    }

    /**
     * 做inclusion map, exclusion map
     */
    function makeClusionMap (clusion) {
        var i;
        var clusionMap = {};

        if (isArray(clusion)) {
            for (i = 0; i < clusion.length; i ++) {
                clusionMap[clusion[i]] = clusion[i];
            }
        } 
        else if (clusion === Object(clusion)) { 
            for (i in clusion) {
                clusionMap[clusion[i]] = i;
            }
        }

        return clusionMap;
    }

})();
/**
 * xutil.string
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    字符串相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  xutil.lang
 */

(function () {
    
    var STRING = xutil.string;
    var LANG = xutil.lang;
    var TRIMER = new RegExp(
            "(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"
        );
    
    /**
     * 删除目标字符串两端的空白字符 (@see tangram)
     * 
     * @pubilc
     * @param {string} source 目标字符串
     * @returns {string} 删除两端空白字符后的字符串
     */
    STRING.trim = function (source) {
        return source == null 
            ? ""
            : String(source).replace(TRIMER, "");
    };
    
    /**
     * HTML编码，包括空格也会被编码
     * 
     * @public
     * @param {string} text 要编码的文本
     * @param {number} blankLength 每个空格的长度，
     *      为了显示效果，可调整长度，缺省为1
     */
    STRING.encodeHTMLWithBlank = function (text, blankLength) {
        var blankArr=[];
        blankLength = blankLength || 1;
        for(var i = 0; i < blankLength; i++) {
            blankArr.push('&nbsp;');
        }
        return STRING.encodeHTML(text).replace(/ /g, blankArr.join(''));
    };
    
    /**
     * 对目标字符串进行html编码 (@see tangram)
     * 编码字符有5个：&<>"'
     * 
     * @public
     * @param {string} source 目标字符串
     * @returns {string} html编码后的字符串
     */
    STRING.encodeHTML = function (source) {
        return String(source)
                    .replace(/&/g,'&amp;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;')
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
    };
        
    /**
     * 对目标字符串进行html解码(@see tangram)
     * 
     * @public
     * @param {string} source 目标字符串
     * @returns {string} html解码后的字符串
     */
    STRING.decodeHTML = function (source) {
        var str = String(source)
                    .replace(/&quot;/g,'"')
                    .replace(/&lt;/g,'<')
                    .replace(/&gt;/g,'>')
                    .replace(/&amp;/g, "&");
        //处理转义的中文和实体字符
        return str.replace(/&#([\d]+);/g, function (_0, _1){
            return String.fromCharCode(parseInt(_1, 10));
        });
    };
        
    /**
     * 得到可显示的文本的方便函数，便于业务代码中批量使用
     * 
     * @public
     * @param {string} source 原文本
     * @param {string} defaultText 如果source为空，则使用defaultText，缺省为''。
     *      例如页面上表格内容为空时，显示'-'
     * @param {boolean} needEncodeHTML 是否要进行HTML编码，缺省为false
     * @param {Object} htmlEncoder HTML编码器，缺省为STRING.encodeHTML
     */
    STRING.toShowText = function (source, defaultText, needEncodeHTML, htmlEncoder) {
        defaultText =  LANG.hasValue(defaultText) ? defaultText : '';
        htmlEncoder = htmlEncoder || STRING.encodeHTML;
        var text = LANG.hasValueNotBlank(source) ? source : defaultText;
        needEncodeHTML && (text = htmlEncoder(text));
        return text;
    };
    
    /**
     * 去除html/xml文本中的任何标签
     * （前提是文本没有被encode过）
     * 
     * @public
     * @param {string} source 输入文本
     * @return {string} 输出文本
     */
    STRING.escapeTag = function (source) {
        if (!LANG.hasValueNotBlank(source)) {
            return '';
        }
        return String(source).replace(/<.*?>/g,'');
    };
    
    /**
     * 将目标字符串中可能会影响正则表达式构造的字符串进行转义。(@see tangram)
     * 给以下字符前加上“\”进行转义：.*+?^=!:${}()|[]/\
     * 
     * @public
     * @param {string} source 目标字符串
     * @return {string} 转义后的字符串
     */
    STRING.escapeReg = function (source) {
        return String(source)
                .replace(
                    new RegExp("([.*+?^=!:\x24{}()|[\\]\/\\\\])", "g"), 
                    '\\\x241'
                );
    };    
    
    /**
     * 求字符串的字节长度，非ASCII字符算两个ASCII字符长
     * 
     * @public
     * @param {string} str 输入文本
     * @return {number} 字符串字节长度
     */
    STRING.textLength = function (str){
        if (!LANG.hasValue(str)) { return 0; };
        return str.replace(/[^\x00-\xFF]/g,'**').length;
    };
    /**
     * 截取字符串，如果非ASCII字符，
     * 算两个字节长度（一个ASCII字符长度是一个单位长度）
     * 
     * @public
     * @param {string} str 输入文本
     * @param {number} start 从第几个字符开始截取
     * @param {number} length 截取多少个字节长度
     * @return {string} 截取的字符串
     */
    STRING.textSubstr = function (str, start, length) {
        if (!LANG.hasValue(str)) {
            return '';
        }
        var count=0;
        for(var i = start, l = str.length; i < l && count < length; i++) {
            str.charCodeAt(i) > 255 ? (count += 2) : (count++);
        }
        count > length && i--;
        return str.substring(start, i); 
    };
    
    /**
     * 折行，如果非ASCII字符，算两个单位长度（一个ASCII字符长度是一个单位长度）
     * 
     * @public
     * @param {string} str 输入文本
     * @param {number} length 每行多少个单位长度
     * @param {string} lineSeparater 换行符，缺省为\r
     * @return {string} 折行过的文本
     */
    STRING.textWrap = function (str, length, lineSeparater) {
        lineSeparater = lineSeparater || '\r';
        if (length < 2)  {
            throw Error ('illegle length');
        }
        if (!LANG.hasValueNotBlank(str)) {
            return '';
        }
        
        var i = 0;
        var lineStart=0;
        var l=str.length;
        var count=0;
        var textArr=[];
        var lineStart;

        while(true) {
            if (i>=l) {
                textArr.push(str.substring(lineStart, l+1));
                break;  
            }
            str.charCodeAt(i)>255 ? (count+=2) : (count++);
            if(count>=length) {
                (count>length) && (i=i-1);
                textArr.push(str.substring(lineStart, i+1));
                lineStart = i+1;
                count = 0;
            }
            i++;
        }
        return textArr.join(lineSeparater);     
    };
 
    /**
     * 按照模板对目标字符串进行格式化 (@see tangram)
     *
     * @public
     * @usage 
     *      template('asdf#{0}fdsa#{1}8888', 'PA1', 'PA2') 
     *      返回asdfPA1fdsaPA28888。
     *      template('asdf#{name}fdsa#{area}8888, { name: 'PA1', area: 'PA2' }) 
     *      返回asdfPA1fdsaPA28888。   
     * @param {string} source 目标字符串
     * @param {(Object|...string)} options 提供相应数据的对象
     * @return {string} 格式化后的字符串
     */
    STRING.template = function (source, options) {
        source = String(source);
        var data = Array.prototype.slice.call(arguments, 1);
        var toString = Object.prototype.toString;

        if(data.length) {
            data = data.length == 1 ? 
                (options !== null && 
                    (/\[object Array\]|\[object Object\]/.test(
                        toString.call(options)
                    )) 
                        ? options : data
                ) : data;

            return source.replace(
                /#\{(.+?)\}/g, 
                function (match, key) {
                    var replacer = data[key];
                    if('[object Function]' == toString.call(replacer)) {
                        replacer = replacer(key);
                    }
                    return ('undefined' == typeof replacer ? '' : replacer);
                }
            );

        }
        return source;
    };

})();
/**
 * xutil.uid
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    唯一性ID相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  none
 */

(function () {
    
    var UID = xutil.uid;
    var INCREASED_UID_BASE_PUBLIC = 1;
    var INCREASED_UID_BASE_PRIVATE = {};
    
    /**
     * 获取不重复的随机串（自增，在单浏览器实例，无worker情况下保证唯一）
     * @public
     * 
     * @param {Object} options
     * @param {string} options.key UID的所属。
     *          缺省则为公共UID；传key则为私有UID。
     *          同一key对应的UID不会重复，不同的key对应的UID可以重复。
     * @return {string} 生成的UID
     */
    UID.getIncreasedUID = function (key) {
        if (key != null) {
            !INCREASED_UID_BASE_PRIVATE[key] 
                && (INCREASED_UID_BASE_PRIVATE[key] = 1);
            return INCREASED_UID_BASE_PRIVATE[key] ++;
        } 
        else {
            return INCREASED_UID_BASE_PUBLIC ++ ;
        }
    };
    
    /**
     * 也可以在应用中重载此定义
     */
    UID.getUID = UID.getIncreasedUID;
    
})();

/**
 * xutil.url
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    时间相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  xutil.lang
 */

(function () {
    
    var URL = xutil.url;
    var LANG = xutil.lang;
    var objProtoToString = Object.prototype.toString;
    var arrayProtoSlice = Array.prototype.slice;

    /**
     * 包装js原生的decodeURIComponent，
     * 对于undefined和null均返回空字符串
     * 
     * @public
     * @param {string} input 输入文本
     * @return {string} 输出文本
     */
    URL.decodeURIComponent = function (input) { 
        return LANG.hasValueNotBlank(input) 
            ? decodeURIComponent(input) : input;
    };
    
    /**
     * 向URL增加参数
     * 
     * @public
     * @param {string} url 输入url
     * @param {string} paramStr 参数字符串
     * @param {number} urlType url类型，1:普通URL（默认）; 2:erURL 
     * @return {string} 结果url
     */
    URL.appendParam = function (url, paramStr, urlType) {
        urlType = urlType || 1;

        if (url.indexOf('?') < 0) {
            url += (urlType == 2 ? '~' : '?') + paramStr;
        } 
        else {
            url += '&' + paramStr;
        }

        return url;
    };

    /**
     * 替换url中的参数。如果没有此参数，则添加此参数。
     * 
     * @public
     * @param {string} 输入url
     * @param {string} paramName 参数名
     * @param {string} newValue 新参数值，如果为空则给此paramName赋空字串
     * @param {number} urlType url类型，1:普通URL（默认）; 2:erURL 
     * @return {string} 结果url
     */
    URL.replaceIntoParam = function (url, paramName, newValue, urlType) {
        var retUrl = url;
        
        if (!retUrl || !LANG.hasValueNotBlank(paramName)) { 
            return retUrl; 
        }
        newValue = newValue != null ? newValue : '';

        var regexp = new RegExp('([&~?])' + paramName + '=[^&]*');
        var paramStr = paramName + '=' + newValue;
        if (regexp.test(retUrl)) { // 替换
            // js不支持反向预查
            retUrl = retUrl.replace(regexp, '$1' + paramStr); 
        } 
        else { // 添加
            retUrl = URL.appendParamStr(retUrl, paramStr, urlType);
        }
        return retUrl;
    };
    
    /**
     * 一个将请求参数转换为对象工具函数
     * 
     * @public
     * @usage url.parseParam('asdf=123&qwer=654365&t=43&t=45&t=67'); 
     *          一个将请求参数转换为对象工具函数
     *          其中如上例，返回对象{asdf:123, qwer:654365, t: [43, 45, 67]}
     * @param {string} paramStr 请求参数字符串
     * @return {Object} 请求参数封装对象，如上例
     */
    URL.parseParam = function (paramStr) {
        var paramMap = {};

        if (paramStr == null) {
            return paramMap;
        }

        var paramArr = paramStr.split('&');
        for (var i = 0, len = paramArr.length, o; i < len; i++) {
            o = paramArr[i] != null ? paramArr[i] : '';
            o = o.split('=');
            
            if (o[0] == null) { continue; }

            if (paramMap.hasOwnProperty(o[0])) {
                if (objProtoToString(paramMap[o[0]]) == '[object Array]') {
                    paramMap[o[0]].push(o[1]);
                } 
                else {
                    paramMap[o[0]] = [paramMap[o[0]], o[1]];   
                }
            } 
            else {
                paramMap[o[0]] = o[1];   
            }
        }
        return paramMap;
    };

    /**
     * 请求参数变为string
     * null和undefined会被转为空字符串
     * 可支持urlencoding
     * 
     * @public
     * @usage url.stringifyParam({asdf:123, qwer:654365, t: [43, 45, 67]})
     *          一个将请求参数对象转换为数组的工具函数
     *          其中如上例，返回['asdf=123', 'qwer=654365', 't=43', 't=45', 't=67'] 
     *          可自己用join('&')变为请求参数字符串'asdf=123&qwer=654365&t=43&t=45&t=67'
     *
     * @param {Object} paramObj 请求参数封装
     *      key为参数名，
     *      value为参数值，{string}或者{Array.<string>}类型   
     * @param {boolean} useEncoding 是否使用urlencoding，默认false
     * @return {Array.<string>} 请求参数数组
     */
    URL.stringifyParam = function (paramObj, useEncoding) {
        var paramArr = [];
        var textParam = URL.textParam;

        function pushParam(name, value) {
            paramArr.push(
                textParam(name, !useEncoding) 
                + '=' 
                + textParam(value, !useEncoding)
            );
        }    

        var name;
        var value;
        var i;
        for (name in (paramObj || {})) {
            value = paramObj[name];
            if (Object.prototype.toString.call(value) == '[object Array]') {
                for (i = 0; i < value.length; i ++) {
                    pushParam(name, value[i]);
                }
            }
            else {
                pushParam(name, value);
            }
        }
        return paramArr;
    };

    /**
     * 格式化文本请求参数的方便函数，统一做提交前最常需要做的事：
     * (1) 判空防止请求参数中出现null/undefined字样，
     * (2) encodeURIComponent（默认进行，可配置）
     *
     * @public
     * @param {string} str 参数值
     * @param {boolean} dontEncoding 默认false
     * @param {string} defaultValue 数据为空时默认值，缺省为''
     * @return {string} 用于传输的参数值
     */
    URL.textParam = function (str, dontEncoding, defaultValue) {
        typeof defaultValue == 'undefined' && (defaultValue = '');
        str = str == null ? defaultValue : str;
        return dontEncoding ? str : encodeURIComponent(str);
    };

    /**
     * 格式化数值请求参数的方便函数，统一做提交前最常需要做的事：
     * 防止请求参数中出现null/undefined字样，如果为空可指定默认值
     *
     * @public
     * @param {(string|number)} value 参数值
     * @param {string} defaultValue 数据为空时的默认值，缺省为''
     * @return {string} 用于传输的参数值
     */
    URL.numberParam = function (value, defaultValue) {
        typeof defaultValue == 'undefined' && (defaultValue = '');
        return (value == null || value === '') ? defaultValue : value;
    };

    /**
     * 格式化数值请求参数的方便函数，统一做提交前最常需要做的事：
     * 直接构造array请求参数，如 aaa=1&aaa=233&aaa=443 ...
     * 防止请求参数中出现null/undefined字样，如果为空可指定默认值
     * 
     * @public
     * @param {array} arr 要构成arr的参数，结构可以为两种
     *              (1) ['asdf', 'zxcv', 'qwer']
     *                  不需要传入attrName。
     *              (2) [{ t: 'asdf' }, { t: 'zxcv' }]
     *                  需要传入attrName为t。
     * @param {string} paramName 参数名
     *                  如上例，假如传入值'aaa'，
     *                  则返回值为aaa=asdf&aaa=zxcv&aaa=qwer
     * @param {string=} attrName 为arr指定每项的属性名，解释如上
     * @param {Function=} paramFunc 即每个参数的处理函数,
     *                  缺省则为xutil.url.textParam
     * @param {...*} paramFunc_args 即paramFunc的补充参数
     * @return {Array} 参数字符串数组，如['aa=1', 'aa=33', 'aa=543']
     *              可直接使用join('&')形成用于传输的参数aa=1&aa=33&aa=543
     */
    URL.wrapArrayParam = function (arr, paramName, attrName, paramFunc) {
        if (!arr || !arr.length) {
            return [];
        }
        
        paramFunc = paramFunc || URL.textParam;
        var args = arrayProtoSlice.call(arguments, 4);

        var paramArr = [];
        for (var i = 0, item; i < arr.length; i ++) {
            item = arr[i];
            if (item === Object(item)) { // 如果item为Object
                item = item[attrName];
            }
            item = paramFunc.apply(null, [item].concat(args));
            paramArr.push(paramName + '=' + item);
        }

        return paramArr;
    };

})();
/**
 * xutil.validator
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:    输入验证相关工具函数
 * @author:  sushuang(sushuang)
 * @depend:  xutil.lang
 */

(function () {
    
    var VALIDATOR = xutil.validator = {};

    var REGEXP_CASH = /^\d+(\.\d{1,2})?$/;
    var REGEXP_CASH_CAN_NAGE = /^(\+|-)?\d+(\.\d{1,2})?$/;
    var REGEXP_EMAIL = /^[_\w-]+(\.[_\w-]+)*@([\w-])+(\.[\w-]+)*((\.[\w]{2,})|(\.[\w]{2,}\.[\w]{2,}))$/;
    var REGEXP_URL = /^[^.。，]+(\.[^.，。]+)+$/;
    var REGEXP_MOBILE = /^1\d{10}$/;
    var REGEXP_ZIP_CODE = /^\d{6}$/;
    
    /**
     * 是否金额
     * 
     * @pubilc
     * @param {string} value 目标字符串
     * @param {boolean} canNagetive 是否允许负值，缺省为false
     * @returns {boolean} 验证结果
     */
    VALIDATOR.isCash = function (value, canNagetive) {
        return canNagetive 
            ? REGEXP_CASH_CAN_NAGE.test(value) : REGEXP_CASH.test(value);
    };   

    /**
     * 是否金额
     * 
     * @pubilc
     * @param {string} value 目标字符串
     * @returns {boolean} 验证结果
     */
    VALIDATOR.isURL = function (value) {
        return REGEXP_URL.test(value); 
    };

    /**
     * 是否移动电话
     * 
     * @pubilc
     * @param {string} value 目标字符串
     * @returns {boolean} 验证结果
     */
    VALIDATOR.isMobile = function (value) {
        return REGEXP_MOBILE.test(value);
    };    

    /**
     * 是否电子邮箱
     * 
     * @pubilc
     * @param {string} value 目标字符串
     * @returns {boolean} 验证结果
     */
    VALIDATOR.isEMAIL = function (value) {
        return REGEXP_EMAIL.test(value);
    };
    
    /**
     * 是否邮政编码
     * 
     * @pubilc
     * @param {string} value 目标字符串
     * @returns {boolean} 验证结果
     */
    VALIDATOR.isZipCode = function (value) {
        return REGEXP_ZIP_CODE.test(value);
    };
    
})();
/**
 * ecui.XObject
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    视图和模型的基类
 * @author:  sushuang(sushuang)
 * @depend:  xutil.object
 * @version: 1.0.1
 */

(function () {

    //----------------------------------
    // 引用
    //----------------------------------
    
    var xobject = xutil.object;
    var inheritsObject = xobject.inheritsObject;
    var objProtoToString = Object.prototype.toString;
    var arrayProtoSlice = Array.prototype.slice;
    
    //----------------------------------
    // 类型定义
    //----------------------------------
    
    /**
     * 视图和模型的基类
     *
     * @class
     */
    var XOBJECT = xui.XObject = 
            inheritsObject(null, xobjectConstructor);
    var XOBJECT_CLASS = XOBJECT.prototype;
    
    /**
     * 构造函数
     *
     * @public
     * @constructor
     * @param {Object} options 参数     
     */
    function xobjectConstructor(options) {
        /**
         * 事件监听器集合
         * key: eventName
         * value: {Array.<Object>} 监听器列表
         *
         * @type {Object} 
         * @private
         */
        this._oEventHandlerMap = {};

        /**
         * 是否禁用（不可交互）
         *
         * @type {boolean} 
         * @private
         */
        this._bDisabled = false;
    }

    //----------------------------------
    // 基本方法
    //----------------------------------

    /**
     * 默认的初始化函数
     *
     * @public
     */
    XOBJECT_CLASS.init = function () {};
    
    /**
     * 默认的析构函数
     * 如果有设businessKey，则终止未完成的请求
     *
     * @public
     */
    XOBJECT_CLASS.dispose = function () {
        this._oEventHandlerMap = {};
    };

    /**
     * 是否禁用（不可交互）
     *
     * @public
     * @return {boolean} 是否禁用
     */
    XOBJECT_CLASS.isDisabled = function () {
        return !!this._bDisabled;
    };
    
    /**
     * 设置禁用（不可交互）
     *
     * @public
     * @return {boolean} 是否执行了禁用
     */
    XOBJECT_CLASS.disable = function () {
        if (!this._bDisabled) {
            this._bDisabled = true;
            return true;
        }
        return false;
    };
    
    /**
     * 设置启用（可交互）
     *
     * @public
     * @return {boolean} 是否执行了启用
     */
    XOBJECT_CLASS.enable = function () {
        if (this._bDisabled) {
            this._bDisabled = false;
            return true;
        }
        return false;
    };
    
    //------------------------------------------
    // 事件/通知/Observer相关方法
    //------------------------------------------
    
    /**
     * 注册事件监听器
     * 重复注册无效
     *
     * @public
     * @param {(string|Object|Array)} eventName 
     *                  类型是string时表示事件名，
     *                  类型是Object或Array时，含义见下方用法举例
     * @param {Function} handler 监听器
     * @param {Object=} context 即handler调用时赋给的this，
     *                  缺省则this为XDatasource对象本身
     * @param {...*} args handler调用时绑定的前几个参数
     * @usage
     *      [用法举例一] 
     *          myModel.attach('sync.result', this.eventHandler, this);
     *      [用法举例二] （同时绑定很多事件）
     *          var bind = xutil.fn.bind;
     *          myModel.attach(
     *              {    
     *                  'sync.parse': bind(this.handler1, this, arg1, arg2),
     *                  'sync.preprocess': bind(this.handler2, this),
     *                  'sync.result.INIT': bind(this.handler3, this),
     *                  'sync.result.DATA': [
     *                      bind(this.handler4, this),
     *                      bind(this.handler5, this, arg3),
     *                      bind(this.handler6, this)
     *                  ]
     *              }
     *      [用法举例三] （同时绑定很多事件）
     *          myModel.attach(
     *              ['sync.parse', this.handler1, this, arg1, arg2],
     *              ['sync.preprocess', this.handler2, this],
     *              ['sync.result.INIT', this.handler3, this],
     *              ['sync.result.DATA', this.handler4, this],
     *              ['sync.result.DATA', this.handler5, this, arg3],
     *              ['sync.result.DATA', this.handler6, this]
     *          );
     */
    XOBJECT_CLASS.attach = function (eventName, handler, context, args) {
        parseArgs.call(this, attach, arrayProtoSlice.call(arguments));
    };

    /**
     * 事件注册
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {Object} handlerWrap 事件监听器封装
     */
    function attach(handlerWrap) {
        handlerWrap.once = false;
        doAttach.call(this, handlerWrap);
    }

    /**
     * 注册事件监听器，执行一次即被注销
     * 重复注册无效
     *
     * @public
     * @param {(string|Object|Array)} eventName 
     *                  类型是string时表示事件名，
     *                  类型是Object或Array时，含义见attach方法的用法举例
     * @param {Function} handler 监听器
     * @param {Object=} context 即handler中的this，
     *                  缺省则this为XDatasource对象本身
     * @param {...*} args handler执行时的前几个参数
     * @usage 用法举例同attach方法
     */
    XOBJECT_CLASS.attachOnce = function (eventName, handler, context, args) {
        parseArgs.call(this, attachOnce, arrayProtoSlice.call(arguments));
    };

    /**
     * 事件注册，执行一次即被注销
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {Object} handlerWrap 事件监听器封装
     */
    function attachOnce(handlerWrap) {
        handlerWrap.once = true;
        doAttach.call(this, handlerWrap);
    }
    
    /**
     * 注册事件监听器
     * 重复注册无效
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {Object} handlerWrap 事件监听器封装
     */
    function doAttach(handlerWrap) {
        var handlerList = this._oEventHandlerMap[handlerWrap.eventName];
        if (!handlerList) {
            handlerList = this._oEventHandlerMap[handlerWrap.eventName] = [];
        }
        if (getHandlerWrapIndex.call(this, handlerWrap) < 0) {
            handlerList.push(handlerWrap);
        }
    }

    /**
     * 注销事件监听器
     * 如果传了context参数，则根据handler和context来寻找已经注册的监听器，
     * 两者同时批评才会命中并注销。
     * （这样做目的是：
     *      当handler是挂在prototype上的类成员方法时，可用传context来区别，
     *      防止监听器注销影响到同类的其他实例
     *  ）
     * 如果context缺省，则只根据handler寻找已经注册了的监听器。
     *
     * @public
     * @param {(string|Object|Array)} eventName
     *                  类型是string时表示事件名，
     *                  类型是Object或Array时，含义见下方用法举例
     * @param {Function} handler 监听器
     * @param {Object=} context 即注册时handler中的this，
     *                  缺省则this为XDatasource对象本身
     * @usage
     *      [用法举例一] 
     *          myModel.detach('sync.result', this.eventHandler);
     *      [用法举例二] （同时注销绑定很多事件）
     *          myModel.detach(
     *              {    
     *                  'sync.parse': handler1,
     *                  'sync.preprocess': handler2,
     *                  'sync.result.DATA': [
     *                      handler5,
     *                      handler6
     *                  ]
     *              }
     *      [用法举例三] （同时注销绑定很多事件）
     *          myModel.detach(
     *              ['sync.parse', this.handler1],
     *              ['sync.result.INIT', this.handler3],
     *              ['sync.result.DATA', this.handler4],
     *              ['sync.result.DATA', this.handler5],
     *              ['sync.result.DATA', this.handler6]
     *          );
     */
    XOBJECT_CLASS.detach = function (eventName, handler, context) {
        parseArgs.call(this, doDetach, arrayProtoSlice.call(arguments));        
    };

    /**
     * 注销注册事件监听器
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {Object} handlerWrap 事件监听器封装
     */
    function doDetach(handlerWrap) {
        var index = getHandlerWrapIndex.call(this, handlerWrap);
        if (index >= 0) {
            this._oEventHandlerMap[handlerWrap.eventName].splice(index, 1);
        }
    }    
    
    /**
     * 注销某事件的所有监听器
     *
     * @public
     * @param {string} eventName 事件名
     */
    XOBJECT_CLASS.detachAll = function (eventName) {
        delete this._oEventHandlerMap[eventName];
    };
    
    /**
     * 触发事件
     *
     * @public
     * @param {string} eventName 事件名
     * @param {Array} paramList 参数，可缺省
     * @return {boolean} 结果，
     *      有一个事件处理器返回false则为false，否则为true
     */
    XOBJECT_CLASS.notify = function (eventName, paramList) {
        var result = true;
        var onceList = [];
        var handlerList = this._oEventHandlerMap[eventName] || [];

        var i;
        var o;
        var handlerWrap;
        for (i = 0; handlerWrap = handlerList[i]; i++) {
            o = handlerWrap.handler.apply(
                handlerWrap.context, 
                (handlerWrap.args || []).concat(paramList || [])
            );
            (o === false) && (result = false);

            if (handlerWrap.once) {
                onceList.push(handlerWrap);
            }
        }
        for (i = 0; handlerWrap = onceList[i]; i++ ) {
            this.detach(eventName, handlerWrap.handler);
        }
        return result;
    };

    /**
     * 构造handlerWrap
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {string} eventName 事件名
     * @param {Function} handler 监听器
     * @param {Object} context 即handler中的this，
     *                  缺省则this为XDatasource对象本身
     * @param {...*} args handler执行时的前几个参数
     * @return {Object} wrap
     */
    function makeWrap(eventName, handler, context, args) {
        args = arrayProtoSlice.call(arguments, 3);
        args.length == 0 && (args = null);

        return {
            eventName: eventName,
            handler: handler,
            context: context || this,
            args: args
        };
    }
    
    /**
     * 处理函数参数
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {Function} func 要执行的方法
     * @param {Array} args 输入的函数参数
     */
    function parseArgs(func, args) {
        var firstArg = args[0];

        if (objProtoToString.call(firstArg) == '[object String]') {
            func.call(this, makeWrap.apply(this, args));
        }

        else if (objProtoToString.call(firstArg) == '[object Array]') {
            for (var i = 0; i < args.length; i ++) {
                func.call(this, makeWrap.apply(this, args[i]));
            }
        }

        else if (firstArg === Object(firstArg)) {
            var hand;
            for (var eventName in firstArg) {
                hand = firstArg[eventName];

                if (objProtoToString.call(hand) == '[object Array]') {
                    for (var i = 0; i < hand.length; i ++) {
                        func.call(
                            this,
                            makeWrap.call(this, eventName, hand[i])
                        );
                    }
                }
                else {
                    func.call(this, makeWrap.call(this, eventName, hand));
                }
            }
        }
    }
    
    /**
     * 获得index
     *
     * @private
     * @this {xui.XObject} XObject实例自身
     * @param {Object} handlerWrap 事件监听器封装
     */
    function getHandlerWrapIndex(handlerWrap) {
        var handlerList = this._oEventHandlerMap[handlerWrap.eventName];
        if (handlerList) {
            for (var i = 0, wrap; wrap = handlerList[i]; i++ ) {
                if (wrap.handler === handlerWrap.handler
                    && wrap.context === handlerWrap.context
                ) {
                    return i;   
                }
            }
        }
        return -1;
    };
    
})();
/**
 * xui.XDatasource
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:   数据模型基类
 *
 *          使用模型（Model）和视图（View）分离的程序结构时，
 *          此类可作为模型的基类被继承及扩展，定义相应属性
 *          （@see OPTIONS_NAME），
 *          其各派生类提供前/后台的业务数据获取和管理。
 *          XDatasource推荐一定的代码结构规范，见如下@usage。
 *
 *          基础功能：
 *              (1) 向后台发送数据（用Ajax）
 *              (2) 获得数据：
 *                      主动注入数据
 *                          （出现在数据从其他代码中取得的情况，
 *                          如数据模型的依赖）
 *                      从前台取数据
 *                          （例如为了节省链接和加快速度，
 *                          JSON数据放在页面HTML中一块返回前端，
 *                          或者从本地存储中得到等）
 *                      从后台取数据
 *                          （用Ajax）
 *                  取数据顺序是：
 *                      首先看是否已有主动注入的"businessData"；
 *                      否则如果"local"定义了则从"local"中取；
 *                      否则如果"url"定义了则发Ajax请求从后台取。
 *              (3) Oberver模式的更新通知，及自定义事件
 *              (4) 多数据源的管理（参见datasourceId）
 *              (5) 推荐的请求生命期结构
 *                  （参数准备、返回值解析、结果响应、最终清理等）
 *              (6) 析构时，abort所有未完成的请求，
 *                  防止请求回来后视图、模型已经不存在导致js错误、
 *                  全局视图未清理等问题
 *
 * @author:  sushuang(sushuang)
 * @depend:  xutil
 * @version: 1.0.1
 */

/**
 *                             -----------------
 *                             |   使用说明    |
 *                             -----------------
 * ____________________________________________________________________________
 * @usage 使用XDatasource
 *        [举例] 
 *          ___________________________________________________________________
 *          (1) 定义一个新的XDatasource（如下MyDatasource），用继承的方式:
 * 
 *              如果有数据获取的参数或代码逻辑要写在MyDatasource里面
 *              （如URL，返回解过解析等逻辑），
 *              则在MyDatasource中，定义OPTIONS_NAME中指定的各参数
 *              （不需要定义则缺省即可）。
 *              其中各参数可以定义成string或者Function
 * 
 *              // 定义MyDatasource类
 *              var MyDatasource = function() {}; 
 *              inherits(MyDatasource, XDatasource);
 *              
 *              // 定义url
 *              MyDatasource.prototype.url = '/order/go.action'; 
 *
 *              // 定义param的构造
 *              MyDatasource.prototype.param = function(options) {
 *                  var paramArr = [];
 *                  paramArr.push('name=' + options.args.name);
 *                  paramArr.push('year=' + options.args.year);
 *                  paramArr.push('id=' + this._nId);
 *                  return paramArr.join('&');
 *              }
 *
 *              // 定义返回数据的解析
 *              MyDatasource.prototype.parse = function(data, obj, options) {
 *                  // do something ...
 *                  return data;
 *              }
 * 
 *          ___________________________________________________________________
 *          (2) 使用定义好的MyDatasource
 *              
 *              如果有数据获取的参数或代码逻辑是写在MyDatasource外面
 *              （如sync后改变视图的回调），
 *              则用事件的方式注册到MyDatasource里,
 *
 *              例如：
 *              MyDatasource myDatasource = new MyDatasource();
 *              绑定事件：
 *              myDatasource.attach(
 *                  'sync.result', 
 *                  function(data, obj, options) {
 *                      // do something ..., 比如视图改变 
 *                  }
 *              );
 *              myDatasource.attach(
 *                  'sync.error', 
 *                  function(status, obj, options) {
 *                      // do something ..., 比如页面提示 
 *                  }
 *              );
 *              myDatasource.attach(
 *                  'sync.timeout', 
 *                  function(options) { 
 *                      // do something ..., 比如页面提示 
 *                  }
 *              );
 *
 *              往往我们需要给事件处理函数一个scope，
 *              比如可以使用第三方库提供的bind方法。
 *              也可以直接在attach方法中输入scope。
 *
 *              当需要绑定许多事件，可以使用代码更短小的方式绑定事件。
 *              （参见xui.XObject的attach方法）
 *
 *              例如：
 *              （下例中，this是要赋给事件处理函数的scope）
 *              var bind = xutil.fn.bind;
 *              myDatasource.attach(
 *                  {
 *                      'sync.preprocess.TABLE_DATA': bind(this.disable, this),
 *                      'sync.result.TABLE_DATA': bind(this.$handleListLoaded, this),
 *                      'sync.finalize.TABLE_DATA': [  
 *                          // 一个事件多个处理函数的情况
 *                          bind(this.enable, this),
 *                          bind(this.$resetDeleteBtnView, this)
 *                      ],
 *                      'sync.result.DELETE': bind(this.$handleDeleteSuccess, this)
 *                  }
 *              ); 
 *
 *              又例如，还可以这样写：
 *              （数组第一个元素是事件名，第二个是事件处理函数，第三个是函数的scope）
 *              myDatasource.attach(
 *                  ['sync.preprocess.TABLE_DATA', this.disable, this],
 *                  ['sync.result.TABLE_DATA', this.$handleListLoaded, this],
 *                  ['sync.finalize.TABLE_DATA', this.enable, this],
 *                  ['sync.finalize.TABLE_DATA', this.$resetDeleteBtnView, this],
 *                  ['sync.result.DELETE': this.$handleDeleteSuccess, this]
 *              );
 *              
 *              需要发送数据或者获取数据时调用myDatasource.sync()，
 *              即可触发相应事件。
 * 
 *              如果要传入外部参数，则在options.args中传入，
 *              例如上例的param和parse定义，sync时直接传入参数：
 *
 *              myDatasource.sync( 
 *                  { 
 *                      args: { name: 'ss', year: 2012 } 
 *                  } 
 *              ); 
 *
 *              这样param和parse函数中即可得到参数'ss', 2012。
 * 
 *              注意，如果sync时指定了datasourceId，比如
 *              myDatasource.sync( { datasourceId:'ds1' } );
 *              则先触发sync.result.ds1事件，再触发sync.result事件。
 *              error、timeout等事件也是此规则。
 * 
 *          ___________________________________________________________________
 *          (3) 如果调用sync时数据是从本地取得，
 *              比如页面初始化时把JSON数据写在了页面的某个dom节点中，
 *              则设置"local"参数，
 * 
 *              例如：
 *              MyDatasource.prototype.local = function() {
 *                   var data;
 *                   try {
 *                      JSON.parse(
 *                          decodeHTML(
 *                              document.getElementById('DATA').innerHTML
 *                          )
 *                      );
 *                      return this.wrapEJson(data);
 *                   } catch (e) {
 *                      return this.wrapEJson(null, 99999, 'business error');
 *                   }
 *              };
 *
 *              从而sync时会调用此local函数取得数据，
 *              如果success则会走parse和result过程。 (@see OPTIONS_NAME.local)
 *          
 *          ___________________________________________________________________
 *          (4) 如果调用sync时数据已经OK不需要解析处理等，
 *              则直接对businessData进行设置。
 * 
 *              例如：
 *              myDatasource.businessData = someData;
 *              从而sync时直接取someData了，走result过程了。
 *              (@see OPTIONS_NAME.businessData)
 * 
 *          ___________________________________________________________________
 *          (5) 如果一个XDatasource中要包含多个数据源，
 *              可以把url、result等属性(@see OPTIONS_NAME)定义成XDatasource.Set，
 *              在sync时使用datasourceId指定当前sync时使用哪个数据源。
 *
 *              例如：
 *              MyDatasource.prototype.url = new xui.XDatasource.Set();
 *              MyDatasource.prototype.url['ORDER'] = 'order.action';
 *              MyDatasource.prototype.url['ADD'] = 'add.action';
 *
 *              // 这样初始化也可以
 *              MyDatasource.prototype.result = new xui.XDatasource.Set(
 *                  {
 *                      'ORDER': function() { ... }
 *                      'ADD': function() { ... }
 *                  }
 *              );
 *
 *              MyDatasource.prototype.param = function() { // func_all... };
 *              MyDatasource.prototype.param['ORDER'] = 
 *                  function() { // func_order... };
 *
 *              则：myDatasource.sync( { datasourceId: 'ORDER' } ); 
 *              或者简写为：
 *                  myDatasource.sync('ORDER'); 
 *              表示取order.action，并走相应的result（func_order）。
 *
 *              另外，上例没有找到相应的param['ORDER']，
 *              但param本身定义成了函数，则走本身（func_all）。
 * 
 * ____________________________________________________________________________
 * @usage 绑定多个XDatasource
 *              如果多个XDatasource共用一个请求，可绑定在一起处理，
 *
 *              例如：
 *              CombinedXDatasource c = new CombinedXDatasource();
 *              c.addSyncCombine(datasource1);
 *              c.addSyncCombine(datasource2, 'DATASOURCE_LIST');
 *
 *              从而：
 *              使用c.sync()时，datasource1也会被触发parse事件
 *              以及sync.result/sync.error/sycn.timeout事件
 *              使用c.sync( { datasourceId: 'DATASOURCE_LIST' } )时，
 *              datasource1、datasource2都会被触发parse事件
 *              以及sync.result/sync.error/sycn.timeout事件
 * 
 * ____________________________________________________________________________
 * @usage 工程中重写/扩展XDatasource的实现类
 *              （一般在工程中用于指定静态的url，也可在需要时用于重写方法）
 *              直接调用
 *              XDatasource.extend(
 *                  MyXDatasource, 
 *                  { url: ..., method: ... }
 *              );
 *              进行扩展。
 */

(function () {
    
    //--------------------------
    // 引用
    //--------------------------

    var XOBJECT = xui.XObject;
    var xajax = xutil.ajax;
    var xlang = xutil.lang;
    var xobject = xutil.object;
    var inheritsObject = xobject.inheritsObject;
    var extend = xobject.extend;
    var clone = xobject.clone;
    var isFunction = xlang.isFunction;
    var isArray = xlang.isArray;
    var isString = xlang.isString;
    var isObject = xlang.isObject;
    var hasValue = xlang.hasValue;
    var sliceArray = Array.prototype.slice;
    
    //--------------------------
    // 类型定义
    //--------------------------

    /**
     * Model基类
     * 
     * @class
     * @extends xui.XObject
     */
    var XDATASOURCE = xui.XDatasource = 
            inheritsObject(XOBJECT, xdatasourceConstructor);
    var XDATASOURCE_CLASS = XDATASOURCE.prototype;

    /**
     * 构造函数
     *
     * @public
     * @constructor
     * @param {Object} options
     */
    function xdatasourceConstructor(options) {
        /**
         * 事件处理器集合
         *
         * @type {Object}
         * @private
         */
        this._oEventHandlerMap = {};
        /**
         * 绑定集合，key是datasourceId
         *
         * @type {Object}
         * @private
         */
        this._oSyncCombineSet = {};
        /**
         * 无datasourceId时默认的绑定集合
         *
         * @type {Array.<xui.XDatasource>}
         * @private
         */
        this._aSyncCombineSetDefault = [];
        /**
         * 当前未完成的request集合，key为requestId
         *
         * @type {Object}
         * @private
         */
        this._oRequestSet = {};
        /**
         * sync过程中的当前datasourceId
         *
         * @type {string}
         * @private
         */
        this._sCurrentDatasourceId;
    }

    /**
     * 一个hash map。表示每个datasourceId对应的配置。
     * 所以使用时须满足的格式：
     * key为datasourceId，
     * value为datasourceId对应的参数/属性。
     * 
     * @class
     * @constructor
     * @param {Object=} set 如果为null，则初始化空Set
     */
    var SET = XDATASOURCE.Set = function (set) {
        set && extend(this, set);
    };
    
    //---------------------------
    // 属性
    //---------------------------

    /**
     * 默认的错误状态值，
     * 用于从success转为error时
     *
     * @type {number} 
     * @protected
     */
    XDATASOURCE_CLASS.DEFAULT_ERROR_STATUS = 999999999999;

    /**
     * XDatasource中可在子类中定义或继承的属性
     * 这些属性不可误指定为其他用
     *
     * @protected
     */
    XDATASOURCE_CLASS.OPTIONS_NAME = [
        /**
         * 调用sync时最初始的预处理，较少使用。
         * 可能使用在：调用sync的地方和注册preprocess的地方不在同一类中的情况
         *
         * @type {(Function|xui.XDatasource.Set)} 
         *          如果为Function：
         *              @param {Object} options 调用sync时传入的配置
         * @protected
         */
        'preprocess',

        /**
         * 主动注入的业务数据（主要意义是标志业务数据是否已经OK）,
         * 如果此属性有值表示数据已经OK，sync时不会再试图获取数据。
         *
         * @type {(Function|Any|xui.XDatasource.Set)} 
         *          如果为Function：
         *              @param {Object} options 调用sync时传入的配置
         *              @return {Any} businessData  
         * @protected
         */
        'businessData', 
        
        /**
         * 从本地取得数据
         * 例如可以数据挂在HTML中返回：
         * <div style="display:none" id="xxx"> ...some data... </div>
         * 
         * @type {(Function|Object|xui.XDatasource.Set)}
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {Object} e-json规范的返回值，
         *                  可用wrapEJson方法包装得到
         *          如果为Object，则是e-json对象
         * @protected
         */
        'local',
        
        /**
         * 请求后台的url
         *
         * @type {(Function|string|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {string} url  
         * @protected
         */
        'url', 
        
        /**
         * 请求的HTTP方法（'POST'或'GET'），默认是POST
         *
         * @type {(Function|string|xui.XDatasource.Set)}
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {string} 方法
         * @protected
         */
        'method', 
        
        /**
         * 用于阻止请求并发，同一businessKey的请求不能并发 (@see xajax)
         *
         * @type {(Function|string|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {string} 方法
         * @protected
         */
        'businessKey', 
        
        /**
         * 得到请求的参数字符串
         *
         * @type {(Function|string|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {string} 请求参数字符串   
         * @protected
         */
        'param',
        
        /**
         * 处理请求成功的结果数据
         * 
         * @type {(Function|Any|xui.XDatasource.Set)}
         *          如果为Function, 参数为：
         *             param {(Object|string)} data 获取到的业务数据
         *             param {(Object|string)} ejsonObj 后台返回全结果，一般不使用
         *             param {Object} options 调用sync时传入的配置
         *             return {Any} data 结果数据
         * @protected
         */
        'parse',
        
        /**
         * 获得数据结果
         *
         * @type {(Function|xui.XDatasource.Set)}
         *          如果为Function, 参数为：
         *             param {(Object|string)} data parse过的业务数据
         *             param {(Object|string)} ejsonObj 后台返回全结果，一般不使用
         *             param {Object} options 调用sync时传入的配置
         * @protected
         */
        'result',
        
        /**
         * 处理请求失败的结果
         *
         * @type {(Function|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {(Object|string)} status 后台返回错误状态
         *             param {(Object|string)} ejsonObj 后台返回全结果，一般不使用
         *             param {Object} options 调用sync时传入的配置
         * @protected
         */
        'error',
        
        /**
         * 处理请求超时的结果
         * 
         * @type {(Function|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         * @protected
         */
        'timeout',

        /**
         * 请求返回时总归会触发的回调，先于result或error触发
         *
         * @type {(Function|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         * @protected
         */
        'complete',
        
        /**
         * 请求返回时总归会触发的回调，常用于最后的清理
         *
         * @type {(Function|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         * @protected
         */
        'finalize',
        
        /**
         * 定义请求超时的时间(ms)，缺省则不会请求超时
         *
         * @type {(Function|number|xui.XDatasource.Set)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {number} timout的毫秒数
         * @protected
         */
        'timeoutTime',
        
        /**
         * 如果一个XDatasource中包含多个数据源，
         * sync时用此指定当前请求使用那套url、parse、result等
         * 
         * @type {(Function|string|number)} 
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {string} datasourceId
         * @protected
         */
        'datasourceId',

        /**
         * 调用ajax时额外的输入参数
         *
         * @type {(Function|Object|xui.XDatasource.Set)}
         *          如果为Function, 参数为：
         *             param {Object} options 调用sync时传入的配置
         *             return {Object} ajax参数
         * @protected
         */
        'ajaxOptions'
    ];
    
    //-------------------------------------------------------------
    // 方法                                        
    //-------------------------------------------------------------

    /**
     * 功能：
     * (1) 发送数据到后台。
     * (2) 获取数据，可能从前台直接获取，也可能通过Ajax请求后台获取。
     *
     * @public
     * @param {(Object|string)} options 参数
     *                  参数 @see OPTIONS_NAME sync时指定的参数，
     *                  用于重载xdatasource本身的配置
     *                  如果是string，则表示datasourceId
     *                  如果是Object，则属性如下：
     * @param {Object} options.datasourceId 指定数据源id
     * @param {Object} options.args 用户定义的参数
     * @return {string} requestId 如果发生后台请求，返回请求Id，一般不使用
     */
    XDATASOURCE_CLASS.sync = function (options) {
        if (isString(options)) {
            options = { datasourceId: options, args: {} };
        } 
        else {
            options = options || {};
            options.args = options.args || {};
        }

        var datasourceId = getDatasourceId.call(this, options);
        this._sCurrentDatasourceId = datasourceId;

        // 预处理
        handleSyncPreprocess.call(this, datasourceId, options);

        var data;
        var ejsonObj;
        var url;
        var requestId;

        // 已经被注入数据
        if (hasValue(
                data = handleAttr.call(
                    this, datasourceId, 'businessData', options
                )
            )
        ) { 
            handleSyncHasData.call(this, datasourceId, options, data);
        }

        // 从本地获取数据
        else if (
            hasValue(
                ejsonObj = handleAttr.call(
                    this, datasourceId, 'local', options
                )
            )
        ) { 
            handleSyncLocal.call(this, datasourceId, options, ejsonObj);
        }    

        // 从后台获取数据 
        else if (
            hasValue(
                url = handleAttr.call(this, datasourceId, 'url', options)
            )
        ){ 
            requestId = handleSyncRemote.call(
                this, datasourceId, options, url
            );
        }

        delete this._sCurrentDatasourceId;

        return requestId;
    };
    
    /**
     * 默认的析构函数
     * 如果有设businessKey，则终止未完成的请求
     *
     * @public
     */
    XDATASOURCE_CLASS.dispose = function () {
        this.abortAll();
        this._oSyncCombineSet = null;
        this._aSyncCombineSetDefault = null;
        XDATASOURCE.superClass.dispose.call(this);
    };
    
    /**
     * 默认的parse函数
     *
     * @protected
     * @param {*} data ejsonObject的data域
     * @param {Object} ejsonObj e-json对象本身
     */
    XDATASOURCE_CLASS.parse = function (data, ejsonObj) { 
        return data; 
    };
    
    /**
     * 默认的datasourceId函数
     *
     * @protected
     * @param {Object} options 调用sync时传入的配置
     * @return {string} datasourceId 数据源Id
     */
    XDATASOURCE_CLASS.datasourceId = function (options) { 
        return void 0; 
    };
    
    /**
     * 主动设值，用于前端已有数据的情况
     * 不传参数则清空
     *
     * @public
     * @param {*} businessData 业务数据
     * @param {string} datsourceId 可指定datasourceId
     */
    XDATASOURCE_CLASS.setBusinessData = function (businessData, datasourceId) {
        this.businessData = businessData || null;
        notifyEvent.call(
            this, datasourceId, 'set.businessdata', {}, [businessData]
        );
    };
    
    /**
     * 得到当前的datasourceId，只在sync过程中可获得值，
     * 等同于在sync的回调中使用options.datasourceId
     *
     * @public
     * @return {string} 当前的datasourceId
     */
    XDATASOURCE_CLASS.getCurrentDatasourceId = function () {
        return this._sCurrentDatasourceId;
    };
    
    /**
     * 终止此Model管理的所有请求
     *
     * @public
     */
    XDATASOURCE_CLASS.abortAll = function () {
        var requestIdSet = clone(this._oRequestSet);
        for (var requestId in requestIdSet) {
            this.abort(requestId);
        }
        this.notify('abortAll', [requestIdSet]);
    };
    
    /**
     * 终止此Model管理的某请求
     *
     * @public
     * @param {string} requestId 请求Id，即sync方法调用的返回值
     */
    XDATASOURCE_CLASS.abort = function (requestId) {
        xajax.abort(requestId, true);
        delete this._oRequestSet[requestId];
    };
    
    /**
     * 包装成ejson对象
     *
     * @public
     * @param {*} data 业务数据
     * @param {number} status 返回状态，
     *              0为正常返回，非0为各种错误返回。缺省则为0。
     * @param {string} statusInfo 附加信息，可缺省
     * @return {Object} e-json对象
     */
    XDATASOURCE_CLASS.wrapEJson = function (data, status, statusInfo) {
        return { data: data, status: status || 0, statusInfo: statusInfo };
    };
    
    /**
     * 停止success流程，走向error流程。
     * 在parse或result中调用有效。
     * 一般用于parse或result中解析后台返回数据，
     * 发现数据错误，需要转而走向error流程的情况。
     *
     * @protected
     * @param {number=} status 错误状态码，如果不传则取DEFAULT_ERROR_STATUS
     * @param {string=} statusInfo 错误信息，可缺省
     */
    XDATASOURCE_CLASS.$goError = function (status, statusInfo) {
        this._bGoError = true;
        this._nErrorStatus = status == null ? DEFAULT_ERROR_STATUS : status;
        if (statusInfo != null) {
            this._sErrorStatusInfo = statusInfo; 
        }
    };

    /**
     * 预处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     */
    function handleSyncPreprocess(datasourceId, options) {
        handleAttr.call(this, datasourceId, 'preprocess', options);
        notifyEvent.call(this, datasourceId, 'sync.preprocess', options);
    }

    /**
     * 已有数据处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {*} data 业务数据
     */
    function handleSyncHasData(datasourceId, options, data) {
        handleAttr.call(
            this, datasourceId, 'result', options, 
            [data, this.wrapEJson(data)]
        );
        notifyEvent.call(
            this, datasourceId, 'sync.result', options, 
            [data, this.wrapEJson(data)]
        );
    }

    /**
     * 本地数据处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {(Object|string)} ejsonObj e-json对象
     */
    function handleSyncLocal(datasourceId, options, ejsonObj) {
        handleCallback.call(
            this, datasourceId, handleComplete, options, ejsonObj
        );

        if (!ejsonObj.status) { 
            // status为0则表示正常返回 (@see e-json)
            handleCallback.call(
                this, datasourceId, handleSuccess, options, ejsonObj.data, ejsonObj
            );
        }
        else {
            handleCallback.call(
                this, datasourceId, handleFailure, options, ejsonObj.status, ejsonObj
            );
        }

        handleCallback.call(
            this, datasourceId, handleFinalize, options, ejsonObj
        );
    }

    /**
     * 远程请求处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {string} url 请求url
     * @return {string} requestId 请求ID
     */
    function handleSyncRemote(datasourceId, options, url) {
        var opt = {};
        var me = this;
        var paramStr;

        // 准备ajax参数
        opt.method = 
            handleAttr.call(me, datasourceId, 'method', options) 
            || 'POST';

        opt.businessKey = 
            handleAttr.call(me, datasourceId, 'businessKey', options);

        opt.data = 
            hasValue(
                paramStr = handleAttr.call(me, datasourceId, 'param', options)
            )
            ? paramStr : '';

        opt.timeout = 
            handleAttr.call(me, datasourceId, 'timeoutTime', options) 
            || undefined;

        opt.onsuccess = function (data, ejsonObj) {
            handleCallback.call(
                me, datasourceId, handleSuccess, options, data, ejsonObj
            );
        };

        opt.onfailure = function (status, ejsonObj) {
            handleCallback.call(
                me, datasourceId, handleFailure, options, status, ejsonObj
            );
        };

        opt.oncomplete = function (ejsonObj) {
            handleCallback.call(
                me, datasourceId, handleComplete, options, ejsonObj
            );
            // 清除requestId
            delete me._oRequestSet[requestId];
        };

        opt.onfinalize = function (ejsonObj) {
            handleCallback.call(
                me, datasourceId, handleFinalize, options, ejsonObj
            );
        };

        opt.ontimeout = function () {
            handleCallback.call(
                me, datasourceId, handleTimeout, options
            );
        };

        opt = extend(
            opt, 
            handleAttr.call(me, datasourceId, 'ajaxOptions', options) || {}
        );
        
        this._sBusinessKey = opt.businessKey;

        // 发送ajax请求
        var requestId = xajax.request(url, opt);
        this._oRequestSet[requestId] = 1;

        return requestId;
    }

    /**
     * 回调处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Function} callback 回调
     * @param {Object} options 参数
     */    
    function handleCallback(datasourceId, callback, options) {
        var args= sliceArray.call(arguments, 3, arguments.length);

        callback.apply(this, [datasourceId, options].concat(args));

        var i;
        var o;
        var list;

        // sync combines
        if (hasValue(datasourceId)) {
            list = this._oSyncCombineSet[datasourceId] || [];
            for (i = 0; o = list[i]; i++) {
                callback.apply(o, [datasourceId, {}].concat(args));
            }
        }

        list = this._aSyncCombineSetDefault || [];
        for (i = 0; o = list[i]; i++) {
            callback.apply(o, [datasourceId, {}].concat(args));
        }
    }
    
    /**
     * 回调处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {*} data 业务数据
     * @param {(Object|string)} ejsonObj e-json对象
     */    
    function handleSuccess(datasourceId, options, data, ejsonObj) {
        this._bGoError = false;

        function goFailure() {
            if (this._sErrorStatusInfo != null) {
                ejsonObj.statusInfo = this._sErrorStatusInfo;
            }
            handleCallback.call(
                this, 
                datasourceId, 
                handleFailure, 
                options, 
                this._nErrorStatus, 
                ejsonObj
            );
            this._bGoError = false;
            this._nErrorStatus = null;
            this._sErrorStatusInfo = null;
        }
        
        var data = handleAttr.call(
            this, datasourceId, 'parse', options, [data, ejsonObj]
        );
        if (this._bGoError) {
            goFailure.call(this);
            return;
        }

        handleAttr.call(
            this, datasourceId, 'result', options, [data, ejsonObj]
        );
        if (this._bGoError) {
            goFailure.call(this);
            return;
        }

        notifyEvent.call(
            this, datasourceId, 'sync.result', options, [data, ejsonObj]
        );
    }
    
    /**
     * 失败处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {number} status 返回状态
     * @param {(Object|string)} ejsonObj e-json对象
     */    
    function handleFailure(datasourceId, options, status, ejsonObj) {
        handleAttr.call(
            this, datasourceId, 'error', options, [status, ejsonObj]
        );
        notifyEvent.call(
            this, datasourceId, 'sync.error', options, [status, ejsonObj]
        );        
    }

    /**
     * 请求完结处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {(Object|string)} ejsonObj e-json对象
     */    
    function handleComplete(datasourceId, options, ejsonObj) {
        handleAttr.call(
            this, datasourceId, 'complete', options, [ejsonObj]
        );
        notifyEvent.call(
            this, datasourceId, 'sync.complete', options, [ejsonObj]
        );        
    }
    
    /**
     * 请求最终处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     * @param {(Object|string)} ejsonObj e-json对象
     */    
    function handleFinalize(datasourceId, options, ejsonObj) {
        handleAttr.call(
            this, datasourceId, 'finalize', options, [ejsonObj]
        );
        notifyEvent.call(
            this, datasourceId, 'sync.finalize', options, [ejsonObj]
        );        
    }
    
    /**
     * 请求超时处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {Object} options 参数
     */    
    function handleTimeout(datasourceId, options) {
        handleAttr.call(this, datasourceId, 'timeout', options);
        notifyEvent.call(this, datasourceId, 'sync.timeout', options);
    }
    
    /**
     * 属性处理
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {string} name 属性名
     * @param {Object} options 参数
     * @param {Array} args 调用参数
     */    
    function handleAttr(datasourceId, name, options, args) {
        options = options || {};
        args = args || [];
        args.push(options);
        
        var o;
        var datasourceId;

        // 优先使用options中的定义
        if (typeof options[name] != 'undefined') {
            o = options[name];
        } 
        else {
            // 次优先使用不分datasourceId的通用定义
            o = this[name];
            // 再次使用每个datasourceId的各自定义
            if (hasValue(datasourceId) 
                && isObject(o) 
                && hasValue(o[datasourceId])
            ) {
                o = o[datasourceId];
            }
        }

        if (o instanceof SET) { o = null; }

        return isFunction(o) ? o.apply(this, args) : o;
    }
    
    /**
     * 触发事件
     *
     * @private
     * @param {string} datasourceId 数据源id
     * @param {string} eventName 事件名
     * @param {Object} options 参数
     * @param {Array} args 调用参数
     */    
    function notifyEvent(datasourceId, eventName, options, args) {
        options = options || {};
        args = args || [];
        args.push(options);
        if (hasValue(datasourceId)) {
            this.notify(eventName + '.' + datasourceId, args);
        }
        this.notify(eventName, args);        
    }

    /**
     * 获得数据源id
     *
     * @private
     * @param {Object} options 参数
     * @return {string} 数据源id
     */    
    function getDatasourceId (options) {
        options = options || {};
        var datasourceId = hasValue(options.datasourceId) 
            ? options.datasourceId : this.datasourceId;
        return isFunction(datasourceId) 
            ? datasourceId.call(this, options) : datasourceId;
    }
    
    //-------------------------------------------------------------
    // [多XDatasource组合/绑定]                                               
    //-------------------------------------------------------------
    
    /**
     * 为了公用sync，绑定多个XDatasource
     * 这个功能用于多个XDatasource共享一个请求的情况。
     * sync及各种事件，会分发给被绑定的XDatasource，
     * 由他们分别处理（如做请求返回值解析，取的自己需要的部分）
     *
     * @public
     * @param {xui.XDatasource} xdatasource 要绑定的XDatasource
     * @param {string} datasourceId 绑定到此datasourceId上，
     *          缺省则绑定到所有datasourceId上
     */
    XDATASOURCE_CLASS.addSyncCombine = function (xdatasource, datasourceId) {
        if (!(xdatasource instanceof XDATASOURCE)) { 
            return;
        }

        var o;
        if (hasValue(datasourceId)) {
            if (!(o = this._oSyncCombineSet[datasourceId])) {
                o = this._oSyncCombineSet[datasourceId] = [];
            }
            o.push(xdatasource);
        } 
        else {
            this._aSyncCombineSetDefault.push(xdatasource);
        }
    };
    
    /**
     * 取消绑定XDatasource
     * 这个功能用于多个XDatasource共享一个请求的情况。
     * sync及各种事件，会分发给被绑定的XDatasource，
     * 由他们分别处理（如做请求返回值解析，取的自己需要的部分）
     *
     * @public
     * @param {xui.XDatasource} xdatasource 要取消绑定的XDatasource
     * @param {string} datasourceId 与addSyncCombine的定义须一致
     */
    XDATASOURCE_CLASS.removeSyncCombine = function (xdatasource, datasourceId) {
        if (!(xdatasource instanceof XDATASOURCE)) { return; }

        var o = hasValue(datasourceId) 
                    ? (this._oSyncCombineSet[datasourceId] || []) 
                    : (this._aSyncCombineSetDefault || []);

        for (var j = 0; j < o.length;) {
            (xdatasource === o[j]) ? o.splice(j, 1) : j++;
        }
    };
    
    //-------------------------------------------------------------
    // XDatasource扩展
    //-------------------------------------------------------------
    
    /**
     * 扩展
     * （禁止对XDatasource类本身使用extend）
     *
     * @public
     * @static
     * @param {Object} clz XDatasource子类本身
     * @param {Object} options 扩展的内容 (@see OPTIONS_NAME)
     */
    XDATASOURCE.extend = function (clz, options) {
        if (clz instanceof XDATASOURCE && clz !== XDATASOURCE) {
            extend(clz.prototype, options);
        }
    };
    
})();
/**
 * xui.XView
 * Copyright 2012 Baidu Inc. All rights reserved.
 * 
 * @file:    视图基类
 * @author:  sushuang(sushuang)
 * @depend:  xutil
 * @usage:   
 *          (1) 须实现xui.XView.domReady函数
 *          (2) 页面中使用：
 *              <script type="text/javascript">
 *                  xui.XView.start("aaa.bbb.ccc.SomePageView");
 *              </script>
 *              则启动了SomePageView类
 */

(function () {
    
    var XOBJECT = xui.XObject;
    var getByPath = xutil.object.getByPath;
    var inheritsObject = xutil.object.inheritsObject;
    
    /**
     * 视图基类
     *
     * @class
     */
    var XVIEW = xui.XView = inheritsObject(XOBJECT);
    var XVIEW_CLASS = XVIEW.prototype;
    
    /**
     * 页面开始
     * 
     * @public
     * @static
     * @param {string} viewPath 页面对象的路径
     * @param {Object} options 参数 
     * @return {ecui.ui.Control} 创建的页面对象
     */    
    XVIEW.start = function (viewPath, options) {
        var viewClass;
        
        XVIEW.$domReady(
            function () {
                XVIEW.$preStart && XVIEW.$preStart(viewPath, options);

                viewPath && (viewClass = getByPath(viewPath));
                viewClass && (new viewClass(options)).init();

                XVIEW.$postStart && XVIEW.$postStart(viewPath, options);
            }
        );
    };

    /**
     * 初始前的预处理
     * 
     * @private
     * @abstract
     * @static
     * @param {string} viewPath 页面对象的路径
     * @param {Object} options 参数 
     */
    XVIEW.$preStart = function (viewPath, options) {};

    /**
     * 初始后的处理
     * 
     * @private
     * @abstract
     * @static
     * @param {string} viewPath 页面对象的路径
     * @param {Object} options 参数 
     */
    XVIEW.$postStart = function (viewPath, options) {};

    /**
     * DOM READY函数，由工程自己定义
     * 
     * @private
     * @abstract
     * @static
     * @param {Function} callback
     */
    XVIEW.$domReady = null;

})();
