import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

export default function AdminSupportedCards() {
  const [cards, setCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      const res = await adminApi.getSupportedCards()
      setCards(res.data)
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const handleEdit = (card: any) => {
    setEditing(card.id)
    setShowForm(false)
    setFormData({
      name: card.name,
      logoUrl: card.logoUrl || '',
      description: card.description || '',
      sortOrder: card.sortOrder || 0,
      isActive: card.isActive !== undefined ? card.isActive : true,
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({
      name: '',
      logoUrl: '',
      description: '',
      sortOrder: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('请填写卡片名称')
      return
    }

    try {
      if (editing) {
        await adminApi.updateSupportedCard(editing, formData)
        toast.success('更新成功')
      } else {
        await adminApi.createSupportedCard(formData)
        toast.success('创建成功')
      }
      handleCancel()
      loadCards()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张卡片吗？')) {
      return
    }

    try {
      await adminApi.deleteSupportedCard(id)
      toast.success('删除成功')
      loadCards()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败')
    }
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700">礼品卡管理</h1>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setFormData({
                name: '',
                logoUrl: '',
                description: '',
                sortOrder: 0,
                isActive: true,
              })
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            新增礼品卡
          </button>
        </div>

        {/* 新增/编辑表单 */}
        {(showForm || editing) && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑礼品卡' : '新增礼品卡'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  卡片名称 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：Xbox"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  卡片 Logo
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        try {
                          const res = await adminApi.uploadCardImage(file)
                          setFormData({ ...formData, logoUrl: res.data.path })
                          toast.success('图片上传成功')
                        } catch (error: any) {
                          toast.error(error.response?.data?.message || '图片上传失败')
                        }
                      }
                    }}
                    className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm"
                  />
                  {formData.logoUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={formData.logoUrl}
                        alt="预览"
                        className="h-12 w-auto object-contain border border-silver-200 rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <span className="text-sm text-neutral-600">{formData.logoUrl}</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                        className="text-sm text-danger hover:text-danger-700"
                      >
                        清除
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-neutral-500">
                    支持 jpeg, jpg, png, gif, webp, svg 格式，最大 5MB
                  </p>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  描述
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="卡片描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  排序顺序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="数字越小越靠前"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-silver-200 rounded focus:ring-blue-500"
                  />
                  激活显示
                </label>
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
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">卡片名称</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">Logo</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">描述</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">排序</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">状态</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-neutral-500">
                        暂无礼品卡数据，请添加
                      </td>
                    </tr>
                  ) : (
                    cards.map((card) => (
                      <tr
                        key={card.id}
                        className="border-b border-silver-100 hover:bg-silver-50 transition-colors"
                      >
                        <td className="py-4 px-4 font-semibold text-neutral-700">{card.name}</td>
                        <td className="py-4 px-4">
                          {card.logoUrl ? (
                            <img
                              src={card.logoUrl}
                              alt={card.name}
                              className="h-8 w-auto object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-bold text-xs">
                                {card.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-neutral-600 text-sm">
                          {card.description || '-'}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">{card.sortOrder}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              card.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-silver-200 text-neutral-600'
                            }`}
                          >
                            {card.isActive ? '激活' : '禁用'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(card)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-200 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(card.id)}
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

