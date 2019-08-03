<?php 
namespace wsys\logic;

use wsys\model\RegisterModel;
use wsys\model\GiftModel;
use wsys\model\ActiveModel;
use wsys\model\RewardtoLogModel;
use wsys\model\RewardtoModel;
use wsys\model\OrderModel;

class RewardtoLogic extends CommonConditionLogic
{
    protected $model_class = 'Rewardto';

    /**
     * 赠送礼物
     * 失败返回失败及原因；赠送成功显示已成功；需要支付显示成功和支付参数
     */
    public function rewardto($openid, $register_ident, $gift_ident, $reward_num)
    {
        if(!is($reward_num, 'id')) {
            return $this->setInfo(410, '数量不正确');
        }

        // 查找报名
        $RegisterModel = new RegisterModel;
        $register = $RegisterModel->register_info([
            'ident' => $register_ident
        ]);
        if(empty($register)) {
            return $this->setInfo(407, '报名信息不存在，赠送失败');
        }

        // 查找活动
        $ActiveModel = new ActiveModel;
        $active = $ActiveModel->detail($register['active_ident'], false);
        if($active === false) {
            return $this->setInfo($ActiveModel->getCode(), $ActiveModel->getMessage(), $ActiveModel->getData());
        }

        // 判断是否可接收礼物
        if($active['cav_open'] == 'on' && $active['cav_on_give_gift'] > 0 && $register['cav_times'] > 0) {
            return $this->setInfo(422, '已关闭接收礼物，赠送失败');
        }

        // 判断礼物是否在活动中
        $gifts_ident = array_column($active['gift'], 'gift_id');
        if(!in_array($gift_ident, $gifts_ident)) {
            return $this->setInfo(409, '礼物不存在，赠送失败 ');
        }

        // 查找礼物
        $GiftModel = new GiftModel;
        $gift = $GiftModel->findRow([
            'ident' => $gift_ident,
            'status' => 'on'
        ]);
        if(empty($gift)) {
            return $this->setInfo(408, '礼物不存在，赠送失败');
        }

        // 可以赠送，查看礼物是否可免费赠送

        // 查找可免费赠送次数
        $init_have_total = $gift['init_have_total'];

        // 查找赠送记录，当前礼物次数
        $RewardtoLogModel = new RewardtoLogModel;
        $rewardto_log = $RewardtoLogModel->getList([
            'openid' => $openid,
            'register_ident' => $register_ident,
            'gift_ident' => $gift_ident
        ]);
        
        if(empty($rewardto_log)) {
            $rewardto_num = 0;
        } else {
            $rewardto_num = array_sum(array_column($rewardto_log, 'gift_total'));
        }

        // 免费个数
        $refee_num = max($init_have_total - $rewardto_num, 0);

        // 如果支付金额为0并且没有免费次数将不能赠送
        if($gift['amount'] == 0 && $refee_num == 0) {
            return $this->setInfo(410, $gift['name'].'已经送完了哦');
        }
        if($gift['amount'] == 0 && $reward_num > $init_have_total) {
            return $this->setInfo(410, $gift['name'].'最多只能送'.$init_have_total.'个');
        }
        
        // 需要支付个数
        $pay_num = $reward_num - $refee_num;
        $pay_amount = $gift['amount'] * $pay_num;

        // 如果不需要支付，直接赠送返回成功，添加两项记录
        if($pay_amount == 0) {

            $result = $this->record($openid, $register, $gift, $reward_num);
            if($result === false) {
                return false;
            }
            return $this->setInfo(0, '赠送成功', ['action'=>'redirect']);
        }

        // 如果需要支付，开始下单
        $OrderModel = new OrderModel;
        $order = $OrderModel->createOrder($openid, 'rewardto', $register_ident, $pay_amount, $active['title'], [
            'register_ident' => $register_ident,
            'gift'           => $gift,
            'reward_num'     => $reward_num,
            'pay_num'        => $pay_num
        ]);
        if($order === false) {
            return $this->setInfo(413, '创建订单失败，请重试');
        }

        // 判断是否需要跳页支付
        $payment_config_url = getConfig('payment_url');
        if(!empty($payment_config_url)) {
            $payment_urls = explode("\r\n", $payment_config_url);
            $payment_url = $payment_urls[0];
        }

        if($payment_url != servername(true)) {
            return $this->setInfo(0, '前往支付', [
                'action'  => 'tolink_pay', // 关键参数，tolink_pay为跳页支付
                'payment' => web2app_url('p/pay', [
                        'sn' => $order['order_sn']
                    ], '', $payment_url),
                'fee'   => $pay_amount,
                'title' => '赠送礼物',
                'time'  => TIMESTAMP
            ]);
        }

        return $this->setInfo(0, '前往支付', [
            'action' => 'pay', // 关键参数，pay为前去支付
            'fee' => $pay_amount,
            'sn' => $order['order_sn'],
            'title' => '赠送礼物'
        ]);
    }

    /**
     * 赠送后记录数据信息（其他logic层调用）
     */
    public function record($openid, $register, $gift, $reward_num)
    {
        $RewardtoModel = new RewardtoModel;
        $RewardtoLogModel = new RewardtoLogModel;
        $RegisterModel = new RegisterModel;

        pdo_begin();

        $result = $RewardtoModel->record($openid, $register['active_ident'], $register['ident'], $gift, $reward_num);
        if($result === false) {
            pdo_rollback();
            return $this->setInfo(411, '操作失败');
        }

        $result = $RewardtoLogModel->record($openid, $register['active_ident'], $register['ident'], $gift, $reward_num);
        if($result === false) {
            pdo_rollback();
            return $this->setInfo(412, '操作失败');
        }

        $result = $RegisterModel->statistics($register['ident'], $reward_num, $gift['amount'] * $reward_num, $gift['score'] * $reward_num);        
        if($result === false) {
            pdo_rollback();
            return $this->setInfo(412, '操作失败');
        }

        pdo_commit();

        return true;
    }

    public function getRewardtoUsersList($register_ident)
    {
        $RewardtoModel = new RewardtoModel;
        $users = $RewardtoModel->getList([
            'register_ident' => $register_ident
        ], 1, 18);
        $list = [];
        foreach($users as &$user) {
            $list[] = [
                'avatar' => $user['avatar'],
                'name' => $user['name'],
            ];
        }
        return $list;
    }

    /**
     * 获取送礼人列表
     */
    public function getRank($condition = [], $page = false, $size = 10)
    {
        $RewardtoLogModel = new RewardtoLogModel;
        $list = $RewardtoLogModel->getList($condition, $page, $size);
        return $this->setInfo(0, '', $list);
    }

}