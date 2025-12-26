# 礼品卡兑换平台

一个清爽极简的北欧白茶风格礼品卡引流售卖网站，包含用户端展示和后台管理系统。

## 技术栈

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS
- GSAP (动画)
- React Router
- Axios

### 后端
- Node.js + TypeScript
- Express.js
- TypeORM
- PostgreSQL
- JWT 认证

## 项目结构

```
giftcardsellsystem/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── pages/    # 页面组件
│   │   ├── components/ # 通用组件
│   │   ├── api/       # API 服务
│   │   └── hooks/     # 自定义 Hooks
│   └── ...
├── backend/           # 后端项目
│   ├── src/
│   │   ├── entities/  # 数据库实体
│   │   ├── controllers/ # 控制器
│   │   ├── routes/    # 路由
│   │   └── middleware/ # 中间件
│   └── ...
└── package.json       # 根目录配置
```

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置数据库

1. 创建 PostgreSQL 数据库
2. 复制 `backend/.env.example` 为 `backend/.env`
3. 修改数据库连接信息

### 3. 初始化数据库和管理员

```bash
cd backend
npm run init:admin
npm run init:rates  # 初始化默认货币汇率（美元、人民币、奈拉、BTC、GHC）
```

默认管理员账号：
- 用户名: `admin`
- 密码: `admin123`

默认货币汇率：
- 美元 (USD)
- 人民币 (CNY)
- 奈拉 (NGN)
- 比特币 (BTC)
- 加纳塞地 (GHC)

### 4. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端: http://localhost:3001
npm run dev:backend  # 后端: http://localhost:5001
```

## 功能特性

### 用户端
- ✅ 实时汇率显示
- ✅ 兑换大厅（产品展示）
- ✅ 最新成交记录
- ✅ 成交记录列表页
- ✅ 流程说明
- ✅ 安全保障说明
- ✅ 帮助中心（FAQ）

### 后台管理
- ✅ 管理员登录
- ✅ 仪表盘（统计数据）
- ✅ 汇率管理
- ✅ 产品管理
- ✅ 交易记录管理
- ✅ 内容管理（首页文案、FAQ等）

## 设计风格

- **主背景**: 高亮白 + 暖调
- **辅助背景**: 茶白色
- **主色**: 柔和茶绿
- **按钮**: 轻绿 + 橙色点缀
- **数值**: 柔和红绿（涨跌显示）
- **整体气质**: 北欧风、植物风、自然风、治愈系

## API 接口

### 公开接口 (`/api/public`)
- `GET /exchange-rates` - 获取汇率
- `GET /products` - 获取产品列表
- `GET /trades` - 获取交易记录
- `GET /content` - 获取内容配置

### 管理接口 (`/api/admin`)
- `POST /login` - 管理员登录
- `GET /stats` - 获取统计数据
- 汇率、产品、交易、内容管理的 CRUD 接口

## 开发说明

### 添加新的 API 接口

1. 在 `backend/src/entities/` 创建实体
2. 在 `backend/src/controllers/` 创建控制器
3. 在 `backend/src/routes/` 添加路由
4. 在前端 `src/api/services.ts` 添加 API 调用

### 样式定制

修改 `frontend/tailwind.config.js` 中的颜色配置来调整主题色。

## 生产部署

### 构建

```bash
npm run build
```

### 环境变量

确保在生产环境中设置正确的环境变量：
- `NODE_ENV=production`
- `JWT_SECRET` (使用强密钥)
- 数据库连接信息

## 许可证

MIT

