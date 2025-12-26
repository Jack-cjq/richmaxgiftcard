import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

interface Video {
  id: number
  title?: string
  description?: string
  videoUrl: string
  thumbnailUrl?: string
  type: 'company' | 'business'
  sortOrder?: number
}

interface Props {
  videos: Video[]
  loading: boolean
}

export default function VideoSection({ videos, loading }: Props) {
  const { t } = useTranslation()
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [userInteracted, setUserInteracted] = useState(false)
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})
  const videoContainerRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})

  const getVideoUrl = (videoUrl: string) => {
    if (videoUrl.startsWith('http') || videoUrl.startsWith('data:')) {
      return videoUrl
    }
    if (videoUrl.startsWith('/')) {
      return videoUrl
    }
    return `/videos/${videoUrl.split('/').pop()}`
  }

  const getThumbnailUrl = (thumbnailUrl?: string) => {
    // 如果有缩略图URL，优先使用
    if (thumbnailUrl) {
      if (thumbnailUrl.startsWith('http') || thumbnailUrl.startsWith('data:')) {
        return thumbnailUrl
      }
      if (thumbnailUrl.startsWith('/')) {
        return thumbnailUrl
      }
      return `/images/videos/${thumbnailUrl.split('/').pop()}`
    }
    
    // 如果没有缩略图，返回 null，让组件显示默认的播放按钮
    return null
  }

  if (loading) {
    return (
      <div className="flex justify-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl w-full" style={{ justifyItems: 'center' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-silver-200 dark-mode:bg-gold-500/20 rounded-lg aspect-video animate-pulse w-full max-w-md"></div>
          ))}
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark-mode:text-gold-500/70">{t('videos.noVideos') || '暂无视频'}</p>
      </div>
    )
  }

  // 按排序顺序排序，然后合并所有视频
  const sortedVideos = [...videos].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))

  // 监听用户交互（点击、滚动等），用于解除浏览器自动播放限制
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteracted(true)
      // 移除监听器，只需要一次交互
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction, { once: true })
    document.addEventListener('scroll', handleUserInteraction, { once: true, passive: true })
    document.addEventListener('touchstart', handleUserInteraction, { once: true })

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  // 使用 Intersection Observer 监听公司介绍视频是否进入视口
  useEffect(() => {
    const companyVideos = sortedVideos.filter(v => v.type === 'company')
    
    if (companyVideos.length === 0) return

    const observers: IntersectionObserver[] = []

    companyVideos.forEach((video) => {
      const container = videoContainerRefs.current[video.id]
      const videoEl = videoRefs.current[video.id]

      if (!container || !videoEl) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              // 视频进入视口且可见度超过50%
              // 先尝试静音播放（浏览器允许）
              videoEl.muted = true
              videoEl.play().then(() => {
                // 静音播放成功后，如果用户已交互，尝试取消静音
                if (userInteracted) {
                  videoEl.muted = false
                }
              }).catch((err) => {
                console.warn('自动播放失败:', err)
              })
            } else if (!entry.isIntersecting) {
              // 视频离开视口，暂停以节省资源
              videoEl.pause()
            }
          })
        },
        {
          threshold: [0, 0.5, 1.0], // 监听多个阈值
          rootMargin: '0px',
        }
      )

      observer.observe(container)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [sortedVideos, userInteracted])

  return (
    <div className="flex justify-center w-full px-4">
      <div 
        className="flex flex-wrap justify-center gap-6 md:gap-8"
        style={{ 
          maxWidth: '1400px',
          width: '100%'
        }}
      >
        {sortedVideos.map((video) => (
          <div
            key={video.id}
            className="bg-surface dark-mode:bg-black rounded-lg overflow-hidden shadow-card border border-silver-200 dark-mode:border-gold-500/30 hover:shadow-dialog transition-all duration-300"
            style={{ 
              width: '100%', 
              maxWidth: 'calc((1400px - 2 * 4rem) / 3)',
              minWidth: '320px',
              flex: '0 1 auto'
            }}
          >
                <div 
                  ref={(el) => {
                    if (el && video.type === 'company') {
                      videoContainerRefs.current[video.id] = el
                    }
                  }}
                  className="relative aspect-video bg-silver-100 dark-mode:bg-black/30 group cursor-pointer overflow-hidden"
                  onClick={() => {
                    // 如果是公司介绍视频，点击时取消静音
                    if (video.type === 'company') {
                      const videoEl = videoRefs.current[video.id]
                      if (videoEl) {
                        videoEl.muted = false
                        videoEl.play().catch(err => {
                          console.warn('播放失败:', err)
                        })
                      }
                    }
                    // 打开全屏播放器
                    setSelectedVideo(video)
                  }}
                >
                  {/* 缩略图或视频预览 */}
                  {/* 公司介绍视频直接显示视频并自动播放，不显示缩略图 */}
                  {getThumbnailUrl(video.thumbnailUrl) && video.type !== 'company' ? (
                    <img
                      src={getThumbnailUrl(video.thumbnailUrl)!}
                      alt={video.title || '未命名视频'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 如果缩略图加载失败，隐藏图片，显示视频预览
                        e.currentTarget.style.display = 'none'
                        // 显示视频元素
                        const videoElement = e.currentTarget.nextElementSibling as HTMLVideoElement
                        if (videoElement) {
                          videoElement.style.display = 'block'
                        }
                      }}
                    />
                  ) : null}
                  {/* 如果没有缩略图或缩略图加载失败，使用视频的第一帧作为预览 */}
                  {/* 公司介绍视频直接显示并自动播放 */}
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[video.id] = el
                    }}
                    src={getVideoUrl(video.videoUrl)}
                    className={`w-full h-full object-cover ${getThumbnailUrl(video.thumbnailUrl) && video.type !== 'company' ? 'hidden' : 'block'}`}
                    muted={true}
                    playsInline
                    autoPlay={false}
                    loop={video.type === 'company'}
                    preload={video.type === 'company' ? 'auto' : 'metadata'}
                    onLoadedMetadata={(e) => {
                      const videoEl = e.currentTarget
                      if (video.type === 'company') {
                        // 公司介绍视频：初始状态保持静音，等待进入视口后由 Intersection Observer 处理播放
                        videoEl.muted = true
                      } else {
                        // 其他视频只显示第一帧
                        try {
                          videoEl.currentTime = 0.1
                        } catch (err) {
                          console.warn('无法设置视频时间:', err)
                        }
                      }
                    }}
                    onSeeked={(e) => {
                      const videoEl = e.currentTarget
                      // 只有非公司介绍视频才暂停
                      if (video.type !== 'company') {
                        videoEl.pause()
                      }
                    }}
                    onCanPlay={(e) => {
                      const videoEl = e.currentTarget
                      if (video.type === 'company') {
                        // 公司介绍视频：等待进入视口后由 Intersection Observer 处理播放
                        // 初始状态保持静音
                        videoEl.muted = true
                      } else if (videoEl.readyState >= 2 && videoEl.currentTime === 0) {
                        // 其他视频显示第一帧
                        videoEl.currentTime = 0.1
                      }
                    }}
                    onPlay={() => {
                      // 当视频开始播放时，如果是公司介绍视频且用户已交互，尝试取消静音
                      const videoEl = videoRefs.current[video.id]
                      if (video.type === 'company' && userInteracted && videoEl) {
                        videoEl.muted = false
                      }
                    }}
                    onError={(e) => {
                      // 如果视频加载失败，显示默认背景
                      const videoEl = e.currentTarget
                      videoEl.style.display = 'none'
                      const fallback = videoEl.parentElement?.querySelector('.video-fallback-bg') as HTMLElement
                      if (fallback) {
                        fallback.style.opacity = '1'
                      }
                    }}
                  />
                  {/* 如果视频加载失败，显示默认背景 */}
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-green-500/20 dark-mode:from-gold-500/20 dark-mode:to-gold-400/20 pointer-events-none opacity-0 video-fallback-bg">
                    <div className="text-6xl text-white dark-mode:text-gold-500 opacity-30">▶</div>
                  </div>
                  {/* 播放按钮覆盖层 - 只有非自动播放的视频显示 */}
                  {video.type !== 'company' && (
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-white/90 dark-mode:bg-gold-500/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <svg
                          className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark-mode:text-black ml-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {/* 自动播放视频的悬停提示 */}
                  {video.type === 'company' && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-md">
                        点击全屏播放
                      </div>
                    </div>
                  )}
                </div>
                {(video.title || video.description) && (
                  <div className="p-4 md:p-6">
                    {video.title && (
                      <h4 className="text-lg md:text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-2">
                        {video.title}
                      </h4>
                    )}
                    {video.description && (
                      <p className="text-sm md:text-base text-neutral-600 dark-mode:text-gold-500/80 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* 视频播放模态框 - 使用 Portal 渲染到 body */}
      {selectedVideo && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 bg-black/90 dark-mode:bg-black/95 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 dark-mode:bg-gold-500/20 dark-mode:hover:bg-gold-500/30 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
            style={{ zIndex: 100000 }}
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 md:w-7 md:h-7 text-white dark-mode:text-gold-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div
            className="relative max-w-5xl w-full mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <video
                src={getVideoUrl(selectedVideo.videoUrl)}
                controls
                autoPlay
                className="max-w-full rounded-lg shadow-2xl"
                style={{ maxHeight: '80vh' }}
              >
                您的浏览器不支持视频播放
              </video>
            </div>
            {(selectedVideo.title || selectedVideo.description) && (
              <div className="mt-4 text-center">
                {selectedVideo.title && (
                  <h3 className="text-xl md:text-2xl font-bold text-white dark-mode:text-gold-500 mb-2">
                    {selectedVideo.title}
                  </h3>
                )}
                {selectedVideo.description && (
                  <p className="text-neutral-300 dark-mode:text-gold-500/80">
                    {selectedVideo.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

