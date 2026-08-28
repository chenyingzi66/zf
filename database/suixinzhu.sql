-- SuixinZhu Database Initialization
CREATE DATABASE IF NOT EXISTS suixinzhu DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE suixinzhu;

DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(11) NOT NULL UNIQUE,
    nickname VARCHAR(50) DEFAULT 'User',
    avatar VARCHAR(255) DEFAULT '',
    password VARCHAR(64) NOT NULL,
    real_name VARCHAR(50) DEFAULT '',
    id_card VARCHAR(18) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS sys_host;
CREATE TABLE sys_host (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    host_id VARCHAR(50) NOT NULL UNIQUE,
    phone VARCHAR(11) NOT NULL UNIQUE,
    name VARCHAR(50) DEFAULT 'Host',
    avatar VARCHAR(255) DEFAULT '',
    password VARCHAR(64) NOT NULL,
    real_name VARCHAR(50) DEFAULT '',
    id_card VARCHAR(18) DEFAULT '',
    cert_status TINYINT DEFAULT 0,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_host_id (host_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS sys_admin;
CREATE TABLE sys_admin (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(64) NOT NULL,
    real_name VARCHAR(50) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO sys_admin (username, password, real_name) VALUES ('admin', 'e10adc3949ba59abbe56e057f20f883e', 'Admin');

DROP TABLE IF EXISTS banner;
CREATE TABLE banner (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    pic_url VARCHAR(255) NOT NULL,
    sort INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_sort (status, sort)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO banner (pic_url, sort, status) VALUES 
('https://picsum.photos/750/300?random=1', 1, 1),
('https://picsum.photos/750/300?random=2', 2, 1),
('https://picsum.photos/750/300?random=3', 3, 1);

DROP TABLE IF EXISTS house;
CREATE TABLE house (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    house_id VARCHAR(50) NOT NULL UNIQUE,
    host_id VARCHAR(50) NOT NULL,
    title VARCHAR(100) NOT NULL,
    province VARCHAR(50) DEFAULT '',
    city VARCHAR(50) DEFAULT '',
    district VARCHAR(50) DEFAULT '',
    address VARCHAR(255) DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    rent_type VARCHAR(20) DEFAULT 'monthly',
    area DECIMAL(10,2) DEFAULT 0,
    house_type VARCHAR(50) DEFAULT '',
    orientation VARCHAR(20) DEFAULT '',
    floor VARCHAR(20) DEFAULT '',
    pics TEXT,
    facilities VARCHAR(500) DEFAULT '',
    description TEXT,
    view_count INT DEFAULT 0,
    status TINYINT DEFAULT 0,
    audit_status TINYINT DEFAULT 0,
    audit_remark VARCHAR(255) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_host_id (host_id),
    INDEX idx_status_audit (status, audit_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS house_order;
CREATE TABLE house_order (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id VARCHAR(50) NOT NULL,
    host_id VARCHAR(50) NOT NULL,
    house_id VARCHAR(50) NOT NULL,
    house_title VARCHAR(100) DEFAULT '',
    rent_price DECIMAL(10,2) NOT NULL,
    rent_type VARCHAR(20) DEFAULT 'monthly',
    check_in_date DATE,
    check_out_date DATE,
    total_amount DECIMAL(10,2) DEFAULT 0,
    order_status TINYINT DEFAULT 0,
    real_name VARCHAR(50) DEFAULT '',
    id_card VARCHAR(18) DEFAULT '',
    phone VARCHAR(11) DEFAULT '',
    contract_signed TINYINT DEFAULT 0,
    remark VARCHAR(255) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_host_id (host_id),
    INDEX idx_order_status (order_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS rent_contract;
CREATE TABLE rent_contract (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    host_id VARCHAR(50) NOT NULL,
    house_id VARCHAR(50) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    id_card VARCHAR(18) NOT NULL,
    phone VARCHAR(11) NOT NULL,
    sign_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    contract_url VARCHAR(255) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS chat_message;
CREATE TABLE chat_message (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    send_id VARCHAR(50) NOT NULL,
    receive_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    send_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT DEFAULT 0,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_send_id (send_id),
    INDEX idx_receive_id (receive_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS house_collect;
CREATE TABLE house_collect (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    house_id VARCHAR(50) NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_house (user_id, house_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS feedback;
CREATE TABLE feedback (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) DEFAULT 'user',
    type VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    status TINYINT DEFAULT 0,
    reply VARCHAR(500) DEFAULT '',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
