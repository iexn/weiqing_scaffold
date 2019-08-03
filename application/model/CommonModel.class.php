<?php 
namespace wsys\model;
use wsys\Model;

/**
 * 公共模型类，已封装了后台常用部分功能
 */
class CommonModel extends Model {

    private $code = '';
    private $message = '';
    private $data = [];
    private $url = '';
    private $validField = '';
    private $pageHtml = '';
    protected $alias = '';

    public function getCode() {
        return $this->code;
    }
    public function getMessage() {
        return $this->message;
    }

    public function getValidField() {
        return $this->validField;
    }

    public function getData() {
        return $this->data;
    }

    public function getUrl() {
        return $this->url;
    }

    private function clearInfo() {
        $this->code = '';
        $this->message = '';
        $this->data = [];
        $this->url = '';
        $this->validField = '';
    }

    public function setInfo($code = 0, $message = '', $data = [], $url = '', $validField = '') {
        $this->clearInfo();
        $this->code = $code;
        $this->message = $message;
        $this->data = $data;
        $this->url = $url;
        $this->validField = $validField;
        return $code === 0;
    }

    /**
     * 删除项，支持多项删除
     * TODO: 是否存在整体一次性删除的方法
     */
    public function deleteRow($id, $checkUniacid = false) {
        global $_W;
        if(is_string($id)) {
            $ids = get_keys_array($id);
        } else {
            $ids = $id;
        }

        // 开始逐条删除
        pdo_begin();
        foreach ($ids as $id) {
            if($checkUniacid) {
                $where = ['id'=>$id, 'uniacid'=>$_W['uniacid']];
            } else {
                $where = ['id'=>$id];
            }
            $res = pdo_delete($this->tableName, $where);
            if($res === false) {
                pdo_rollback();
                return false;
            }
        }
        pdo_commit();

        return true;

    }

    /**
     * 创建20位数字订单号 - 通用
     */
    public function setsn() {
        return date('Ymd', TIMESTAMP) . \get_microtime(true) . rand(0,9);
    }

    /**
     * 设置分页html
     */
    public function setPageHtml($html) {
        $this->pageHtml = $html;
    }

    /**
     * 获取已设置的分页html
     */
    public function getPageHtml() {
        $html = $this->pageHtml;
        $this->pageHtml = '';
        return $html;
    }

    /**
     * 列表
     */
    protected function getListCondition($condition = []) { return $this; }
    protected function getListTrim($list) { return $list; }
    public function getList($condition = [], $page = 1, $size = 10)
    {
        $tablename = $this->tablename;
        $this->table(getTableName($tablename), $this->alias ?: $tablename);
        $this->getListCondition($condition);
        if($page !== false) {
            $this->page($page, $size);
        }
        $list = $this->uni()->real()->getall();
        if($page !== false) {
            $total = $this->getLastQueryTotal();
            $this->setPageHtml(pagination($total, $page, $size, '', ['isajax'=>true]));
        }
        return $this->getListTrim($list);
    }

    /**
     * 软删除
     */
    protected function beforeRemove($id, $tablename) {}
    protected function afterRemove($result, $id, $tablename) {}
    protected function removeCondition($condition = []) { return false; }
    public function remove($condition = []) {
        $tablename = $this->tablename;
        $this->table(getTableName($tablename), $this->alias ?: $tablename);

        $this->beforeRemove($tablename, $condition);
        if(empty($condition)) {
            return $this->setInfo(0, '删除成功');
        }
        $where = $this->removeCondition($condition);
        if($where === false) {
            return $this->setInfo(0, '未指定条件，删除失败');
        }
        if(!is_array($where)) {
            return $this->setInfo(506, '未指定删除条件，删除失败');
        }
        $this->where($where);
        $this->fill([
            'delete_time' => TIMESTAMP
        ]);
        $res = $this->update();
        $this->afterRemove(!!$res, $tablename, $condition);
        if($res === false) {
            return $this->setInfo(504, '删除失败');
        }
        return $this->setInfo(0, '删除成功');
    }

    /**
     * 改变单条数据的值
     */
    protected function beforeSetField($name, $value) { return true; }
    protected function setFieldCondition($name, $condition = []) { return false; }
    public function setField($name, $value, $condition = [])
    {

        $tablename = $this->tablename;
        $this->table(getTableName($tablename), $this->alias ?: $tablename);

        if(empty($name) || in_array($name, ['id','ident','delete_time','uni_id','uniacid'])) {
            return $this->setInfo(711, '禁止操作的字段，操作失败');
        }

        $valid = $this->beforeSetField($name, $value);
        if($valid === false) {
            return false;
        }
        if(empty($condition)) {
            return $this->setInfo(0, '操作成功');
        }
        $where = $this->setFieldCondition($name, $condition);
        if($where === false) {
            return false;
        }
        if(!is_array($where)) {
            return $this->setInfo(709, '未指定操作条件，操作失败');
        }
        $this->where($where);
        $this->fill([
            $name => $value
        ]);
        $res = $this->update();
        
        if($res === false) {
            return $this->setInfo(710, '操作失败');
        }

        return $this->setInfo(0, '操作成功');
        
    }

    /**
     * 查单条
     */
    protected function findRowCondition($condition = []) { return $this->setInfo(723, '没有查询条件，查询失败'); }
    protected function findRowTrim($data) { return $data; }
    public function findRow($condition = [])
    {
        if(empty($condition)) {
            return [];
        }
        $tablename = $this->tablename;

        $this->table(getTableName($tablename), $this->alias ?: $tablename);
        $result = $this->findRowCondition($condition);
        if ($result === false) {
            return false;
        }
        $row = $this->uni()->real()->find();
        if(empty($row)) {
            return [];
        }
        return $this->findRowTrim($row);
    }
    
    /**
     * 新增
     */
    protected function insertValidate($data) { return $this->setInfo(724, '无数据内容，添加失败'); }
    public function insertRow($data)
    {
        $data = $this->insertValidate($data);
        if($data === false) {
            return false;
        }

        $tablename = $this->tablename;

        $uni_id = $this->getUniId($tablename);
        $data['uni_id'] = $uni_id;
        $data['uniacid'] = $this->getUniacid();
        $data['ident'] = xencode(round(microtime(true) * 1000));
        // dump($data);exit;
        $result = pdo_insert(getTableName($tablename), $data);
        if($result === false) {
            return $this->setInfo(706, '保存失败，请重试');
        }
        return $data['ident'];
    }

    /**
     * 更新
     */
    protected function updateRowCondition($condition) { return $this->setInfo(725, '缺少更新条件，更新失败'); }
    protected function updateValidate($data, $where = []) { return $data; }
    public function updateRow($data, $condition = [])
    {
        if(empty($condition)) {
            return $this->setInfo(707, '更新失败');
        }

        // 验证条件
        $where = $this->updateRowCondition($condition);
        if($where === false) {
            return false;
        }

        // 验证数据
        $data = $this->updateValidate($data, $where);
        if($data === false) {
            return false;
        }

        $tablename = $this->tablename;

        $result = pdo_update(getTableName($tablename), $data, $where);
        if($result === false) {
            return $this->setInfo(708, '保存失败，请重试');
        }
        return $this->setInfo(0, '保存成功');
    }

}