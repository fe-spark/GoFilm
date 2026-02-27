# ---- Build Stage ----
FROM golang:1.22-alpine AS builder

ENV GO111MODULE=auto \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64

WORKDIR /opt/server

ADD ./server /opt/server

RUN go build -o main main.go

# ---- Production Stage ----
FROM scratch

LABEL maintainer="spark"

ENV TZ=Asia/Shanghai

WORKDIR /app

COPY --from=builder /opt/server/main .

EXPOSE 3601

CMD ["./main"]