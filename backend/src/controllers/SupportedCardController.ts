import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { SupportedCard } from '../entities/SupportedCard.js'
import path from 'path'

export class SupportedCardController {
  // 获取所有激活的卡片（公开接口）
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SupportedCard)
      const cards = await repository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC' },
      })
      res.json(cards)
    } catch (error) {
      console.error('Get public supported cards error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  // 获取所有卡片（管理接口）
  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SupportedCard)
      const cards = await repository.find({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
      res.json(cards)
    } catch (error) {
      console.error('Get all supported cards error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  // 创建卡片
  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SupportedCard)
      const { name, logoUrl, description, sortOrder, isActive } = req.body

      if (!name) {
        return res.status(400).json({ message: '卡片名称必填' })
      }

      const card = repository.create({
        name,
        logoUrl: logoUrl || null,
        description: description || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })

      const saved = await repository.save(card)
      res.status(201).json(saved)
    } catch (error) {
      console.error('Create supported card error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  // 更新卡片
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(SupportedCard)
      const card = await repository.findOne({ where: { id: parseInt(id) } })

      if (!card) {
        return res.status(404).json({ message: '未找到' })
      }

      // 如果更新了图片URL，且旧图片不是外部URL，删除旧图片
      if (req.body.logoUrl && req.body.logoUrl !== card.logoUrl && card.logoUrl && !card.logoUrl.startsWith('http')) {
        try {
          const fs = await import('fs/promises')
          const { fileURLToPath } = await import('url')
          const { dirname } = await import('path')
          const __filename = fileURLToPath(import.meta.url)
          const __dirname = dirname(__filename)
          
          // 构建旧图片完整路径
          const oldImagePath = card.logoUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', card.logoUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'cards', card.logoUrl)
          
          // 删除旧文件
          await fs.unlink(oldImagePath).catch(() => {
            // 文件不存在时忽略错误
          })
        } catch (fileError) {
          console.warn('删除旧图片文件失败:', fileError)
          // 继续更新，即使文件删除失败
        }
      }

      Object.assign(card, req.body)
      const saved = await repository.save(card)
      res.json(saved)
    } catch (error) {
      console.error('Update supported card error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  // 删除卡片
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(SupportedCard)
      const card = await repository.findOne({ where: { id: parseInt(id) } })

      if (!card) {
        return res.status(404).json({ message: '未找到' })
      }

      // 如果卡片有图片，删除图片文件
      if (card.logoUrl && !card.logoUrl.startsWith('http')) {
        try {
          const fs = await import('fs/promises')
          const { fileURLToPath } = await import('url')
          const { dirname } = await import('path')
          const __filename = fileURLToPath(import.meta.url)
          const __dirname = dirname(__filename)
          
          // 构建图片完整路径
          const imagePath = card.logoUrl.startsWith('/')
            ? path.join(__dirname, '../../..', 'frontend', 'public', card.logoUrl)
            : path.join(__dirname, '../../..', 'frontend', 'public', 'images', 'cards', card.logoUrl)
          
          // 删除文件
          await fs.unlink(imagePath).catch(() => {
            // 文件不存在时忽略错误
          })
        } catch (fileError) {
          console.warn('删除图片文件失败:', fileError)
          // 继续删除数据库记录，即使文件删除失败
        }
      }

      const result = await repository.delete(parseInt(id))

      if (result.affected === 0) {
        return res.status(404).json({ message: '未找到' })
      }

      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete supported card error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }

  // 上传图片
  static async uploadImage(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: '请选择要上传的图片' })
      }

      // 返回图片路径（相对于 public 目录）
      const imagePath = `/images/cards/${req.file.filename}`
      
      res.json({
        message: '上传成功',
        path: imagePath,
        filename: req.file.filename,
      })
    } catch (error) {
      console.error('Upload image error:', error)
      res.status(500).json({ message: '上传失败', error: '服务器错误' })
    }
  }
}

