<?php 
namespace wsys\controller;
/**
 * 开放接口：
 * getList
 * rewardtoLog
 * rewardto
 */
class RegisterController extends CommonConditionController
{
    protected $logic_class = 'Register';
    protected $action = [
        'index' => 'index',
        'rewardtolog' => '@RewardtoLog/getList',
        'rewardto' => '@Rewardto/getList'
    ];

    protected function getListCondition($w, $get, $post)
    {
        return [
            'title' => $get['title'] ?: $post['title'],
            'active_ident' => $get['s'] ?: $post['s']
        ];
    }

    protected function callCondition($name, $w, $get, $post)
    {
        switch($name) {
            case 'rewardtolog':
                $params = [
                    [
                        'register_ident' => $post['register_ident']
                    ]
                ];
            break;
            case 'rewardto':
                $params = [
                    [
                        'register_ident' => $post['register_ident'],
                        'sort' => 'rank'
                    ]
                ];
            break;
        }

        return $params;
    }

    public function export_excel($w, $get, $post)
    {
        $get['page'] = false;
        $get['size'] = false;
        $result = $this->getList($w, $get, $post);
        if($result === false) {
            return false;
        }
        
        $list = $this->getData()['list'];
        if(empty($list)) {
            echo '暂无数据';exit;
        }

        $headArr = ['活动名称','报名编号','报名人昵称','获赞数','价值','报名时间'];
        $first_jim = $list[0]['jim'];
        foreach($first_jim as $jim) {
            $headArr[] = $jim['name'];
        }

        $data = [];
        foreach($list as $item) {
            $es = [
                $item['title'],
                $item['ident'],
                $item['nickname'],
                $item['gift_score'],
                $item['gift_amount'],
                $item['create_time']
            ];
            foreach($item['jim'] as $jim) {
                $es[] = $jim['value'];
            }
            $data[] = $es;
        }
        
        getExcel('报名数据', '报名数据', $headArr, $data);
    }

}