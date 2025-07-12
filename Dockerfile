# Build stage for the agent
# FROM node:22-slim AS build-agent
# COPY ./agent /agent
# WORKDIR /agent
# RUN npm install
# RUN npm run build

# Build stage for agent3
FROM node:22-slim AS build-agent3
COPY ./agent3 /agent3
WORKDIR /agent3
RUN npm install
RUN npm run build

# Build stage for the backend
FROM node:22-slim AS builder
# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Create the parent directory structure
WORKDIR /build

# Copy the agent to the expected relative location
# COPY ./agent ./agent
# Copy the pre-built agent files from the first stage
# COPY --from=build-agent /agent/dist ./agent/dist
# COPY --from=build-agent /agent/node_modules ./agent/node_modules

# Copy agent3 to the expected relative location
COPY ./agent3 ./agent3
# Copy the pre-built agent3 files from the build stage
COPY --from=build-agent3 /agent3/dist ./agent3/dist
COPY --from=build-agent3 /agent3/node_modules ./agent3/node_modules

# Set working directory for backend
WORKDIR /build/backend

# Copy backend package files
COPY ./backend/package*.json ./

# The package.json expects agent at ../agent which is now at /build/agent
RUN npm install --legacy-peer-deps

# Copy source code
COPY ./backend/tsconfig.json ./
COPY ./backend/drizzle.config.ts ./
COPY ./backend/src ./src
COPY ./backend/drizzle ./drizzle

# Build the application
RUN npm run build

# Create production dependencies
RUN npm prune --production

# Replace the symlink with actual files for proresponse-agent and agent3
RUN rm -rf node_modules/agent3 && \
    cp -r ../agent3 node_modules/agent3

# Runtime stage
FROM node:22-slim

# Install runtime dependencies (tini is included in slim images)
RUN apt-get update && apt-get install -y \
    tini \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

# Set working directory
WORKDIR /app

# Copy production dependencies and built application from builder
COPY --from=builder --chown=nodejs:nodejs /build/backend/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /build/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /build/backend/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /build/backend/drizzle.config.ts ./
COPY --from=builder --chown=nodejs:nodejs /build/backend/package.json ./

# Copy and setup entrypoint script
COPY --chown=nodejs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use tini for proper signal handling
ENTRYPOINT ["/usr/bin/tini", "--", "./docker-entrypoint.sh"]
