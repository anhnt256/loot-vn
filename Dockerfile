# ─── Stage 1: Shared Builder ─────────────────────────────────────────────────
# Install deps, generate Prisma, build ALL apps ONCE
FROM node:20-bookworm AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json .npmrc ./
COPY nx.json ./
COPY tsconfig.base.json ./

RUN npm ci

COPY . .

RUN npx prisma generate --schema libs/database/prisma/new/schema.prisma && \
    npx prisma generate --schema libs/database/prisma/tenant/schema.prisma && \
    npx prisma generate --schema libs/database/prisma/fnet/schema.prisma

ARG VITE_API_URL=""
ARG VITE_TENANT_PREFIX=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_TENANT_PREFIX=${VITE_TENANT_PREFIX}

RUN npx nx run-many --target=build --projects=api,admin,client,hr,hr-manager,master --configuration=production --parallel=6

# ─── Stage 2: Runner Base ────────────────────────────────────────────────────
FROM node:20-bookworm AS runner-base

WORKDIR /app

RUN apt-get update && apt-get install -y \
    openssl \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g serve

ENV NODE_ENV=production

# ─── API Runner ──────────────────────────────────────────────────────────────
FROM runner-base AS api
COPY --from=builder /app/dist/apps/api ./dist/apps/api
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/images ./apps/api/images
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/dist/apps/api/libquery_engine-debian-openssl-3.0.x.so.node
CMD ["node", "dist/apps/api/main.js"]

# ─── Admin Runner ────────────────────────────────────────────────────────────
FROM runner-base AS admin
COPY --from=builder /app/dist/apps/admin ./dist/apps/admin
CMD ["sh", "-c", "serve -s dist/apps/admin -p ${PORT:-3000}"]

# ─── Master Runner ───────────────────────────────────────────────────────────
FROM runner-base AS master
COPY --from=builder /app/dist/apps/master ./dist/apps/master
CMD ["sh", "-c", "serve -s dist/apps/master -p ${PORT:-3000}"]

# ─── HR Runner ───────────────────────────────────────────────────────────────
FROM runner-base AS hr
COPY --from=builder /app/dist/apps/hr ./dist/apps/hr
CMD ["sh", "-c", "serve -s dist/apps/hr -p ${PORT:-3000}"]

# ─── Client Runner ───────────────────────────────────────────────────────────
FROM runner-base AS client
COPY --from=builder /app/dist/apps/client-app ./dist/apps/client-app
CMD ["sh", "-c", "serve -s dist/apps/client-app -p ${PORT:-3000}"]

# ─── HR Manager Runner ──────────────────────────────────────────────────────
FROM runner-base AS hr-manager
COPY --from=builder /app/dist/apps/hr-manager ./dist/apps/hr-manager
CMD ["sh", "-c", "serve -s dist/apps/hr-manager -p ${PORT:-3000}"]
