# syntax = docker/dockerfile:1
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
RUN npm install -g pnpm@latest

# Dependencies stage
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source files
COPY package.json ./
COPY tsconfig.json ./
COPY bot.ts ./
COPY server.ts ./

EXPOSE 3000
CMD ["npx", "tsx", "server.ts"]
