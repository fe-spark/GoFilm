# Bracket Docker 一键部署指南 (Next.js 版本)

本文档说明如何使用 Docker 和 Docker Compose 将 Bracket 前后端服务一键部署到你的服务器或本地环境。

## 环境要求

- [Docker](https://docs.docker.com/get-docker/) (版本 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (版本 2.0+)
- 宿主机已安装并运行 `MySQL` 和 `Redis`
  > **注意**: 默认通过 `host.docker.internal` 连接宿主机数据库。如果数据库也运行在 Docker 中，可在 `.env` 中替换为对应的容器名。

## 文件说明

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | 服务编排配置，包含 Web 前端 (Next.js) 和 API 后端 (Go) |
| `Dockerfile` | 后端 Go 项目镜像构建文件 |
| `web/Dockerfile` | 前端 Next.js 项目镜像构建文件 |
| `.env.example` | 环境变量模板 |
| `.dockerignore` | 根目录构建忽略规则 |
| `web/.dockerignore` | Web 构建忽略规则 |

## 部署步骤

### 第一步：准备数据库环境

确保 MySQL 中已创建 `FilmSite` 数据库，Redis 已启动。

### 第二步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写实际的数据库配置：

```env
PORT=3601

MYSQL_HOST=host.docker.internal
MYSQL_PORT=3306
MYSQL_USER=film
MYSQL_PASSWORD=你的数据库密码
MYSQL_DBNAME=FilmSite

REDIS_HOST=host.docker.internal
REDIS_PORT=6379
REDIS_PASSWORD=你的Redis密码
REDIS_DB=0
```

### 第三步：构建和运行

```bash
# 一键构建并启动（后台运行）
docker compose up --build -d
```

> **低配服务器提示**: 如果构建时卡住或 OOM，建议串行构建：
> ```bash
> docker compose build film && docker compose build web
> docker compose up -d
> ```

构建流程：
1. `Dockerfile` — 下载 Go 依赖并编译后端二进制
2. `web/Dockerfile` — 安装 npm 依赖并构建 Next.js 应用
3. 自动建立内部网络，按依赖顺序启动（API 健康检查通过后再启动 Web）

### 第四步：访问系统

- **前台**: `http://你的服务器IP:3000`
- **管理后台**: `http://你的服务器IP:3000/manage`
- 前端 `/api/*` 请求自动转发给后端，无需额外配置 Nginx

---

## 常用命令

```bash
# 查看运行日志
docker compose logs -f

# 查看单个服务日志
docker compose logs -f web
docker compose logs -f film

# 停止服务
docker compose stop

# 停止并销毁容器
docker compose down

# 更新代码后重新构建
docker compose build --no-cache
docker compose up -d
```
