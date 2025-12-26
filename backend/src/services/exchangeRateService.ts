import axios from 'axios'
import { AppDataSource } from '../data-source.js'
import { ExchangeRate } from '../entities/ExchangeRate.js'
import { SystemConfig } from '../entities/SystemConfig.js'

/**
 * 汇率更新服务
 * 使用免费API获取实时汇率
 */
export class ExchangeRateService {
  // 主要货币配置（卡片显示）
  private static readonly PRIMARY_CURRENCIES = ['USD', 'CNY', 'NGN', 'BTC', 'GHC']

  /**
   * 获取当前基准货币
   */
  static async getBaseCurrency(): Promise<string> {
    try {
      const repository = AppDataSource.getRepository(SystemConfig)
      const config = await repository.findOne({ where: { key: 'base_currency' } })
      return config?.value || 'CNY' // 默认为CNY
    } catch (error) {
      console.warn('获取基准货币配置失败，使用默认值CNY:', error)
      return 'CNY'
    }
  }

  /**
   * 获取实时汇率（使用免费API）
   * 动态获取数据库中所有货币的实时汇率
   * 传统货币使用 exchangerate-api.com
   * 加密货币使用 CoinGecko API
   * 
   * 注意：此方法可以公开调用，用于创建新货币时获取汇率
   */
  static async fetchRealTimeRates(
    currencySymbols: string[]
  ): Promise<Record<string, number>> {
    const rates: Record<string, number> = {}
    
    // 获取基准货币
    const baseCurrency = await this.getBaseCurrency()
    const baseCurrencyUpper = baseCurrency.toUpperCase()

    // 常见加密货币列表（需要从CoinGecko获取）
    const cryptoCurrencies = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'DOT', 'MATIC']
    
    // 将货币符号分为传统货币和加密货币
    const traditionalCurrencies = currencySymbols.filter(symbol => !cryptoCurrencies.includes(symbol.toUpperCase()))
    const cryptoCurrenciesToFetch = currencySymbols.filter(symbol => cryptoCurrencies.includes(symbol.toUpperCase()))

