import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { Trade } from '../entities/Trade.js'

/**
 * 初始化示例交易数据
 */
async function initTrades() {
  try {
    await AppDataSource.initialize()
    const repository = AppDataSource.getRepository(Trade)

    // 检查是否已存在数据
    const existingTrades = await repository.find()
    
    if (existingTrades.length > 0) {
      console.log('交易数据已存在，跳过初始化')
      await AppDataSource.destroy()
      return
    }

    // 示例交易数据
    const defaultTrades = [
      {
        productName: 'Xbox礼品卡',
        currency: 'USD',
        amount: 50.00,
        exchangeRate: 7.2500,
        totalAmount: 362.50,
        status: 'completed' as const,
      },
      {
        productName: 'iTunes礼品卡',
        currency: 'USD',
        amount: 100.00,
        exchangeRate: 7.2500,
        totalAmount: 725.00,
        status: 'completed' as const,
      },
      {
        productName: 'Steam礼品卡',
        currency: 'USD',
        amount: 20.00,
        exchangeRate: 7.2500,
        totalAmount: 145.00,
        status: 'completed' as const,
      },
      {
        productName: 'Amazon礼品卡',
        currency: 'USD',
        amount: 200.00,
        exchangeRate: 7.2500,
        totalAmount: 1450.00,
        status: 'completed' as const,
      },
      {
        productName: 'Google Play礼品卡',
        currency: 'USD',
        amount: 25.00,
        exchangeRate: 7.2500,
        totalAmount: 181.25,
        status: 'completed' as const,
      },
      {
        productName: 'PlayStation礼品卡',
        currency: 'USD',
        amount: 50.00,
        exchangeRate: 7.2500,
        totalAmount: 362.50,
        status: 'completed' as const,
      },
      {
        productName: 'Nintendo eShop礼品卡',
        currency: 'USD',
        amount: 30.00,
        exchangeRate: 7.2500,
        totalAmount: 217.50,
        status: 'completed' as const,
      },
      {
        productName: 'Spotify礼品卡',
        currency: 'USD',
        amount: 15.00,
        exchangeRate: 7.2500,
        totalAmount: 108.75,
        status: 'completed' as const,
      },
      {
        productName: 'Netflix礼品卡',
        currency: 'USD',
        amount: 30.00,
        exchangeRate: 7.2500,
        totalAmount: 217.50,
        status: 'completed' as const,
      },
      {
        productName: 'Razer Gold礼品卡',
        currency: 'USD',
        amount: 10.00,
        exchangeRate: 7.2500,
        totalAmount: 72.50,
        status: 'completed' as const,
      },
      {
        productName: 'Xbox礼品卡',
        currency: 'USD',
        amount: 100.00,
        exchangeRate: 7.2500,
        totalAmount: 725.00,
        status: 'processing' as const,
      },
      {
        productName: 'iTunes礼品卡',
        currency: 'USD',
        amount: 50.00,
        exchangeRate: 7.2500,
        totalAmount: 362.50,
        status: 'processing' as const,
      },
    ]

    // 创建交易记录，并设置不同的创建时间（模拟历史数据）
    for (let i = 0; i < defaultTrades.length; i++) {
      const tradeData = defaultTrades[i]
      const trade = repository.create(tradeData)
      
      // 设置不同的创建时间，模拟最近几天的交易
      const now = new Date()
      const hoursAgo = i * 2 // 每条交易间隔2小时
      trade.createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
      trade.updatedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
      
      await repository.save(trade)
      console.log(`已创建交易: ${tradeData.productName} - ${tradeData.amount} ${tradeData.currency}`)
    }

    console.log(`✅ 交易数据初始化完成，共创建 ${defaultTrades.length} 条`)
    await AppDataSource.destroy()
  } catch (error) {
    console.error('❌ 初始化交易失败:', error)
    process.exit(1)
  }
}

initTrades()

