import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

export default function AdminConversionConfig() {
  const [loading, setLoading] = useState(true)
  const [supportedCards, setSupportedCards] = useState<any[]>([])
  const [formData, setFormData] = useState({
    rRate: '7.13', // R汇率（USD到CNY）
    serviceFeePercent: '0.03', // 服务费比例（3%）
    ngnRate: '200', // NGN汇率（1 CNY = 200 NGN）
    ghcRate: '1.0', // GHC汇率（1 CNY = 1.0 GHC）
    cardCategories: {} as Record<string, string[]>, // 卡片类型对应的种类列表
    categoryRates: {} as Record<string, Record<string, { rate: number; currency: string }>>, // 汇率配置
  })
  const [editingCard, setEditingCard] = useState<string>('') // 正在编辑的卡片类型
  const [newCategory, setNewCategory] = useState<string>('') // 新添加的种类名称

  useEffect(() => {
    loadConfig()
    loadSupportedCards()
  }, [])

  const loadSupportedCards = async () => {
    try {
      const res = await adminApi.getSupportedCards()
      setSupportedCards(res.data || [])
    } catch (error) {
      console.error('加载支持的卡片失败:', error)
    }
  }

  const loadConfig = async () => {
    try {
      const res = await adminApi.getConversionConfig()
      const config = res.data
      setFormData({
        rRate: (config.rRate || 7.13).toString(),
        serviceFeePercent: (config.serviceFeePercent || 0.03).toString(),
        ngnRate: (config.ngnRate || 200).toString(),
        ghcRate: (config.ghcRate || 1.0).toString(),
        cardCategories: config.cardCategories || {},
        categoryRates: config.categoryRates || {},
      })
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await adminApi.updateConversionConfig({
        rRate: parseFloat(formData.rRate),
        serviceFeePercent: parseFloat(formData.serviceFeePercent),
        ngnRate: parseFloat(formData.ngnRate),
        ghcRate: parseFloat(formData.ghcRate),
        cardCategories: formData.cardCategories,
        categoryRates: formData.categoryRates,
      })
      toast.success('保存成功')
      loadConfig()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '保存失败')
    }
  }

  // 添加种类到指定卡片类型
  const handleAddCategory = (cardType: string) => {
    if (!newCategory.trim()) {
      toast.error('请输入种类名称')
      return
    }
    const categories = formData.cardCategories[cardType] || []
    if (categories.includes(newCategory)) {
      toast.error('该种类已存在')
      return
    }
    setFormData({
      ...formData,
      cardCategories: {
        ...formData.cardCategories,
        [cardType]: [...categories, newCategory],
      },
      categoryRates: {
        ...formData.categoryRates,
        [cardType]: {
          ...(formData.categoryRates[cardType] || {}),
          [newCategory]: { rate: 7.13, currency: 'USD' }, // 默认汇率
        },
      },
    })
    setNewCategory('')
    toast.success('种类添加成功')
  }

  // 删除种类
  const handleDeleteCategory = (cardType: string, category: string) => {
    const categories = formData.cardCategories[cardType] || []
    const newCategories = categories.filter(c => c !== category)
    const newCategoryRates = { ...formData.categoryRates }
    if (newCategoryRates[cardType]) {
      delete newCategoryRates[cardType][category]
    }
    setFormData({
      ...formData,
      cardCategories: {
        ...formData.cardCategories,
        [cardType]: newCategories,
      },
      categoryRates: newCategoryRates,
    })
    toast.success('种类删除成功')
  }

  // 更新种类汇率
  const handleUpdateCategoryRate = (cardType: string, category: string, field: 'rate' | 'currency', value: string | number) => {
    setFormData({
      ...formData,
      categoryRates: {
        ...formData.categoryRates,
        [cardType]: {
          ...(formData.categoryRates[cardType] || {}),
          [category]: {
            ...(formData.categoryRates[cardType]?.[category] || { rate: 7.13, currency: 'USD' }),
            [field]: value,
          },
        },
      },
    })
  }

  // 计算示例
  const calculateExample = () => {
    const amount = 100 // 示例：100美元
    const rRate = parseFloat(formData.rRate) || 7.13
    const serviceFeePercent = parseFloat(formData.serviceFeePercent) || 0.03
    const customerPercent = 1 - serviceFeePercent
    const ngnRate = parseFloat(formData.ngnRate) || 200
    const ghcRate = parseFloat(formData.ghcRate) || 1.0

    const step1 = amount * rRate * customerPercent
    const ngnResult = Math.floor(step1 * ngnRate)
    const ghcResult = Math.floor(step1 * ghcRate)

    return { step1, ngnResult, ghcResult }
  }

  const example = calculateExample()

  if (loading) {
    return (
      <AdminLayout>
        <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
          <div className="h-64 bg-silver-200 rounded animate-pulse"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700">换算配置</h1>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            保存配置
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 配置表单 */}
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">换算参数配置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  R汇率（USD到CNY） <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={formData.rRate}
                  onChange={(e) => setFormData({ ...formData, rRate: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：7.13"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  1美元 = {formData.rRate} 人民币
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  服务费比例 <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={formData.serviceFeePercent}
                  onChange={(e) => setFormData({ ...formData, serviceFeePercent: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：0.03（表示3%）"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  服务费：{(parseFloat(formData.serviceFeePercent) * 100).toFixed(1)}%，客户获得：{((1 - parseFloat(formData.serviceFeePercent)) * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  尼日利亚奈拉汇率（NGN） <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ngnRate}
                  onChange={(e) => setFormData({ ...formData, ngnRate: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：200"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  1人民币 = {formData.ngnRate} 尼日利亚奈拉
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  加纳塞地汇率（GHC） <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ghcRate}
                  onChange={(e) => setFormData({ ...formData, ghcRate: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：1.0"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  1人民币 = {formData.ghcRate} 加纳塞地
                </p>
              </div>
            </div>
          </div>

          {/* 计算示例 */}
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">计算示例</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-sm text-neutral-600 mb-2">
                  <strong>示例：</strong>客户商品价值 100 美元
                </p>
                <div className="space-y-2 text-sm">
                  <div className="text-neutral-700">
                    <strong>步骤1：</strong> 100 × {formData.rRate} × {(1 - parseFloat(formData.serviceFeePercent)).toFixed(2)} = <strong className="text-blue-600">{example.step1.toFixed(2)}</strong> 人民币
                  </div>
                  <div className="text-neutral-700">
                    <strong>步骤2（NGN）：</strong> {example.step1.toFixed(2)} × {formData.ngnRate} = <strong className="text-green-600">₦{example.ngnResult.toLocaleString()}</strong>
                  </div>
                  <div className="text-neutral-700">
                    <strong>步骤2（GHC）：</strong> {example.step1.toFixed(2)} × {formData.ghcRate} = <strong className="text-green-600">₵{example.ghcResult.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-silver-50 rounded-md border border-silver-200">
                <h3 className="font-semibold text-neutral-700 mb-2">换算公式</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  客户所得 = 商品价值 × R汇率 × (1 - 服务费比例) × 客户地区货币汇率
                </p>
                <p className="text-xs text-neutral-500 mt-2">
                  注意：最终结果会去掉小数点（向下取整）
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 卡片类型和种类管理 */}
        <div className="mt-8 bg-surface rounded-md p-6 shadow-card border border-silver-200">
          <h2 className="text-xl font-bold text-neutral-700 mb-4">卡片类型和种类管理</h2>
          <div className="space-y-6">
            {supportedCards.map((card) => {
              const cardType = card.name
              const categories = formData.cardCategories[cardType] || []
              return (
                <div key={card.id} className="border border-silver-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-neutral-700">{cardType}</h3>
                    <button
                      onClick={() => setEditingCard(editingCard === cardType ? '' : cardType)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      {editingCard === cardType ? '收起' : '管理种类'}
                    </button>
                  </div>
                  
                  {editingCard === cardType && (
                    <div className="space-y-4">
                      {/* 添加新种类 */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          placeholder="输入新种类名称（如：Amazon US）"
                          className="flex-1 px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddCategory(cardType)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddCategory(cardType)}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          添加种类
                        </button>
                      </div>

                      {/* 种类列表 */}
                      {categories.length === 0 ? (
                        <p className="text-sm text-neutral-500">暂无种类，请添加</p>
                      ) : (
                        <div className="space-y-3">
                          {categories.map((category) => (
                            <div key={category} className="flex items-center gap-4 p-3 bg-silver-50 rounded-md">
                              <div className="flex-1">
                                <div className="font-medium text-neutral-700 mb-2">{category}</div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-neutral-600 mb-1">汇率</label>
                                    <input
                                      type="number"
                                      step="0.0001"
                                      value={formData.categoryRates[cardType]?.[category]?.rate || 7.13}
                                      onChange={(e) => handleUpdateCategoryRate(cardType, category, 'rate', parseFloat(e.target.value) || 0)}
                                      className="w-full px-3 py-1.5 text-sm border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-neutral-600 mb-1">货币</label>
                                    <input
                                      type="text"
                                      value={formData.categoryRates[cardType]?.[category]?.currency || 'USD'}
                                      onChange={(e) => handleUpdateCategoryRate(cardType, category, 'currency', e.target.value)}
                                      className="w-full px-3 py-1.5 text-sm border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                                      placeholder="USD"
                                    />
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteCategory(cardType, category)}
                                className="px-3 py-1.5 bg-danger text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                              >
                                删除
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

