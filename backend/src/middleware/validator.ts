import { Request, Response, NextFunction } from 'express'

/**
 * 数据验证中间件
 * 确保所有输入数据在后端验证
 */

// 验证分页参数
export function validatePagination(req: Request, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10

  if (page < 1) {
    return res.status(400).json({ message: '页码必须大于0' })
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({ message: '每页数量必须在1-100之间' })
  }

  // 规范化参数
  req.query.page = String(page)
  req.query.limit = String(Math.min(limit, 100))

  next()
}

// 验证ID参数
export function validateId(req: Request, res: Response, next: NextFunction) {
  const id = parseInt(req.params.id)
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ message: '无效的ID' })
  }
  next()
}

// 验证汇率数据
export function validateExchangeRate(req: Request, res: Response, next: NextFunction) {
  const { currency, symbol, rate } = req.body

  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ message: '货币名称必填' })
  }

  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ message: '货币符号必填' })
  }

  // 创建时（POST），汇率是可选的（系统会自动获取）
  // 更新时（PUT），汇率是必填的
  const isUpdate = req.method === 'PUT'
  
  if (isUpdate) {
    // 更新时必须提供汇率
    if (rate === undefined || rate === null || typeof rate !== 'number' || rate <= 0) {
      return res.status(400).json({ message: '汇率必须是大于0的数字' })
    }
  } else {
    // 创建时，如果提供了汇率则验证，不提供（undefined/null）则允许（由后端自动获取）
    if (rate !== undefined && rate !== null) {
      if (typeof rate !== 'number' || rate <= 0) {
        return res.status(400).json({ message: '汇率必须是大于0的数字' })
      }
    }
    // 如果 rate 是 undefined 或 null，允许通过（后端会自动获取）
  }

  next()
}

// 验证产品数据
export function validateProduct(req: Request, res: Response, next: NextFunction) {
  // 当使用 multipart/form-data 时，multer 已经解析了 req.body，所有字段都是字符串
  const name = req.body.name
  const description = req.body.description || ''
  const category = req.body.category
  const exchangeRateStr = req.body.exchangeRate || '0'
  const minAmountStr = req.body.minAmount || '0'
  const maxAmountStr = req.body.maxAmount || '0'
  
  const exchangeRate = parseFloat(exchangeRateStr)
  const minAmount = parseFloat(minAmountStr)
  const maxAmount = parseFloat(maxAmountStr)

  // 验证产品名称（去除空格后检查）
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: '产品名称必填' })
  }

  // 验证分类
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return res.status(400).json({ message: '产品分类必填' })
  }

  // 描述可以为空，但如果是字符串类型，允许空字符串
  // 验证汇率
  if (isNaN(exchangeRate) || exchangeRate <= 0) {
    return res.status(400).json({ message: '汇率必须是大于0的数字' })
  }

  // 验证最小金额
  if (isNaN(minAmount) || minAmount < 0) {
    return res.status(400).json({ message: '最小金额必须大于等于0' })
  }

  // 验证最大金额
  if (isNaN(maxAmount) || maxAmount <= minAmount) {
    return res.status(400).json({ message: '最大金额必须大于最小金额' })
  }

  // 将转换后的值写回 req.body，供后续使用
  req.body.exchangeRate = exchangeRate
  req.body.minAmount = minAmount
  req.body.maxAmount = maxAmount
  req.body.description = description

  next()
}

// 验证交易数据
export function validateTrade(req: Request, res: Response, next: NextFunction) {
  const { productName, amount, exchangeRate, totalAmount, currency } = req.body

  if (!productName || typeof productName !== 'string') {
    return res.status(400).json({ message: '产品名称必填' })
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: '金额必须是大于0的数字' })
  }

  if (typeof exchangeRate !== 'number' || exchangeRate <= 0) {
    return res.status(400).json({ message: '汇率必须是大于0的数字' })
  }

  if (typeof totalAmount !== 'number' || totalAmount <= 0) {
    return res.status(400).json({ message: '总金额必须是大于0的数字' })
  }

  if (!currency || typeof currency !== 'string') {
    return res.status(400).json({ message: '货币类型必填' })
  }

  next()
}

