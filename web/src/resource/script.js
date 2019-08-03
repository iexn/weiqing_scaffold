require.config({
    urlArgs: 'v=2019071001',
    baseUrl: '.',
    paths: {
        'enter': window.libUrl + '/app/enter/default',
        'app': window.libUrl + '/app/app.min',
        'jquery': window.libUrl + '/jquery/2.2.4/jquery.min',
        'lodash': window.libUrl + '/lodash/1.8.3/lodash.min',
        'swiper': window.libUrl + '/swiper/4.5.0/swiper.min',
        'wx': window.libUrl + '/wx/1.4.0/wx.min',
        'jquery.lazyload': window.libUrl + '/jquery.lazyload/jquery.lazyload.min',
        'weui': window.libUrl + '/weui/weui.min',
        'vue': window.libUrl + '/vue/2/vue',
        'vue-resource': window.libUrl + '/vue/plugins/vue-resource.min',
        'vue-lazyload': window.libUrl + '/vue/plugins/vue-lazyload.min',
        'page': window.baseUrl + '/app/default/'+window.enter
    },
    map: {'*':{'css': window.libUrl + '/require/css.min.js'}},
    shim: {
        'app': {deps:['wx','swiper','jquery','lodash']},
        'enter': {deps:['css!'+window.libUrl+'/bootstrap/3.3.7/bootstrap.min','app']},
        'swiper': {deps:['css!swiper']},
        'jquery.lazyload': {deps:['jquery']},
        'weui': {deps:['css!'+window.libUrl+'/weui/weui.min']},
        'page': {deps:['css!'+window.baseUrl+'/app/default/'+window.enter]}
    }
});

require(['enter'], function (Enter) {
    var init_url = window.init_url;
    Enter.init(init_url, main);

    function main (done, App) {
        require(['page'], function (Page) {
            Page.run(done, App);
        });
    }
});