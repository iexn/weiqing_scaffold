define(function (require, exports) {

    var Swiper = require('swiper'),
        weui = require('weui');
    require('jquery.lazyload');


    var run = function (done, App) {

        s = App.sysinfo.gets.s;
        g = App.sysinfo.gets.g;
        
        $.post(App.url('m/getName'), {
            s: s,
            g: g
        }).then(function (res) {
            if (res.errno != 0) {
                weui.alert(res.message);
                done(false);
                return;
            }

            var no_register = res.data.name === false;
            var account_qrcode_link = res.data.account_qrcode_link;

            if (no_register) {
                var html = '<div class="swiper-container" style="height:100%">\
                    <div class="tag clearfix">\
                        <span class="slide-to" tabindex="0">排行榜Top100</span>\
                        <span class="slide-to" tabindex="1">活动规则</span>\
                        <span class="slide-to" tabindex="2">关注我们</span>\
                    </div>\
                    <div class="swiper-wrapper" style="padding-bottom:8rem">\
                        <div class="swiper-slide swiper-rank">\
                            <table class="table rank-list"></table>\
                        </div>\
                        <div class="swiper-slide swiper-rule">\
                            <div class="rule"></div>\
                        </div>\
                        <div class="swiper-slide swiper-call-us">\
                        </div>\
                    </div>\
                </div>\
                <a href="javascript:;" class="fix back-home">返回首页</a>';
            } else {
                var html = '<div class="swiper-container" style="height:100%">\
                    <div class="tag clearfix">\
                        <span class="slide-to" tabindex="0">排行榜Top100</span>\
                        <span class="slide-to" tabindex="1">活动规则</span>\
                        <span class="slide-to" tabindex="2"><span>'+res.data.name+'</span>收到的礼物</span>\
                    </div>\
                    <div class="swiper-wrapper" style="padding-bottom:8rem">\
                        <div class="swiper-slide swiper-rank">\
                            <table class="table rank-list"></table>\
                        </div>\
                        <div class="swiper-slide swiper-rule">\
                            <div class="rule"></div>\
                        </div>\
                        <div class="swiper-slide swiper-rewardto">\
                            <ul class="rewardto-list"></ul>\
                        </div>\
                    </div>\
                </div>\
                <a href="javascript:;" class="fix back-home">返回首页</a>';
            }

            document.querySelector('#app').innerHTML = html;

            if (!no_register) {
                var shareConfig = {
                    title: res.data.share.title,
                    desc: res.data.share.desc,
                    imgUrl: res.data.share.imgUrl,
                    link: res.data.share.link,
                    done: function () {
                        $.get(res.data.share.done_url);
                    }
                };
    
                App.wx.shareMessage(shareConfig);
                App.wx.shareTimeline(shareConfig);
            }

            main(App, s, g, no_register, account_qrcode_link);
            done();
        });
    };

    var type = function (mixed) {
        var type = typeof mixed;
        if (type != 'object') {
            return type;
        }
        type = Object.prototype.toString.call(mixed);
        return type.slice(8, -1).toLowerCase();
    }
    var is_hide = function (element) {
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
    var loadmore = function (selector, callback, offset) {
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
    
        if(!is_hide($(option.parent)[0])) {
            run();
        }
    
        function run () {
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

    var main = function (App, s, g, no_register, account_qrcode_link) {

        var rank_is_empty = true,
            rule_is_empty = true,
            rewardto_is_empty = true;

        // 返回主页链接
        document.querySelector('.back-home').href = App.url('p/index', {
            s: s,
            g: g
        });

        // 排行榜
        var load_rank = function () {
            if (!rank_is_empty) {
                return true;
            }
            var loading = App.loading('.swiper-rank');
            $.post(App.url('m/getRank'), {
                s: s
            }).then(function (res) {
                if (res.errno != 0) {
                    loading.hide(function () {
                        weui.alert(res.message);
                    });
                    return false;
                }
                var html = '';
                document.querySelector('.rank-list').innerHTML = '';
                if (res.data.length > 0) {
                    for (var i in res.data) {
                        var item = res.data[i],
                            index = +i + 1;
                        html += '<tr><td class="text-center"><span class="rank">'+index+'</span></td><td><div class="avatar" data-src="'+item.avatar+'" style="background-image:url(data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=)"></div></td><td>'+item.name+'</td><td>赞个数:<span class="lighthigh">'+item.gift_score+'</span></td><td>已收到:<span class="lighthigh">￥'+item.gift_amount+'</span></td></tr>';
                    }
                } else {
                    html += '<tr><td class="text-center" colspan="5" style="line-height:20rem">暂无数据</td></tr>'
                }
                loading.hide(function () {
                    rank_is_empty = false;
                    document.querySelector('.rank-list').innerHTML = html;
                    $('.swiper-rank [data-src]').lazyload();
                });
            }).fail(function () {
                loading.hide(function () {
                    weui.alert('服务器繁忙，请稍后再试');
                });
            });
        };
        
        // 活动规则
        var load_rule = function () {
            if (!rule_is_empty) {
                return true;
            }
            var loading = App.loading('.swiper-rule');
            $.post(App.url('m/getRule'), {
                s: s
            }).then(function (res) {
                if (res.errno != 0) {
                    loading.hide(function () {
                        document.querySelector('.rule').style.textAlign = 'center';
                        document.querySelector('.rule').style.lineHeight = '30rem';
                        document.querySelector('.rule').innerHTML = res.message;
                    });
                    return false;
                }
                var html = res.data;
                
                loading.hide(function () {
                    rule_is_empty = false;
                    document.querySelector('.rule').style.textAlign = 'unset';
                        document.querySelector('.rule').style.lineHeight = 'unset';
                    document.querySelector('.rule').innerHTML = html;
                });
            }).fail(function () {
                loading.hide(function () {
                    document.querySelector('.rule').innerHTML = '服务器繁忙，请稍后再试';
                    document.querySelector('.rule').style.textAlign = 'center';
                    document.querySelector('.rule').style.lineHeight = '30rem';
                });
            });
        };

        // 收到的礼物
        var load_rewardto = function () {
            if (no_register) {
                var html = '<p class="text-center"><img src="' + account_qrcode_link + '" style="width:80%"/></p><p class="text-center">长按识别关注公众号</p>';
                document.querySelector('.swiper-call-us').innerHTML += html;
                return;
            }


            if (!rewardto_is_empty) {
                return true;
            }
            rewardto_is_empty = false;
            var page = 1, size = 10;
            loadmore('.swiper-rewardto', function (done) {
                $.post(App.url('m/getRewardto'), {
                    s: s,
                    g: g,
                    // sort: 'rank',
                    page: page, 
                    size: size
                }).then(function (res) {
                    if (res.errno != 0) {
                        done(true);
                        return false;
                    }
                    var html = '';
                    
                    for (var i in res.data) {
                        var rewardto = res.data[i];
                        html += '<li class="clearfix">'+rewardto.name+'送出礼物【'+rewardto.gift_name+'】*'+rewardto.gift_total+'<span class="rewardto-time">'+rewardto.rewardto_time+'</span></li>';
                    }
    
                    document.querySelector('.rewardto-list').innerHTML += html;
                    if (res.data.length < size) {
                        done(true);
                    } else {
                        done();
                    }
                }).fail(function () {
                    done(true);
                });
            }, 30);

        };


        
        // 切换标签页
        var slide_change_on = function (index) {
            document.querySelectorAll('.slide-to').forEach(function (slide) {
                slide.className = 'slide-to';
            });
            document.querySelector('.slide-to[tabindex="'+index+'"]').className = 'slide-to on';
            switch (index) {
                case 0: load_rank(); break;
                case 1: load_rule(); break;
                case 2: load_rewardto(); break;
            }
        }

        var swiper = new Swiper('.swiper-container', {
            on: {
                transitionEnd: function () {
                    slide_change_on(this.activeIndex);
                }
            }
        });

        slide_change_on(swiper.activeIndex);

        document.querySelectorAll('.slide-to').forEach(function (slide) {
            slide.addEventListener('click', function (e) {
                var index = e.target.getAttribute('tabindex');
                slide_change_on(index);
                swiper.slideTo(index, 500);
            });
        });
    }

    exports.run = run;
});