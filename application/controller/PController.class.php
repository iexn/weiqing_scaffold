<?php 
namespace wsys\controller;

use wsys\Guard;
use wsys\logic\RegisterLogic;
use wsys\logic\ActiveLogic;
use wsys\logic\ActiveCavLogic;

Guard::wechat();
Guard::shield(true);
checkauth();

class PController extends CommonController
{

    public function index() { return 'main/index'; }
    public function rank() { return 'main/rank'; }
    public function qrcode($w, $get) {
        output_qrcode($get['body']);
        exit;
    }
    public function cav($w, $get, $post)
    {
        // 核销
        if ($w['ispost']) {
            if(empty($post['g'])) {
                return $this->setInfo(108, '不存在报名信息，核销失败');
            }
            $register_ident = $post['g'];
        } else {
            // 解码
            $cav = szxh_decry($get['body'], MNAME.'cav');
            if(!isset($cav['openid']) || !isset($cav['g'])) {
                wechat_warning_page('核销二维码识别失败','核销操作中心');
                exit;
            }
            $register_ident = $cav['g'];
        }


        // 查找报名数据
        $RegisterLogic = new RegisterLogic;
        $result = $RegisterLogic->detail([
            'ident' => $register_ident
        ]);
        if($result === false) {
            if ($w['ispost']) {
                return $this->setInfo(109, '报名数据不存在');
            } else {
                wechat_warning_page('报名数据不存在','核销操作中心');
                exit;
            }
        }
        $register = $RegisterLogic->getData();

        // 查找活动数据
        $ActiveLogic = new ActiveLogic;
        $active = $ActiveLogic->detail([
            'ident' => $register['active_ident']
        ], false);
        if(empty($active)) {
            if ($w['ispost']) {
                return $this->setInfo(110, '活动数据不存在');
            } else {
                wechat_warning_page('活动数据不存在','核销操作中心');
                exit;
            }
        }

        // 查找核销员数据
        $ActiveCavLogic = new ActiveCavLogic;
        $caver = $ActiveCavLogic->detail([
            'active_ident' => $register['active_ident'],
            'openid' => $w['openid']
        ]);
        if(empty($caver)) {
            if ($w['ispost']) {
                return $this->setInfo(111, '无权核销');
            } else {
                wechat_warning_page('无权核销','核销操作中心');
                exit;
            }
        }

        // 开始核销
        if($w['ispost']) {
            $cav_user = userinfo($w['openid']);
            $result = $RegisterLogic->tocav($register_ident, [
                'cav_openid'      => $cav_user['openid'],
                'cav_nickname'    => $cav_user['nickname'],
                'cav_avatar'      => $cav_user['avatar'],
                'cav_gift_total'  => $register['gift_total'],
                'cav_gift_amount' => $register['gift_amount'],
                'cav_gift_score'  => $register['gift_score'],
            ]);
            if($result === false) {
                return $this->setInfo($RegisterLogic->getCode(), $RegisterLogic->getMessage(), $RegisterLogic->getData());
            }

            // 核销成功后，发送模板消息
            send_template('cav_success', $register['openid'], [
                'first' => '核销成功',
                'keyword1' => $active['title'],
                'keyword2' => date('Y-m-d H:i'),
                'keyword3' => '',
            ], web2app_url('p/index', ['s'=>$register['active_ident']]));

            return $this->setInfo(0, '核销成功');
        }

        // 否则显示核销界面
        $user_active_index = web2app_url('p/index', ['s'=>$register['active_ident'],'g'=>$cav['g']]);

        $html = '<head><title></title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">
            <link rel="stylesheet" type="text/css" href="'.__PUBLIC__.'/lib/weui/weui.min.css">
            <script src="'.__PUBLIC__.'/lib/jquery/2.2.4/jquery.min.js"></script>
            <script src="'.__PUBLIC__.'/lib/weui/weui.min.js"></script>
            <script>
                function tocav() {
                    weui.confirm("确定核销？", function () {
                        var loading = weui.loading("加载中");
                        $.post("", {
                            g: "'.$cav['g'].'",
                        }).then(function (res) {
                            loading.hide(function () {
                                weui.alert(res.message, function() {
                                    if(res.errno == 0) {
                                        location.reload();
                                    }
                                });
                            });
                        });
                    });
                }
            </script>
            </head>
            <body ontouchstart=""><div class="weui-msg">
            <div class="weui-msg__icon-area"><i class="weui-icon-info-circle weui-icon_msg"></i></div>
            <div class="weui-msg__text-area">
                <h2 class="weui-msg__title">确认用户核销信息</h2>
            </div>
            <div class="weui-form-preview">
                <div class="weui-form-preview__bd">
                    <p>
                        <label class="weui-form-preview__label">活动名称</label>
                        <span class="weui-form-preview__value"><a href="'.$user_active_index.'">'. $active['title'] .'</a></span>
                    </p>
                    <p>
                        <label class="weui-form-preview__label">用户信息</label>
                        <span class="weui-form-preview__value"><img src="'.$register['avatar'].'" style="width:20px;vertical-align:middle"/>&ensp;'. $register['nickname'] .'</span>
                    </p>
                    <p>
                        <label class="weui-form-preview__label">获赞数</label>
                        <span class="weui-form-preview__value">'. $register['gift_score'] .'</span>
                    </p>
                    <p>
                        <label class="weui-form-preview__label">礼物数</label>
                        <span class="weui-form-preview__value">'. $register['gift_total'] .'个</span>
                    </p>
                    <p>
                        <label class="weui-form-preview__label">获得价值</label>
                        <span class="weui-form-preview__value">'. $register['gift_amount'] .'元</span>
                    </p>
                    ';
                    foreach ($register['jim'] as $jim) {
                        $html .= '
                        <p>
                            <label class="weui-form-preview__label">'. $jim['name'] .'</label>
                            <span class="weui-form-preview__value">'. $jim['value'] .'</span>
                        </p>
                        ';
                    }
                    $html .= '<p>
                        <label class="weui-form-preview__label">报名时间</label>
                        <span class="weui-form-preview__value">'. $register['create_time'] .'</span>
                    </p>
                    <p>
                        <label class="weui-form-preview__label">核销时价值：</label>
                        <span class="weui-form-preview__value">'. ($register['cav_times'] > 0 ? ($register['cav_gift_amount'].'元') : '暂未核销') .'</span>
                    </p>
                </div>
            </div>
            ';
        // 查找报名是否核销
        if($register['cav_times'] > 0) {
            $html .= '<div class="weui-msg__opr-area">
                    <p class="weui-btn-area">
                        <a href="javascript:;" class="weui-btn weui-btn_plain-default weui-btn_plain-disabled">已完成核销</a>
                    </p>
                </div>
            </div></body>';
        } else {
            $html .= '<div class="weui-msg__opr-area">
                    <p class="weui-btn-area">
                        <a href="javascript:;" class="weui-btn weui-btn_primary" onclick="tocav()">完成本次核销</a>
                    </p>
                </div>
            </div></body>';
        }

        // 显示核销信息

        echo $html;exit;
    }

