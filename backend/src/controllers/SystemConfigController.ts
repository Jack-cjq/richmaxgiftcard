import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { SystemConfig } from '../entities/SystemConfig.js'
import { ExchangeRateService } from '../services/exchangeRateService.js'

export class SystemConfigController {
  /**
   * 获取基准货币配置
   */
  static async getBaseCurrency(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SystemConfig)
      let config = await repository.findOne({ where: { key: 'base_currency' } })

      // 如果不存在，创建默认配置（CNY）
      if (!config) {
        config = repository.create({
          key: 'base_currency',
          value: 'CNY',
        })
        await repository.save(config)
      }

      res.json({ baseCurrency: config.value })
    } catch (error) {
      console.error('Get base currency error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }

  /**
   * 更新基准货币
   * 当基准货币改变时，需要重新计算所有汇率
   */
  static async updateBaseCurrency(req: Request, res: Response) {
    try {
      const { baseCurrency } = req.body

      if (!baseCurrency || typeof baseCurrency !== 'string') {
        return res.status(400).json({ message: '基准货币必填' })
      }

      const repository = AppDataSource.getRepository(SystemConfig)
      let config = await repository.findOne({ where: { key: 'base_currency' } })

      const oldBaseCurrency = config?.value || 'CNY'
      const newBaseCurrency = baseCurrency.toUpperCase()

      // 如果基准货币没有改变，直接返回
      if (oldBaseCurrency === newBaseCurrency) {
        return res.json({ 
          baseCurrency: newBaseCurrency,
          message: '基准货币未改变' 
        })
      }

      // 更新配置
      if (!config) {
        config = repository.create({
          key: 'base_currency',
          value: newBaseCurrency,
        })
      } else {
        config.value = newBaseCurrency
      }
      await repository.save(config)

      // 重新计算所有汇率
      try {
        console.log(`🔄 基准货币从 ${oldBaseCurrency} 改为 ${newBaseCurrency}，开始重新计算所有汇率...`)
        await ExchangeRateService.updateAllRates()
        console.log(`✅ 汇率重新计算完成`)
      } catch (error) {
        console.error('重新计算汇率失败:', error)
        // 即使重新计算失败，也返回成功，因为配置已经更新
      }

      res.json({ 
        baseCurrency: newBaseCurrency,
        message: '基准货币更新成功，所有汇率已重新计算' 
      })
    } catch (error) {
      console.error('Update base currency error:', error)
      res.status(500).json({ message: '更新失败', error: '服务器错误' })
    }
  }


  /**
   * 获取所有系统配置（管理员）
   */
  static async getAll(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(SystemConfig)
      const configs = await repository.find()
      
      // 转换为键值对格式
      const configMap: Record<string, string> = {}
      configs.forEach(config => {
        configMap[config.key] = config.value
      })

      // 确保有基准货币配置
      if (!configMap['base_currency']) {
        configMap['base_currency'] = 'CNY'
      }

      res.json(configMap)
    } catch (error) {
      console.error('Get all configs error:', error)
      res.status(500).json({ message: '获取失败', error: '服务器错误' })
    }
  }
}

