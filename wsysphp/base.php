<?php 

/**
 * @author iexn
 * @version 3.0.0
 * @time 2019-02-13 16:43:01
 * @link https://gitee.com/tianjin_onfinger/w7_scaffold
 */

// 框架版本号
define('MVERSION', '3.0.0');

// 开发版
define('IS_DEV', false);
// 按照公众号记录数据
define('UNI_BRIDLE', true);
define('WSYS_THEME', 'default');
/****单独配置*** */

// 文件路径符号
if(!defined('DS')) {
    define('DS', DIRECTORY_SEPARATOR);
}

if(defined('_DIR_')) {
    $dir = _DIR_ . DS . 'wsysphp';
} else {
    $dir = __DIR__;
}
$modulename = basename(dirname($dir));
$prefix = 'szxh_';



if(!defined('TEMPLATE')) {
    define('TEMPLATE', 'W7');
}

// 框架根目录   wsysphp/
define('MFRAME', $dir);

// 模块根目录   wsys_xxxx/
define('MROOT', $dir. DS . '..');

if(!defined('APP_PATH')) {
    define('APP_PATH', MROOT . '/application');
}

// 模块名  wsys_xxxx
define('MNAME', $modulename);

// 获取应用真实名  xxxx
$modulename = strtolower($modulename);
if(strpos($modulename, $prefix) === 0) {
    $modulename = substr($modulename, strlen($prefix));
}

// 模块真实名 xxxx
define('MUNAME', $modulename);

// 系统表前缀 wsys_
define('M_SYSTEM_PREFIX', $prefix);

// 表前缀名   wsys_xxxx
define('MPREFIX', $prefix. $modulename. '_');

// app端访问静态资源路径
if(isset($_SERVER['HTTP_HOST'])) {
    $addon_path = htmlspecialchars((
        (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
        (isset($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) != 'off') ||
        (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) == 'https') ||
        (isset($_SERVER['HTTP_X_CLIENT_SCHEME']) && strtolower($_SERVER['HTTP_X_CLIENT_SCHEME']) == 'https') ? 'https://' : 'http://'
    ) . $_SERVER['HTTP_HOST']).'/addons/'. MNAME . '/';
    
} else {
    $addon_path = MROOT . '/';
}

if(IS_DEV) {
    define('__PUBLIC__', $addon_path . 'dev/resource');
} else {
    define('__PUBLIC__', $addon_path . 'resource');
}

define('__LIB__', __PUBLIC__ . '/lib');
define('__WEB__', __PUBLIC__ . '/web');
define('__APP__', __PUBLIC__ . '/app');

// 系统静态资源路径，不同网站和app端对应不同的资源路径
define('SYSTEM_RESOURCE', './resource');

// 模版引擎 THINK 和 WE7，默认THINK。WE7为系统默认引擎
define('TEMPLATE_TYPE', 'THINK');