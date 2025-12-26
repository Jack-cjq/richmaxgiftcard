import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { ExchangeRate } from '../entities/ExchangeRate.js'
import { ExchangeRateService } from '../services/exchangeRateService.js'

/**
 * 初始化默认货币汇率
 * 美元、人民币、奈拉、BTC、GHC
 */
async function initExchangeRates() {
  try {
    await AppDataSource.initialize()
    const repository = AppDataSource.getRepository(ExchangeRate)

    // 默认货币汇率数据（主要货币）
    const defaultRates = [
      {
        currency: '美元',
        symbol: 'USD',
        rate: 7.2500,
        change: 0.0100,
        changePercent: 0.14,
        isPrimary: true, // 主要货币，卡片显示
      },
      {
        currency: '人民币',
        symbol: 'CNY',
        rate: 1.0000,
        change: 0.0000,
        changePercent: 0.00,
        isPrimary: true,
      },
      {
        currency: '奈拉',
        symbol: 'NGN',
        rate: 0.0085,
        change: -0.0001,
        changePercent: -1.16,
        isPrimary: true,
      },
      {
        currency: '比特币',
        symbol: 'BTC',
        rate: 285000.0000,
        change: 1250.0000,
        changePercent: 0.44,
        isPrimary: true,
      },
      {
        currency: '加纳塞地',
        symbol: 'GHC',
        rate: 0.6200,
        change: 0.0050,
        changePercent: 0.81,
        isPrimary: true,
      },
    ]

    // 检查是否已存在数据
    const existingRates = await repository.find()
    
    if (existingRates.length > 0) {
      console.log('汇率数据已存在，跳过初始化')
      await AppDataSource.destroy()
      return
    }

    // 创建默认汇率
    for (const rateData of defaultRates) {
      const rate = repository.create(rateData)
      await repository.save(rate)
      console.log(`已创建汇率: ${rateData.currency} (${rateData.symbol})`)
    }

    console.log('✅ 默认货币汇率初始化完成')
    
    // 标记主要货币
    await ExchangeRateService.markPrimaryCurrencies()
    
    await AppDataSource.destroy()
  } catch (error) {
    console.error('❌ 初始化汇率失败:', error)
    process.exit(1)
  }
}

initExchangeRates()

