<?php 
namespace wsys\wechat;
load()->classs('weixin.account');

class Account {

    public function userInfo($openid)
    {
        $wx = new \WeiXinAccount;
        $token = $wx->getAccessToken();
        if (is_error($token)) {
			return $token;
		}
        return $this->exec("https://api.weixin.qq.com/cgi-bin/user/info?access_token={$token}&openid={$openid}&lang=zh_CN");
    }

    private function exec($url, $params = [])
    {
        $response = ihttp_request($url, urldecode(json_encode($params)));

		if(is_error($response)) {
			return "访问公众平台接口失败, 错误: {$response['message']}";
        }
        
        $result = @json_decode($response['content'], true);
        
		if(empty($result)) {
			return "接口调用失败, 元数据: {$response['meta']}";
		} elseif(!empty($result['errcode'])) {
			return "访问微信接口错误, 错误代码: {$result['errcode']}, 错误信息: {$result['errmsg']},信息详情：{$result['errcode']}";
        }

        return $result;
    }

    public function template($template_id, $openid, $data = [], $tolink = false) {

        $wx = new \WeiXinAccount;
        $token = $wx->getAccessToken();
        if (is_error($token)) {
			return $token;
		}
        $url = "https://api.weixin.qq.com/cgi-bin/message/template/send?access_token={$token}";
        
        $params = [
            'touser' => $openid,
            'template_id' => trim($template_id),
            'data' => $data
        ];

        if($tolink !== false) {
            $params['url'] = trim($tolink);
        }

        $response = ihttp_request($url, urldecode(json_encode($params)));

		if(is_error($response)) {
			return "访问公众平台接口失败, 错误: {$response['message']}";
        }
        
        $result = @json_decode($response['content'], true);
        
		if(empty($result)) {
			return "接口调用失败, 元数据: {$response['meta']}";
		} elseif(!empty($result['errcode'])) {
			return "访问微信接口错误, 错误代码: {$result['errcode']}, 错误信息: {$result['errmsg']},信息详情：{$result['errcode']}";
        }
        
		return true;

    }

    public function qrcode($str = "") {

        if(strlen($str) < 1 || strlen($str) > 64) {
            return "场景值字符串长度在1-64之间";
        }

    }


}