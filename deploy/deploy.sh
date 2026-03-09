#!/bin/bash
# ECS部署脚本 - 在ECS服务器上执行
set -e

PROJECT_DIR="/opt/mold-keeper"
cd "$PROJECT_DIR"

git pull origin main

# 构建并重启
docker compose -f deploy/docker-compose.prod.yml build
docker compose -f deploy/docker-compose.prod.yml up -d

# 数据库迁移
docker exec mold-server npx prisma migrate deploy

echo "部署完成"
