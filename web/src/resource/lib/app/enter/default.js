define(function (require, exports) {

    var App = require('app');

    function init (url, callback) {
        App.init(url, function (done, sysinfo) {
            App.sysinfo = sysinfo;
            callback && callback(function (is_complete) {
                done(is_complete);
            }, App);
        });
    }

    exports.init = init;

});