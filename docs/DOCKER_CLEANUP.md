# Docker Cleanup Guide

## Quick Cleanup Commands

### Remove Stopped Containers
```bash
docker container prune -f
```

### Remove Dangling Images
```bash
docker image prune -f
```

### Remove All Unused Images
```bash
docker image prune -a -f
```

### Remove Build Cache
```bash
docker builder prune -a -f
```

### Nuclear Option - Remove Everything Unused
```bash
docker system prune -a --volumes -f
```

## Safe Cleanup Workflow

1. **Check what will be removed:**
   ```bash
   docker system df
   ```

2. **Remove stopped containers first:**
   ```bash
   docker container prune -f
   ```

3. **Remove dangling images:**
   ```bash
   docker image prune -f
   ```

4. **Remove build cache:**
   ```bash
   docker builder prune -f
   ```

## Docker Compose Specific

When using Docker Compose, be careful not to remove running services:

```bash
# Check running services
docker compose ps

# Remove only stopped containers for this project
docker compose rm -f

# Rebuild without using cache
docker compose build --no-cache
```

## Disk Space Monitoring

```bash
# Check Docker disk usage
docker system df

# Check detailed image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Find large containers
docker ps -s
```

## Automated Cleanup

Add this to your `.bashrc` or `.zshrc` for a quick cleanup alias:

```bash
alias docker-cleanup='docker container prune -f && docker image prune -f && docker builder prune -f'
```

## Prevention Tips

1. **Use multi-stage builds** - Reduces final image size
2. **Tag your builds** - Avoid creating dangling images
3. **Regular cleanup** - Run cleanup weekly or after major builds
4. **Use .dockerignore** - Prevent large files from being sent to build context

## Warning

The `-a` flag removes ALL unused images, not just dangling ones. This means:
- Images not used by any container will be removed
- You'll need to re-download base images on next build
- Build times will be longer after aggressive cleanup

Always ensure your important containers are running before using aggressive cleanup commands. 