    // 1. 获取传统货币汇率（以配置的基准货币为基准）
    if (traditionalCurrencies.length > 0) {
      try {
        const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrencyUpper}`, {
          timeout: 5000,
        })
        const exchangeRates = response.data.rates

        // 处理每个传统货币
        for (const symbol of traditionalCurrencies) {
          const upperSymbol = symbol.toUpperCase()
          
          // 特殊处理：GHC 对应 ISO 代码 GHS
          const apiSymbol = upperSymbol === 'GHC' ? 'GHS' : upperSymbol
          
          if (upperSymbol === baseCurrencyUpper) {
            // 基准货币的汇率为1
            rates[symbol] = 1.0
          } else if (exchangeRates[apiSymbol]) {
            // exchangerate-api 返回的是 1 基准货币 = X 目标货币 的形式
            // 我们需要的是 1 目标货币 = X 基准货币 的形式，所以需要取倒数
            rates[symbol] = 1 / exchangeRates[apiSymbol]
          } else {
            console.warn(`⚠️ API未返回货币 ${symbol} 的汇率`)
          }
        }

        console.log(`✅ 传统货币汇率获取成功 (${traditionalCurrencies.length} 种，基准货币: ${baseCurrencyUpper})`)
      } catch (error) {
        console.warn(`⚠️ 传统货币API获取失败 (基准货币: ${baseCurrencyUpper}):`, error)
      }
    }

      // 2. 获取加密货币汇率（如果API失败则跳过，不更新）
      if (cryptoCurrenciesToFetch.length > 0) {
        // CoinGecko需要将货币符号转换为对应的ID
        const cryptoIdMap: Record<string, string> = {
          'BTC': 'bitcoin',
          'ETH': 'ethereum',
          'USDT': 'tether',
          'BNB': 'binancecoin',
          'SOL': 'solana',
          'XRP': 'ripple',
          'DOGE': 'dogecoin',
          'ADA': 'cardano',
          'DOT': 'polkadot',
          'MATIC': 'matic-network',
        }

        try {
          const cryptoIds = cryptoCurrenciesToFetch
            .map(symbol => cryptoIdMap[symbol.toUpperCase()])
            .filter(id => id !== undefined)
            .join(',')

          if (cryptoIds) {
            // CoinGecko支持的基准货币映射（转换为CoinGecko支持的货币代码）
            const baseCurrencyMap: Record<string, string> = {
              'CNY': 'cny',
              'USD': 'usd',
              'EUR': 'eur',
              'GBP': 'gbp',
              'JPY': 'jpy',
            }
            
            // CoinGecko直接支持的基准货币
            const vsCurrency = baseCurrencyMap[baseCurrencyUpper] || 'usd'
            
            // 总是先获取USD汇率（因为CoinGecko对USD支持最好）
            const cryptoResponse = await axios.get(
              `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds}&vs_currencies=usd`,
              { 
                timeout: 8000, // 8秒超时
                headers: {
                  'Accept': 'application/json',
                }
              }
            )

            // 如果基准货币不是USD，需要获取USD对基准货币的汇率进行转换
            let usdToBaseRate = 1
            if (baseCurrencyUpper !== 'USD') {
              try {
                // 获取USD对基准货币的汇率
                const baseResponse = await axios.get(
                  `https://api.exchangerate-api.com/v4/latest/USD`,
                  { timeout: 5000 }
                )
                const usdRates = baseResponse.data.rates
                // 特殊处理：GHC 对应 ISO 代码 GHS
                const apiSymbol = baseCurrencyUpper === 'GHC' ? 'GHS' : baseCurrencyUpper
                if (usdRates[apiSymbol]) {
                  // exchangerate-api 返回的是 1 USD = X 基准货币
                  // 我们需要的是 1 基准货币 = X USD，所以取倒数
                  usdToBaseRate = 1 / usdRates[apiSymbol]
                } else if (baseCurrencyUpper === 'USD') {
                  usdToBaseRate = 1
                } else {
                  console.warn(`⚠️ 无法获取 USD 对 ${baseCurrencyUpper} 的汇率，使用默认值1`)
                }
              } catch (error) {
                console.warn(`⚠️ 无法获取 USD 对 ${baseCurrencyUpper} 的汇率，使用默认值1:`, error)
              }
            }

            // 处理每个加密货币
            let successCount = 0
            for (const symbol of cryptoCurrenciesToFetch) {
              const upperSymbol = symbol.toUpperCase()
              const cryptoId = cryptoIdMap[upperSymbol]
              
              if (cryptoId && cryptoResponse.data?.[cryptoId]?.usd) {
                const usdPrice = cryptoResponse.data[cryptoId].usd
                // 将USD价格转换为基准货币价格
                // 1 加密货币 = X USD
                // 1 USD = usdToBaseRate 基准货币
                // 所以：1 加密货币 = X USD * usdToBaseRate 基准货币
                rates[symbol] = usdPrice * usdToBaseRate
                successCount++
              }
            }

            if (successCount > 0) {
              console.log(`✅ 加密货币汇率获取成功 (${successCount}/${cryptoCurrenciesToFetch.length} 种)`)
            }
          }
        } catch (error: any) {
          // 如果API失败，直接跳过所有加密货币，不更新
          console.warn(`⚠️ 加密货币API获取失败，跳过所有加密货币更新:`, error?.message || '超时')
          // 不设置任何加密货币汇率，让它们保持原值
        }
      }

    return rates
  }

  /**
   * 更新所有汇率
   * 动态获取数据库中所有货币的实时汇率
   */
  static async updateAllRates(): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(ExchangeRate)
      const rates = await repository.find()

      if (rates.length === 0) {
        console.log('没有汇率数据需要更新')
        return
      }

      // 获取所有货币符号
      const currencySymbols = rates.map(rate => rate.symbol)
      console.log(`📊 开始更新 ${currencySymbols.length} 种货币的汇率: ${currencySymbols.join(', ')}`)

      // 动态获取实时汇率（传入所有货币符号）
      const realTimeRates = await this.fetchRealTimeRates(currencySymbols)

      // 更新每条汇率
      let updatedCount = 0
      let skippedCount = 0

      for (const rate of rates) {
        const newRate = realTimeRates[rate.symbol]

        if (newRate !== undefined && !isNaN(newRate) && newRate > 0) {
          const oldRate = Number(rate.rate)
          const change = newRate - oldRate
          const changePercent = oldRate !== 0 ? (change / oldRate) * 100 : 0

          rate.rate = newRate
          rate.change = change
          rate.changePercent = changePercent
          // 手动更新 updatedAt 字段，确保时间戳正确
          rate.updatedAt = new Date()

          await repository.save(rate)
          updatedCount++
          console.log(`✅ 更新汇率: ${rate.currency} (${rate.symbol}) - ${newRate.toFixed(4)} (变化: ${changePercent.toFixed(2)}%)`)
        } else {
          skippedCount++
          // 如果API未返回数据，保持原有汇率不变，只记录警告
          console.log(`⚠️ 跳过更新: ${rate.currency} (${rate.symbol}) - API未返回该货币数据或数据无效，保持原值`)
        }
      }

      console.log(`✅ 汇率更新完成: 成功 ${updatedCount} 条，跳过 ${skippedCount} 条`)
    } catch (error) {
      console.error('❌ 更新汇率失败:', error)
      throw error
    }
  }

  /**
   * 标记主要货币
   */
  static async markPrimaryCurrencies(): Promise<void> {
    try {
      const repository = AppDataSource.getRepository(ExchangeRate)

      // 将所有货币的 isPrimary 设为 false
      await repository
        .createQueryBuilder()
        .update(ExchangeRate)
        .set({ isPrimary: false })
        .execute()

      // 标记主要货币
      for (const symbol of this.PRIMARY_CURRENCIES) {
        await repository
          .createQueryBuilder()
          .update(ExchangeRate)
          .set({ isPrimary: true })
          .where('symbol = :symbol', { symbol })
          .execute()
      }

      console.log('✅ 主要货币标记完成')
    } catch (error) {
      console.error('❌ 标记主要货币失败:', error)
      throw error
    }
  }
}

