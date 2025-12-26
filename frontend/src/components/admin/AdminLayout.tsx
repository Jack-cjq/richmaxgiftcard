import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../hooks/useAuth'

interface Props {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { i18n } = useTranslation()

  // 后台管理页面强制使用浅色模式和中文
  useEffect(() => {
    // 强制使用浅色模式
    document.documentElement.classList.remove('dark-mode')
    // 保存之前的语言设置
    const previousLanguage = i18n.language
    // 强制使用中文
    i18n.changeLanguage('zh')
    
    return () => {
      // 退出时恢复之前的主题设置
      const saved = localStorage.getItem('darkMode')
      if (saved === 'true') {
        document.documentElement.classList.add('dark-mode')
      }
      // 退出后台时恢复之前的语言设置（如果之前不是中文）
      if (previousLanguage && previousLanguage !== 'zh') {
        i18n.changeLanguage(previousLanguage)
      }
    }
  }, [i18n])

  const menuItems = [
    { path: '/admin/dashboard', label: '仪表盘', icon: '📊' },
    { path: '/admin/exchange-rates', label: '汇率管理', icon: '💱' },
    { path: '/admin/products', label: '产品管理', icon: '📦' },
    { path: '/admin/supported-cards', label: '礼品卡管理', icon: '🎴' },
    { path: '/admin/trades', label: '交易管理', icon: '📝' },
    { path: '/admin/content', label: '内容管理', icon: '📄' },
    { path: '/admin/carousels', label: '轮播图管理', icon: '🖼️' },
    { path: '/admin/company-images', label: '公司图片管理', icon: '🏢' },
    { path: '/admin/videos', label: '视频管理', icon: '🎬' },
    { path: '/admin/conversion-config', label: '换算配置', icon: '🧮' },
    { path: '/admin/social-buttons', label: '社交按钮管理', icon: '🔗' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-silver-50 admin-page">
      {/* 侧边栏 */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-surface border-r border-silver-200 overflow-y-auto">
        <div className="p-6 border-b border-silver-200">
          <h2 className="text-xl font-bold text-blue-600">管理后台</h2>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : 'text-neutral-600 hover:bg-silver-50'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-silver-200 bg-surface">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-neutral-600 hover:text-blue-600 transition-colors font-medium rounded-md hover:bg-silver-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="ml-60 p-8 bg-silver-50">
        <div className="max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

