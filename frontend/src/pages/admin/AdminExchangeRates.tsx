import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

export default function AdminExchangeRates() {
  const [rates, setRates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [baseCurrency, setBaseCurrency] = useState('CNY')
  const [showBaseCurrencyForm, setShowBaseCurrencyForm] = useState(false)
  const [newBaseCurrency, setNewBaseCurrency] = useState('CNY')
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    currency: '',
    symbol: '',
    rate: '',
    change: '',
    changePercent: '',
    isPrimary: false,
  })
  const [isCreating, setIsCreating] = useState(false) // 创建中状态

  useEffect(() => {
    loadRates()
    loadBaseCurrency()
  }, [])

  const loadRates = async () => {
    try {
      const res = await adminApi.getExchangeRates()
      setRates(res.data)
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const loadBaseCurrency = async () => {
    try {
      const res = await adminApi.getBaseCurrency()
      setBaseCurrency(res.data.baseCurrency || 'CNY')
      setNewBaseCurrency(res.data.baseCurrency || 'CNY')
    } catch (error) {
      console.error('加载基准货币失败:', error)
    }
  }

  const handleUpdateBaseCurrency = async () => {
    if (!newBaseCurrency || newBaseCurrency.trim() === '') {
      toast.error('请输入基准货币')
      return
    }

    if (newBaseCurrency.toUpperCase() === baseCurrency.toUpperCase()) {
      toast.error('基准货币未改变')
      return
    }

    if (!confirm(`确定要将基准货币从 ${baseCurrency} 改为 ${newBaseCurrency.toUpperCase()} 吗？\n\n这将重新计算所有货币的汇率。`)) {
      return
    }

    try {
      await adminApi.updateBaseCurrency(newBaseCurrency.toUpperCase())
      toast.success('基准货币更新成功，所有汇率已重新计算')
      setBaseCurrency(newBaseCurrency.toUpperCase())
      setShowBaseCurrencyForm(false)
      loadRates() // 重新加载汇率数据
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败')
    }
  }

  const handleEdit = (rate: any) => {
    setEditing(rate.id)
    setShowForm(false)
    setFormData({
      currency: rate.currency,
      symbol: rate.symbol,
      rate: rate.rate.toString(),
      change: rate.change.toString(),
      changePercent: rate.changePercent.toString(),
      isPrimary: rate.isPrimary || false,
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({
      currency: '',
      symbol: '',
      rate: '',
      change: '',
      changePercent: '',
      isPrimary: false,
    })
  }

  const handleSave = async () => {
    if (editing) {
      // 编辑逻辑 - 需要所有字段
      if (!formData.currency || !formData.symbol || !formData.rate) {
        toast.error('请填写必填字段')
        return
      }
      
      try {
        await adminApi.updateExchangeRate(editing, {
          currency: formData.currency,
          symbol: formData.symbol,
          rate: parseFloat(formData.rate),
          change: parseFloat(formData.change || '0'),
          changePercent: parseFloat(formData.changePercent || '0'),
          isPrimary: formData.isPrimary || false,
        })
        toast.success('更新成功')
        handleCancel()
        loadRates()
      } catch (error: any) {
        toast.error(error.response?.data?.message || '操作失败')
      }
    } else {
      // 新增逻辑 - 只需要货币名称和符号，后端会自动获取汇率
      if (!formData.currency || !formData.symbol) {
        toast.error('请填写货币名称和符号')
        return
      }
      
      setIsCreating(true)
      try {
        // 只发送货币名称和符号，后端会自动获取实时汇率
        await adminApi.createExchangeRate({
          currency: formData.currency,
          symbol: formData.symbol.toUpperCase(),
          isPrimary: formData.isPrimary || false,
          // rate, change, changePercent 由后端自动获取
        })
        toast.success('创建成功，已自动获取实时汇率')
        handleCancel()
        loadRates()
      } catch (error: any) {
        toast.error(error.response?.data?.message || '创建失败')
      } finally {
        setIsCreating(false)
      }
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条汇率吗？')) {
      return
    }

    try {
      await adminApi.deleteExchangeRate(id)
      toast.success('删除成功')
      loadRates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700">汇率管理</h1>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <span className="text-sm font-medium text-neutral-600">当前基准货币：</span>
              <span className="text-lg font-bold text-blue-600">{baseCurrency}</span>
              <button
                onClick={() => {
                  setShowBaseCurrencyForm(!showBaseCurrencyForm)
                  setNewBaseCurrency(baseCurrency)
                }}
                className="ml-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {showBaseCurrencyForm ? '取消' : '修改'}
              </button>
            </div>
            <button
              onClick={async () => {
                try {
                  await adminApi.updateExchangeRates()
                  toast.success('汇率更新成功')
                  loadRates()
                } catch (error) {
                  toast.error('更新失败')
                }
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              更新汇率
            </button>
            <button
              onClick={() => {
                setShowForm(true)
                setEditing(null)
                setFormData({
                  currency: '',
                  symbol: '',
                  rate: '',
                  change: '',
                  changePercent: '',
                  isPrimary: false,
                })
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              新增汇率
            </button>
          </div>
        </div>

        {/* 基准货币配置表单 */}
        {showBaseCurrencyForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-6 mb-6">
            <h2 className="text-lg font-bold text-neutral-700 mb-4">修改基准货币</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  新基准货币 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={newBaseCurrency}
                  onChange={(e) => setNewBaseCurrency(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：USD, EUR, GBP"
                  maxLength={3}
                />
                <p className="text-xs text-neutral-500 mt-2">
                  提示：修改基准货币后，系统将自动重新计算所有货币的汇率
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleUpdateBaseCurrency}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setShowBaseCurrencyForm(false)
                    setNewBaseCurrency(baseCurrency)
                  }}
                  className="px-6 py-2 bg-neutral-200 text-neutral-700 rounded-md hover:bg-neutral-300 transition-colors font-semibold"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 新增/编辑表单 */}
        {(showForm || editing) && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑汇率' : '新增汇率'}
            </h2>
            {!editing && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                💡 提示：只需填写货币名称和符号，系统将自动从API获取实时汇率
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  货币名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：美元"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  货币符号 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) =>
                    setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：USD"
                  disabled={isCreating}
                />
              </div>
              {/* 编辑时才显示这些字段 */}
              {editing && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">
                      汇率 <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                      placeholder="例如：7.2500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">
                      变化值
                    </label>
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.change}
                      onChange={(e) =>
                        setFormData({ ...formData, change: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                      placeholder="例如：0.0100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">
                      变化率 (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.changePercent}
                      onChange={(e) =>
                        setFormData({ ...formData, changePercent: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                      placeholder="例如：0.14"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-2">
                      <input
                        type="checkbox"
                        checked={formData.isPrimary || false}
                        onChange={(e) =>
                          setFormData({ ...formData, isPrimary: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 border-silver-200 rounded focus:ring-blue-500"
                      />
                      是否为主要货币（卡片显示）
                    </label>
                    <p className="text-xs text-neutral-500 mt-1">
                      主要货币将在前台以卡片形式显示，其他货币以表格形式显示
                    </p>
                  </div>
                </>
              )}
              {/* 新增时也可以设置是否为主要货币 */}
              {!editing && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary || false}
                      onChange={(e) =>
                        setFormData({ ...formData, isPrimary: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-silver-200 rounded focus:ring-blue-500"
                    />
                    是否为主要货币（卡片显示）
                  </label>
                  <p className="text-xs text-neutral-500 mt-1">
                    主要货币将在前台以卡片形式显示，其他货币以表格形式显示
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={isCreating}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? '创建中...' : editing ? '保存' : '创建'}
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-silver-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <div className="overflow-x-auto">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">说明：</span>
                  所有汇率均以 <span className="font-bold">{baseCurrency}</span> 为基准货币显示。
                  例如：USD 的汇率为 7.2500 表示 1 USD = 7.2500 {baseCurrency}
                </p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-silver-200">
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      货币
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      符号
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      汇率 (1 单位 = X {baseCurrency})
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      变化
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      变化率
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      更新时间
                    </th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500">
                        暂无汇率数据，请添加
                      </td>
                    </tr>
                  ) : (
                    rates.map((rate) => {
                      const isPrimary = rate.isPrimary
                      return (
                      <tr
                        key={rate.id}
                        className="border-b border-silver-100 hover:bg-silver-50 transition-colors"
                      >
                        {editing === rate.id ? (
                          <>
                            <td colSpan={7} className="py-4 px-4">
                              <div className="text-neutral-600 font-medium">
                                正在编辑中，请使用上方表单
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-neutral-700">
                                  {rate.currency}
                                </span>
                                {isPrimary && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                                    主要
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-neutral-600">
                              {rate.symbol}
                            </td>
                            <td className="py-4 px-4 font-bold text-neutral-700">
                              {Number(rate.rate).toFixed(4)}
                            </td>
                            <td
                              className={`py-4 px-4 font-medium ${
                                Number(rate.change) >= 0
                                  ? 'text-green-600'
                                  : 'text-danger'
                              }`}
                            >
                              {Number(rate.change) >= 0 ? '+' : ''}
                              {Number(rate.change).toFixed(4)}
                            </td>
                            <td
                              className={`py-4 px-4 font-medium ${
                                Number(rate.changePercent) >= 0
                                  ? 'text-green-600'
                                  : 'text-danger'
                              }`}
                            >
                              {Number(rate.changePercent) >= 0 ? '+' : ''}
                              {Number(rate.changePercent).toFixed(2)}%
                            </td>
                            <td className="py-4 px-4 text-sm text-neutral-500">
                              {new Date(rate.updatedAt).toLocaleString('zh-CN')}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(rate)}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-200 transition-colors"
                                >
                                  编辑
                                </button>
                                <button
                                  onClick={() => handleDelete(rate.id)}
                                  className="px-3 py-1 bg-danger/10 text-danger rounded-md text-sm font-semibold hover:bg-danger/20 transition-colors"
                                >
                                  删除
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
