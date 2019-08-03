<?php 
namespace wsys\controller;

use wsys\logic\RegisterLogic;
use wsys\logic\ActiveLogic;
use wsys\logic\GiftLogic;
use wsys\logic\RewardtoLogic;
use wsys\logic\ActiveCavLogic;

class MController extends CommonController
{
    /**
     * 进入主页面，如果成功返回报名人页面数据
     */
    public function detail($w, $get, $post)
    {
        
        if (empty($post['s'])) {
            return $this->setInfo(100, '活动不存在');
        }
        
        $ActiveLogic = new ActiveLogic;

        $active = $ActiveLogic->detail($post['s'], false);
        if($active === false) {
            return $this->setInfo($ActiveLogic->getCode(), $ActiveLogic->getMessage(), $ActiveLogic->getData());
        }
        // 获取礼物列表
        $GiftLogic = new GiftLogic;
        $result = $GiftLogic->getGiftList(array_column($active['gift'], 'gift_id'));
        $active['gift'] = $GiftLogic->getData();

        $RegisterLogic = new RegisterLogic;

        // 获取自己的报名信息
        $result = $RegisterLogic->detail([
            'openid' => $w['openid'],
            'active_ident' => $active['s']
        ]);
        $detail = $RegisterLogic->getData();
        // 跳转到自己活动的url
        $my_url = '';
        if(!empty($detail)) {
            $my_url = web2app_url('p/', ['s'=>$post['s'], 'g'=>$detail['g']]);
        }

        // 获取公众号二维码链接
        $account_qrcode_link = account_qrcode('active_follow');

        // 查询是否为核销员
        $is_caver = false;
        $ActiveCavLogic = new ActiveCavLogic;
        $caver = $ActiveCavLogic->detail([
            'openid' => $w['openid'],
            'active_ident' => $active['s']
        ]);
        if(!empty($caver)) {
            $is_caver = true;
        }

        // 未指定报名人时
        if (empty($post['g'])) {

            // 已报名并且上传了展示图时，直接跳转活动
            if(!empty($detail) && !empty($detail['covers'])) {
                // 没有指定报名人且自己报名过，直接跳转到自己的报名页面
                // 6表示页面上直接跳转到新url
                return $this->setInfo(6, '进入活动', [
                    'url' => $my_url
                ]);
            }
            
            // 没有报名查看活动是否设置了示例展示图
            if(!empty($active['preview_covers'])) {
                return $this->setInfo(241, '示例活动', [
                    'action' => 'preview',
                    'active' => $active,
                    'my_url' => $my_url,
                    'register' => [
                        'covers' => $active['preview_covers']
                    ],
                    'account_qrcode_link' => $account_qrcode_link,
                    'is_caver' => $is_caver
                ]);
            }
            return $this->setInfo(202, '直接报名', [
                'action' => 'register',
                'active' => $active,
            ]);

        } else if($detail['g'] != $post['g']) {
            $gid = $post['g'];
            $result = $RegisterLogic->detail([
                'ident' => $gid
            ]);
            if($result === false) {
                return $this->setInfo(6, '进入活动', [
                    'url' => web2app_url('p/', ['s'=>$post['s']])
                ]);
            }
        }

        $register = $RegisterLogic->getData();

        // 首次查看自己完整的活动，弹出关注公众号窗口
        if($register['openid'] == $w['openid'] && !empty($register['covers']) && $register['is_first_view'] == 'true') {
            $RegisterLogic->setField('is_first_view', 'false', [
                'openid' => $w['openid'],
                'active_ident' => $active['s']
            ]);
        }

        // if($result === false) {
        //     return $this->setInfo(202, '直接报名', [
        //         'action' => 'register',
        //         'active' => $active,
        //     ]);
        // }

        

        if(empty($register['covers'])) {
            if($register['openid'] == $w['openid']) {
                return $this->setInfo(203, '上传展示图片', [
                    'action' => 'upload_cover',
                    'active' => $active,
                    'register' => $register,
                ]);
            } else {
                return $this->setInfo(206, '发起人暂未上传展示图片，赶快提醒他吧');
            }
        }

        // 其他数据处理
        $register['jim_form_text'] = '';
        foreach($active['jim'] as $jim) {
            if($jim['show_active'] == '1') {
                $register['jim_form_text'] = $jim['name'];
                break;
            }
        }
        if(!empty($register['jim_form_text'])) {
            foreach($register['jim'] as $jim) {
                if($register['jim_form_text'] == $jim['name']) {
                    $register['jim_form_text'] = $jim['value'];
                    break;
                }
            }
        }
        
        // 获取赠送人列表
        $RewardtoLogic = new RewardtoLogic;
        $rewardto_users = $RewardtoLogic->getRewardtoUsersList($register['g']);

        // 如果不是查看的自己的活动，不返回全部提交信息
        if($register['openid'] != $w['openid']) {
            unset($register['jim']);
            $register['cav_qrcode_link'] = '';
        } else {
            // 否则增加核销二维码链接
            $register['cav_qrcode_link'] = web2app_url('p/qrcode', [
                'body' => web2app_url('p/cav', [
                    'body' => szxh_encry(['openid'=>$w['openid'], 'g'=>$register['g']], MNAME.'cav')
                ])
            ]);
        }

        $share_url = '';
        $share_config_urls = getConfig('share_url');
        if(!empty($share_config_urls)) {
            $share_urls = explode("\r\n", $share_config_urls);
        }
        
        // 正常返回数据
        return $this->setInfo(0, '进入活动', [
            'active' => $active,
            'register' => $register,
            'my_url' => $my_url,
            'rewardto_users' => $rewardto_users,
            'account_qrcode_link' => $account_qrcode_link,
            'my_qrcode' => web2app_url('p/active_share_qrcode', [
                's' => $active['s'],
                'g' => $register['g'],
                'o' => $w['openid'],
            ]),
            'share' => [
                'title'    => str_replace('%s', $register['jim_form_text'], $active['share_title']),
                'desc'     => str_replace('%s', $register['jim_form_text'], $active['share_desc']),
                'imgUrl'   => tomedia($active['share_imgUrl'] == '%s' ? $register['covers'][0]['path'] : $active['share_imgUrl']),
                'link'     => web2app_url('p/index', [
                    's' => $active['s'],
                    'g' => $register['g']
                ], '', $share_urls[0]),
                'done_url' => web2app_url('m/share', [
                    'u' => $w['openid'],
                    's' => $active['s'],
                    'g' => $register['g']
                ]),
            ],
            'is_caver' => $is_caver
        ]);
    }