    public function export_register($w, $get)
    {
        $openid = $w['openid'];
        $active_ident = $get['s'];
        if(empty($openid) || empty($active_ident)) {
            return wechat_warning_page('未选择活动，导出失败', '导出报名数据');
        }

        // 检查活动是否存在
        $ActiveLogic = new ActiveLogic;

        $active = $ActiveLogic->detail($active_ident, false);
        if($active === false) {
            return wechat_warning_page($ActiveLogic->getMessage() || '活动不存在，导出失败', '导出报名数据');
        }

        // 检查是否为核销员
        $ActiveCavLogic = new ActiveCavLogic;
        $caver = $ActiveCavLogic->detail([
            'openid' => $openid
        ]);
        if(empty($caver)) {
            return wechat_warning_page('没有导出权限', '导出报名数据');
        }

        // 生成导出键，跳转导出
        $key = szxh_encry([
            'outtime' => TIMESTAMP + 600, // 十分钟内有效
            'active' => [
                's' => $active['s'],
                'jim' => $active['jim']
            ],
        ], MNAME . '_export_register');

        header('Location: ' . \web2app_url('n/export_register', [
            'key' => $key,
            
        ]));
    }

    /**
     * 活动分享二维码生成
     */
    public function active_share_qrcode($w, $get)
    {
        $get['body'] = web2app_url('p/index', [
            's' => $get['s'],
            'g' => $get['g'],
            'o' => $get['o'],
        ]);
        $this->qrcode($w, $get);
        exit;
    }

}