import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { ExchangeRate } from '../entities/ExchangeRate.js'

/**
 * 验证数据库中的汇率数据
 */
async function verifyRates() {
  try {
    await AppDataSource.initialize()
    console.log('✅ 数据库连接成功\n')

    const repository = AppDataSource.getRepository(ExchangeRate)
    const rates = await repository.find({
      order: { createdAt: 'ASC' },
    })

    if (rates.length === 0) {
      console.log('❌ 数据库中没有汇率数据')
      console.log('💡 请运行: npm run init:rates')
    } else {
      console.log(`✅ 找到 ${rates.length} 条汇率记录:\n`)
      console.log('┌────┬──────────┬────────┬──────────────┬──────────┬─────────────┬─────────────────────┐')
      console.log('│ ID │ 货币名称 │ 符号   │ 汇率         │ 变化值   │ 变化率(%)   │ 更新时间            │')
      console.log('├────┼──────────┼────────┼──────────────┼──────────┼─────────────┼─────────────────────┤')
      
      rates.forEach((rate) => {
        const id = String(rate.id).padEnd(2)
        const currency = rate.currency.padEnd(8)
        const symbol = rate.symbol.padEnd(6)
        const rateValue = Number(rate.rate).toFixed(4).padEnd(12)
        const change = (rate.change >= 0 ? '+' : '') + Number(rate.change).toFixed(4).padEnd(8)
        const changePercent = (rate.changePercent >= 0 ? '+' : '') + Number(rate.changePercent).toFixed(2) + '%'.padEnd(9)
        const updatedAt = new Date(rate.updatedAt).toLocaleString('zh-CN').padEnd(19)
        
        console.log(`│ ${id} │ ${currency} │ ${symbol} │ ${rateValue} │ ${change} │ ${changePercent} │ ${updatedAt} │`)
      })
      
      console.log('└────┴──────────┴────────┴──────────────┴──────────┴─────────────┴─────────────────────┘')
    }

    await AppDataSource.destroy()
    process.exit(0)
  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  }
}

verifyRates()

