<?php 
namespace wsys\model;
use wsys\encry\XDecode;

class GiftModel extends CommonModel
{
    protected $tablename = 'gift';

    protected function insertValidate($data) { return $this->validate($data); }
    protected function updateValidate($data, $where = []) { return $this->validate($data); }
    protected function updateRowCondition($condition) {
        if(empty($condition['ident'])) {
            return $this->setInfo(726, '更新异常，请刷新后重试');
        }
        return [
            'ident' => $condition['ident']
        ];
    }

    protected function validate($data)
    {
        $data = [
            'name'            => $data['name'],
            'cover'           => $data['cover'],
            'amount'          => $data['amount'],
            'score'           => $data['score'],
            'sort'            => $data['sort'],
            'init_have_total' => $data['init_have_total'],
            'remarks'         => $data['remarks'],
        ];
        if(!is($data['name'], 'require')) {
            return $this->setInfo(701, '请填写礼物名称');
        }
        if(mb_strlen($data['name']) > 20) {
            return $this->setInfo(702, '礼物名称不能超过20个字');
        }
        if(!is($data['cover'], 'require')) {
            return $this->setInfo(703, '请选择礼物图标');
        }
        if(!is($data['amount'], 'require')) {
            return $this->setInfo(704, '请填写礼物价值');
        }
        if(!is($data['score'], 'require')) {
            return $this->setInfo(705, '请填写礼物成长值');
        }
        if(!is($data['init_have_total'], 'require')) {
            return $this->setInfo(705, '请填写礼物初始持有数量');
        }
        return $data;
    }

    protected function getListCondition($condition = [])
    {
        $this->orderby(['sort'=>'DESC','uni_id'=>'DESC']);
        $this->uni()->real();
        if (!empty($condition['status'])) {
            $this->where('status', $condition['status']);
        }
    }

    protected function removeCondition($condition = [])
    {
        $where = [];
        switch(true) {
            case !empty($condition['ident']):
                $where['ident'] = $condition['ident'];
            break;
            default:
                return $this->setInfo(701, '未指定条件，删除失败');
        }
        return $where;

    }

    protected function findRowCondition($condition = []) 
    {
        $where = [];

        if(isset($condition['ident'])) {
            $where['ident'] = $condition['ident'];
        }

        if(isset($condition['id'])) {
            $where['id'] = $condition['id'];
        }

        if(empty($where)) {
            return $this->setInfo(722, '没有查询条件，查询失败');
        }

        $this->where($where);
    }

    protected function beforeSetField($name, $value) 
    {
        if(!in_array($value, ['on','off'])) {
            return $this->setInfo(712, '状态值错误，更新失败');
        }
        return true;
    }
    protected function setFieldCondition($name, $condition = []) 
    {
        $where = [];
        switch(true) {
            case !empty($condition['ident']):
                $where['ident'] = $condition['ident'];
            break;
            default:
                return $this->setInfo(701, '未指定条件，操作失败');
        }
        return $where;
    }

    public function getGiftList($gift_ident_list)
    {
        $this->table(getTableName($this->tablename))->select(['ident','name','cover','amount','score'])
            ->where([
                'ident in' => $gift_ident_list,
                'status' => 'on',
            ])->uni()->real();
        
        return $this->getall();
    }

}