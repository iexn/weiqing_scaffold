<?php
namespace wsys;

class Controller
{

    private $code = 0;
    private $message = '';
    private $url = '';
    private $data = [];
    private $cacheData = [];
    protected $bcsList = [];

    public function __construct()
    {

        $this->clearBcs();
        if (is_string($this->bcs)) {
            // TODO: 默认跳转主页
            if (IS_MOBILE) {
                $url = web2app_url('');
            } else {
                $url = aurl('');
            }
            $this->pushBcs($this->bcs, $url);
        }
        $this->setBcs();

        $this->assign('menu', C('menu'));

        $GLOBALS['_W']['account']['jssdkconfig']['debug'] = false;
        $GLOBALS['_W']['account']['jssdkconfig']['jsApiList'] = [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'hideMenuItems',
            'showMenuItems',
            'hideAllNonBaseMenuItem',
            'showAllNonBaseMenuItem',
            'translateVoice',
            'startRecord',
            'stopRecord',
            'onRecordEnd',
            'playVoice',
            'pauseVoice',
            'stopVoice',
            'uploadVoice',
            'downloadVoice',
            'chooseImage',
            'previewImage',
            'uploadImage',
            'downloadImage',
            'getNetworkType',
            'openLocation',
            'getLocation',
            'hideOptionMenu',
            'showOptionMenu',
            'closeWindow',
            'scanQRCode',
            'chooseWXPay',
            'openProductSpecificView',
            'addCard',
            'chooseCard',
            'openCard',
            'updateAppMessageShareData',
            'updateTimelineShareData'
        ];
    }

    protected function pushBcs($title, $url = false)
    {
        if ($url === false) {
            $url = "javascript:;";
        }
        $this->bcsList[] = "<a href='" . $url . "'>" . $title . "</a>";
    }

    protected function setBcs($bcs = [])
    {
        $this->clearBcs();
        if (!is_array($bcs)) {
            foreach ($bcs as $bc) {
                $this->pushBcs($bc['title'], $bc['url']);
            }
        }
    }

    private function clearBcs()
    {
        $this->bcsList = [];
        if (isMobile()) {
            $url = web2app_url('main');
        } else {
            $url = aurl('index');
        }
        $this->pushBcs('首页', $url);
    }

    public function getCode()
    {
        return $this->code;
    }

    public function getMessage()
    {
        return $this->message;
    }

    public function getUrl()
    {
        return $this->url;
    }

    public function getData()
    {
        return $this->data;
    }

    /**
     * code为0时返回true，否则返回false
     */
    protected function setInfo($code = -1, $message = '', $data = [], $url = '')
    {
        $this->clearInfo();
        $this->code    = $code;
        $this->message = $message;
        $this->data    = $data;
        $this->url     = $url;
        return $code === 0;
    }

    private function clearInfo()
    {
        $this->code = 0;
        $this->message = '';
        $this->data = [];
        $this->url = '';
    }

    /**
     * 设置缓存数据
     */
    public function cache($key, $value = null)
    {
        if ($value == null) {
            return $this->cacheData[$key];
        } else {
            $this->cacheData[$key] = $value;
        }
        return $this;
    }

    public function assign($name, $value)
    {
        $data = $this->cache('wsys_data');
        if (empty($data)) {
            $data = [];
        }
        if (is_array($name)) {
            $data = array_merge($data, $name);
        } else {
            $data[$name] = $value;
        }
        $this->cache('wsys_data', $data);
        return $this;
    }

}
