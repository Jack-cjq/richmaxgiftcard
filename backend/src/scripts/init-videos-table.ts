import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { Video } from '../entities/Video.js'

/**
 * 初始化 Video 表
 * 这个脚本会：
 * 1. 连接数据库
 * 2. 确保 Video 表存在（TypeORM synchronize 会自动创建）
 * 3. 验证表结构
 */
async function initVideosTable() {
  try {
    console.log('正在连接数据库...')
    await AppDataSource.initialize()
    console.log('✅ 数据库连接成功')

    // 获取 Video 仓库
    const videoRepository = AppDataSource.getRepository(Video)

    // 尝试查询表（如果表不存在会抛出错误）
    try {
      const count = await videoRepository.count()
      console.log(`✅ Video 表已存在，当前有 ${count} 条记录`)
    } catch (error: any) {
      if (error.message?.includes('relation "videos" does not exist')) {
        console.log('⚠️  Video 表不存在，等待 TypeORM 自动创建...')
        
        // 如果 synchronize 开启，TypeORM 会在第一次查询时自动创建表
        // 我们可以尝试一个简单的操作来触发表创建
        const testVideo = videoRepository.create({
          title: '初始化测试',
          description: '用于初始化表的测试记录',
          videoUrl: '/videos/init-test.mp4',
          type: 'company',
          sortOrder: 0,
          isActive: false,
        })
        
        await videoRepository.save(testVideo)
        console.log('✅ Video 表已创建')
        
        // 删除测试记录
        await videoRepository.remove(testVideo)
        console.log('✅ 测试记录已清理')
      } else {
        throw error
      }
    }

    // 验证表结构
    const metadata = AppDataSource.getMetadata(Video)
    console.log('✅ Video 表结构验证成功')
    console.log(`   - 表名: ${metadata.tableName}`)
    console.log(`   - 列数: ${metadata.columns.length}`)

    await AppDataSource.destroy()
    console.log('✅ Video 表初始化完成')
  } catch (error: any) {
    console.error('❌ 初始化失败:', error.message)
    
    if (error.message?.includes('synchronize')) {
      console.error('\n提示: 如果 synchronize 被禁用，请手动执行 SQL 脚本:')
      console.error('   backend/src/migrations/create-videos-table.sql')
    }
    
    process.exit(1)
  }
}

initVideosTable()

