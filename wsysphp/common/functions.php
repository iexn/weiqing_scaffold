<?php 

function C($name=null, $value=null,$default=null) {
    static $_config = array();
    // 无参数时获取所有
    if (empty($name)) {
        return $_config;
    }
    // 优先执行设置获取或赋值
    if (is_string($name)) {
        if (!strpos($name, '.')) {
            $name = strtoupper($name);
            if (is_null($value))
                return isset($_config[$name]) ? $_config[$name] : $default;
            $_config[$name] = $value;
            return null;
        }
        // 二维数组设置和获取支持
        $name = explode('.', $name);
        $name[0]   =  strtoupper($name[0]);
        if (is_null($value))
            return isset($_config[$name[0]][$name[1]]) ? $_config[$name[0]][$name[1]] : $default;
        $_config[$name[0]][$name[1]] = $value;
        return null;
    }
    // 批量设置
    if (is_array($name)){
        $_config = array_merge($_config, array_change_key_case($name,CASE_UPPER));
        return null;
    }
    return null; // 避免非法参数
}

function G($start,$end='',$dec=4) {
    static $_info       =   array();
    static $_mem        =   array();
    if(is_float($end)) { // 记录时间
        $_info[$start]  =   $end;
    }elseif(!empty($end)){ // 统计时间和内存使用
        if(!isset($_info[$end])) $_info[$end]       =  microtime(TRUE);
        if(MEMORY_LIMIT_ON && $dec=='m'){
            if(!isset($_mem[$end])) $_mem[$end]     =  memory_get_usage();
            return number_format(($_mem[$end]-$_mem[$start])/1024);
        }else{
            return number_format(($_info[$end]-$_info[$start]),$dec);
        }

    }else{ // 记录时间和内存使用
        $_info[$start]  =  microtime(TRUE);
        if(MEMORY_LIMIT_ON) $_mem[$start]           =  memory_get_usage();
    }
    return null;
}

/**
 * 获取附加功能类文件，需要自己实例其中的类
 * $class 为调用文件路径，以vendor目录开始，比如：wxpay/Transfers，不需要添加后缀.php
 */
function vendor($class)
{

    static $vendor = [];

    // 连接过的文件直接返回正常实例前的名字
    if (!empty($vendor[$class])) {
        return $vendor[$class];
    }

    $filename = MFRAME . "/vendor/{$class}.php";

    if (!file_exists($filename)) {
        throw new \Exception("{$filename}文件未找到", 1);
    }

    include $filename;

    $classname = 'wsys\\' . str_replace('/', '\\', $class);

    if (!class_exists($classname)) {
        throw new \Exception("{$classname}不存在", 1);
    }

    $vendor[$class] = $classname;

    return $classname;
}

/**
 * 获取指定参数域名的主域名部分
 *
 * @param string $servername 域名
 * @return string 当前域名的主域名
 */
function domain($servername)
{
    $server = array_reverse(explode('.', $servername));
    return $server[1] . '.' . $server[0]; // domain.com
}

/**
 * 获取实际访问的主机名
 *
 * @param boolean $scheme 默认为false。如果为true，在主机名前添加协议
 * @return string 返回当前访问的主机名
 */
function servername($scheme = false)
{
    $hostname = $_SERVER['HTTP_HOST'];
    if ($scheme) {
        $hostname = scheme() . $hostname;
    }
    return $hostname;
}

/**
 * 获取当前访问协议，包含 ://
 */
function scheme()
{
    return $_SERVER['REQUEST_SCHEME'] ? $_SERVER['REQUEST_SCHEME'] . '://' : ($_SERVER['HTTPS'] == 'on' ? 'https://' : 'http://');
}

/**
 * 为当前链接添加锚点 #
 *
 * @param string $url 需要添加锚点的链接，如果链接中包含锚点，此函数将取消当前锚点。
 * @param string $hash 锚点名。不设置将不添加锚点
 * @return string 包含锚点名的URL地址
 */
function ref($url, $hash = '')
{
    if (strpos($url, '#') !== false) {
        $url = explode('#', $url)[0];
    }
    if (!empty($hash)) {
        $hash = '#' . $hash;
    }
    return $url . $hash;
}

/**
 * 增加微信标识锚点名
 *
 * @param string 需要添加微信标识锚点的链接
 * @return string 包含微信锚点的URL地址
 */
function wxref($url)
{
    if (strpos($url, 'wxref=mp.weixin.qq.com') !== false && strpos($url, '#wechat_redirect') === false) {
        $url = ref($url, 'wechat_redirect');
    }
    return $url;
}

/**
 * 当前域名地址，默认为当前访问地址
 * $params必须为数组
 * $use_gets是否使用$_GET参数
 */
function address($params = [], $use_gets = true)
{
    global $_W;
    if ($use_gets) {
        $params = array_merge($_GET, $params);
    }
    return $_W['script_name'] . '?' . http_build_query($params);
}

/**
 * $_GET 所有参数转换为地址栏字符串形式
 */
function get_query($get)
{
    return wxref(http_build_query($get));
}

