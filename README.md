# 随心住 · 房屋租订系统（微信小程序全栈）

> 基于微信小程序的租房预订平台：房源浏览 / 在线预约 / 订单管理 / 租客与房东实时沟通，前后端独立开发、独立交付。

## 项目简介

「随心住」是一套完整的租房业务闭环系统，解决租房信息不对称、预约效率低的问题。包含 **四个核心模块**：

| 模块 | 技术栈 | 端口 | 功能 |
|------|--------|------|------|
| 微信小程序（租客端 + 房东端） | 原生微信小程序 | — | 房源浏览、搜索、预约、订单管理、WebSocket 实时沟通；房东端房源管理 / 数据统计 |
| Java 后端服务 | Spring Boot + MyBatis-Plus + MySQL | 8080 | RESTful API、JWT 鉴权、WebSocket 消息、文件上传 |
| 管理后台 | Vue2 + Element UI | 3001 | 平台运营管理：用户、房东、房源、订单管理 |
| 数据库 | MySQL 8 | 3306 | `database/` 下提供完整建库脚本与增量脚本 |

## 目录结构

```
suixin/
├── miniapp/        # 微信小程序（租客端 + 房东端双角色）
│   ├── pages/      # auth / chat / landlord / tenant / welcome / error
│   ├── utils/      # api.js（接口封装）、request.js、storage.js
│   └── app.js
├── backend/        # Spring Boot 后端
│   └── src/main/java/com/suixinzhu/
│       ├── controller/   # 10+ 控制器（房源/订单/消息/收藏/反馈…）
│       ├── service/      # 业务逻辑层
│       ├── mapper/       # MyBatis-Plus 数据访问
│       ├── entity/       # 数据库实体
│       ├── config/       # JWT 拦截器 / CORS / WebSocket 配置
│       └── common/       # 统一响应 / 全局异常处理
├── admin/          # 管理后台（Vue2 + Element UI）
├── database/       # 建库脚本 suixinzhu.sql + 增量更新脚本
└── 项目文件说明文档.md  # 详细模块级说明
```

## 快速开始

### 1. 数据库

```sql
CREATE DATABASE suixinzhu DEFAULT CHARACTER SET utf8mb4;
-- 然后依次执行 database/ 下的 SQL 脚本
```

### 2. 后端

```bash
cd backend
# 修改 src/main/resources/application.yml 中的数据库账号密码
mvn spring-boot:run
# 启动于 http://localhost:8080
```

### 3. 管理后台

```bash
cd admin
npm install
node server.js
# 启动于 http://localhost:3001
```

### 4. 小程序

1. 微信开发者工具 → 导入 `miniapp/` 目录
2. 在 `utils/` 下的接口配置中指向本地后端地址
3. 使用测试号或自己的 appid 编译预览

## 核心功能

- **租客端**：房源浏览 / 分类筛选 / 关键词搜索 / 在线预约看房 / 订单管理 / 收藏 / 房源评价
- **房东端**：房源发布与管理 / 订单处理 / 租客管理 / 数据统计
- **实时沟通**：基于 WebSocket 的租客 ↔ 房东即时聊天
- **平台端**：用户 / 房东 / 房源 / 订单的运营管理

## 说明

- `application.yml` 中的数据库密码、JWT 密钥均为**本地开发默认值**，部署前请自行修改
- 本项目为个人全栈开发作品（设计 → 编码 → 联调 → 答辩全流程）
