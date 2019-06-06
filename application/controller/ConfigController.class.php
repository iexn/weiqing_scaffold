<?php 
namespace wsys\controller;

class ConfigController extends CommonController
{

    public function index()
    {
        return 'index';
    }

    public function save($w, $get, $post)
    {
        
        $data = [
            'page_size'           => '',
            'payment_url'         => '',
            'share_url'           => '',
            'active_url'          => '',
            'amap_key'            => '',
            'mch_center_cover'    => '',
            'mch_content'         => '',
            'template_id_order'   => '',
            'template_id_cav'     => '',
            'template_id_audit'   => '',
            'template_id_apply'   => '',
            'template_id_message' => '',
            'support'             => '',
        ];

        $data = array_intersect_key($post, $data);

        setConfig($data);
        return $this->setInfo(0, '保存成功');
    }

}