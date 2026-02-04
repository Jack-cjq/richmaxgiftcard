import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

export default function Header() {
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAdminLink, setShowAdminLink] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)

  // 键盘快捷键：Ctrl+Shift+A 显示管理员入口
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setShowAdminLink(true)
        // 5秒后自动隐藏
        setTimeout(() => setShowAdminLink(false), 5000)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Logo 点击计数（5次点击显示管理员入口）
  const handleLogoClick = (e: React.MouseEvent) => {
    // 不阻止默认行为，允许正常跳转
    const currentTime = Date.now()
    
    // 如果距离上次点击超过2秒，重置计数
    if (currentTime - lastClickTime > 2000) {
      setLogoClickCount(1)
    } else {
      setLogoClickCount(prev => prev + 1)
    }
    
    setLastClickTime(currentTime)

    // 如果点击5次，显示管理员入口
    if (logoClickCount + 1 >= 5) {
      e.preventDefault() // 只有第5次点击时才阻止跳转
      setShowAdminLink(true)
      setLogoClickCount(0)
      // 5秒后自动隐藏
      setTimeout(() => setShowAdminLink(false), 5000)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-silver-200 shadow-sm m-0 dark-mode:bg-black dark-mode:border-gold-500/30">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo 和公司名称 */}
          <Link 
            to="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <img
              src="/images/logo/richmax-logo.png"
              alt="RichPlus Logo"
              className="h-8 md:h-10 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="text-xl md:text-2xl font-bold text-blue-600 whitespace-nowrap dark-mode:text-gold-500">
              RichPlus
            </span>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            <Link
              to="/"
              className="text-neutral-700 font-semibold hover:text-blue-600 transition-colors whitespace-nowrap dark-mode:text-gold-500 dark-mode:hover:text-gold-400"
            >
              {t('header.home')}
            </Link>
            <Link
              to="/trades"
              className="text-neutral-700 font-semibold hover:text-blue-600 transition-colors whitespace-nowrap dark-mode:text-gold-500 dark-mode:hover:text-gold-400"
            >
              {t('header.trades')}
            </Link>
            <Link
              to="/help"
              className="text-neutral-700 font-semibold hover:text-blue-600 transition-colors whitespace-nowrap dark-mode:text-gold-500 dark-mode:hover:text-gold-400"
            >
              {t('header.help')}
            </Link>
            <Link
              to="/about"
              className="text-neutral-700 font-semibold hover:text-blue-600 transition-colors whitespace-nowrap dark-mode:text-gold-500 dark-mode:hover:text-gold-400"
            >
              {t('header.about')}
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
            {showAdminLink && (
              <Link
                to="/admin/login"
                className="px-3 xl:px-4 py-2 text-xs xl:text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium whitespace-nowrap animate-fade-in"
              >
                {t('header.adminLogin')}
              </Link>
            )}
          </nav>

          {/* 移动端：主题切换、语言切换器和菜单按钮 */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-silver-200 pt-4">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-neutral-700 font-semibold hover:text-blue-600 hover:bg-silver-50 rounded-md transition-colors"
              >
                {t('header.home')}
              </Link>
              <Link
                to="/trades"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-neutral-700 font-semibold hover:text-blue-600 hover:bg-silver-50 rounded-md transition-colors"
              >
                {t('header.trades')}
              </Link>
              <Link
                to="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-neutral-700 font-semibold hover:text-blue-600 hover:bg-silver-50 rounded-md transition-colors"
              >
                {t('header.help')}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-4 py-2 text-neutral-700 font-semibold hover:text-blue-600 hover:bg-silver-50 rounded-md transition-colors"
              >
                {t('header.about')}
              </Link>
              {showAdminLink && (
                <Link
                  to="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all font-medium text-center animate-fade-in"
                >
                  {t('header.adminLogin')}
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

