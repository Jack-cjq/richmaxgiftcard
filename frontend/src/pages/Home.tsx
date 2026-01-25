import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Carousel from '@/components/Carousel'
// import ReferralRewards from '@/components/ReferralRewards'
import SupportedCards from '@/components/SupportedCards'
import ConversionCalculator from '@/components/ConversionCalculator'
import FeaturedProducts from '@/components/FeaturedProducts'
import VideoSection from '@/components/VideoSection'
import RecentTrades from '@/components/RecentTrades'
import ProcessGuide from '@/components/ProcessGuide'
import SecurityInfo from '@/components/SecurityInfo'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingElements from '@/components/FloatingElements'
import SparkleEffect from '@/components/SparkleEffect'
import DecorativeWave from '@/components/DecorativeWave'
import ImageModal from '@/components/ImageModal'
import { publicApi } from '@/api/services'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()
  const [carousels, setCarousels] = useState<any[]>([])
  const [supportedCards, setSupportedCards] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [recentTrades, setRecentTrades] = useState<any[]>([])
  const [content, setContent] = useState<any>(null)
  const [companyImages, setCompanyImages] = useState<any[]>([])
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  useEffect(() => {
    // 加载数据
    loadData()
    
    // GSAP 首屏动画
    const heroTl = gsap.timeline()
    heroTl.fromTo('.hero-section h1', 
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' }
    )
    heroTl.fromTo('.hero-section p',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.5'
    )

    // 移除滚动触发动画

    // 设置定时刷新（每3分钟，与后端同步）
    const interval = setInterval(loadData, 3 * 60 * 1000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])

  const loadData = async () => {
    try {
      const [carouselsRes, cardsRes, productsRes, tradesRes, contentRes, imagesRes, videosRes] = await Promise.all([
        publicApi.getCarousels(),
        publicApi.getSupportedCards(),
        publicApi.getProducts(),
        publicApi.getRecentTrades(5),
        publicApi.getContent(),
        publicApi.getCompanyImages(),
        publicApi.getVideos(),
      ])
      setCarousels(carouselsRes.data || [])
      setSupportedCards(cardsRes.data || [])
      setProducts(productsRes.data || [])
      setRecentTrades(tradesRes.data?.trades || [])
      setContent(contentRes.data || null)
      setCompanyImages(imagesRes.data || [])
      setVideos(videosRes.data || [])
      setLoading(false)
    } catch (error) {
      toast.error(t('common.error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50 dark-mode:bg-black relative overflow-hidden">
      <Header />
      
      {/* 全局装饰背景 */}
      <AnimatedBackground />
      <FloatingElements />
      <SparkleEffect />
      
      {/* 轮播图 */}
      <Carousel carousels={carousels} loading={loading} />

      {/* 支持的礼品卡 */}
      <SupportedCards cards={supportedCards} loading={loading} />

      {/* 精选产品 - 白色背景 */}
      <section 
        className="section-card px-4 py-8 md:py-16 bg-white dark-mode:bg-black relative overflow-hidden"
      >
        <DecorativeWave color="blue" direction="up" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-6 md:mb-12 text-center">
            <h2 className="section-title text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 relative text-center">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
              {t('home.featuredProducts')}
            </h2>
          </div>
          <FeaturedProducts 
            products={products} 
            loading={loading} 
            maxDisplay={4}
            mobileMaxDisplay={3}
          />
        </div>
      </section>

      {/* 推荐奖励 - 浅蓝色背景 */}
      {/* <section 
        className="section-card px-4 py-10 md:py-16 bg-gradient-to-br from-blue-50 to-blue-100/50 dark-mode:bg-black relative overflow-hidden"
      >
        <DecorativeWave color="blue" direction="up" />
        <FloatingElements />
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="section-title text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-6 md:mb-12 text-center relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('home.referralRewards')}
          </h2>
          <ReferralRewards />
        </div>
      </section> */}

      {/* 换算计算器 - 保持蓝色渐变背景 */}
      <section 
        className="section-card px-4 py-12 md:py-20 bg-silver-50 dark-mode:bg-black relative"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <ConversionCalculator />
        </div>
      </section>

      {/* 视频介绍 - 浅绿色背景 */}
      {videos.length > 0 && (
        <section 
          className="section-card px-4 py-8 md:py-16 bg-gradient-to-br from-green-50 to-green-100/30 dark-mode:bg-black relative overflow-hidden"
        >
          <DecorativeWave color="green" direction="up" />
          <SparkleEffect />
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="section-title text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-6 md:mb-12 text-center relative">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
              {t('videoIntroduction') || 'Video Introduction'}
            </h2>
            <VideoSection videos={videos} loading={loading} />
          </div>
        </section>
      )}

      {/* 最新成交 - 白色背景 */}
      <section 
        className="section-card px-4 py-12 md:py-20 bg-white dark-mode:bg-black relative overflow-hidden"
      >
        <DecorativeWave color="green" direction="down" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="relative mb-6 md:mb-12 text-center">
            <h2 className="section-title text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 relative text-center">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
              {t('home.recentTrades')}
            </h2>
            <Link
              to="/trades"
              className="inline-flex justify-center md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 text-blue-600 hover:text-blue-700 dark-mode:text-gold-500 dark-mode:hover:text-gold-400 dark-mode:font-bold transition-colors text-sm md:text-lg font-semibold mt-3 md:mt-0"
            >
              {t('common.viewAll')} →
            </Link>
          </div>
          <RecentTrades trades={recentTrades} loading={loading} />
        </div>
      </section>

      {/* 公司图片展示 - 浅灰色背景 */}
      {companyImages.length > 0 && (
        <section
          className="section-card px-4 py-12 md:py-20 bg-gradient-to-br from-silver-50 to-silver-100/50 dark-mode:bg-black relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="section-title text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-6 md:mb-12 text-center relative">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-16 md:w-24 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
              {t('about.gallery.title')}
            </h2>
            <div className={`grid gap-4 md:gap-6 ${
              companyImages.length === 1 
                ? 'grid-cols-1 justify-items-center max-w-md mx-auto' 
                : companyImages.length === 2
                ? 'grid-cols-1 md:grid-cols-2 justify-items-center max-w-2xl mx-auto'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {companyImages.slice(0, 3).map((image) => (
                <div
                  key={image.id}
                  className="bg-surface dark-mode:bg-black rounded-lg overflow-hidden shadow-card border border-silver-200 dark-mode:border-gold-500/30 hover:shadow-dialog transition-all duration-300 transform hover:-translate-y-2 group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={
                        image.imageUrl.startsWith('http') || image.imageUrl.startsWith('data:image/')
                          ? image.imageUrl
                          : image.imageUrl.startsWith('/')
                          ? image.imageUrl
                          : `/images/company/${image.imageUrl.split('/').pop()}`
                      }
                      alt={image.title}
                      className="w-full h-48 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                      onClick={() => {
                        const imageUrl = image.imageUrl.startsWith('http') || image.imageUrl.startsWith('data:image/')
                          ? image.imageUrl
                          : image.imageUrl.startsWith('/')
                          ? image.imageUrl
                          : `/images/company/${image.imageUrl.split('/').pop()}`
                        setSelectedImage({ url: imageUrl, alt: image.title })
                        setIsImageModalOpen(true)
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-2 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-sm md:text-base text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 流程说明 - 浅蓝色背景 */}
      {content?.processSteps && content.processSteps.length > 0 && (
        <section 
          className="section-card px-4 py-12 md:py-20 bg-gradient-to-br from-blue-50 to-blue-100/50 dark-mode:bg-black relative overflow-hidden"
        >
          <AnimatedBackground />
          <div className="max-w-7xl mx-auto relative z-10">
            <ProcessGuide steps={content.processSteps} />
          </div>
        </section>
      )}

      {/* 安全说明 - 浅绿色背景 */}
      {content?.securityFeatures && content.securityFeatures.length > 0 && (
        <section 
          className="section-card px-4 py-12 md:py-20 bg-gradient-to-br from-green-50 to-green-100/30 dark-mode:bg-black relative overflow-hidden"
        >
          <FloatingElements />
          <div className="max-w-7xl mx-auto relative z-10">
            <SecurityInfo features={content.securityFeatures} />
          </div>
        </section>
      )}

      <Footer />
      
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

