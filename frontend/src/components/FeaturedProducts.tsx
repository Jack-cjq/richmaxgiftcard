import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
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
  images?: string[]
}

interface Props {
  products: Product[]
  loading: boolean
  maxDisplay?: number // 桌面端最大显示数量
  mobileMaxDisplay?: number // 移动端最大显示数量
}

export default function FeaturedProducts({ products, loading, maxDisplay = 4, mobileMaxDisplay = 3 }: Props) {
  const { t } = useTranslation()
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'GHC'>('NGN')
  const [conversionConfig, setConversionConfig] = useState<{ ngnRate: number; ghcRate: number } | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

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

  // 根据设备类型决定显示数量
  const displayLimit = isMobile ? mobileMaxDisplay : maxDisplay
  const displayedProducts = products.slice(0, displayLimit)
  const shouldShowViewAll = products.length > displayLimit

  useEffect(() => {
    if (displayedProducts.length > 0) {
      cardRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(
            ref,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.1, ease: 'power2.out' }
          )
        }
      })
    }
  }, [displayedProducts.length])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-surface rounded-md overflow-hidden shadow-card border border-silver-200 animate-pulse"
          >
            <div className="h-32 md:h-48 bg-silver-200"></div>
            <div className="p-2 md:p-4">
              <div className="h-4 md:h-5 bg-silver-200 rounded w-3/4 mb-1.5 md:mb-2"></div>
              <div className="h-3 md:h-4 bg-silver-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return null
  }

  const getImageUrl = (images?: string[]) => {
    if (!images || images.length === 0) {
      return '/images/placeholder-product.png' // 占位图
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

  return (
    <div>
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
      <div className={`grid gap-2 md:gap-4 ${isMobile ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
        {displayedProducts.map((product, index) => (
        <Link
          key={product.id}
          to={`/products/${product.id}`}
          ref={(el) => (cardRefs.current[index] = el)}
          className="group block bg-surface dark-mode:bg-black rounded-md overflow-hidden shadow-card hover:shadow-dialog transition-all duration-300 border border-silver-200 dark-mode:border-gold-500/30 hover:border-blue-500/50 dark-mode:hover:border-gold-500/50 transform hover:-translate-y-2 hover:scale-[1.02]"
          style={{ opacity: 0 }}
          onMouseEnter={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1.02,
              y: -8,
              duration: 0.3,
              ease: 'power2.out',
            })
          }}
          onMouseLeave={(e) => {
            gsap.to(e.currentTarget, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: 'power2.out',
            })
          }}
        >
          <div className="relative h-32 md:h-48 bg-silver-100 dark-mode:bg-black/30 overflow-hidden product-image-container">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-green-500/0 group-hover:from-blue-500/10 group-hover:to-green-500/10 transition-all duration-300 z-10"></div>
            <img
              src={getImageUrl(product.images)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out product-image cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setSelectedImage({ url: getImageUrl(product.images), alt: product.name })
                setIsImageModalOpen(true)
              }}
              onError={(e) => {
                // 图片加载失败时显示占位图
                e.currentTarget.src = '/images/placeholder-product.png'
              }}
            />
            <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-600/90 dark-mode:bg-gold-500/90 text-white dark-mode:text-black text-[10px] md:text-xs font-semibold rounded-md">
              {product.category}
            </div>
          </div>
          <div className="p-2 md:p-4">
            <h3 className="text-xs md:text-lg font-bold text-neutral-700 dark-mode:text-gold-500 mb-1 md:mb-2 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-[10px] md:text-sm text-neutral-500 dark-mode:text-gold-500/80 mb-2 md:mb-3 line-clamp-2">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[9px] md:text-xs text-neutral-500 dark-mode:text-gold-500/70">{t('products.limit')}</span>
              <span className="text-[10px] md:text-sm font-bold text-blue-600 dark-mode:text-gold-500 text-right">
                {getCurrencySymbol()}{getConvertedAmount(Number(product.minAmount)).toLocaleString()} - {getCurrencySymbol()}{getConvertedAmount(Number(product.maxAmount)).toLocaleString()}
              </span>
            </div>
          </div>
        </Link>
        ))}
      </div>
      
      {/* 查看更多链接 */}
      {shouldShowViewAll && (
        <div className="mt-4 md:mt-8 text-center">
          <Link
            to="/products"
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

