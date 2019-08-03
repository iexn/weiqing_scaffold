<?php 
namespace wsys\logic;
use wsys\model\GiftModel;

class GiftLogic extends CommonConditionLogic
{
    protected $model_class = 'Gift';

    public function giftList()
    {
        $GiftModel = new GiftModel;
        $list = $GiftModel->getList([
            'status' => 'on'
        ]);
        return $this->setInfo(0, '全部礼物列表', $list);
    }

    public function getGiftList($gift_ident_list)
    {
        $GiftModel = new GiftModel;
        $list = $GiftModel->getGiftList($gift_ident_list);
        foreach($list as &$item) {
            $item['cover'] = tomedia($item['cover']);
        }
        return $this->setInfo(0, '礼物列表', $list);
    }

    /**
     * 初始化默认礼物列表，默认图片必须为png格式
     */
    public function initGiftList($uniacid)
    {
        $GiftModel = new GiftModel;
        $list = $GiftModel->getList([], false, false);
        $names = array_column($list, 'name');
        // 加载默认礼物列表
        $default_gift = C('DEFAULT_GIFT');
        
        if(!empty($default_gift)) {
            foreach($default_gift as $gift) {
                if(\in_array($gift['name'], $names)) {
                    continue;
                }
                // 上传图片到本地
                $gift['cover'] = upload_from_link($gift['cover']);
                $GiftModel->insertRow($gift);
            }
        }
        return $this->setInfo(0, '初始化礼物加载完成');
    }
}