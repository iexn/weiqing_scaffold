<?php 
namespace wsys\controller;

/**
 * 控制器引导组件
 * 必须定义 protected $logic_class = logic层类名
 */
class CommonConditionController extends CommonController
{
    protected $logic_class = '';
    private   $Logic = null;

    // 页面配置，只打开页面、引用逻辑
    protected $action = [];
    private $action_call = [];

    public function __construct()
    {
        // 自动构建logic类
        if(empty($this->logic_class)) {
            throw new Exception("Boot component configuration error: 'logic_class' is not defined", 1);
        }
        $logic_class = $this->getLogicClass($this->logic_class);
        $this->Logic = new $logic_class;
        
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
            // 判断是模板还是执行方法，有@开头的配置为执行logic方法
            if(strpos($action, '@') !== 0) {
                return $action;
            }
            $action = \substr($action, 1);
            
            $w = $arguments[0];
            $get = $arguments[1];
            $post = $arguments[2];
            $params = $this->callCondition($name, $w, $get, $post);
            if($params === false) {
                return false;
            }
            // 存在 / 时查找其他logic，否则查找自身logic
            if(strpos($action, '/') === false) {
                $objectClass = $this->Logic;
            } else {
                list($logic, $action) = explode('/', $action);
                $logic_name = $this->getLogicClass($logic);
                $objectClass = new $logic_name;
            }

            $result = call_user_func_array([$objectClass, $action], $params);
            if(\is_bool($result)) {
                return $this->setInfo($objectClass->getCode(), $objectClass->getMessage(), $objectClass->getData());
            }
            return $this->setInfo(0, 'success', $result);

        }
        
        throw new \Exception("$name is not defined");
    }

    // 前置操作方法
    protected function callCondition($name, $w, $get, $post) { return []; }
    protected function saveCondition($w, $get, $post) { return []; }
    protected function getListCondition($w, $get, $post) { return []; }
    protected function detailCondtiion($w, $get, $post) { return []; }
    protected function toggleCondition($w, $get, $post) { return $this->setInfo(295, '当前内容未开启切换状态操作'); }
    protected function removeCondition($w, $get, $post) { return $this->setInfo(294, '当前内容未开启删除操作'); }

    /**
     * 保存数据，没有post.ident为新增
     */
    public function save($w, $get, $post)
    {
        $data = $this->saveCondition($w, $get, $post);
        if($data === false) {
            return false;
        }
        if(!is_array($data) || empty($data)) {
            return $this->setInfo(299, '数据格式错误，保存失败');
        }
        
        // ident必须为post传入时才生效，否则一律视为新增
        if(isset($post['ident'])) {
            $data['ident'] = $post['ident'];
        }

        $result = $this->Logic->save($data);
        if($result === false) {
            return $this->setInfo($this->Logic->getCode(), $this->Logic->getMessage());
        }

        return $this->setInfo(0, '保存成功');
    }

    public function getList($w, $get, $post)
    {
        $condition = $this->getListCondition($w, $get, $post);
        if($condition === false) {
            return false;
        }
        if(empty($condition)) {
            $condition = [];
        }
        
        $result = $this->Logic->getList($condition, $get['page'] ?: $post['page'] ?: 1, $get['size'] ?: $post['size'] ?: 10);

        return $this->setInfo(0, '列表', $result);
    }

    /**
     * 单条数据
     */
    public function detail($w, $get, $post)
    {
        $condition = $this->detailCondtiion($w, $get, $post);
        if($condition === false) {
            return false;
        }
        if(!is_array($condition) || empty($condition)) {
            return $this->setInfo(298, '数据格式错误，查询失败');
        }

        $this->Logic->findRow($condition);
        
        return $this->setInfo($this->Logic->getCode(), $this->Logic->getMessage(), $this->Logic->getData());
    }

    /**
     * 切换状态  status
     */
    public function toggle($w, $get, $post)
    {
        $result = $this->toggleCondition($w, $get, $post);
        if($result === false) {
            return false;
        }
        $status = $post['status'];
        if(!\in_array($status, ['on','off'])) {
            return $this->setInfo(297, '状态切换不正确');
        }
        if(empty($post['ident'])) {
            return $this->setInfo(296, '未找到切换状态标识');
        }

        $result = $this->Logic->toggle($post['status'], [
            'ident' => $post['ident']
        ]);
        if($result === false) {
            return $this->setInfo($this->Logic->getCode(), $this->Logic->getMessage());
        }
        return $this->setInfo(0, '操作成功');
    }

    /**
     * 删除
     */
    public function remove($w, $get, $post)
    {
        $condition = $this->removeCondition($w, $get, $post);
        if($condition === false) {
            return false;
        }
        if(!is_array($condition) || empty($condition)) {
            return $this->setInfo(295, '未指定删除条件，删除失败');
        }
        $result = $this->Logic->remove($condition);
        if($result === false) {
            return $this->setInfo($this->Logic->getCode(), $this->Logic->getMessage());
        }
        return $this->setInfo(0, '删除成功');
    }

}