# ---- Stage 1: Build ----
FROM node:20-slim AS builder

# Cài gói cần thiết cho build
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy file package.json và lock để cài dependencies
COPY package*.json ./

# Cài dependencies (bao gồm devDependencies để build)
RUN npm install

# Copy toàn bộ source code TRƯỚC KHI generate Prisma
COPY . .

# Generate Prisma Client (sau khi đã copy source code)
RUN npx prisma generate

# Build NestJS (TS → JS)
RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:20-slim AS runner

# Cài openssl (nếu runtime cần)
RUN apt-get update \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Chỉ copy file package.json & lock để cài dependencies production
COPY package*.json ./

# Cài dependencies production (loại bỏ dev)
RUN npm install --omit=dev

# Copy dist (JS build) và Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "run", "start"]
    