/**
 * 网站自定义跳转，在当前子模块中跳转
 * aurl(2);                             => et=2
 * aurl(2, 40);                         => et=2&eid=40
 * aurl(2, 'active');                   => et=2&m=wsys_module&do=active
 * aurl(['order_id'=>12]);              => order_id=12
 * aurl(2, ['order_id'=>12]);           => et=2&order_id=12
 * aurl(2, 40, ['order_id'=>12]);       => et=2&eid=40&order_id=12
 * aurl(2, 'active', ['order_id'=>12]); => et=2&m=wsys_module&do=active&order_id=12
 * aurl('active');                      => m=wsys_module&do=active
 * aurl('active', ['order_id'=>12]);    => m=wsys_module&do=active&order_id=12
 * 
 */
function aurl($et = false, $eid = false, $paramsTo = [])
{

    global $_W, $_GPC;

    $query = [];

    if (is_array($eid)) {
        $paramsTo = $eid;
        $eid = false;
    }

    if (!is_array($paramsTo)) {
        $paramsTo = [];
    }


    if (empty($et) && !empty($paramsTo['et'])) {
        $et = $paramsTo['et'];
        unset($paramsTo['et']);
    }

    if (!empty($paramsTo['eid']) || !empty($paramsTo['do'])) {
        $eid = $paramsTo['eid'] ?: $paramsTo['do'];
        unset($paramsTo['eid']);
        unset($query['do']);
    } else if (empty($eid)) {
        if (!empty($_GPC['eid'])) {
            $eid = $_GPC['eid'];
        } else {
            $eid = $_GPC['do'];
        }
    }

    if (is_numeric($eid)) {
        $query['eid'] = $eid;
    } else if (is_string($eid)) {
        $query['m'] = MNAME;
        $query['do'] = $eid;
    }

    if (!empty($et)) {
        $query['et'] = $et;
    }

    $query = array_merge($query, ['version_id' => 0], $paramsTo);

    return url('site/entry', $query);
}

/**
 * 手机自定义跳转，在当前子模块中跳转
 */
function purl($do, $query = [], $noredirect = true)
{
    global $_W;
    unset($query['i']);
    unset($query['c']);
    $query['do'] = $do;
    $query['m'] = $query['m'] ?: strtolower(MNAME);
    return murl('entry', $query, $noredirect);
}

/**
 * 跳转至其他链接
 * 建议配合aurl和purl使用
 */
function tolink($url)
{
    header("location: " . $url, true);
    exit;
}

/**
 * 从微擎后台生成可在app端查看的指定页面
 * $do 跳转app.inc
 * $params 自定义参数
 */
function web2app_url($do, $params = [], $hash = '', $addr = '')
{
    if (strpos($do, '/') !== false) {
        list($do, $et) = explode('/', $do);
    }

    if (isset($et)) {
        $params['et'] = $et;
    }

    $modelurl = purl($do, $params);

    $p = explode('?', $modelurl, 2);

    if (count($p) < 2) {
        array_unshift($p, '');
    }

    $scriptName = str_replace('web', 'app', $_SERVER['SCRIPT_NAME']);

    if (empty($addr)) {
        $url = servername(true) . $scriptName . '?' . $p[1];
    } else {
        $url = $addr . $scriptName . '?' . $p[1];
    }

    return ref($url, $hash);
}

/**
 * 获取多选的名称分组，支持使用 , ; | / 拆分
 * 如： '1,2,3'或'1;2;3' 可变为 ['1','2','3']
 */
function get_keys_array($keys = '')
{
    if (is_array($keys)) {
        return $keys;
    }
    return preg_split('/[,;|\/]+/', trim($keys));
}

/**
 * 驼峰法转小写下划线命名 
 * 如： getName => get_name
 */
function camelToLower($str = '')
{
    return strtolower(preg_replace('/((?<=[a-z])(?=[A-Z]))/', '_', $str));
}

/**
 * 驼峰法转大写下划线命名 
 * 如： getName => GET_NAME
 */
function camelToUpper($str = '')
{
    return strtoupper(preg_replace('/((?<=[a-z])(?=[A-Z]))/', '_', $str));
}

/**
 * 获取时间上下限时间戳数组，参数2为时间戳，默认为当前时间
 * 参数1： 1当天  2本月  3今年
 * timestring 最好传日期格式，传时间戳容易出问题
 */
function is_time($type = 1, $timeString = 0)
{
    if ($timeString === false) {
        return [
            "start" => false,
            "end"   => false
        ];
    }
    if (strtotime($timeString) === false) {
        if (!(is_numeric($timeString) && 0 < $timeString)) {
            $timeString = $_SERVER['REQUEST_TIME'];
        }
    } else {
        $timeString = strtotime($timeString);
    }
    $timeArray = array();
    switch ($type) {
        case 1: //当天日期范围
            $timeArray['start'] = strtotime(date('Y-m-d 00:00:00', $timeString));
            $timeArray['end'] = $timeArray['start'] + 3600 * 24 - 1;
            break;
        case 2: //当月日期范围
            $timeArray['start'] = strtotime(date('Y-m-01 00:00:00', $timeString));
            $timeArray['end'] = $timeArray['start'] + 3600 * 24 * date('t', $timeString) - 1;
            break;
        case 3: //当年日期范围
            $timeArray['start'] = strtotime(date('Y-01-01 00:00:00', $timeString));
            $timeArray['end'] = $timeArray['start'] + (!!date('L', $timeString) ? 366 : 365) * 3600 * 24 - 1;
            break;
    }
    return $timeArray;
}

