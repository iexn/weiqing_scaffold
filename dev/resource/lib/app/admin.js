define(function (require, exports) {

    var Vue = require('vue'),
        VueResource = require('vue-resource'),
        $ = require('jquery'),
        util = require('util');

    Vue.use(VueResource);
    Vue.http.options.emulateJSON = true;
    var sysinfo = window.sysinfo;

    // rgb颜色值转为十六进制颜色值
    var rgb2hex = function rgb2hex (rgb) {
        var regexp = /[0-9]{0,3}/g;
        var re = rgb.match(regexp);//利用正则表达式去掉多余的部分，将rgb中的数字提取
        var hexColor = "#"; var hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
        for (var i = 0; i < re.length; i++) {
            var r = null, c = re[i], l = c;
            var hexAr = [];
            while (c > 16) {
                r = c % 16;
                c = (c / 16) >> 0;
                hexAr.push(hex[r]);
            } hexAr.push(hex[c]);
            if (l < 16 && l != "") {
                hexAr.push(0)
            }
            hexColor += hexAr.reverse().join('');
        }
        //alert(hexColor)
        return hexColor;
    }
    var type = function type (mixed) {
        if (typeof mixed != 'object') {
            return typeof mixed;
        }
        return Object.prototype.toString.call(mixed).slice(8, -1).toLowerCase();
    }
    var get_base64_image = function get_base64_image (img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL // return dataURL.replace("data:image/png;base64,", ""); 
    }
    var img2base64 = function img2base64 (imageSelector, imageprop) {
        var imgresource = new Image();
        imgresource.src = $(imageSelector).prop(imageprop || 'src');
        imgresource.onload = function () {
            $(imageSelector).prop('src', get_base64_image(this));
        }
    }
    // 验证是否为json字符串
    var is_json_string = function is_json_string (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }
    
    // 自定义提示信息
    var frame_clearTimeout = null;
    var clear_page_tip = function clear_page_tip (callback, delay) {
        clearTimeout(frame_clearTimeout);
        delay = delay || 0;
        if (delay == 0) {
            $('#pageTip').remove();
            return true;
        }
        frame_clearTimeout = setTimeout(function () {
            $('#pageTip').remove();
            callback && callback();
        }, delay + 300)
    }
    var xalert = function xalert (message, isSuccess, closed) {

        clear_page_tip(function () {
            closed && closed(isSuccess);
        });
        if (isSuccess) {
            var template = '\
                <div id="pageTip" class="modal fade modal-success" tabindex="-1" role="dialog" aria-hidden="true" style="display: block; padding-right: 17px;">\
                    <div class="modal-dialog we7-modal-dialog">\
                        <div class="modal-content">\
                            <div class="modal-body">\
                                <div class="text-center">\
                                    <i class="text-success wi wi-success-sign"></i>'+ message + '         \
                                </div>          \
                                <div class="clearfix"></div>\
                            </div>  \
                        </div>\
                    </div>\
                </div>\
            ';
            var t = '<div class="alert alert-success" role="alert" id="pageTip" style="position:absolute;width:100%;top:50px;left:0">' + message + '</div>';
            $('body').append(template);
        } else {
            var template = '\
                <div id="pageTip" class="modal fade modal-success" tabindex="-1" role="dialog" aria-hidden="true" style="display: block; padding-right: 17px;">\
                    <div class="modal-dialog we7-modal-dialog">\
                        <div class="modal-content" style="background-color:#a94442;border-color:#a94442">\
                            <div class="modal-body">\
                                <div class="text-center">\
                                    <i class="text-error wi wi-error-sign"></i>'+ message + '         \
                                </div>          \
                                <div class="clearfix"></div>\
                            </div>  \
                        </div>\
                    </div>\
                </div>\
            ';
            var t = '<div class="alert alert-danger" role="alert" id="pageTip" style="position:absolute;width:100%;top:50px;left:0">' + message + '</div>';
            $('body').append(template);
        }
        setTimeout(function () {
            $('#pageTip').addClass('in');
        }, 1);
        clear_page_tip(function () {
            closed && closed(isSuccess);
        }, 2000);
    }


    // 功能
    
    // 全选
    $('.check-all-control').on('click', function () {
        var checkall = $('.check-all');
        var len = checkall.length;
        for (var i = 0; i < len; i++) {
            if (!$(checkall[i]).prop('checked')) {
                checkall.prop('checked', true)
                return;
            }
        }

        checkall.prop('checked', false)
    });

    // 收高度
    $('.limithigh').each(function (index, item) {
        var _this = this;
        if ($(this).height() <= 180) {
            return false;
        }
        $(this).css({
            'height': 120,
            'overflow': 'hidden',
            'position': 'relative'
        });
        var showBoth = $('<div>').css({
            'position': 'absolute',
            'bottom': '0',
            'left': '0',
            'z-index': '999',
            'width': '100%',
            'height': '80',
            'text-align': 'center',
            'background-image': 'linear-gradient(-180deg,rgba(255,255,255,0) 0%,#fff 70%)'
        });
        var showBtn = $('<a>').prop('href', 'javascript:;').css({
            'display': 'inline-block',
            'margin-top': '60px',
            'color': '#ca0c16',
            'font-size': '14px',
            'text-decoration': 'underline'
        }).text('点击显示全部').on('click', function () {
            $(_this).css('height', 'auto');
            showBoth.hide();
        });
        showBoth.append(showBtn);
        $(this).append(showBoth);
    });

    // 技术支持
    var append_hide_dom = function append_hide_dom () {
        $('#tabtop').append('<li role="presentation"><a href="#extend" aria-controls="extend" role="tab" data-toggle="tab">\u6269\u5c55\u8bbe\u7f6e</a></li>');
        $('#tabbody').append('<div role="tabpanel" class="tab-pane" id="extend">\
            <div class="form-group">\
                <label class="col-md-2 control-label text-right">\u9875\u5e95\u6807\u6ce8\u6587\u5b57\uff1a</label>\
                <div class="col-md-10">\
                    <input type="text" class="form-control" name="support_name" value="'+ support_name + '">\
                    <p class="help-block">\
                        1. \u5b9e\u9645\u6587\u5b57\u663e\u793a\u5efa\u8bae15\u4e2a\u5b57\u4ee5\u5185\uff1b<br>\
                        2. \u6dfb\u52a0\u8d85\u94fe\u63a5\u8bf7\u8f93\u5165\u82f1\u6587\u7b26\u53f7\uff1a [link:\u94fe\u63a5\u6587\u5b57](\u94fe\u63a5\u5730\u5740)\uff0c\u5982\uff1a [link:\u767e\u5ea6\u4e00\u4e0b\uff0c\u4f60\u5c31\u77e5\u9053](https://www.baidu.com)\uff1b <br>\
                        3. \u6dfb\u52a0\u7535\u8bdd\u62e8\u6253\u529f\u80fd\u8bf7\u8f93\u5165\u82f1\u6587\u7b26\u53f7\uff1a [tel:\u7535\u8bdd\u6587\u5b57](\u7535\u8bdd\u53f7)\uff0c\u5982\uff1a [tel:\u4e2d\u56fd\u79fb\u52a8](10086) <br>\
                        4. \u6587\u5b57\u663e\u793a\u8bf7\u52ff\u8fde\u7eed\u663e\u793a\u82f1\u6587\u7b26\u53f7 []() \u4ee5\u53ca\u62ec\u53f7\u5185\u7684\u5185\u5bb9\uff0c\u5b83\u4f1a\u88ab\u89c6\u4e3a\u4e0a\u8ff0\u89c4\u5219\u88ab\u76f4\u63a5\u66ff\u6362 <br>\
                    </p>\
                </div>\
            </div>\
        </div>\
        ');
    }
    var dom0 = $('#tabtop li').eq(1);
    var dom1 = $('#tabtop li').eq(0);
    var st = null;
    var support_name = $('#tabtop').attr('data-support-name');
    dom0.on('dblclick', function () {
        dom1.on('mousedown', function () {
            clearTimeout(st);
            st = setTimeout(function () {
                append_hide_dom();
            }, 1000);
        });
        dom1.on('mouseup', function () {
            clearTimeout(st);
        });
        st = setTimeout(function () {
            dom1.off('dblclick');
            dom1.off('mousedown');
            dom1.off('mouseup');
            clearTimeout(st);
        }, 600);
    });
    append_hide_dom();

    // 注册表单功能
    
    // 搜索
    $('#form_search').on('submit', function () {
        if ($(this).prop('method') != 'get') {
            return true;
        }
        var protocol = window.location.protocol;
        var host = window.location.host;
        var pathname = window.location.pathname;
        var search = window.location.search;
        var hash = window.location.hash;
        var serializes = $(this).serializeArray();
        var searchObj = {};
        search.substr(1).split('&').forEach(function (item) {
            item = item.split('=');
            searchObj[item[0]] = item[1];
        });
        serializes.forEach(function (item) {
            searchObj[item.name] = item.value;
        });
        search = [];
        for (key in searchObj) {
            search.push(key + '=' + searchObj[key]);
        }
        search = '?' + search.join('&');
        var href = protocol + '//' + host + pathname + search + hash;
        location.href = href;
        return false;
    });

    var parse_url = function parse_url (url, params, hash) {
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

    var web2app_url = function web2app_url (action, gets, hash, addr) {
        var local = sysinfo.siteroot.slice(0, -1);
        var url = (addr || local) + '/app/index.php';
        var params = {
            i: sysinfo.acid,
            c: 'entry',
            do: action,
            m: sysinfo.module.name
        };
        gets = gets || {};
        if (action.indexOf('/') > -1) {
            action = action.split('/');
            if (action[0].length > 0) {
                gets.do = action[0];
            }
            if (action[1].length > 0) {
                gets.et = action[1];
            }
        } else {
            gets.et = action;
        }
        params = $.extend({}, params, gets);
        return parse_url(url, params, hash);
    }

    var url = function url (action, gets, hash) {
        var url = './index.php';
        gets = gets || {};
        var params = {
            c: 'site',
            a: 'entry',
            m: sysinfo.module.name,
            do: sysinfo.controller_name,
            et: sysinfo.action_name,
            version_id: 0
        };
        if (action.indexOf('/') > -1) {
            action = action.split('/');
            if (action[0].length > 0) {
                gets.do = action[0];
            }
            if (action[1].length > 0) {
                gets.et = action[1];
            }
        } else {
            gets.et = action;
        }
        params = $.extend({}, params, gets);

        return parse_url(url, params, hash);
    }

    var loading = function loading (element) {
        var text = element.innerHTML;
        element.disabled = true;
        element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + text;
        return {
            hide: function (callback) {
                element.disabled = false;
                element.innerHTML = text;
                callback && callback();
            }
        }
    }

    Vue.component('util-image', {
        props: ['name','value','multiple'],
        data: function () {
            if(typeof this.value == 'undefined') {
                var value = [];
            } else if (this.value == '') {
                var value = [];
            } else {
                var value = this.value.split(',')
            }
            return {
                values: value,
                open_value: this.value
            };
        },
        watch: {
            open_value: function (val) {
                this.$emit('value', val);
            },
            value: function (val) {
                if(typeof this.value == 'undefined') {
                    var value = [];
                } else if (type(this.value) == 'string') {
                    if (this.value == '') {
                        var value = [];
                    } else {
                        var value = this.value.split(',')
                    }
                } else if (type(this.value) == 'array') {
                    var value = this.value;
                } else {
                    var value = [];
                }
                this.values = value;
            },
            values: function (val) {
                // 关键
                this.$emit('value', this.value_str);
            }
        },
        methods: {
            showImageDialog: function (e) {
                var _this = this
                var btn = $(e.target);
                var ipt = btn.parent().prev();
                var val = ipt.val();
                var img = ipt.parent().next().children();
                util.image(val, function(res) {
                    if (Object.prototype.toString.call(res) !== '[object Array]') {
                        // 单图
                        _this.values.length = 0;
                        _this.values.push(res.attachment || res.media_id);
                    } else {
                        // 多图
                        for (var i in res) {
                            _this.values.push(res[i].attachment || res[i].media_id);
                        }
                    }
                }, {'global':false,'class_extra':'','direct':true,'multiple':this.multiple || false,'fileSizeLimit':5120000});
            },
            deleteImage: function (index) {
                this.values.splice(index, 1);
                // $(e.target).prev().attr("src", "./resource/images/nopic.jpg");
            }
        },
        filters: {
            tomedia: function (value) {
                return util.tomedia(value);
            }
        },
        computed: {
            value_str: function () {
                return this.values.join(',');
            }
        },
        template: '\
            <div>\
                <div class="input-group">\
                    <input type="text" :name="name" :value="value_str" class="form-control" autocomplete="off">\
                    <span class="input-group-btn">\
                        <button class="btn btn-default" type="button" @click="showImageDialog">选择图片</button>\
                    </span>\
                </div>\
                <div class="input-group" style="margin-top:.5em;">\
                    <span style="position: relative;display:inline-block;margin:0 20px" v-if="values.length == 0">\
                        <img src="./resource/images/nopic.jpg" onerror="this.src=\'./resource/images/nopic.jpg\'; this.title=\'图片未找到.\'" width="150" class="img-responsive img-thumbnail" title="图片未找到.">\
                        <em title="删除这张图片" class="close" style="position: absolute; top: 0; right: -14px;">×</em>\
                    </span>\
                    <span v-for="(v, index) in values" style="position:relative;display:inline-block;margin:0 20px">\
                        <img :src="v|tomedia" onerror="this.src=\'./resource/images/nopic.jpg\'; this.title=\'图片未找到.\'" class="img-responsive img-thumbnail" width="150" />\
                        <em class="close" style="position:absolute; top: 0; right: -14px;" title="删除这张图片" @click="deleteImage(index)">×</em>\
                    </span>\
                </div>\
            </div>\
        '
    });

    Vue.component('util-date', {
        props: ['name','value'],
        mounted: function () {
            var _this = this;
            require(['datetimepicker'], function () {
                $(_this.$refs.date_input).datetimepicker({
                    lang : "zh",
                    step : 5,
                    timepicker : true,
                    closeOnDateSelect : true,
                    format : "Y-m-d H:i"
                });
            });
        },
        template: '\
            <input type="text" :name="name" :value="value" ref="date_input" placeholder="请选择日期时间" readonly="readonly" class="datetimepicker form-control" style="padding-left:12px;" />\
        '
    });

    // 自动创建富文本，数据必须在创建之前赋值，否则不生效
    Vue.component('util-editor', {
        props: ['name','value','image_limit','audio_limit'],
        mounted: function () {
            util.editor('editor_' + this.name, {
                height: '300', 
                dest_dir: '',
                image_limit: (this.image_limit || 5) * 1024,
                allow_upload_video: true,
                audio_limit: (this.audio_limit || 5) * 1024,
                callback: ''
            });
        },
        template: '<textarea :id="\'editor_\'+name" :name="name" type="text/plain" style="height:300px;" v-model="value"></textarea>'
    });
    // 创建富文本区尽量使用此方法手动创建
    var createEditor = function createEditor (id) {
        return util.editor(id, {
            height: '300', 
            dest_dir: '',
            image_limit: (this.image_limit || 5) * 1024,
            allow_upload_video: true,
            audio_limit: (this.audio_limit || 5) * 1024,
            callback: ''
        });
    }

    Vue.component('util-audio', {
        props: ['name','value'],
        mounted: function () {
            this.setAudioPlayer();
        },
        methods: {
            show_audio: function (e) {
                this.showAudioDialog(e.target);
            },
            showAudioDialog: function (elm, base64options, options) {
                var _this = this;
                var btn = $(elm);
                var ipt = btn.parent().prev();
                var val = ipt.val();
                util.audio(val, function(url){
                    if(url && url.attachment && url.url){
                        btn.prev().show();
                        ipt.val(url.attachment);
                        ipt.attr("filename",url.filename);
                        ipt.attr("url",url.url);
                        _this.setAudioPlayer();
                    }
                    if(url && url.media_id){
                        ipt.val(url.media_id);
                    }
                });
            },
            setAudioPlayer: function () {
                require(["jquery.jplayer"], function() {
                    $(".audio-player").each(function(){
                        $(this).prev().find("button").eq(0).click(function(){
                            var src = $(this).parent().prev().val();
                            if($(this).find("i").hasClass("fa-stop")) {
                                $(this).parent().parent().next().jPlayer("stop");
                            } else {
                                if(src) {
                                    $(this).parent().parent().next().jPlayer("setMedia", {mp3: util.tomedia(src)}).jPlayer("play");
                                }
                            }
                        });
                    });

                    $(".audio-player").jPlayer({
                        playing: function() {
                            $(this).prev().find("i").removeClass("fa-play").addClass("fa-stop");
                        },
                        pause: function (event) {
                            $(this).prev().find("i").removeClass("fa-stop").addClass("fa-play");
                        },
                        swfPath: "resource/components/jplayer",
                        supplied: "mp3"
                    });
                    $(".audio-player-media").each(function(){
                        $(this).next().find(".audio-player-play").css("display", $(this).val() == "" ? "none" : "");
                    });
                });
            }
        },
        template: '\
            <div>\
                <div class="input-group">\
                    <input type="text" :value="value" :name="name" class="form-control audio-player-media" autocomplete="off">\
                    <span class="input-group-btn">\
                        <button class="btn btn-default audio-player-play" type="button" style="display:none;"><i class="fa fa-play"></i></button>\
                        <button class="btn btn-default" type="button" @click="show_audio">选择媒体文件</button>\
                    </span>\
                </div>\
                <div class="input-group audio-player"></div>\
            </div>\
        '
    });

    // #app 区域loading动画
    var ban = function ban (el) {
        el = el || '#app';
        var template = '\
            <div class="lds-dual-ring"></div>\
        ';
        var _loading = document.createElement('div');
        _loading.innerHTML = template;
        _loading.id = 'app_loading';
        document.querySelector(el).appendChild(_loading);
        return {
            hide: function (callback) {
                document.querySelector(el).removeChild(_loading);
                callback && callback();
            }
        };
    }

    // 基础页面功能
    var page_update_script = function page_update_script (data) {
        var $vm = new Vue({
            data: data,
            mounted: function () {
                var _this = this;
                this.$refs.form.action = url('save');
                if ('ident' in sysinfo.gets) {
                    this.ident = sysinfo.gets.ident
                    var _ban = ban();
                    this.$http.get(url('detail', {
                        ident: this.ident
                    })).then(function (response) {
                        var result = response.data;
                        _ban.hide(function () {
                            if (result.errno != 0) {
                                xalert(result.message, false, function () {
                                    history.back();
                                });
                                return false;
                            }
                            for (var field in data) {
                                if (field == 'ident') {
                                    continue;
                                }
                                _this[field] = result.data[field];
                            }
                        });
                    }).catch(function () {
                        _ban.hide(function () {
                            xalert('服务器异常，请稍后再试');
                        })
                    })
                }
            },
            methods: {
                submit: function (e) {
                    e.preventDefault();
                    if (!confirm('是否保存？')) {
                        return false;
                    }
                    var _loading = loading(this.$refs.submit_button);
                    var fd = new FormData(e.target);
                    if (this.ident != '') {
                        fd.append('ident', this.ident);
                    }
                    this.$http.post(e.target.action, fd).then(function (response) {
                        var result = response.data;
                        if (result.errno == 0) {
                            xalert(result.message, true, function () {
                                location.href = url('index');
                            });
                        } else {
                            _loading.hide(function () {
                                xalert(result.message, false);
                            });
                        }
                    });
                }
            }
        });
        $vm.$mount('#app');
    }

    exports.rgb2hex     = rgb2hex;
    exports.img2base64   = img2base64;
    exports.is_json_string = is_json_string;
    exports.xalert       = xalert;
    exports.alert        = xalert;
    exports.vue          = Vue;
    exports.$            = $;
    exports.util         = util;
    exports.script       = {
        hide: function () {
            $('script[data-done=hide]').remove();
        }
    };
    exports.app_url = web2app_url;
    exports.url     = url;
    exports.loading = loading;
    exports.ban     = ban;
    exports.page_script  = {
        update: page_update_script
    };
    exports.sysinfo = sysinfo;
    exports.createEditor = createEditor;
});