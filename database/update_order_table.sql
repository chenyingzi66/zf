-- 更新订单表结构，-- 添加缺失字段

ALTER TABLE house_order ADD COLUMN house_image VARCHAR(500) DEFAULT '';
ALTER TABLE house_order ADD COLUMN house_address VARCHAR(255) DEFAULT '';
ALTER TABLE house_order ADD COLUMN house_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE house_order ADD COLUMN days INT DEFAULT 30;
ALTER TABLE house_order ADD COLUMN months INT DEFAULT 1;
ALTER TABLE house_order ADD COLUMN rent_count INT DEFAULT 1;
ALTER TABLE house_order ADD COLUMN unit_price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE house_order ADD COLUMN rent_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE house_order ADD COLUMN deposit DECIMAL(10,2) DEFAULT 0;
ALTER TABLE house_order ADD COLUMN guest_name VARCHAR(50) DEFAULT '';
ALTER TABLE house_order ADD COLUMN guest_phone VARCHAR(11) DEFAULT '';
