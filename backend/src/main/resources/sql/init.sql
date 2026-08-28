-- 随心住住房租订系统 - 数据库初始化脚本
-- 创建时间: 2024
-- 数据库: MySQL 8.0+

-- 创建数据库
CREATE DATABASE IF NOT EXISTS suixinzhu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE suixinzhu;

-- ==================== 管理员表 ====================
CREATE TABLE IF NOT EXISTS `admin` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '管理员ID',
  `username` VARCHAR(50) NOT NULL COMMENT '账号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（MD5加密）',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '姓名',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- ==================== 租客表 ====================
CREATE TABLE IF NOT EXISTS `tenant` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '租客ID',
  `openid` VARCHAR(100) DEFAULT NULL COMMENT '微信openid',
  `nick_name` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
  `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 1=正常 0=封禁',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_openid` (`openid`),
  KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='租客表';

-- ==================== 房东表 ====================
CREATE TABLE IF NOT EXISTS `landlord` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '房东ID',
  `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
  `password` VARCHAR(255) DEFAULT NULL COMMENT '密码（实际用验证码登录，此处备用）',
  `nick_name` VARCHAR(100) DEFAULT NULL COMMENT '昵称',
  `real_name` VARCHAR(50) DEFAULT NULL COMMENT '真实姓名',
  `id_card` VARCHAR(30) DEFAULT NULL COMMENT '身份证号',
  `avatar_url` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
  `cert_status` VARCHAR(20) NOT NULL DEFAULT 'none' COMMENT '认证状态: none=未认证 pending=待审核 approved=已通过 rejected=已拒绝',
  `cert_reject_reason` VARCHAR(500) DEFAULT NULL COMMENT '认证拒绝原因',
  `status` TINYINT NOT NULL DEFAULT 1 COMMENT '账号状态: 1=正常 0=封禁',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房东表';

-- ==================== 房源表 ====================
CREATE TABLE IF NOT EXISTS `house` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '房源ID',
  `landlord_id` BIGINT NOT NULL COMMENT '房东ID',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `description` TEXT DEFAULT NULL COMMENT '描述',
  `price` DECIMAL(10,2) NOT NULL COMMENT '月租金',
  `deposit` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金',
  `area` DECIMAL(8,2) DEFAULT NULL COMMENT '面积(㎡)',
  `floor` VARCHAR(50) DEFAULT NULL COMMENT '楼层',
  `orientation` VARCHAR(20) DEFAULT NULL COMMENT '朝向',
  `house_type` VARCHAR(50) DEFAULT NULL COMMENT '户型',
  `region` VARCHAR(100) DEFAULT NULL COMMENT '区域',
  `address` VARCHAR(500) DEFAULT NULL COMMENT '详细地址',
  `latitude` DECIMAL(10,7) DEFAULT NULL COMMENT '纬度',
  `longitude` DECIMAL(10,7) DEFAULT NULL COMMENT '经度',
  `images` JSON DEFAULT NULL COMMENT '图片列表（JSON数组）',
  `facilities` JSON DEFAULT NULL COMMENT '配套设施（JSON数组）',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending=待审核 online=已上架 offline=已下架 rejected=已拒绝',
  `reject_reason` VARCHAR(500) DEFAULT NULL COMMENT '拒绝原因',
  `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览量',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_landlord_id` (`landlord_id`),
  KEY `idx_status` (`status`),
  KEY `idx_region` (`region`),
  KEY `idx_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房源表';

-- ==================== 订单表 ====================
CREATE TABLE IF NOT EXISTS `order` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` VARCHAR(64) NOT NULL COMMENT '订单编号',
  `house_id` BIGINT NOT NULL COMMENT '房源ID',
  `house_title` VARCHAR(200) DEFAULT NULL COMMENT '房源标题（快照）',
  `house_image` VARCHAR(500) DEFAULT NULL COMMENT '房源封面（快照）',
  `tenant_id` BIGINT NOT NULL COMMENT '租客ID',
  `tenant_name` VARCHAR(100) DEFAULT NULL COMMENT '租客昵称（快照）',
  `tenant_phone` VARCHAR(20) DEFAULT NULL COMMENT '租客手机（快照）',
  `tenant_avatar` VARCHAR(500) DEFAULT NULL COMMENT '租客头像（快照）',
  `landlord_id` BIGINT NOT NULL COMMENT '房东ID',
  `landlord_name` VARCHAR(100) DEFAULT NULL COMMENT '房东姓名（快照）',
  `check_in_date` DATE NOT NULL COMMENT '入住日期',
  `check_out_date` DATE NOT NULL COMMENT '退房日期',
  `days` INT NOT NULL DEFAULT 0 COMMENT '租住天数',
  `rent_price` DECIMAL(10,2) NOT NULL COMMENT '月租金',
  `deposit` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '押金',
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0 COMMENT '总金额（不含押金）',
  `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending=待确认 confirmed=已确认 rejected=已拒绝 completed=已完结 cancelled=已取消',
  `reject_reason` VARCHAR(500) DEFAULT NULL COMMENT '拒绝原因',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_house_id` (`house_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_landlord_id` (`landlord_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- ==================== 收藏表 ====================
CREATE TABLE IF NOT EXISTS `favorite` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '收藏ID',
  `tenant_id` BIGINT NOT NULL COMMENT '租客ID',
  `house_id` BIGINT NOT NULL COMMENT '房源ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tenant_house` (`tenant_id`, `house_id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_house_id` (`house_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收藏表';

-- ==================== 消息表 ====================
CREATE TABLE IF NOT EXISTS `message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` VARCHAR(200) NOT NULL COMMENT '会话ID（格式: conv_{tenantId}_{landlordId}_{houseId}）',
  `house_id` BIGINT NOT NULL COMMENT '关联房源ID',
  `house_title` VARCHAR(200) DEFAULT NULL COMMENT '房源标题（快照）',
  `sender_id` BIGINT NOT NULL COMMENT '发送者ID',
  `sender_type` VARCHAR(20) NOT NULL COMMENT '发送者类型: tenant=租客 landlord=房东',
  `sender_name` VARCHAR(100) DEFAULT NULL COMMENT '发送者昵称',
  `sender_avatar` VARCHAR(500) DEFAULT NULL COMMENT '发送者头像',
  `receiver_id` BIGINT NOT NULL COMMENT '接收者ID',
  `receiver_type` VARCHAR(20) NOT NULL COMMENT '接收者类型',
  `receiver_name` VARCHAR(100) DEFAULT NULL COMMENT '接收者昵称',
  `receiver_avatar` VARCHAR(500) DEFAULT NULL COMMENT '接收者头像',
  `type` VARCHAR(20) NOT NULL DEFAULT 'text' COMMENT '消息类型: text=文字',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0=未读 1=已读',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_sender_id` (`sender_id`),
  KEY `idx_receiver_id` (`receiver_id`),
  KEY `idx_house_id` (`house_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='消息表';

-- ==================== 反馈表 ====================
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '反馈ID',
  `user_type` VARCHAR(20) NOT NULL COMMENT '用户类型: tenant=租客 landlord=房东',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `user_name` VARCHAR(100) DEFAULT NULL COMMENT '用户昵称',
  `type` VARCHAR(50) NOT NULL COMMENT '反馈类型',
  `content` TEXT NOT NULL COMMENT '反馈内容',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '处理状态: pending=待处理 processing=处理中 resolved=已解决',
  `admin_reply` TEXT DEFAULT NULL COMMENT '管理员回复',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_type_id` (`user_type`, `user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈投诉表';

-- ==================== 初始数据 ====================

-- 初始化管理员账号（密码: 123456 的MD5值）
INSERT INTO `admin` (`username`, `password`, `real_name`) VALUES
('admin', 'e10adc3949ba59abbe56e057f20f883e', '系统管理员')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 初始化测试租客
INSERT INTO `tenant` (`id`, `openid`, `nick_name`, `phone`, `avatar_url`, `status`) VALUES
(1, 'test_openid_001', '王小明', '13700137001', 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1', 1),
(2, 'test_openid_002', '刘晓华', '13600136001', 'https://via.placeholder.com/200x200/FA8C16/FFFFFF?text=T2', 1)
ON DUPLICATE KEY UPDATE `nick_name` = VALUES(`nick_name`);

-- 初始化测试房东
INSERT INTO `landlord` (`id`, `phone`, `nick_name`, `real_name`, `id_card`, `avatar_url`, `cert_status`, `status`) VALUES
(1, '13800138001', '张先生', '张三', '110101199001011234', 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1', 'approved', 1),
(2, '13900139002', '李女士', '李四', '110101199505055678', 'https://via.placeholder.com/200x200/FF4444/FFFFFF?text=L2', 'approved', 1)
ON DUPLICATE KEY UPDATE `nick_name` = VALUES(`nick_name`);

-- 初始化测试房源
INSERT INTO `house` (`id`, `landlord_id`, `title`, `description`, `price`, `deposit`, `area`, `floor`, `orientation`, `house_type`, `region`, `address`, `latitude`, `longitude`, `images`, `facilities`, `status`, `view_count`) VALUES
(1, 1, '精装两室一厅 近地铁 拎包入住', '房屋位于市中心，交通便利，周边配套设施齐全，精装修，家具家电齐全，拎包入住。', 3500.00, 3500.00, 85.00, '10/20', '南北', '2室1厅1卫', '朝阳区', '北京市朝阳区建国路88号', 39.9088230, 116.3974700, '["https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House1-1","https://via.placeholder.com/750x500/52C41A/FFFFFF?text=House1-2"]', '["空调","冰箱","洗衣机","热水器","宽带","电视","沙发","床"]', 'online', 128),
(2, 2, '温馨单间 独立卫浴 价格实惠', '单间出租，独立卫浴，采光好，安静舒适，适合单身人士或情侣居住。', 1800.00, 1800.00, 25.00, '5/10', '南', '1室0厅1卫', '海淀区', '北京市海淀区中关村大街100号', 39.9888230, 116.3174700, '["https://via.placeholder.com/750x500/FF4444/FFFFFF?text=House2-1"]', '["空调","热水器","宽带","床","衣柜"]', 'online', 89),
(3, 1, '豪华三室两厅 高层景观房', '豪华装修，高层景观房，视野开阔，采光极佳，小区环境优美，物业管理完善。', 6800.00, 6800.00, 120.00, '18/25', '南', '3室2厅2卫', '东城区', '北京市东城区王府井大街50号', 39.9188230, 116.4074700, '["https://via.placeholder.com/750x500/52C41A/FFFFFF?text=House3-1","https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House3-2"]', '["空调","冰箱","洗衣机","热水器","宽带","电视","沙发","床","衣柜","书桌"]', 'online', 256),
(4, 1, '朝南两室 电梯房 停车方便', '标准两室户型，采光充足，配套电梯，小区内设停车位，生活便利。', 4200.00, 4200.00, 90.00, '8/15', '南', '2室1厅1卫', '朝阳区', '北京市朝阳区望京路20号', 39.9988230, 116.4874700, '["https://via.placeholder.com/750x500/FA8C16/FFFFFF?text=House4-1"]', '["空调","冰箱","洗衣机","热水器","宽带","床","衣柜"]', 'offline', 67)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 初始化测试订单
INSERT INTO `order` (`id`, `order_no`, `house_id`, `house_title`, `house_image`, `tenant_id`, `tenant_name`, `tenant_phone`, `tenant_avatar`, `landlord_id`, `landlord_name`, `check_in_date`, `check_out_date`, `days`, `rent_price`, `deposit`, `total_amount`, `remark`, `status`) VALUES
(1, 'SXZ202403130001', 1, '精装两室一厅 近地铁 拎包入住', 'https://via.placeholder.com/750x500/4A90E2/FFFFFF?text=House1-1', 1, '王小明', '13700137001', 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1', 1, '张先生', '2024-04-01', '2024-07-01', 91, 3500.00, 3500.00, 10500.00, '希望提前入住', 'pending'),
(2, 'SXZ202403120001', 2, '温馨单间 独立卫浴 价格实惠', 'https://via.placeholder.com/750x500/FF4444/FFFFFF?text=House2-1', 1, '王小明', '13700137001', 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1', 2, '李女士', '2024-03-15', '2024-06-15', 92, 1800.00, 1800.00, 5400.00, '', 'confirmed'),
(3, 'SXZ202402200001', 3, '豪华三室两厅 高层景观房', 'https://via.placeholder.com/750x500/52C41A/FFFFFF?text=House3-1', 2, '刘晓华', '13600136001', 'https://via.placeholder.com/200x200/FA8C16/FFFFFF?text=T2', 1, '张先生', '2024-03-01', '2024-09-01', 184, 6800.00, 6800.00, 40800.00, '需要带宠物入住', 'completed')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

-- 初始化收藏
INSERT INTO `favorite` (`tenant_id`, `house_id`) VALUES (1, 1), (1, 3)
ON DUPLICATE KEY UPDATE `created_at` = `created_at`;

-- 初始化测试消息
INSERT INTO `message` (`conversation_id`, `house_id`, `house_title`, `sender_id`, `sender_type`, `sender_name`, `sender_avatar`, `receiver_id`, `receiver_type`, `receiver_name`, `receiver_avatar`, `type`, `content`, `is_read`) VALUES
('conv_1_1_1', 1, '精装两室一厅 近地铁 拎包入住', 1, 'tenant', '王小明', 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1', 1, 'landlord', '张先生', 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1', 'text', '您好，这个房子还在出租吗？', 1),
('conv_1_1_1', 1, '精装两室一厅 近地铁 拎包入住', 1, 'landlord', '张先生', 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1', 1, 'tenant', '王小明', 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1', 'text', '在的，欢迎随时看房！', 1),
('conv_1_1_1', 1, '精装两室一厅 近地铁 拎包入住', 1, 'tenant', '王小明', 'https://via.placeholder.com/200x200/4A90E2/FFFFFF?text=T1', 1, 'landlord', '张先生', 'https://via.placeholder.com/200x200/52C41A/FFFFFF?text=L1', 'text', '请问可以周末看房吗？', 0);

-- 初始化测试反馈
INSERT INTO `feedback` (`user_type`, `user_id`, `user_name`, `type`, `content`, `status`) VALUES
('tenant', 1, '王小明', '功能问题', '搜索功能有时候结果不准确，希望改进。', 'pending');
