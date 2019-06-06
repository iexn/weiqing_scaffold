<?php 
namespace wsys\logic;

use wsys\model\OrderModel;

class OrderLogic extends CommonLogic
{
    protected $model_class = 'Order';

    public function getOrder($sn)
    {
        $OrderModel = new OrderModel;
        $order = $OrderModel->getOrder([
            'order_sn' => $sn
        ]);
        if($order === false) {
            return $this->setInfo($OrderModel->getCode(), $OrderModel->getMessage());
        }
        return $order;
    }

}