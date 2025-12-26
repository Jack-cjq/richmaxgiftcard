#!/bin/bash

# RichMax Gift Card Platform - Nginx 部署脚本
# 用于在已有 Nginx 服务器上快速部署新站点

set -e

echo "=========================================="
echo "RichMax Gift Card Platform - Nginx 部署"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/var/www/richmaxgiftcard"
DOMAIN="www.richmaxgiftcard.com"
BACKEND_PORT=5001
NGINX_CONFIG="/etc/nginx/sites-available/richmaxgiftcard.conf"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 1: 检查项目目录...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录不存在: $PROJECT_DIR${NC}"
    echo "请先克隆或上传项目代码到该目录"
    exit 1
fi
echo -e "${GREEN}✓ 项目目录存在${NC}"

echo ""
echo -e "${YELLOW}步骤 2: 复制 Nginx 配置文件...${NC}"
if [ -f "$PROJECT_DIR/nginx/richmaxgiftcard.conf" ]; then
    cp "$PROJECT_DIR/nginx/richmaxgiftcard.conf" "$NGINX_CONFIG"
    echo -e "${GREEN}✓ 配置文件已复制${NC}"
else
    echo -e "${RED}错误: 找不到 Nginx 配置文件${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}步骤 3: 创建符号链接...${NC}"
if [ ! -L "/etc/nginx/sites-enabled/richmaxgiftcard.conf" ]; then
    ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/richmaxgiftcard.conf
    echo -e "${GREEN}✓ 符号链接已创建${NC}"
else
    echo -e "${YELLOW}⚠ 符号链接已存在，跳过${NC}"
fi

echo ""
echo -e "${YELLOW}步骤 4: 测试 Nginx 配置...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"
else
    echo -e "${RED}✗ Nginx 配置测试失败${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}步骤 5: 检查 SSL 证书...${NC}"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}✓ SSL 证书已存在${NC}"
else
    echo -e "${YELLOW}⚠ SSL 证书不存在，将使用 HTTP 配置${NC}"
    echo "请运行以下命令获取 SSL 证书:"
    echo "  sudo certbot --nginx -d $DOMAIN -d richmaxgiftcard.com"
fi

echo ""
echo -e "${YELLOW}步骤 6: 重载 Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx 已重载${NC}"

echo ""
echo -e "${YELLOW}步骤 7: 检查后端服务...${NC}"
if pm2 list | grep -q "richmax-backend"; then
    echo -e "${GREEN}✓ 后端服务正在运行${NC}"
else
    echo -e "${YELLOW}⚠ 后端服务未运行${NC}"
    echo "请运行以下命令启动后端:"
    echo "  cd $PROJECT_DIR/backend"
    echo "  pm2 start ecosystem.config.js"
    echo "  pm2 save"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "部署完成！"
echo "==========================================${NC}"
echo ""
echo "访问地址: https://$DOMAIN"
echo ""
echo "下一步操作:"
echo "1. 如果还没有 SSL 证书，运行: sudo certbot --nginx -d $DOMAIN -d richmaxgiftcard.com"
echo "2. 检查后端服务: pm2 list"
echo "3. 查看日志: pm2 logs richmax-backend"
echo "4. 查看 Nginx 日志: sudo tail -f /var/log/nginx/richmaxgiftcard_error.log"
echo ""

