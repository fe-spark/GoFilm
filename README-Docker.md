# Bracket Docker 一键部署指南 (Next.js 版本)

本文档说明如何使用 Docker 和 Docker Compose 将升级到 Next.js 版本的 Bracket 前后端服务一键部署到你的服务器或本地环境。

## 环境要求

- [Docker](https://docs.docker.com/get-docker/) (版本 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (版本 1.29+)
- 确保你的宿主机或服务器已经安装并运行了 `MySQL` (3306) 和 `Redis` (6379)。
  > **注意**: 默认部署配置会将后端的 MySQL 和 Redis 指向宿主机（通过 `host.docker.internal`）。如果你有专门的数据库容器，你可以修改 `docker-compose.yml` 中的环境变量直接关联容器名称。

## 文件说明

项目根目录主要提供以下部署依赖：

1. **`docker-compose.yml`**: 编排所有服务的配置文件，包含了 Web 前端容器 (Next.js) 和 API 后端容器 (Go)。
2. **`Dockerfile` (根目录)**: 后端 Go 项目的镜像构建文件。
3. **`web/Dockerfile`**: 前端 Next.js 项目的多阶段独立 (Standalone) 镜像构建文件。

## 部署步骤

### 第一步：准备数据库环境

在启动容器之前，请确保你已经在你的宿主机数据库中导入了相关的结构数据（MySQL 中创建 `FilmSite` 库），并配置好 Redis。

### 第二步：配置环境变量

将项目根目录下的 `.env.example` 复制为 `.env`，并修改为你实际的数据库配置：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件：

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

> **提示**: `host.docker.internal` 用于连接宿主机上的数据库。如果数据库也运行在 Docker 中，可替换为对应的容器名。

### 第三步：一键构建和运行

在项目**根目录**下（即存在 `docker-compose.yml` 的位置），打开终端执行以下命令：

```bash
docker-compose up --build -d
```

该命令将执行以下操作：

1. 解析 `Dockerfile`，下载 Go 环境，编译并构建出后端的镜像。
2. 解析 `web/Dockerfile`，进入 Node.js 多阶段构建，打包 Next.js Standalone 服务。
3. 自动建立内部网络，按照依赖顺序（先启动 API，再启动 Web）将容器以守护进程（后台）的方式跑起来。

### 第三步：访问系统

全部启动成功后，你可以通过浏览器进行访问：

- **前台访问**: `http://你的服务器IP:3000`
- **所有通过前端 `/api/*` 的请求会自动由 Next.js 服务转发给后端的 3601 端口，不需要额外配置 Nginx！**

---

## 常用 Docker Compose 命令

你可以使用以下命令来管理你的容器状态：

**查看运行日志**
排查启动错误（持续追踪输出）：

```bash
docker-compose logs -f
```

**停止服务**
停止正在运行的前后端服务：

```bash
docker-compose stop
```

**停止并销毁容器**
如果你修改了代码需要重新部署，或者想彻底关掉它（不会删除挂载的数据源）：

```bash
docker-compose down
```

**更新代码后重新构建服务**

```bash
# 获取最新代码后
docker-compose build --no-cache
docker-compose up -d
```
