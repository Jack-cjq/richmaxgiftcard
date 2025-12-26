import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Trade } from '../entities/Trade.js'

export class TradeController {
  static async getPublic(req: Request, res: Response) {
    try {
      // 获取查询参数，后端处理所有数据逻辑
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100) // 限制最大100条
      const skip = (page - 1) * limit

      const repository = AppDataSource.getRepository(Trade)
      
      // 后端处理排序和分页
      const [trades, total] = await repository.findAndCount({
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
        // 只返回已完成的交易给前端展示
        where: {
          status: 'completed',
        },
      })

      // 后端计算总页数
      const totalPages = Math.ceil(total / limit)

      res.json({ 
        trades, 
        total, 
        page, 
        limit,
        totalPages,
      })
    } catch (error) {
      console.error('Get public trades error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      // 后端处理分页
      const page = parseInt(req.query.page as string) || 1
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
      const skip = (page - 1) * limit

      const repository = AppDataSource.getRepository(Trade)
      const [trades, total] = await repository.findAndCount({
        order: { createdAt: 'DESC' },
        take: limit,
        skip,
      })

      // 后端计算总页数
      const totalPages = Math.ceil(total / limit)

      res.json({ trades, total, page, limit, totalPages })
    } catch (error) {
      console.error('Get all trades error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Trade)
      const trade = repository.create(req.body)
      const saved = await repository.save(trade)
      res.json(saved)
    } catch (error) {
      res.status(500).json({ message: '创建失败' })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Trade)
      const trade = await repository.findOne({ where: { id: parseInt(id) } })

      if (!trade) {
        return res.status(404).json({ message: '未找到' })
      }

      Object.assign(trade, req.body)
      const saved = await repository.save(trade)
      res.json(saved)
    } catch (error) {
      res.status(500).json({ message: '更新失败' })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(Trade)
      const result = await repository.delete(parseInt(id))

      if (result.affected === 0) {
        return res.status(404).json({ message: '未找到' })
      }

      res.json({ message: '删除成功' })
    } catch (error) {
      res.status(500).json({ message: '删除失败' })
    }
  }
}

