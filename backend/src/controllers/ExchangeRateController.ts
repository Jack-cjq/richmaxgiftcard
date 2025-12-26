import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { ExchangeRate } from '../entities/ExchangeRate.js'
import { ExchangeRateService } from '../services/exchangeRateService.js'

export class ExchangeRateController {
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(ExchangeRate)
      // 后端处理排序，主要货币优先，前端直接展示
      const rates = await repository.find({
        order: {
          isPrimary: 'DESC', // 主要货币在前
          updatedAt: 'DESC',
        },
      })
      res.json(rates)
    } catch (error) {
      console.error('Get public exchange rates error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(ExchangeRate)
      // 后端处理排序
      const rates = await repository.find({
        order: { updatedAt: 'DESC' },
      })
      res.json(rates)
    } catch (error) {
      console.error('Get all exchange rates error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(ExchangeRate)
      const { currency, symbol, isPrimary } = req.body
      
      // 验证必填字段
      if (!currency || !symbol) {
        return res.status(400).json({ message: '货币名称和符号是必填项' })
      }
      
      // 检查货币是否已存在（按货币名称或符号）
      const existing = await repository.findOne({
        where: [
          { currency },
          { symbol: symbol.toUpperCase() },
        ],
      })
      
      if (existing) {
        return res.status(400).json({ message: '该货币或符号已存在' })
      }

      // 如果提供了汇率，直接使用；否则从API获取
      let rate = req.body.rate
      let change = req.body.change || 0
      let changePercent = req.body.changePercent || 0

      // 如果没有提供汇率，尝试从API获取
      if (!rate) {
        try {
          const { ExchangeRateService } = await import('../services/exchangeRateService')
          const realTimeRates = await ExchangeRateService.fetchRealTimeRates([symbol.toUpperCase()])
          const fetchedRate = realTimeRates[symbol.toUpperCase()]
          
          if (fetchedRate && !isNaN(fetchedRate) && fetchedRate > 0) {
            rate = fetchedRate
            // 首次创建时，变化值和变化率设为0
            change = 0
            changePercent = 0
            console.log(`✅ 自动获取 ${currency} (${symbol}) 实时汇率: ${rate}`)
          } else {
            return res.status(400).json({ 
              message: `无法获取 ${symbol} 的实时汇率，请手动输入汇率或检查货币符号是否正确` 
            })
          }
        } catch (apiError) {
          console.error('获取实时汇率失败:', apiError)
          return res.status(400).json({ 
            message: `无法获取 ${symbol} 的实时汇率，请手动输入汇率` 
          })
        }
      }

      const rateEntity = repository.create({
        currency,
        symbol: symbol.toUpperCase(),
        rate: parseFloat(rate),
        change: parseFloat(change),
        changePercent: parseFloat(changePercent),
        isPrimary: isPrimary !== undefined ? isPrimary : false, // 支持从前端传入，默认为 false
      })
      
      const saved = await repository.save(rateEntity)
      res.json(saved)
    } catch (error) {
      console.error('Create exchange rate error:', error)
      res.status(500).json({ message: '创建失败', error: '服务器错误' })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(ExchangeRate)
      const rate = await repository.findOne({ where: { id: parseInt(id) } })

      if (!rate) {
        return res.status(404).json({ message: '未找到' })
      }

      // 如果更新货币名称，检查是否与其他货币冲突
      if (req.body.currency && req.body.currency !== rate.currency) {
        const existing = await repository.findOne({
          where: { currency: req.body.currency },
        })
        if (existing && existing.id !== rate.id) {
          return res.status(400).json({ message: '该货币名称已存在' })
        }
      }

      Object.assign(rate, req.body)
      const saved = await repository.save(rate)
      res.json(saved)
    } catch (error) {
      console.error('Update exchange rate error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params
      const repository = AppDataSource.getRepository(ExchangeRate)
      const result = await repository.delete(parseInt(id))

      if (result.affected === 0) {
        return res.status(404).json({ message: '未找到' })
      }

      res.json({ message: '删除成功' })
    } catch (error) {
      console.error('Delete exchange rate error:', error)
      res.status(500).json({ message: '删除失败', error: '服务器错误' })
    }
  }

  /**
   * 手动触发汇率更新
   */
  static async updateRates(req: Request, res: Response) {
    try {
      await ExchangeRateService.updateAllRates()
      res.json({ message: '汇率更新成功' })
    } catch (error) {
      console.error('Manual update rates error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }
}

