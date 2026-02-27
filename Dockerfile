# ---- Build Stage ----
FROM golang:1.22-alpine AS builder

ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64 \
    GOPROXY=https://goproxy.io,direct

WORKDIR /opt/server

# 先复制依赖声明并下载（独立缓存层，代码变动不会重新下载）
COPY ./server/go.mod ./server/go.sum ./
RUN go mod download

# 再复制源码并编译
ADD ./server .

RUN go build -o main main.go

# ---- Production Stage ----
FROM scratch

LABEL maintainer="spark"

ENV TZ=Asia/Shanghai

WORKDIR /app

COPY --from=builder /opt/server/main .

EXPOSE 3601

CMD ["./main"]