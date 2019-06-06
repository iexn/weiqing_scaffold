<?php
namespace wsys;

use wsys\template\Template;

class Module extends \WeModule
{

    protected $className;

    // 暂存数据对象
    private $assignData = [];

    // 其他模板引擎类
    private $T = null;

    /******************       TP风格函数             ***************/

    

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
        
        include MFRAME . '/common/functions.php';
        include MFRAME . '/library/Guard.php';
        include MFRAME . '/library/Controller.php';
        include MFRAME . '/library/Model.php';
        include MFRAME . '/library/Db.php';
        include MFRAME . '/library/Data.php';

        $funcDir = MROOT . '/application/function';

        // 加载框架内所有自定义function.php，定位在wsys/function文件夹中
        if (\is_dir($funcDir)) {

            $files = scandir($funcDir);
            if (!empty($files)) {

                // common.php拥有最高加载权
                $commonFunction = $funcDir . '/common.php';

                if (file_exists($commonFunction)) {
                    include $commonFunction;
                }

                foreach ($files as $file) {
                    if ($file == '.' || $file == '..') {
                        continue;
                    }
                    if ($file == 'common.php') {
                        continue;
                    }

                    if (preg_match('/\.php$/is', $file)) {
                        include $funcDir . '/' . $file;
                    }

                }

            }

        }
    }

}
