# 安装和启动指南

## 前置要求

- Node.js 18+ 
- PostgreSQL 12+
- npm 或 yarn

## 安装步骤

### 1. 安装所有依赖

```bash
npm run install:all
```

或者分别安装：

```bash
# 根目录
npm install

# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 2. 配置数据库

1. 创建 PostgreSQL 数据库：

```sql
CREATE DATABASE giftcardtrade;
```

2. 在 `backend` 目录下创建 `.env` 文件（复制 `.env.example`）：

```bash
cd backend
cp .env.example .env
```

3. 编辑 `.env` 文件，修改数据库连接信息：

```env
PORT=5001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-password
DB_DATABASE=giftcardtrade
```

### 3. 初始化数据库和管理员

```bash
cd backend
npm run init:admin
```

这将创建数据库表并创建默认管理员账号：
- 用户名: `admin`
- 密码: `admin123`

**重要**: 首次运行后请立即修改管理员密码！

### 4. 启动开发服务器

在项目根目录运行：

```bash
npm run dev
```

这将同时启动：
- 前端开发服务器: http://localhost:3001
- 后端API服务器: http://localhost:5001

或者分别启动：

```bash
# 终端1 - 前端
npm run dev:frontend

# 终端2 - 后端
npm run dev:backend
```

## 访问地址

- **用户端首页**: http://localhost:3001
- **后台管理**: http://localhost:3001/admin/login
  - 默认账号: `admin`
  - 默认密码: `admin123`

## 常见问题

### 数据库连接失败

- 检查 PostgreSQL 服务是否运行
- 确认 `.env` 文件中的数据库连接信息正确
- 确认数据库已创建

### 端口被占用

- 前端默认端口: 3001，可在 `frontend/vite.config.ts` 修改
- 后端默认端口: 5001，可在 `backend/.env` 修改

### 管理员初始化失败

- 确保数据库已创建
- 检查数据库连接配置
- 查看控制台错误信息

## 生产环境部署

1. 构建项目：

```bash
npm run build
```

2. 设置生产环境变量：

```env
NODE_ENV=production
JWT_SECRET=your-strong-secret-key
# ... 其他配置
```

3. 启动后端服务：

```bash
cd backend
npm start
```

4. 部署前端构建产物（`frontend/dist`）到静态文件服务器

