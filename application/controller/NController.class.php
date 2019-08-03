<?php 
namespace wsys\controller;

use wsys\logic\RegisterLogic;

/**
 * 不需要任何身份验证时走此类
 */
class NController extends CommonController
{
    
    public function export_register($w, $get, $post)
    {
        
        $key = $get['key'];
        if(empty($key)) {
            return wechat_warning_page('无权导出', '导出报名数据');
        }

        $decode = szxh_decry($key, MNAME . '_export_register');
        if(empty($decode) || empty($decode['outtime'])) {
            return wechat_warning_page('无权导出', '导出报名数据');
        }
        if(TIMESTAMP > $decode['outtime']) {
            return wechat_warning_page('身份验证已过期，请重新导出', '导出报名数据');
        }

        if(is_wechat()) {
            return wechat_warning_page('请点击右上角其他浏览器打开', '导出报名数据');
        }

        $file_name = date('Ymd') . '报名数据导出';
        $head_name = date('Ymd') . '报名数据导出';

        $head_arr = ['报名人','赞个数','已收价值','核销状态','报名时间','采集信息'];
        
        // 获取报名列表
        $RegisterLogic = new RegisterLogic;
        $res = $RegisterLogic->getList([
            'active_ident' => $decode['active']['s']
        ], false, false);
        if($res === false) {
            return wechat_warning_page($RegisterLogic->getMessage(), '导出报名数据');
        }
        $list = $res['list'];
        $data = [];
        if(!empty($list)) {
            foreach($list as $item) {
                $jim = [];
                foreach($item['jim'] as $ij) {
                    $jim[] = $ij['name'] . ':' . $ij['value'];
                }
                $data[] = [
                    $item['nickname'],
                    $item['gift_score'],
                    $item['gift_amount'],
                    $item['cav_status_name'],
                    $item['create_time'],
                    implode('    ', $jim)
                ];
            }
        }

        getExcel($file_name, $head_name, $head_arr, $data);
    }

}