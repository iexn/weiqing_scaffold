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

    public function __construct() {
        parent::__construct();
        
        $this->redpack      = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';
        $this->groupredpack = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack';
        $this->transfers    = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers';
        $this->mchid        = $this->wxpay['mch_id'];
        $this->appid        = $this->wxpay['appid'];
        $this->clientIP     = $_SERVER['REMOTE_ADDR'];
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

        $wp = vendor('wechat.TransfersHelper');
        $wpclass = new $wp($param);
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

        $wp = Vendor('wechat.TransfersHelper');
        $wpclass = new $wp($param);
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

    





















    /**
     * 现金红包发放
     */
    public function sendredpack2($wechat_id, $amount, $ordersn, $wishing, $remark, $act_name, $send_name) {

        $amount *= 100;

        $requestUrl = 'https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack';
        $wxpay = $this->wxpay;
        $query = [
            'act_name' => $act_name,
            'client_ip' => $_SERVER['CLIENT_IP'],
            'mch_billno' => $ordersn,
            'mch_id' => $wxpay['mch_id'],
            'nonce_str' => random(32),
            'remark' => $remark,
            're_openid' => $wechat_id,
            'scene_id' => 'PRODUCT_4',
            'send_name' => $send_name,
            'total_amount' => $amount,
            'total_num' => 1,
            'wishing' => $wishing,
            'wxappid' => $wxpay['appid'],
        ];

        $query['sign'] = $this->bulidSign($query);

        $query = array2xml($query);

        // $ch = curl_init();

        // $sslCertPath = MFRAME."/Vendor/wxpay/cert/apiclient_cert.pem";
        // $sslKeyPath = MFRAME."/Vendor/wxpay/cert/apiclient_key.pem";
        // curl_setopt($ch,CURLOPT_SSLCERTTYPE,'PEM');
        // curl_setopt($ch,CURLOPT_SSLCERT, $sslCertPath);
        // curl_setopt($ch,CURLOPT_SSLKEYTYPE,'PEM');
        // curl_setopt($ch,CURLOPT_SSLKEY, $sslKeyPath);

        // $response = ihttp_post($requestUrl, $query);

        // if(is_error($response)) {
        //     return $response;
        // }

        // return $this->xmlToArray($response['content']);




        $ch = curl_init();
        $curlVersion = curl_version();
        $ua = "WXPaySDK/3.0.9 (".PHP_OS.") PHP/".PHP_VERSION." CURL/".$curlVersion['version']." "
        .$wxpay['mch_id'];

        //设置超时
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        curl_setopt($ch,CURLOPT_URL, $requestUrl);
        curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,FALSE);
        curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,FALSE);//严格校验
        curl_setopt($ch,CURLOPT_USERAGENT, $ua); 
        //设置header
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        //要求结果为字符串且输出到屏幕上
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    
        //设置证书
        //使用证书：cert 与 key 分别属于两个.pem文件
        //证书文件请放入服务器的非web目录下
        $sslCertPath = MFRAME."/Vendor/wxpay/cert/apiclient_cert.pem";
        $sslKeyPath = MFRAME."/Vendor/wxpay/cert/apiclient_key.pem";
        curl_setopt($ch,CURLOPT_SSLCERTTYPE,'PEM');
        curl_setopt($ch,CURLOPT_SSLCERT, $sslCertPath);
        curl_setopt($ch,CURLOPT_SSLKEYTYPE,'PEM');
        curl_setopt($ch,CURLOPT_SSLKEY, $sslKeyPath);
        
        //post提交方式
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
        //运行curl
        $data = curl_exec($ch);
        //返回结果
        if($data){
            curl_close($ch);
            return $data;
        } else { 
            $error = curl_errno($ch);
            curl_close($ch);
            throw new \Exception("curl出错，错误码:$error");
        }

    }

    
}