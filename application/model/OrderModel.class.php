<?php 
namespace wsys\model;

class OrderModel extends CommonModel
{
    protected $tablename = 'order';
    protected $alias     = 'o';

    public function createOrder($openid, $type, $type_ident, $amount, $title, $params = [])
    {
        if(!in_array($type, ['rewardto'])) {
            return $this->setInfo(721, '订单类型错误，创建失败');
        }
        $data = [
            'title'       => $title,
            'order_sn'    => $this->setsn(),
            'openid'      => $openid,
            'type'        => $type,
            'type_ident'  => $type_ident,
            'amount'      => $amount,
            'create_time' => TIMESTAMP,
            'params'      => json_encode($params),
        ];
        
        $result = $this->insertRow($data);
        if($result === false) {
            return $this->setInfo(722, '订单创建失败，请重试');
        }

        return $data;
    }

    protected function insertValidate($data)
    {
        return $data;
    }

    public function getOrder($order_sn)
    {
        $this->table(getTableName($this->tablename))
        ->where([
            'order_sn' => $order_sn
        ])
        ->select(['order_sn','openid','type','title','type_ident','amount','status','create_time','done_time','params'])
        ->uni()->real();
        
        $order = $this->find();
        if(empty($order)) {
            return $this->setInfo(741, '订单不存在');
        }

        $order['params'] = json_decode($order['params'], true);

        return $order;
    }

    // 完成订单
    public function complete($order_sn, $w7_tid, $transaction_id)
    {
        return $this->updateRow([
            'done_time' => TIMESTAMP,
            'status' => 'success',
            'w7_tid' => $w7_tid,
            'transaction_id' => $transaction_id
        ], [
            'order_sn' => $order_sn
        ]);
    }

    protected function updateRowCondition($condition)
    {
        return $condition;
    }

}