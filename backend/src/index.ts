import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { AppDataSource } from './data-source.js'
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '5001', 10)

// 中间件
app.use(cors())
// 增加请求体大小限制以支持大文件上传（200MB）
app.use(express.json({ limit: '200mb' }))
app.use(express.urlencoded({ extended: true, limit: '200mb' }))

// 静态资源服务 - 提供图片和视频访问（生产环境建议使用 CDN）
// 如果使用本地存储，图片放在 frontend/public/images 目录，视频放在 frontend/public/videos 目录
// 如果使用 AWS S3，配置 CDN 域名即可
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
app.use('/images', express.static(path.join(__dirname, '../../frontend/public/images')))
app.use('/videos', express.static(path.join(__dirname, '../../frontend/public/videos')))

// 路由
app.use('/api/public', publicRoutes)
app.use('/api/admin', adminRoutes)

// 错误处理
app.use(errorHandler)

// 全局变量存储服务器，以便优雅关闭
let server: any = null

// 优雅关闭函数
async function gracefulShutdown() {
  console.log('\n正在关闭服务器...')
  
  // 关闭服务器
  if (server) {
    return new Promise<void>((resolve) => {
      server.close(() => {
        console.log('HTTP 服务器已关闭')
        resolve()
      })
    })
  }
}

// 清理资源函数
async function cleanup() {
  // 关闭数据库连接
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy()
    console.log('数据库连接已关闭')
  }
}

// 监听进程退出信号
process.on('SIGTERM', async () => {
  await gracefulShutdown()
  await cleanup()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await gracefulShutdown()
  await cleanup()
  process.exit(0)
})

// 启动服务器
AppDataSource.initialize()
  .then(async () => {
    console.log('数据库连接成功')

    // 启动服务器（带重试机制，处理热重载时的端口占用问题）
    const startServer = async (retryCount = 0) => {
      try {
        server = app.listen(PORT, '0.0.0.0', () => {
          console.log(`服务器运行在 http://localhost:${PORT}`)
          console.log(`前端请确保配置的代理地址为: http://localhost:${PORT}`)
        }).on('error', async (err: any) => {
          if (err.code === 'EADDRINUSE') {
            // 开发环境：如果是热重载导致的端口占用，等待后重试
            if (process.env.NODE_ENV !== 'production' && retryCount < 2) {
              console.warn(`⚠️ 端口 ${PORT} 被占用，可能是热重载导致的，等待 2 秒后重试... (${retryCount + 1}/2)`)
              await new Promise(resolve => setTimeout(resolve, 2000))
              await cleanup()
              await startServer(retryCount + 1)
              return
            }
            
            console.error(`❌ 端口 ${PORT} 已被占用！`)
            console.error(`这通常是因为之前的进程还没有完全关闭`)
            console.error(`请执行以下操作：`)
            console.error(`1. 关闭占用端口 ${PORT} 的进程`)
            console.error(`2. 修改环境变量 PORT 使用其他端口（如: PORT=5001 npm run dev）`)
            console.error(`3. 如果修改了端口，请同时更新 frontend/vite.config.ts 中的 proxy target`)
            
            // 清理资源
            await cleanup()
            process.exit(1)
          } else {
            console.error('服务器启动失败:', err)
            await cleanup()
            process.exit(1)
          }
        })
      } catch (error) {
        console.error('启动服务器时出错:', error)
        await cleanup()
        process.exit(1)
      }
    }
    
    await startServer()
  })
  .catch(async (error) => {
    console.error('数据库连接失败:', error)
    await cleanup()
    process.exit(1)
  })

