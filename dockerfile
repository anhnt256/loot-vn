# Sử dụng NodeJS base image
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy package trước để cache
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Copy toàn bộ source
COPY . .

# Build (nếu cần, ví dụ NestJS)
# RUN npm run build

# Expose port (ví dụ 3000)
EXPOSE 3000

# Command chạy app
CMD ["npm", "start"]
