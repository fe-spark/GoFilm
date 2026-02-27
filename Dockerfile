# ---- Build Stage ----
FROM golang:1.20-alpine AS builder

ENV GO111MODULE=auto \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /opt/server

ADD ./server /opt/server

RUN go build -o main main.go

# ---- Production Stage ----
FROM alpine:3.19

LABEL maintainer="spark"

# CA 证书（爬虫 HTTPS 请求需要）+ 时区（定时任务需要）
RUN apk add --no-cache ca-certificates tzdata

ENV TZ=Asia/Shanghai

WORKDIR /app

COPY --from=builder /opt/server/main .

EXPOSE 3601

CMD ["./main"]