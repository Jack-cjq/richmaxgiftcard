import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

interface Product {
  id: number
  name: string
  description: string
  category: string
  exchangeRate: number
  minAmount: number
  maxAmount: number
  status: 'active' | 'inactive'
  images?: string[]
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [supportedCards, setSupportedCards] = useState<any[]>([]) // 支持的礼品卡列表
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<number | null>(null)
  const [conversionConfig, setConversionConfig] = useState<{ ngnRate: number; ghcRate: number } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    exchangeRate: '',
    minAmount: '',
    maxAmount: '',
    status: 'active' as 'active' | 'inactive',
  })
  const [images, setImages] = useState<(File | string)[]>([]) // 混合类型：File（新上传）或 string（已有路径）

  useEffect(() => {
    loadProducts()
    loadSupportedCards()
    loadConversionConfig()
  }, [])

  const loadConversionConfig = async () => {
    try {
      const res = await adminApi.getConversionConfig()
      setConversionConfig({
        ngnRate: res.data.ngnRate || 200,
        ghcRate: res.data.ghcRate || 1.0,
      })
    } catch (error) {
      console.error('加载汇率配置失败:', error)
      setConversionConfig({
        ngnRate: 200,
        ghcRate: 1.0,
      })
    }
  }

  const getConvertedAmount = (amount: number, currency: 'NGN' | 'GHC'): number => {
    if (!conversionConfig) return amount
    if (currency === 'NGN') {
      return Math.floor(amount * conversionConfig.ngnRate)
    } else {
      return Math.floor(amount * conversionConfig.ghcRate)
    }
  }

  const loadProducts = async () => {
    try {
      const res = await adminApi.getProducts()
      setProducts(res.data.products || res.data || [])
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const loadSupportedCards = async () => {
    try {
      const res = await adminApi.getSupportedCards()
      setSupportedCards(res.data || [])
    } catch (error) {
      console.error('加载支持的礼品卡失败:', error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditing(product.id)
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      exchangeRate: product.exchangeRate.toString(),
      minAmount: product.minAmount.toString(),
      maxAmount: product.maxAmount.toString(),
      status: product.status,
    })
    // 将已有的图片路径添加到images数组
    setImages(product.images || [])
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormData({
      name: '',
      description: '',
      category: '',
      exchangeRate: '',
      minAmount: '',
      maxAmount: '',
      status: 'active',
    })
    setImages([])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setImages([...images, ...newFiles])
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    // 验证：去除空格后检查
    if (!formData.name || formData.name.trim().length === 0) {
      toast.error('请填写产品名称')
      return
    }
    if (!formData.category || formData.category.trim().length === 0) {
      toast.error('请选择产品分类')
      return
    }

    try {
      const productData: any = {
        name: formData.name.trim(),
        description: formData.description || '',
        category: formData.category.trim(),
        exchangeRate: formData.exchangeRate || '0',
        minAmount: formData.minAmount || '0',
        maxAmount: formData.maxAmount || '0',
        status: formData.status,
        images, // 包含File对象和字符串路径的混合数组
      }

      if (editing) {
        await adminApi.updateProduct(editing, productData)
        toast.success('更新成功')
      } else {
        await adminApi.createProduct(productData)
        toast.success('创建成功')
      }
      handleCancel()
      loadProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个产品吗？')) return

    try {
      await adminApi.deleteProduct(id)
      toast.success('删除成功')
      loadProducts()
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const getImageUrl = (image: File | string) => {
    if (typeof image === 'string') {
      if (image.startsWith('http') || image.startsWith('data:image/')) {
        return image
      }
      if (image.startsWith('/')) {
        return image
      }
      return `/images/products/${image.split('/').pop()}`
    }
    return URL.createObjectURL(image)
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700">产品管理</h1>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setFormData({
                name: '',
                description: '',
                category: '',
                exchangeRate: '',
                minAmount: '',
                maxAmount: '',
                status: 'active',
              })
              setImages([])
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            新增产品
          </button>
        </div>

        {showForm && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑产品' : '新增产品'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  产品名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：Xbox礼品卡"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  分类 <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                >
                  <option value="">请选择分类</option>
                  {supportedCards.map((card) => (
                    <option key={card.id} value={card.name}>
                      {card.name}
                    </option>
                  ))}
                </select>
                {supportedCards.length === 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    提示：请先在"礼品卡管理"中添加支持的礼品卡
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  rows={3}
                  placeholder="产品详细描述"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  产品图片（可上传多张）
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm"
                />
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImageUrl(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md border border-silver-200"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  汇率
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
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                >
                  <option value="active">启用</option>
                  <option value="inactive">禁用</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  最小金额
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, minAmount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  最大金额
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.maxAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAmount: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：10000"
                />
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
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-silver-200 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-silver-200">
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">预览</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">产品名称</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">分类</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">汇率</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">限额 (₦ / GH₵)</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">状态</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500">
                        暂无产品数据，请添加
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-silver-100 hover:bg-silver-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={
                                product.images[0].startsWith('http')
                                  ? product.images[0]
                                  : product.images[0].startsWith('/')
                                  ? product.images[0]
                                  : `/images/products/${product.images[0].split('/').pop()}`
                              }
                              alt={product.name}
                              className="h-16 w-24 object-cover rounded-md border border-silver-200"
                            />
                          ) : (
                            <div className="h-16 w-24 bg-silver-100 rounded-md flex items-center justify-center text-xs text-neutral-400">
                              无图片
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 font-semibold text-neutral-700">
                          {product.name}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {product.category}
                        </td>
                        <td className="py-4 px-4 text-neutral-700 font-medium">
                          {Number(product.exchangeRate).toFixed(4)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-neutral-600">
                            <div className="font-medium">₦{getConvertedAmount(Number(product.minAmount), 'NGN').toLocaleString()} - ₦{getConvertedAmount(Number(product.maxAmount), 'NGN').toLocaleString()}</div>
                            <div className="text-sm mt-1">GH₵{getConvertedAmount(Number(product.minAmount), 'GHC').toLocaleString()} - GH₵{getConvertedAmount(Number(product.maxAmount), 'GHC').toLocaleString()}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${
                              product.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-danger'
                            }`}
                          >
                            {product.status === 'active' ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-200 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
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
        )}
      </div>
    </AdminLayout>
  )
}
