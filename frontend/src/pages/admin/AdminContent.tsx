import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminApi } from '../../api/services'
import toast from 'react-hot-toast'

export default function AdminContent() {
  const [content, setContent] = useState<any>({
    heroTitle: '',
    heroSubtitle: '',
    processSteps: [],
    securityFeatures: [],
    faqs: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const res = await adminApi.getContent()
      const data = res.data || {}
      // 确保所有字段都不是 null，转换为空字符串或空数组
      setContent({
        heroTitle: data.heroTitle || '',
        heroSubtitle: data.heroSubtitle || '',
        processSteps: data.processSteps || [],
        securityFeatures: data.securityFeatures || [],
        faqs: data.faqs || [],
      })
      setLoading(false)
    } catch (error) {
      toast.error('加载失败')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await adminApi.updateContent(content)
      toast.success('保存成功')
    } catch (error) {
      toast.error('保存失败')
    }
  }

  const addProcessStep = () => {
    setContent({
      ...content,
      processSteps: [
        ...(content.processSteps || []),
        { title: '', description: '', icon: '📋' },
      ],
    })
  }

  const removeProcessStep = (index: number) => {
    const newSteps = [...(content.processSteps || [])]
    newSteps.splice(index, 1)
    setContent({ ...content, processSteps: newSteps })
  }

  const addSecurityFeature = () => {
    setContent({
      ...content,
      securityFeatures: [
        ...(content.securityFeatures || []),
        { title: '', description: '', icon: '🔒' },
      ],
    })
  }

  const removeSecurityFeature = (index: number) => {
    const newFeatures = [...(content.securityFeatures || [])]
    newFeatures.splice(index, 1)
    setContent({ ...content, securityFeatures: newFeatures })
  }

  const addFaq = () => {
    setContent({
      ...content,
      faqs: [...(content.faqs || []), { question: '', answer: '' }],
    })
  }

  const removeFaq = (index: number) => {
    const newFaqs = [...(content.faqs || [])]
    newFaqs.splice(index, 1)
    setContent({ ...content, faqs: newFaqs })
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
          <h1 className="text-3xl font-bold text-neutral-700">内容管理</h1>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            保存所有更改
          </button>
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <h2 className="text-xl font-bold text-neutral-700 mb-4">
              首页标题（轮播图下方显示）
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  主标题
                </label>
                <input
                  type="text"
                  value={content.heroTitle || ''}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：安全便捷的礼品卡兑换平台"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-2">
                  副标题
                </label>
                <input
                  type="text"
                  value={content.heroSubtitle || ''}
                  onChange={(e) =>
                    setContent({ ...content, heroSubtitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
                  placeholder="例如：实时汇率 · 快速兑换 · 安全可靠"
                />
              </div>
            </div>
          </div>

          {/* 流程步骤 */}
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-700">流程说明</h2>
              <button
                onClick={addProcessStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                添加步骤
              </button>
            </div>
            <div className="space-y-4">
              {content.processSteps?.map((step: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-silver-50 rounded-md border border-silver-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-neutral-600">
                      步骤 {index + 1}
                    </span>
                    <button
                      onClick={() => removeProcessStep(index)}
                      className="text-danger hover:text-red-700 text-sm font-medium"
                    >
                      删除
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      value={step.icon || ''}
                      onChange={(e) => {
                        const newSteps = [...(content.processSteps || [])]
                        newSteps[index].icon = e.target.value
                        setContent({ ...content, processSteps: newSteps })
                      }}
                      className="px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="图标（如：📋）"
                    />
                    <input
                      type="text"
                      value={step.title || ''}
                      onChange={(e) => {
                        const newSteps = [...(content.processSteps || [])]
                        newSteps[index].title = e.target.value
                        setContent({ ...content, processSteps: newSteps })
                      }}
                      className="px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="标题"
                    />
                    <input
                      type="text"
                      value={step.description || ''}
                      onChange={(e) => {
                        const newSteps = [...(content.processSteps || [])]
                        newSteps[index].description = e.target.value
                        setContent({ ...content, processSteps: newSteps })
                      }}
                      className="px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="描述"
                    />
                  </div>
                </div>
              ))}
              {(!content.processSteps || content.processSteps.length === 0) && (
                <div className="text-center py-8 text-neutral-400">
                  暂无流程步骤，点击"添加步骤"开始添加
                </div>
              )}
            </div>
          </div>

          {/* 安全特性 */}
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-700">安全特性</h2>
              <button
                onClick={addSecurityFeature}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                添加特性
              </button>
            </div>
            <div className="space-y-4">
              {content.securityFeatures?.map((feature: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-silver-50 rounded-md border border-silver-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-neutral-600">
                      特性 {index + 1}
                    </span>
                    <button
                      onClick={() => removeSecurityFeature(index)}
                      className="text-danger hover:text-red-700 text-sm font-medium"
                    >
                      删除
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input
                      type="text"
                      value={feature.icon || ''}
                      onChange={(e) => {
                        const newFeatures = [...(content.securityFeatures || [])]
                        newFeatures[index].icon = e.target.value
                        setContent({ ...content, securityFeatures: newFeatures })
                      }}
                      className="px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="图标（如：🔒）"
                    />
                    <input
                      type="text"
                      value={feature.title || ''}
                      onChange={(e) => {
                        const newFeatures = [...(content.securityFeatures || [])]
                        newFeatures[index].title = e.target.value
                        setContent({ ...content, securityFeatures: newFeatures })
                      }}
                      className="px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="标题"
                    />
                    <input
                      type="text"
                      value={feature.description || ''}
                      onChange={(e) => {
                        const newFeatures = [...(content.securityFeatures || [])]
                        newFeatures[index].description = e.target.value
                        setContent({ ...content, securityFeatures: newFeatures })
                      }}
                      className="px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="描述"
                    />
                  </div>
                </div>
              ))}
              {(!content.securityFeatures || content.securityFeatures.length === 0) && (
                <div className="text-center py-8 text-neutral-400">
                  暂无安全特性，点击"添加特性"开始添加
                </div>
              )}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-surface rounded-md p-6 shadow-card border border-silver-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-700">常见问题（FAQ）</h2>
              <button
                onClick={addFaq}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                添加问题
              </button>
            </div>
            <div className="space-y-4">
              {content.faqs?.map((faq: any, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-silver-50 rounded-md border border-silver-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-neutral-600">
                      问题 {index + 1}
                    </span>
                    <button
                      onClick={() => removeFaq(index)}
                      className="text-danger hover:text-red-700 text-sm font-medium"
                    >
                      删除
                    </button>
                  </div>
                  <input
                    type="text"
                    value={faq.question || ''}
                    onChange={(e) => {
                      const newFaqs = [...(content.faqs || [])]
                      newFaqs[index].question = e.target.value
                      setContent({ ...content, faqs: newFaqs })
                    }}
                    className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    placeholder="问题"
                  />
                  <textarea
                    value={faq.answer || ''}
                    onChange={(e) => {
                      const newFaqs = [...(content.faqs || [])]
                      newFaqs[index].answer = e.target.value
                      setContent({ ...content, faqs: newFaqs })
                    }}
                    className="w-full px-4 py-2 border border-silver-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="答案"
                  />
                </div>
              ))}
              {(!content.faqs || content.faqs.length === 0) && (
                <div className="text-center py-8 text-neutral-400">
                  暂无常见问题，点击"添加问题"开始添加
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
