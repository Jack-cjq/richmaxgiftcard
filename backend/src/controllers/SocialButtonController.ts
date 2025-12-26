import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { SocialButton } from '../entities/SocialButton.js'

export class SocialButtonController {
  // 获取所有激活的按钮（公开接口）
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SocialButton)
      const buttons = await repository.find({
        where: { isActive: true },
        order: { sortOrder: 'ASC' },
      })
      res.json(buttons)
    } catch (error) {
      console.error('Get public social buttons error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  // 获取所有按钮（管理接口）
  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SocialButton)
      const buttons = await repository.find({
        order: { sortOrder: 'ASC', createdAt: 'DESC' },
      })
      res.json(buttons)
    } catch (error) {
      console.error('Get all social buttons error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  // 创建按钮
  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SocialButton)
      const { type, label, url, iconColor, bgColor, sortOrder, isActive } = req.body

      if (!type || !label) {
        return res.status(400).json({ message: '按钮类型和标签必填' })
      }

      const button = repository.create({
        type,
        label,
        url: url || null,
        iconColor: iconColor || null,
        bgColor: bgColor || null,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
      })

      const saved = await repository.save(button)
      res.status(201).json(saved)
    } catch (error) {
      console.error('Create social button error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  // 更新按钮
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(SocialButton)
      const button = await repository.findOne({ where: { id: parseInt(id) } })

      if (!button) {
        return res.status(404).json({ message: '未找到' })
      }

      Object.assign(button, req.body)
      const saved = await repository.save(button)
      res.json(saved)
    } catch (error) {
      console.error('Update social button error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  // 删除按钮
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(SocialButton)
      const result = await repository.delete(parseInt(id))

      if (result.affected === 0) {
        return res.status(404).json({ message: '未找到' })
      }

      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete social button error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }

  // 批量更新按钮（用于排序和激活状态）
  static async updateBatch(req: Request, res: Response) {
    try {
      const { buttons } = req.body
      
      if (!buttons) {
        return res.status(400).json({ message: '请求体缺少buttons字段' })
      }
      
      if (!Array.isArray(buttons)) {
        return res.status(400).json({ message: '按钮数据格式错误，必须是数组' })
      }

      if (buttons.length === 0) {
        return res.status(400).json({ message: '按钮数据不能为空' })
      }

      const repository = AppDataSource.getRepository(SocialButton)
      
      // 先验证所有ID是否有效（不查询数据库，只验证格式）
      const ids: number[] = []
      for (const btn of buttons) {
        if (!btn.id && btn.id !== 0) {
          return res.status(400).json({ message: '按钮ID不能为空' })
        }
        
        const id = parseInt(String(btn.id))
        if (isNaN(id) || id < 1) {
          return res.status(400).json({ message: `无效的ID: ${btn.id}` })
        }
        ids.push(id)
      }

      // 批量查询所有需要更新的按钮，验证它们是否存在
      const existingButtons = await repository.find({
        where: ids.map(id => ({ id })),
      })
      
      const existingIds = new Set(existingButtons.map(btn => btn.id))
      const missingIds = ids.filter(id => !existingIds.has(id))
      
      if (missingIds.length > 0) {
        return res.status(404).json({ message: `未找到以下ID的按钮: ${missingIds.join(', ')}` })
      }

      // 所有验证通过后，执行批量更新
      const updatePromises = buttons.map((btn: any) => {
        const id = parseInt(String(btn.id))
        
        // 只更新必要的字段，不更新颜色字段（颜色在前端硬编码）
        const updateData: any = {}
        if (btn.sortOrder !== undefined) {
          updateData.sortOrder = parseInt(String(btn.sortOrder)) || 0
        }
        if (btn.isActive !== undefined) {
          updateData.isActive = Boolean(btn.isActive)
        }
        if (btn.url !== undefined) {
          updateData.url = btn.url || null
        }
        if (btn.label !== undefined) {
          updateData.label = btn.label || ''
        }

        return repository.update(id, updateData)
      })

      await Promise.all(updatePromises)
      res.json({ message: '批量更新成功' })
    } catch (error: any) {
      console.error('Batch update social buttons error:', error)
      res.status(500).json({ message: '批量更新失败', error: error.message || '服务器错误' })
    }
  }
}

