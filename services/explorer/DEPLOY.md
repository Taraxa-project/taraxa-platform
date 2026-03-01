# Taraxa Explorer — Deployment Guide

This guide explains how to build and deploy the **Taraxa Explorer** using Docker.

---

## 1. Prerequisites

Ensure the following are installed:

- Docker (20+ recommended)
- Git
- Access to:
  - Taraxa Node RPC endpoint
  - Taraxa Node GraphQL endpoint
  - Indexer endpoint

Example endpoints:

| Service | Example |
|---|---|
| RPC | `http://127.0.0.1:7777` |
| GraphQL | `http://127.0.0.1:9777` |
| API | `http://127.0.0.1:8888` |

---

## 2. Build the Docker Image

From the repository root directory:

```bash
docker build -t taraxa/explorer-frontend:latest -f services/explorer/Dockerfile .
```

This builds the frontend image tagged:
```
taraxa/explorer-frontend:latest
```

---

## 3. Run the Explorer Container

Run the container with required environment variables:

```bash
docker run -it --rm --name explorer \
  -e OVERRIDE_RPC_PROVIDER=http://127.0.0.1:7777 \
  -e OVERRIDE_GRAPHQL=http://127.0.0.1:9777 \
  -e OVERRIDE_API=http://127.0.0.1:8888 \
  -p 8080:80 \
  taraxa/explorer-frontend:latest
```

Open the explorer:
```
http://localhost:8080
```
---

## 4. Environment Variables

The frontend reads configuration from environment variables:
| Variable | Description |
|---|---|
| OVERRIDE_RPC_PROVIDER | Taraxa node RPC endpoint |
| OVERRIDE_GRAPHQL | Taraxa node GraphQL endpoint |
| OVERRIDE_API | Indexer endpoint |

---

## 5. Production Deployment (Recommended)

Run container in detached mode with automatic restart:

```bash
docker run -d --name explorer \
  --restart unless-stopped \
  -e OVERRIDE_RPC_PROVIDER=http://YOUR_RPC_HOST:7777 \
  -e OVERRIDE_GRAPHQL=http://YOUR_GRAPHQL_HOST:9777 \
  -e OVERRIDE_API=https://indexer.mainnet.explorer.taraxa.io \
  -p 8080:80 \
  taraxa/explorer-frontend:latest
```

Check status:
```bash
docker ps
docker logs -f explorer
```

---

## 6. Deploy Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: "3.9"

services:
  explorer:
    image: taraxa/explorer-frontend:latest
    container_name: explorer
    restart: unless-stopped
    ports:
      - "8080:80"
    environment:
      OVERRIDE_RPC_PROVIDER: "http://YOUR_NODE:7777"
      OVERRIDE_GRAPHQL: "http://YOUR_NODE:9777"
      OVERRIDE_API: "http://YOUR_INDEXER:8888"
```

Start deployment:
```bash
docker compose up -d
```

View logs:
```bash
docker compose logs -f
```

---

## 7. Reverse Proxy Setup (Production HTTPS)

In production, place the explorer behind a reverse proxy such as:
- Nginx
- Caddy
- Traefik

Example architecture:
```
Internet → HTTPS Proxy → Explorer (localhost:8080)
```

---

## 8. Useful Docker Commands

### Stop container
```bash
docker stop explorer
```

### Remove container
```bash
docker rm explorer
```

### View logs
```bash
docker logs -f explorer
```

### List running containers
```bash
docker ps
```

---

## 9. Using Prebuilt Images from Docker Hub

The Taraxa Explorer frontend is also available as a **prebuilt Docker image** on Docker Hub:
```
taraxa/explorer-frontend
```

Using the official image removes the need to build the project locally and is the recommended approach for most deployments.

### Pull the Latest Image

```bash
docker pull taraxa/explorer-frontend:latest
```