<?php
namespace wsys;

class Db
{
    private static function initial()
    {
        // 数据表整理优化
        load()->classs('db');
        load()->func('db');
    }

    public static function sql_table($tablename)
    {
        self::initial();
        $db = pdo();
        $sql_property = "SHOW TABLE STATUS LIKE '" . trim($tablename, '`') . "'";
        $sql_columns = "SHOW FULL COLUMNS FROM " . $tablename;
        $sql_indexes = "SHOW INDEX FROM " . $tablename;

        $property = $db->fetch($sql_property);

        if ($property != false) {

            $table = [];
            if (!empty($property) && !empty($property['Create_time'])) {
                $table = [
                    'tablename' => $property['Name'],
                    'charset' => $property['Collation'],
                    'engine' => $property['Engine'],
                    'increment' => $property['Auto_increment'],
                ];
            }

            $columns = $db->fetchall($sql_columns);

            foreach ($columns as $column) {
                $fields = [];
                $type = explode(" ", $column['Type'], 2);
                $fields['name'] = $column['Field'];
                $pieces = explode('(', $type[0], 2);
                $fields['type'] = $pieces[0];
                $fields['length'] = rtrim($pieces[1], ')');
                $fields['null'] = $column['Null'] != 'NO';
                $fields['signed'] = empty($type[1]);
                $fields['increment'] = $column['Extra'] == 'auto_increment';
                if($column['Default'] != null) {
                    $fields['default'] = $column['Default'];
                }
                $table['fields'][$column['Field']] = $fields;
            }

            $indexes = $db->fetchall($sql_indexes);

            foreach ($indexes as $index) {
                $table['indexes'][$index['Key_name']]['name'] = $index['Key_name'];
                $table['indexes'][$index['Key_name']]['type'] = ($index['Key_name'] == 'PRIMARY') ? 'primary' : ($index['Non_unique'] == 0 ? 'unique' : 'index');
                $table['indexes'][$index['Key_name']]['fields'][] = $index['Column_name'];
            }

        }

        return $table;

    }

    public static function sql_trim($tablename, $table)
    {
        self::initial();
        $execs = \db_table_fix_sql(self::sql_table($tablename), $table, false);
        foreach ($execs as &$exec) {
            if (substr(trim($exec), -1) != ';') {
                $exec .= ';';
            }
        }
        return $execs;
    }

    /**
     * 导出表结构为json文件到模块文件夹
     */
    public static function compile($tables, $saveToFile = false)
    {
        $process = [];
        foreach ($tables as $table) {
            $process[] = self::sql_table(tablename($table));
        }
        $combile = json_encode($process);
        if ($saveToFile) {
            file_put_contents(MROOT . '/db.json', $combile);
        }
        return $combile;
    }

    /**
     * 导出数据表为sql文件到模块文件夹
     */
    public static function export($tables)
    {
        $sql = "";

        $process = [];
        foreach ($tables as $table) {
            $T = self::db_table_schemas(tablename($table));
            $T = preg_replace("/DROP TABLE [^\\n]*;\\n/", '', $T);
            $T = str_replace('CREATE TABLE', 'CREATE TABLE IF NOT EXISTS', $T);
            $process[] = $T;
        }
        $sql .= "\n\n" . implode("\n", $process);
        if ($sql != '') {
            file_put_contents(MROOT . '/db.sql', $sql);
        }
        return $sql;
    }

    public static function sync($toExec = true)
    {
        $process = file_get_contents(MROOT . '/db.json');

        $pre = $GLOBALS['_W']['config']['db']['tablepre'];
        if($pre != 'ims_') {
            $process = str_replace('ims_', $pre, $process);
        }

        $process = json_decode($process, true);
        $trim = [];
        foreach ($process as $proc) {
            $trim = array_merge($trim, self::sql_trim($proc['tablename'], $proc));
        }
        $sql = "\n" . implode("\n", $trim);
        if (!empty($trim) && $toExec) {
            pdo_run($sql);
        }
        return $sql;
    }

    /**
     * $bindings = [
     *      [entry,title,do,icon]
     * ]
     */
    public static function syncBindings($module, $bindings = [])
    {
        if (!\is_array($bindings)) {
            $bindings = [];
        }

        // 排序，逐次减1
        $displayorder = count($bindings);

        if($displayorder > 0) {
            // 删除无用项
            pdo_delete('modules_bindings', [
                'module' => $module
            ]);
        }

        foreach ($bindings as $binding) {

            $entry = $binding[0];
            $title = $binding[1];
            $do = $binding[2];
            $icon = $bidning[3] ?: '';

            $where = [];
            $where['module'] = $module;
            $where['entry'] = $entry;
            $where['do'] = $do;

            $data = [];
            $data['title'] = $title;
            $data['icon'] = $icon;
            $data['displayorder'] = $displayorder;

            $row = pdo_get('modules_bindings', $where);
            if (!empty($row)) {
                pdo_update('modules_bindings', $data, $where);
            } else {
                $data = array_merge($data, $where);
                pdo_insert('modules_bindings', $data);
            }

            $dos[] = "'" . $do . "'";
            $displayorder -= 1;
        }

    }

    private static function db_table_schemas($table) {
        $dump = "DROP TABLE IF EXISTS {$table};\n";
        $sql = "SHOW CREATE TABLE {$table}";
        $row = pdo_fetch($sql);
        $dump .= $row['Create Table'];
        $dump .= ";\n\n";
        return $dump;
    }

}
