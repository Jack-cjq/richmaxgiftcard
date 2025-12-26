import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * 闪烁星星效果组件
 * 创建闪烁的星星装饰
 */
export default function SparkleEffect() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sparkles = containerRef.current.querySelectorAll('.sparkle')
    
    sparkles.forEach((sparkle, index) => {
      // 随机闪烁动画
      gsap.to(sparkle, {
        opacity: 0.3,
        scale: 0.5,
        duration: 1 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: index * 0.2,
      })

      // 随机位置移动
      gsap.to(sparkle, {
        x: `+=${(Math.random() - 0.5) * 100}`,
        y: `+=${(Math.random() - 0.5) * 100}`,
        duration: 5 + Math.random() * 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.3,
      })
    })
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="sparkle absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-blue-400/40 dark-mode:text-gold-500/40">
            <path
              d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z"
              fill="currentColor"
            />
          </svg>
        </div>
      ))}
    </div>
  )
}

