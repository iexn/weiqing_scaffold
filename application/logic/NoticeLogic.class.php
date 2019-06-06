<?php 
namespace wsys\logic;

use wsys\model\OrderModel;
use wsys\model\RegisterModel;

class NoticeLogic extends CommonLogic
{
    protected $model_class = 'notice';

    public function pay($ret)
    {
        list($order_sn, $_) = explode('_', $ret['tid']);
        $w7_tid = $ret['uniontid'];
        $transaction_id = $ret['tag']['transaction_id'];

        // 查找订单
        $OrderModel = new OrderModel;
        $order = $OrderModel->getOrder($order_sn);
        if(empty($order)) {
            return $this->setInfo(599, '订单不存在');
        }

        if($order['done_time'] > 0) {
            return $this->setInfo(598, '订单已处理');
        }
        
        // 完成订单
        $OrderModel->complete($order_sn, $w7_tid, $transaction_id);

        // 根据订单类型处理
        switch($order['type']) {
            // 处理订单
        }

        return $this->setInfo(0, '请求成功');
    }

}