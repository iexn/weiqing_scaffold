<?php 
namespace wsys\logic;

use wsys\model\OrderModel;
use wsys\model\RegisterModel;

class NoticeLogic extends CommonLogic
{
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

        switch($order['type']) {
            // 送礼类型
            case 'rewardto':
                $register_ident = $order['type_ident'];

                // 查找报名信息
                $RegisterModel = new RegisterModel;
                $register = $RegisterModel->register_info([
                    'ident' => $register_ident
                ]);
                if(empty($register)) {
                    return $this->setInfo(597, '数据异常，操作失败');
                }

                // 开始保存数据
                $RewardtoLogic = new RewardtoLogic;
                $result = $RewardtoLogic->record($order['openid'], $register, $order['params']['gift'], $order['params']['reward_num']);
                if($result === false) {
                    return $this->setInfo(596, $RewardtoLogic->getMessage(), $RewardtoLogic->getData());
                }

            break;
        }

        return $this->setInfo(0, '请求成功');
    }

}