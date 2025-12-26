# AWS 服务器部署指南

本指南将帮助你将礼品卡兑换平台部署到 AWS EC2 服务器上。

## 📋 前置要求

- AWS 账户
- EC2 实例（推荐：Ubuntu 22.04 LTS，至少 2GB RAM）
- 域名（可选，用于 SSL）
- 基本 Linux 命令行知识

---

## 🚀 第一步：准备 EC2 实例

### 1.1 创建 EC2 实例

1. 登录 AWS Console
2. 进入 EC2 服务
3. 启动实例，选择：
   - **AMI**: Ubuntu Server 22.04 LTS
   - **实例类型**: t3.small 或更高（至少 2GB RAM）
   - **安全组**: 开放以下端口
     - `22` (SSH)
     - `80` (HTTP)
     - `443` (HTTPS)
     - `5000` (后端 API，可选，如果使用 Nginx 反向代理则不需要)

### 1.2 连接到服务器

```bash
# 使用 SSH 连接到服务器
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

## 🔧 第二步：服务器环境配置

### 2.1 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 安装 Node.js (使用 NodeSource)

```bash
# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应该显示 v20.x.x
npm --version
```

### 2.3 安装 PostgreSQL

```bash
# 安装 PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# 启动 PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 设置 PostgreSQL 密码
sudo -u postgres psql
```

在 PostgreSQL 命令行中：

```sql
ALTER USER postgres PASSWORD 'your_secure_password';
CREATE DATABASE giftcard_db;
\q
```

### 2.4 安装 Nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2.5 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2
```

---

## 📦 第三步：部署应用代码

### 3.1 克隆项目到服务器

```bash
# 在服务器上创建应用目录
cd /var/www
sudo mkdir giftcardsellsystem
sudo chown ubuntu:ubuntu giftcardsellsystem
cd giftcardsellsystem

# 如果使用 Git
git clone https://github.com/your-username/giftcardsellsystem.git .

# 或者使用 scp 上传项目文件
# 在本地执行：
# scp -r -i your-key.pem ./giftcardsellsystem ubuntu@your-ec2-ip:/var/www/
```

### 3.2 安装依赖

```bash
cd /var/www/giftcardsellsystem

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

---

## ⚙️ 第四步：配置环境变量

### 4.1 后端环境变量

创建 `backend/.env` 文件：

```bash
cd /var/www/giftcardsellsystem/backend
nano .env
```

添加以下内容：

```env
# 服务器配置
PORT=5000
NODE_ENV=production

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=giftcard_db

# JWT 密钥（生成一个随机字符串）
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars

# CORS 配置
CORS_ORIGIN=http://your-domain.com,https://your-domain.com

# 文件上传配置
UPLOAD_DIR=./public/images
MAX_FILE_SIZE=5242880
```

### 4.2 前端环境变量（如果需要）

如果前端需要配置 API 地址，创建 `frontend/.env.production`：

```env
VITE_API_URL=http://your-domain.com/api
```

---

## 🗄️ 第五步：初始化数据库

```bash
cd /var/www/giftcardsellsystem/backend

# 初始化管理员账户
npm run init:admin

# 初始化汇率数据
npm run init:rates

