({
    appDir: './src',
    baseUrl: 'resource',
    dir: './dist',
    modules: [
        {
            name: 'script'
        }
    ],
    fileExclusionRegExp: /^(r|build)\.js$/,
    optimizeCss: 'standard',
    removeCombined: true,
    paths: {
        'enter': 'lib/app/enter/default',
        'app': 'lib/app/app.min',
        'jquery': 'lib/jquery/2.2.4/jquery.min',
        'lodash': 'lib/lodash/1.8.3/lodash.min',
        'swiper': 'lib/swiper/4.5.0/swiper.min',
        'wx': 'lib/wx/1.4.0/wx.min',
        'jquery.lazyload': 'lib/jquery.lazyload/jquery.lazyload.min',
        'weui': 'lib/weui/weui.min',
        'vue': 'lib/vue/2/vue',
        'vue-resource': 'lib/vue/plugins/vue-resource.min',
        'vue-lazyload': 'lib/vue/plugins/vue-lazyload.min',
        'page': 'empty:'
    },
    map: {'*':{'css':'lib/require/css.min'}},
    shim: {
        'app': {deps:['wx','swiper','jquery','lodash','weui']},
        'enter': {deps:['css!lib/bootstrap/3.3.7/bootstrap.min','app']},
        'swiper': {deps:['css!swiper']},
        'jquery.lazyload': {deps:['jquery']},
        'weui': {deps:['css!lib/weui/weui.min']},
        'page': {deps:['css!app/default/index']}
    }
})
