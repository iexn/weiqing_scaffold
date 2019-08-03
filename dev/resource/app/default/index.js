define(function (require, exports) {

    var wx = require('wx'),
        weui = require('weui'),
        $ = require('jquery'),
        Vue = require('vue'),
        VueLazyload = require('vue-lazyload');
    Vue.use(VueLazyload, {
        preLoad: 1.3,
        error: '',
        loading: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
        attempt: 1
    });

    var convertBase64UrlToBlob = function convertBase64UrlToBlob (urlData) {
        var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
    var canvasDataURL = function canvasDataURL (path, obj, callback) {
        var img = new Image();
        img.src = path;
        img.onload = function(){
         var that = this;
         // 默认按比例压缩
         var w = that.width,
          h = that.height,
          scale = w / h;
          w = obj.width || w;
          h = obj.height || (w / scale);
         var quality = 0.7;  // 默认图片质量为0.7
         //生成canvas
         var canvas = document.createElement('canvas');
         var ctx = canvas.getContext('2d');
         // 创建属性节点
         var anw = document.createAttribute("width");
         anw.nodeValue = w;
         var anh = document.createAttribute("height");
         anh.nodeValue = h;
         canvas.setAttributeNode(anw);
         canvas.setAttributeNode(anh); 
         ctx.drawImage(that, 0, 0, w, h);
         // 图像质量
         if(obj.quality && obj.quality <= 1 && obj.quality > 0){
          quality = obj.quality;
         }
         // quality值越小，所绘制出的图像越模糊
         var base64 = canvas.toDataURL('image/jpeg', quality);
         // 回调函数返回base64的值
         callback(base64);
       }
    }

    var photoCompress = function photoCompress (file,w,objDiv) {
        var ready = new FileReader();
        /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
        ready.readAsDataURL(file);
        ready.onload = function () {
            var re = this.result;
            canvasDataURL(re,w,objDiv)
        }
    }

    var main = function (done, App) {

        // 处理hash进场特殊动作
        location.hash = '/';

        var $vm = new Vue({
            data: {
                s: '', // 活动标识
                g: '', // 报名标识
                
                // 活动数据
                cover: '',
                reward_info: '',
                amount: '',
                counsel: '',
                rule: '',
                jim: [],
                gifts: [],
                unlock: [],

                // 报名数据
                uploads: [],
                gift_score: 0,
                gift_amount: '0',
                jim_form_text: '',
                
                // 其他数据
                rewardto_users: [],
                uploads_preview: [],
                g_preview: App.sysinfo.gets.g || '',
                support: '', // 底部文字

                // 加载中提示
                upload_loading: false,
                save_loading: false,

                // appointment跳转窗口
                appointment_register: true, // true表示打开报名窗口，否则打开提示分享窗口
                show_submit_close_button: true, // 是否显示上传图片的关闭按钮
                ready_upload: false, // 是否是报名后上传图片的步骤，如果是，点击报名窗口时跳转到上传图片窗口
                my_url: '', // 自己的报名主页
                account_qrcode_link: '', // 公众号二维码链接

                // 核销二维码地址
                cav_qrcode_link: '',
                register_cav_times: 0,
                cav_open: 'on',
                cav_on_give_gift: '0',
                can_give_gift: true,
                is_caver: false,

                // 页面效果/显示设置
                enter_bless_status: 'off', // 福袋特效
                show_call_us: 'off', // 关注我们
                show_caver_register_list: 'off', // 核销员报名名单

                my_qrcode: '', // 我的活动二维码
                
            },
            computed: {
                first_cover: function () {
                    if (this.uploads.length == 0) {
                        return '';
                    }
                    return this.uploads[0].url;
                },
            },
            methods: {
                picker_date: function (e) {
                    var _this = e.target;
                    weui.datePicker({
                        start: 1990,
                        end: 2019,
                        // defaultValue: [1991, 6, 9],
                        onConfirm: function(result){
                            _this.value = result[0].value + '-' + result[1].value + '-' + result[2].value;
                        },
                    });
                },
                submit_register: function (e) {
                    var _this = this;
                    e.preventDefault();
                    var cr = weui.confirm('确认提交？', function () {
                        _this.$refs.submit_register_btn.disabled = true;
                        _this.$refs.submit_register_btn.innerHTML = '<b>报名中...</b>';
                        $.post(App.url('m/register'), $(e.target).serialize()).then(function (res) {
                            if (res.errno != 0) {
                                _this.$refs.submit_register_btn.disabled = false;
                                _this.$refs.submit_register_btn.innerHTML = '<b>立即报名</b>';
                                weui.alert(res.message);
                                return false;
                            }
                            _this.g_preview = res.data.g;
                            _this.ready_upload = true;
                            location.href = '#/upload_cover';
                        }).fail(function () {
                            _this.$refs.submit_register_btn.disabled = false;
                            _this.$refs.submit_register_btn.innerHTML = '<b>立即报名</b>';
                            weui.alert('服务器异常，请稍后重试');
                        });
                    });
                },
                submit_save_upload: function (e) {
                    var _this = this;
                    e.preventDefault();
                    var cf = weui.confirm('确认提交？', function () {
                        _this.save_loading = true;
                        var covers = [];
                        _this.uploads_preview.map(function (item) {
                            covers.push(item.path);
                        });
                        $.post(App.url('m/save_update'), {
                            g: _this.g_preview,
                            covers: covers
                        }).then(function (res) {
                            if (res.errno != 0) {
                                _this.save_loading = false;
                                cf.hide(function () {
                                    weui.alert(res.message);
                                })
                                return false;
                            }
                            
                            weui.toast(res.message, {
                                duration: 1000,
                                callback: function() {
                                    location.href = res.data.url
                                }
                            })
                        }).fail(function () {
                            _this.save_loading = false;
                            weui.alert('服务器异常，请稍后重试');
                        });
                    });
                },
                upload: function (e) {
                    var _this = this;
                    var input = e.target;
                    if (input.value == '') {
                        return false;
                    }
                    this.upload_loading = true;
                    var fd = new FormData();
                    var img = input.files[0];

                    var to_upload = function (img) {
                        fd.append('image', img, "file_"+Date.parse(new Date())+".jpg");
                        $.ajax({
                            url: App.url('w7/upload_image'),
                            type: 'POST',
                            data: fd,
                            cache: false,
                            processData: false,
                            contentType: false
                        })
                        .then(function (res) {
                            _this.upload_loading = false;
                            if (res.errno != 0) {
                                weui.alert(res.message);
                                return false;
                            }
                            _this.uploads_preview.push({
                                path: res.data.path,
                                url: res.data.url
                            });
                        });
                    }

                    // 大于1M时压缩图片
                    if (img.size > 1024 * 1024) {
                        photoCompress(img, {
                            quality: 0.2
                        }, function(base64Codes){
                            var bl = convertBase64UrlToBlob(base64Codes);
                            to_upload(bl);
                        })
                    } else {
                        to_upload(img);
                    }
                },
                remove_upload: function (u) {
                    if (!confirm('确定删除这张图片吗？')) {
                        return false;
                    }
                    this.uploads_preview.splice(this.uploads_preview.indexOf(u), 1);
                },
                rewardto_gift: function (e) {
                    e.preventDefault();
                    var _this = this;
                    this.$refs.fix_appointment_btn.innerHTML = '请稍后...';
                    this.$refs.fix_appointment_btn.disabled = true;

                    $.post(App.url('m/rewardto'), $(e.target).serialize()).then(function (res) {
                        if (res.errno != 0) {
                            weui.alert(res.message, function () {
                                _this.$refs.fix_appointment_btn.innerHTML = '赠送礼物';
                                _this.$refs.fix_appointment_btn.disabled = false;
                            });
                            return false;
                        }

                        // 支付
                        if (res.data.action == 'pay') {
                            App.wx.pay({
                                fee: res.data.fee,
                                title: res.data.title,
                                sn: res.data.sn,
                                done: function () {
                                    weui.toast('赠送成功', {
                                        duration: 1000,
                                        callback: function () {
                                            location.reload();
                                        }
                                    });
                                }
                            });
                            _this.$refs.fix_appointment_btn.innerHTML = '赠送礼物';
                            _this.$refs.fix_appointment_btn.disabled = false;
                        } else if (res.data.action == 'tolink_pay') {
                            var ls = {
                                sn: res.data.sn,
                                result: 'wait',
                                time: res.data.time
                            };
                            window.localStorage.setItem('pay', JSON.stringify(ls));
                            location.href = res.data.payment;
                        } else if (res.data.action == 'redirect') {
                            location.hash = '/';
                            weui.toast('赠送成功', {
                                duration: 1000,
                                callback: function () {
                                    location.reload();
                                }
                            });
                        }
                    }).fail(function () {
                        weui.alert('服务器异常，请稍后再试');
                        this.$refs.fix_appointment_btn.innerHTML = '赠送礼物';
                        this.$refs.fix_appointment_btn.disabled = false;
                    });
                },
                img2base64: function (e) {
                    this.cav_qrcode_link = e.src;
                },
                // 初始化活动主数据和功能
                init_active: function (active) {
                    var _this = this;
                    // 关闭弹层
                    $('.layouter-close').on('click', function () {
                        location.hash = '/';
                    });
                    
                    document.title = active.title;

                    this.s                        = active.s;
                    this.g                        = App.sysinfo.gets.g || '';
                    this.cover                    = active.cover;
                    this.reward_info              = active.reward_info;
                    this.amount                   = active.amount;
                    this.counsel                  = active.counsel;
                    this.rule                     = active.rule;
                    this.cav_open                 = active.cav_open;
                    this.cav_on_give_gift         = active.cav_on_give_gift;
                    this.enter_bless_status       = active.enter_bless_status;
                    this.show_call_us             = active.show_call_us;
                    this.show_caver_register_list = active.show_caver_register_list;

                    this.gifts.push(...active.gift);
                    this.unlock.push(...active.unlock);
                    
                    for (var i in active.jim) {
                        var j = active.jim[i];
                        j.value = '';
                        this.jim.push(j);
                    }

                    // 倒计时
                    if (active.arrive_time > 0) {
                        this.$refs.details_countdown_timeout.innerHTML = '活动未开始';
                    } else if (active.out_time < 0) {
                        this.$refs.details_countdown_timeout.innerHTML = '活动结束';
                    } else {
                        var s = setInterval(function () {
                            var out_time = active.out_time;
                            if (out_time <= 0) {
                                _this.$refs.details_countdown_timeout.innerHTML = '活动结束';
                                clearInterval(s);
                                return false;
                            }

                            var second = out_time % 60;
                            out_time -= second;
                            var minute = out_time % 3600 / 60;
                            var hour = Math.floor(out_time / 3600);

                            var text =  hour + "时" + minute + "分" + second + "秒";
                            
                            _this.$refs.details_countdown_timeout.innerHTML = "活动倒计时：" + text;

                            active.out_time -= 1;
                        }, 1000);
                    }

                    // 音乐
                    // 微信兼容处理
                    wx.ready(function () {
                        var music = document.createElement('audio');
                        music.loop = true;
                        music.volume = 1;
                        music.src = active.music;
                        $('.fix-music').on('click', function () {
                            if (music.paused) {
                                $(this).addClass('on');
                                music.play();
                            } else {
                                $(this).removeClass('on');
                                music.pause();
                            }
                        });
                        WeixinJSBridge.invoke('getNetworkType', {}, function (e) {
                            $('.fix-music').trigger('click');
                        }, false);
                    });

                    // 排行榜链接
                    this.$refs.rank_link.href = App.url('p/rank', {
                        s: this.s,
                        g: this.g
                    });

                    // 加减号
                    $('.input-inc button').on('click', function () {
                        var step = ~~$(this).attr('data-step');
                        var value = ~~$('.input-inc input').val() + step;
                        if (value < 1) {
                            value = 1;
                        }
                        $('.input-inc input').val(value);
                    });
                    
                },
                // 初始化分享功能
                init_share: function (share) {
                    if (typeof share != 'object') {
                        return false;
                    }
                    var shareConfig = {
                        title : share.title,
                        desc  : share.desc,
                        imgUrl: share.imgUrl,
                        link  : share.link,
                        done  : function () {
                            $.get(share.done_url);
                        }
                    };

                    App.wx.shareMessage(shareConfig);
                    App.wx.shareTimeline(shareConfig);
                },
                // 初始化报名数据
                // 必须在活动数据初始化之后设置
                init_register: function (register) {
                    this.gift_score         = register.gift_score || 0;
                    this.gift_amount        = register.gift_amount || 0;
                    this.jim_form_text      = register.jim_form_text || '';
                    this.cav_qrcode_link    = register.cav_qrcode_link || '';
                    this.register_cav_times = register.cav_times || 0;

                    if (register.jim) {
                        this.jim.length = 0;
                        for (var i in register.jim) {
                            var j = register.jim[i];
                            j.placeholder = '';
                            this.jim.push(j);
                        }
                    }

                    this.uploads.push(...register.covers);
                    if (register.openid == App.sysinfo.openid) {
                        this.uploads_preview.push(...register.covers);
                    }

                },
                // 初始化其他数据
                init_others: function () {
                    this.support = App.sysinfo.config.support;
                },
                // 导出到excel
                export_register: function () {
                    location.href = App.url('p/export_register', {
                        s: this.s
                    });
                },
                bless_animate: function (is_highlight) {
                    if (is_highlight) {
                        setTimeout(function () {
                            $('.enter-bless').addClass('enter-bless-on');
                        }, 500);
            
                        $('.fix-bless-mask').on('click', function () {
                            $('.enter-bless').removeClass('enter-bless-on');
                            setTimeout(function () {
                                $('.enter-bless').addClass('enter-bless-state');
                            }, 300);
                            setTimeout(function () {
                                $('.enter-bless-state').addClass('enter-bless-state-on');
                            }, 500);
                        });
                    } else {
                        $('.enter-bless').addClass('enter-bless-state enter-bless-state-on');
                    }
                }
            },
            filters: {
                encodeUnicode: function (str) {
                    var res = [];
                    for (var i = 0; i < str.length; i++) {
                        res[i] = ( "00" + str.charCodeAt(i).toString(16) ).slice(-4);
                    }
                    return "\\u" + res.join("\\u");
                },
                decodeUnicode: function (str) {
                    str = str.replace(/\\/g, "%");
                    return unescape(str);
                },
                amount_text: function (val) {
                    if (val == 0) {
                        return '免费';
                    }
                    return '￥' + val;
                }
            },
        });
        
        $.post(App.url('m/detail'), {
            s: App.sysinfo.gets.s,
            g: App.sysinfo.gets.g
        }).then(function (res) {

            // 强制跳转
            if (res.errno == 6) {
                location.replace(res.data.url);
                return;
            }

            /**
             * 初始化控制变量
             */
            if (res.data.register && App.sysinfo.openid != res.data.register.openid) {
                // 这个变量true表示需要去提交信息，不是已经提交过信息
                $vm.appointment_register = true;
            } else {
                $vm.appointment_register = false;
            }
            
            if (res.data.active.cav_open == 'on' && res.data.active.cav_on_give_gift > 0) {
                // 这个参数为false标识不可以接收礼物
                $vm.can_give_gift = false;
            } else {
                $vm.can_give_gift = true;
            }

            $vm.my_url = res.data.my_url;

            /**
             * 构建页面结构
             */
            $vm.$mount('#app');
            
            /**
             * 构建页面路由
             * 必须放在构建页面结构步骤之后
             */
            App.router.route('/', function () {
                $('.fix-layouter').removeClass('on');
            });
            $('.fix-layouter[data-layout-router-name]').each(function (index, item) {
                var router_name = $(this).attr('data-layout-router-name');
                var _this = this;
                App.router.route(router_name, function () {
                    // 需要注册时，打开福袋跳转报名页
                    if (router_name == '/appointment_over' && $vm.appointment_register) {
                        location.href = '#/appointment';
                        return;
                    }
                    // 示例活动时，打开送礼跳转报名页
                    if (router_name == '/gift' && res.data.action == 'preview') {
                        location.href = '#/appointment';
                        return;
                    }
                    // 已报名活动，打开报名页跳转已报名提示页
                    if (router_name == '/appointment' && res.data.my_url != '' && ('openid' in res.data.register) && res.data.register.openid != App.sysinfo.openid) {
                        location.href = '#/redirect_my';
                    }
                    if (router_name == '/redirect_my' && res.data.my_url == '') {
                        location.href = '#/appointment';
                    }
                    if (router_name == '/appointment' && $vm.ready_upload) {
                        location.href = '#/upload_cover';
                    }
                    if (router_name == '/export') {
                        if (res.data.is_caver == true) {
                            // 加载报名数据
                            $.post(App.url('m/getRank'), {
                                s: App.sysinfo.gets.s
                            }).then(function (res) {
                                var html = '';
                                if (res.data.length > 0) {
                                    for (var i in res.data) {
                                        var item = res.data[i],
                                            index = +i + 1;
                                        html += '<tr><td class="text-center"><td><div class="avatar" data-src="'+item.avatar+'" style="background-image:url(data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=)"></div></td><td>'+item.name+'</td><td>赞个数:<span class="lighthigh">'+item.gift_score+'</span></td><td>已收到:<span class="lighthigh">￥'+item.gift_amount+'</span></td><td>'+item.cav_status_name+'</td></tr>';
                                    }
                                } else {
                                    html += '<tr><td class="text-center" colspan="5" style="line-height:8rem">暂无数据</td></tr>'
                                }
                                document.querySelector('.rank-list').innerHTML = html;
                                done();
                            }).fail(function () {
                                done(false);
                            });
                        } else {
                            location.href = '#/';
                        }
                    }
                    $('.fix-layouter').removeClass('on');
                    $(_this).addClass('on');
                });
            });
            App.router.init();

            /**
             * 返回错误强制转换页面
             */
            if (res.errno != 0) {
                
                var action = res.data.action;
                var active = res.data.active;
                var register = res.data.register;
                switch(action) {
                    case 'preview':
                        $vm.init_active(active);
                        // $vm.uploads.push(...register.covers);
                        $vm.init_share(res.data.share);
                        $vm.init_register(register);
                        $vm.init_others();
                        $vm.account_qrcode_link = res.data.account_qrcode_link || '';
                        $vm.bless_animate($vm.enter_bless_status == 'highlight');
                        $vm.is_caver = res.data.is_caver || false;
                        done();
                    break;
                    case 'register':
                        // 这步直接显示填写表单，表单数据从返回内容中接收
                        $vm.init_active(active);
                        $vm.appointment_register = true;
                        done();
                        location.href = '#/appointment';
                    break;
                    case 'upload_cover':
                        $vm.s = active.s;
                        $vm.g = App.sysinfo.gets.g || '';
                        $vm.show_submit_close_button = false;
                        done();
                        location.href = '#/upload_cover';
                    break;
                    default:
                        done(false);
                        weui.alert(res.message, function () {
                            history.back();
                        });
                }
                window.$vm = $vm;
                return false;
            }

            /**
             * 否则赋初值
             */
            var active = res.data.active;
            var register = res.data.register;
            var rewardto_users = res.data.rewardto_users;

            $vm.init_active(active);
            $vm.init_share(res.data.share);
            $vm.init_register(register);
            $vm.init_others();
            $vm.account_qrcode_link = res.data.account_qrcode_link || '';
            $vm.my_qrcode = res.data.my_qrcode || '';
            $vm.is_caver = res.data.is_caver || false;
            
            if ('is_first_view' in res.data.register && res.data.register.is_first_view == 'true' && $vm.show_call_us == 'on') {
                location.href = '#/call-us';
            }

            if (!$vm.appointment_register) {
                $vm.$refs.appointment_link.href = '#/menu';
                $vm.$refs.appointment_name.innerHTML = '我的预约';
            }

            $vm.rewardto_users.push(...rewardto_users);

            // 后台控制
            $vm.bless_animate($vm.enter_bless_status == 'highlight');

            if ($vm.show_call_us != 'on') {
                $('.fix-call-us').remove();
            }
            if ($vm.show_caver_register_list != 'on') {
                $('.fix-export').remove();
            }

            done();

        }).fail(function () {
            alert('页面读取失败，请重试');
            done(false);
        });
    }

    exports.run = main;
});