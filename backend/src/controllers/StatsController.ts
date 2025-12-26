import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Trade } from '../entities/Trade.js'
import { Product } from '../entities/Product.js'
import { ExchangeRate } from '../entities/ExchangeRate.js'
import { MoreThan } from 'typeorm'

export class StatsController {
  static async getStats(req: Request, res: Response) {
    try {
      const tradeRepository = AppDataSource.getRepository(Trade)
      const productRepository = AppDataSource.getRepository(Product)
      const rateRepository = AppDataSource.getRepository(ExchangeRate)

      // 今天的开始时间
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 今日交易
      const todayTrades = await tradeRepository.count({
        where: { createdAt: MoreThan(today) },
      })

      // 今日金额
      const todayTradesList = await tradeRepository.find({
        where: { createdAt: MoreThan(today) },
      })
      const todayAmount = todayTradesList.reduce(
        (sum, trade) => sum + Number(trade.totalAmount),
        0
      )

      // 总交易数
      const totalTrades = await tradeRepository.count()

      // 总交易金额
      const allTrades = await tradeRepository.find()
      const totalAmount = allTrades.reduce(
        (sum, trade) => sum + Number(trade.totalAmount),
        0
      )

      // 活跃产品
      const activeProducts = await productRepository.count({
        where: { status: 'active' },
      })

      // 产品总数
      const totalProducts = await productRepository.count()

      // 汇率数量
      const exchangeRateCount = await rateRepository.count()

      // 最近交易（后端限制数量，前端直接展示）
      const recentTrades = await tradeRepository.find({
        take: 10, // 后端决定返回数量
        order: { createdAt: 'DESC' },
        where: {
          status: 'completed', // 只返回已完成的交易
        },
      })

      res.json({
        todayTrades,
        todayAmount,
        totalTrades,
        totalAmount,
        activeProducts,
        totalProducts,
        exchangeRateCount,
        recentTrades,
      })
    } catch (error) {
      console.error('Stats error:', error)
      res.status(500).json({ message: '获取失败' })
    }
  }
}

