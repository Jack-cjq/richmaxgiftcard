import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

interface SocialButton {
  id: number
  type: string
  label: string
  url: string | null
  sortOrder: number
  isActive: boolean
}

const BUTTON_TYPES = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
]

export default function AdminSocialButtons() {
  const [buttons, setButtons] = useState<SocialButton[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    type: 'whatsapp',
    label: '',
    url: '',
    sortOrder: 0,
    isActive: true,
  })

  useEffect(() => {
    loadButtons()
  }, [])

  const loadButtons = async () => {
    try {
      const res = await adminApi.getSocialButtons()
      setButtons(res.data || [])
      setLoading(false)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '加载失败'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  const handleEdit = (button: SocialButton) => {
    setEditing(button.id)
    setShowForm(false)
    setFormData({
      type: button.type,
      label: button.label,
      url: button.url || '',
      sortOrder: button.sortOrder || 0,
      isActive: button.isActive !== undefined ? button.isActive : true,
    })
  }

  const handleCancel = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({
      type: 'whatsapp',
      label: '',
      url: '',
      sortOrder: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.label) {
      toast.error('请填写按钮标签')
      return
    }
    if (!formData.url) {
      toast.error('请填写链接地址')
      return
    }

    try {
      if (editing) {
        await adminApi.updateSocialButton(editing, formData)
        toast.success('更新成功')
      } else {
        await adminApi.createSocialButton(formData)
        toast.success('创建成功')
      }
      handleCancel()
      loadButtons()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个按钮吗？')) {
      return
    }

    try {
      await adminApi.deleteSocialButton(id)
      toast.success('删除成功')
      loadButtons()
    } catch (error: any) {
      toast.error(error.response?.data?.message || '删除失败')
    }
  }

  const handleTypeChange = (type: string) => {
    const buttonType = BUTTON_TYPES.find(bt => bt.value === type)
    setFormData({
      ...formData,
      type,
      label: buttonType?.label || formData.label,
    })
  }

  const handleBatchUpdate = async () => {
    try {
      if (buttons.length === 0) {
        toast.error('没有可更新的按钮')
        return
      }

      // 确保数据格式正确
      const buttonsToUpdate = buttons.map(btn => ({
        id: Number(btn.id),
        sortOrder: Number(btn.sortOrder) || 0,
        isActive: Boolean(btn.isActive),
        url: btn.url || '',
        label: btn.label || '',
      }))
      
      await adminApi.updateSocialButtonsBatch(buttonsToUpdate)
      toast.success('批量更新成功')
      loadButtons()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '批量更新失败'
      toast.error(errorMessage)
    }
  }

  const handleSortChange = (id: number, newSortOrder: number) => {
    setButtons(buttons.map(btn => 
      btn.id === id ? { ...btn, sortOrder: newSortOrder } : btn
    ))
  }

  const handleActiveToggle = (id: number) => {
    setButtons(buttons.map(btn => 
      btn.id === id ? { ...btn, isActive: !btn.isActive } : btn
    ))
  }

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
          <div>
            <h1 className="text-3xl font-bold text-neutral-700">社交按钮管理</h1>
            <p className="text-sm text-neutral-500 mt-2">
              按钮样式已在前端固定，只需配置链接和激活状态即可
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBatchUpdate}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              保存排序和激活状态
            </button>
            <button
              onClick={() => {
                setShowForm(true)
                setEditing(null)
                setFormData({
                  type: 'whatsapp',
                  label: '',
                  url: '',
                  sortOrder: buttons.length,
                  isActive: true,
                })
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              新增按钮
            </button>
          </div>
        </div>

        {/* 新增/编辑表单 */}
        {(showForm || editing) && (
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200 mb-6">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              {editing ? '编辑社交按钮' : '新增社交按钮'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  按钮类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                >
                  {BUTTON_TYPES.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  选择按钮类型后，样式会自动应用
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  按钮标签 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：WhatsApp"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  链接地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：https://wa.me/8619972918971"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  WhatsApp: https://wa.me/国家代码+手机号（去掉+号）<br />
                  Facebook: https://www.facebook.com/profile.php?id=...<br />
                  Telegram: https://t.me/+国家代码+手机号<br />
                  TikTok: https://www.tiktok.com/@用户名<br />
                  Instagram: https://www.instagram.com/用户名
                </p>
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
                />
                <p className="text-xs text-neutral-500 mt-1">
                  数字越小，显示越靠上
                </p>
              </div>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-silver-200 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-neutral-600">激活显示</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-silver-200 text-neutral-600 rounded-md hover:bg-silver-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {/* 按钮列表 */}
        <div className="bg-surface rounded-md shadow-card border border-silver-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-silver-50 border-b border-silver-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">类型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">标签</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">链接</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">排序</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silver-200">
                {buttons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-neutral-500">
                      暂无数据，请添加社交按钮
                    </td>
                  </tr>
                ) : (
                  buttons.map((button) => (
                    <tr key={button.id} className="hover:bg-silver-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-neutral-700">{button.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-neutral-700">{button.label}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-neutral-600 truncate block max-w-xs">{button.url || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={button.sortOrder}
                          onChange={(e) => handleSortChange(button.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-silver-200 rounded text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={button.isActive}
                            onChange={() => handleActiveToggle(button.id)}
                            className="w-4 h-4 text-blue-600 border-silver-200 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-neutral-600">
                            {button.isActive ? '激活' : '禁用'}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(button)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(button.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
