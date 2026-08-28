-- 更新 chat_message 表结构，添加会话关联字段
-- 执行此脚本前请备份数据

-- 删除旧表（如果存在数据，请先备份）
DROP TABLE IF EXISTS chat_message;

-- 创建新的 chat_message 表
CREATE TABLE chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    tenant_id VARCHAR(50),
    landlord_id VARCHAR(50),
    house_id VARCHAR(50),
    send_id VARCHAR(50) NOT NULL COMMENT '发送者ID',
    receive_id VARCHAR(50) NOT NULL COMMENT '接收者ID',
    content TEXT NOT NULL COMMENT '消息内容',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_landlord_id (landlord_id),
    INDEX idx_house_id (house_id),
    INDEX idx_send_id (send_id),
    INDEX idx_receive_id (receive_id),
    INDEX idx_conversation (tenant_id, landlord_id, house_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

-- 查看表结构
DESCRIBE chat_message;
