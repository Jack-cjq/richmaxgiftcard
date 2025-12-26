import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { CompanyImage } from '../entities/CompanyImage.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'

export class CompanyImageController {
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(CompanyImage)
      // 只返回激活的公司图片，按排序顺序排列
      const images = await repository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
      res.json(images)
    } catch (error) {
      console.error('Get public company images error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(CompanyImage)
      const images = await repository.find({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
      res.json(images)
    } catch (error) {
      console.error('Get all company images error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(CompanyImage)
      const { title, description, sortOrder, isActive } = req.body
      let imageUrl = req.file ? `/images/company/${req.file.filename}` : req.body.imageUrl

      if (!imageUrl) {
        return res.status(400).json({ message: '图片必填' })
      }

      // 检查激活图片数量限制（最多3张）
      const willBeActive = isActive !== undefined ? isActive : true
      if (willBeActive) {
        const activeCount = await repository.count({ where: { isActive: true } })
        if (activeCount >= 3) {
          return res.status(400).json({ message: '最多只能有3张激活的公司图片，请先禁用其他图片' })
        }
      }

      const image = repository.create({
        title: title || '',
        description: description || null,
        imageUrl,
        sortOrder: sortOrder || 0,
        isActive: willBeActive,
      })

      const saved = await repository.save(image)
      res.status(201).json(saved)
    } catch (error) {
      console.error('Create company image error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(CompanyImage)
      const image = await repository.findOne({ where: { id: parseInt(id) } })

      if (!image) {
        return res.status(404).json({ message: '未找到' })
      }

      // 检查激活图片数量限制（最多3张）
      const willBeActive = req.body.isActive !== undefined ? req.body.isActive : image.isActive
      if (willBeActive && !image.isActive) {
        // 从非激活改为激活
        const activeCount = await repository.count({ where: { isActive: true } })
        if (activeCount >= 3) {
          return res.status(400).json({ message: '最多只能有3张激活的公司图片，请先禁用其他图片' })
        }
      }

      const oldImageUrl = image.imageUrl
      let newImageUrl = req.file ? `/images/company/${req.file.filename}` : req.body.imageUrl

      // 如果上传了新文件，且旧图片存在且不是外部链接，则删除旧文件
      if (
        req.file &&
        oldImageUrl &&
        !oldImageUrl.startsWith('http')
      ) {
        try {
          const __filename = fileURLToPath(import.meta.url)
          const __dirname = dirname(__filename)
          const path = await import('path')

          const imagePath = oldImageUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', oldImageUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'company', oldImageUrl)
          
          await fs.unlink(imagePath).catch(() => {
            // 文件不存在时忽略错误
          })
          console.log(`✅ 旧图片文件已删除: ${oldImageUrl}`)
        } catch (fileError) {
          console.warn('删除旧图片文件失败:', fileError)
        }
      }

      Object.assign(image, {
        ...req.body,
        imageUrl: newImageUrl || image.imageUrl,
      })
      const saved = await repository.save(image)
      res.json(saved)
    } catch (error) {
      console.error('Update company image error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(CompanyImage)
      const image = await repository.findOne({ where: { id: parseInt(id) } })

      if (!image) {
        return res.status(404).json({ message: '未找到' })
      }

      // 删除关联的图片文件
      if (image.imageUrl && !image.imageUrl.startsWith('http')) {
        try {
          const __filename = fileURLToPath(import.meta.url)
          const __dirname = dirname(__filename)
          const path = await import('path')

          const imagePath = image.imageUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', image.imageUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'company', image.imageUrl)
          
          await fs.unlink(imagePath).catch(() => {
            // 文件不存在时忽略错误
          })
          console.log(`✅ 图片文件已删除: ${image.imageUrl}`)
        } catch (fileError) {
          console.warn('删除图片文件失败:', fileError)
        }
      }

      await repository.remove(image)
      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete company image error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }
}

