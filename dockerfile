# Stage 1: Builder
FROM node:20-bookworm AS builder

# Cài openssl (nếu project dùng Prisma cần SSL)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json + lockfile + prisma trước
COPY package*.json ./
COPY prisma ./prisma

# Cài dependencies (nếu có preinstall cũng không lỗi vì prisma đã có)
RUN npm install

# Copy toàn bộ source code
COPY . .

# Build project (Next.js -> tạo .next/)
RUN npm run build


# Stage 2: Production
FROM node:20-bookworm AS production

WORKDIR /app

# Copy node_modules từ builder (đã cài đủ)
COPY --from=builder /app/node_modules ./node_modules

# Copy .next và prisma để runtime có schema
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Chạy app
CMD ["npm", "start"]
