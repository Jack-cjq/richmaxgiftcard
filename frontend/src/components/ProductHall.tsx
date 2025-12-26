import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import ImageModal from './ImageModal'
import { publicApi } from '../api/services'

interface Product {
  id: number
  name: string
  description: string
  category: string
  exchangeRate: number
  minAmount: number
  maxAmount: number
  status: 'active' | 'inactive'
  images?: string[]
}

interface SupportedCard {
  id: number
  name: string
  description?: string
  logoUrl?: string
  sortOrder?: number
  isActive?: boolean
}

interface Props {
  products: Product[]
  loading: boolean
  supportedCards?: SupportedCard[] // 支持的礼品卡列表（用于分类）
  maxDisplay?: number // 最大显示数量（桌面端）
  mobileMaxDisplay?: number // 移动端最大显示数量
  initialCategory?: string // 初始选中的分类
}

export default function ProductHall({ products, loading, supportedCards = [], maxDisplay = 6, mobileMaxDisplay = 3, initialCategory }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || t('products.all'))
  const [isMobile, setIsMobile] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'GHC'>('NGN')
  const [conversionConfig, setConversionConfig] = useState<{ ngnRate: number; ghcRate: number } | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string>('https://wa.me/8619972918971') // 默认值

  // 加载社交按钮配置（获取WhatsApp链接）
  useEffect(() => {
    const loadSocialButtons = async () => {
      try {
        const res = await publicApi.getSocialButtons()
        const buttons = res.data || []
        const whatsappButton = buttons.find((btn: any) => btn.type === 'whatsapp' && btn.isActive)
        if (whatsappButton && whatsappButton.url) {
          setWhatsappUrl(whatsappButton.url)
        }
      } catch (error) {
        // 使用默认值
      }
    }
    loadSocialButtons()
  }, [])

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  // 加载汇率配置
  useEffect(() => {
    const loadConversionConfig = async () => {
      try {
        const res = await publicApi.getConversionConfig()
        setConversionConfig({
          ngnRate: res.data.ngnRate || 200,
          ghcRate: res.data.ghcRate || 1.0,
        })
      } catch (error) {
        console.error('加载汇率配置失败:', error)
        setConversionConfig({
          ngnRate: 200,
          ghcRate: 1.0,
        })
      }
    }
    loadConversionConfig()
  }, [])

  const getConvertedAmount = (amount: number): number => {
    if (!conversionConfig) return amount
    if (selectedCurrency === 'NGN') {
      return Math.floor(amount * conversionConfig.ngnRate)
    } else {
      return Math.floor(amount * conversionConfig.ghcRate)
    }
  }

  const getCurrencySymbol = (): string => {
    return selectedCurrency === 'NGN' ? '₦' : 'GH₵'
  }

  // 从支持的礼品卡中获取分类（只显示激活的卡片）
  const cardCategories = supportedCards
    .filter(card => card.isActive !== false)
    .map(card => card.name)
    .sort((a, b) => {
      // 如果有 sortOrder，按 sortOrder 排序
      const cardA = supportedCards.find(c => c.name === a)
      const cardB = supportedCards.find(c => c.name === b)
      const orderA = cardA?.sortOrder ?? 999
      const orderB = cardB?.sortOrder ?? 999
      return orderA - orderB
    })
  
  // 获取所有分类：All + 支持的礼品卡名称
  const allCategories = [t('products.all'), ...cardCategories]
  
  // 限制显示的分类数量（移动端显示6个，桌面端显示10个）
  const maxVisibleCategories = isMobile ? 6 : 10
  const visibleCategories = showAllCategories 
    ? allCategories 
    : allCategories.slice(0, maxVisibleCategories)
  const hasMoreCategories = allCategories.length > maxVisibleCategories
  
  // 如果提供了初始分类，确保它被选中
  useEffect(() => {
    if (initialCategory && allCategories.includes(initialCategory)) {
      setSelectedCategory(initialCategory)
      // 如果初始分类不在前几个可见分类中，自动展开
      const maxVisible = isMobile ? 6 : 10
      const index = allCategories.indexOf(initialCategory)
      if (index > maxVisible) {
        setShowAllCategories(true)
      }
    }
  }, [initialCategory, allCategories, isMobile])

  // 根据分类筛选产品
  const filteredProducts = selectedCategory === t('products.all')
    ? products
    : products.filter(p => p.category === selectedCategory)
  
  // 根据设备类型决定显示数量
  const displayLimit = isMobile ? mobileMaxDisplay : maxDisplay
  const displayedProducts = filteredProducts.slice(0, displayLimit)
  // 只要筛选后的产品数量超过显示限制，就显示"查看更多"按钮
  const shouldShowViewAll = filteredProducts.length > displayLimit

  useEffect(() => {
    // 当分类改变时，重新触发动画
    if (displayedProducts.length > 0 && containerRef.current) {
      // 使用 setTimeout 确保 DOM 更新后再执行动画
      const timer = setTimeout(() => {
        // 从容器内获取所有卡片元素（更可靠且安全）
        const cards = containerRef.current?.querySelectorAll('.card-item') || []
        
        cards.forEach((card, index) => {
          const element = card as HTMLElement
          // 先重置状态
          gsap.set(element, { opacity: 0, y: 30, scale: 0.95 })
          // 然后执行动画
          gsap.to(element, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: index * 0.1,
            ease: 'power2.out'
          })
        })
      }, 100)
      
      return () => {
        clearTimeout(timer)
        // 清理动画
        if (containerRef.current) {
          const cards = containerRef.current.querySelectorAll('.card-item')
          cards.forEach((card) => {
            gsap.killTweensOf(card)
          })
        }
      }
    }
  }, [selectedCategory, displayedProducts.length])

  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) {
      return '/images/placeholder-product.png'
    }
    const firstImage = images[0]
    if (firstImage.startsWith('http') || firstImage.startsWith('data:image/')) {
      return firstImage
    }
    if (firstImage.startsWith('/')) {
      return firstImage
    }
    return `/images/products/${firstImage.split('/').pop()}`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-md p-4 md:p-8 shadow-card animate-pulse border border-silver-200"
          >
            <div className="h-32 md:h-48 bg-silver-200 rounded-md mb-3 md:mb-4"></div>
            <div className="flex items-start justify-between mb-4">
              <div className="h-6 bg-silver-200 rounded w-2/3"></div>
              <div className="h-5 bg-silver-200 rounded w-16"></div>
            </div>
            <div className="h-4 bg-silver-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-silver-200 rounded w-3/4 mb-6"></div>
            <div className="border-t border-silver-200 pt-4">
              <div className="h-4 bg-silver-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-silver-200 rounded w-1/3"></div>
            </div>
            <div className="mt-6 h-12 bg-silver-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400 text-lg font-medium">暂无可用产品</div>
      </div>
    )
  }

  return (
    <div>
      {/* 货币切换和分类筛选 */}
      <div className="mb-6 md:mb-8">
        {/* 货币切换 */}
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="flex items-center gap-2 bg-white dark-mode:bg-black border border-silver-200 dark-mode:border-gold-500/30 rounded-md p-1">
            <button
              onClick={() => setSelectedCurrency('NGN')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base font-semibold transition-colors ${
                selectedCurrency === 'NGN'
                  ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                  : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
              }`}
            >
              ₦ NGN
            </button>
            <button
              onClick={() => setSelectedCurrency('GHC')}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base font-semibold transition-colors ${
                selectedCurrency === 'GHC'
                  ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                  : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
              }`}
            >
              GH₵ GHC
            </button>
          </div>
        </div>
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
          {visibleCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md font-semibold text-xs md:text-sm transition-all duration-300 whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md dark-mode:bg-gold-500 dark-mode:text-black'
                  : 'bg-surface text-neutral-600 hover:bg-silver-100 border border-silver-200 dark-mode:bg-black dark-mode:text-gold-500 dark-mode:border-gold-500/30 dark-mode:hover:bg-gold-500/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* 展开/收起更多分类 */}
        {hasMoreCategories && (
          <div className="mt-3 md:mt-4 text-center">
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-blue-600 hover:text-blue-700 dark-mode:text-gold-500 dark-mode:hover:text-gold-400 font-medium transition-colors"
            >
              {showAllCategories ? (
                <>
                  {t('products.showLess')} ↑
                </>
              ) : (
                <>
                  {t('products.showMore')} ({allCategories.length - maxVisibleCategories}) ↓
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 产品列表 */}
      <div ref={containerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {displayedProducts.length === 0 ? (
          <div className="col-span-full text-center py-8 md:py-12">
            <div className="text-neutral-400 text-sm md:text-lg font-medium">
              {t('products.noProductsInCategory')}
            </div>
          </div>
        ) : (
          displayedProducts.map((product) => (
            <Link
              key={`${selectedCategory}-${product.id}`}
              to={`/products/${product.id}`}
                className="group card-item bg-surface dark-mode:bg-black rounded-md overflow-hidden shadow-card hover:shadow-dialog transition-all duration-300 border border-silver-200 dark-mode:border-gold-500/30 hover:border-blue-500/50 dark-mode:hover:border-gold-500/50 transform hover:-translate-y-2 hover:scale-[1.02] relative"
              style={{ opacity: 0 }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  y: -8,
                  scale: 1.02,
                  duration: 0.3,
                  ease: 'power2.out',
                })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  y: 0,
                  scale: 1,
                  duration: 0.3,
                  ease: 'power2.out',
                })
              }}
            >
              {/* 产品图片 */}
              <div className="relative h-32 md:h-48 bg-silver-100 dark-mode:bg-black/30 overflow-hidden product-image-wrapper">
                <img
                  src={getImageUrl(product.images)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out relative z-0 product-image cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedImage({ url: getImageUrl(product.images), alt: product.name })
                    setIsImageModalOpen(true)
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-product.png'
                  }}
                />
                {/* 悬浮时的遮罩层 */}
                <div className="absolute inset-0 product-image-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                {/* 分类标签 */}
                <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-600/90 dark-mode:bg-gold-500/90 text-white dark-mode:text-black text-[10px] md:text-xs font-semibold rounded-md z-20">
                  {product.category}
                </div>
              </div>

              {/* 产品信息 */}
              <div className="p-3 md:p-4 relative z-10">
                <div className="flex items-start justify-between mb-2 md:mb-3">
                    <h3 className="text-sm md:text-xl font-bold text-neutral-700 dark-mode:text-gold-500 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors flex-1 line-clamp-1">
                      {product.name}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm font-medium text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed mb-2 md:mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="border-t border-silver-200 dark-mode:border-gold-500/30 pt-2 md:pt-3 mt-2 md:mt-3">
                    <div className="flex justify-between items-center mb-1.5 md:mb-2">
                      <span className="text-[10px] md:text-xs font-medium text-neutral-500 dark-mode:text-gold-500/70">{t('products.exchangeRate')}</span>
                      <span className="text-sm md:text-base font-bold text-blue-600 dark-mode:text-gold-500">
                        {Number(product.exchangeRate).toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] md:text-xs font-medium text-neutral-500 dark-mode:text-gold-500/70">
                      <span>{t('products.limit')}</span>
                      <span className="font-bold text-neutral-700 dark-mode:text-gold-500 text-[10px] md:text-xs">
                        {getCurrencySymbol()}{getConvertedAmount(Number(product.minAmount)).toLocaleString()} - {getCurrencySymbol()}{getConvertedAmount(Number(product.maxAmount)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (typeof (window as any).gtag_report_conversion === 'function') {
                        ;(window as any).gtag_report_conversion(whatsappUrl)
                      } else {
                        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                      }
                    }}
                    className="mt-3 md:mt-4 w-full py-2 md:py-2.5 bg-blue-600 dark-mode:bg-gold-500 text-white dark-mode:text-black rounded-md hover:bg-blue-700 dark-mode:hover:bg-gold-600 transition-all duration-300 font-semibold text-xs md:text-sm shadow-card hover:shadow-dialog transform hover:scale-[1.02] active:scale-100 focus:ring-2 focus:ring-blue-500 dark-mode:focus:ring-gold-500 focus:ring-offset-2 flex items-center justify-center cursor-pointer"
                  >
                    {t('products.exchangeNow')}
                  </button>
              </div>
            </Link>
          ))
        )}
      </div>
      
      {/* 查看更多链接 */}
      {shouldShowViewAll && (
        <div className="mt-4 md:mt-8 text-center">
          <Link
            to={`/products${selectedCategory !== t('products.all') ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`}
              className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 md:py-3 bg-blue-600 dark-mode:bg-gold-500 text-white dark-mode:text-black dark-mode:font-bold rounded-md hover:bg-blue-700 dark-mode:hover:bg-gold-600 transition-all duration-300 text-sm md:text-base font-semibold shadow-card hover:shadow-dialog transform hover:scale-105 focus:ring-2 focus:ring-blue-500 dark-mode:focus:ring-gold-500 focus:ring-offset-2"
          >
            {t('common.viewAll')}
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
      
      {/* 图片查看器 */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          alt={selectedImage.alt}
          isOpen={isImageModalOpen}
          onClose={() => {
            setIsImageModalOpen(false)
            setSelectedImage(null)
          }}
        />
      )}
    </div>
  )
}