/**
 * true：获取毫秒表示时间字符串
 * 默认：毫秒时间戳
 * @return string
 */
function get_microtime($boolean = false)
{
    $microtime = $_SERVER['REQUEST_TIME_FLOAT'];
    $microtime = explode('.', $microtime);
    $mic = $microtime[1];
    while (strlen($mic) < 4) {
        $mic = '0' . $mic;
    }
    if ($boolean) {
        $time = date('His', $microtime[0]);
    } else {
        $time = $microtime[0];
    }
    return $time . $mic;
}

/**
 * 正则调用
 *
 * @param string 需要验证的字符串
 * @param string 需要验证的类型，可以选择以下switch项，还可自定义正则表达式，如：/\w+/。左右两边的/可以省略
 * @param array 特殊验证需要传递此参数
 * @return 如果验证成功，返回true，否则返回false
 */
function is($value, $rule, $data = [])
{
    switch ($rule) {
        case 'require':
            // 必须
            $result = !empty($value) || '0' == $value;
            break;
        case 'accepted':
            // 接受
            $result = in_array($value, ['1', 'on', 'yes']);
            break;
        case 'date':
            // 是否是一个有效日期
            $result = false !== strtotime($value);
            break;
        case 'alpha':
            // 只允许字母
            $result = regex($value, '/^[A-Za-z]+$/');
            break;
        case 'alphaNum':
            // 只允许字母和数字
            $result = regex($value, '/^[A-Za-z0-9]+$/');
            break;
        case 'alphaDash':
            // 只允许字母、数字和下划线 破折号
            $result = regex($value, '/^[A-Za-z0-9\-\_]+$/');
            break;
        case 'chs':
            // 只允许汉字
            $result = regex($value, '/^[\x{4e00}-\x{9fa5}]+$/u');
            break;
        case 'chsAlpha':
            // 只允许汉字、字母
            $result = regex($value, '/^[\x{4e00}-\x{9fa5}a-zA-Z]+$/u');
            break;
        case 'chsAlphaNum':
            // 只允许汉字、字母和数字
            $result = regex($value, '/^[\x{4e00}-\x{9fa5}a-zA-Z0-9]+$/u');
            break;
        case 'chsDash':
            // 只允许汉字、字母、数字和下划线_及破折号-
            $result = regex($value, '/^[\x{4e00}-\x{9fa5}a-zA-Z0-9\_\-]+$/u');
            break;
        case 'activeUrl':
            // 是否为有效的网址
            $result = checkdnsrr($value);
            break;
        case 'ip':
            // 是否为IP地址
            $result = filter($value, [FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6]);
            break;
        case 'url':
            // 是否为一个URL地址
            $result = filter($value, FILTER_VALIDATE_URL);
            break;
        case 'float':
            // 是否为float
            $result = filter($value, FILTER_VALIDATE_FLOAT);
            break;
        case 'number':
            $result = is_numeric($value);
            break;
        case 'integer':
            // 是否为整型
            $result = filter($value, FILTER_VALIDATE_INT);
            break;
        case 'email':
            // 是否为邮箱地址
            $result = filter($value, FILTER_VALIDATE_EMAIL);
            break;
        case 'boolean':
            // 是否为布尔值
            $result = in_array($value, [true, false, 0, 1, '0', '1'], true);
            break;
        case 'array':
            // 是否为数组
            $result = is_array($value);
            break;
        case 'file':
            $result = $value instanceof File;
            break;
        case 'image':
            $result = $value instanceof File && in_array(getImageType($value->getRealPath()), [1, 2, 3, 6]);
            break;
        case 'token':
            $result = token($value, '__token__', $data);
            break;
        case 'id':
            // 单个ID
            $result = regex($value, '/^[1-9][0-9]*$/');
            break;
        case 'ids':
            // ID序列
            $result = regex($value, '/^[1-9][0-9]*(,[1-9][0-9]*)*$/');
            break;
        case 'mobile':
            // 手机号
            $result = regex($value, '/^0?(1[0-9][0-9])[0-9]{8}$/');
            break;
        case 'email':
            // 邮箱
            $result = regex($value, '/[\\w!#$%&\'*+/=?^_`{|}~-]+(?:\\.[\\w!#$%&\'*+/=?^_`{|}~-]+)*@(?:[\\w](?:[\\w-]*[\\w])?\\.)+[\\w](?:[\\w-]*[\\w])?/');
            break;
        case 'qq':
            // qq
            $result = regex($value, '/^\d{5,10}$/');
            break;
        case 'password':
            // 登录密码
            $result = regex($value, '/^(?=.*\\d)(?=.*[a-zA-Z]).{6,16}$/');
            break;
        case 'price':
            // 价格数字字符串，可以为负
            $result = regex($value, '/^(\-)?\d+(\.\d{0,2})?$/');
            break;
        default:
            // 正则验证
            $result = regex($value, $rule);
    }
    return $result;
}

/**
 * 创建正则表达式并且开始验证
 *
 * @param string 需要验证的字符串
 * @param string 正则表达式，左右两边的/可以省略
 * @return boolean 如果验证成功，返回true，否则返回false
 */
