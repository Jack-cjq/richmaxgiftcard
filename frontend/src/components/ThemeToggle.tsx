import { useTheme } from '@/contexts/ThemeContext'
import { useTranslation } from 'react-i18next'

export default function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { t } = useTranslation()

  return (
    <button
      onClick={toggleDarkMode}
      className="relative p-2 rounded-md text-neutral-700 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark-mode:text-gold-500 dark-mode:hover:text-gold-400"
      aria-label={isDarkMode ? t('theme.lightMode') : t('theme.darkMode')}
      title={isDarkMode ? t('theme.lightMode') : t('theme.darkMode')}
    >
      {isDarkMode ? (
        // 太阳图标（浅色模式）
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // 月亮图标（深色模式）
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}

