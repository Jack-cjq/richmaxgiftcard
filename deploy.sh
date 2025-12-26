#!/bin/bash

# AWS 部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即退出

echo "🚀 开始部署礼品卡兑换平台到 AWS..."

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否在服务器上
if [ ! -f "/etc/os-release" ]; then
    echo -e "${RED}错误: 此脚本需要在服务器上运行${NC}"
    exit 1
fi

# 更新系统
echo -e "${YELLOW}📦 更新系统包...${NC}"
sudo apt update && sudo apt upgrade -y

# 安装 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 安装 Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}✓ Node.js 已安装${NC}"
fi

# 安装 PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}📦 安装 PostgreSQL...${NC}"
    sudo apt install postgresql postgresql-contrib -y
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
else
    echo -e "${GREEN}✓ PostgreSQL 已安装${NC}"
fi

# 安装 Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}📦 安装 Nginx...${NC}"
    sudo apt install nginx -y
    sudo systemctl start nginx
    sudo systemctl enable nginx
else
    echo -e "${GREEN}✓ Nginx 已安装${NC}"
fi

# 安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 安装 PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}✓ PM2 已安装${NC}"
fi

# 创建应用目录
APP_DIR="/var/www/giftcardsellsystem"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}📁 创建应用目录...${NC}"
    sudo mkdir -p $APP_DIR
    sudo chown -R $USER:$USER $APP_DIR
fi

echo -e "${GREEN}✅ 环境准备完成！${NC}"
echo ""
echo -e "${YELLOW}接下来的步骤：${NC}"
echo "1. 将项目文件上传到 $APP_DIR"
echo "2. 配置 backend/.env 文件"
echo "3. 运行: cd $APP_DIR && npm install"
echo "4. 运行: cd $APP_DIR/frontend && npm install && npm run build"
echo "5. 运行: cd $APP_DIR/backend && npm install && npm run build"
echo "6. 初始化数据库: cd $APP_DIR/backend && npm run init:admin && npm run init:rates"
echo "7. 启动服务: pm2 start $APP_DIR/backend/ecosystem.config.js"
echo "8. 配置 Nginx（参考 DEPLOYMENT_AWS.md）"
echo ""
echo -e "${GREEN}详细说明请查看 DEPLOYMENT_AWS.md${NC}"

