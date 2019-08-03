<?php 
// 项目配置信息设置
return [
    // 模板消息文字模板配置
    'wx_templates' => [
        'register_success' => [
            'name' => [],
            'remark' => ['value'=>'点击进入我的活动','color'=>'#0000FF']
        ],
        'cav_success' => [
            'first'  => ['value'=>'核销成功'],
            'remark' => ['value'=>'点击进入我的活动','color'=>'#0000FF']
        ],
    ],
    'copyright' => '天津指尖云科技有限公司',

    'DEFAULT_GIFT' => [
        ['name' => '玫瑰','cover'=>MROOT . '/resource/app/default/images/gift/mg.png','amount'=>'0','score'=>'1','init_have_total'=>'1','sort'=>'8'],
        ['name' => '棒棒糖','cover'=>MROOT . '/resource/app/default/images/gift/bbt.png','amount'=>'1','score'=>'1','init_have_total'=>'0','sort'=>'7'],
        ['name' => '甜甜圈','cover'=>MROOT . '/resource/app/default/images/gift/ttq.png','amount'=>'2','score'=>'2','init_have_total'=>'0','sort'=>'5'],
        ['name' => '招财猫','cover'=>MROOT . '/resource/app/default/images/gift/zcm.png','amount'=>'3','score'=>'3','init_have_total'=>'0','sort'=>'4'],
        ['name' => '游艇','cover'=>MROOT . '/resource/app/default/images/gift/yt.png','amount'=>'5','score'=>'5','init_have_total'=>'0','sort'=>'6'],
        ['name' => '豪华跑车','cover'=>MROOT . '/resource/app/default/images/gift/hhpc.png','amount'=>'8','score'=>'8','init_have_total'=>'0','sort'=>'3'],
        ['name' => '大飞机','cover'=>MROOT . '/resource/app/default/images/gift/dfj.png','amount'=>'10','score'=>'10','init_have_total'=>'0','sort'=>'2'],
        ['name' => '大火箭','cover'=>MROOT . '/resource/app/default/images/gift/dhj.png','amount'=>'15','score'=>'15','init_have_total'=>'0','sort'=>'1'],
    ]
];