<?php
namespace wsys;

class Wsys extends \WeModuleSite
{

    protected $className;

    // 暂存数据对象
    private $assignData = [];

    protected function _initialize($do = false, $et = false)
    {
        global $_GPC;
        load()->model('site');

        $do = $do ?: $_GPC['do'];
        $et = $et ?: $_GPC['et'];

        define('ADDON_ACTION', $do);
        define('ADDON_ET', $et ?: 'index');

        // 加载框架文件
        $this->loadExtend();

        // 执行核心程序
        $this->run();
    }
    
    private function run()
    {
        global $_W;
        $controller_name = ucfirst(ADDON_ACTION);
        $inc = $controller_name . 'Controller';
        
        $class = "\\wsys\\controller\\" . $inc;
        $controller = new $class;
        
        $action = ADDON_ET;
        if(!method_exists($controller, $action)) {
            throw new \Exception("$inc $action 方法不存在");
            return false;
        }
        $res = $controller->$action($_W, $_GET, $_POST);

        $code = $controller->getCode();
        $message = $controller->getMessage();
        $data = $controller->getData();

        // 请求返回
        if(is_bool($res)) {
            // if($_W['isajax']) {
                $this->result($code, $message, $data);
            // } else {
                // message($message, $data['message_url'] ?: 'referer', $res ? 'success' : 'error');
            // }
        } else if(is_string($res)) {
            $this->assign($controller->cache('wsys_data'));
            if(strpos($res, '/')) {
                $this->display($res);
            } else {
                $this->display(strtolower($controller_name) . '/' . $res);
            }
        }
    }

    /**
     * 生成模板函数
     */
    private function display($w7DispatcherName)
    {
        global $_W, $_GPC;

        foreach ($this->assignData as $key => $value) {
            $$key = $value;
        }
        
        include $this->template($w7DispatcherName);
        return;
    }

    /**
     * 创建模板用变量
     */
    public function assign($field = '', $value = '')
    {
        if(in_array($field, ['name'])) {
            throw new Exception("assign变量名不能为{$field}", 1);
        }
        // 如果第一个参数为数组，意味着多项变量一起传。这是第二个参数没有用
        if (is_array($field)) {
            foreach ($field as $key => $val) {
                $this->assignData[$key] = $val;
            }
        } else {
            $this->assignData[$field] = $value;
        }
    }

    /**
     * 返回接口
     */
    protected function result($errno, $message, $data = '')
    {
        header('Content-Type:application/json;charset=utf-8');
        exit(json_encode(array(
            'errno' => $errno,
            'message' => $message,
            'data' => $data,
        )));
    }

    /**
     * 加载框架必备内容
     */
    protected function loadExtend()
    {
        spl_autoload_register("\\wsys\\Wsys::autoload", true, true);

        include MFRAME . '/common/functions.php';
        include MFRAME . '/library/Guard.class.php';
        include MFRAME . '/library/Controller.class.php';
        include MFRAME . '/library/Model.class.php';

        $common_dir = MROOT . '/application/common';

        // 加载框架内所有自定义function.php，定位在wsys/function文件夹中
        if (is_dir($common_dir)) {

            $files = scandir($common_dir);
            if (!empty($files)) {

                // common.php拥有最高加载权
                $common_function = $common_dir . '/common.php';

                if (file_exists($common_function)) {
                    include $common_function;
                }

                foreach($files as $file) {
                    if ($file == '.' || $file == '..') {
                        continue;
                    }
                    if ($file == 'common.php') {
                        continue;
                    }

                    if (preg_match('/\.php$/is', $file)) {
                        include $common_dir . '/' . $file;
                    }

                }

            }

        }

        // 加载数据库配置项
        C(getConfig());

        // 加载项目配置项
        $conf_dir = MROOT . '/applocation/conf';
        if(is_dir($conf_dir)) {
            $files = scandir($conf_dir);
            if (!empty($files)) {
                $confs = [];
                $common_conf = $conf_dir . '/config.php';
                if(file_exists($common_conf)) {
                    $confs = array_merge($confs, include($common_conf) ?: []);
                }
                foreach($files as $file) {
                    if ($file == '.' || $file == '..') {
                        continue;
                    }
                    if ($file == 'config.php') {
                        continue;
                    }
                    if (preg_match('/\.php$/is', $file)) {
                        $confs = array_merge($confs, include($file) ?: []);
                    }
                }
                C($confs);
            }
        }

    }

    public static function autoload($class)
    {
        $ns = explode('\\', $class, 2);
        if(array_shift($ns) == 'wsys') {
            $class = $ns[0];
            $name = strstr($class, '\\', true);
            if(empty($name)) {
                $path = MROOT . '/wsysphp/library/';
            } else {
                $path = MROOT . '/application/';
            }
            
            $filename       =   $path . str_replace('\\', '/', $class) . '.class.php';
            if(is_file($filename)) {
                // Win环境下面严格区分大小写
                if (strstr(PHP_OS, 'WIN') && false === strpos(str_replace('/', '\\', realpath($filename)), $class . '.class.php')){
                    return ;
                }
                include $filename;
            }
        }
    }

    // IS_DEV = true
    final public function doWebDev() { $this->_initialize(); }

    /**
     * 支付成功处理逻辑
     */
    final public function payResult($ret) 
    {
        $this->loadExtend();
        if ($ret['result'] == 'success') {
            $NoticeLogic = new \wsys\logic\NoticeLogic;
            $result = $NoticeLogic->pay($ret);
            if($result === false) {
                message($NoticeLogic->getMessage());
            }
        }
        parent::payResult($ret);
    }

}
