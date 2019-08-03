<?php 
namespace wsys\logic;

use wsys\model\ActiveCavModel;

class ActiveCavLogic extends CommonConditionLogic
{
    protected $model_class = 'ActiveCav';

    protected $action = [
        'detail' => '@findRow::'
    ];

    public function searchCaverList($value)
    {
        $ActiveCavModel = new ActiveCavModel;
        $fans_list = $ActiveCavModel->getFansList($value);
        return $fans_list;
    }

    /**
     * 添加核销员到活动
     */
    public function addCaver($active_ident, $openid)
    {
        $ActiveCavModel = new ActiveCavModel;
        $caver = $ActiveCavModel->findRow([
            'active_ident' => $active_ident,
            'openid' => $openid
        ]);
        
        if(!empty($caver)) {
            return $this->setInfo(316, '请勿重复添加');
        }

        $user = userinfo($openid);

        $result = $ActiveCavModel->insertRow([
            'active_ident' => $active_ident,
            'openid'       => $openid,
            'nickname'     => $user['nickname'],
            'avatar'       => $user['avatar']
        ]);

        if($result === false) {
            return $this->setInfo($ActiveCavModel->getCode(), $ActiveCavModel->getMessage());
        }

        return $this->setInfo(0, '添加成功');
    }

}