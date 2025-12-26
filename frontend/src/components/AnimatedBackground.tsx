import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * 原创动态背景装饰组件
 * 包含浮动几何图形和粒子效果
 */
export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建浮动圆形装饰
    const circles = containerRef.current.querySelectorAll('.floating-circle')
    circles.forEach((circle, index) => {
      gsap.to(circle, {
        y: `+=${30 + index * 10}`,
        x: `+=${20 + index * 5}`,
        rotation: 360,
        duration: 8 + index * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.5,
      })
    })

    // 创建脉冲效果
    const pulses = containerRef.current.querySelectorAll('.pulse-circle')
    pulses.forEach((pulse, index) => {
      gsap.to(pulse, {
        scale: 1.3,
        opacity: 0.3,
        duration: 2 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut',
        delay: index * 0.3,
      })
    })
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 浮动圆形装饰 */}
      <div className="floating-circle absolute top-20 left-10 w-32 h-32 bg-blue-200/20 dark-mode:bg-gold-500/10 rounded-full blur-xl"></div>
      <div className="floating-circle absolute top-40 right-20 w-24 h-24 bg-green-200/20 dark-mode:bg-gold-500/10 rounded-full blur-xl"></div>
      <div className="floating-circle absolute bottom-32 left-1/4 w-40 h-40 bg-purple-200/15 dark-mode:bg-gold-500/8 rounded-full blur-xl"></div>
      <div className="floating-circle absolute bottom-20 right-1/3 w-28 h-28 bg-blue-300/20 dark-mode:bg-gold-500/10 rounded-full blur-xl"></div>

      {/* 脉冲圆圈 */}
      <div className="pulse-circle absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100/10 dark-mode:bg-gold-500/5 rounded-full"></div>
      <div className="pulse-circle absolute bottom-1/4 left-1/4 w-48 h-48 bg-green-100/10 dark-mode:bg-gold-500/5 rounded-full"></div>

      {/* 几何线条装饰 */}
      <svg className="absolute inset-0 w-full h-full opacity-5 dark-mode:opacity-10" viewBox="0 0 1200 800">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B7CB8" />
            <stop offset="50%" stopColor="#2E8B57" />
            <stop offset="100%" stopColor="#3B7CB8" />
          </linearGradient>
          <linearGradient id="lineGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFD966" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>
        <path
          d="M 0 200 Q 300 100 600 200 T 1200 200"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse [html.dark-mode_&]:stroke-[url(#lineGradientDark)]"
        />
        <path
          d="M 0 600 Q 300 500 600 600 T 1200 600"
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse [html.dark-mode_&]:stroke-[url(#lineGradientDark)]"
          style={{ animationDelay: '1s' }}
        />
      </svg>
    </div>
  )
}

