import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

interface CompanyImage {
  id: number
  title: string
  description?: string
  imageUrl: string
  sortOrder: number
  isActive: boolean
}

export default function AdminCompanyImages() {
  const [images, setImages] = useState<CompanyImage[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<CompanyImage>>({
    title: '',
    description: '',
    imageUrl: '',
    sortOrder: 0,
    isActive: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const res = await adminApi.getCompanyImages()
      setImages(res.data)
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const handleEdit = (image: CompanyImage) => {
    setEditing(image.id)
    setShowForm(true)
    setFormData({
      title: image.title,
      description: image.description,
      imageUrl: image.imageUrl,
      sortOrder: image.sortOrder,
      isActive: image.isActive,
    })
    setImageFile(null)
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
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

    // 检查激活图片数量限制
    const activeImagesCount = images.filter(img => img.isActive).length
    const willBeActive = formData.isActive !== undefined ? formData.isActive : true
    
    if (editing) {
      // 编辑时：如果当前图片是激活的，且要改为激活，不需要检查；如果要改为激活，需要检查
      const currentImage = images.find(img => img.id === editing)
      if (willBeActive && currentImage && !currentImage.isActive) {
        // 从非激活改为激活
        if (activeImagesCount >= 3) {
          toast.error('最多只能有3张激活的公司图片，请先禁用其他图片')
          return
        }
      }
    } else {
      // 新增时：如果要激活，需要检查
      if (willBeActive && activeImagesCount >= 3) {
        toast.error('最多只能有3张激活的公司图片，请先禁用其他图片')
        return
      }
    }

    try {
      const data: any = {
        title: formData.title,
        description: formData.description || '',
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
        await adminApi.updateCompanyImage(editing, data)
        toast.success('更新成功')
      } else {
        await adminApi.createCompanyImage(data)
        toast.success('创建成功')
      }
      handleCancel()
      loadImages()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这张公司图片吗？')) {
      return
    }

    try {
      await adminApi.deleteCompanyImage(id)
      toast.success('删除成功')
      loadImages()
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
          <div>
            <h1 className="text-3xl font-bold text-neutral-700">公司图片管理</h1>
            <p className="text-sm text-neutral-500 mt-1">
              最多可添加3张激活的公司图片（当前激活：{images.filter(img => img.isActive).length}/3）
            </p>
          </div>
          <button
            onClick={() => {
              const activeImagesCount = images.filter(img => img.isActive).length
              if (activeImagesCount >= 3) {
                toast.error('最多只能有3张激活的公司图片，请先禁用其他图片')
                return
              }
              setShowForm(true)
              setEditing(null)
              setFormData({
                title: '',
                description: '',
                imageUrl: '',
                sortOrder: 0,
                isActive: true,
              })
              setImageFile(null)
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            新增公司图片
          </button>
        </div>

        {/* 新增/编辑表单 */}
        {(showForm || editing) && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑公司图片' : '新增公司图片'}
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
                  placeholder="例如：公司办公环境"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  描述
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="图片描述（可选）"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  公司图片 <span className="text-danger">*</span>
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
                            : `/images/company/${formData.imageUrl.split('/').pop()}`
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
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">描述</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">排序</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">状态</th>
                    <th className="text-left py-4 px-4 text-neutral-600 font-semibold">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {images.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-neutral-500">
                        暂无公司图片数据，请添加
                      </td>
                    </tr>
                  ) : (
                    images.map((image) => (
                      <tr
                        key={image.id}
                        className="border-b border-silver-100 hover:bg-silver-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <img
                            src={
                              image.imageUrl.startsWith('http') || image.imageUrl.startsWith('data:image/')
                                ? image.imageUrl
                                : image.imageUrl.startsWith('/')
                                ? image.imageUrl
                                : `/images/company/${image.imageUrl.split('/').pop()}`
                            }
                            alt={image.title}
                            className="h-16 w-32 object-cover rounded-md border border-silver-200"
                          />
                        </td>
                        <td className="py-4 px-4 font-semibold text-neutral-700">
                          {image.title}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {image.description || '无'}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {image.sortOrder}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${
                              image.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-danger'
                            }`}
                          >
                            {image.isActive ? '激活' : '禁用'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(image)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm font-semibold hover:bg-blue-200 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(image.id)}
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

