<?php 
namespace wsys\model;

class ActiveModel extends CommonModel
{
    protected $tablename = 'active';

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
            'title'                    => $data['title'],
            'reward_info'              => $data['reward_info'],
            'amount'                   => $data['amount'],
            'start_time'               => $data['start_time'],
            'end_time'                 => $data['end_time'],
            'cover'                    => $data['cover'],
            'music'                    => $data['music'],
            'counsel'                  => $data['counsel'],
            'rule'                     => $data['rule'],
            'sort'                     => $data['sort'],
            'unlock'                   => $data['unlock'],
            'gift'                     => $data['gift'],
            'jim'                      => $data['jim'],
            'share_title'              => $data['share_title'],
            'share_desc'               => $data['share_desc'],
            'share_imgUrl'             => $data['share_imgUrl'],
            'cav_open'                 => $data['cav_open'],
            'cav_on_give_gift'         => $data['cav_on_give_gift'],
            'preview_covers'           => $data['preview_covers'],
            'enter_bless_status'       => $data['enter_bless_status'],
            'show_call_us'             => $data['show_call_us'],
            'show_caver_register_list' => $data['show_caver_register_list'],
        ];
        if(!is($data['title'], 'require')) {
            return $this->setInfo(701, '请填写活动名称');
        }
        if(!is($data['reward_info'], 'require')) {
            return $this->setInfo(701, '请填写赠送内容');
        }
        if(!is($data['amount'], 'require')) {
            return $this->setInfo(701, '请填写市场价');
        }
        if(!is($data['start_time'], 'require')) {
            return $this->setInfo(701, '请选择开始时间');
        }
        if(!is($data['end_time'], 'require')) {
            return $this->setInfo(701, '请选择结束时间');
        }
        if(!is($data['cover'], 'require')) {
            return $this->setInfo(701, '请上传活动封面');
        }
        if(!is($data['music'], 'require')) {
            return $this->setInfo(701, '请上传活动背景音乐');
        }
        if(!is($data['counsel'], 'require')) {
            return $this->setInfo(701, '请填写咨询客服');
        }
        if(!is($data['rule'], 'require')) {
            return $this->setInfo(701, '请填写活动规则');
        }
        if(!is($data['unlock'], 'require')) {
            return $this->setInfo(701, '请设置解锁奖励');
        }
        if(!is($data['gift'], 'require')) {
            return $this->setInfo(701, '请设置礼物');
        }
        if(!is($data['jim'], 'require')) {
            return $this->setInfo(701, '请设置表单采集信息');
        }
        if(!is($data['share_title'], 'require')) {
            return $this->setInfo(701, '请设置分享标题');
        }
        if(!is($data['share_desc'], 'require')) {
            return $this->setInfo(701, '请设置分享副标题');
        }
        if(!is($data['share_imgUrl'], 'require')) {
            return $this->setInfo(701, '请设置分享图片');
        }
        if(!is($data['cav_open'], 'require')) {
            return $this->setInfo(701, '请设置是否核销');
        }
        if(!is($data['cav_on_give_gift'], 'require')) {
            return $this->setInfo(701, '请设置核销后是否可以继续接收礼物');
        }

        if(!in_array($data['enter_bless_status'], ['highlight','off'])) {
            $data['enter_bless_status'] = 'off';
        }
        if(!in_array($data['show_call_us'], ['on','off'])) {
            $data['show_call_us'] = 'off';
        }
        if(!in_array($data['show_caver_register_list'], ['on','off'])) {
            $data['show_caver_register_list'] = 'off';
        }

        $data['start_time'] = strtotime($data['start_time']);
        $data['end_time'] = strtotime($data['end_time']);
        return $data;
    }

    protected function getListCondition($condition = [])
    {
        $this->orderby(['sort'=>'DESC','uni_id'=>'DESC']);
        $this->uni()->real();

        if(!empty($condition['title'])) {
            $this->where('title LIKE', '%'.$condition['title'].'%');
        }
    }

    protected function getListTrim($list)
    {
        foreach($list as &$item) {
            $item['start_time'] = date('Y-m-d H:i', $item['start_time']);
            $item['end_time'] = date('Y-m-d H:i', $item['end_time']);
        }

        return $list;
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

    protected function findRowTrim($data)
    {
        $data['start_time'] = date('Y-m-d H:i', $data['start_time']);
        $data['end_time'] = date('Y-m-d H:i', $data['end_time']);
        return $data;
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

    /**
     * 查单条数据
     */
    public function detail($ident, $valid_time = true)
    {

        $this->table(getTableName($this->tablename));
        $this->select(['ident` AS `s','title','reward_info','amount','start_time','end_time','cover','music','counsel','rule','gift','jim','unlock','share_title','share_desc','share_imgUrl','cav_open','cav_on_give_gift','preview_covers','enter_bless_status','show_call_us','show_caver_register_list']);
        $this->where([
            'ident' => $ident,
            'status' => 'on'
        ])->uni()->real();

        $active = $this->find();
        if(empty($active)) {
            return $this->setInfo(701, '活动已关闭或不存在');
        }
        if($valid_time) {
            if($active['start_time'] > TIMESTAMP) {
                return $this->setInfo(702, '活动未开始，请耐心等待', [
                    'arrive_time' => $active['start_time'] - TIMESTAMP
                ]);
            }
            if($active['end_time'] < TIMESTAMP) {
                return $this->setInfo(703, '活动已结束');
            }
        }

        // 处理数据格式
        $active['arrive_time'] = $active['start_time'] - TIMESTAMP;
        $active['out_time'] = $active['end_time'] - TIMESTAMP;
        $active['start_time'] = date('Y-m-d H:i', $active['start_time']);
        $active['end_time'] = date('Y-m-d H:i', $active['end_time']);
        $active['cover'] = tomedia($active['cover']);
        $active['music'] = tomedia($active['music']);
        $active['jim'] = json_decode($active['jim'], true);
        $active['gift'] = json_decode($active['gift'], true);
        $active['unlock'] = json_decode($active['unlock'], true);
        $active['preview_covers'] = explode(',', $active['preview_covers']);
        if(!empty($active['preview_covers'])) {
            foreach ($active['preview_covers'] as &$cover) {
                $cover = [
                    'path' => $cover,
                    'url' => tomedia($cover)
                ];
            }
        }
        foreach($active['unlock'] as &$unlock) {
            $unlock['cover'] = tomedia($unlock['cover']);
        }

        return $active;
    }

}