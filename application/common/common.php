<?php

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