function regex($name, $rule)
{
    if (0 !== strpos($rule, '/') && !preg_match('/\/[imsU]{0,4}$/', $rule)) {
        // 不是正则表达式则两端补上/
        $rule = '/^' . $rule . '$/';
    }
    return 1 === preg_match($rule, (string)$name);
}


function filter($value, $rule)
{
    if (is_string($rule) && strpos($rule, ',')) {
        list($rule, $param) = explode(',', $rule);
    } elseif (is_array($rule)) {
        $param = isset($rule[1]) ? $rule[1] : null;
        $rule  = $rule[0];
    } else {
        $param = null;
    }
    return false !== filter_var($value, is_int($rule) ? $rule : filter_id($rule), $param);
}

/**
 * 获取用户信息
 * 当$openid为true时获取当前打开页面的用户信息
 */
function userinfo($openid = true)
{
    global $_W;
    if ($openid === true) {
        return $_W['fans']['tag'] ?: false;
    }
    if ($_W['fans']['openid'] == $openid) {
        return $_W['fans']['tag'] ?: false;
    }
    return mc_fansinfo($openid)['tag'] ?: false;
}

/**
 * 返回是否是操作员
 * Tips：微擎后台权限分站长、管理员和操作员(clerk)
 */
function isclerk()
{
    global $_W;

    if ($_W['role'] != 'clerk') {
        return false;
    }

    return true;
}

/**
 * 导出excel表格
 *
 * @param String $fileName 文件名
 * @param String $headname 标题名
 * @param Array $headArr   表头数组
 * @param Array-Array $data 数据二维数组
 * @return void
 */
function getExcel($fileName, $headname, $headArr, $data)
{

    load()->library('phpexcel/PHPExcel');
    load()->library('phpexcel/PHPExcel/Writer/Excel2007');
    load()->library('phpexcel/PHPExcel/Writer/Excel5');
    load()->library('phpexcel/PHPExcel/IOFactory');

    if (empty($data) || !is_array($data)) {
        echo "当前数据不能导出，或不存在数据";
        exit;
    }
    if (empty($fileName)) {
        echo "文件名不能为空";
        exit;
    }

    // 重新定义文件名 
    $date = date("Y_m_d", time());
    $fileName .= "_{$date}.xlsx";

    //创建新的PHPExcel对象 
    $objPHPExcel = new \PHPExcel();
    $objProps = $objPHPExcel->getProperties();

    //设置活动单指数到第一个表,所以Excel打开这是第一个表
    $objPHPExcel->setActiveSheetIndex(0);

    $row = 1;
    if (!empty($headname)) {
        $row++;
    }

    //设置表头
    $key = ord("A");

    $objActSheet = $objPHPExcel->getActiveSheet();

    // 设置第一行标题
    // 设置合并宽度
    $headspan = ord('A');
    $headspan += count($headArr) - 1;
    $headspan = chr($headspan);
    // 合并第一行
    $objActSheet->mergeCells('A1:' . $headspan . '1');
    // 设置第一行文字
    $objActSheet->setCellValue('A1', $headname);
    // 第一行加粗
    $objActSheet->getStyle('A1')->getFont()->setBold(true);
    // 获取第一行对齐方式
    $objAlignA5 = $objActSheet->getStyle('A1')->getAlignment();
    // 第一行文字居中
    $objAlignA5->setHorizontal(\PHPExcel_Style_Alignment::HORIZONTAL_CENTER);

    // 加载表头
    foreach ($headArr as $v) {
        $colum = chr($key);
        // 设置表头值
        $objPHPExcel->setActiveSheetIndex(0)->setCellValue($colum . $row, $v);
        // 设置表头样式 - 设置成文本格式
        $objActSheet->getStyle($colum)->getNumberFormat()->setFormatCode(\PHPExcel_Style_NumberFormat::FORMAT_TEXT);
        // 设置表头样式 - 设置成粗体
        $objActSheet->getStyle($colum . $row)->getFont()->setBold(true);
        $key += 1;
    }

    // 从第二行开始写入数据
    $column = $row + 1;
    // 写入数据
    foreach ($data as $key => $rows) { //行写入
        $span = ord("A");
        foreach ($rows as $keyName => $value) { // 列写入
            $j = chr($span);
            $objActSheet->setCellValue($j . $column, filterExcel($value));
            $span++;
        }
        $column++;
    }

    // 修改文字编码
    $filename = iconv("utf-8", "gb2312", $filename);
    // $sheetname = iconv("utf-8", "gb2312", $sheetname);

    //重命名表
    // $objPHPExcel->getActiveSheet()->setTitle($sheetname);



    //将输出重定向到一个客户端web浏览器(Excel2007)
    ob_clean();
    // header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    // header("Content-Disposition: attachment; filename=\"$fileName\"");
    // header('Cache-Control: max-age=0');
    // $objWriter = new PHPExcel_Writer_Excel5($objPHPExcel);
    header('Pragma:public');
    header('Expires:0');
    header('Cache-Control:must-revalidate,post-check=0,pre-check=0');
    header('Content-Type:application/force-download');
    header('Content-Type:application/vnd.ms-excel');
    header('Content-Type:application/octet-stream');
    header('Content-Type:application/download');
    header("Content-Disposition: attachment; filename=\"$fileName\"");
    header('Content-Transfer-Encoding:binary');
    $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel2007');
    $objWriter->save('php://output'); //文件通过浏览器下载
    exit;
}

