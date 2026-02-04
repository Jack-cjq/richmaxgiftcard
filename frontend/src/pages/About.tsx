import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AnimatedBackground from '@/components/AnimatedBackground'
import FloatingElements from '@/components/FloatingElements'
import ImageModal from '@/components/ImageModal'
import { useStatNumberAnimation } from '@/hooks/useStatNumberAnimation'
import { publicApi } from '@/api/services'

// 统计卡片组件
interface StatCardProps {
  stat: {
    label: string
    value: string
    suffix: string
  }
  sectionRef: HTMLElement | null
}

function StatCard({ stat, sectionRef }: StatCardProps) {
  const animatedValue = useStatNumberAnimation(
    `${stat.value}${stat.suffix}`,
    2,
    sectionRef
  )

  return (
    <div className="bg-surface dark-mode:bg-black rounded-lg p-6 shadow-card border border-silver-200 dark-mode:border-gold-500/30 text-center hover:shadow-dialog transition-all duration-300 transform hover:-translate-y-2">
      <div className="text-4xl font-bold text-blue-600 dark-mode:text-gold-500 mb-2">
        {animatedValue}
      </div>
      <div className="text-neutral-600 dark-mode:text-gold-500/80 font-medium">{stat.label}</div>
    </div>
  )
}

interface CompanyImage {
  id: number
  title: string
  description?: string
  imageUrl: string
  sortOrder: number
  isActive: boolean
}

export default function About() {
  const { t } = useTranslation()
  const statsSectionRef = useRef<HTMLElement>(null)
  const [companyImages, setCompanyImages] = useState<CompanyImage[]>([])
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const strengths = [
    {
      icon: '💼',
      title: t('about.strengths.professional.title'),
      description: t('about.strengths.professional.description'),
    },
    {
      icon: '🔒',
      title: t('about.strengths.security.title'),
      description: t('about.strengths.security.description'),
    },
    {
      icon: '⚡',
      title: t('about.strengths.speed.title'),
      description: t('about.strengths.speed.description'),
    },
    {
      icon: '🌍',
      title: t('about.strengths.global.title'),
      description: t('about.strengths.global.description'),
    },
    {
      icon: '💰',
      title: t('about.strengths.competitive.title'),
      description: t('about.strengths.competitive.description'),
    },
    {
      icon: '🤝',
      title: t('about.strengths.service.title'),
      description: t('about.strengths.service.description'),
    },
  ]

  const stats = [
    { label: t('about.stats.transactions'), value: '100K+', suffix: '' },
    { label: t('about.stats.users'), value: '50K+', suffix: '' },
    { label: t('about.stats.countries'), value: '50+', suffix: '' },
    { label: t('about.stats.satisfaction'), value: '99', suffix: '%' },
  ]

  useEffect(() => {
    loadCompanyImages()
  }, [])

  const loadCompanyImages = async () => {
    try {
      const res = await publicApi.getCompanyImages()
      setCompanyImages(res.data)
    } catch (error) {
      console.error('加载公司图片失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50 dark-mode:bg-black relative overflow-hidden">
      <AnimatedBackground />
      <FloatingElements />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative px-4 py-20 bg-gradient-to-br from-blue-50 to-green-50 dark-mode:bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo/richmax-logo.png"
              alt="RichPlus Logo"
              className="h-24 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <h1 className="section-title text-5xl md:text-6xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-6 relative inline-block">
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            RichPlus
          </h1>
          <p className="text-xl text-neutral-600 dark-mode:text-gold-500/80 max-w-3xl mx-auto leading-relaxed mb-8">
            {t('about.hero.description')}
          </p>
        </div>
      </section>

      {/* Company Introduction */}
      <section
        className="section-card px-4 py-20 bg-white dark-mode:bg-black relative"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="section-title text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-12 text-center relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('about.introduction.title')}
          </h2>
          <div className="prose prose-lg max-w-none text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed">
            <p className="text-lg mb-6">{t('about.introduction.paragraph1')}</p>
            <p className="text-lg mb-6">{t('about.introduction.paragraph2')}</p>
            <p className="text-lg">{t('about.introduction.paragraph3')}</p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section
        ref={statsSectionRef}
        className="section-card px-4 py-20 bg-gradient-to-br from-blue-50 to-blue-100/50 dark-mode:bg-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="section-title text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-12 text-center relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('about.stats.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                stat={stat}
                sectionRef={statsSectionRef.current}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Company Images Gallery */}
      {companyImages.length > 0 && (
        <section
          className="section-card px-4 py-20 bg-gradient-to-br from-silver-50 to-silver-100/50 dark-mode:bg-black relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto relative z-10">
            <h2 className="section-title text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-12 text-center relative">
              <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
              {t('about.gallery.title')}
            </h2>
            <div className={`grid gap-6 ${
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
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
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
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-2 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
                      {image.title}
                    </h3>
                    {image.description && (
                      <p className="text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed">
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

      {/* Company Strengths */}
      <section
        className="section-card px-4 py-20 bg-gradient-to-br from-green-50 to-green-100/30 dark-mode:bg-black relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="section-title text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-12 text-center relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('about.strengths.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strengths.map((strength, index) => (
              <div
                key={index}
                className="bg-surface dark-mode:bg-black rounded-lg p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30 hover:shadow-dialog transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-green-500/0 dark-mode:from-gold-500/0 dark-mode:to-gold-400/0 group-hover:from-blue-500/5 group-hover:to-green-500/5 dark-mode:group-hover:from-gold-500/20 dark-mode:group-hover:to-gold-400/20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {strength.icon}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-3 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
                    {strength.title}
                  </h3>
                  <p className="text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed">
                    {strength.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section
        className="section-card px-4 py-20 bg-white dark-mode:bg-black relative"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 dark-mode:bg-black dark-mode:border dark-mode:border-gold-500/30 rounded-lg p-8 border border-blue-200">
              <h3 className="text-3xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-4">
                {t('about.mission.title')}
              </h3>
              <p className="text-lg text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed">
                {t('about.mission.description')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/30 dark-mode:bg-black dark-mode:border dark-mode:border-gold-500/30 rounded-lg p-8 border border-green-200">
              <h3 className="text-3xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-4">
                {t('about.vision.title')}
              </h3>
              <p className="text-lg text-neutral-600 dark-mode:text-gold-500/80 leading-relaxed">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

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

