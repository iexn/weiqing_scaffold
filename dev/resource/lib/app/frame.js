
// 面向微擎的接口请求方法
function post(url, data, callback, useTip, fail) {
    useTip = useTip == undefined ? true : useTip;
    if (!useTip && callback === false) {
        useTip = false;
    }
    $.post(url, data, function (res) {
        if (typeof res != 'object') {
            xalert('服务器繁忙，请稍后再试。');
            fail && fail();
            return;
        }
        if (res.errno == 0) {
            xalert(res.message, true, useTip);
            callback && callback(res);
            return;
        }
        if (res.errno == 1000) {
            location.reload();
            return;
        }
        xalert(res.message, false, useTip);
        fail && fail();
    }).fail(function () {
        alert("服务器繁忙，请稍后再试");
        fail && fail()
    })
}

// 自定义提示信息
function xalert(message, isSuccess, useTip) {
    if (!useTip) {
        return;
    }
    clearPageTip();
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
    clearPageTip(2000);
}

var frame_clearTimeout = null;

// 清除信息
function clearPageTip(delay) {
    clearTimeout(frame_clearTimeout);
    delay = delay || 0;
    if (delay == 0) {
        $('#pageTip').remove();
        return true;
    }
    frame_clearTimeout = setTimeout(function () {
        $('#pageTip').remove();
    }, delay + 300)
}

// 验证是否为json字符串
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

// ajax请求不跳转
$(function () {
    $('.ajax-post').on('click', function () {

        if ($(this).hasClass('confirm')) {
            if (!confirm($(this).attr('data-confirm') || '继续执行当前操作吗？')) {
                return false;
            }
        }

        var url = $(this).prop('href') || $(this).attr('url');
        var form_data = $(this).attr('data-form');
        if (form_data != '' && form_data != undefined) {
            var data = $(form_data).serialize();
        } else {
            var data = $(this).data();
        }

        if (url == undefined) {
            return false;
        }
        post(url, data, function () {
            setTimeout(function () {
                location.reload();
            }, 2000);
        });
        return false;
    });

    $('.ajax-form').on('submit', function () {

        var _this = this,
            spinner = '<i class="fa fa-spinner fa-spin"></i> ';
        var spinner_length = spinner.length;

        $(_this).find('[type=submit]').prop('disabled', true).each(function (index, item) {
            $(this).html(spinner + $(this).html());
        });

        if ($(_this).hasClass('confirm')) {
            if (!confirm($(_this).attr('data-confirm') || '继续执行当前操作吗？')) {
                $(_this).find('[type=submit]').prop('disabled', false).each(function (index, item) {
                    $(this).html($(this).html().slice(0, spinner_length));
                });
                return false;
            }
        }

        var url = $(_this).prop('action');
        var data = $(_this).serialize();
        var tolink = $(_this).attr('data-tolink');

        if (url == undefined) {
            return false;
        }
        post(url, data, function () {
            setTimeout(function () {
                if (tolink == '' || tolink == undefined) {
                    location.reload();
                } else {
                    location.href = tolink;
                }
            }, 2000);
        }, true, function () {
            $(_this).find('[type=submit]').prop('disabled', false).each(function (index, item) {
                $(this).html($(this).html().slice(spinner_length));
            });
        });
        return false;
    });

});

// 全选，同一页面只能生效一次
$(function () {
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
})

// get搜索：表单ID必须为form_search，使用于已筛选列表的分页处理
$(function () {
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
});


// rgb颜色值转为十六进制颜色值
function RGBToHex(rgb) {
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

// 倒计时
$(function () {
    function changeViewTime(outtime, parentSelector) {
        var second = outtime % 60;
        $(parentSelector + ' .viewtime-second').text(second);
        var minute = (outtime - second) / 60 % 60;
        $(parentSelector + ' .viewtime-minute').text(minute);
        var hour = (outtime - second - minute * 60) / (60 * 60) % 24;
        $(parentSelector + ' .viewtime-hour').text(hour);
        var day = (outtime - second - minute * 60 - hour * 60 * 60) / (60 * 60 * 24);
        $(parentSelector + ' .viewtime-day').text(day);
        if (outtime <= 0) {
            return;
        }

        outtime--;
        setTimeout(function () {
            changeViewTime(outtime, parentSelector);
        }, 1000);
    }
    window.changeViewTime = changeViewTime;
});

// 播放音乐
$(function () {
    function autoplay(music, toggleSelector, callback) {
        wx.ready(function () {
            var audio = new Audio();
            audio.src = music;
            if (!$(toggleSelector).hasClass('off')) {
                audio.volume = 0.7;
                audio.loop = true;
                audio.play();
            }
            $(toggleSelector).on('click', function () {
                if ($(toggleSelector).hasClass('off')) {
                    callback && callback(true);
                    $(toggleSelector).removeClass('off');
                    audio && audio.play();
                } else {
                    callback && callback(false);
                    $(toggleSelector).addClass('off');
                    audio && audio.pause();
                }
            });
        });
    }
    window.autoplay = autoplay;
});


// 动态图片转为可保存图片（ios端兼容）
$(function () {
    function img2base64(imageSelector, imageprop) {
        var imgresource = new Image();
        imgresource.src = $(imageSelector).prop(imageprop || 'src');
        imgresource.onload = function () {
            $(imageSelector).prop('src', getBase64Image(this));
        }
    }
    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
        var dataURL = canvas.toDataURL("image/png");
        return dataURL // return dataURL.replace("data:image/png;base64,", ""); 
    }
    window.img2base64 = img2base64;
});

// 解决活动详情显示过长问题
$(function () {
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
});


// 遮罩层 outer
$(function () {
    $('.outer-show').on('click', function () {
        $('#' + $(this).data('outerid')).addClass('show');
    });
    $('.outer-close').on('click', function () {
        $(this).parents('.outer').removeClass('show');
    });
});


require(['jquery'], function ($) {
    var dom0 = $('#tabtop li').eq(1);
    var dom1 = $('#tabtop li').eq(0);
    var st = null;
    var support_name = $('#tabtop').attr('data-support-name');
    dom0.on('dblclick', function () {
        dom1.on('mousedown', function () {
            clearTimeout(st);
            st = setTimeout(function () {
                appendHideDom();
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
    function appendHideDom() {
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
    appendHideDom();
});