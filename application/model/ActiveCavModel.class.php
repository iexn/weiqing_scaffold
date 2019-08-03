<?php 
namespace wsys\model;

class ActiveCavModel extends CommonModel
{

    protected $tablename = 'active_cav';

    protected function findRowCondition($condition = [])
    {
        $where = [];
        if(!empty($condition['openid'])) {
            $where['openid'] = $condition['openid'];
        }
        if(!empty($condition['active_ident'])) {
            $where['active_ident'] = $condition['active_ident'];
        }
        $this->field(['openid','nickname','avatar','create_time']);
        $this->where($where);
        return $this;
    }

    protected function findRowTrim($data)
    {
        $data['create_time'] = date('Y-m-d H:i', $data['create_time']);
        return $data;
    }

    protected function getListCondition($condition = [])
    {
        $this->field(['ident','openid','nickname','avatar','cav_total','create_time']);
        $this->order(['create_time'=>'DESC']);
        $where = [];
        if(!empty($condition['active_ident'])) {
            $where['active_ident'] = $condition['active_ident'];
        }
        $this->where($where);
    }

    protected function getListTrim($list)
    {
        foreach($list as &$item) {
            $item['avatar'] = tomedia($item['avatar']);
            $item['create_time'] = date('Y-m-d H:i', $item['create_time']);
        }

        return $list;
    }

    protected function removeCondition($condition = [])
    {
        return [
            'ident' => $condition['ident']
        ];
    }

    public function getFansList($value)
    {
        $value = $value ? addslashes(trim($value)) : ' ';
        $uniacid = $GLOBALS['_W']['uniacid'];
        $acid = $GLOBALS['_W']['acid'];

        $this->table('mc_mapping_fans', 'f')
            ->select('f.nickname', 'f.openid', 'uni.name AS uni_name')
            ->leftjoin('uni_account', 'uni')
            ->on('f.uniacid', 'uni.uniacid');

        $this->where('f.uniacid', $uniacid)
            ->where('f.acid', $acid)
            ->where('f.follow', '1');
        if (!empty($value)) {
            $this->where('f.nickname LIKE', '%' . $value . '%')->whereor('f.openid LIKE', '%' . $value . '%');
        }

        $this->groupby('f.fanid')
            ->orderby('f.followtime', 'DESC')->uni('f');

        $fans_list = $this->getall();
        if (!empty($fans_list)) {
            foreach ($fans_list as &$v) {
                if (!UNI_BRIDLE) {
                    $v['nickname'] .= '【' . $v['uni_name'] . '】';
                }
            }
            unset($v);
        }

        return $fans_list;
    }

    protected function insertValidate($data)
    {
        return [
            'active_ident' => $data['active_ident'],
            'openid'       => $data['openid'],
            'nickname'     => $data['nickname'],
            'avatar'       => $data['avatar'],
            'create_time'  => TIMESTAMP
        ];
    }

}