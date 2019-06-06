<?php 
// TODO: 后台菜单列表
return [
    // 侧边栏列表
    'menu' => [
        [
            'title' => '后台主页',
            'class' => active(true),
            'icon' => 'home',
            'url' => url('home/welcome/ext', ['m'=>MNAME]),
            '_children' => []
        ],
        [
            'title' => '活动管理',
            "class" => active(['main','w7'], true) . ' submenu',
            'icon' => 'th',
            'url' => 'javascript:;',
            '_children' => [
                [
                    'title' => '活动列表',
                    'class' => active('main'),
                    'url'   => aurl(false, 'main')
                ],
                [
                    'title' => '活动分类管理',
                    'class' => active('w7'),
                    'url'   => aurl(false, 'w7')
                ]
            ]
        ]
    ],
];