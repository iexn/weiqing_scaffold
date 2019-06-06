<?php 
namespace wsys\controller;

class W7Controller extends CommonController
{

    /**
     * 获取系统配置js调用数据sysinfo
     */
    public function sysinfo($w, $get, $post)
    {
        // if(strpos($w['siteroot'], $_SERVER['HTTP_ORIGIN']) !== 0) {
        //     return $this->setInfo(100, 'error');
        // }

        $account = \WeAccount::create();
        $jssdkconfig = $account->getJssdkConfig($post['url']);
        $jssdkconfig['debug'] = $w['account']['jssdkconfig']['debug'];
        $jssdkconfig['jsApiList'] = $w['account']['jssdkconfig']['jsApiList'];

        $w['account']['jssdkconfig'] = $jssdkconfig;

        $sysinfo = [
            "account"          => $w['account'],
            "acid"             => $w['acid'],
            "attachurl"        => $w['attachurl'],
            "attachurl_local"  => $w['attachurl_local'],
            "attachurl_remote" => $w['attachurl_remote'],
            "cookie"           => [
                "pre" => $w['config']['cookie']['pre']
            ],
            "family"    => IMS_FAMILY,
            "isfounder" => !empty($w['isfounder']) ? 1 : 0,
            "module"    => [
                "url"  => defined('MODULE_URL') ? MODULE_URL : '',
                "name" => defined('IN_MODULE') ? IN_MODULE : ''
            ],
            "openid"          => $w['openid'],
            "server"          => phpversion(),
            "siteroot"        => $w['siteroot'],
            "siteurl"         => $w['siteurl'],
            "uid"             => $w['uid'],
            "uniacid"         => $w['uniacid'],
            "resource_url"    => __PUBLIC__ . '/',
            "controller_name" => ADDON_ACTION,
            "action_name"     => ADDON_ET,
            "config"          => getConfig()
        ];

        parse_str(parse_url($post['url'])['query'], $gets);
        $sysinfo['gets'] = $gets;
        
        return $this->setInfo(0, '', $sysinfo);
    }

    /**
     * 上传图片，返回根路径和访问路径
     */
    public function upload_image()
    {
        load()->func('file');
        $file = file_upload($_FILES['image'], 'image');
        if (is_error($file)) {
            return $this->setInfo(299, $file['message']);
        }
        return $this->setInfo(0, '上传成功', [
            'path' => $file['path'],
			'url' => tomedia($file['path'])
        ]);
    }

}
