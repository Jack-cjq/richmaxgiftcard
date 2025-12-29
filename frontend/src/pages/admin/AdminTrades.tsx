import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import zhCN from 'date-fns/locale/zh-CN'

export default function AdminTrades() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [conversionConfig, setConversionConfig] = useState<{ ngnRate: number; ghcRate: number } | null>(null)
  const [formData, setFormData] = useState({
    productName: '',
    amount: '',
    exchangeRate: '',
    totalAmount: '',
    currency: '',
    status: 'completed',
  })

  useEffect(() => {
    loadTrades()
    loadConversionConfig()
  }, [page, limit])

  // 自动计算总金额：金额 × 汇率
  useEffect(() => {
    if (formData.amount && formData.exchangeRate) {
      const amount = parseFloat(formData.amount)
      const exchangeRate = parseFloat(formData.exchangeRate)
      if (!isNaN(amount) && !isNaN(exchangeRate) && amount > 0 && exchangeRate > 0) {
        const calculatedTotal = (amount * exchangeRate).toFixed(2)
        setFormData(prev => ({ ...prev, totalAmount: calculatedTotal }))
      }
    }
  }, [formData.amount, formData.exchangeRate])

  const loadConversionConfig = async () => {
    try {
      const res = await adminApi.getConversionConfig()
      setConversionConfig({
        ngnRate: res.data.ngnRate || 200,
        ghcRate: res.data.ghcRate || 1.0,
      })
    } catch (error) {
      console.error('加载汇率配置失败:', error)
      // 使用默认值
      setConversionConfig({
        ngnRate: 200,
        ghcRate: 1.0,
      })
    }
  }

  const loadTrades = async () => {
    try {
      const res = await adminApi.getTrades(page, limit)
      setTrades(res.data.trades || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.totalPages || 0)
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // 重置到第一页
  }

  const handleEdit = (trade: any) => {
    setEditing(trade.id)
    setShowForm(true)
    setFormData({
      productName: trade.productName,
      amount: trade.amount.toString(),
      exchangeRate: trade.exchangeRate.toString(),
      totalAmount: trade.totalAmount.toString(),
      currency: trade.currency,
      status: trade.status,
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({
      productName: '',
      amount: '',
      exchangeRate: '',
      totalAmount: '',
      currency: '',
      status: 'completed',
    })
  }

  const handleSave = async () => {
    if (!formData.productName || !formData.currency || !formData.amount || !formData.exchangeRate || !formData.totalAmount) {
      toast.error('请填写所有必填字段')
      return
    }

    // 验证总金额是否正确（金额 × 汇率）
    const amount = parseFloat(formData.amount)
    const exchangeRate = parseFloat(formData.exchangeRate)
    const totalAmount = parseFloat(formData.totalAmount)
    const expectedTotal = amount * exchangeRate
    
    // 允许小数点后2位的误差
    if (Math.abs(totalAmount - expectedTotal) > 0.01) {
      toast.error(`总金额不正确！应该是 ${expectedTotal.toFixed(2)}（金额 × 汇率）`)
      return
    }

    try {
      const tradeData = {
        ...formData,
        amount: amount,
        exchangeRate: exchangeRate,
        totalAmount: totalAmount,
      }

      if (editing) {
        await adminApi.updateTrade(editing, tradeData)
        toast.success('更新成功')
      } else {
        await adminApi.createTrade(tradeData)
        toast.success('创建成功')
      }
      handleCancel()
      loadTrades()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条交易记录吗？')) return

    try {
      await adminApi.deleteTrade(id)
      toast.success('删除成功')
      loadTrades()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const getConvertedAmount = (totalAmount: number, currency: 'NGN' | 'GHC'): number => {
    if (!conversionConfig) return totalAmount
    if (currency === 'NGN') {
      return Math.floor(totalAmount * conversionConfig.ngnRate)
    } else {
      return Math.floor(totalAmount * conversionConfig.ghcRate)
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-neutral-700">交易管理</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-neutral-600">每页显示：</label>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-3 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm font-medium"
              >
                <option value={10}>10 条</option>
                <option value={20}>20 条</option>
                <option value={50}>50 条</option>
                <option value={100}>100 条</option>
              </select>
            </div>
            <button
              onClick={() => {
                setShowForm(true)
                setEditing(null)
                setFormData({
                  productName: '',
                  amount: '',
                  exchangeRate: '',
                  totalAmount: '',
                  currency: '',
                  status: 'completed',
                })
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              新增交易
            </button>
          </div>
        </div>

        {/* 字段说明 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            字段说明与计算规则
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                <span className="text-lg">📊</span>
                基准货币
              </p>
              <p className="text-neutral-700 leading-relaxed">
                系统使用 <span className="font-bold text-blue-600 text-base">CNY（人民币）</span> 作为基准货币。
                <br />
                所有交易金额最终都会转换为 <span className="font-semibold">CNY</span> 进行存储和计算。
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                <span className="text-lg">💰</span>
                字段含义
              </p>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>产品名称：</strong>交易的产品名称（如：Steam US）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>货币：</strong>原始货币类型（如：USD）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>金额：</strong>原始货币的金额（如：500 USD）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>汇率：</strong>原始货币到基准货币（CNY）的汇率（如：1 USD = 5.4 CNY）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>总金额：</strong>自动计算 = 金额 × 汇率（单位：CNY）</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span><strong>状态：</strong>交易状态（已完成/处理中）</span>
                </li>
              </ul>
            </div>
            <div className="md:col-span-2 bg-white rounded-lg p-4 border border-blue-100">
              <p className="font-semibold mb-3 text-blue-900 flex items-center gap-2">
                <span className="text-lg">🔄</span>
                计算流程
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                <div className="flex flex-wrap items-center gap-2 mb-3 justify-center md:justify-start">
                  <span className="font-mono bg-blue-100 text-blue-900 px-3 py-1.5 rounded-md font-semibold">原始金额（USD）</span>
                  <span className="text-blue-600 font-bold text-lg">×</span>
                  <span className="font-mono bg-blue-100 text-blue-900 px-3 py-1.5 rounded-md font-semibold">汇率（USD→CNY）</span>
                  <span className="text-blue-600 font-bold text-lg">=</span>
                  <span className="font-mono bg-blue-200 text-blue-900 px-3 py-1.5 rounded-md font-semibold">总金额（CNY）</span>
                </div>
                <div className="text-xs text-blue-700 bg-white rounded p-2 border border-blue-100">
                  <p className="font-semibold mb-1">📝 示例计算：</p>
                  <p className="font-mono">
                    500 USD × 5.4 = 2,700 CNY
                    <br />
                    <span className="text-blue-600">↓ 转换为显示货币</span>
                    <br />
                    ₦540,000 (NGN) 和 GH₵2,700 (GHC)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {(showForm || editing) && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑交易记录' : '新增交易记录'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  产品名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({ ...formData, productName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：Xbox礼品卡"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  货币 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：USD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  金额 <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：100.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  汇率 <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.exchangeRate}
                  onChange={(e) =>
                    setFormData({ ...formData, exchangeRate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：7.2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  总金额 <span className="text-danger">*</span>
                  <span className="text-xs text-neutral-500 ml-2">(自动计算：金额 × 汇率)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  readOnly
                  className="w-full px-4 py-2 border border-silver-200 rounded-md bg-silver-50 cursor-not-allowed"
                  placeholder="自动计算：金额 × 汇率"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  状态 <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                >
                  <option value="completed">已完成</option>
                  <option value="processing">处理中</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editing ? '保存' : '创建'}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors font-semibold"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-silver-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-silver-200">
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        产品
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        金额
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        <div className="flex flex-col">
                          <span>汇率</span>
                          <span className="text-xs font-normal text-neutral-400 mt-0.5">(→CNY)</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        <div className="flex flex-col">
                          <span>总金额 (₦)</span>
                          <span className="text-xs font-normal text-neutral-400 mt-0.5">(从CNY转换)</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        <div className="flex flex-col">
                          <span>总金额 (GH₵)</span>
                          <span className="text-xs font-normal text-neutral-400 mt-0.5">(从CNY转换)</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        时间
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        状态
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-neutral-500">
                          暂无交易数据
                        </td>
                      </tr>
                    ) : (
                      trades.map((trade) => (
                        <tr
                          key={trade.id}
                          className="border-b border-silver-100 hover:bg-silver-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="font-semibold text-neutral-700">
                              {trade.productName}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {trade.currency}
                            </div>
                          </td>
                        <td className="py-4 px-4 text-neutral-700 font-medium">
                          {Number(trade.amount).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-neutral-700 font-medium">
                          {Number(trade.exchangeRate).toFixed(4)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-green-600 font-bold">
                            ₦{getConvertedAmount(Number(trade.totalAmount), 'NGN').toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-green-600 font-bold">
                            GH₵{getConvertedAmount(Number(trade.totalAmount), 'GHC').toLocaleString()}
                          </div>
                        </td>
                          <td className="py-4 px-4 text-neutral-500 text-sm">
                            {format(new Date(trade.createdAt), 'yyyy-MM-dd HH:mm', {
                              locale: zhCN,
                            })}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                                trade.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-warning/20 text-warning'
                              }`}
                            >
                              {trade.status === 'completed' ? '已完成' : '处理中'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(trade)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-200 transition-colors"
                              >
                                编辑
                              </button>
                              <button
                                onClick={() => handleDelete(trade.id)}
                                className="px-3 py-1 bg-danger/10 text-danger rounded-md text-sm font-semibold hover:bg-danger/20 transition-colors"
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-blue-500/30 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors font-medium"
                >
                  上一页
                </button>
                <span className="px-4 py-2 text-neutral-600 font-medium">
                  第 {page} / {totalPages} 页，共 {total} 条记录
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-md border border-blue-500/30 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 transition-colors font-medium"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  )
}

