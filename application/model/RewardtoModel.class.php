<?php 
namespace wsys\model;

class RewardtoModel extends CommonModel
{
    protected $tablename = 'Rewardto';

    protected function getListCondition($condition = [])
    {
        $where = [];
        if(isset($condition['openid'])) {
            $where['openid'] = $condition['openid'];
        }
        if(isset($condition['register_ident'])) {
            $where['register_ident'] = $condition['register_ident'];
        }
        $this->where($where);
        
        if($condition['sort'] == 'rank') {
            $this->order(['gift_amount' => 'DESC']);
        }
        $this->order(['last_rewardto_time' => 'DESC']);
    }

    public function record($openid, $active_ident, $register_ident, $gift, $total)
    {
        $user = userinfo($openid);

        // 查询是否有记录
        $record = $this->findRow([
            'openid' => $openid,
            'active_ident' => $active_ident,
            'register_ident' => $register_ident
        ]);
        
        // 有记录更新，没有添加
        if(empty($record)) {
            return $this->insertRow([
                'register_ident'      => $register_ident,
                'active_ident'        => $active_ident,
                'openid'              => $openid,
                'avatar'              => $user['avatar'],
                'name'                => $user['nickname'],
                'first_rewardto_time' => TIMESTAMP,
                'last_rewardto_time'  => TIMESTAMP,
                'gift_total'          => $total,
                'gift_amount'         => $gift['amount'] * $total,
                'gift_score'          => $gift['score'] * $total
            ]);
        } else {
            return $this->updateRow([
                'gift_total +='  => $total,
                'gift_amount +=' => $gift['amount'] * $total,
                'gift_score +='  => $gift['score'] * $total,
                'last_rewardto_time' => TIMESTAMP,
            ], [
                'openid' => $openid,
                'active_ident' => $active_ident,
                'register_ident' => $register_ident
            ]);
        }
    }

    protected function insertValidate($data)
    {
        return $data;
    }
    protected function updateRowCondition($condition)
    {
        return $condition;
    }

    protected function findRowCondition($condition = [])
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
        $this->where($where);
        return true;
    }

}