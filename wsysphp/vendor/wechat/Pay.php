<?php
namespace wsys\wechat;

class Pay
{

    private $order_model_name = '';
    private $config = [];
    private $error = '';

    public function __construct($order_model_name, $config = [])
    {
        global $_W;
        $this->order_model_name = $order_model_name;

        load()->model('payment');
        $wxapp_uniacid = intval($_W['account']['uniacid']);
        $setting = uni_setting($wxapp_uniacid, array('payment'));
        
        $this->config = [
            // appid
            'appid' => $_W['account']['key'],
            // 支付密钥
            'signkey' => $setting['payment']['wechat']['signkey'],
            // 商户号
			'mchid' => $setting['payment']['wechat']['mchid'],
			'version' => 2,
        ];

        // 如果自己配置了以上三个，使用自己配置的，并且只要设置了appid，视为三项均使用自己配置的
        if(!empty($config['appid'])) {
            $this->config['appid'] = $config['appid'];
            $this->config['signkey'] = $config['signkey'];
            $this->config['mchid'] = $config['mchid'];
        }
    }

    /**
     * 获取抛出的错误信息，只能连续获取一次
     */
    public function getError()
    {
        $error = $this->error;
        $this->error = '';
        return $error;
    }

    /**
     * 统一下单，返回js支付需要参数
     * 订单记录表的字段为统一字段
     * 1. order_sn为自己在订单表中的order_sn字段创建的字符串，使用配置的订单表关联类查找findRow方法得到
     * 2. 创建的订单只能由自己（或代付人，暂未实现）支付，字段名为订单表的openid
     * 3. 调用之前必须通过微信授权步骤，否则将失败
     * ---
     * Tips1: 修改：将$GLOBALS['_W']['openid']这个
     */
    public function unifiedOrder($order_sn)
    {

        $openid = $GLOBALS['_W']['openid'];
        if (empty($openid)) {
            $this->error = '请先通过微信授权再支付';
            return false;
        }

        $ObjectClass = new $this->order_model_name;

        $order = $ObjectClass->findRow([
            'order_sn' => $order_sn
        ]);
        
        if (empty($order)) {
            $this->error = '订单不存在';
            return false;
        }

        if ($order['status'] != 'wait') {
            $this->error = '订单已完成或已取消';
            return false;
        }

        // 支付人openid
        $pay_openid = $order['openid'];

        if ($pay_openid != $openid) {
            $this->error = '支付人身份错误，支付已取消';
            return false;
        }

        // 创建微擎订单，返回微擎订单号
        $res = $this->createW7Order([
            'title' => $order['active_title'],
            'tid' => $order['order_sn'],
            'fee' => $order['price']
        ]);
        if(is_error($res)) {
            $this->error = $res['message'];
            return false;
        }
        return $res;
    }

    /**
     * 创建微擎的订单步骤
     * $order: 
     * title: 订单名称
     * tid: 订单号
     * fee: 金额
     */
    protected function createW7Order($order)
    {
        global $_W;
		load()->model('account');
		$paytype = !empty($order['paytype']) ? $order['paytype'] : 'wechat';
		$moduels = uni_modules();
		if (empty($order) || !array_key_exists(MNAME, $moduels)) {
			return error(1, '模块不存在');
		}
		$moduleid = empty($this->module['mid']) ? '000000' : sprintf("%06d", $this->module['mid']);
		$uniontid = date('YmdHis') . $moduleid . random(8, 1);
		$paylog = pdo_get('core_paylog', array('uniacid' => $_W['uniacid'], 'module' => MNAME, 'tid' => $order['tid']));
		if (empty($paylog)) {
			$paylog = array(
				'uniacid' => $_W['uniacid'],
				'acid' => $_W['acid'],
				'type' => '',
				'openid' => $_W['openid'],
				'module' => MNAME,
				'tid' => $order['tid'],
				'uniontid' => $uniontid,
				'fee' => floatval($order['fee']),
				'card_fee' => floatval($order['fee']),
				'status' => '0',
				'is_usecard' => '0',
				'tag' => iserializer(array('acid' => $_W['acid'], 'uid' => $_W['member']['uid']))
			);
			pdo_insert('core_paylog', $paylog);
			$paylog['plid'] = pdo_insertid();
		}
		if (!empty($paylog) && $paylog['status'] != '0') {
			return error(1, '这个订单已经支付成功, 不需要重复支付.');
		}
		if (!empty($paylog)) {
			pdo_update('core_paylog', array(
				'uniontid' => $uniontid,
			), array('plid' => $paylog['plid']));
			$paylog['uniontid'] = $uniontid;
		}
		$_W['openid'] = $paylog['openid'];
		$params = array(
			'tid' => $paylog['tid'],
			'fee' => $paylog['card_fee'],
			'user' => $paylog['openid'],
			'uniontid' => $paylog['uniontid'],
			'title' => $order['title'],
        );
        
		if ($paytype == 'wechat') {
			return $this->wechatExtend($params);
		} elseif ($paytype == 'credit') {
			return $this->creditExtend($params);
		}
    }

    protected function wechatExtend($params)
	{
		return $this->build($params, $this->config);
	}

