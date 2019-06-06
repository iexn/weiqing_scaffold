<?php 
namespace wsys;

class Logic {

    private $code      = 0;
    private $message   = '';
    private $url       = '';
    private $data      = [];
    private $cacheData = [];

    public function getCode() {
        return $this->code;
    }

    public function getMessage() {
        return $this->message;
    }

    public function getUrl() {
        return $this->url;
    }

    public function getData() {
        return $this->data;
    }

    /**
     * code为0时返回true，否则返回false
     */
    protected function setInfo($code = 0, $message = '', $data = [], $url = '') {
        $this->clearInfo();
        $this->code    = $code;
        $this->message = $message;
        $this->data    = $data;
        $this->url     = $url;
        return $code === 0;
    }

    private function clearInfo() {
        $this->code    = 0;
        $this->message = '';
        $this->data    = [];
        $this->url     = '';
    }

    /**
     * 设置缓存数据
     */
    public function cache($key, $value = null) {
        if($value == null) {
            return $this->cacheData[$key];
        } else {
            $this->cacheData[$key] = $value;
        }
        return $this;
    }

}