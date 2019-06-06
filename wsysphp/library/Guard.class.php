<?php 
namespace wsys;

class Guard {

    public static function wechat() {
        if(strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') == false) {
            $html = '';
            $html .= '<head><title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/open/libs/weui/0.4.1/weui.css"></head>';
            $html .= '<body><div class="weui_msg"><div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div><div class="weui_text_area"><h4 class="weui_msg_title">请在微信客户端打开链接</h4></div></div></body>';
            echo $html;
            exit;
        }
        return true;
    }

    public static function shield($tolink = true) {
        $config = \getConfig();
        $shields = explode("\r\n", $config['active_url']);
        $shield = $shields[0];
        $servername = \servername(true);

        // 地址栏内容
        $route = servername(true);
        // 添加域名之后的所有参数
        $route .= $_SERVER['REQUEST_URI'];
        if(strpos($route, 'wxref=mp.weixin.qq.com')) {
            $route = str_replace('wxref=mp.weixin.qq.com', '', $route);
        }
        
        if(empty($shield)) {
            return $route;
        }
        
        if($shield == $servername) {
            return $route;
        }

        $routeTo = str_replace($servername, $shield, $route);

        if($tolink) {
            tolink($routeTo);
        }

        return $routeTo;
        
    }

    public static function shareUrl() {
        // 获取分享用权限
        $shield = model('Shield')->findRow();

        // 是否开启防屏蔽
        if($shield['status'] == 1) {
            // 获取分享主域名页面地址
            $route = 'http://'. $shield['share_url'];
        } else {
            $route = servername(true);
        }

        // 添加域名之后的所有参数
        $route .= '/'.address();
        
        return wxref($route);
    }

    public static function originAuth($isApp = false, $callback = null) {
        // 判断授权条件
        global $_W;

        // upgrade auth key
        $config = getSystemConfig();

        $auth_key = $config['auth_key'];
        
        if($_W['ispost'] && !empty($_POST['auth_key'])) {
            // Todo check origin auth
            $auth_key = self::checkAuth($_POST['auth_key']);
            if($auth_key == false) {
                echo self::getOriginAuthTemplate('授权码错误，请重新输入', $isApp);exit;
            }
            
            setSystemConfig('auth_key', $auth_key);

            // Todo location page of localed page.
            return true;

        }
        
        if(empty($auth_key)) {
            echo self::getOriginAuthTemplate('抱歉，您的应用暂未授权，请联系QQ:982926122获取授权码', $isApp);exit;
        }

        $originAuth = \wsys_decry($auth_key, 'originAuthWsys');
        
        if(empty($originAuth)) {
            echo self::getOriginAuthTemplate('授权码发生错误，请重新填写', $isApp);exit;
        }

        if(empty($originAuth) || empty($originAuth['name'])) {
            echo self::getOriginAuthTemplate('授权码填写有误', $isApp);exit;
        }

        // Todo origin auth.
        $res = self::checkAuth($auth_key);
        
        if($res == false) {
            echo self::getOriginAuthTemplate('抱歉，您的应用暂未授权，请联系QQ:982926122获取授权码', $isApp);exit;
        }

        setSystemConfig('auth_key', $auth_key);
        return true;
    }

    private static function checkAuth($auth_key) {
        $url = 'http://api.onfinger.cn/we7/Auth/valid';
        // 读取缓存数据
        $cacheName = MNAME.'_auth_key';
        $cache = cache_load($cacheName);
        if(!empty($cache)) {
            $decry = wsys_decry($cache, 'originAuthWsyscache');
            if(!empty($decry) && !empty($decry['outtime']) && !empty($decry['name']) && !empty($decry['auth_key'])) {
                if($decry['outtime'] > TIMESTAMP && $decry['name'] == $cacheName && $decry['auth_key'] == $auth_key) {
                    return $decry['auth_key'];
                }
            }
        }

        $response = ihttp_request($url, [
            'body' => wsys_encry(['name' => MNAME], 'originAuthWsys')
        ]);

        if(is_error($response)) {
            return false;
        }
        $content = json_decode($response['content'], true);
      
        if(!is_array($content)) {
            return false;
        }
        
        if($content['code'] == 'FAIL') {
            return false;
        }
        
        if($content['auth_key'] != $auth_key) {
            return false;
        }

        cache_write($cacheName, wsys_encry([
            'outtime' => TIMESTAMP + 3600, // 1小时检测一次
            'name' => $cacheName,
            'auth_key' => $content['auth_key']
        ], 'originAuthWsyscache'));

        return $content['auth_key'];
    }

    private static function getOriginAuthTemplate($message, $isApp = false) {
        // 不满足授权条件后，页面修改显示
        if($isApp) { // 微信端
            $html = '';
            $html .= '<head><title>抱歉，出错了</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0"><link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/open/libs/weui/0.4.1/weui.css"></head>';
            $html .= '<body><div class="weui_msg"><div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div><div class="weui_text_area"><h4 class="weui_msg_title">网站正在维护中，请稍后</h4></div></div></body>';
            echo $html;
            exit;
        } else { // 后台
            $html = 
<<<EOF

<head>
    <title>抱歉，出错了</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">
    <link rel="stylesheet" type="text/css" href="https://res.wx.qq.com/open/libs/weui/0.4.1/weui.css">
</head>
<body>
    <div class="weui_msg">
        <div class="weui_icon_area"><i class="weui_icon_info weui_icon_msg"></i></div>
        <form class="weui_text_area" action="{$site}" name="form" method="POST">
            <h4 class="weui_msg_title">{$message}</h4>
            <p style="color:#999"></p>
            <div style="margin:40px 0;border-bottom:1px solid #ccc">
                <input class="weui_input" type="text" name="auth_key" placeholder="如果您已有授权码，请在此处填写。" style="border:none;outline:none;line-height:40px;height:40px;text-align:center;font-size:18px;width:100%"/>
            </div>
            <div>
                <button type="submit" class="weui_btn weui_btn_inline weui_btn_plain_primary">提交</button>
            </div>
        </form>
    </div>
</body>


EOF;
            echo $html;
            exit;
        }
    }


}