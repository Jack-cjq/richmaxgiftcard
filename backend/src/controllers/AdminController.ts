import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Admin } from '../entities/Admin.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export class AdminController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res.status(400).json({ message: '请输入账号和密码' })
      }

      const adminRepository = AppDataSource.getRepository(Admin)
      const admin = await adminRepository.findOne({ where: { username } })

      if (!admin) {
        return res.status(401).json({ message: '账号或密码错误' })
      }

      const isValid = await bcrypt.compare(password, admin.password)
      if (!isValid) {
        return res.status(401).json({ message: '账号或密码错误' })
      }

      const token = jwt.sign(
        { adminId: admin.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      )

      res.json({ token })
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ message: '登录失败' })
    }
  }
}

