<?php 
namespace wsys\logic;

use wsys\model\ActiveModel;
use wsys\model\RegisterModel;

class RegisterLogic extends CommonConditionLogic
{
    protected $model_class = 'Register';

    public function register($openid, $active_ident, $data)
    {
        $ActiveModel = new ActiveModel;
        $active = $ActiveModel->findRow([
            'ident' => $active_ident
        ]);
        if($active === false) {
            return $this->setInfo($ActiveModel->getCode(), $ActiveModel->getMessage());
        }
        
        $RegisterModel = new RegisterModel;

        $register_info = $RegisterModel->register_info([
            'openid' => $openid, 
            'active_id' => $active['id']
        ]);

        $register_ident = '';
        if(!empty($register_info)) {
            $register_ident = $register_info['ident'];
            // return $this->setInfo(405, '您已报名', [
            //     'g' => $register_info['ident']
            // ]);
        }

        $active['jim'] = json_decode($active['jim'], true);
        $form_data = [];
        foreach ($active['jim'] as $j) {
            $value = $data[UnicodeEncode($j['name'])];
            switch($j['type']) {
                case 'mobile': 
                    if(!is($value, 'mobile')) {
                        return $this->setInfo(422, $j['name'].'格式不正确');
                    }
                break;
            }
            $form_data[] = [
                'name' => $j['name'],
                'value' => $value
            ];
        }

        $result = $RegisterModel->register($openid, $active['id'], $active_ident, $form_data, $register_ident);
        if($result === false) {
            return $this->setInfo($RegisterModel->getCode(), $RegisterModel->getMessage());
        }
        return $this->setInfo(0, '报名成功', $RegisterModel->getData());
    }

    public function detail($condition = [])
    {
        $RegisterModel = new RegisterModel;
        $detail = $RegisterModel->findRow($condition);
        if(empty($detail)) {
            return $this->setInfo(407, '暂无数据');
        }
        return $this->setInfo(0, '报名信息', $detail);
    }

    public function save_update($register_ident, $covers)
    {
        $RegisterModel = new RegisterModel;
        
        $result = $RegisterModel->setField('covers',implode(',', $covers), [
            'ident' => $register_ident
        ]);

        if($result === false) {
            return false;
        }

        return [
            'active_ident' => $active_ident,
            'register_ident' => $register_ident
        ];
    }
    
    /**
     * 获取排行榜列表
     */
    public function getRank($active_ident)
    {
        $ActiveModel = new ActiveModel;
        $active = $ActiveModel->detail($active_ident, false);
        if($active === false) {
            return $this->setInfo($ActiveModel->getCode(), $ActiveModel->getMessage(), $ActiveModel->getData());
        }
        
        $RegisterModel=  new RegisterModel;
        $list = $RegisterModel->rankList([
            'active_ident' => $active_ident,
        ], 100);

        if(!empty($list)) {
            foreach($list as &$item) {
                $item['avatar'] = tomedia(explode(',', $item['covers'])[0]);
                unset($item['covers']);
                $jim = json_decode($item['jim'], true);
                unset($item['jim']);
                $item['name'] = '';
                foreach($active['jim'] as $aj) {
                    if($aj['show_active'] == '1') {
                        $item['name'] = $aj['name'];
                        break;
                    }
                }
                if(!empty($item['name'])) {
                    foreach($jim as $j) {
                        if($item['name'] == $j['name']) {
                            $item['name'] = $j['value'];
                            break;
                        }
                    }
                }
                if($item['cav_times'] > 0) {
                    $item['cav_status_name'] = '已核销';
                } else {
                    $item['cav_status_name'] = '未核销';
                }
                unset($item['cav_times']);
            }
        }

        return $this->setInfo(0, '', $list);
    }

    /**
     * 核销动作
     */
    public function tocav($register_ident, $data)
    {
        $data = [
            'cav_openid'      => $data['cav_openid'],
            'cav_nickname'    => $data['cav_nickname'],
            'cav_avatar'      => $data['cav_avatar'],
            'cav_times +='    => 1,
            'cav_gift_total'  => $data['cav_gift_total'],
            'cav_gift_amount' => $data['cav_gift_amount'],
            'cav_gift_score'  => $data['cav_gift_score'],
            'cav_time'        => TIMESTAMP,
        ];
        $RegisterModel = new RegisterModel;
        $RegisterModel->updateRow($data, [
            'ident' => $register_ident
        ]);
        return $this->setInfo($RegisterModel->getCode(), $RegisterModel->geteMessage(), $RegisterModel->getData());
    }

    public function setField($name, $value, $condition)
    {
        $RegisterModel = new RegisterModel;
        $RegisterModel->setField($name, $value, $condition);
        return $this->setInfo($RegisterModel->getCode(), $RegisterModel->getMessage(), $RegisterModel->getData());
    }

}