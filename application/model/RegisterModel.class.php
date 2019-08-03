<?php 
namespace wsys\model;

class RegisterModel extends CommonModel
{
    protected $tablename = 'register';

    public function register_info($condition = [])
    {
        $this->table(getTableName('Register'));
        $this->select(['ident','active_ident','jim','covers','gift_total','gift_amount','cav_times']);
        $where = [];
        if(!empty($condition['openid'])) {
            $where['openid'] = $condition['openid'];
        }
        if(!empty($condition['active_id'])) {
            $where['active_id'] = $condition['active_id'];
        }
        if(!empty($condition['ident'])) {
            $where['ident'] = $condition['ident'];
        }
        $this->where($where)->uni()->real();
        $row = $this->find();
        
        if(empty($row)) {
            return false;
        }
        $row['jim'] = json_decode($row['jim'], true);
        if(empty($row['covers'])) {
            $row['covers'] = [];
        } else {
            $row['covers'] = explode(',', $row['covers']);
        }
        return $row;
    }

    public function register($openid, $active_id, $active_ident, $form_data = [], $register_ident = '')
    {
        if(!is_array($form_data)) {
            $form_data = [];
        }

        $user = userinfo($openid);

        if(empty($register_ident)) {
            $result = $this->insertRow([
                'active_id'    => $active_id,
                'active_ident' => $active_ident,
                'openid'       => $openid,
                'avatar'       => $user['avatar'],
                'nickname'     => $user['nickname'],
                'jim'          => json_encode($form_data),
                'create_time'  => TIMESTAMP
            ]);
            $register_ident = $result;
        } else {
            $result = $this->updateRow([
                'active_id'    => $active_id,
                'active_ident' => $active_ident,
                'openid'       => $openid,
                'avatar'       => $user['avatar'],
                'nickname'     => $user['nickname'],
                'jim'          => json_encode($form_data),
                'create_time'  => TIMESTAMP
            ], [
                'ident' => $register_ident
            ]);
        }
        
        if($result === false) {
            return $this->setInfo(706, '报名失败');
        }

        return $this->setInfo(0, '报名成功', $register_ident);
    }

    protected function insertValidate($data) { return $data; }
    protected function updateRowCondition($condition) { return $condition; }
    protected function findRowCondition($condition = [])
    {
        $this->select(['ident` as `g','active_ident','openid','jim','covers','gift_total','gift_amount','create_time','cav_times','gift_score','nickname','avatar','cav_gift_total','cav_gift_amount','cav_gift_score','is_first_view']);
        $where = [];
        if(!empty($condition['openid'])) {
            $where['openid'] = $condition['openid'];
        }
        if(!empty($condition['active_id'])) {
            $where['active_id'] = $condition['active_id'];
        }
        if(!empty($condition['ident'])) {
            $where['ident'] = $condition['ident'];
        }
        if(!empty($condition['active_ident'])) {
            $where['active_ident'] = $condition['active_ident'];
        }
        $this->where($where);
    }
    protected function findRowTrim($row)
    {
        $row['create_time'] = date('Y-m-d H:i', $row['create_time']);
        $row['jim'] = json_decode($row['jim'], true);
        if(empty($row['covers'])) {
            $row['covers'] = [];
        } else {
            $row['covers'] = explode(',', $row['covers']);
            foreach($row['covers'] as &$cover) {
                $cover = [
                    'path' => $cover,
                    'url' => tomedia($cover)
                ];
            }
        }
        return $row;
    }

    protected function setFieldCondition($name, $condition = [])
    {
        if($name == 'covers') {
            $RegisterModel = new RegisterModel;
            $register_info = $RegisterModel->register_info([
                'ident' => $condition['ident']
            ]);
            if($register_info === false) {
                return $this->setInfo(414, '您暂未报名，请先去报名后再上传展示图');
            }
            return $condition;
        }
        if($name == 'is_first_view') {
            return $condition;
        }
        return false;
    }

    public function statistics($register_ident, $total, $amount, $score)
    {
        return $this->updateRow([
            'gift_total +=' => $total,
            'gift_amount +=' => $amount,
            'gift_score +=' => $score
        ], [
            'ident' => $register_ident
        ]);
    }

    public function rankList($condition = [], $size = 100)
    {
        $this->table(getTableName($this->tablename));
        if(isset($condition['active_ident'])) {
            $this->where('active_ident', $condition['active_ident']);
        }
        $this->where('covers !=', '');
        $this->page(1, $size);
        $this->orderby('gift_score', 'DESC')->orderby('gift_amount', 'DESC');
        $this->select(['ident` as `g','covers','gift_score','gift_amount','jim','cav_times']);
        $this->uni()->real();
        return $this->getall();
    }

    protected function getListCondition($condition = [])
    {
        $this->leftjoin(getTableName('Active'), 'active')
            ->on('register.active_ident', 'active.ident');

        $this->field(['register.ident','register.active_ident','register.openid','register.gift_score','register.gift_amount','register.create_time','register.nickname','register.avatar','register.jim','register.cav_gift_amount',
            'active.title','register.cav_times']);
        
        $where = [];
        if(!empty($condition['active_ident'])) {
            $where['register.active_ident'] = $condition['active_ident'];
        }
        $this->where($where);

        $this->order([
            'register.create_time' => 'DESC'
        ]);

        $where = [];

        if(!empty($condition['title'])) {
            $where['active.title LIKE'] = '%'.$condition['title'].'%';
        }
        if(!empty($condition['active_ident'])) {
            $where['active.ident'] = $condition['active_ident'];
        }
        $this->where($where);

    }

    protected function getListTrim($list)
    {
        foreach($list as &$item) {
            $item['create_time'] = date('Y-m-d H:i', $item['create_time']);
            $item['avatar'] = tomedia($item['avatar']);
            if(empty($item['jim'])) {
                $item['jim'] = [];
            } else {
                $item['jim'] = json_decode($item['jim'], true);
            }
            $item['cav_status_name'] = $item['cav_times'] > 0 ? '已核销，核销价值：'.$item['cav_gift_amount'].'元' : '---';
        }

        return $list;
    }

}