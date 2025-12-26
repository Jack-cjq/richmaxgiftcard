import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AdminLayout from '@/components/admin/AdminLayout'
import { adminApi } from '@/api/services'
import toast from 'react-hot-toast'

interface Video {
  id: number
  title: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  type: 'company' | 'business'
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminVideos() {
  const { t } = useTranslation()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [viewingVideo, setViewingVideo] = useState<Video | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'company' as 'company' | 'business',
    sortOrder: 0,
    isActive: true,
    videoUrl: '',
    thumbnailUrl: '',
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      const res = await adminApi.getVideos()
      setVideos(res.data || [])
      setLoading(false)
    } catch (error) {
      toast.error(t('common.error') || '加载失败')
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingVideo(null)
    setShowForm(true)
    setFormData({
      title: '',
      description: '',
      type: 'company',
      sortOrder: 0,
      isActive: true,
      videoUrl: '',
      thumbnailUrl: '',
    })
    setVideoFile(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingVideo(null)
    setFormData({
      title: '',
      description: '',
      type: 'company',
      sortOrder: 0,
      isActive: true,
      videoUrl: '',
      thumbnailUrl: '',
    })
    setVideoFile(null)
  }

  const handleEdit = (video: Video) => {
    setEditingVideo(video)
    setShowForm(true)
    setFormData({
      title: video.title,
      description: video.description || '',
      type: video.type,
      sortOrder: video.sortOrder,
      isActive: video.isActive,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl || '',
    })
    setVideoFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        video: videoFile,
      }

      if (editingVideo) {
        await adminApi.updateVideo(editingVideo.id, submitData)
        toast.success(t('common.updateSuccess') || '更新成功')
      } else {
        await adminApi.createVideo(submitData)
        toast.success(t('common.createSuccess') || '创建成功')
      }

      handleCancel()
      loadVideos()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error') || '操作失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.confirmDelete') || '确定要删除吗？')) {
      return
    }

    try {
      await adminApi.deleteVideo(id)
      toast.success(t('common.deleteSuccess') || '删除成功')
      loadVideos()
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error') || '删除失败')
    }
  }

  const getVideoUrl = (videoUrl: string) => {
    if (videoUrl.startsWith('http') || videoUrl.startsWith('data:')) {
      return videoUrl
    }
    if (videoUrl.startsWith('/')) {
      return videoUrl
    }
    return `/videos/${videoUrl.split('/').pop()}`
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-blue-600 font-medium">{t('common.loading')}</div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-700">
          {t('admin.videos.title') || '视频标题'}
        </h1>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('common.add') || '添加视频'}
        </button>
      </div>

      {/* 表单 */}
      {showForm && (
        <div className="bg-white rounded-md p-6 shadow-card border border-silver-200 mb-6">
          <h2 className="text-xl font-bold text-neutral-700 mb-4">
            {editingVideo ? t('common.edit') || '编辑视频' : t('common.add') || '添加视频'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                {t('admin.videos.title') || '标题'} <span className="text-neutral-400 text-xs">（可选）</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                placeholder="请输入视频标题（可选）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                {t('admin.videos.description') || '描述'} <span className="text-neutral-400 text-xs">（可选）</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="请输入视频描述（可选）"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  {t('admin.videos.type') || '类型'} *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'company' | 'business' })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="company">{t('admin.videos.typeCompany') || '公司介绍'}</option>
                  <option value="business">{t('admin.videos.typeBusiness') || '业务介绍'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  {t('admin.videos.sortOrder') || '排序'}
                </label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                {t('admin.videos.videoFile') || '视频文件'} {!editingVideo && '*'}
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                required={!editingVideo}
              />
              {editingVideo && formData.videoUrl && !videoFile && (
                <p className="mt-2 text-sm text-neutral-500">
                  {t('admin.videos.currentVideo') || '当前视频'}: {formData.videoUrl}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                {t('admin.videos.videoUrl') || '视频URL'}（如果不上传文件，可填写外部URL）
              </label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/video.mp4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-600 mb-2">
                {t('admin.videos.thumbnailUrl') || '缩略图URL'}（可选）
              </label>
              <input
                type="text"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                className="w-full px-4 py-2 border border-silver-200 rounded-md bg-white text-neutral-700 focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-silver-200 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-neutral-600">
                  {t('common.active') || '激活'}
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingVideo ? t('common.update') || '更新' : t('common.create') || '创建'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-silver-200 text-neutral-700 rounded-md hover:bg-silver-300 transition-colors"
              >
                {t('common.cancel') || '取消'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 视频列表 */}
      <div className="bg-white rounded-md shadow-card border border-silver-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-silver-100">
            <tr>
              <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                {t('admin.videos.title') || '标题'}
              </th>
              <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                {t('admin.videos.type') || '类型'}
              </th>
              <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                {t('admin.videos.sortOrder') || '排序'}
              </th>
              <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                {t('common.status') || '状态'}
              </th>
              <th className="text-left py-4 px-4 text-neutral-600 font-semibold">
                {t('common.actions') || '操作'}
              </th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr
                key={video.id}
                className="border-t border-silver-200 hover:bg-silver-50"
              >
                <td className="py-4 px-4 text-neutral-600">
                  <div className="font-semibold">{video.title || '未命名视频'}</div>
                  {video.description && (
                    <div className="text-sm text-neutral-500 line-clamp-1">
                      {video.description}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4 text-neutral-600">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {video.type === 'company' ? (t('admin.videos.typeCompany') || '公司介绍') : (t('admin.videos.typeBusiness') || '业务介绍')}
                  </span>
                </td>
                <td className="py-4 px-4 text-neutral-600">
                  {video.sortOrder}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      video.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-silver-200 text-neutral-600'
                    }`}
                  >
                    {video.isActive ? (t('common.active') || '激活') : (t('common.inactive') || '未激活')}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingVideo(video)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleEdit(video)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      {t('common.edit') || '编辑'}
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      {t('common.delete') || '删除'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {videos.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            {t('common.noData') || '暂无数据'}
          </div>
        )}
      </div>

      {/* 视频查看模态框 */}
      {viewingVideo && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setViewingVideo(null)}
        >
          <button
            onClick={() => setViewingVideo(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm text-white text-2xl"
            aria-label="关闭"
          >
            &times;
          </button>
          <div
            className="relative max-w-5xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <video
                src={getVideoUrl(viewingVideo.videoUrl)}
                controls
                autoPlay
                className="max-w-full rounded-lg shadow-2xl"
                style={{ maxHeight: '80vh' }}
              >
                您的浏览器不支持视频播放
              </video>
            </div>
            {(viewingVideo.title || viewingVideo.description) && (
              <div className="mt-4 text-center">
                {viewingVideo.title && (
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {viewingVideo.title}
                  </h3>
                )}
                {viewingVideo.description && (
                  <p className="text-neutral-300">
                    {viewingVideo.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}

