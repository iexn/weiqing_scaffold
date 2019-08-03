define(function (require, exports) {

    var wx = require('wx'),
        weui = require('weui'),
        $ = require('jquery');
    require('jquery.lazyload');

    function main (done, App) {

        var hash = location.hash.slice(1);
        console.log(hash);
        // 处理hash进场特殊动作
        location.hash = '/';

        $.post(App.url('m/detail')).then(function (res) {
            App.router.route('/', function () {
                $('.fix-layouter').removeClass('on');
            });
            $('.fix-layouter[data-layout-router-name]').each(function (index, item) {
                var router_name = $(this).attr('data-layout-router-name');
                var _this = this;
                App.router.route(router_name, function () {
                    $(_this).addClass('on');
                });
            });
            App.router.init();
            // 关闭弹层
            $('.layouter-close').on('click', function () {
                location.hash = '/';
            });

            done();
            $('[data-src]').lazyload();

            // 音乐
            // 微信兼容处理
            wx.ready(function () {
                var music = document.createElement('audio');
                music.loop = true;
                music.src = './resource/music/qxtb.mp3';
                $('.fix-music').on('click', function () {
                    if (music.paused) {
                        $(this).addClass('on');
                        music.play();
                    } else {
                        $(this).removeClass('on');
                        music.pause();
                    }
                });
                $('.fix-music').trigger('click');
            });

            // 提交表单
            $('#form').on('submit', function () {
                var loading = weui.loading('提交中');
                $.post($(this).prop('action'), $(this).serialize()).then(function (res) {
                    loading.hide(function () {
                        // todo something
                    });
                }).fail(function () {
                    loading.hide(function () {
                        weui.alert('报名失败，请重新提交');
                    });
                });
                return false;
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

            // picker date
            $('.picker-date').on('click', function () {
                var _this = this;
                weui.datePicker({
                    start: 1990,
                    end: 2019,
                    // defaultValue: [1991, 6, 9],
                    onConfirm: function(result){
                        $(_this).val(result[0].value + '-' + result[1].value + '-' + result[2].value);
                    },
                });
            });
            
        }).fail(function () {
            alert('页面读取失败，请重试');
            done(false);
        });
    }

    exports.run = main;
});