/**
 * 处理导出excel特殊字符
 */
function filterExcel($value)
{
    $value = filterEmoji($value);
    $value = str_replace('=', ' ', $value);
    return $value;
}

/**
 * 处理特殊字符
 */
function filterEmoji($emojiStr)
{
    $emojiStr = preg_replace_callback('/./u', function (array $match) {
        return strlen($match[0]) >= 4 ? '' : $match[0];
    }, $emojiStr);
    return $emojiStr;
}

/**
 * 生成为二维码图片
 * @param string $string 二维码图片扫描内容
 */
function output_qrcode($string)
{
    ob_clean();
    load()->library('qrcode');
    echo Qrcode::png($string);
}

/**
 * 获取表名，与 $this->setTableName() 设置结果一致。
 */
function getTableName($name, $addon = false)
{
    if (empty($addon)) {
        $addon = MPREFIX;
    } else {
        $addon .= '_';
    }
    return $addon . camelToLower($name);
}

/**
 * 获取表名，与 $this->setSystemTableName() 设置结果一致
 */
function getSystemTableName($name, $addon = false)
{
    if (empty($addon)) {
        $addon = M_SYSTEM_PREFIX;
    } else {
        $addon .= '_';
    }
    return $addon . camelToLower($name);
}

/**
 * 获取当前公众号配置项
 * name不为true时是获取部分配置项
 * getSystemConfig=true时获取系统配置项
 * name只设置一个值时，返回这个值本身
 */
function getConfig($name = true, $getSystemConfig = false)
{
    global $_W;

    if (!!$getSystemConfig) {
        // 公共配置
        $configSql = "SELECT * FROM " . tablename(getSystemTableName('config')) . " WHERE modulename='" . MNAME . "' LIMIT 1";
        $insertSql = "INSERT INTO " . tablename(getSystemTableName('config')) . " (modulename) VALUES ('" . MNAME . "')";
    } else {
        // 模块配置
        $configSql = "SELECT * FROM " . tablename(getTableName('config')) . " WHERE uniacid=" . $_W['uniacid'] . " LIMIT 1";
        $insertSql = "INSERT INTO " . tablename(getTableName('config')) . " (uniacid) VALUES (" . $_W['uniacid'] . ")";
    }

    $config = pdo_fetch($configSql);

    if (empty($config)) {
        pdo_run($insertSql);
        $config = pdo_fetch($configSql);
    }

    if ($name !== true) {
        $names = get_keys_array($name);
        if (count($names) == 1) {
            return $config[$names[0]];
        }
        $res = [];
        foreach ($names as $name) {
            $res[$name] = $config[$name];
        }
    } else {
        $res = $config;
    }

    return $res;
}

/**
 * 修改配置项
 */
function setConfig($name, $value = '', $setSystemConfig = false)
{
    global $_W;

    $sets = [];
    if (is_array($name)) {
        $sets = array_merge($sets, $name);
    } else {
        $sets[$name] = $value;
    }

    $set = [];
    foreach ($sets as $setKey => $setValue) {
        $setValue = str_replace("\"", "\\\"", $setValue);
        $set[] = $setKey . '="' . $setValue . '"';
    }

    $updateSqlSet = implode(' , ', $set);

    if (empty($updateSqlSet)) {
        return '缺少保存内容';
    }

    if (!!$setSystemConfig) {
        $configSql = "SELECT * FROM " . tablename(getSystemTableName('config')) . " WHERE modulename='" . MNAME . "' LIMIT 1";
        $insertSql = "INSERT INTO " . tablename(getSystemTableName('config')) . " (modulename) VALUES ('" . MNAME . "')";
        $updateSql = "UPDATE " . tablename(getSystemTableName('config')) . " SET %s WHERE modulename='" . MNAME . "'";
    } else {
        $configSql = "SELECT * FROM " . tablename(getTableName('config')) . " WHERE uniacid=" . $_W['uniacid'] . " LIMIT 1";
        $insertSql = "INSERT INTO " . tablename(getTableName('config')) . " (uniacid) VALUES (" . $_W['uniacid'] . ")";
        $updateSql = "UPDATE " . tablename(getTableName('config')) . " SET %s WHERE uniacid=" . $_W['uniacid'];
    }
    $updateSql = sprintf($updateSql, $updateSqlSet);

    $row = pdo_fetch($configSql);
    if (empty($row)) {
        pdo_run($insertSql);
        $row = pdo_fetch($configSql);
    }

    $row = pdo_fetch($updateSql);
    if ($row === false) {
        return '保存失败';
    }

    return true;
}

/**
 * 人性化显示打印信息（针对服务器没有开启xdebug情况）
 */
function dump($value)
{
    echo '<pre>';
    var_dump($value);
    echo '</pre>';
}

/**
 * 在php中创建js的console对象进行打印
 */
function console($message, $type = 'log')
{
    echo "<script>console.{$type}({$message})</script>";
}

