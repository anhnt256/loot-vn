# Stage 1: Builder
# Use a lightweight base image for building
FROM node:20-slim AS builder

# Install the correct OpenSSL version needed by Prisma
# 'libssl1.1' is the specific package that provides 'libssl.so.1.1'
RUN apt-get update && apt-get install -y libssl1.1 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy dependency files first to leverage Docker's build cache
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies, including devDependencies for Prisma generation
# Use 'npm ci' for a clean, deterministic install
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Generate Prisma Client and build the Next.js application
# The Prisma Query Engine is generated and included in the build output
RUN npx prisma generate && npm run build


# Stage 2: Production
# Use the same lightweight base image for the final production image
FROM node:20-slim AS production

# Set the working directory
WORKDIR /app

# Only copy the essential files needed to run the application
# This keeps the final image as small and secure as possible
# The Prisma Query Engine is already included within the .next directory
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# The Prisma binary target directory is also needed for the runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Expose the port your application listens on
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"]