import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Product } from '../entities/Product.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'
import path from 'path'

export class ProductController {
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Product)
      // 后端只返回激活状态的产品，前端直接展示
      const products = await repository.find({
        where: { status: 'active' },
        order: { createdAt: 'DESC' },
      })
      res.json(products)
    } catch (error) {
      console.error('Get public products error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Product)
      const product = await repository.findOne({ where: { id: parseInt(id) } })

      if (!product) {
        return res.status(404).json({ message: '产品不存在' })
      }

      res.json(product)
    } catch (error) {
      console.error('Get product by id error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      // 后端处理分页
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
      const skip = (page - 1) * limit

      const repository = AppDataSource.getRepository(Product)
      const [products, total] = await repository.findAndCount({
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      })

      const totalPages = Math.ceil(total / limit)

      res.json({ products, total, page, limit, totalPages })
    } catch (error) {
      console.error('Get all products error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Product)
      
      // 处理上传的图片
      const images: string[] = []
      if (req.files && Array.isArray(req.files)) {
        images.push(...req.files.map((file: any) => `/images/products/${file.filename}`))
      } else if (req.body.images) {
        // 如果通过body传递图片路径（编辑时保留的图片）
        const parsedImages = typeof req.body.images === 'string' 
          ? JSON.parse(req.body.images) 
          : req.body.images
        if (Array.isArray(parsedImages)) {
          images.push(...parsedImages)
        }
      }

      const product = repository.create({
        ...req.body,
        images: images.length > 0 ? images : null,
        exchangeRate: parseFloat(req.body.exchangeRate),
        minAmount: parseFloat(req.body.minAmount),
        maxAmount: parseFloat(req.body.maxAmount),
      })
      const saved = await repository.save(product)
      res.json(saved)
    } catch (error) {
      console.error('Create product error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Product)
      const product = await repository.findOne({ where: { id: parseInt(id) } })

      if (!product) {
        return res.status(404).json({ message: '未找到' })
      }

      // 处理图片
      let images: string[] = product.images || []
      
      // 如果有新上传的图片，添加到列表
      if (req.files && Array.isArray(req.files)) {
        images.push(...req.files.map((file: any) => `/images/products/${file.filename}`))
      } else if (req.body.images) {
        // 如果通过body传递图片路径（保留的图片）
        const parsedImages = typeof req.body.images === 'string' 
          ? JSON.parse(req.body.images) 
          : req.body.images
        if (Array.isArray(parsedImages)) {
          images = parsedImages
        }
      }

      // 删除被移除的图片文件
      const oldImages = product.images || []
      const newImages = images
      const removedImages = oldImages.filter(img => !newImages.includes(img))
      
      for (const imgPath of removedImages) {
        if (imgPath && !imgPath.startsWith('http')) {
          try {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = dirname(__filename)
            const imagePath = imgPath.startsWith('/')
              ? path.join(__dirname, '../../..', 'frontend', 'public', imgPath)
              : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'products', imgPath)
            
            await fs.unlink(imagePath).catch(() => {
              // 文件不存在时忽略错误
            })
            console.log(`✅ 产品图片文件已删除: ${imgPath}`)
          } catch (fileError) {
            console.warn('删除产品图片文件失败:', fileError)
          }
        }
      }

      Object.assign(product, {
        ...req.body,
        images: images.length > 0 ? images : null,
        exchangeRate: req.body.exchangeRate ? parseFloat(req.body.exchangeRate) : product.exchangeRate,
        minAmount: req.body.minAmount ? parseFloat(req.body.minAmount) : product.minAmount,
        maxAmount: req.body.maxAmount ? parseFloat(req.body.maxAmount) : product.maxAmount,
      })
      const saved = await repository.save(product)
      res.json(saved)
    } catch (error) {
      console.error('Update product error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Product)
      const product = await repository.findOne({ where: { id: parseInt(id) } })

      if (!product) {
        return res.status(404).json({ message: '未找到' })
      }

      // 删除关联的图片文件
      const images = product.images || []
      for (const imgPath of images) {
        if (imgPath && !imgPath.startsWith('http')) {
          try {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = dirname(__filename)
            const imagePath = imgPath.startsWith('/')
              ? path.join(__dirname, '../../..', 'frontend', 'public', imgPath)
              : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'products', imgPath)
            
            await fs.unlink(imagePath).catch(() => {
              // 文件不存在时忽略错误
            })
            console.log(`✅ 产品图片文件已删除: ${imgPath}`)
          } catch (fileError) {
            console.warn('删除产品图片文件失败:', fileError)
          }
        }
      }

      await repository.remove(product)
      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete product error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }
}

