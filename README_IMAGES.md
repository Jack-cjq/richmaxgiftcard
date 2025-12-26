# 图片存储配置说明

## 📁 图片存储位置

### 方案一：本地存储（适合开发和小型项目）

**目录结构：**
```
frontend/
  └── public/
      └── images/
          └── cards/
              ├── xbox.png
              ├── itunes.png
              ├── steam.png
              └── ...
```

**使用方法：**
1. 将卡片 Logo 图片放在 `frontend/public/images/cards/` 目录
2. 在后台管理中添加卡片时，Logo URL 填写：`/images/cards/xbox.png`
3. Vite 会自动处理 public 目录中的静态资源

**优点：**
- 简单直接，无需额外配置
- 适合开发环境和小型项目

**缺点：**
- 图片会打包到前端构建产物中，增加构建体积
- 不适合大量图片

---

### 方案二：AWS S3 + CloudFront（推荐生产环境）

**架构：**
```
用户请求 → CloudFront CDN → S3 存储桶
```

**配置步骤：**

1. **创建 S3 存储桶**
   ```bash
   # 在 AWS 控制台创建 S3 存储桶
   # 例如：giftcard-images
   # 启用静态网站托管
   ```

2. **配置 CloudFront 分发**
   - 创建 CloudFront 分发，指向 S3 存储桶
   - 配置自定义域名（可选）
   - 例如：`https://cdn.yourdomain.com`

3. **上传图片到 S3**
   ```bash
   # 使用 AWS CLI 上传
   aws s3 cp xbox.png s3://giftcard-images/cards/xbox.png
   ```

4. **在后台管理中使用**
   - Logo URL 填写：`https://cdn.yourdomain.com/cards/xbox.png`
   - 或使用环境变量配置 CDN 域名

**优点：**
- 高性能 CDN 加速
- 可扩展性强
- 降低服务器负载
- 支持图片优化和缓存

**缺点：**
- 需要 AWS 账号和配置
- 有存储和流量费用

---

### 方案三：后端静态资源服务（适合中型项目）

**目录结构：**
```
backend/
  └── public/
      └── images/
          └── cards/
              ├── xbox.png
              └── ...
```

**配置：**
后端已配置静态资源服务：
```typescript
app.use('/images', express.static('public/images'))
```

**使用方法：**
1. 将图片放在 `backend/public/images/cards/` 目录
2. Logo URL 填写：`/images/cards/xbox.png`（相对路径）
3. 或完整 URL：`http://your-domain.com/images/cards/xbox.png`

**优点：**
- 统一管理，便于权限控制
- 可以添加图片上传接口

**缺点：**
- 增加后端服务器负载
- 需要配置反向代理

---

## 🚀 AWS 部署推荐配置

### 1. 使用 S3 + CloudFront（最佳实践）

**环境变量配置：**
```env
# .env
CDN_BASE_URL=https://cdn.yourdomain.com
# 或
CDN_BASE_URL=https://d1234567890.cloudfront.net
```

**代码中使用：**
```typescript
// 在组件中
const logoUrl = card.logoUrl?.startsWith('http') 
  ? card.logoUrl 
  : `${import.meta.env.VITE_CDN_BASE_URL || ''}${card.logoUrl}`
```

### 2. 图片上传接口（可选）

如果需要通过后台上传图片，可以添加：

**后端路由：**
```typescript
// 使用 multer 处理文件上传
router.post('/admin/upload', upload.single('image'), (req, res) => {
  // 上传到 S3 或本地存储
  // 返回图片 URL
})
```

---

## 📝 当前配置

当前项目已配置：
- ✅ 前端 `public/images` 目录（Vite 自动处理）
- ✅ 后端静态资源服务 `/images` 路由

**推荐做法：**
1. **开发环境**：使用 `frontend/public/images/cards/` 目录
2. **生产环境**：使用 AWS S3 + CloudFront CDN

---

## 🔧 快速开始

### 本地开发：
1. 将图片放在 `frontend/public/images/cards/` 目录
2. 后台添加卡片时，Logo URL 填写：`/images/cards/图片名.png`
3. 图片会自动可用

### AWS 部署：
1. 创建 S3 存储桶和 CloudFront 分发
2. 上传图片到 S3
3. 后台添加卡片时，Logo URL 填写完整 CDN URL
4. 或配置环境变量，使用相对路径自动拼接 CDN 域名

