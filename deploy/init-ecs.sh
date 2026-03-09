#!/bin/bash
# ECS首次初始化脚本（Ubuntu 22.04）
set -e

# Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Docker Compose (已内置在新版Docker中)

# Nginx (宿主机做SSL终端)
apt update
apt install -y nginx certbot python3-certbot-nginx

# 项目目录
mkdir -p /opt/mold-keeper
cd /opt/mold-keeper
git clone 你的仓库地址 .

# 复制生产环境配置
cp .env.prod .env.prod
# 编辑 .env.prod 填入RDS地址、OSS密钥等

# 复制Nginx配置
cp deploy/nginx-host.conf /etc/nginx/conf.d/mold.conf
# 编辑 /etc/nginx/conf.d/mold.conf 替换域名

# SSL证书（备案通过后执行）
# certbot --nginx -d admin.yourdomain.com -d api.yourdomain.com

# 首次启动
docker compose -f deploy/docker-compose.prod.yml up -d --build

# 数据库迁移 + 种子数据
docker exec mold-server npx prisma migrate deploy
docker exec mold-server npx ts-node prisma/seed.ts

echo "初始化完成"
