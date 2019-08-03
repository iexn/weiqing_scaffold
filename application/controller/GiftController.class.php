<?php 
namespace wsys\controller;
/**
 * 开放接口：
 * getList
 * save
 * detail
 * remove
 * toggle
 * giftList
 */
class GiftController extends CommonConditionController
{
    protected $logic_class = 'Gift';
    protected $action = [
        'index'        => 'index',
        'add,update'   => 'update',
        'giftList'     => '@giftList',
        'initGiftList' => '@initGiftList'
    ];

    protected function saveCondition($w, $get, $post)
    {
        $data = [
            'name'            => $post['name'],
            'cover'           => $post['cover'],
            'amount'          => $post['amount'],
            'score'           => $post['score'],
            'init_have_total' => $post['init_have_total'],
            'remarks'         => $post['remarks'],
            'sort'            => $post['sort'],
        ];
        return $data;
    }

    protected function detailCondtiion($w, $get, $post)
    {
        return [
            'ident' => $get['ident']
        ];
    }

    protected function removeCondition($w, $get, $post)
    {
        return [
            'ident' => $post['ident']
        ];
    }

    protected function toggleCondition($w, $get, $post)
    {
        return [];
    }

    protected function callCondition($name, $w, $get, $post)
    {
        switch($name) {
            case 'initGiftList':
                return [$w['uniacid']];
            break;
        }
        return [];
    }

}