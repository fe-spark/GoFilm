FROM node:20-alpine AS base

WORKDIR /app

# Enable corepack for modern package managers (optional but good practice)
RUN corepack enable

# 1. Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# 2. Copy source code
COPY . .

# 3. Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 4. Expose port and start
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
