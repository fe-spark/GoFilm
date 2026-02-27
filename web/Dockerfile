# ---- Build Stage ----
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# 构建时需要 API_URL 以生成 rewrites 规则（由 docker-compose.yml 传入）
ARG API_URL
ENV API_URL=${API_URL}
RUN npm run build

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
