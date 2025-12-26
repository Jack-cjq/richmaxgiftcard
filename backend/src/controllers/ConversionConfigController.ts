import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { ConversionConfig } from '../entities/ConversionConfig.js'

export class ConversionConfigController {
  /**
   * 获取换算配置（公开接口）
   * 单例模式：只返回第一条记录，如果没有则创建默认配置
   */
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(ConversionConfig)
      
      // 获取第一条记录（单例模式）
      let config = await repository.findOne({ where: {}, order: { id: 'ASC' } })

      // 如果不存在，创建默认配置
      if (!config) {
        config = repository.create({
          rRate: 7.13,
          serviceFeePercent: 0.03,
          ngnRate: 200,
          ghcRate: 1.0,
        })
        await repository.save(config)
      }

      res.json({
        rRate: Number(config.rRate),
        serviceFeePercent: Number(config.serviceFeePercent),
        ngnRate: Number(config.ngnRate),
        ghcRate: Number(config.ghcRate),
        cardCategories: config.cardCategories || {},
        categoryRates: config.categoryRates || {},
      })
    } catch (error) {
      console.error('Get conversion config error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  /**
   * 获取换算配置（管理员接口）
   */
  static async getAdmin(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(ConversionConfig)
      
      let config = await repository.findOne({ where: {}, order: { id: 'ASC' } })

      if (!config) {
        config = repository.create({
          rRate: 7.13,
          serviceFeePercent: 0.03,
          ngnRate: 200,
          ghcRate: 1.0,
        })
        await repository.save(config)
      }

      res.json({
        id: config.id,
        rRate: Number(config.rRate),
        serviceFeePercent: Number(config.serviceFeePercent),
        ngnRate: Number(config.ngnRate),
        ghcRate: Number(config.ghcRate),
        cardCategories: config.cardCategories || {},
        categoryRates: config.categoryRates || {},
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      })
    } catch (error) {
      console.error('Get conversion config (admin) error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  /**
   * 更新换算配置（管理员接口）
   * 单例模式：更新第一条记录，如果没有则创建
   */
  static async update(req: Request, res: Response) {
    try {
      const { rRate, serviceFeePercent, ngnRate, ghcRate, cardCategories, categoryRates } = req.body
      const repository = AppDataSource.getRepository(ConversionConfig)

      // 验证输入
      if (rRate !== undefined && (isNaN(parseFloat(rRate)) || parseFloat(rRate) <= 0)) {
        return res.status(400).json({ message: 'R汇率必须大于0' })
      }
      if (serviceFeePercent !== undefined && (isNaN(parseFloat(serviceFeePercent)) || parseFloat(serviceFeePercent) < 0 || parseFloat(serviceFeePercent) > 1)) {
        return res.status(400).json({ message: '服务费比例必须在0到1之间' })
      }
      if (ngnRate !== undefined && (isNaN(parseFloat(ngnRate)) || parseFloat(ngnRate) <= 0)) {
        return res.status(400).json({ message: 'NGN汇率必须大于0' })
      }
      if (ghcRate !== undefined && (isNaN(parseFloat(ghcRate)) || parseFloat(ghcRate) <= 0)) {
        return res.status(400).json({ message: 'GHC汇率必须大于0' })
      }

      // 获取或创建配置（单例模式）
      let config = await repository.findOne({ where: {}, order: { id: 'ASC' } })

      if (!config) {
        config = repository.create({
          rRate: rRate !== undefined ? parseFloat(rRate) : 7.13,
          serviceFeePercent: serviceFeePercent !== undefined ? parseFloat(serviceFeePercent) : 0.03,
          ngnRate: ngnRate !== undefined ? parseFloat(ngnRate) : 200,
          ghcRate: ghcRate !== undefined ? parseFloat(ghcRate) : 1.0,
          cardCategories: cardCategories || {},
          categoryRates: categoryRates || {},
        })
      } else {
        // 更新现有配置
        if (rRate !== undefined) config.rRate = parseFloat(rRate)
        if (serviceFeePercent !== undefined) config.serviceFeePercent = parseFloat(serviceFeePercent)
        if (ngnRate !== undefined) config.ngnRate = parseFloat(ngnRate)
        if (ghcRate !== undefined) config.ghcRate = parseFloat(ghcRate)
        if (cardCategories !== undefined) config.cardCategories = cardCategories
        if (categoryRates !== undefined) config.categoryRates = categoryRates
      }

      await repository.save(config)

      res.json({
        message: '换算配置更新成功',
        config: {
          id: config.id,
          rRate: Number(config.rRate),
          serviceFeePercent: Number(config.serviceFeePercent),
          ngnRate: Number(config.ngnRate),
          ghcRate: Number(config.ghcRate),
          cardCategories: config.cardCategories || {},
          categoryRates: config.categoryRates || {},
          updatedAt: config.updatedAt,
        },
      })
    } catch (error) {
      console.error('Update conversion config error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }
}

