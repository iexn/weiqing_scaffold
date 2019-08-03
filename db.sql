

CREATE TABLE IF NOT EXISTS `ims_szxh_vija_active` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(11) NOT NULL,
  `uni_id` int(11) NOT NULL,
  `ident` varchar(10) NOT NULL,
  `title` varchar(255) NOT NULL COMMENT '标题',
  `reward_info` varchar(255) NOT NULL COMMENT '奖励内容',
  `amount` double(10,2) NOT NULL COMMENT '市场价',
  `start_time` int(10) NOT NULL COMMENT '开始时间',
  `end_time` int(10) NOT NULL COMMENT '结束时间',
  `cover` varchar(255) NOT NULL COMMENT '封面图',
  `preview_covers` text NOT NULL COMMENT '查看示例活动时，顶部上传图片数组',
  `music` varchar(255) NOT NULL COMMENT '音乐',
  `counsel` text NOT NULL COMMENT '咨询客服',
  `rule` text NOT NULL COMMENT '活动规则',
  `sort` mediumint(6) NOT NULL,
  `status` enum('on','off') NOT NULL DEFAULT 'off',
  `delete_time` int(11) DEFAULT NULL,
  `unlock` text NOT NULL COMMENT '解锁奖励',
  `gift` text NOT NULL COMMENT '礼物列表，最多20个',
  `jim` text NOT NULL COMMENT '自定义表单信息',
  `share_title` varchar(255) NOT NULL,
  `share_desc` varchar(255) NOT NULL,
  `share_imgUrl` varchar(255) NOT NULL,
  `show_complaint` enum('imitation','compulsory','off') NOT NULL DEFAULT 'off' COMMENT '投诉按钮及功能，compain模仿微信投诉，compulsory点击直接拉黑，off关闭显示',
  `cav_open` enum('on','off') NOT NULL DEFAULT 'on' COMMENT '是否开启核销',
  `cav_on_give_gift` int(10) NOT NULL DEFAULT '0' COMMENT '核销几次后不允许接收礼物，0表示任何时间都允许接收',
  `enter_bless_status` enum('highlight','off') NOT NULL DEFAULT 'off' COMMENT '进入活动是否突出显示福袋highlight 变大',
  `show_call_us` enum('on','off') NOT NULL DEFAULT 'off' COMMENT '是否显示关注我们，并且报名成功后弹出显示一次',
  `show_caver_register_list` enum('on','off') NOT NULL DEFAULT 'off' COMMENT '是否给核销员显示报名数据并且允许导出',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_active_cav` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(11) NOT NULL,
  `uni_id` int(11) NOT NULL,
  `ident` varchar(10) NOT NULL,
  `openid` varchar(32) NOT NULL COMMENT '标题',
  `active_ident` varchar(255) NOT NULL COMMENT '奖励内容',
  `nickname` varchar(64) NOT NULL COMMENT '市场价',
  `avatar` varchar(255) NOT NULL COMMENT '开始时间',
  `cav_total` int(10) NOT NULL DEFAULT '0' COMMENT '总核销数量',
  `create_time` int(10) NOT NULL,
  `delete_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(11) NOT NULL,
  `page_size` int(10) unsigned NOT NULL DEFAULT '10' COMMENT '后台每页页数',
  `payment_url` text NOT NULL,
  `share_url` text NOT NULL,
  `active_url` text NOT NULL,
  `amap_key` varchar(255) NOT NULL DEFAULT '' COMMENT '高德地图key',
  `mch_center_cover` varchar(255) NOT NULL DEFAULT '' COMMENT '商家界面首图',
  `mch_content` text NOT NULL COMMENT '商家详情图文信息',
  `template_id_order` varchar(255) NOT NULL DEFAULT '' COMMENT '下单成功通知模板ID',
  `template_id_cav` varchar(255) NOT NULL DEFAULT '' COMMENT '核销成功通知模板ID',
  `template_id_audit` varchar(255) NOT NULL DEFAULT '' COMMENT '商家审核模板ID、通用模板',
  `template_id_apply` varchar(255) NOT NULL DEFAULT '' COMMENT '给客服通知',
  `template_id_message` varchar(255) NOT NULL DEFAULT '' COMMENT '用户收到商家留言模板ID',
  `support` varchar(255) NOT NULL COMMENT '活动页面底部文字',
  `template_id_register_success` varchar(255) NOT NULL COMMENT '报名成功template_id',
  `template_id_cav_success` varchar(255) NOT NULL COMMENT '核销成功template_id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='模块设置';


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_gift` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(10) NOT NULL,
  `uni_id` int(10) NOT NULL,
  `ident` varchar(10) NOT NULL,
  `name` varchar(20) NOT NULL COMMENT '礼物名称',
  `cover` varchar(255) NOT NULL COMMENT '礼物贴图',
  `amount` double(10,2) NOT NULL COMMENT '礼物价格，0代表当前礼物为免费礼物',
  `score` int(10) unsigned NOT NULL COMMENT '可获得分数，0代表不获得分数。分数可当作返利价值使用，只能为整数',
  `init_have_total` int(10) NOT NULL DEFAULT '0' COMMENT '初始持有数量',
  `remarks` text NOT NULL,
  `sort` mediumint(6) unsigned NOT NULL DEFAULT '0',
  `status` enum('on','off') NOT NULL DEFAULT 'on',
  `delete_time` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ident` (`ident`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8 COMMENT='礼物库';


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_order` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uniacid` int(10) NOT NULL,
  `uni_id` int(10) NOT NULL,
  `ident` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `order_sn` varchar(255) NOT NULL COMMENT '订单号',
  `w7_tid` varchar(255) NOT NULL COMMENT '微擎订单号',
  `transaction_id` varchar(255) NOT NULL COMMENT '微信订单号',
  `openid` char(32) NOT NULL,
  `type` enum('rewardto') NOT NULL COMMENT 'gift送礼下单',
  `type_ident` varchar(50) NOT NULL COMMENT 'rewardto时，值为register_ident对应的值',
  `amount` double(10,2) NOT NULL COMMENT '订单价格',
  `status` enum('wait','success','cancel') NOT NULL DEFAULT 'wait' COMMENT '状态，等待中、成功、取消',
  `create_time` int(10) NOT NULL COMMENT '下单时间',
  `done_time` int(10) NOT NULL DEFAULT '0' COMMENT '完成时间',
  `delete_time` int(10) DEFAULT NULL,
  `params` text NOT NULL COMMENT '附加数据json',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_register` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uniacid` int(10) NOT NULL,
  `uni_id` int(10) NOT NULL,
  `ident` varchar(50) NOT NULL COMMENT '唯一队列值',
  `active_id` int(10) NOT NULL COMMENT '活动表id',
  `active_ident` varchar(50) NOT NULL,
  `openid` char(32) NOT NULL COMMENT '报名人openid',
  `avatar` varchar(255) NOT NULL COMMENT '报名人openid对应的头像',
  `nickname` varchar(255) NOT NULL COMMENT '报名人openid对应的昵称',
  `jim` text NOT NULL COMMENT '报名信息json',
  `covers` text NOT NULL COMMENT '上传封面图片，没有图时为提示上传图片',
  `gift_total` int(10) NOT NULL DEFAULT '0' COMMENT '收获礼物总数',
  `gift_amount` double(10,2) NOT NULL DEFAULT '0.00' COMMENT '收获礼物总价值',
  `gift_score` int(10) NOT NULL,
  `cav_openid` varchar(32) NOT NULL,
  `cav_nickname` varchar(64) NOT NULL,
  `cav_avatar` varchar(255) NOT NULL,
  `cav_times` int(10) NOT NULL DEFAULT '0' COMMENT '已核销次数',
  `cav_gift_total` int(10) NOT NULL COMMENT '核销时礼物总数',
  `cav_gift_amount` double(10,2) NOT NULL,
  `cav_gift_score` int(10) NOT NULL,
  `cav_time` int(10) NOT NULL COMMENT '核销时间',
  `is_first_view` enum('true','false') NOT NULL DEFAULT 'true',
  `create_time` int(10) NOT NULL COMMENT '报名时间',
  `delete_time` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_rewardto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(11) NOT NULL,
  `uni_id` int(11) NOT NULL,
  `ident` varchar(50) NOT NULL,
  `register_ident` varchar(50) NOT NULL,
  `active_ident` varchar(50) NOT NULL,
  `openid` char(32) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT '用户昵称',
  `first_rewardto_time` int(10) NOT NULL COMMENT '首次送礼时间',
  `last_rewardto_time` int(10) NOT NULL,
  `gift_total` int(10) NOT NULL COMMENT '送礼数量总和',
  `gift_amount` double(10,2) NOT NULL COMMENT '送礼总钱数',
  `gift_score` int(10) NOT NULL COMMENT '送礼总价值/积分',
  `delete_time` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COMMENT='每人送礼总记录';


CREATE TABLE IF NOT EXISTS `ims_szxh_vija_rewardto_log` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `uniacid` int(10) NOT NULL,
  `uni_id` int(10) NOT NULL,
  `ident` varchar(50) NOT NULL,
  `register_ident` varchar(50) NOT NULL,
  `active_ident` varchar(50) NOT NULL,
  `openid` char(32) NOT NULL COMMENT '送礼人openid',
  `avatar` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `gift_ident` varchar(50) NOT NULL,
  `gift_name` varchar(255) NOT NULL COMMENT '礼物名称',
  `gift_cover` varchar(255) NOT NULL,
  `gift_total` int(10) NOT NULL COMMENT '送礼数量',
  `gift_amount` double(10,2) NOT NULL COMMENT '总花销',
  `gift_score` int(10) NOT NULL COMMENT '礼物价值',
  `rewardto_time` int(10) NOT NULL COMMENT '送礼时间',
  `delete_time` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8 COMMENT='每次送礼明细';


CREATE TABLE IF NOT EXISTS `ims_szxh_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(11) NOT NULL COMMENT '公众号id',
  `modulename` varchar(40) NOT NULL COMMENT '模块名',
  `is_shield` tinyint(1) NOT NULL DEFAULT '2',
  `share_domain` varchar(225) NOT NULL DEFAULT '' COMMENT '分享主域名',
  `domain2` varchar(10) NOT NULL DEFAULT '' COMMENT '页面2级域名',
  `pay_url` varchar(255) NOT NULL DEFAULT '' COMMENT '支付域名，包含协议',
  `payment_url` text NOT NULL,
  `share_url` text NOT NULL,
  `active_url` text NOT NULL,
  `domain_wl` text NOT NULL COMMENT '域名白名单',
  `domain_bl` text NOT NULL COMMENT '域名黑名单',
  `auth_key` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8 COMMENT='szxh模块控制';


CREATE TABLE IF NOT EXISTS `ims_szxh_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `create_time` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=518 DEFAULT CHARSET=utf8 COMMENT='后台测试用';


CREATE TABLE IF NOT EXISTS `ims_szxh_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniacid` int(11) NOT NULL,
  `uid` varchar(32) NOT NULL COMMENT '微信唯一标志',
  `name` varchar(16) NOT NULL COMMENT '用户昵称',
  `avatar` varchar(32) NOT NULL COMMENT '头像地址',
  `create_time` int(11) NOT NULL COMMENT '加入时间',
  `type` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC COMMENT='szxh:微信用户';


CREATE TABLE IF NOT EXISTS `ims_szxh_usersrobot` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nickname` varchar(20) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `national` varchar(30) NOT NULL,
  `province` varchar(30) NOT NULL,
  `city` varchar(30) NOT NULL,
  `area` varchar(30) NOT NULL,
  `vir_time` int(10) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `mobile` varchar(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2001 DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC;