    /**
     * 去报名
     */
    public function register($w, $get, $post) 
    {
        if(empty($post['s'])) {
            return $this->setInfo(102, '报名失败，请重新尝试');
        }

        $active_ident = $post['s'];
        unset($post['s']);

        $ActiveLogic = new ActiveLogic;
        $active = $ActiveLogic->detail($active_ident, false);
        if($active === false) {
            return $this->setInfo($ActiveLogic->getCode(), $ActiveLogic->getMessage(), $ActiveLogic->getData());
        }

        $RegisterLogic = new RegisterLogic;
        $result = $RegisterLogic->register($w['openid'], $active_ident, $post);
        if($result === false) {
            return $this->setInfo($RegisterLogic->getCode(), $RegisterLogic->getMessage(), $RegisterLogic->getData());
        }

        // 报名成功后，发送模板消息
        send_template('register_success', $w['openid'], [
            'name' => $active['title'],
        ], web2app_url('p/index', ['s'=>$active_ident]));

        return $this->setInfo(0, '报名成功，请上传展示图片', [
            'g' => $RegisterLogic->getData()
        ]);
    }

    /**
     * 保存展示图
     */
    public function save_update($w, $get, $post)
    {
        if(empty($post['g'])) {
            return $this->setInfo(103, '上传失败，请刷新后尝试');
        }
        if(empty($post['covers'])) {
            return $this->setInfo(104, '请上传图片');
        }

        $RegisterLogic = new RegisterLogic;

        $result = $RegisterLogic->detail([
            'ident' => $post['g']
        ]);
        if($result === false) {
            return $this->setInfo(109, '报名异常，请重新报名');
        }
        $register = $RegisterLogic->getData();

        $result = $RegisterLogic->save_update($post['g'], $post['covers']);
        if($result === false) {
            return $this->setInfo($RegisterLogic->getCode(), $RegisterLogic->getMessage(), $RegisterLogic->getData());
        }

        return $this->setInfo(0, '保存成功', [
            'url' => web2app_url('p/', [
                's' => $register['active_ident'],
                'g' => $register['g']
            ])
        ]);
    }

