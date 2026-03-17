# Build Stage
FROM node:20-bookworm AS builder

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

# Copy workspace configuration
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./

# Install dependencies (using --legacy-peer-deps if needed, or just npm ci)
RUN npm ci

# Copy the rest of the source code (must be before prisma generate so schema paths exist)
COPY . .

# Generate Prisma Client for Linux (debian-openssl-3.0.x) so engines are not overwritten by host
RUN npx prisma generate --schema libs/database/prisma/new/schema.prisma && \
    npx prisma generate --schema libs/database/prisma/tenant/schema.prisma && \
    npx prisma generate --schema libs/database/prisma/fnet/schema.prisma

# Argument for the app name to build
ARG APP_NAME
ARG TENANT_PREFIX=""
ARG VITE_API_URL=""
ARG VITE_TENANT_PREFIX=""
ENV APP_NAME=${APP_NAME}
ENV TENANT_PREFIX=${TENANT_PREFIX}
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TENANT_PREFIX=${VITE_TENANT_PREFIX}

# Build the specified application
RUN if [ "$APP_NAME" = "gateway-gaming" ] || [ "$APP_NAME" = "api" ]; then \
      npx nx build ${APP_NAME}; \
    else \
      npx nx build ${APP_NAME} --production; \
    fi

# Production Stage for Node apps (API / Next.js)
FROM node:20-bookworm AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g serve

ARG APP_NAME
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production

# Copy results from builder
COPY --from=builder /app/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Prisma: point to Query Engine next to the API bundle (when APP_NAME=api)
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/dist/apps/api/libquery_engine-debian-openssl-3.0.x.so.node

CMD ["sh", "-c", "if [ -f \"dist/apps/${APP_NAME}/main.js\" ]; then node dist/apps/${APP_NAME}/main.js; else serve -s dist/apps/${APP_NAME} -p ${PORT:-3000}; fi"]
