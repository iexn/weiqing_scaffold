<?php 
namespace wsys\logic;

class CommonConditionLogic extends CommonLogic
{
    protected $model_class = '';
    private   $Model       = null;
    protected $action      = [];
    private   $action_call = [];

    public function __construct()
    {
        // 自动构建logic类
        if(empty($this->model_class)) {
            throw new Exception("Boot component configuration error: 'model_class' is not defined", 1);
        }
        $model_class = $this->getModelClass($this->model_class);
        $this->Model = new $model_class;

        // 自动构建页面方法
        foreach($this->action as $keys => $template_name) {
            $actions = get_keys_array($keys);
            foreach($actions as $action) {
                $this->action_call[$action] = $template_name;
            }
        }

        parent::__construct();
    }

    public function __call($name, $arguments)
    {
        // 声明执行动作
        $action = $this->action_call[$name];
        if(!empty($action)) {
            // 判断是模板还是执行方法，有@开头的配置为执行model方法
            if(strpos($action, '@') !== 0) {
                return $name;
            }
            $action = \substr($action, 1);

            preg_match('/^([\w-_]+)(\:\:)?$/', $action, $matches);
            if(empty($matches)) {
                throw new Exception("Boot component configuration error: logic mapping defined error", 1);
            }
            $action = $matches[1];
            $map    = $matches[2] ?: ''; // 后置处理类型
            
            // 存在 / 时查找其他model，否则查找自身model
            if(strpos($action, '/') === false) {
                $objectClass = $this->Model;
            } else {
                list($model, $action) = explode('/', $action);
                $model_name = $this->getModelClass($model);
                $objectClass = new $model_name;
            }

            $result = call_user_func_array([$objectClass, $action], $arguments);
            // 返回成功，接受map处理
            switch($map) {
                // 直接输出返回值
                case '::': 
                    if(\is_bool($result)) {
                        return $this->setInfo($objectClass->getCode(), $objectClass->getMessage(), $objectClass->getData());
                    }
                    return $result;
                break;
            }
            if(\is_bool($result)) {
                return $this->setInfo($objectClass->getCode(), $objectClass->getMessage(), $objectClass->getData());
            }
            return $this->setInfo(0, 'success', $result);

        }
        
        throw new \Exception("$name is not defined");
    }

    public function getList($condition = [], $page = 1, $size = 10)
    {
        $list = $this->Model->getList($condition, $page, $size);
        $paginate = $this->Model->getPageHtml();
        return [
            'list' => $list,
            'paginate' => $paginate
        ];
    }

    public function save($data)
    {
        if(!isset($data['ident'])) {
            // 新增
            $result = $this->Model->insertRow($data);
            if($result === false) {
                return $this->setInfo($this->Model->getCode(), $this->Model->getMessage());
            }
            return true;
        } else {
            // 修改
            if(empty($data['ident'])) {
                return $this->setInfo(401, '数据参数错误，请刷新后重试');
            }
            $ident = $data['ident'];
            unset($data['ident']);
            $detail = $this->Model->findRow([
                'ident' => $ident
            ]);
            if(empty($detail)) {
                return $this->setInfo(402, '数据不存在，修改失败');
            }
            $result = $this->Model->updateRow($data, [
                'ident' => $ident
            ]);
            if($result === false) {
                return $this->setInfo($this->Model->getCode(), $this->Model->getMessage());
            }
            return true;
        }
    }

    public function findRow($condition)
    {
        if(empty($condition)) {
            return $this->setInfo(403, '缺少数据ID，查询失败');
        }
        $detail = $this->Model->findRow($condition);
        if(empty($detail)) {
            return $this->setInfo(402, '数据不存在');
        }
        return $this->setInfo(0, 'success', $detail);
    }

    public function remove($condition = [])
    {
        $this->Model->remove($condition);
        return $this->setInfo($this->Model->getCode(), $this->Model->getMessage());
    }

    public function toggle($status, $condition = [])
    {
        $this->Model->setField('status', $status, $condition);
        return $this->setInfo($this->Model->getCode(), $this->Model->getMessage());
    }
}