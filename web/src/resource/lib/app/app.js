define(function (require, exports, module) {

    var wx = require('wx'),
        _ = require('lodash'),
        $ = require('jquery');

    var sysinfo = {},
        App = {}

    // 注册jssdk
    function init(url, options) {

        if (type(options) == 'function') {
            options = {
                done: options
            };
        }

        options = _.defaults(options, {
            before: function () { },
            done: function (is_complete) { return true; },
            fail: function () { }
        }, options);

        if (options.before() === false) {
            return false;
        }

        $.post(url, {
            url: location.href
        }).then(function (res) {
            var data = res;
            if (data.errno != 0) {
                options.fail(data.message, data.data);
                return false;
            }

            App.sysinfo = sysinfo = data.data;

            wx.config(data.data.account.jssdkconfig);

            ready(function (is_ready) {
                if (is_ready === false) {
                    document.querySelector('#loading').remove();
                    return false;
                }
                options.done(function (callback) {
                    if (callback === false) {
                        document.querySelector('#loading').remove();
                        return false;
                    }
                    type(callback) == 'function' && callback();
                    document.querySelector('#loading').remove();
                    document.querySelector('#app').style.display = 'block';
                    document.querySelector('#app').style.visibility = 'visible';
                    document.querySelector('#app').style.opacity = '1';
                }, sysinfo);
            });

        }).fail(function (e) {
            console.error(e);
            options.fail(false);
        });
    }

    function type(mixed) {
        if (typeof mixed != 'object') {
            return typeof mixed;
        }
        return Object.prototype.toString.call(mixed).slice(8, -1).toLowerCase();
    }

    function trimMenu() {
        wx.hideAllNonBaseMenuItem();
        wx.showMenuItems({
            menuList: [
                "menuItem:share:appMessage",
                "menuItem:share:timeline",
                "menuItem:share:brand"
            ]
        });
    }

    function ready(callback) {
        // 非微信终端开发时填写以下两句
        // callback && callback(true);
        // return false;
        // ---
        wx.ready(function () {
            trimMenu();
            callback && callback(true);
        });
        wx.error(function (res) {
            callback && callback(false, res);
        });
    }

    function web2app_url(action, gets, hash, addr) {
        // 微擎地址处理方案
        var local = sysinfo.siteroot + 'app/index.php';
        var url = addr || local;

        if (action.indexOf('/') != -1) {
            var actions = action.split('/');
            gets = gets || {};
            action = actions[0];
            gets.et = actions[1];
        }

        var params = _.defaults(gets, {
            i: sysinfo.acid,
            c: 'entry',
            do: action,
            m: sysinfo.module.name
        });
        return parseUrl(url, params, hash);
    }

    function parseUrl(url, params, hash) {
        var addr = url || '';
        var p = [];
        for (var i in params) {
            p.push(i + "=" + encodeURI(params[i]));
        }
        addr += "?" + p.join("&");
        if (typeof hash != "undefined") {
            addr += "#" + hash;
        }
        return addr;
    }

    /* **************************************** */
    /* 微信能力 */

    /**
     * 打开扫描功能
     * @param {function} callback 如果只返回扫描内容，在此函数中获取
     * @param {Object} options 配置项，包括text:true|false，type:1|2|0
     */
    function scan(callback, options) {

        options = _.defaults(options, {
            text: true, // 是否只返回显示的文字
            type: 2 // 可扫描类型，1一维码 2二维码 0全部类型
        });

        var scanType;
        switch (options.type) {
            case 1: scanType = ['barCode']; break;
            case 2: scanType = ['qrCode']; break;
            case 0: default: scanType = ['qrCode', 'barCode'];
        }

        wx.ready(function () {
            wx.scanQRCode({
                needResult: options.text == false ? 0 : 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: scanType, // 可以指定扫二维码还是一维码，默认二者都有
                success: function (result) {  // needResult=1时触发
                    if (result.errMsg == 'scanQRCode:ok') {
                        callback && callback(result.resultStr);
                    } else {
                        console.log('扫码识别错误，请重新尝试');
                    }
                }
            });
        });

    }

    /**
     * 调用微擎提供的支付参数进行支付
     * @param {Object} options 配置项，fee|title|sn|done|cancel|fail
     */
    function pay(options) {

        options = _.defaults(options, {
            fee: '',
            title: '',
            sn: '',
            done: function () { },
            cancel: function () { },
            fail: function () { },
        });

        $.post("index.php?i=" + sysinfo.uniacid + "&j=" + sysinfo.acid + "&c=entry&m=core&do=pay&iswxapp=0", {
            method: 'wechat',
            tid: options.sn,
            title: options.title,
            fee: options.fee,
            module: sysinfo.module.name
        }).then(function (e) {
            if (typeof e == 'string') {
                e = $.parseJSON(e);
            }

            if (e.message.errno != 0) {
                options.fail(e.message)
                return false;
            }

            var res = e.message.message;

            wx.chooseWXPay({
                timestamp: res.timeStamp,   // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: res.nonceStr,    // 支付签名随机串，不长于 32 位
                package: res.package,     // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                signType: res.signType,    // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: res.paySign,     // 支付签名
                success: function (res) {
                    options.done();
                },
                cancel: function () {
                    options.cancel();
                },
                fail: function () {
                    options.fail(false);
                }
            });

        });
    }

    var shareMessageCallbackControl = true;
    function shareMessage(options) {

        shareMessageCallbackControl = true;

        options = _.defaults(options, {
            title: '',
            desc: '',
            imgUrl: '',
            link: location.href,
            done: function () { }
        });

        wx.updateAppMessageShareData({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: options.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareMessageCallback(options.done, e);
            }
        });
        wx.onMenuShareAppMessage({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: options.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareMessageCallback(options.done, e);
            }
        });
    }

    function shareMessageCallback(callback, e) {
        if (shareMessageCallbackControl) {
            callback(e);
        }
        shareMessageCallbackControl = false;
    }

    var shareTimelineCallbackControl = true;
    function shareTimeline(options) {

        shareTimelineCallbackControl = true;

        options = _.defaults(options, {
            title: '',
            desc: '',
            imgUrl: '',
            link: location.href,
            done: function () { }
        });

        wx.updateTimelineShareData({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: options.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareTimelineCallback(options.done, e);
            }
        });
        wx.onMenuShareTimeline({
            title: options.title, // 分享标题
            desc: options.desc, // 分享描述
            imgUrl: options.imgUrl,
            link: options.link, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            success: function (e) {
                shareTimelineCallback(options.done, e);
            }
        });
    }

    function shareTimelineCallback(callback, e) {
        if (shareTimelineCallbackControl) {
            callback(e);
        }
        shareTimelineCallbackControl = false;
    }

    function loading(el) {

        el = el || 'body';
        el = document.querySelector(el);
        var position = el.style.position;
        if (position != 'relative' && position != 'absolute' && position != 'fixed') {
            el.style.position = 'relative';
        }

        var loader = document.createElement('div');
        loader.id = 'loading_loader';
        loader.setAttribute('style', 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1');
        loader.innerHTML = '<div style="position:absolute;width:3rem;height:3rem;top:0;bottom:0;left:0;right:0;margin:auto;background-image:url(' + sysinfo.resource_url + 'loading.gif);background-size:contain;background-repeat:no-repeat"></div>';
        el.appendChild(loader);
        return {
            hide: function (callback) {
                el.removeChild(loader);
                callback && callback();
            }
        };
    }

    function type (mixed) {
        var type = typeof mixed;
        if (type != 'object') {
            return type;
        }
        type = Object.prototype.toString.call(mixed);
        return type.slice(8, -1).toLowerCase();
    }
    function is_hide (element) {
        try {
            return element.offsetParent === null;
        } catch (error) {
            return false;
        }
    }

    /**
     * 加载更多
     * @param {string|dom} selector 为添加上拉的执行范围dom
     * @param {function} callback 成功触发上拉加载的回调处理，function (done) {}
     * @param {number} offset 偏移量，向上偏移的像素值，默认为0
     */
    function loadmore(selector, callback, offset) {
        var option = {
            selector: null,
            parent: window,
            callback: function (done) {

            },
            offset: 5
        };
        if (type(selector) == 'object') {
            option = $.extend({}, option, selector);
        } else {
            option = $.extend({}, option, {
                selector: selector,
                callback: callback,
                offset: offset
            });
        }

        var upTip = $('<p>').addClass('text-center load-more').text('上拉加载更多');
        var dom = $(option.selector);
        var loading = false;
        dom.append(upTip);
        $(option.parent).on('scroll', run);

        if (!is_hide($(option.parent)[0])) {
            run();
        }

        function run() {
            var in_box = Math.abs(upTip.offset().top + upTip.height() - $(parent.parent).scrollTop() - -option.offset) < window.innerHeight;
            if (in_box && !loading) {
                loading = true;
                upTip.html('<i class="fas fa-spinner fa-spin"></i> 正在加载中');
                option.callback && option.callback(function (over) {
                    if (over) {
                        upTip.text('没有更多数据了');
                    } else {
                        upTip.text('上拉加载更多');
                        loading = false;
                    }
                }, is_hide(option.parent));
            }
        }

        return {
            run: run
        };
    }

    // 路由
    function Router() {
        this.routes = {};
        this.currentURL = '';
    }
    Router.prototype.route = function (path, callback) {
        this.routes[path] = callback || function () { };
    }
    Router.prototype.refresh = function () {
        this.currentURL = location.hash.slice(1);
        if (this.routes[this.currentURL]) {
            this.routes[this.currentURL]({
                currentUrl: this.currentURL
            });
        } else {
            this.routes['/']({
                currentUrl: '/'
            });
        };
    }
    Router.prototype.init = function () {
        window.addEventListener('load', this.refresh.bind(this), false);
        window.addEventListener('hashchange', this.refresh.bind(this), false);
    }

    // 封装函数
    exports.init  = init;
    exports.ready = ready;
    exports.wx    = {
        scan: scan,
        pay: pay,
        shareMessage: shareMessage,
        shareTimeline: shareTimeline
    };
    exports.url      = web2app_url;
    exports.router   = new Router;
    exports.loading  = loading;
    exports.loadmore = loadmore;
});