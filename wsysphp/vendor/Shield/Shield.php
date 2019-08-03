<?php

namespace wsys\shield;

/**
 * 获取实例：Shield::getInstance()
 * 
 * 执行炮灰配置，接收如果页面不正常，执行一个回调函数
 * @method boolean build(callback);
 *   - @var string type 不正常页面类型
 *   - @var array created 已生成待跳转的域名链接配置数组
 *   - @return mixed 
 *          - true       正常打开
 *          - false      显示空白页面
 *          - 数组       打开当前页面，修改其中的参数
 *          - 地址链接   直接跳转链接
 *          - 普通字符串 直接渲染成页面输出
 * - @callback callback($type, $created)
 * 
 * 获取一个炮灰域名链接配置数组，如果$get_share_domain=true，为获取一个分享域名链接配置数组
 * 仅获取，不记录
 * @method array create($get_share_domain = false)
 * 
 * 与上相同，记录到表中
 * @method array recode($get_share_domain = false)
 */
class Shield
{
    // 单例类对象
    private static $_instance;

    // 当前访问ip
    private $ip;

    // 当前访问openid
    private $openid;

    // 当前访问unionid
    private $unionid;

    // 当前访问uniacid
    private $uid;

    // log表前缀
    private $log_table = 'shield_log_';

    // 需要查询绑定关系的log表表名
    public $recode_log_table = '';

    // 需要查询的绑定关系的键
    private $recode_core = '';

    // shield_domain表获取到的一条数据，根据公众号id（uniacid）获取
    private $config = [];

    // 打开的此链接推荐人
    private $referrals_core = '';

    // 打开的此链接风险状态
    private $status = 'normal';

    // 禁止克隆类
    private function __clone()
    { }

    private $forbid = false;

    // 当前链接对应的recode记录
    private $recode = null;

