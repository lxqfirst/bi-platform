/**
 * @file: 报表首页
 * @author: weiboxue(weiboxue)
 * @date: 2014-11-20
 */
$(function () {
    // dom元素容器
    var dom = {
        register_sign: $('#home-button'),
        register_top: $('.register-top'),
        sign_top: $('.sign-top'),
        body: $('body'),
        register_infor: $('.register-infor'),
        register_title: $('.register-title'),
        register: $('#register'),
        sign: $('#sign'),
        sign_usename: $('#infor-5'),
        sign_pass: $('#infor-6'),
        register_usename: $('#infor-0'),
        register_pass: $('#infor-1'),
        register_repass: $('#infor-2'),
        register_company: $('#infor-3'),
        register_email: $('#infor-4'),
        home_title: $('.home-title'),
        home_content: $('.home-content'),
        home_pic: $('.home-pic'),
        home_register_title: $('.home-register-title'),
        home_register_line: $('.home-register-line'),
        home_sign_title: $('.home-sign-title'),
        home_sign_line: $('.home-sign-line'),
        servicetype: $('#servicetype')
    };
    //输入框清空所用的判断条件数组
    var arrInpVal = [];
    /**
     * 初始化页面
     */
    function initView() {
        var $regInfo = dom.register_infor;
        //输入框清空所用的判断条件数组初始化
        for (var i = 0; i < $regInfo.length; i ++) {
            arrInpVal.push($($regInfo[i]).val());
        }
        //登录错误提示初始化
        $regInfo.siblings('div').html('');
    }
    /**
     * 页面事件绑定
     */
    function bindEvents() {
        //登录注册的事件
        fnRegisterSign();
        //输入框内容清空恢复事件
        inputText();
        //关闭登录和注册框
        closeSignReg();
        //登录事件
        signIn();
        //注册事件
        registerIn();
        // 阻止注册框事件冒泡
        dom.register_top.click(function (event) {
            event.stopPropagation();
        });
        // 阻止登录狂事件冒泡
        dom.sign_top.click(function (event) {
            event.stopPropagation();
        });
        // 点击页面非登录注册区域，关闭弹出框
        dom.body.click(function () {
            fnAnimateReturn();
        })
    }
    /**
     * 注册事件
     */
    var registerIn = function () {
        dom.register.click(function () {
            var $company = dom.register_company;
            var $email = dom.register_email;
            var $repass = dom.register_repass;
            var $pass = dom.register_pass;
            var $usename = dom.register_usename;
            var $servicetype = dom.servicetype;
            if($company.val() == arrInpVal[3]) {
                $company.next('div').html('请填写所在部门名称');
            }
            if($email.val() == arrInpVal[4]) {
                $email.next('div').html('请填写您的百度邮箱');
            }
            if($repass.val() == arrInpVal[2]) {
                $repass.next('div').html('请确认密码');
            }
            if($pass.val() == arrInpVal[1]) {
                $pass.next('div').html('请输入密码');
            }
            if($usename.val() == arrInpVal[0]) {
                $usename.next('div').html('请输入用户名');
            }
            if($pass.val() != arrInpVal[1] && $repass.val() != arrInpVal[2]) {
                if($usename.val() != arrInpVal[0] && $email.val() != arrInpVal[4]) {
                    if($company.val() != arrInpVal[3]) {
                        if($pass.val() == $repass.val()) {
                            $.ajax({
                                //客户端向服务器发送请求时采取的方式
                                type : "post",
                                cache : false,
                                //服务器返回的数据类型，可选 XML, Json, jsonp, script, html, text。
                                dataType : 'Json',
                                //指明客户端要向哪个页面里面的哪个方法发送请求
                                url : "/silkroad/register",
                                data : {
                                    name : $usename.val(),
                                    pwd : $pass.val(),
                                    department: $company.val(),
                                    email: $email.val(),
                                    serviceType: $servicetype.val()
                                },
                                //客户端调用服务器端方法成功后执行的回调函数
                                success : function(msg) {
                                    alert('注册成功,请注意查收邮件');
                                    //$.get('www.baidu.com');
                                    //$("#resText").html(msg);
                                    /*
                                     if (result.d=="success") {
                                     alert("登陆成功");
                                     } else {
                                     alert("登录失败");
                                     }*/
                                }
                            });
                        }else {
                            $pass.val('两次密码输入不一致，请重新输入');
                            $repass.val('两次密码输入不一致，请重新输入');
                            $pass.css('color', 'red');
                            $repass.css('color', 'red');
                        }
                    }
                }
            }
        });
    };
    /**
     * 登录事件
     */
    var signIn = function () {
        dom.sign.click(function () {
            var $pass = dom.sign_pass;
            var $usename = dom.sign_usename;
            if($usename.val() == arrInpVal[5]) {
                $usename.next('div').html('请填写邮箱');
            }
            if($pass.val() == arrInpVal[6]) {
                $pass.next('div').html('请输入密码');
            }
            if($usename.val() != arrInpVal[5] && $pass.val() != arrInpVal[6]) {
                $.ajax({
                    //客户端向服务器发送请求时采取的方式
                    type : "post",
                    cache : false,
                    //服务器返回的数据类型，可选 XML, Json, jsonp, script, html, text。
                    dataType : 'Json',
                    //指明客户端要向哪个页面里面的哪个方法发送请求
                    url : "/silkroad/login",
                    data : {
                        name : $usename.val(),
                        pwd : $pass.val()
                    },
                    //客户端调用服务器端方法成功后执行的回调函数
                    success : function(msg) {
                        window.location="/silkroad/index.html";
                        //$.get('www.baidu.com');
                        //$("#resText").html(msg);
                        /*
                         if (result.d=="success") {
                         alert("登陆成功");
                         } else {
                         alert("登录失败");
                         }*/
                    }
                });
            }
        });
    };
    /**
     * 关闭登录和注册框
     */
    var closeSignReg = function () {
        dom.register_title.find('div').click(function () {
            fnAnimateReturn();
        })
    };

    /**
     * 输入框获取焦点清空
     */
    var inputText = function () {
        dom.register_infor.focus(function () {
            if($(this).val() == '所属部门' || $(this).val() == '您的百度邮箱' || $(this).val() == '用户名' || $(this).val() == '密码' || $(this).val() == '确认密码' || $(this).val() == '两次密码输入不一致，请重新输入') {
                $(this).css('color', '#919191');
                $(this).val('');
                $(this).next('div').html('');
            }
        });
        var num = 0;
        dom.register_infor.blur(function () {
            if($(this).val() == '') {
                num = Number($(this).attr('id').split('-')[1]);
                $(this).val(arrInpVal[num]);
            }
        })
    };
    /**
     * 登录，注册按钮事件
     */
    var fnRegisterSign = function () {
        // 登录，注册弹出框
        dom.register_sign.find('div').click(function (event) {
            var $retitle = dom.home_register_title;
            var $sititle = dom.home_sign_title;
            var $reline = dom.home_register_line;
            var $siline = dom.home_sign_line;
            var $retop = dom.register_top;
            var $sitop = dom.sign_top;
            $retop.hide();
            $sitop.hide();
            if($(this).attr('class') == 'registration') {
                fnAnimateHide('0px', '575px', '260px', 300);
                fnAnimateShow('200px', '407px', $retitle, $reline, $retop);
            }else if($(this).attr('class') == 'experience') {
                fnAnimateHide('500px', '375px', '460px', 300);
                fnAnimateShow('-50px', '365px', $sititle, $siline, $sitop)
            }
            event.stopPropagation();
        });
        /**
         * 切换动画函数(主页元素)
         *
         * @param {string} letit 主页题目左定位距离
         * @param {string} lecon 下方文字条左定位距离
         * @param {string} lesig 登录注册按钮左定位距离
         * @param {number} time 下划线对象
         * @public
         */
        var fnAnimateHide = function (letit, lecon, lesig, time) {
            var $hotitle = dom.home_title;
            var $hocontent = dom.home_content;
            var $hosign = dom.register_sign;
            $hotitle.animate({'left': letit, 'opacity': '0'}, time, function () {
                $hotitle.hide();
            });
            $hocontent.animate({'left': lecon, 'opacity': '0'}, time, function () {
                $hocontent.hide();
            });
            $hosign.animate({'left': lesig, 'opacity': '0'}, time, function () {
                $hosign.hide();
            });
        };
        /**
         * 切换动画函数(登录注册框元素)
         *
         * @param {string} lepic 报表图片左定距离
         * @param {string} widthline 下划线长度
         * @param {object} title 登录注册标题
         * @param {object} line 下划线对象
         * @param {object} box 登录注册框体
         * @public
         */
        var fnAnimateShow = function (lepic, widthline, title, line, box) {
            var $hopic = dom.home_pic;
            $hopic.animate({'left': lepic, 'opacity': '0'}, 300, function () {
                $hopic.hide();
                title.fadeIn(200);
                line.animate({'width': widthline},300);
                box.show();
            });
        };
    };
    /**
     * 切换会主页面动画函数
     */
    var fnAnimateReturn = function () {
        var $hotitle = dom.home_title;
        var $hocontent = dom.home_content;
        var $resign = dom.register_sign;
        var $retitle = dom.home_register_title;
        var $hopic = dom.home_pic;
        var $reline = dom.home_register_line;
        var $retop = dom.register_top;
        var $sitop = dom.sign_top;
        var $sititle = dom.home_sign_title;
        var $siline = dom.home_sign_line;
        $hotitle.show();
        $hocontent.show();
        $resign.show();
        $hopic.show();
        $retop.hide();
        $sitop.hide();
        $retitle.fadeOut(200);
        $reline.animate({'width': '0px'},300);
        $sititle.fadeOut(200);
        $siline.animate({'width': '0px'},300, function () {
            $hotitle.animate({'left': '300px', 'opacity': '1'}, 300);
            $hocontent.animate({'left': '475px', 'opacity': '1'}, 300);
            $resign.animate({'left': '360px', 'opacity': '1'}, 300);
            $hopic.animate({'left': '100px', 'opacity': '1'}, 200);
        });
    };
    initView();
    bindEvents();
});