<?php 
namespace wsys\controller;

class ActiveCavController extends CommonConditionController
{
    protected $logic_class = 'ActiveCav';
    protected $action = [
        'search' => '@searchCaverList',
        'addCaver' => '@addCaver'
    ];

    protected function getListCondition($w, $get, $post)
    {
        return [
            'active_ident' => $post['s']
        ];
    }

    protected function removeCondition($w, $get, $post)
    {
        return [
            'ident' => $post['ident']
        ];
    }

    protected function callCondition($name, $w, $get, $post)
    {
        if($name == 'search') {
            return [
                $post['value']
            ];
        }

        if($name == 'addCaver') {
            return [
                $post['s'], $post['openid']
            ];
        }
    }

}