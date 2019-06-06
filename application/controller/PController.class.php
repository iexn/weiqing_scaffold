<?php 
namespace wsys\controller;

use wsys\Guard;

Guard::wechat();
Guard::shield(true);
checkauth();

class PController extends CommonController
{

    public function index() { return 'main/index'; }

}