function wx_jssdk($debug = false)
{

    global $_W;

    if (defined('HEADER')) {
        echo '';
        return;
    }

    $sysinfo = array(
        'uniacid'   => $_W['uniacid'],
        'acid'      => $_W['acid'],
        'siteroot'  => $_W['siteroot'],
        'siteurl'   => $_W['siteurl'],
        'attachurl' => $_W['attachurl'],
        'cookie'    => array('pre' => $_W['config']['cookie']['pre'])
    );
    if (!empty($_W['acid'])) {
        $sysinfo['acid'] = $_W['acid'];
    }
    if (!empty($_W['openid'])) {
        $sysinfo['openid'] = $_W['openid'];
    }
    if (defined('MODULE_URL')) {
        $sysinfo['MODULE_URL'] = MODULE_URL;
    }
    $sysinfo = json_encode($sysinfo);

    $jssdkconfig = json_encode($_W['account']['jssdkconfig']);

    $script = <<<EOF

<script src="http://res.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
<script type="text/javascript">
    window.sysinfo = window.sysinfo || $sysinfo || {};

    wx.config($jssdkconfig);
</script>
EOF;
    echo $script;
    return true;
}

/**
 * 创建分享js
 * params['et'] 为操作标识，不可设置重复的自定义参数
 */
function js_share($title, $desc, $link, $imgUrl = '', $params = [])
{
    global $_W;
    $version = $_W['jssdk_version'];
    if (empty($version)) {
        $version = 0;
    }

    if (!empty($imgUrl)) {
        $imgUrl = '"' . $imgUrl . '"';
    } else {
        $imgUrl = "$('img')[0].src";
    }

    $params['et'] = 'wx_share';
    $url = purl('notice', $params);

    // 老版jssdk处理
    if ($version < 672) {
        $logic = "data.success=callback;wx.onMenuShareAppMessage(data);wx.onMenuShareTimeline(data);";
    } else {
        $logic = "wx.updateAppMessageShareData(data,callback);wx.updateTimelineShareData(data,callback);";
    }

    $tmp = "wx.ready(function(){var shareData={title:'{$title}',desc:'{$desc}',link:'{$link}',imgUrl:{$imgUrl}};
        function shareCallback(res){if(res.errMsg=='onMenuShareAppMessage:ok'||res.errMsg=='sendAppMessage:ok'||res.errMsg=='onMenuShareTimeline:ok'||res.errMsg=='shareTimelime:ok'){
            $.get('{$url}').then(function() {window.SHARE_TRIGGER && window.SHARE_TRIGGER()});
        }}wxshare(shareData,shareCallback)});function wxshare(data,callback,version){{$logic}}";

    return $tmp;
}

/**
 * 直接生成分享图片（图片下方添加长按识别二维码并生成新图）
 * $src: 原图
 * $qrcodeSrc: 二维码内容，一般为活动地址
 * 注意：
 *   1. 原图必须为jpg,jpeg,png,gif中的其中一个，且图片路径必须为外网可访问地址
 *   2. 必须存在inc/mobile/notice.inc.php文件
 *   3. 必须存在template/resource/images/sharebottom_80_30.png文件
 */
function output_shareImage($src, $qrcodeSrc)
{

    $src_bottom = __PUBLIC__ . "/images/sharebottom_80_30.png";

    if (strpos($src, '.') !== false) {
        $ss = explode('.', $src);
        $suffix = $ss[count($ss) - 1];
    } else {
        $suffix = 'jpg';
    }
    switch ($suffix) {
        case 'jpg':
        case 'jpeg':
            $img = imagecreatefromjpeg($src);
            break;
        case 'png':
            $img = imagecreatefrompng($src);
            break;
        case 'gif':
            $img = imagecreatefromgif($src);
            break;
        default:
            return '图片格式不正确。只支持jpg,jpeg,png,gif格式图片';
    }

    $ix = imagesx($img);
    $iy = imagesy($img);

    $img_bottom = imagecreatefrompng($src_bottom);
    $ibx = imagesx($img_bottom);
    $iby = imagesy($img_bottom);

    $qrcode = imagecreatefrompng($qrcodeSrc);
    $qx = imagesx($qrcode);
    $qy = imagesy($qrcode);

    imagecopyresized($img_bottom, $qrcode, 80, 30, 0, 0, 100, 100, $qx, $qy);

    $newimg = imagecreatetruecolor($ix, $iy + $ix / ($ibx / $iby));

    imagecopyresized($newimg, $img, 0, 0, 0, 0, $ix, $iy, $ix, $iy);
    imagecopyresized($newimg, $img_bottom, 0, $iy + 1, 0, 0, $ix, $ix / ($ibx / $iby), $ibx, $iby);

    switch ($suffix) {
        case 'jpg':
        case 'jpeg':
            header('Content-type: image/jpeg');
            imagejpeg($newimg);
            break;
        case 'png':
            header('Content-type: image/png');
            imagepng($newimg);
            break;
    }

    imagedestroy($newimg);
}

/**
 * 2. 背景图+二维码，可调二维码位置和大小
 * $qrcodeTop 距离顶部的比例，默认值为2
 * $qrcodeWidth 二维码比例，默认值为2.2
 */
