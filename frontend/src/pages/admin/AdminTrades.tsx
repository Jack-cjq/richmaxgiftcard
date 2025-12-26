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

    try {
      const tradeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        exchangeRate: parseFloat(formData.exchangeRate),
        totalAmount: parseFloat(formData.totalAmount),
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
        <div className="flex justify-between items-center mb-8">
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
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, totalAmount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
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
                        汇率
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                        总金额 (₦ / GH₵)
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
                        <td colSpan={7} className="text-center py-8 text-neutral-500">
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
                            <div>₦{getConvertedAmount(Number(trade.totalAmount), 'NGN').toLocaleString()}</div>
                            <div className="text-sm mt-1">GH₵{getConvertedAmount(Number(trade.totalAmount), 'GHC').toLocaleString()}</div>
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

