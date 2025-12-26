import 'reflect-metadata'
import { AppDataSource } from '../data-source.js'
import { SocialButton } from '../entities/SocialButton.js'

/**
 * 初始化社交按钮
 * 如果 social_buttons 表中没有数据，则创建默认的5种社交按钮
 */
async function initSocialButtons() {
  try {
    await AppDataSource.initialize()
    console.log('数据库连接成功')

    const repository = AppDataSource.getRepository(SocialButton)

    // 检查是否已有按钮
    const existing = await repository.find()

    if (existing.length > 0) {
      console.log('✅ 社交按钮已存在，跳过初始化')
      console.log(`当前已有 ${existing.length} 个按钮：`)
      existing.forEach(btn => {
        console.log(`  - ${btn.type}: ${btn.label} (${btn.isActive ? '激活' : '禁用'})`)
      })
    } else {
      // 创建默认按钮配置
      const defaultButtons = [
        {
          type: 'whatsapp',
          label: 'WhatsApp',
          url: 'https://wa.me/8619972918971',
          iconColor: '#FFFFFF',
          bgColor: '#25D366',
          sortOrder: 1,
          isActive: true,
        },
        {
          type: 'facebook',
          label: 'Facebook',
          url: 'https://www.facebook.com/profile.php?id=61584869132019',
          iconColor: '#FFFFFF',
          bgColor: '#1877F2',
          sortOrder: 2,
          isActive: true,
        },
        {
          type: 'telegram',
          label: 'Telegram',
          url: 'https://t.me/+8619972918971',
          iconColor: '#FFFFFF',
          bgColor: '#0088cc',
          sortOrder: 3,
          isActive: false, // 默认禁用，因为已经用Facebook替换了
        },
        {
          type: 'tiktok',
          label: 'TikTok',
          url: 'https://www.tiktok.com/@veryrich429',
          iconColor: '#FFFFFF',
          bgColor: '#000000',
          sortOrder: 4,
          isActive: true,
        },
        {
          type: 'instagram',
          label: 'Instagram',
          url: 'https://www.instagram.com/yourusername',
          iconColor: '#FFFFFF',
          bgColor: 'linear-gradient(45deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
          sortOrder: 5,
          isActive: true,
        },
      ]

      const buttons = defaultButtons.map(btn => repository.create(btn))
      await repository.save(buttons)
      
      console.log('✅ 社交按钮初始化成功')
      console.log('已创建以下按钮：')
      defaultButtons.forEach(btn => {
        console.log(`  - ${btn.type}: ${btn.label} (${btn.isActive ? '激活' : '禁用'}) - ${btn.url}`)
      })
    }

    await AppDataSource.destroy()
    process.exit(0)
  } catch (error) {
    console.error('初始化失败:', error)
    process.exit(1)
  }
}

initSocialButtons()

