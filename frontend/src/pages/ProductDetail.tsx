import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ImageModal from '@/components/ImageModal'
import { publicApi } from '@/api/services'
import toast from 'react-hot-toast'

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

export default function ProductDetail() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'GHC'>('NGN')
  const [conversionConfig, setConversionConfig] = useState<{ ngnRate: number; ghcRate: number } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string>('https://wa.me/8619972918971') // 默认值

  useEffect(() => {
    if (id) {
      loadProduct()
    }
    loadConversionConfig()
    loadSocialButtons()
  }, [id])

  // 加载社交按钮配置（获取WhatsApp链接）
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

  useEffect(() => {
    if (product) {
      gsap.fromTo(
        '.product-detail',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
      )
    }
  }, [product])

  const loadProduct = async () => {
    try {
      const res = await publicApi.getProductById(Number(id))
      setProduct(res.data)
      setLoading(false)
    } catch (error) {
      toast.error(t('productDetail.notFound'))
      setLoading(false)
    }
  }

  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http') || imagePath.startsWith('data:image/')) {
      return imagePath
    }
    if (imagePath.startsWith('/')) {
      return imagePath
    }
    return `/images/products/${imagePath.split('/').pop()}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-silver-50 dark-mode:bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="bg-surface dark-mode:bg-black rounded-md p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-silver-200 dark-mode:bg-gold-500/20 rounded-md"></div>
              <div className="space-y-4">
                <div className="h-8 bg-silver-200 dark-mode:bg-gold-500/20 rounded w-3/4"></div>
                <div className="h-4 bg-silver-200 dark-mode:bg-gold-500/20 rounded w-full"></div>
                <div className="h-4 bg-silver-200 dark-mode:bg-gold-500/20 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-silver-50 dark-mode:bg-black">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="bg-surface dark-mode:bg-black rounded-md p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30">
            <h2 className="text-2xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-4">{t('productDetail.notFound')}</h2>
            <Link
              to="/products"
              className="text-blue-600 dark-mode:text-gold-500 hover:text-blue-700 dark-mode:hover:text-gold-400 transition-colors"
            >
              {t('productDetail.backToList')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const images = product.images || []
  const mainImage = images[selectedImageIndex] || images[0]

  return (
    <div className="min-h-screen bg-silver-50 dark-mode:bg-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-12 product-detail">
        {/* 面包屑导航 */}
        <nav className="mb-8 text-sm text-neutral-600 dark-mode:text-gold-500/80">
          <Link to="/" className="hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">{t('productDetail.home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">{t('productDetail.exchangeHall')}</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-700 dark-mode:text-gold-500">{product.name}</span>
        </nav>

        <div className="bg-surface dark-mode:bg-black rounded-md shadow-card border border-silver-200 dark-mode:border-gold-500/30 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* 左侧：图片展示 */}
            <div>
              {mainImage ? (
                <div className="relative">
                  <img
                    src={getImageUrl(mainImage)}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-md border border-silver-200 dark-mode:border-gold-500/30 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder-product.png'
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-silver-100 dark-mode:bg-gold-500/10 rounded-md border border-silver-200 dark-mode:border-gold-500/30 flex items-center justify-center">
                  <span className="text-neutral-400 dark-mode:text-gold-500/70">{t('productDetail.noImage')}</span>
                </div>
              )}

              {/* 缩略图 */}
              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-md border-2 overflow-hidden transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-600 dark-mode:border-gold-500'
                          : 'border-silver-200 dark-mode:border-gold-500/30 hover:border-blue-400 dark-mode:hover:border-gold-500/50'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedImageIndex(index)
                          setIsImageModalOpen(true)
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-product.png'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：产品信息 */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-100 dark-mode:bg-gold-500/30 text-blue-700 dark-mode:text-gold-500 rounded-md text-sm font-semibold">
                  {product.category}
                </span>
                {/* 货币切换 */}
                <div className="flex items-center gap-2 bg-white dark-mode:bg-black border border-silver-200 dark-mode:border-gold-500/30 rounded-md p-1">
                  <button
                    onClick={() => setSelectedCurrency('NGN')}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                      selectedCurrency === 'NGN'
                        ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                        : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
                    }`}
                  >
                    ₦ NGN
                  </button>
                  <button
                    onClick={() => setSelectedCurrency('GHC')}
                    className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                      selectedCurrency === 'GHC'
                        ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                        : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
                    }`}
                  >
                    GH₵ GHC
                  </button>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-4">
                {product.name}
              </h1>
              <p className="text-lg text-neutral-600 dark-mode:text-gold-500/80 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* 产品详情 */}
              <div className="border-t border-silver-200 dark-mode:border-gold-500/30 pt-6 mb-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark-mode:text-gold-500/80 font-medium">{t('products.exchangeRate')}</span>
                    <span className="text-2xl font-bold text-blue-600 dark-mode:text-gold-500">
                      {Number(product.exchangeRate).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark-mode:text-gold-500/80 font-medium">{t('productDetail.minAmount')}</span>
                    <span className="text-xl font-bold text-neutral-700 dark-mode:text-gold-500">
                      {getCurrencySymbol()}{getConvertedAmount(Number(product.minAmount)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600 dark-mode:text-gold-500/80 font-medium">{t('productDetail.maxAmount')}</span>
                    <span className="text-xl font-bold text-neutral-700 dark-mode:text-gold-500">
                      {getCurrencySymbol()}{getConvertedAmount(Number(product.maxAmount)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (typeof (window as any).gtag_report_conversion === 'function') {
                      e.preventDefault()
                      ;(window as any).gtag_report_conversion(whatsappUrl)
                    }
                  }}
                  className="w-full py-4 bg-blue-600 dark-mode:bg-gold-500 text-white dark-mode:text-black dark-mode:font-bold rounded-md hover:bg-blue-700 dark-mode:hover:bg-gold-600 transition-all duration-300 font-semibold text-lg shadow-card hover:shadow-dialog transform hover:scale-[1.02] active:scale-100 focus:ring-2 focus:ring-blue-500 dark-mode:focus:ring-gold-500 focus:ring-offset-2 flex items-center justify-center cursor-pointer"
                >
                  {t('productDetail.exchangeNow')}
                </a>
                <Link
                  to="/products"
                  className="block w-full py-3 text-center bg-silver-100 dark-mode:bg-gold-500/20 text-neutral-700 dark-mode:text-gold-500 rounded-md hover:bg-silver-200 dark-mode:hover:bg-gold-500/30 transition-colors font-semibold"
                >
                  {t('productDetail.backToList')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      
      {/* 图片查看器 */}
      {mainImage && (
        <ImageModal
          imageUrl={getImageUrl(mainImage)}
          alt={product.name}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  )
}

