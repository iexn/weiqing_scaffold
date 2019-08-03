<?php
namespace wsys\controller;

use wsys\Controller;
use wsys\logic\OrderLogic;

class CommonController extends Controller
{

    public function __construct()
    {
        parent::__construct();
        
        $GLOBALS['_W']['NS'] = C('status');

    }

    protected function getLogicClass($name)
    {
        return '\\wsys\\logic\\'.$name.'Logic';
    }

    public function pay($w, $get, $post) 
    {
        $OrderLogic = new OrderLogic;
        $order = $OrderLogic->getOrder($get['sn']);
        if($order === false) {
            exit($OrderLogic->getMessage());
        }
        $this->assign('order', $order);
        wx_jssdk();
        exit('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>支付中...</title><link rel="stylesheet" href="./resource/css/common.min.css"><script type="text/javascript" src="./resource/js/lib/jquery-1.11.1.min.js"></script><script type="text/javascript" src="./resource/js/lib/mui.min.js"></script><script type="text/javascript" src="./resource/js/app/util.js?v=20170426"></script></head><body><script>function topay() {if(WeixinJSBridge == undefined) {return true;}var config = {orderFee: "'.$order["amount"].'",payMethod: "wechat",orderTitle: "'.$order["title"].'支付订单",orderTid: "'.$order["order_sn"].'",module: "'.MNAME.'",success: function() {history.back();},fail: function(e) {alert(e.message);history.back();},complete: function(e) {history.back();}};console.log(config);util.pay(config);}var action = setInterval(function() {if(WeixinJSBridge != undefined) {clearInterval(action);topay();}}, 200);</script></body></html>');
    }

}
