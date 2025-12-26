import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 配置存储：保存到 frontend/public/images/company/ 目录
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'company')
    
    // 确保目录存在
    try {
      await fs.mkdir(uploadPath, { recursive: true })
    } catch (error) {
      console.error('创建上传目录失败:', error)
      return cb(new Error('无法创建上传目录'), uploadPath)
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：时间戳 + 原始文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    // 清理文件名，只保留字母数字和连字符
    const cleanName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`)
  },
})

// 文件过滤器：只允许图片
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件（jpeg, jpg, png, gif, webp, svg）'))
  }
}

// 配置 multer
export const uploadCompanyImage = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB 限制
  },
  fileFilter,
})