    /**
     * 送礼下单，回调处理送礼成功逻辑
     */
    public function rewardto($w, $get, $post)
    {
        $RewardtoLogic = new RewardtoLogic;
        $RewardtoLogic->rewardto($w['openid'], $post['g'], $post['gift_id'], $post['num']);
        // 失败返回失败及原因；赠送成功显示已成功；需要支付显示成功和支付参数
        return $this->setInfo($RewardtoLogic->getCode(), $RewardtoLogic->getMessage(), $RewardtoLogic->getData());

    }

    /**
     * 排行榜
     */
    public function getRank($w, $get, $post)
    {
        if(empty($post['s'])) {
            return $this->setInfo(121, '数据异常，请重新进入');
        }
        
        $RegisterLogic = new RegisterLogic;
        $RegisterLogic->getRank($post['s']);

        return $this->setInfo(0, '排行榜', $RegisterLogic->getData());
    }

    /**
     * 活动规则
     */
    public function getRule($w, $get, $post)
    {
        if(empty($post['s'])) {
            return $this->setInfo(123, '数据异常，请重新进入');
        }

        $ActiveLogic = new ActiveLogic;
        $active = $ActiveLogic->detail($post['s'], false);
        if($active === false) {
            return $this->setInfo(124, $ActiveLogic->getMessage());
        }
        return $this->setInfo(0, '活动规则', $active['rule']);
    }
    
    /**
     * 获取分享页面信息
     */
    public function getName($w, $get, $post)
    {
        if(empty($post['s'])) {
            return $this->setInfo(125, '数据异常，请重新进入');
        }
        if(empty($post['g'])) {
            return $this->setInfo(0, '报名信息', [
                'name' => false,
                'share' => false,
                'account_qrcode_link' => account_qrcode('active_follow')
            ]);
        }

        $ActiveLogic = new ActiveLogic;

        $active = $ActiveLogic->detail($post['s'], false);
        if($active === false) {
            return $this->setInfo($ActiveLogic->getCode(), $ActiveLogic->getMessage(), $ActiveLogic->getData());
        }

        $RegisterLogic = new RegisterLogic;
        $result = $RegisterLogic->detail([
            'ident' => $post['g']
        ]);
        if($result === false) {
            return $this->setInfo($RegisterLogic->getCode(), $RegisterLogic->getMessage(), $RegisterLogic->getData());
        }
        $register = $RegisterLogic->getData();

        $register['jim_form_text'] = '';
        foreach($active['jim'] as $jim) {
            if($jim['show_active'] == '1') {
                $register['jim_form_text'] = $jim['name'];
                break;
            }
        }
        if(!empty($register['jim_form_text'])) {
            foreach($register['jim'] as $jim) {
                if($register['jim_form_text'] == $jim['name']) {
                    $register['jim_form_text'] = $jim['value'];
                    break;
                }
            }
        }

        return $this->setInfo(0, '报名信息', [
            'name' => $register['jim_form_text'],
            'share' => [
                'title'    => str_replace('%s', $register['jim_form_text'], $active['share_title']),
                'desc'     => str_replace('%s', $register['jim_form_text'], $active['share_desc']),
                'imgUrl'   => tomedia($active['share_imgUrl'] == '%s' ? $register['covers'][0]['path'] : $active['share_imgUrl']),
                'link'     => web2app_url('p/index', [
                    's' => $active['s'],
                    'g' => $register['g']
                ]),
                'done_url' => web2app_url('m/share', [
                    'u' => $w['openid'],
                    's' => $active['s'],
                    'g' => $register['ident']
                ]),
            ],
        ]);
    }

    /**
     * 获取收到的礼物列表
     */
    public function getRewardto($w, $get, $post)
    {
        $RewardtoLogic = new RewardtoLogic;
        $RewardtoLogic->getRank([
            'active_ident' => $post['s'],
            'register_ident' => $post['g'],
            'sort' => $post['sort']
        ], $post['page'], $post['size']);
        return $this->setInfo(0, '收到的礼物', $RewardtoLogic->getData());
    }

    /**
     * 接收分享成功后处理
     */
    public function share()
    {

    }

}