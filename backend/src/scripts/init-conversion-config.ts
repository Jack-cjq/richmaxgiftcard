import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { ConversionConfig } from '../entities/ConversionConfig.js'

/**
 * 初始化换算配置
 * 如果 conversion_config 表中没有数据，则创建默认配置
 */
async function initConversionConfig() {
  try {
    await AppDataSource.initialize()
    console.log('数据库连接成功')

    const repository = AppDataSource.getRepository(ConversionConfig)

    // 检查是否已有配置（获取第一条记录）
    const existing = await repository.findOne({ where: {}, order: { id: 'ASC' } })

    if (existing) {
      console.log('✅ 换算配置已存在，跳过初始化')
      console.log('当前配置：')
      console.log(`  R汇率: ${existing.rRate}`)
      console.log(`  服务费比例: ${existing.serviceFeePercent} (${(Number(existing.serviceFeePercent) * 100).toFixed(1)}%)`)
      console.log(`  NGN汇率: ${existing.ngnRate}`)
      console.log(`  GHC汇率: ${existing.ghcRate}`)
    } else {
      // 创建默认配置
      const defaultConfig = repository.create({
        rRate: 7.13,
        serviceFeePercent: 0.03,
        ngnRate: 200,
        ghcRate: 1.0,
      })

      await repository.save(defaultConfig)
      console.log('✅ 换算配置初始化成功')
      console.log('默认配置：')
      console.log(`  R汇率: ${defaultConfig.rRate}`)
      console.log(`  服务费比例: ${defaultConfig.serviceFeePercent} (${(Number(defaultConfig.serviceFeePercent) * 100).toFixed(1)}%)`)
      console.log(`  NGN汇率: ${defaultConfig.ngnRate}`)
      console.log(`  GHC汇率: ${defaultConfig.ghcRate}`)
    }

    await AppDataSource.destroy()
    process.exit(0)
  } catch (error) {
    console.error('初始化失败:', error)
    process.exit(1)
  }
}

initConversionConfig()

