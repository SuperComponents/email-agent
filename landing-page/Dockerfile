# Build stage
FROM oven/bun:1-alpine AS builder

# Accept build arguments
ARG BUN_PUBLIC_APP_URL=http://localhost:5173

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Build the application with environment variable
ENV BUN_PUBLIC_APP_URL=$BUN_PUBLIC_APP_URL
RUN bun run build

# Runtime stage
FROM oven/bun:1-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built files from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/src/server.prod.ts ./src/server.prod.ts
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Serve the built files
CMD ["bun", "run", "src/server.prod.ts"] 