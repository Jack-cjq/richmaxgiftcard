import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { publicApi } from '../api/services'

interface SocialButton {
  id: number
  type: string
  label: string
  url: string | null
  sortOrder: number
  isActive: boolean
}

// 按钮样式配置（硬编码在前端）
const BUTTON_STYLES: Record<string, { bgColor: string; iconColor: string; className?: string }> = {
  whatsapp: {
    bgColor: '#25D366',
    iconColor: '#FFFFFF',
  },
  facebook: {
    bgColor: '#1877F2',
    iconColor: '#FFFFFF',
  },
  telegram: {
    bgColor: '#0088cc',
    iconColor: '#FFFFFF',
  },
  tiktok: {
    bgColor: '#000000',
    iconColor: '#FFFFFF',
    className: 'dark-mode:border-2 dark-mode:border-white/30 dark-mode:shadow-[0_4px_12px_rgba(255,255,255,0.1)]',
  },
  instagram: {
    bgColor: 'linear-gradient(45deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)',
    iconColor: '#FFFFFF',
  },
}

// 获取按钮图标SVG（使用官方标准图标，优化显示效果）
const getButtonIcon = (type: string) => {
  switch (type) {
    case 'whatsapp':
      // WhatsApp官方图标
      return (
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      )
    case 'facebook':
      // Facebook官方图标
      return (
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      )
    case 'telegram':
      // Telegram官方图标
      return (
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      )
    case 'tiktok':
      // TikTok官方图标
      return (
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      )
    case 'instagram':
      // Instagram官方图标
      return (
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      )
    default:
      return null
  }
}

export default function FloatingContactButtons() {
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const [buttons, setButtons] = useState<SocialButton[]>([])
  const [loading, setLoading] = useState(true)
  
  // 在管理后台页面隐藏按钮
  const isAdminPage = location.pathname.startsWith('/admin')
  
  useEffect(() => {
    if (!isAdminPage) {
      loadButtons()
    }
  }, [isAdminPage])

  const loadButtons = async () => {
    try {
      const res = await publicApi.getSocialButtons()
      setButtons(res.data || [])
      setLoading(false)
    } catch (error) {
      console.error('加载社交按钮失败:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    // 按钮进入动画
    if (containerRef.current && buttons.length > 0) {
      const buttonElements = containerRef.current.querySelectorAll('.floating-btn')
      buttonElements.forEach((button, index) => {
        gsap.fromTo(
          button,
          { opacity: 0, scale: 0, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.5,
            delay: 0.3 + index * 0.1,
            ease: 'back.out(1.7)',
          }
        )
      })
    }
  }, [buttons])

  if (isAdminPage || loading || buttons.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex flex-col gap-2 md:gap-4"
    >
      {buttons.map((button) => {
        const style = BUTTON_STYLES[button.type] || BUTTON_STYLES.whatsapp
        const bgStyle = style.bgColor.includes('gradient')
          ? { background: style.bgColor }
          : { backgroundColor: style.bgColor }
        
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
          const url = button.url || '#'
          if (url !== '#' && typeof (window as any).gtag_report_conversion === 'function') {
            e.preventDefault()
            ;(window as any).gtag_report_conversion(url)
          }
        }

        return (
          <a
            key={button.id}
            href={button.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`floating-btn group relative rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 floating-contact-btn ${style.className || ''}`}
            style={bgStyle}
            aria-label={`联系 ${button.label}`}
          >
            {/* 图标 SVG */}
            <svg
              className="floating-contact-icon"
              fill={style.iconColor}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: '28px', height: '28px', padding: '2px' }}
              preserveAspectRatio="xMidYMid meet"
            >
              {getButtonIcon(button.type)}
            </svg>
            {/* 悬浮提示 */}
            <span className="hidden md:block absolute right-full mr-3 px-3 py-1.5 bg-neutral-800 dark-mode:bg-gold-500 text-white dark-mode:text-black text-sm font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              {button.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}
