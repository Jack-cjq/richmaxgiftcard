import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

interface Carousel {
  id: number
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  sortOrder: number
  isActive: boolean
}

export default function AdminCarousels() {
  const [carousels, setCarousels] = useState<Carousel[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Carousel>>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    sortOrder: 0,
    isActive: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    loadCarousels()
  }, [])

  const loadCarousels = async () => {
    try {
      const res = await adminApi.getCarousels()
      setCarousels(res.data)
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const handleEdit = (carousel: Carousel) => {
    setEditing(carousel.id)
    setShowForm(true)
    setFormData({
      title: carousel.title,
      subtitle: carousel.subtitle,
      imageUrl: carousel.imageUrl,
      linkUrl: carousel.linkUrl,
      sortOrder: carousel.sortOrder,
      isActive: carousel.isActive,
    })
    setImageFile(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      sortOrder: 0,
      isActive: true,
    })
    setImageFile(null)
  }

  const handleSave = async () => {
    if (!editing && !imageFile && !formData.imageUrl) {
      toast.error('请上传图片')
      return
    }

    try {
      const data: any = {
        title: formData.title,
        subtitle: formData.subtitle || '',
        linkUrl: formData.linkUrl || '',
        sortOrder: formData.sortOrder || 0,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      }

      if (imageFile) {
        data.image = imageFile
        // 有文件时，不发送 imageUrl（避免发送 base64 预览数据）
        delete data.imageUrl
      } else if (formData.imageUrl && !formData.imageUrl.startsWith('data:image/')) {
        // 只有当 imageUrl 不是 base64 时才发送（用于编辑时保留已有图片）
        data.imageUrl = formData.imageUrl
      }

      if (editing) {
        await adminApi.updateCarousel(editing, data)
        toast.success('更新成功')
      } else {
        await adminApi.createCarousel(data)
        toast.success('创建成功')
      }
      // 清除预览数据，确保重新加载时使用服务器返回的正确路径
      setImageFile(null)
      handleCancel()
      loadCarousels()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张轮播图吗？')) {
      return
    }

    try {
      await adminApi.deleteCarousel(id)
      toast.success('删除成功')
      loadCarousels()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // 预览图片
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, imageUrl: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClearImage = () => {
    setImageFile(null)
    setFormData((prev) => ({ ...prev, imageUrl: '' }))
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-700">轮播图管理</h1>
          <button
            onClick={() => {
              setShowForm(true)
              setEditing(null)
              setFormData({
                title: '',
                subtitle: '',
                imageUrl: '',
                linkUrl: '',
                sortOrder: 0,
                isActive: true,
              })
              setImageFile(null)
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            新增轮播图
          </button>
        </div>

        {/* 新增/编辑表单 */}
        {(showForm || editing) && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑轮播图' : '新增轮播图'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：安全便捷的礼品卡兑换平台（可选）"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  副标题
                </label>
                <input
                  type="text"
                  value={formData.subtitle || ''}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：实时汇率 · 快速兑换 · 安全可靠"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  轮播图片 <span className="text-danger">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 text-sm"
                  />
                  {formData.imageUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          formData.imageUrl.startsWith('http') || formData.imageUrl.startsWith('data:image/')
                            ? formData.imageUrl
                            : formData.imageUrl.startsWith('/')
                            ? formData.imageUrl
                            : `/images/carousels/${formData.imageUrl.split('/').pop()}`
                        }
                        alt="Preview"
                        className="h-32 w-auto object-cover border border-silver-200 rounded-md"
                      />
                      <button
                        onClick={handleClearImage}
                        className="text-danger hover:text-red-700 text-sm font-medium"
                      >
                        清除
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  跳转链接
                </label>
                <input
                  type="url"
                  value={formData.linkUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：https://example.com（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  排序顺序
                </label>
                <input
                  type="number"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="数字越小越靠前"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== undefined ? formData.isActive : true}
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
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">预览</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">标题</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">副标题</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">排序</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">状态</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {carousels.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-neutral-500">
                        暂无轮播图数据，请添加
                      </td>
                    </tr>
                  ) : (
                    carousels.map((carousel) => (
                      <tr
                        key={carousel.id}
                        className="border-b border-silver-100 hover:bg-silver-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <img
                            src={
                              carousel.imageUrl.startsWith('http') || carousel.imageUrl.startsWith('data:image/')
                                ? carousel.imageUrl
                                : carousel.imageUrl.startsWith('/')
                                ? carousel.imageUrl
                                : `/images/carousels/${carousel.imageUrl.split('/').pop()}`
                            }
                            alt={carousel.title}
                            className="h-16 w-32 object-cover rounded-md border border-silver-200"
                          />
                        </td>
                        <td className="py-4 px-4 font-semibold text-neutral-700">
                          {carousel.title}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {carousel.subtitle || '无'}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {carousel.sortOrder}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${
                              carousel.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-danger'
                            }`}
                          >
                            {carousel.isActive ? '激活' : '禁用'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(carousel)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-200 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(carousel.id)}
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