    protected function build($params, $wechat)
    {
        global $_W;
        load()->func('communication');
        if (empty($wechat['version']) && !empty($wechat['signkey'])) {
            $wechat['version'] = 1;
        }
        $wOpt = array();
        if ($wechat['version'] == 1) {
            $wOpt['appId'] = $wechat['appid'];
            $wOpt['timeStamp'] = strval(TIMESTAMP);
            $wOpt['nonceStr'] = random(8);
            $package = array();
            $package['bank_type'] = 'WX';
            $package['body'] = $params['title'];
            $package['attach'] = $_W['uniacid'];
            $package['partner'] = $wechat['partner'];
            $package['out_trade_no'] = $params['sn'];
            $package['total_fee'] = $params['fee'] * 100;
            $package['fee_type'] = '1';
            $package['notify_url'] = $_W['siteroot'] . 'payment/wechat/notify.php';
            $package['spbill_create_ip'] = CLIENT_IP;
            $package['time_start'] = date('YmdHis', TIMESTAMP);
            $package['time_expire'] = date('YmdHis', TIMESTAMP + 600);
            $package['input_charset'] = 'UTF-8';
            if (!empty($wechat['sub_mch_id'])) {
                $package['sub_mch_id'] = $wechat['sub_mch_id'];
            }
            ksort($package);
            $string1 = '';
            foreach ($package as $key => $v) {
                if (empty($v)) {
                    unset($package[$key]);
                    continue;
                }
                $string1 .= "{$key}={$v}&";
            }
            $string1 .= "key={$wechat['key']}";
            $sign = strtoupper(md5($string1));

            $string2 = '';
            foreach ($package as $key => $v) {
                $v = urlencode($v);
                $string2 .= "{$key}={$v}&";
            }
            $string2 .= "sign={$sign}";
            $wOpt['package'] = $string2;

            $string = '';
            $keys = array('appId', 'timeStamp', 'nonceStr', 'package', 'appKey');
            sort($keys);
            foreach ($keys as $key) {
                $v = $wOpt[$key];
                if ($key == 'appKey') {
                    $v = $wechat['signkey'];
                }
                $key = strtolower($key);
                $string .= "{$key}={$v}&";
            }
            $string = rtrim($string, '&');
            $wOpt['signType'] = 'SHA1';
            $wOpt['paySign'] = sha1($string);
            return $wOpt;
        } else {
            if (!empty($params['user']) && is_numeric($params['user'])) {
                $params['user'] = mc_uid2openid($params['user']);
            }
            $package = array();
            $package['appid'] = $wechat['appid'];
            $package['mch_id'] = $wechat['mchid'];
            $package['nonce_str'] = random(8);
            $package['body'] = cutstr($params['title'], 26);
            $package['attach'] = $_W['uniacid'];
            $package['out_trade_no'] = $params['uniontid'];
            $package['total_fee'] = $params['fee'] * 100;
            $package['spbill_create_ip'] = CLIENT_IP;
            $package['time_start'] = date('YmdHis', TIMESTAMP);
            $package['time_expire'] = date('YmdHis', TIMESTAMP + 600);
            $package['notify_url'] = $_W['siteroot'] . 'payment/wechat/notify.php';
            $package['trade_type'] = 'JSAPI';
            if ($params['pay_way'] == 'web') {
                $package['trade_type'] = 'NATIVE';
                $package['product_id'] = $params['goodsid'];
            } else {
                $package['openid'] = empty($params['user']) ? $_W['fans']['from_user'] : $params['user'];
                if (!empty($wechat['sub_mch_id'])) {
                    $package['sub_mch_id'] = $wechat['sub_mch_id'];
                }
                if (!empty($params['sub_user'])) {
                    $package['sub_openid'] = $params['sub_user'];
                    unset($package['openid']);
                }
            }
            ksort($package, SORT_STRING);
            $string1 = '';
            
            foreach ($package as $key => $v) {
                if (empty($v)) {
                    unset($package[$key]);
                    continue;
                }
                $string1 .= "{$key}={$v}&";
            }
            $string1 .= "key={$wechat['signkey']}";
            $package['sign'] = strtoupper(md5($string1));

            $dat = array2xml($package);
            $response = ihttp_request('https://api.mch.weixin.qq.com/pay/unifiedorder', $dat);
            
            if (is_error($response)) {
                return $response;
            }
            $xml = @isimplexml_load_string($response['content'], 'SimpleXMLElement', LIBXML_NOCDATA);
            if (strval($xml->return_code) == 'FAIL') {
                return error(-1, strval($xml->return_msg));
            }
            if (strval($xml->result_code) == 'FAIL') {
                return error(-1, strval($xml->err_code) . ': ' . strval($xml->err_code_des));
            }
            $prepayid = $xml->prepay_id;
            $wOpt['appId'] = $wechat['appid'];
            $wOpt['timeStamp'] = strval(TIMESTAMP);
            $wOpt['nonceStr'] = random(8);
            $wOpt['package'] = 'prepay_id=' . $prepayid;
            $wOpt['signType'] = 'MD5';
            if ($xml->trade_type == 'NATIVE') {
                $code_url = $xml->code_url;
                $wOpt['code_url'] = strval($code_url);
            }
            ksort($wOpt, SORT_STRING);
            foreach ($wOpt as $key => $v) {
                $string .= "{$key}={$v}&";
            }
            $string .= "key={$wechat['signkey']}";
            $wOpt['paySign'] = strtoupper(md5($string));
            return $wOpt;
        }
    }
}
