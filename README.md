# Bracket (GoFilm)

Bracket 是一个影视聚合站点项目，包含：

- 前台浏览与播放
- 管理后台（采集源、定时任务、影片、站点配置等）
- Go 服务端 API + 采集任务

当前仓库同时保留了两套前端：

- `web`：**Next.js 新版前端（当前主线）**
- `client`：Vue 旧版前端（历史版本）

---

## 仓库结构

- `web`：Next.js 前端（包含前台与后台页面）
- `server`：Go API 服务、鉴权、采集与定时任务
- `client`：Vue 旧版前端
- `docker-compose.yml`：一键部署（`web + server`）
- `README-Docker.md`：Docker 详细部署说明

---

## 技术栈

### 前端（`web`）

- Next.js (App Router)
- React
- Ant Design
- TypeScript

### 服务端（`server`）

- Gin
- GORM
- Redis
- gocolly（采集）
- robfig/cron（定时任务）

---

## 快速开始（本地开发）

### 1) 启动后端

进入 `server` 目录，先配置环境变量（端口、MySQL、Redis），再运行：

```bash
go run main.go
```

后端需要的关键环境变量：

- `PORT` 或 `LISTENER_PORT`
- `MYSQL_HOST` `MYSQL_PORT` `MYSQL_USER` `MYSQL_PASSWORD` `MYSQL_DBNAME`
- `REDIS_HOST` `REDIS_PORT` `REDIS_PASSWORD` `REDIS_DB`

> 说明：后端启动时会有初始化等待（代码中有短暂 sleep），属正常行为。

### 2) 启动前端（Next.js）

进入 `web` 目录：

```bash
npm install
npm run dev
```

默认开发地址：

- 前端：`http://127.0.0.1:3000`

前端通过 `next.config.ts` 的 rewrite 代理 `/api/*` 请求，请设置：

- `API_URL`（例如 `http://127.0.0.1:3601`）

---

## Docker 部署

项目根目录已提供：

- `Dockerfile`（server）
- `web/Dockerfile`（web）
- `docker-compose.yml`

一键启动：

```bash
docker-compose up --build -d
```

详细部署参数和说明见：`README-Docker.md`

---

## 管理后台

管理后台入口：

- `/manage`

默认初始化账号（首次）：

- 用户名：`admin`
- 密码：`admin`

建议首次登录后立即修改密码。

---

## 常见开发命令

在 `web` 目录：

```bash
npm run dev
npm run build
npm run lint
```

在 `server` 目录：

```bash
go run main.go
```

---

## 说明

- 新功能优先在 `web + server` 迭代。
- `client` 为旧版实现，建议仅作历史参考。
- 如有问题或建议，欢迎提交 Issue。
