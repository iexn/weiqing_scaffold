<?php
namespace wsys\wxpay;
/**
 * 内部实现类，可不使用
 * Github: https://github.com/tqyq/WxMchPayHelper
 *  微信企业支付php版（包含红包、转账功能），基于官方的rest api做了封装和测试，避了一些坑
 *  调用者只需要引入工程的WxMchPayHelper.php，其余的WxPayApi直接使用微信官方的支付api代码即可。
 *  以下是示例
    // 发送单个红包
    $param = ["nonce_str" => \WxPayApi::getNonceStr(),//随机字符串
        "mch_billno" => $this->app_mchid . date('YmdHis') . rand(1000, 9999),//订单号
        "mch_id" => \WxPayConfig::MCHID,//商户号
        "wxappid" => \WxPayConfig::APPID,
        "send_name" => '同仁堂健康',//红包发送者名称
        "re_openid" => $openid,
        "total_amount" => 100,//付款金额，单位分
        "min_value" => 100,//最小红包金额，单位分
        "max_value" => 100,//最大红包金额，单位分
        "total_num" => 1,//红包发放总人数
        "wishing" => '恭喜发财',//红包祝福语
        "client_ip" => '127.0.0.1',//调用接口的机器 Ip 地址
        "act_name" => '红包活动',//活动名称
        "remark" => '快来抢！',//备注信息
    ];
    $wxMchPayHelper = new \WxMchPayHelper($param);
    $r = $wxMchPayHelper->send_redpack();
    
    // 发送裂变红包
    // 注意：发裂变红包不能加不必要的参数：min_value，max_value，client_ip
    $param = ["nonce_str" => \WxPayApi::getNonceStr(),//随机字符串
        "mch_billno" => $this->app_mchid . date('YmdHis') . rand(1000, 9999),//订单号
        "mch_id" => \WxPayConfig::MCHID,//商户号
        "wxappid" => \WxPayConfig::APPID,
        "send_name" => '同仁堂健康',//红包发送者名称
        "re_openid" => $openid,
        "total_amount" => 300,//付款金额，单位分
        "total_num" => 3,//红包发放总人数
        "amt_type" => 'ALL_RAND',//红包金额设置方式，ALL_RAND—全部随机
        "wishing" => '恭喜发财',//红包祝福语
        "act_name" => '红包活动',//活动名称
        "remark" => '快来抢！',//备注信息
    ];
    $wxMchPayHelper = new \WxMchPayHelper($param);
    $r = $wxMchPayHelper->send_group();
    
    // 企业转账给个人
    $param = [
        "nonce_str" => \WxPayApi::getNonceStr(),//随机字符串
        "mchid" => \WxPayConfig::MCHID,//商户号
        "mch_appid" => \WxPayConfig::APPID,
        "partner_trade_no" => $this->genOutTradeNo(),//订单号
        "openid" => $openid,
        "amount" => 100,//付款金额，单位分
        "check_name" => 'NO_CHECK',
            // "re_user_name" => '不知道',//
        "spbill_create_ip" => '127.0.0.1',//调用接口的机器 Ip 地址
        "desc" => '有钱就是任性',//备注信息
    ];
    $wxMchPayHelper = new \WxMchPayHelper($param);
    $r = $wxMchPayHelper->transfers();

 *
 * 
 * 继承微擎的weixinpay目的是获取用户在微擎后台提交的有关支付的信息，$this->wxpay 的参数。
 * 
 */
class WxMchPayHelper extends \WeiXinPay
{
    private $parameters;

    function __construct($param)
    {
        $this->parameters = $param;
        parent::__construct();
    }

    /**
     * 发送单个红包
     */
    public function exec($url)
    {
        $this->parameters['sign'] = $this->get_sign();
        $postXml = $this->arrayToXml($this->parameters);//生成接口XML信息
        $responseXml = $this->curl_post_ssl($url, $postXml);
        $responseObj = simplexml_load_string($responseXml, 'SimpleXMLElement', LIBXML_NOCDATA);
        return $responseObj;
    }

    /**
     * 企业向微信用户个人付款/转账
     */
    public function transfers()
    {
        return $this->exec('https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers');
    }

    /**
     * 发送单个红包
     */
    public function send_redpack()
    {
        return $this->exec('https://api.mch.weixin.qq.com/mmpaymkttransfers/sendredpack');
    }

    /**
     * 发送裂变红包
     */
    public function send_group()
    {
        return $this->exec('https://api.mch.weixin.qq.com/mmpaymkttransfers/sendgroupredpack');
    }

