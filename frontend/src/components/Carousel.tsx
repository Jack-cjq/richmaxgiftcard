import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useTranslation } from 'react-i18next'

interface Carousel {
  id: number
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
}

interface Props {
  carousels: Carousel[]
  loading: boolean
}

export default function Carousel({ carousels, loading }: Props) {
  const { t } = useTranslation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (carousels.length === 0) return

    // 自动轮播
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carousels.length)
    }, 5000) // 每5秒切换

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [carousels.length])

  useEffect(() => {
    // GSAP 切换动画
    if (carouselRef.current) {
      gsap.to(carouselRef.current, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          gsap.to(carouselRef.current, {
            opacity: 1,
            duration: 0.5,
          })
        },
      })
    }
  }, [currentIndex])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carousels.length)
    }, 5000)
  }

  if (loading) {
    return (
      <div className="relative w-full carousel-container carousel-aspect-ratio bg-silver-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-neutral-500">{t('common.loading')}</div>
        </div>
      </div>
    )
  }

  if (carousels.length === 0) {
    return null
  }

  const currentCarousel = carousels[currentIndex]

  const getImageUrl = () => {
    const url = currentCarousel.imageUrl
    // 如果是完整 URL（http/https），直接使用
    if (url.startsWith('http')) {
      return url
    }
    // 如果是 base64 数据 URL，直接使用
    if (url.startsWith('data:image/')) {
      return url
    }
    // 如果以 / 开头，直接使用（相对路径）
    if (url.startsWith('/')) {
      return url
    }
    // 否则，假设是文件名，拼接默认路径
    return `/images/carousels/${url.split('/').pop()}`
  }

  return (
    <div className="relative w-full overflow-hidden carousel-container">
      {/* 轮播图片 */}
      <div
        ref={carouselRef}
        className="relative w-full carousel-image carousel-with-gradient"
      >
        <img
          src={getImageUrl()}
          alt={currentCarousel.title || 'Carousel'}
          className="w-full h-auto block carousel-img"
        />
        {/* 遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 pointer-events-none"></div>
        {/* 底部渐变遮罩 - 用于自然过渡到下方区域 */}
        <div className="carousel-bottom-gradient"></div>

        {/* 内容 */}
        {(currentCarousel.title || currentCarousel.subtitle) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4 max-w-4xl">
              {currentCarousel.title && (
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                  {currentCarousel.title}
                </h1>
              )}
              {currentCarousel.subtitle && (
                <p className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-md">
                  {currentCarousel.subtitle}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 指示器 */}
      {carousels.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {carousels.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`切换到第 ${index + 1} 张`}
            />
          ))}
        </div>
      )}

      {/* 左右箭头 */}
      {carousels.length > 1 && (
        <>
          <button
            onClick={() => goToSlide((currentIndex - 1 + carousels.length) % carousels.length)}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="上一张"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => goToSlide((currentIndex + 1) % carousels.length)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="下一张"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}

