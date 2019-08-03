<?php

// 静态函数文件
function active($do, $open = false)
{
    if(!is_array($do)) {
        $do = [$do];
    }
    
    $isActive = in_array(ADDON_ACTION, $do, true);

    return $isActive ? ($open ? 'active open' : 'active') : '';
}

/**
 * 发送模板消息
 *
 * @param string $type 模板类型
 * @param string $openid 
 * @param array $data 模板数据数组
 * @param string $tolink 跳转链接，默认为false不设置链接
 * @return void
 */
function send_template($type, $openid, $params = [], $tolink = false) {

    // 获取模板
    $templates = C('wx_templates');
    if(empty($templates)) {
        return true;
    }
    $template_ids = array_keys($templates);
    if(!in_array($type, $template_ids)) {
        return '模板'.$type.'配置不存在，调用失败';
    }

    $data = $templates[$type];

    $params = array_merge($data, $params);

    $send = [];
    foreach($params as $key => $param) {
        if(!is_array($data[$key])) {
            $data[$key] = [
                'value' => $data[$key],
                'color' => ''
            ];
        }
        if(!is_array($param)) {
            $param = [
                'value' => $param,
                'color' => $data[$key]['color'] ?: ''
            ];
        } else {
            $param = [
                'value' => $param['value'] ?: $data[$key]['value'] ?: '',
                'color' => $param['color'] ?: $data[$key]['color'] ?: ''
            ];
        }
        $send[$key] = [
            'value' => $param['value'] ?: $data[$key]['value'] ?: '',
            'color' => $param['color'] ?: $data[$key]['color'] ?: '',
        ];
    }

    $config = \getConfig();
    $template_id = $config['template_id_'.$type];

    if(empty($template_id)) {
        return '请在模块设置中填写模板消息ID';
    }

    vendor('wechat/Account');
    $Message = new \wsys\wechat\Account;
    return $Message->template($template_id, $openid, $send, $tolink);

}

function template_data($type) {

}


function get_accounts_list() {
    global $_W;
    $module_name = $_W['current_module']['name'];
    if(empty($module_name)) {
        return [];
    }
	$accounts_list = module_link_uniacid_fetch($_W['uid'], $module_name);
	if (empty($accounts_list)) {
		return [];
	}
	$selected_account = [];
	foreach ($accounts_list as $account) {
		if (empty($account['uniacid']) || $account['uniacid'] != $_W['uniacid']) {
			continue;
		}
		if (in_array($_W['account']['type'], array(ACCOUNT_TYPE_OFFCIAL_NORMAL, ACCOUNT_TYPE_OFFCIAL_AUTH))) {
			if (!empty($account['version_id'])) {
				$version_info = wxapp_version($account['version_id']);
				$account['version_info'] = $version_info;
			}
			$selected_account = $account;
			break;
		} elseif ($_W['account']['type'] == ACCOUNT_TYPE_APP_NORMAL) {
			$version_info = wxapp_version($account['version_id']);
			$account['version_info'] = $version_info;
			$selected_account = $account;
			break;
		}
	}
	foreach ($accounts_list as $key => $account) {
		$url = url('module/display/switch', array('uniacid' => $account['uniacid'], 'module_name' => $module_name));
		if (!empty($account['version_id'])) {
			$url .= '&version_id=' . $account['version_id'];
		}
		$accounts_list[$key]['url'] = $url;
    }
    return $accounts_list;
}