import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 从 localStorage 读取保存的主题设置，如果没有则默认使用深色模式
    const saved = localStorage.getItem('darkMode')
    // 如果 localStorage 中没有保存，默认返回 true（深色模式）
    if (saved === null) {
      return true
    }
    return saved === 'true'
  })

  useEffect(() => {
    // 保存主题设置到 localStorage
    localStorage.setItem('darkMode', String(isDarkMode))
    
    // 添加或移除 dark-mode class 到根元素
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

