/**
 * xmock
 * Copyright 2012 Baidu Inc. All rights reserved.
 *
 * @file:   提供前端mock功能，方便前端开发
 *          特点：
 *          (1) 不用开server就能调试前端。
 *          (2) 可以模拟后台的延迟返回（用timeout实现）。
 *          (3) 做mock时可以写函数，根据请求参数决定mock的请求返回值。
 *          (4) xmock将请求参数和过程打印在浏览器log上，
 *              从而可以检查请求的参数和请求先后顺序等是否正确。
 * @author: sushuang(sushuang)
 */

/**
 * xmock的实现方式：重载ajax请求，返回mock数据。
 *
 * 用法：
 * (1) xmock.register(url, mockData, options); 注册mock数据。
 *
 * @param {String} url: Ajax请求的URL，例如：'/bsc/income'。
 * @param {Object|Function} mockData: 请求返回的数据，或者获得返回数据的函数。
 *          如果是Function，则参数为：
 *          @param {string} url 请求的URL
 *          @param {Object} options 请求时的输入参数（可以在这里获得请求参数，定制响应的返回）
 * @param {Object} options: 可缺省此参数，意为{timeoutMode:1, timeout:0}
 *          {number} timeoutMode 
 *                  使用延迟，是用于模拟Ajax请求的异步性。
 *                  延迟的方式：
 *                      "1"：固定延迟时间（默认），
 *                      "2"：随机延迟时间。
 *                      "3": 不使用延迟（非异步方式），
 *          {number} timeout 使用固定延迟时间方式时，延迟的时间
 *          {number} timeoutUpper 使用随机延迟时间方式时，时间范围上界
 *          {number} timeoutLower 使用随机延迟时间方式时，时间范围下界
 * 
 * (2) xmock.unregister(url); 解除注册mock数据。
 * 
 * (3) fmock.parseParam('asdf=123&qwer=654365&t=43&t=45&t=67'); 一个将请求参数转换为对象工具函数
 *          其中如上例，返回对象{asdf:123, qwer:654365, t: [43, 45, 67]}
 */
var xmock = {};

/** 
 * 默认支持tangram的Ajax适配。
 * 如果使用其他的ajax适配，修改此处。
 * 
 * xmock.ajax约定的参数格式：
 * @param {String} url Ajax请求的URL。
 * @param {String} options
 *          {Function} onsuccess 请求成功的回调函数，可缺省。
 *          {String} method 请求的方式是GET或PUT或其他，可缺省。
 */
(function () {
    // Adapter of tangram
    var tangramAdapter = {
        ajaxFuncPath: 'baidu.ajax',
        ajaxFuncName: 'request',
        ajaxFuncHook: function(url, options) {
            xmock.ajax(url, options);
            return {
                abort: function() {}
            };
        },
        stringify: baidu.json.stringify
    }
    xmock.adapter = tangramAdapter;
})();



(function() {

    var _mocks = [];
    
    var _oldAjax = {};
    
    xmock.init = function(adapter) {
        adapter = adapter || xmock.adapter;
        _oldAjax = eval('window.' + adapter.ajaxFuncPath + '.' + adapter.ajaxFuncName);
        eval('window.' + adapter.ajaxFuncPath)[adapter.ajaxFuncName] = adapter.ajaxFuncHook;
        xmock.stringify = adapter.stringify;
    }

    xmock.ajax = function(url, options) {
        var mockFound = false;

        for(var i = 0, mock, u, v; i < _mocks.length; i ++) {
            if (mock = _mocks[i]) {
                u = isFunction(mock.url) ? mock.url() : mock.url;
                if (url.indexOf(u) == 0) {
                    mockFound = true;
                    isFunction(v = mock.mockData) && (v = v(url, options));
                    mockInvoke(url, options, v, mock.options);
                }
            }
        }

        !mockFound && (_oldAjax.call(null, url, options));
    }

    function findMock(url) {
        for (var i = 0, m; i < _mocks.length; i ++) {
            if ((m = _mocks[i]) && m.url == url) {
                return { index: i, mock: m };
            }
        }
        return { index: -1 };
    }

    function mockInvoke(url, options, v, mockOptions) {

        var timeout = 0, 
            onsuccess = options.onsuccess || new Function(),
            xhr = {'responseText': xmock.stringify(v || '')};
        
        log('    [xmock request] ' + (options.method || '').toUpperCase() + ' ' + url + ' ' + (options.data || ''));
        
        if(mockOptions.timeoutMode == 3) {
            log('[xmock response] immidietely invoke callback for: ' + url);
            onsuccess(xhr, xhr.responseText);

        } else {
            if(mockOptions.timeoutMode == 1) {
                timeout = mockOptions.timeout || 0;
            } else if(mockOptions.timeoutMode == 2) {
                timeout = Math.round(Math.random() * (mockOptions.timeoutUpper - mockOptions.timeoutLower) + mockOptions.timeoutLower);
            }
            window.setTimeout(function () {
                log('              [xmock response] timeout end, invoke callback for: ' + url);
                onsuccess(xhr, xhr.responseText);
            }, timeout);
        }
    }

    xmock.unregister = function(url) {
        var index = findMock(url).index;
        if (index >= 0) {
            _mocks.splice(index, 1);
        }
    }

    xmock.register = function(url, mockData, options) {
        if (findMock(url).mock) {
            throw Error('duplicate url = [' + url + ']');
            return;            
        }
        
        if (!options) { // default
            options = {timeoutMode: 1, timeout: 0};   
        }
        
        if(options.timeoutMode == 1 
            && ( !hasValue(options.timeout) || options.timeout < 0 )) {
            throw new Error('timeout invalid' + options.timeout);
        }
        if(options.timeoutMode == 2 
            && ( !hasValue(options.timeoutUpper) || !hasValue(options.timeoutLower) 
            || options.timeoutUpper < 0 || options.timeoutLower < 0 
            || options.timeoutUpper < options.timeoutLower )) {
            throw new Error('timtout invalid' + options.timeoutUpper + ' ' + options.timeoutLower);
        }

        _mocks.push({ url: url, options: options, mockData: mockData });
    }
    
    xmock.parseParam = function (url) {
        var paramStr;
        if (url.indexOf('?') >= 0) {
            var arr = url.split('?');
            paramStr = arr[1];
        }
        else {
            paramStr = url;
        }
        
        if (!hasValue(paramStr)) {
            return paramMap;
        }

        var paramMap = {}, paramArr, i, len, o;
        paramArr = paramStr.split('&');
        for (i = 0, len = paramArr.length; i < len; i++) {
            o = hasValue(paramArr[i]) ? paramArr[i] : '';
            o = o.split('=');
            if (!hasValue(o[0])) { continue; }
            if (paramMap.hasOwnProperty(o[0])) {
                if (Object.prototype.toString.call(paramMap[o[0]]) == '[object Array]') {
                    paramMap[o[0]].push(o[1]);
                } else {
                    paramMap[o[0]] = [paramMap[o[0]], o[1]];   
                }
            } else {
                paramMap[o[0]] = o[1];   
            }
        }
        return paramMap;
    }
    
    function log(msg) {
        if( isObject(window.console) && isFunction(window.console.log)) {
            window.console.log(msg);
        }
    }
    
    function isObject (obj) {
        return obj === Object(obj);
    }
    
    function isFunction (obj) {
        return Object.prototype.toString.call(obj) == '[object Function]';
    }
    
    function hasValue (variable) {
        return variable != null; // undefined == null, others not
    }

})();

/**
 * Initialize
 */
xmock.init();