    /**
     * 检查生成签名参数
     */
    protected function check_sign_parameters()
    {
        if ($this->parameters["nonce_str"] &&
            $this->parameters["mch_billno"] &&
            $this->parameters["mch_id"] &&
            $this->parameters["wxappid"] &&
            $this->parameters["send_name"] &&
            $this->parameters["re_openid"] &&
            $this->parameters["total_amount"] &&
//            $this->parameters["max_value"] &&
//            $this->parameters["min_value"] &&
            $this->parameters["total_num"] &&
            $this->parameters["wishing"] &&
//            $this->parameters["client_ip"] &&
            $this->parameters["act_name"] &&
            $this->parameters["remark"]
        ) {
            return true;
        }
        return false;
    }

    /**
     * 例如：
     * appid：    wxd111665abv58f4f
     * mch_id：    10000100
     * device_info：  1000
     * body：    test
     * nonce_str：  ibuaiVcKdpRxkhJA
     * 第一步：对参数按照 key=value 的格式，并按照参数名 ASCII 字典序排序如下：
     * stringA="appid=wxd930ea5d5a258f4f&body=test&device_info=1000&mch_id=10000100&nonce_str=ibuaiVcKdpRxkhJA";
     * 第二步：拼接支付密钥：
     * stringSignTemp="stringA&key=192006250b4c09247ec02edce69f6a2d"
     * sign=MD5(stringSignTemp).toUpperCase()="9A0A8659F005D6984697E2CA0A9CF3B7"
     */
    protected function get_sign()
    {
        // $this->wxpay['key'] = 'awkcgogjiaiucyvu4kuruo34lr2cybuc';
        if (!$this->wxpay['key']) {
            die('密钥不能为空');
        }
//        if (!$this->check_sign_parameters()) {
//            die('生成签名参数缺失');
//        }
        ksort($this->parameters);
        $unSignParaString = $this->formatQueryParaMap($this->parameters, false);

        return $this->sign($unSignParaString,$this->wxpay['key']);
    }

    /**
     * 获取证书
     */
    private function getPem() {
        global $_W;
        $unisetting = pdo_get('uni_settings', array('uniacid' => $_W['uniacid']), array('payment'));
        $wechat = unserialize($unisetting['payment']);
        
        $wsysCachePath = ATTACHMENT_ROOT . 'wsys_cache';
        if(!is_dir($wsysCachePath)) {
            mkdir($wsysCachePath);
        }
        
        $certPath = $wsysCachePath . '/wsys_cert_uniacid'.$_W['uniacid'].'.pem';
        $keyPath  = $wsysCachePath . '/wsys_key_uniacid'.$_W['uniacid'].'.pem';
        file_put_contents($certPath, authcode($wechat['wechat_refund']['cert'], 'DECODE'));
        file_put_contents($keyPath, authcode($wechat['wechat_refund']['key'], 'DECODE'));
        return [
            'cert' => $certPath,
            'key' => $keyPath
        ];
    }

    function curl_post_ssl($url, $vars, $second = 30, $aHeader = array())
    {
        $ch = curl_init();
        //超时时间
        curl_setopt($ch, CURLOPT_TIMEOUT, $second);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        //这里设置代理，如果有的话
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        //cert 与 key 分别属于两个.pem文件
        
        $pem = $this->getPem();

        curl_setopt($ch, CURLOPT_SSLCERT, $pem['cert']);
        curl_setopt($ch, CURLOPT_SSLKEY, $pem['key']);

        // curl_setopt($ch, CURLOPT_SSLCERT, MFRAME."/Vendor/wxpay/cert/apiclient_cert.pem");
        // curl_setopt($ch, CURLOPT_SSLKEY, MFRAME."/Vendor/wxpay/cert/apiclient_key.pem");

        if (count($aHeader) >= 1) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $aHeader);
        }

        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $vars);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }

    function formatQueryParaMap($paraMap, $urlencode)
    {
        $buff = "";
        ksort($paraMap);
        foreach ($paraMap as $k => $v) {
            if ($v && "sign" != $k) {
                if ($urlencode) {
                    $v = urlencode($v);
                }
                $buff .= "$k=$v&";
            }
        }
        if (strlen($buff) > 0) {
            $reqPar = substr($buff, 0, strlen($buff) - 1);
        }
        return $reqPar;
    }

    function arrayToXml($arr)
    {
        $xml = '<xml>';
        foreach ($arr as $key => $val) {
            if (is_numeric($val)) {
                $xml .= "<$key>$val</$key>";
            } else {
                $xml .= "<$key><![CDATA[$val]]></$key>";
            }
        }
        $xml .= '</xml>';
        return $xml;
    }

    protected function sign($content, $key)
    {
        if (!$content) {
            die('签名内容不能为空');
        }
        $signStr = "$content&key=$key";
        return strtoupper(md5($signStr));
    }

}
