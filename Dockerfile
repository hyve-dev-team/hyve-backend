# Use the official Bun image
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Stage 1: Install dependencies
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Stage 2: Generate Prisma Client
FROM base AS builder
# Copy dependencies from install stage
COPY --from=install /usr/src/app/node_modules ./node_modules
# Copy package.json, configuration files, and database schema
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
# Generate the Prisma Client using the prisma schema
RUN bun run db:generate

# Stage 3: Production runner
FROM base AS runner
# Set node environment to production
ENV NODE_ENV=production

# Copy dependencies and generated prisma client from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma
# Copy the rest of the application source code
COPY src ./src
# Copy the generated Prisma Client from the builder stage
COPY --from=builder /usr/src/app/src/generated/prisma ./src/generated/prisma
COPY package.json bun.lock tsconfig.json prisma.config.ts ./

# Expose port (default 3000)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