    /**
     * 单例模式，外部调用实例
     * $Shield = Shield::getInstance();
     * 不允许直接实例和克隆类
     */
    public static function getInstance()
    {
        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    private final function __construct()
    {
        // 查询公众号炮灰配置信息
        $this->config = $this->getShieldConf($GLOBALS['_W']['uniacid']);
        if (empty($this->config)) {
            $this->forbid = true;
            return true;
            // exit('公众号炮灰配置失败');
        }

        if (!defined('__HTTP')) {
            define('__HTTP', 'http://');
        }

        $this->ip = $this->getIp();
        $this->openid = $GLOBALS['_W']['fans']['openid'];
        $this->unionid = $GLOBALS['_W']['fans']['unionid'];
        $this->uid = $GLOBALS['_W']['uniacid'];

        // 打开链接的core对应表
        $domain = $_SERVER['HTTP_HOST'];

        if ($domain == $this->config->base_domain) {
            $this->recode_log_table = '';
            $this->recode_core = '';
        } else {
            $core = $domain;
            // 获取全部生效域名
            $all_set_domain = $this->getAllDomainSet(-1);
            foreach($all_set_domain as $set) {
                $core = str_replace('.'.$set, '', $core);
            }

            $this->recode_core = $core;
            
            $hex_date = substr($this->recode_core, 4, -4);
            $date = hexdec($hex_date) . '';
            while (strlen($date) < 4) {
                $date = '0' . $date;
            }
            $this->recode_log_table = $this->log_table . date('Y') . $date;
        }
        
    }

    public function getRecodeLogTableName($core)
    {
        $hex_date = substr($core, 4, -4);
        $date = hexdec($hex_date) . '';
        while (strlen($date) < 4) {
            $date = '0' . $date;
        }
        return $this->log_table . date('Y') . $date;
    }

    /**
     * 获取炮灰配置
     */
    private function getShieldConf($uniacid)
    {
        $domain_config = pdo_get('shield_domain', [
            'uid' => $uniacid,
            'uniacid' => $uniacid
        ]);
        // 修改默认跳转页面域名在这里
        $domain_config['base_domain'] = '';
        if (!empty($domain_config)) {
            return (object) $domain_config;
        }
        return (object)[];
    }

    /**
     * 生成随机域名子键
     */
    private function getCore()
    {
        // 分配随机子域名
        $encry_info = md5(ip2long($this->ip) . $this->config->uniacid . '_' . '_' . $this->openid . '_' . $this->unionid . $_SERVER['REQUEST_TIME']);
        $nd = dechex(date('nd')) . '';
        while(strlen($nd) < 3) {
            $nd = '0' . $nd;
        }
        $core = substr($encry_info, 0, 4) . $nd . substr($encry_info, -4, 4);
        return $core;
    }

    /**
     * 解析随机域名，返回详细信息
     */
    public function deCore($url)
    {
        $parse = parse_url($url);
        $domain = $parse['host'];
        if(empty($domain)) {
            $domain = explode('/', $parse['path'])[0];
        }
        
        if(empty($domain)) {
            return false;
        }
        $core = explode('.', $domain)[0];
        
        if(strlen($core) != 11) {
            return false;
        }
        
        $hex_date = substr($core, 4, -4);
        $date = hexdec($hex_date) . '';
        
        while (strlen($date) < 4) {
            $date = '0' . $date;
        }
        $log_table = $this->log_table . date('Y') . $date;
        
        if(!pdo_tableexists($log_table)) {
            return false;
        }
        $result = pdo_get($log_table, [
            'core' => strtolower($core)
        ]);
        
        if(empty($result)) {
            return false;
        }
        return $result;
    }

    /**
     * 返回一个修改了当前地址域名的链接
     */
    private function setWholeUrl($domain)
    {
        return __HTTP . $domain . $_SERVER['REQUEST_URI'];
    }

    /**
     * 创建一个关联的分享键、域名和链接
     */
    public function create($get_share_domain = false)
    {
        $core = $this->getCore();
        
        // 获取一个可用的域名
        $base_domain = $this->getOneDomain($get_share_domain);
        $uniacid     = $this->getDomainFromUniacid($base_domain);
        
        $domain = $base_domain;
        if($base_domain != $this->config->base_domain) {
            $domain = $core . '.' . $domain;
        }

        $url = $this->setWholeUrl($domain);

        return [
            'core'        => $core,
            'domain'      => $domain,
            'url'         => $url,
            'base_domain' => $base_domain,
            'uniacid'     => $uniacid
        ];
    }

    /**
     * 开始构建防封域名链接
     */
    public function build($callback = null)
    {
        if($this->forbid) {
            return true;
        }
        $recode = $this->getRecode();
        
        return $this->start($recode, $callback);
    }

    /**
     * 获取访问链接绑定关系
     */
    private function getRecode()
    {
        if (empty($this->recode_core)) {
            return [];
        }

        if (!pdo_tableexists($this->recode_log_table)) {
            return [];
        }

        $recode = pdo_get($this->recode_log_table, [
            'core' => $this->recode_core
        ]);
        
        if (empty($recode)) {
            return [];
        }

        // 记录分享人
        if (!empty($recode['referrals_core'])) {
            $recode['referrals_core'] = explode(',', $recode['referrals_core']);
        } else {
            $recode['referrals_core'] = [];
        }
        if ($recode['openid'] != $this->openid) {
            $recode['referrals_core'][] = $recode['core'];
        }
        $recode['referrals_core'] = implode(',', $recode['referrals_core']);

        $this->referrals_core = $recode['referrals_core'];

        // 记录风险状态
        $this->status = $recode['status'];

        $this->recode = $recode;
        return $recode;
    }

    /**
     * 修改访问链接打开次数
     */
    private function validRecode($recode)
    {
        if (empty($this->recode_core)) {
            return [];
        }

        pdo_update($this->recode_log_table, [
            'times +=' => 1
        ], [
            'core' => $this->recode_core
        ]);

        return $recode;
    }

    /**
     * 记录新的访问绑定关系
     */
    public function recode($get_share_domain = false)
    {
        if($this->forbid) {
            return [];
        }

        $table = $this->log_table . date('Ymd');

        if (!pdo_tableexists($table)) {
            pdo_run("CREATE TABLE `ims_" . $table . "` (
                `id` int(11) NOT NULL AUTO_INCREMENT,
                `times` int(10) NOT NULL DEFAULT '0',
                `uniacid` int(10) NOT NULL,
                `domain` varchar(255) NOT NULL,
                `base_domain` varchar(255) NOT NULL,
                `core` varchar(255) NOT NULL,
                `referrals_core` text NOT NULL COMMENT '上级推荐core',
                `url` varchar(255) NOT NULL,
                `ip` varchar(15) NOT NULL,
                `ip_long` int(10) NOT NULL,
                `openid` varchar(32) NOT NULL,
                `unionid` varchar(64) NOT NULL,
                `create_time` int(10) NOT NULL,
                `create_date` varchar(20) NOT NULL,
                `status` enum('normal','warning','danger') NOT NULL DEFAULT 'normal',
                PRIMARY KEY (`id`),
                KEY `core` (`core`)
              ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;");
        }

        $shield = $this->create($get_share_domain);

        $vars = [
            'uniacid'        => $shield['uniacid'],
            'domain'         => $shield['domain'],
            'core'           => $shield['core'],
            'base_domain'    => $shield['base_domain'],
            'ip'             => $this->ip,
            'ip_long'        => ip2long($this->ip),
            'openid'         => $this->openid,
            'unionid'        => $this->unionid,
            'create_time'    => $_SERVER['REQUEST_TIME'],
            'create_date'    => date('Y-m-d H:i', $_SERVER['REQUEST_TIME']),
            'status'         => $this->status ?: 'normal',    // normal warning danger
            'times'          => 0,
            'url'            => $shield['url'],
            'referrals_core' => $this->referrals_core
        ];

        $result = pdo_insert($table, $vars);
        if ($result === false) {
            return false;
        }
        return $vars;
    }

    /**
     * 开始执行具体情况判断
     */
    private function start($recode, $callback = null)
    {
        switch(true) {
            // 黑名单内，显示404
            case $this->in_ip_deny():
                $type = 'deny';
            break;
            // 访问人为黑名单，显示404
            case $this->in_id_deny():
                $type = 'deny';
                $this->status = 'danger';
            break;
            // 分享人是黑名单，将自己也置为黑名单d
            // recode没记录，为非法登入形式，显示404
            case $this->in_id_deny($recode['openid']):
                $type = 'deny';
                $this->deny($this->openid, 'openid', '黑名单用户分享');
                $this->deny($this->unionid, 'unionid', '黑名单用户分享');
                $this->deny($this->ip, 'ip', '黑名单用户分享');
            break;
            case empty($recode):
                $type = 'relink';
            break;
            // 打开链接为黑名单链接，显示404
            case $recode['status'] == 'danger':
                $type = 'deny';
                $this->status = 'danger';
            break;
            // 打开的是分享域名，跳转
            case in_array($recode['base_domain'], $this->getAllDomainSet(true)):
                $type = 'relink';
            break;
            // 打开的是炮灰域名，但是不属于自己，显示404
            case in_array($recode['base_domain'], $this->getAllDomainSet(false, true))
                && (
                    ($recode['openid'] != $this->openid && $this->openid != '') 
                    || ($recode['unionid'] != $this->unionid && $this->unionid != '')
                ):
                $type = 'set_deny';
                $this->sus($this->openid, 'openid', '直接点击链接打开');
                $this->sus($this->unionid, 'unionid', '直接点击链接打开');
                $this->status = 'warning';
            break;
            // 不满足指定地区，显示404
            case false:
                $type = 'place_deny';
            break;
            // 都不满足，正常显示
            default:
                $type = true;
        }

        // 如果打开链接为风险链接，直接将打开人置为风险用户
        if($recode['status'] == 'warning') {
            $this->sus($this->openid, 'openid', '打开风险链接');
            $this->sus($this->unionid, 'unionid', '打开风险链接');
        }
        
        $recode = $this->validRecode($recode);

        // 正常打开页面
        if($type === true) {
            return $recode;
        } else if($type != 'deny') {
            // 获取一组新域名记录
            $recode = $this->recode(false);
            $this->render_url($recode['url']);
            return true;
        }
        
        // 不是正常页面，执行渲染回调404页面
        if (is_callable($callback)) {
            $vars = $callback($type, $recode);

            if($vars === null) {
                $vars = $recode['url'];
            }

            // 如果是true，允许正常访问
            if($vars === true) {
                return $recode;
            }

            // 如果是false，显示空白页面或真正404页面
            if($vars === false) {
                exit;
            }

            // 如果是地址，直接跳转
            if(false !== filter_var($vars, FILTER_VALIDATE_URL)) {
                $this->render_url($vars);
                return false;
            }

            // 如果是数组，改变参数跳转
            if(is_array($vars)) {
                // 返回数组，使用随机域名跳转
                $url_query = parse_url($recode['url'], PHP_URL_QUERY);
                if ($url_query == null) {
                    $url_query = '';
                }
                parse_str($url_query, $params);
                $vars = array_merge($params, $vars);
                $query = http_build_query($vars);
                $url = __HTTP . $recode['domain'] . '?' . $query;
                $this->render_url($url);
                return false;
            }

            // 否则直接输出内容
            echo $vars;
            exit;
            
        } else {
            // 未设置或设置不正确，执行默认404页面
            exit('404');
            // $this->render_url($recode['url']);
            return false;
        }
    }

    /**
     * 执行用户自定义跳转链接
     */
    private function render_url($url)
    {
        header("location: " . $url, true);
        exit;
    }

    /**
     * 是否在ip黑名单内
     */
    public function in_ip_deny($ip = null)
    {
        static $ip_deny_list = [];
        if(empty($ip_deny_list)) {
            $ip_deny_list = pdo_getall('shield_ip_deny', [
                'status' => 'on'
            ]);
        }
        if (!is_array($ip_deny_list)) {
            $ip_deny_list = [];
        }
        return $this->ip_is_deny($ip ?: $this->ip, array_column($ip_deny_list, 'ip'));
    }

    /**
     * 是否在openid、unionid黑名单内
     */
    public function in_id_deny($openid = null, $unionid = null)
    {
        $openid = $openid ?: $this->openid;
        $unionid = $unionid ?: $this->unionid;

        $where = [];

        if(!empty($unionid)) {
            $where['unionid'] = $unionid;
        } else {
            $where['openid'] = $openid;
        }
        $where['status'] = 'on';
        $where['uniacid'] = $this->uid;

        $row = pdo_get('shield_black_list', $where);

        return !empty($row);
    }

    /**
     * 是否在openid、unionid异常列表内
     */
    public function in_id_warning($openid = null, $unionid = null)
    {
        $openid = $openid ?: $this->openid;
        $unionid = $unionid ?: $this->unionid;

        $where = [];

        if(!empty($unionid)) {
            $where['unionid'] = $unionid;
        } else {
            $where['openid'] = $openid;
        }
        $where['status'] = 'on';

        $row = pdo_get('shield_sus_list', $where);

        return !empty($row);
    }



    // 辅助方法

    public function getIp()
    {
        if (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown"))
            $ip = getenv("HTTP_CLIENT_IP");
        else if (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown"))
            $ip = getenv("HTTP_X_FORWARDED_FOR");
        else if (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown"))
            $ip = getenv("REMOTE_ADDR");
        else if (isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], "unknown"))
            $ip = $_SERVER['REMOTE_ADDR'];
        else
            $ip = "unknown";
        return trim($ip, "\t\n\r\0\x0B,");
    }

    private function ip_is_deny($ip, $deny_list = [])
    {
        // 要检测的ip拆分成数组
        $check_ip_arr = explode('.', $ip);
        #限制IP
        if (!in_array($ip, $deny_list)) {
            foreach ($deny_list as $deny) {
                // 发现有*号替代符
                if (strpos($deny, '*') !== false) {
                    $arr = [];
                    $arr = explode('.', $deny);
                    $bl = true; // 用于记录循环检测中是否有匹配成功的
                    for ($i = 0; $i < 4; $i++) {
                        // 不等于* 就要进来检测，如果为*符号替代符就不检查
                        if ($arr[$i] != '*') {
                            if ($arr[$i] != $check_ip_arr[$i]) {
                                $bl = false;
                                break;
                            }
                        }
                    }
                    // 如果是true则找到有一个匹配成功的就返回
                    if ($bl) {
                        return true;
                    }
                }
            }
            return false;
        } else {
            return true;
        }
    }

    /**
     * 获取一个可用的随机域名，默认只获取炮灰域名，get_share_domain=true时只获取分享域名
     */
    private function getOneDomain($get_share_domain = false)
    {
        $domains = $this->getAllDomainSet($get_share_domain);
        if(empty($domains)) {
            return $this->config->base_domain;
        }
        $index = array_rand($domains);
        return $domains[$index];
    }

    /**
     * 获取配置中域名所在的公众号uniacid
     */
    private function getDomainFromUniacid($base_domain)
    {
        static $list = [];
        if(empty($list)) {
            $list = pdo_getall('shield_domain', [
                'status' => 'on',
                'uid' => $this->uid
            ]);
        }
        if(empty($list)) {
            return 0;
        }
        foreach($list as $item) {
            if($item['domain_set1_open'] == 'on') {
                if($base_domain == $item['domain_set1']) {
                    return $item['uniacid'];
                }
            }
            if($item['domain_set2_open'] == 'on') {
                if($base_domain == $item['domain_set2']) {
                    return $item['uniacid'];
                }
            }
            if($item['domain_share_open'] == 'on') {
                if($base_domain == $item['domain_share']) {
                    return $item['uniacid'];
                }
            }
        }
        return 0;
    }

    /**
     * 获取可用炮灰域名数组
     * 
     * get_share_domain
     * 
     * false  获取所有生效炮灰域名
     * true   获取所有生效分享域名
     * 1      获取和当前公众号匹配的已配置分享域名
     * -1     获取所有已配置已生效域名
     */
    private function getAllDomainSet($get_share_domain = false, $empty_get_base_domain = false)
    {
        static $list = [];
        if(empty($list)) {
            $list = pdo_getall('shield_domain', [
                'status' => 'on',
                'uid' => $this->uid
            ]);
        }
        if(empty($list)) {
            return [];
        }
        $domains = [];
        if(empty($domains)) {
            if($get_share_domain === false) {
                foreach($list as $item) {
                    if($item['domain_set1_open'] == 'on') {
                        $domains[] = $item['domain_set1'];
                    }
                    if($item['domain_set2_open'] == 'on') {
                        $domains[] = $item['domain_set2'];
                    }
                }
            } else if($get_share_domain === -1) {
                foreach($list as $item) {
                    if($item['domain_set1_open'] == 'on') {
                        $domains[] = $item['domain_set1'];
                    }
                    if($item['domain_set2_open'] == 'on') {
                        $domains[] = $item['domain_set2'];
                    }
                    if($item['domain_share_open'] == 'on') {
                        $domains[] = $item['domain_share'];
                    }
                }
            } else if($get_share_domain === 1) {
                // 分享域名只能是和打开域名相应的分享域名
                foreach($list as $item) {
                    if($item['uniacid'] == $this->recode['uniacid']) {
                        $domains[] = $item['domain_share'];
                        break;
                    }
                }
            } else {
                // 所有已配置分享域名
                foreach($list as $item) {
                    if($item['domain_share_open'] == 'on') {
                        $domains[] = $item['domain_share'];
                    }
                }
            }
        }
        if($empty_get_base_domain) {
            $domains[] = $this->config->base_domain;
        }
        return $domains;
    }

    /**
     * 拉黑一个内容
     * $var 为内容，不同type对应不同的内容
     * $type 为 ip openid unionid，对应不同的值
     */
    public function deny($var, $type = 'ip', $remarks = '')
    {
        if(empty($var)) {
            return true;
        }
        if($type == 'ip') {
            $row = pdo_get('shield_ip_deny', [
                $type => $var,
                'uniacid'     => $this->uid,
            ]);
            if(!empty($row)) {
                return true;
            }
            $result = pdo_insert('shield_ip_deny', [
                'ip'          => $var,
                'uniacid'     => $this->uid,
                'ip_long'     => ip2long($var),
                'create_time' => $_SERVER['REQUEST_TIME'],
                'create_date' => date('Y-m-d H:i', $_SERVER['REQUEST_TIME']),
                'status'      => 'on',
                'remarks'     => $remarks
            ]);
        } else {
            $row = pdo_get('shield_black_list', [
                $type => $var,
                'uniacid'     => $this->uid,
            ]);
            
            if(!empty($row)) {
                return true;
            }
            $result = pdo_insert('shield_black_list', [
                $type         => $var,
                'uniacid'     => $this->uid,
                'create_time' => $_SERVER['REQUEST_TIME'],
                'create_date' => date('Y-m-d H:i', $_SERVER['REQUEST_TIME']),
                'status'      => 'on',
                'remarks'     => $remarks
            ]);
            // 删除风险列表，转移到黑名单
            pdo_delete('shield_sus_list', [
                $type => $var,
            ]);
        }
        return $result;
    }

    /**
     * 将openid unionid置位风险列表
     */
    public function sus($var, $type = 'openid', $remarks = '')
    {
        if(empty($var)) {
            return true;
        }
        
        $row = pdo_get('shield_sus_list', [
            $type => $var,
            'uniacid'     => $this->uid,
        ]);
        
        if(!empty($row)) {
            return true;
        }

        $result = pdo_insert('shield_sus_list', [
            $type         => $var,
            'uniacid'     => $this->uid,
            'create_time' => $_SERVER['REQUEST_TIME'],
            'create_date' => date('Y-m-d H:i', $_SERVER['REQUEST_TIME']),
            'remarks'     => $remarks
        ]);
        
        return $result;
    }

    /**
     * 将ip加入黑名单
     */
    public function deip($ip)
    {
        if(empty($ip)) {
            return true;
        }
        
        $row = pdo_get('shield_ip_deny', [
            'ip' => $ip,
            'uniacid' => $this->uid
        ]);
        
        if(!empty($row)) {
            return true;
        }

        $result = pdo_insert('shield_ip_deny', [
            'uniacid' => $this->uid,
            'ip'          => $ip,
            'ip_long'     => ip2long($ip),
            'create_time' => $_SERVER['REQUEST_TIME'],
            'create_date' => date('Y-m-d H:i', $_SERVER['REQUEST_TIME']),
            'status'      => 'on'
        ]);
        
        return $result;
    }

    /**
     * ip从黑名单中删除
     */
    public function redeip($ip)
    {
        return pdo_delete('shield_ip_deny', [
            'ip' => $ip,
            'uniacid' => $this->uid
        ]);
    }

    /**
     * 删除黑名单用户，支持同时删除openid或unionid
     */
    public function reDeny($openid, $unionid = null)
    {
        pdo_begin();
        $result = pdo_delete('shield_black_list', [
            'openid' => $openid,
            'uniacid' => $this->uid
        ]);
        if($result === false) {
            pdo_rollback();
            return false;
        }
        if(!empty($unionid)) {
            $result = pdo_delete('shield_black_list', [
                'unionid' => $unionid,
                'uniacid' => $this->uid
            ]);
            if($result === false) {
                pdo_rollback();
                return false;
            }
        }
        pdo_commit();
        return true;
    }
    
    /**
     * 删除黑名单用户，支持同时删除openid或unionid
     */
    public function reSns($openid, $unionid = null)
    {
        pdo_begin();
        $result = pdo_delete('shield_sus_list', [
            'openid' => $openid
        ]);
        if($result === false) {
            pdo_rollback();
            return false;
        }
        if(!empty($unionid)) {
            $result = pdo_delete('shield_sus_list', [
                'unionid' => $unionid,
                'uniacid' => $this->uid
            ]);
            if($result === false) {
                pdo_rollback();
                return false;
            }
        }
        pdo_commit();
        return true;
    }
}
