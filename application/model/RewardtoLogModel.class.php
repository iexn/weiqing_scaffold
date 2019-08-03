<?php 
namespace wsys\model;

class RewardtoLogModel extends CommonModel
{
    protected $tablename = 'rewardto_log';

    protected function getListCondition($condition = [])
    {
        $where = [];
        if(isset($condition['openid'])) {
            $where['openid'] = $condition['openid'];
        }
        if(isset($condition['active_ident'])) {
            $where['active_ident'] = $condition['active_ident'];
        }
        if(isset($condition['register_ident'])) {
            $where['register_ident'] = $condition['register_ident'];
        }
        if(isset($condition['gift_ident'])) {
            $where['gift_ident'] = $condition['gift_ident'];
        }
        if(isset($condition['sort'])) {
            if($condition['sort'] == 'rank') {
                $this->orderby('gift_score', 'DESC')->orderby('gift_amount', 'DESC');
            }
        }
        $this->where($where);
        $this->order(['rewardto_time'=>'DESC','id'=>'DESC']);
    }

    protected function getListTrim($list)
    {
        foreach($list as &$item) {
            $item = [
                'name' => $item['name'],
                'gift_name' => $item['gift_name'],
                'gift_total' => $item['gift_total'],
                'rewardto_time' => date('Y/m/d', $item['rewardto_time']),
                'gift_amount' => $item['gift_amount'],
                'gift_score' => $item['gift_score']
            ];
        }
        return $list;
    }

    public function record($openid, $active_ident, $register_ident, $gift, $total)
    {
        $user = userinfo($openid);

        return $this->insertRow([
            'register_ident'      => $register_ident,
            'active_ident'        => $active_ident,
            'openid'              => $openid,
            'avatar'              => $user['avatar'],
            'name'                => $user['nickname'],
            'gift_ident'          => $gift['ident'],
            'gift_name'           => $gift['name'],
            'gift_cover'          => $gift['cover'],
            'gift_total'          => $total,
            'gift_amount'         => $gift['amount'] * $total,
            'gift_score'          => $gift['score'] * $total,
            'rewardto_time'       => TIMESTAMP,
        ]);
    }

    protected function insertValidate($data)
    {
        return $data;
    }

}