# 初始化转换配置
npm run init:conversion-config
```

---

## 🔄 第六步：配置 PM2 启动后端

### 6.1 创建 PM2 配置文件

```bash
cd /var/www/giftcardsellsystem/backend
nano ecosystem.config.js
```

添加以下内容：

```javascript
export default {
  apps: [{
    name: 'giftcard-backend',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
}
```

### 6.2 启动后端服务

```bash
# 创建日志目录
mkdir -p logs

# 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 执行输出的命令（通常是 sudo env PATH=...）
```

---

## 🌐 第七步：配置 Nginx

### 7.1 配置前端静态文件

```bash
sudo nano /etc/nginx/sites-available/giftcard
```

添加以下配置：

```nginx
# 前端静态文件服务
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # 前端构建文件
    root /var/www/giftcardsellsystem/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # 前端路由支持（React Router）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理到后端
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 上传文件访问
    location /images {
        alias /var/www/giftcardsellsystem/backend/public/images;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 7.2 启用站点

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/giftcard /etc/nginx/sites-enabled/

# 删除默认配置（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

## 🔒 第八步：配置 SSL 证书（可选但推荐）

### 8.1 安装 Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 8.2 获取 SSL 证书

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

按照提示操作，Certbot 会自动配置 Nginx。

### 8.3 自动续期

Certbot 会自动设置定时任务，但可以手动测试：

```bash
sudo certbot renew --dry-run
```

---

## 📁 第九步：文件权限配置

```bash
# 设置正确的文件权限
sudo chown -R ubuntu:ubuntu /var/www/giftcardsellsystem
chmod -R 755 /var/www/giftcardsellsystem

# 确保上传目录可写
chmod -R 775 /var/www/giftcardsellsystem/backend/public/images
```

---

## 🔄 第十步：设置自动备份（推荐）

### 10.1 创建备份脚本

```bash
nano /home/ubuntu/backup.sh
```

添加以下内容：

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="giftcard_db"
DB_USER="postgres"

mkdir -p $BACKUP_DIR

# 备份数据库
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# 备份上传的文件
tar -czf $BACKUP_DIR/images_backup_$DATE.tar.gz /var/www/giftcardsellsystem/backend/public/images

# 删除 7 天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

### 10.2 设置定时任务

```bash
chmod +x /home/ubuntu/backup.sh
crontab -e
```

添加：

```
# 每天凌晨 2 点备份
0 2 * * * /home/ubuntu/backup.sh
```

---

## 🚀 第十一步：启动和测试

### 11.1 检查服务状态

```bash
# 检查 PM2 状态
pm2 status

# 检查 Nginx 状态
sudo systemctl status nginx

# 检查 PostgreSQL 状态
sudo systemctl status postgresql
```

### 11.2 查看日志

```bash
# 后端日志
pm2 logs giftcard-backend

# Nginx 日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 11.3 测试访问

- 访问 `http://your-domain.com` 查看前端
- 访问 `http://your-domain.com/api/health` 测试后端 API

---

## 🔧 常用维护命令

### 更新代码

```bash
cd /var/www/giftcardsellsystem

# 拉取最新代码
git pull

# 重新构建前端
cd frontend
npm install
npm run build

# 重新构建后端
cd ../backend
npm install
npm run build

# 重启后端
pm2 restart giftcard-backend

# 重新加载 Nginx
sudo nginx -s reload
```

### 查看服务状态

```bash
# PM2 监控
pm2 monit

# 查看所有服务
pm2 list
```

### 重启服务

```bash
# 重启后端
pm2 restart giftcard-backend

# 重启 Nginx
sudo systemctl restart nginx

# 重启 PostgreSQL
sudo systemctl restart postgresql
```

---

## 🐛 故障排查

### 后端无法启动

1. 检查环境变量：`cat backend/.env`
2. 检查数据库连接
3. 查看 PM2 日志：`pm2 logs giftcard-backend`
4. 检查端口占用：`sudo netstat -tulpn | grep 5000`

### 前端无法访问

1. 检查 Nginx 配置：`sudo nginx -t`
2. 检查文件权限
3. 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

### 数据库连接失败

1. 检查 PostgreSQL 是否运行：`sudo systemctl status postgresql`
2. 检查数据库配置：`sudo -u postgres psql -c "\l"`
3. 检查防火墙规则

---

## 📝 安全建议

1. **防火墙配置**：只开放必要端口
2. **定期更新**：`sudo apt update && sudo apt upgrade`
3. **使用强密码**：数据库、JWT 密钥等
4. **限制 SSH 访问**：使用密钥认证，禁用密码登录
5. **定期备份**：数据库和文件
6. **监控日志**：定期检查异常访问

---

## 🎉 完成！

你的应用现在应该已经成功部署到 AWS 服务器上了！

如有问题，请检查日志文件或联系技术支持。

