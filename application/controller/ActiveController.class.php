<?php 
namespace wsys\controller;

class ActiveController extends CommonConditionController
{
    protected $logic_class = 'Active';
    protected $action = [
        'index' => 'index',
        'add,update' => 'update',
        'register' => 'register/index',
        'caver' => 'active_cav/index',
        'caverList' => '@ActiveCav/getList'
    ];

    protected function saveCondition($w, $get, $post)
    {
        $data = [
            'title'                    => $post['title'],
            'reward_info'              => $post['reward_info'],
            'amount'                   => $post['amount'],
            'start_time'               => $post['start_time'],
            'end_time'                 => $post['end_time'],
            'cover'                    => $post['cover'],
            'music'                    => $post['music'],
            'counsel'                  => $post['counsel'],
            'rule'                     => $post['rule'],
            'sort'                     => $post['sort'],
            'unlock'                   => $post['unlock'],
            'gift'                     => $post['gift'],
            'jim'                      => $post['jim'],
            'share_title'              => $post['share_title'],
            'share_desc'               => $post['share_desc'],
            'share_imgUrl'             => $post['share_imgUrl'],
            'cav_open'                 => $post['cav_open'],
            'cav_on_give_gift'         => $post['cav_on_give_gift'],
            'preview_covers'           => $post['preview_covers'],
            'enter_bless_status'       => $post['enter_bless_status'],
            'show_call_us'             => $post['show_call_us'],
            'show_caver_register_list' => $post['show_caver_register_list'],
        ];

        return $data;
    }

    protected function getListCondition($w, $get, $post)
    {
        return [
            'title' => $get['title'] ?: $post['title']
        ];
    }

    protected function detailCondtiion($w, $get, $post)
    {
        return [
            'ident' => $get['ident']
        ];
    }

    protected function toggleCondition($w, $get, $post)
    {
        return [];
    }

    protected function removeCondition($w, $get, $post)
    {
        return [
            'ident' => $post['ident']
        ];
    }

    protected function callCondition($name, $w, $get, $post)
    {
        switch($name) {
            case 'caverList': 
                return [
                    [
                        'active_ident' => $post['s']
                    ]
                ];
        }
        return [];
    }

}