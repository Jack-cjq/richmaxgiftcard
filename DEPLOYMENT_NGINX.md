# Nginx 多站点配置指南

本指南说明如何在已有 Nginx 反向代理的服务器上配置新的 RichMax Gift Card 平台。

## 📋 前置条件

- 已有运行中的 Nginx 服务器
- 域名 `www.richmaxgiftcard.com` 已解析到服务器 IP
- 服务器已安装 Node.js、PostgreSQL、PM2

---

## 🔧 第一步：准备应用文件

### 1.1 克隆或上传项目代码

```bash
# 创建项目目录
sudo mkdir -p /var/www/richmaxgiftcard
sudo chown -R $USER:$USER /var/www/richmaxgiftcard

# 克隆项目（或使用 scp 上传）
cd /var/www/richmaxgiftcard
git clone https://github.com/Jack-cjq/richmaxgiftcard.git .

# 或者使用 scp 从本地上传
# scp -r -i your-key.pem ./giftcardtrade/* ubuntu@your-server-ip:/var/www/richmaxgiftcard/
```

### 1.2 安装依赖

```bash
cd /var/www/richmaxgiftcard

# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install
npm run build

# 安装后端依赖
cd ../backend
npm install
npm run build
```

### 1.3 配置后端环境变量

```bash
cd /var/www/richmaxgiftcard/backend

# 创建 .env 文件
nano .env
```

添加以下内容：

```env
# 服务器配置
PORT=5001
NODE_ENV=production

# JWT 密钥（请使用强密钥）
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_database_password
DB_DATABASE=giftcardtrade

# CORS 配置（可选）
CORS_ORIGIN=https://www.richmaxgiftcard.com
```

### 1.4 初始化数据库

```bash
cd /var/www/richmaxgiftcard/backend

# 创建数据库
sudo -u postgres psql -c "CREATE DATABASE giftcardtrade;"

# 初始化数据
npm run init:admin
npm run init:rates
npm run init:conversion-config
npm run init:social-buttons
```

---

## 🌐 第二步：配置 Nginx

### 2.1 复制 Nginx 配置文件

```bash
# 复制配置文件到 Nginx sites-available 目录
sudo cp /var/www/richmaxgiftcard/nginx/richmaxgiftcard.conf /etc/nginx/sites-available/richmaxgiftcard.conf

# 创建符号链接到 sites-enabled
sudo ln -s /etc/nginx/sites-available/richmaxgiftcard.conf /etc/nginx/sites-enabled/
```

### 2.2 测试 Nginx 配置

```bash
# 测试配置文件语法
sudo nginx -t
```

如果显示 `syntax is ok` 和 `test is successful`，说明配置正确。

### 2.3 安装 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书（Nginx 会自动配置）
sudo certbot --nginx -d www.richmaxgiftcard.com -d richmaxgiftcard.com

# 按照提示输入邮箱地址，同意服务条款
# Certbot 会自动配置 SSL 并更新 Nginx 配置
```

### 2.4 如果手动配置 SSL

如果不想使用 Certbot，可以手动编辑配置文件，注释掉 SSL 相关行，先使用 HTTP：

```bash
sudo nano /etc/nginx/sites-available/richmaxgiftcard.conf
```

临时注释掉 HTTPS server 块，只保留 HTTP server 块用于测试。

### 2.5 重载 Nginx

```bash
# 重载 Nginx 配置
sudo systemctl reload nginx

# 检查 Nginx 状态
sudo systemctl status nginx
```

---

## 🚀 第三步：启动后端服务

### 3.1 使用 PM2 启动后端

```bash
cd /var/www/richmaxgiftcard/backend

# 使用 PM2 启动（使用 ecosystem.config.js）
pm2 start ecosystem.config.js

# 或者直接启动
pm2 start dist/index.js --name richmax-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 3.2 检查服务状态

```bash
# 检查 PM2 进程
pm2 list

# 查看日志
pm2 logs richmax-backend

# 检查后端是否正常运行
curl http://localhost:5001/api/public/social-buttons
```

---

## ✅ 第四步：验证部署

### 4.1 检查前端

访问 `https://www.richmaxgiftcard.com`，应该能看到网站首页。

### 4.2 检查后端 API

```bash
# 测试 API 端点
curl https://www.richmaxgiftcard.com/api/public/social-buttons
```

### 4.3 检查日志

```bash
# Nginx 访问日志
sudo tail -f /var/log/nginx/richmaxgiftcard_access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/richmaxgiftcard_error.log

# 后端日志
pm2 logs richmax-backend
```

---

## 🔍 故障排除

### 问题 1: 502 Bad Gateway

**原因**: 后端服务未启动或端口不正确

**解决**:
```bash
# 检查后端是否运行
pm2 list

# 检查端口是否被占用
sudo netstat -tlnp | grep 5001

# 重启后端
pm2 restart richmax-backend
```

### 问题 2: 403 Forbidden

**原因**: 文件权限问题

**解决**:
```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /var/www/richmaxgiftcard/frontend/dist
sudo chmod -R 755 /var/www/richmaxgiftcard/frontend/dist
```

### 问题 3: SSL 证书错误

**原因**: 证书未正确配置或域名未解析

**解决**:
```bash
# 检查域名解析
nslookup www.richmaxgiftcard.com

# 重新获取证书
sudo certbot renew --dry-run

# 手动更新证书
sudo certbot --nginx -d www.richmaxgiftcard.com -d richmaxgiftcard.com --force-renewal
```

### 问题 4: 静态资源 404

**原因**: 路径配置不正确

**解决**:
```bash
# 检查前端构建文件是否存在
ls -la /var/www/richmaxgiftcard/frontend/dist

# 重新构建前端
cd /var/www/richmaxgiftcard/frontend
npm run build
```

---

## 🔄 更新部署

### 更新代码

```bash
cd /var/www/richmaxgiftcard

# 拉取最新代码
git pull origin main

# 更新前端
cd frontend
npm install
npm run build

# 更新后端
cd ../backend
npm install
npm run build

# 重启后端服务
pm2 restart richmax-backend

# 重载 Nginx（通常不需要）
sudo systemctl reload nginx
```

---

## 📝 配置文件说明

### Nginx 配置要点

1. **前端静态文件**: `/var/www/richmaxgiftcard/frontend/dist`
2. **后端 API 代理**: `http://127.0.0.1:5001`
3. **静态资源**: `/images` 和 `/videos` 目录
4. **SSL 证书**: Let's Encrypt 自动管理

### 端口说明

- **前端**: 由 Nginx 直接提供静态文件，不需要单独端口
- **后端**: 运行在 `5001` 端口（仅本地访问）
- **HTTP**: `80` 端口（重定向到 HTTPS）
- **HTTPS**: `443` 端口

---

## 🔒 安全建议

1. **防火墙配置**: 只开放必要端口（80, 443, 22）
2. **定期更新**: 保持系统和依赖包更新
3. **备份数据库**: 定期备份 PostgreSQL 数据库
4. **监控日志**: 定期检查 Nginx 和 PM2 日志
5. **SSL 证书**: 设置自动续期（Certbot 默认已配置）

---

## 📞 支持

如有问题，请检查：
- Nginx 错误日志: `/var/log/nginx/richmaxgiftcard_error.log`
- 后端日志: `pm2 logs richmax-backend`
- 系统日志: `journalctl -u nginx`