function output_shareImage2($src, $qrcodeSrc, $qrcodeTop = 2, $qrcodeWidth = 2.2)
{

    if (strpos($src, '.') !== false) {
        $ss = explode('.', $src);
        $suffix = $ss[count($ss) - 1];
    } else {
        $suffix = 'jpg';
    }
    switch ($suffix) {
        case 'jpg':
        case 'jpeg':
            $img = imagecreatefromjpeg($src);
            break;
        case 'png':
            $img = imagecreatefrompng($src);
            break;
        case 'gif':
            $img = imagecreatefromgif($src);
            break;
        default:
            return '图片格式不正确。只支持jpg,jpeg,png,gif格式图片';
    }

    $ix = imagesx($img);
    $iy = imagesy($img);

    $qrcode = imagecreatefrompng($qrcodeSrc);
    $qx = imagesx($qrcode);
    $qy = imagesy($qrcode);

    imagecopyresized($img, $qrcode, $ix / 2 - ($qx * $qrcodeWidth) / 2, $iy / 2 - ($qy * $qrcodeWidth) / $qrcodeTop, 0, 0, $qx * $qrcodeWidth, $qy * $qrcodeWidth, $qx, $qy);

    switch ($suffix) {
        case 'jpg':
        case 'jpeg':
            header('Content-type: image/jpeg');
            imagejpeg($img);
            break;
        case 'png':
            header('Content-type: image/png');
            imagepng($img);
            break;
    }

    imagedestroy($img);
}

/**
 * 200*200 左下角  边24*24
 *
 * @param [type] $src
 * @param [type] $qrcodeSrc
 * @return void
 */
function output_shareImage3($src, $qrcodeSrc, $ro = 220)
{

    if (strpos($src, '.') !== false) {
        $ss = explode('.', $src);
        $suffix = $ss[count($ss) - 1];
    } else {
        $suffix = 'jpg';
    }
    switch ($suffix) {
        case 'jpg':
        case 'jpeg':
            $img = imagecreatefromjpeg($src);
            break;
        case 'png':
            $img = imagecreatefrompng($src);
            break;
        case 'gif':
            $img = imagecreatefromgif($src);
            break;
        default:
            return '图片格式不正确。只支持jpg,jpeg,png,gif格式图片';
    }

    $ix = imagesx($img);
    $iy = imagesy($img);

    $qrcode = imagecreatefrompng($qrcodeSrc);
    $qx = imagesx($qrcode);
    $qy = imagesy($qrcode);

    imagecopyresized($img, $qrcode, 24, $iy - $ro - 24, 0, 0, $ro, $ro, $qx, $qy);

    switch ($suffix) {
        case 'jpg':
        case 'jpeg':
            header('Content-type: image/jpeg');
            imagejpeg($img);
            break;
        case 'png':
            header('Content-type: image/png');
            imagepng($img);
            break;
    }

    imagedestroy($img);
}

function szxh_authcode($string, $operation = 'DECODE', $key = '', $expiry = 0) {
    $ckey_length = 4;
    $key = md5($key != '' ? $key : $GLOBALS['_W']['config']['setting']['authkey']);
    $keya = md5(substr($key, 0, 16));
    $keyb = md5(substr($key, 16, 16));
    $keyc = $ckey_length ? ($operation == 'DECODE' ? substr($string, 0, $ckey_length) : substr(md5(microtime()), -$ckey_length)) : '';

    $cryptkey = $keya . md5($keya . $keyc);
    $key_length = strlen($cryptkey);

    $string = $operation == 'DECODE' ? base64_decode(substr($string, $ckey_length)) : sprintf('%010d', $expiry ? $expiry + time() : 0) . substr(md5($string . $keyb), 0, 16) . $string;
    $string_length = strlen($string);

    $result = '';
    $box = range(0, 255);

    $rndkey = array();
    for ($i = 0; $i <= 255; $i++) {
        $rndkey[$i] = ord($cryptkey[$i % $key_length]);
    }

    for ($j = $i = 0; $i < 256; $i++) {
        $j = ($j + $box[$i] + $rndkey[$i]) % 256;
        $tmp = $box[$i];
        $box[$i] = $box[$j];
        $box[$j] = $tmp;
    }

    for ($a = $j = $i = 0; $i < $string_length; $i++) {
        $a = ($a + 1) % 256;
        $j = ($j + $box[$a]) % 256;
        $tmp = $box[$a];
        $box[$a] = $box[$j];
        $box[$j] = $tmp;
        $result .= chr(ord($string[$i]) ^ ($box[($box[$a] + $box[$j]) % 256]));
    }

    if ($operation == 'DECODE') {
        if ((substr($result, 0, 10) == 0 || substr($result, 0, 10) - time() > 0) && substr($result, 10, 16) == substr(md5(substr($result, 26) . $keyb), 0, 16)) {
            return substr($result, 26);
        } else {
            return '';
        }
    } else {
        return $keyc . str_replace('=', '', base64_encode($result));
    }

}

/**
 * 为字符串加密
 */
function szxh_encry($str, $key = '') {
    if(is_array($str)) {
        $str = json_encode($str);
    }
    if(empty($key)) {
        echo "function szxh_encry: key was not found.";exit;
    }
    $mapKey = md5($key.'.pinqrcode.inc.php');
    return szxh_authcode($str, 'ENCODE', $mapKey);
}

/**
 * 将加密字符串解密
 */
