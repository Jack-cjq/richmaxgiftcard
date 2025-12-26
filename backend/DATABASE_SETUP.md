# 数据库重建指南

## 步骤 1: 创建新数据库

### 方法一：使用 SQL 脚本（推荐）

1. 连接到 PostgreSQL：
```bash
psql -U postgres
```

2. 执行 SQL 脚本：
```sql
\i create-database.sql
```

或者直接在 psql 中执行：
```sql
CREATE DATABASE giftcardtrade
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
```

### 方法二：使用 pgAdmin

1. 打开 pgAdmin
2. 右键点击 "Databases" -> "Create" -> "Database"
3. 数据库名称：`giftcardtrade`
4. 所有者：`postgres`
5. 点击 "Save"

## 步骤 2: 配置环境变量

`.env` 文件已自动创建在 `backend` 目录下，包含以下配置：

```env
# 服务器配置
PORT=5001
NODE_ENV=development

# JWT 密钥（请在生产环境中修改为强密钥）
JWT_SECRET=your-secret-key-change-this-in-production

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=giftcardtrade
```

**重要**：请根据你的实际数据库配置修改 `.env` 文件中的：
- `DB_PASSWORD`：你的 PostgreSQL 密码
- `DB_USERNAME`：如果不是 `postgres`，请修改
- `JWT_SECRET`：生产环境请使用强密钥

## 步骤 3: 初始化数据库

在 `backend` 目录下依次执行以下命令：

```bash
cd backend

# 1. 初始化管理员账户（会自动创建所有数据表）
npm run init:admin

# 2. 初始化汇率数据
npm run init:rates

# 3. 初始化换算配置
npm run init:conversion-config

# 4. 初始化社交按钮配置
npm run init:social-buttons

# 5. （可选）初始化示例交易记录
npm run init:trades

# 6. （可选）初始化视频表
npm run init:videos
```

## 步骤 4: 验证数据库

启动后端服务器，检查是否连接成功：

```bash
npm run dev
```

如果看到 "数据库连接成功" 的提示，说明配置正确。

## 默认管理员账号

初始化后，默认管理员账号为：
- **用户名**: `admin`
- **密码**: `admin123`

**⚠️ 重要**：首次登录后请立即修改密码！

## 数据库表结构

系统会自动创建以下数据表：
- `admin` - 管理员账户
- `exchange_rate` - 汇率
- `product` - 产品
- `trade` - 交易记录
- `content` - 内容配置
- `supported_card` - 支持的卡片
- `carousel` - 轮播图
- `system_config` - 系统配置
- `conversion_config` - 换算配置
- `company_image` - 公司图片
- `video` - 视频
- `social_button` - 社交按钮

## 故障排除

### 数据库连接失败

1. 检查 PostgreSQL 服务是否运行：
```bash
# Windows
Get-Service postgresql*

# Linux/Mac
sudo systemctl status postgresql
```

2. 检查数据库是否存在：
```sql
\l
```

3. 检查 `.env` 文件中的配置是否正确

4. 检查数据库用户权限：
```sql
GRANT ALL PRIVILEGES ON DATABASE giftcardtrade TO postgres;
```

### 端口被占用

如果 5001 端口被占用，可以修改 `.env` 文件中的 `PORT` 值。

### 表已存在错误

如果遇到表已存在的错误，可以：
1. 删除数据库重新创建
2. 或者使用迁移脚本（生产环境推荐）

