# Stage 1: Builder
FROM node:20-bookworm AS builder

# Cài openssl (nếu project dùng Prisma cần SSL) + tzdata để set timezone
RUN apt-get update \
    && apt-get install -y openssl tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json + lockfile + prisma trước để tận dụng cache layer
COPY package*.json ./
COPY prisma ./prisma

# Cài dependencies
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build project (Next.js)
RUN npm run build


# Stage 2: Production
FROM node:20-bookworm AS production

# Cài tzdata để set timezone (nếu muốn container độc lập với host)
RUN apt-get update \
    && apt-get install -y tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy node_modules và build output từ builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Env mặc định
ENV NODE_ENV=production
ENV TZ=Asia/Ho_Chi_Minh

# Expose port (nếu cần)
EXPOSE 3000

# Chạy app
CMD ["npm", "start"]
