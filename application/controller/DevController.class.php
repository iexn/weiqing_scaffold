<?php
namespace wsys\controller;

class DevController extends CommonController
{
    public function output_sql() {

        if(!IS_DEV) {
            return $this->setInfo(101, '当前状态已脱离开发模式，操作失败');
        }

        $table = [
            // 'szxh_config',
        ];

        \wsys\Db::compile($table, true);
        \wsys\Db::export($table);

        return $this->setInfo(0, '导出成功！导出时间：'. date('Y-m-d H:i:s'));
    }
}
