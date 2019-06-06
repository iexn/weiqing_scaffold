<?php 
namespace wsys;
load()->classs('query');
class Model extends \Query {

    private $code         = '';
    private $message      = '';
    private $data         = [];
    private $url          = '';
    private $validField   = '';
    protected $valid_rule = [];
    protected $valid_msg  = [];
    private $cacheData    = [];

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
        $this->code       = '';
        $this->message    = '';
        $this->data       = [];
        $this->url        = '';
        $this->validField = '';
    }

    public function setInfo($code = 0, $message = '', $data = [], $url = '', $validField = '') {
        $this->clearInfo();
        $this->code       = $code;
        $this->message    = $message;
        $this->data       = $data;
        $this->url        = $url;
        $this->validField = $validField;
        return $code === 0;
    }

    protected function setValidateRule($rule) {
        $this->valid_rule = $rule;
        return $this;
    }

    protected function setValidateMsg($msg) {
        $this->valid_msg = $msg;
        return $this;
    }

    protected function validate($data) {
        if(!$this->valid_rule) {
            return error(0);
        }
        $validator = \Validator::create($data, $this->valid_rule, $this->valid_msg);
        $result = $validator->valid();
        return $result;
    }

    /**
     * 设置缓存数据
     */
    public function storage($key, $value = null) {
        if($value == null) {
            return $this->cacheData[$key];
        } else {
            $this->cacheData[$key] = $value;
        }
        return $this;
    }

    /**
     * 获取真实数据
     */
    public function real($keys = []) {
        if(!is_array($keys)) {
            $keys = get_keys_array($keys);
        }
        if(empty($keys)) {
            $this->where('isnull(delete_time)', true);
        } else {
            foreach($keys as $key) {
                $this->where('isnull('.$key.'.delete_time)', true);
            }
        }
        return $this;
    }

    /**
     * 按照公众号获取数据
     */
    public function uni($keys = []) {
        global $_W;
        if(UNI_BRIDLE) {
            if(!is_array($keys)) {
                $keys = get_keys_array($keys);
            }
            if(empty($keys)) {
                $this->where('uniacid', $_W['uniacid']);
            } else {
                foreach($keys as $key) {
                    $this->where($key.'.uniacid', $_W['uniacid']);
                }
            }
        }
        return $this;
    }

    public function uniId($key = false) {
        global $_W;
        
        if(UNI_BRIDLE) {
            $uniId = 'uni_id';
            $id = '';
        } else {
            $uniId = 'id';
            $id = 'id';
        }

        if(!empty($key)) {
            $uniId = $key . '.' . $uniId;
            if(!empty($id)) {
                $id = $key . '.' . $id;
            }
        }
        
        $this->field([$uniId, 'id` AS `uni_id']);

        return $this;
    }

    /**
     * 获取即将填入的新数据uni_id
     */
    public function getUniId($table) {
        global $_W;
        $row = $this->table(\getTableName($table))->field('uni_id')->where('uniacid', $_W['uniacid'])->orderby('uni_id', 'DESC')->find();
        if(empty($row)) {
            return 1;
        } else {
            return $row['uni_id'] + 1;
        }
    }

    public function setUni() {
        global $_W;
        $this->fill('uniacid', $_W['uniacid']);
        return $this;
    }
    
    public function getUniacid() {
        global $_W;
        return $_W['uniacid'];
    }

    // 兼容tp查询格式

    public function table($tablename, $alias = '') {
        return $this->from($tablename, $alias);
    }

    public function find() {
        return $this->get();
    }

    public function _sql() {
        return $this->getLastQuery();
    }

    public function field($field) {
        return $this->select($field);
    }

    public function order($sort, $value = 'DESC')
    {
        $order = [];
        if(is_array($sort)) {
            foreach($sort as $k => $v) {
                $order[$k] = $v;
            }
        } else if(is_string($sort)) {
            $order[$sort] = $value;
        }
        foreach($order as $k => $v) {
            $this->orderby($k, $v);
        }
        return $this;
    }

}