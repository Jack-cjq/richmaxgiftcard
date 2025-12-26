import { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'
import { Content } from '../entities/Content.js'

export class ContentController {
  static async getPublic(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Content)
      let content = await repository.findOne({ where: { id: 1 } })

      if (!content) {
        // 创建默认内容
        content = repository.create({
          id: 1,
          heroTitle: '安全便捷的礼品卡兑换平台',
          heroSubtitle: '实时汇率 · 快速兑换 · 安全可靠',
          processSteps: [
            {
              title: '选择产品',
              description: '浏览兑换大厅，选择您需要的礼品卡产品',
              icon: '📋',
            },
            {
              title: '确认汇率',
              description: '查看实时汇率，确认兑换金额和汇率',
              icon: '💱',
            },
            {
              title: '提交订单',
              description: '填写兑换信息，提交订单并完成支付',
              icon: '📝',
            },
            {
              title: '快速到账',
              description: '订单处理完成后，礼品卡将快速到账',
              icon: '✅',
            },
          ],
          securityFeatures: [
            {
              title: '资金安全',
              description: '多重加密保护，资金安全有保障',
              icon: '🔒',
            },
            {
              title: '实时监控',
              description: '24小时实时监控，异常及时处理',
              icon: '👁️',
            },
            {
              title: '快速响应',
              description: '专业客服团队，快速响应您的需求',
              icon: '⚡',
            },
            {
              title: '透明交易',
              description: '所有交易记录公开透明，可随时查询',
              icon: '📊',
            },
          ],
          faqs: [
            {
              question: '如何兑换礼品卡？',
              answer: '在兑换大厅选择您需要的产品，确认汇率和金额后提交订单，完成支付即可。',
            },
            {
              question: '汇率是实时的吗？',
              answer: '是的，我们提供实时汇率显示，汇率会根据市场情况实时更新。',
            },
            {
              question: '兑换需要多长时间？',
              answer: '一般情况下，订单提交后会在1-3个工作日内处理完成并到账。',
            },
            {
              question: '支持哪些支付方式？',
              answer: '我们支持多种支付方式，包括支付宝、微信支付、银行卡等。',
            },
            {
              question: '如何查询订单状态？',
              answer: '您可以在成交记录页面查看所有订单的详细信息和状态。',
            },
            {
              question: '兑换失败怎么办？',
              answer: '如果兑换失败，我们会自动退款到您的原支付账户，如有问题请联系客服。',
            },
          ],
        })
        await repository.save(content)
      }

      res.json(content)
    } catch (error) {
      res.status(500).json({ message: '获取失败' })
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Content)
      let content = await repository.findOne({ where: { id: 1 } })

      if (!content) {
        content = repository.create({ id: 1 })
        await repository.save(content)
      }

      res.json(content)
    } catch (error) {
      res.status(500).json({ message: '获取失败' })
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repository = AppDataSource.getRepository(Content)
      let content = await repository.findOne({ where: { id: 1 } })

      if (!content) {
        content = repository.create({
          id: 1,
          heroTitle: req.body.heroTitle || '',
          heroSubtitle: req.body.heroSubtitle || '',
          processSteps: req.body.processSteps || [],
          securityFeatures: req.body.securityFeatures || [],
          faqs: req.body.faqs || [],
        })
      } else {
        Object.assign(content, req.body)
      }

      const saved = await repository.save(content)
      res.json(saved)
    } catch (error) {
      res.status(500).json({ message: '更新失败' })
    }
  }
}

