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
class Szxh_vijaModuleSite extends wsys\Wsys {

    public function doWebIndex() { $this->_initialize(); }
    public function doWebActive() { $this->_initialize(); }
    public function doWebGift() { $this->_initialize(); }
    public function doWebActiveCav() { $this->_initialize(); }
    public function doWebRegister() { $this->_initialize(); }
    public function doWebConfig() { $this->_initialize(); }
    public function doMobileW7() { $this->_initialize(); }
    public function doMobileP() { $this->_initialize(); }
    public function doMobileM() { $this->_initialize(); }
    public function doMobileN() { $this->_initialize(); }

}