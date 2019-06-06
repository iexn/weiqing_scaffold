<?php
namespace wsys\logic;
use wsys\Controller;

class CommonLogic extends Controller
{
    private $model = '';

    public function __construct()
    {
        if(empty($this->model_class)) {
            throw new \Exception('no logic protected valriable: model_class is empty.', 1);
        }
        $this->model = 'wsys\\model\\' . $this->model_class . 'Model';
    }

    public function getList($condition = [], $page = 1, $size = 10)
    {
        $model = new $this->model;
        $list = $model->getList($condition, $page, $size);
        $paginate = $model->getPageHtml();
        return [
            'list' => $list,
            'paginate' => $paginate
        ];
    }

    public function save($data)
    {
        $GiftModel = new $this->model;

        if(!isset($data['ident'])) {
            // 新增
            $result = $GiftModel->insertRow($data);
            if($result === false) {
                return $this->setInfo($GiftModel->getCode(), $GiftModel->getMessage());
            }
            return true;
        } else {
            // 修改
            if(empty($data['ident'])) {
                return $this->setInfo(401, '数据参数错误，请刷新后重试');
            }
            $ident = $data['ident'];
            unset($data['ident']);
            $detail = $GiftModel->findRow([
                'ident' => $ident
            ]);
            if(empty($detail)) {
                return $this->setInfo(402, '数据不存在，修改失败');
            }
            $result = $GiftModel->updateRow($data, [
                'ident' => $ident
            ]);
            if($result === false) {
                return $this->setInfo($GiftModel->getCode(), $GiftModel->getMessage());
            }
            return true;
        }
    }

    public function findRow($ident)
    {
        $GiftModel = new $this->model;
        if(empty($ident)) {
            return $this->setInfo(403, '缺少数据ID，查询失败');
        }
        $detail = $GiftModel->findRow([
            'ident' => $ident
        ]);
        if(empty($detail)) {
            return $this->setInfo(402, '数据不存在');
        }
        return $this->setInfo(0, 'success', $detail);
    }

    public function remove($condition = [])
    {
        $GiftModel = new $this->model;
        $GiftModel->remove($condition);
        return $this->setInfo($GiftModel->getCode(), $GiftModel->getMessage());
    }

    public function toggle($status, $condition = [])
    {
        $GiftModel = new $this->model;
        $GiftModel->setField('status', $status, $condition);
        return $this->setInfo($GiftModel->getCode(), $GiftModel->getMessage());
    }

}
