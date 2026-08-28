-- ==========================================
-- 随心住 住房租订系统 v2.0 完整数据库结构
-- ==========================================

DROP DATABASE IF EXISTS `suixinzhu`;
CREATE DATABASE `suixinzhu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `suixinzhu`;

-- 1. 用户表 (user)
CREATE TABLE `user` (
  `id` varchar(64) NOT NULL COMMENT '用户ID(规则: user+手机号)',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `nick_name` varchar(64) DEFAULT '微信用户' COMMENT '昵称',
  `avatar_url` varchar(255) DEFAULT '' COMMENT '头像',
  `real_name` varchar(64) DEFAULT NULL COMMENT '真实姓名',
  `id_card` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `password` varchar(128) NOT NULL COMMENT '密码',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租客用户表';

-- 2. 房东表 (host)
CREATE TABLE `host` (
  `id` varchar(64) NOT NULL COMMENT '房东ID(规则: host+手机号)',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `nick_name` varchar(64) DEFAULT '房东用户' COMMENT '房东名称/昵称',
  `avatar_url` varchar(255) DEFAULT '' COMMENT '头像',
  `password` varchar(128) NOT NULL COMMENT '密码',
  `real_name` varchar(64) DEFAULT NULL COMMENT '真实姓名',
  `id_card` varchar(18) DEFAULT NULL COMMENT '身份证号',
  `auth_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '认证状态: 0未认证 1审核中 2已认证 3拒绝',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房东表';

-- 3. 房源表 (house)
CREATE TABLE `house` (
  `id` varchar(64) NOT NULL COMMENT '房源ID(规则: hours+时间+序号)',
  `host_id` varchar(64) NOT NULL COMMENT '房东ID',
  `title` varchar(128) NOT NULL COMMENT '房源标题',
  `description` text COMMENT '房源描述',
  `region` varchar(64) NOT NULL COMMENT '区域(全国)',
  `address` varchar(255) NOT NULL COMMENT '详细地址',
  `house_type` varchar(32) NOT NULL COMMENT '户型',
  `rent_type` varchar(32) NOT NULL COMMENT '租金类型: 日租,月租,季租,年租',
  `price` decimal(10,2) NOT NULL COMMENT '租金价格',
  `images` json DEFAULT NULL COMMENT '房源图片列表(JSON数组)',
  `facilities` json DEFAULT NULL COMMENT '配套设施(JSON数组)',
  `audit_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '审核状态: 0待审核 1通过 2拒绝',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '上架状态: 1上架 0下架',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_host_id` (`host_id`),
  KEY `idx_audit_status` (`audit_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房源表';

-- 4. 订单表 (order)
CREATE TABLE `orders` (
  `id` varchar(64) NOT NULL COMMENT '订单ID',
  `user_id` varchar(64) NOT NULL COMMENT '租客ID',
  `host_id` varchar(64) NOT NULL COMMENT '房东ID',
  `house_id` varchar(64) NOT NULL COMMENT '房源ID',
  `status` varchar(32) NOT NULL DEFAULT 'PENDING' COMMENT '订单状态: PENDING(待确认), CONFIRMED(已确认), LIVING(租住中), COMPLETED(已完结), REJECTED(已拒绝)',
  `total_amount` decimal(10,2) NOT NULL COMMENT '租金总额',
  `check_in_date` date NOT NULL COMMENT '入住日期',
  `check_out_date` date NOT NULL COMMENT '退房日期',
  `remark` varchar(255) DEFAULT NULL COMMENT '订单备注',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_host_id` (`host_id`),
  KEY `idx_house_id` (`house_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 5. 轮播图表 (banner)
CREATE TABLE `banner` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '轮播图ID',
  `image_url` varchar(255) NOT NULL COMMENT '图片URL',
  `link_url` varchar(255) DEFAULT NULL COMMENT '跳转链接(可选)',
  `sort_order` int(11) NOT NULL DEFAULT '0' COMMENT '排序(越小越靠前)',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态: 1显示 0隐藏',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- 6. 消息表 (message)
CREATE TABLE `message` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `sender_id` varchar(64) NOT NULL COMMENT '发送方ID',
  `receiver_id` varchar(64) NOT NULL COMMENT '接收方ID',
  `content` text NOT NULL COMMENT '消息内容',
  `is_read` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已读: 0未读 1已读',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '发送时间',
  PRIMARY KEY (`id`),
  KEY `idx_sender_receiver` (`sender_id`,`receiver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实时消息表';

-- 7. 反馈投诉表 (feedback)
CREATE TABLE `feedback` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `type` varchar(32) NOT NULL COMMENT '反馈类型(功能建议/房源投诉/其他)',
  `content` text NOT NULL COMMENT '反馈内容',
  `images` json DEFAULT NULL COMMENT '反馈图片',
  `status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '处理状态: 0待处理 1已处理',
  `reply` text COMMENT '后台回复内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='反馈投诉表';

-- 8. 房源收藏表 (collect)
CREATE TABLE `collect` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `house_id` varchar(64) NOT NULL COMMENT '房源ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_house` (`user_id`,`house_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='房源收藏表';

-- 9. 租房合同表 (contract)
CREATE TABLE `contract` (
  `id` varchar(64) NOT NULL COMMENT '合同ID',
  `order_id` varchar(64) NOT NULL COMMENT '订单ID',
  `user_id` varchar(64) NOT NULL COMMENT '用户ID',
  `real_name` varchar(64) NOT NULL COMMENT '实名信息',
  `id_card` varchar(18) NOT NULL COMMENT '身份证号',
  `phone` varchar(20) NOT NULL COMMENT '联系电话',
  `contract_url` varchar(255) DEFAULT NULL COMMENT '电子合同文件URL',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '签署时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租房合同表';

-- 插入一条管理员测试数据(如有需要)和部分初始轮播图
INSERT INTO `banner` (`image_url`, `sort_order`, `status`) VALUES 
('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 1, 1),
('https://images.unsplash.com/photo-1502672260266-1c1c2f50ce3e?w=800', 2, 1);