function szxh_decry($str, $key = '', $json2array = true) {
    if(empty($key)) {
        echo "function szxh_decry: key was not found.";exit;
    }
    $mapKey = md5($key.'.pinqrcode.inc.php');
    $result = szxh_authcode($str, 'DECODE', $mapKey);
    if($json2array && (json_encode(json_decode($result, true)) == $result)) {
        $result = json_decode($result, true);
    }
    return $result;
}

function szxh_fail($message) {
    exit(json_encode([
        'code' => 'FAIL',
        'message' => $message
    ]));
}

function szxh_success() {
    exit(json_encode([
        'code' => 'SUCCESS'
    ]));
}

/**
 * 为字符串加密
 */
function encry($str)
{
    if (is_array($str)) {
        $str = json_encode($str);
    }
    $key = md5('pinqrcode.inc.php');
    return authcode($str, 'ENCODE', $key);
}

/**
 * 将加密字符串解密
 */
function decry($str, $json2array = true)
{
    $key = md5('pinqrcode.inc.php');
    $result = authcode($str, 'DECODE', $key);
    if (json_encode(json_decode($result, true)) == $result && $json2array) {
        $result = json_decode($result, true);
    }
    return $result;
}


/**
 * 优化的require_once
 * @param string $filename 文件地址
 * @return boolean
 */
function require_cache($filename)
{
    static $_importFiles = array();
    if (!isset($_importFiles[$filename])) {
        if (file_exists_case($filename)) {
            require $filename;
            $_importFiles[$filename] = true;
        } else {
            $_importFiles[$filename] = false;
        }
    }
    return $_importFiles[$filename];
}

/**
 * 区分大小写的文件存在判断
 * @param string $filename 文件地址
 * @return boolean
 */
function file_exists_case($filename)
{
    if (is_file($filename)) {
        if (IS_WIN && APP_DEBUG) {
            if (basename(realpath($filename)) != basename($filename))
            return false;
        }
        return true;
    }
    return false;
}

/**
 * 字符串命名风格转换
 * type 0 将Java风格转换为C的风格 1 将C风格转换为Java的风格
 * @param string $name 字符串
 * @param integer $type 转换类型
 * @return string
 */
function parse_name($name, $type = 0)
{
    if ($type) {
        return ucfirst(preg_replace_callback('/_([a-zA-Z])/', function ($match) {
            return strtoupper($match[1]);
        }, $name));
    } else {
        return strtolower(trim(preg_replace("/[A-Z]/", "_\\0", $name), "_"));
    }
}

function xencode($num) {
    vendor('encry/XDecode');
    $xd = new wsys\encry\XDecode();
    return $xd->encode($num);
}
function xdecode($txt) {
    vendor('encry/XDecode');
    $xd = new wsys\encry\XDecode();
    return $xd->decode($txt);
}

function isMobile() {
  // 如果有HTTP_X_WAP_PROFILE则一定是移动设备
  if (isset($_SERVER['HTTP_X_WAP_PROFILE'])) {
    return true;
  }
  // 如果via信息含有wap则一定是移动设备,部分服务商会屏蔽该信息
  if (isset($_SERVER['HTTP_VIA'])) {
    // 找不到为flase,否则为true
    return stristr($_SERVER['HTTP_VIA'], "wap") ? true : false;
  }
  // 脑残法，判断手机发送的客户端标志,兼容性有待提高。其中'MicroMessenger'是电脑微信
  if (isset($_SERVER['HTTP_USER_AGENT'])) {
    $clientkeywords = array('nokia','sony','ericsson','mot','samsung','htc','sgh','lg','sharp','sie-','philips','panasonic','alcatel',
    'lenovo','iphone','ipod','blackberry','meizu','android','netfront','symbian','ucweb','windowsce','palm','operamini','operamobi',
    'openwave','nexusone','cldc','midp','wap','mobile','MicroMessenger');
    // 从HTTP_USER_AGENT中查找手机浏览器的关键字
    if (preg_match("/(" . implode('|', $clientkeywords) . ")/i", strtolower($_SERVER['HTTP_USER_AGENT']))) {
      return true;
    }
  }
  // 协议法，因为有可能不准确，放到最后判断
  if (isset ($_SERVER['HTTP_ACCEPT'])) {
    // 如果只支持wml并且不支持html那一定是移动设备
    // 如果支持wml和html但是wml在html之前则是移动设备
    if ((strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') !== false) && (strpos($_SERVER['HTTP_ACCEPT'], 'text/html') ===
    false || (strpos($_SERVER['HTTP_ACCEPT'], 'vnd.wap.wml') < strpos($_SERVER['HTTP_ACCEPT'], 'text/html')))) {
      return true;
    }
  }
  return false;
}

function isWeixin() {
  if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
    return true;
  } else {
    return false;
  }
}

/**
 * unicode转义编码
 */
function UnicodeEncode($str){
    //split word
    preg_match_all('/./u',$str,$matches);
 
    $unicodeStr = "";
    foreach($matches[0] as $m){
        //拼接
        $unicodeStr .= "\\u".base_convert(bin2hex(iconv('UTF-8',"UCS-4",$m)),16,16);
    }
    return $unicodeStr;
}

/**
 * unicode解码
 */
function unicodeDecode($unicode_str){
    $json = '{"str":"'.$unicode_str.'"}';
    $arr = json_decode($json,true);
    if(empty($arr)) return '';
    return $arr['str'];
}
