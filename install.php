<?php 
// -----------------------------
// 安装、更新模块执行文件
// ----------------------------

define('MROOT', __DIR__);
include MROOT . '/wsysphp/library/Db.class.php';
// 保证同级文件夹内包含db.json文件
\wsys\Db::sync();