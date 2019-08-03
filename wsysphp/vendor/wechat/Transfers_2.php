<?php 
namespace wsys\wechat;
error_reporting(E_ERROR);
load()->classs('pay/pay') ?: load()->classs('pay');
load()->classs('pay/weixin.pay') ?: load()->classs('weixin.pay');
error_reporting(E_WARNING); 

/**
 * 现金红包、裂变红包、企业付款、发送模板消息
 * 商家向用户转账服务
 */
class Transfers extends \WeiXinPay {

    private $redpack;      // 现金红包api
    private $groupredpack; // 裂变红包api
    private $transfers;    // 企业付款api
    private $mchid;        // 商户号
    private $appid;        // appid
    private $clientIP;     // 调用者ip
    private $uniacid;      // 公众号ID

    public function __construct($uniacid) {
        parent::__construct();
        
        $this->redpack      = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';
        $this->groupredpack = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack';
        $this->transfers    = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers';
        $this->uniacid      = $uniacid ?: $GLOBALS['_W']['uniacid'];
        $this->clientIP     = $_SERVER['REMOTE_ADDR'];

        if($this->uniacid == $GLOBALS['_W']['uniacid']) {
            $this->mchid        = $this->wxpay['mch_id'];
            $this->appid        = $this->wxpay['appid'];
            $this->key          = $this->wxpay['key'];
        } else {
            $wechat = pdo_get('account_wechats', [
                'uniacid' => $this->uniacid
            ]);
    
            if(empty($wechat)) {
                return '公众号配置不存在，请检查或填写';
            }

            $setting = pdo_get('uni_settings', [
                'uniacid' => $this->uniacid
            ]);

            if(empty($setting) || empty($setting['payment'])) {
                return '支付配置不存在，请检查或填写';
            }

            $payment = @iunserializer($setting['payment']);

            if(empty($payment['wechat']) || empty($payment['wechat']['mchid'])) {
                return '支付配置不存在，请检查或填写';
            }

            $this->appid = $wechat['key'];
            $this->mchid = $payment['wechat']['mchid'];
            $this->key = $payment['wechat']['signkey'];

        }

        if(empty($this->mchid) || empty($this->appid) || empty($this->key)) {
            return '配置不完整，返利失败';
        }
    }

    /**
     * 现金红包（单个红包）
     * @param  [type] $wechat_id 发给的用户openid
     * @param  [type] $amount    现金，单位为元，最低1元
     * @param  [type] $order_sn  发送红包生成的订单号
     * @param  [type] $act_name  活动名称
     * @param  [type] $send_name 发送人名称，一般为公众号名称
     * @param  [type] $wishing   发送红包祝福语
     * @param  string $remark    红包备注信息，一般为红包的附加文字，默认为空
     * @return [type]            [description]
     */
    public function sendredpack($wechat_id, $amount, $order_sn, $act_name, $send_name, $wishing, $remark = '') {

        $amount *= 100;

        $param = [
            'act_name'     => $act_name,
            'client_ip'    => $this->clientIP,
            'mch_billno'   => $order_sn,
            'mch_id'       => $this->mchid,
            'nonce_str'    => random(32),
            'remark'       => $remark,
            're_openid'    => $wechat_id,
            'scene_id'     => 'PRODUCT_4',
            'send_name'    => $send_name,
            'total_amount' => $amount,
            'total_num'    => 1,
            'wishing'      => $wishing,
            'wxappid'      => $this->appid,
        ];

        include_once(__DIR__ . '/TransfersHelper.php');
        $wpclass = new TransfersHelper($param, $this->uniacid, $this->key);
        $res = $wpclass->send_redpack();

        if($res === false) {
            return '配置文件发生错误';
        }

        $res = (array)$res;

        if($res['result_code'] == 'FAIL') {
            return $res['err_code_des'];
        }

        return true;

    }

    /**
     * 裂变红包
     */
    public function sendgroupredpack() {}

    /**
     * 企业付款
     * 参数自主判断
     * $wechat_id 转账的用户openid
     * $amount 转账金额，单位为元，最低1元
     * $order_sn 创建转账订单号，不能重复
     * $remark 转账备注信息
     */
    public function transfers($wechat_id, $amount, $order_sn, $remark = '企业付款') {

        $amount *= 100;

        $param = [
            "amount"           => $amount,        //付款金额，单位分
            "check_name"       => 'NO_CHECK',
            "desc"             => $remark,        //备注信息
            "mchid"            => $this->mchid,   //商户号
            "mch_appid"        => $this->appid,
            "nonce_str"        => random(32),     //随机字符串
            "openid"           => $wechat_id,
            "partner_trade_no" => $order_sn,      //订单号
            "spbill_create_ip" => $this->clientIP //调用接口的机器 Ip 地址
        ];

        include_once(__DIR__ . '/TransfersHelper.php');
        $wpclass = new TransfersHelper($param, $this->uniacid, $this->key);
        $res = $wpclass->transfers();

        if($res === false) {
            return '配置文件发生错误';
        }

        $res = (array)$res;

        if($res['result_code'] == 'FAIL') {
            return $res['err_code_des'];
        }

        return true;
    }
    
}