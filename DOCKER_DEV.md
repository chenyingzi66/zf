# Docker 开发环境

这套配置用于本地开发，不会把后端源码封装死在镜像里。`backend/`、`admin/` 和 `uploads/` 都挂载到容器中，源码仍然在宿主机编辑。

## 启动

在项目根目录执行：

```bash
docker compose -f docker-compose.dev.yml up --build
```

如果宿主机的 `3306` 或 `3001` 已被占用，使用其他宿主机端口：

```bash
MYSQL_PORT=3307 ADMIN_PORT=3002 docker compose -f docker-compose.dev.yml up --build
```

服务地址：

- Spring Boot API: http://localhost:8080
- WebSocket: ws://localhost:8080/ws/{userId}
- 管理后台: http://localhost:${ADMIN_PORT:-3001}
- MySQL: localhost:${MYSQL_PORT:-3306}，用户 `root`，密码 `123456`，数据库 `suixinzhu`

微信开发者工具直接导入 `miniapp/`，它访问宿主机映射出来的 `localhost:8080`。

## 修改后端代码

Java 源码保存后，在另一个终端执行：

```bash
docker compose -f docker-compose.dev.yml exec backend mvn compile
```

`spring-boot-devtools` 检测到编译后的 class 变化后会自动重启应用。修改 `application.yml` 或依赖后执行：

```bash
docker compose -f docker-compose.dev.yml restart backend
```

不需要重新构建镜像。Maven 依赖保存在 Docker 命名卷 `suixinzhu_maven_cache` 中。

## 修改管理后台

修改 `admin/index.html`、`admin/js/admin.js` 或 CSS 后直接刷新浏览器即可。

## 重置数据库

初始化 SQL 只在 MySQL 数据卷第一次创建时执行。需要重新灌入测试库时：

```bash
docker compose -f docker-compose.dev.yml down
docker volume rm zf_suixinzhu_mysql_data
docker compose -f docker-compose.dev.yml up --build
```

实际卷名可用 `docker volume ls | grep suixinzhu` 查看。`down -v` 也会删除数据库和 Maven 缓存，通常不建议使用。
