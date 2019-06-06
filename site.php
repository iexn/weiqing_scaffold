<?php

/**
 * @author iexn 1.8.1
 * @link https://gitee.com/iexn/w7_scaffold
 */
defined('IN_IA') or exit('Access Denied');

define('_DIR_', __DIR__);
include _DIR_.'/wsysphp/start.php';

// 帮助文档地址
define('DOCUMENT_URL', '');

// _ 处填写模块名，首字母大写
class W7_scaffoldModuleSite extends wsys\Wsys {

    public function doWebMain() { $this->_initialize(); }
    public function doMobileW7() { $this->_initialize(); }
    public function doMobileIndex() { $this->_initialize(); }

}