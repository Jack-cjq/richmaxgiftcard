import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'

interface SupportedCard {
  id: number
  name: string
  logoUrl?: string
  description?: string
  sortOrder: number
}

interface Props {
  cards: SupportedCard[]
  loading: boolean
}

export default function SupportedCards({ cards, loading }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (cards.length === 0 || !scrollRef.current) return

    // 创建自动滚动动画
    const scrollElement = scrollRef.current
    
    // 根据屏幕宽度计算卡片宽度
    const getCardWidth = () => {
      const isMobile = window.innerWidth < 768 // md breakpoint
      // 移动端：112px (w-28) + 8px (gap-2) = 120px
      // 桌面端：192px (w-48) + 24px (gap-6) = 216px
      return isMobile ? 120 : 216
    }
    
    const createAnimation = () => {
      const cardWidth = getCardWidth()
      const singleSetWidth = cards.length * cardWidth

      // 重置位置
      gsap.set(scrollElement, { x: 0 })

      // 创建无限滚动动画
      // 滚动一个完整列表的宽度后，无缝循环
      return gsap.to(scrollElement, {
        x: -singleSetWidth,
        duration: cards.length * 2.5, // 根据卡片数量调整速度
        ease: 'none',
        repeat: -1, // 无限循环
        // 由于我们复制了卡片列表，当滚动完第一组后，第二组正好接上，实现无缝循环
      })
    }

    // 初始化动画
    animationRef.current = createAnimation()

    // 监听窗口大小变化，重新计算
    const handleResize = () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
      animationRef.current = createAnimation()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [cards])

  useEffect(() => {
    // 卡片进入动画
    if (containerRef.current && cards.length > 0) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.3 }
      )
    }
  }, [cards.length])

  if (loading) {
    return (
      <div className="py-6 md:py-16 bg-transparent relative -mt-24 md:-mt-80 z-10 supported-cards-overlay">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-3 md:mb-8">
            <h2 className="section-title text-xl md:text-4xl font-bold text-white dark-mode:text-gold-500 mb-1.5 md:mb-4 relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-12 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-white to-transparent dark-mode:via-gold-500 rounded-full"></span>
              {t('supportedCards.title')}
            </h2>
            <p className="text-white dark-mode:text-gold-500/80 text-xs md:text-lg drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{t('supportedCards.description')}</p>
          </div>
          <div className="flex gap-2 md:gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-28 h-20 md:w-48 md:h-32 bg-white/95 dark-mode:bg-black backdrop-blur-sm rounded-lg border border-white/40 dark-mode:border-gold-500/30 animate-pulse shadow-lg"
              ></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (cards.length === 0) {
    return null
  }

  // 为了无缝滚动，复制卡片列表
  const duplicatedCards = [...cards, ...cards]

  return (
    <section ref={containerRef} className="py-6 md:py-16 bg-transparent relative -mt-24 md:-mt-80 z-10 supported-cards-overlay">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-4 md:mb-12">
          <h2 className="section-title text-xl md:text-4xl font-bold text-white dark-mode:text-gold-500 mb-1.5 md:mb-4 relative drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-12 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-white to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('supportedCards.title')}
          </h2>
          <p className="text-white dark-mode:text-gold-500/80 text-xs md:text-lg drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">{t('supportedCards.description')}</p>
        </div>

        {/* 自动滚动容器 */}
        <div className="overflow-hidden relative">
          <div
            ref={scrollRef}
            className="flex gap-2 md:gap-6"
            style={{ width: 'max-content' }}
          >
            {duplicatedCards.map((card, index) => (
              <div
                key={`${card.id}-${index}`}
                className="flex-shrink-0 w-28 h-20 md:w-48 md:h-32 bg-white/95 dark-mode:bg-black backdrop-blur-sm rounded-lg border border-white/40 dark-mode:border-gold-500/30 hover:border-white/60 dark-mode:hover:border-gold-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col items-center justify-center p-2 md:p-6 cursor-pointer group shadow-lg"
              >
                {card.logoUrl ? (
                  <img
                    src={
                      // 如果是完整 URL（http/https）或 base64，直接使用
                      card.logoUrl.startsWith('http') || card.logoUrl.startsWith('data:image/')
                        ? card.logoUrl 
                        // 如果以 / 开头，直接使用（相对路径）
                        : card.logoUrl.startsWith('/') 
                          ? card.logoUrl 
                          // 否则，假设是文件名，拼接默认路径
                          : `/images/cards/${card.logoUrl}`
                    }
                    alt={card.name}
                    className="h-6 md:h-12 w-auto mb-1.5 md:mb-3 object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      // 图片加载失败时，隐藏图片元素
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="h-6 w-6 md:h-12 md:w-12 bg-blue-100 dark-mode:bg-gold-500/30 rounded-full flex items-center justify-center mb-1.5 md:mb-3 group-hover:bg-blue-200 dark-mode:group-hover:bg-gold-500/40 transition-colors">
                    <span className="text-blue-600 dark-mode:text-gold-500 font-bold text-xs md:text-lg">
                      {card.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <div className="font-semibold text-neutral-700 dark-mode:text-gold-500 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors text-[10px] md:text-base leading-tight">
                    {card.name}
                  </div>
                  {card.description && (
                    <div className="text-[9px] md:text-xs text-neutral-500 dark-mode:text-gold-500/70 mt-0.5 md:mt-1 leading-tight">{card.description}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

