import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Carousel } from '../entities/Carousel.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import fs from 'fs/promises'

export class CarouselController {
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Carousel)
      // 只返回激活的轮播图，按排序顺序排列
      const carousels = await repository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
      res.json(carousels)
    } catch (error) {
      console.error('Get public carousels error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Carousel)
      const carousels = await repository.find({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
      res.json(carousels)
    } catch (error) {
      console.error('Get all carousels error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Carousel)
      const { title, subtitle, linkUrl, sortOrder, isActive } = req.body
      let imageUrl = req.file ? `/images/carousels/${req.file.filename}` : req.body.imageUrl

      if (!imageUrl) {
        return res.status(400).json({ message: '图片必填' })
      }

      const carousel = repository.create({
        title: title || '',
        subtitle: subtitle || null,
        imageUrl,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })

      const saved = await repository.save(carousel)
      res.status(201).json(saved)
    } catch (error) {
      console.error('Create carousel error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Carousel)
      const carousel = await repository.findOne({ where: { id: parseInt(id) } })

      if (!carousel) {
        return res.status(404).json({ message: '未找到' })
      }

      const oldImageUrl = carousel.imageUrl
      let newImageUrl = req.file ? `/images/carousels/${req.file.filename}` : req.body.imageUrl

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
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'carousels', oldImageUrl)
          
          await fs.unlink(imagePath).catch(() => {
            // 文件不存在时忽略错误
          })
          console.log(`✅ 旧图片文件已删除: ${oldImageUrl}`)
        } catch (fileError) {
          console.warn('删除旧图片文件失败:', fileError)
        }
      }

      Object.assign(carousel, {
        ...req.body,
        imageUrl: newImageUrl || carousel.imageUrl,
      })
      const saved = await repository.save(carousel)
      res.json(saved)
    } catch (error) {
      console.error('Update carousel error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Carousel)
      const carousel = await repository.findOne({ where: { id: parseInt(id) } })

      if (!carousel) {
        return res.status(404).json({ message: '未找到' })
      }

      // 删除关联的图片文件
      if (carousel.imageUrl && !carousel.imageUrl.startsWith('http')) {
        try {
          const __filename = fileURLToPath(import.meta.url)
          const __dirname = dirname(__filename)
          const path = await import('path')

          const imagePath = carousel.imageUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', carousel.imageUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'carousels', carousel.imageUrl)
          
          await fs.unlink(imagePath).catch(() => {
            // 文件不存在时忽略错误
          })
          console.log(`✅ 图片文件已删除: ${carousel.imageUrl}`)
        } catch (fileError) {
          console.warn('删除图片文件失败:', fileError)
        }
      }

      await repository.remove(carousel)
      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete carousel error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }
}

