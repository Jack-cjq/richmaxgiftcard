import 'reflect-metadata'
import bcrypt from 'bcryptjs'
import { AppDataSource } from '../data-source.js'
import { Admin } from '../entities/Admin.js'

async function initAdmin() {
  try {
    await AppDataSource.initialize()
    console.log('数据库连接成功')

    const adminRepository = AppDataSource.getRepository(Admin)

    // 检查是否已有管理员
    const existingAdmin = await adminRepository.findOne({
      where: { username: 'admin' },
    })

    if (existingAdmin) {
      console.log('管理员已存在')
      await AppDataSource.destroy()
      return
    }

    // 创建默认管理员
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const admin = adminRepository.create({
      username: 'admin',
      password: hashedPassword,
    })

    await adminRepository.save(admin)
    console.log('默认管理员创建成功')
    console.log('用户名: admin')
    console.log('密码: admin123')

    await AppDataSource.destroy()
  } catch (error) {
    console.error('初始化失败:', error)
    process.exit(1)
  }
}

initAdmin()

