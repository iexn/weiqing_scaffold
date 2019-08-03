define(function (require, exports) {

    var App = require('app');
    var Swiper = require('swiper');

    function init (url, callback) {
        App.init(url, function (done, sysinfo) {
            App.sysinfo = sysinfo;
            callback && callback(function (is_complete) {

                var container = document.createElement('div');
                var app_element = document.querySelector('#app');
                container.className    = 'swiper-container swiper-app-container';
                container.style.width  = '100%';
                container.style.height = '100%';
                container.innerHTML = '<div class="swiper-wrapper"></div>';
                
                app_element.className = 'swiper-slide';
                app_element.style.height = 'auto';
                app_element.parentElement.insertBefore(container, app_element);
                container.querySelector('.swiper-wrapper').appendChild(app_element);
                
                var swiper = new Swiper('.swiper-app-container', {
                    direction: 'vertical',
                    slidesPerView: 'auto',
                    freeMode: true,
                    scrollbar: {
                        el: '.swiper-scrollbar',
                    },
                    mousewheel: true,
                });
              
                done(is_complete);
                
            }, App);
        });
    }

    exports.init = init;

});