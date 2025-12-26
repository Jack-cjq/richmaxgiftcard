import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { Video } from '../entities/Video.js'

async function verifyVideosTable() {
  try {
    await AppDataSource.initialize()
    console.log('数据库连接成功')

    // 尝试查询 Video 表
    const videoRepository = AppDataSource.getRepository(Video)
    const count = await videoRepository.count()
    
    console.log(`✅ Video 表已存在，当前有 ${count} 条记录`)

    // 测试创建一条测试记录（可选）
    const testVideo = videoRepository.create({
      title: '测试视频',
      description: '这是一个测试视频',
      videoUrl: '/videos/test.mp4',
      type: 'company',
      sortOrder: 0,
      isActive: false,
    })

    await videoRepository.save(testVideo)
    console.log('✅ 测试记录创建成功')

    // 删除测试记录
    await videoRepository.remove(testVideo)
    console.log('✅ 测试记录已删除')

    await AppDataSource.destroy()
    console.log('✅ Video 表验证完成')
  } catch (error: any) {
    if (error.message?.includes('relation "videos" does not exist')) {
      console.error('❌ Video 表不存在！')
      console.error('请重启后端服务器，TypeORM 会自动创建表')
      console.error('或者运行: npm run dev:backend')
    } else {
      console.error('验证失败:', error)
    }
    process.exit(1)
  }
}

verifyVideosTable()

