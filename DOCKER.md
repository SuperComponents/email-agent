# Docker Setup Guide

This guide explains how to build and run the Email Agent Backend using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+ or Docker Desktop
- Docker Compose (included with Docker Desktop)

## Quick Start

### Using Docker Compose (Recommended)

1. **Start the container:**
   ```bash
   docker compose up -d
   ```

2. **View logs:**
   ```bash
   docker compose logs -f
   ```

3. **Stop the container:**
   ```bash
   docker compose down
   ```

### Using Docker CLI

If you prefer using Docker directly:

```bash
# Build the image
docker build -t email-agent-backend -f Dockerfile .

# Run the container
docker run -p 3000:3000 \
  --env-file ./backend/.env \
  --name email-agent-backend \
  email-agent-backend
```

## Environment Variables

The application requires several environment variables. Create a `backend/.env` file with:

```env
# Required
OPENAI_API_KEY=sk-proj-your-key-here
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
STACK_PROJECT_ID=your-project-id
VECTOR_STORE_ID=vs_your_vector_store_id

# Optional
# STACK_SECRET_SERVER_KEY=ssk_your_key
# NODE_ENV=production
# PORT=3000
```

**Important:** 
- Do NOT include quotes around environment variable values in the `.env` file when using Docker.
- Never commit real API keys or credentials to version control.
- The `backend/.env` file should be in your `.gitignore`.

## Docker Compose Commands

### Basic Operations

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# View service status
docker compose ps

# View logs
docker compose logs -f backend
```

### Build and Rebuild

```bash
# Build/rebuild the image
docker compose build

# Force rebuild without cache
docker compose build --no-cache

# Start with rebuild
docker compose up -d --build
```

### Debugging

```bash
# Execute commands in running container
docker compose exec backend sh

# View container health
docker compose ps

# Check resource usage
docker stats email-agent-backend
```

## Health Check

The container includes a health check that verifies the API is responding. You can check the health status with:

```bash
docker compose ps
```

A healthy container will show `(healthy)` in the STATUS column.

## Troubleshooting

### Container won't start

1. Check logs: `docker compose logs backend`
2. Verify `.env` file exists and has no quotes around values
3. Ensure port 3000 is not in use: `lsof -i :3000`

### Database connection errors

1. Verify DATABASE_URL format (no quotes!)
2. Check network connectivity to database
3. Ensure SSL mode is correct for your database

### Module not found errors

1. Rebuild the image: `docker compose build --no-cache`
2. Check that all source files are present
3. Verify the agent module built successfully

## Production Considerations

1. **Security:**
   - Use secrets management for sensitive environment variables
   - Don't commit `.env` files to version control
   - Consider using Docker secrets or environment-specific configs

2. **Performance:**
   - Add resource limits to docker-compose.yml
   - Use multi-stage builds (already implemented)
   - Consider using Alpine-based images for smaller size

3. **Monitoring:**
   - Integrate with logging systems
   - Add metrics collection
   - Set up alerts for health check failures

## Network Configuration

The application runs on port 3000 by default. To change the port:

1. Update docker-compose.yml:
   ```yaml
   ports:
     - "8080:3000"  # Maps host port 8080 to container port 3000
   ```

2. Or use environment variable:
   ```yaml
   ports:
     - "${HOST_PORT:-3000}:3000"
   ```

## Volume Mounts (Development)

For development with hot reload, you can add volume mounts:

```yaml
services:
  backend:
    volumes:
      - ./backend/src:/app/src
      - ./backend/package.json:/app/package.json
    command: npm run dev
```

Note: This requires the development dependencies to be included in the image.