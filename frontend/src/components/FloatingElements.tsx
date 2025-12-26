import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * 浮动装饰元素组件
 * 创建随机浮动的几何图形
 */
export default function FloatingElements() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.querySelectorAll('.float-element')
    
    elements.forEach((element) => {
      // 随机初始位置
      const startX = Math.random() * 100
      const startY = Math.random() * 100
      const duration = 10 + Math.random() * 10
      const delay = Math.random() * 2

      gsap.set(element, {
        x: `${startX}%`,
        y: `${startY}%`,
      })

      // 创建浮动动画
      gsap.to(element, {
        x: `+=${(Math.random() - 0.5) * 200}`,
        y: `+=${(Math.random() - 0.5) * 200}`,
        rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
        duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay,
      })
    })
  }, [])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 浮动三角形 */}
      <div className="float-element absolute w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[25px] border-b-blue-300/20 dark-mode:border-b-gold-500/20 opacity-60"></div>
      <div className="float-element absolute w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-green-300/20 dark-mode:border-b-gold-500/20 opacity-60"></div>
      
      {/* 浮动方形 */}
      <div className="float-element absolute w-16 h-16 bg-blue-200/15 dark-mode:bg-gold-500/10 rotate-45"></div>
      <div className="float-element absolute w-12 h-12 bg-green-200/15 dark-mode:bg-gold-500/10 rotate-45"></div>
      
      {/* 浮动圆形 */}
      <div className="float-element absolute w-20 h-20 bg-purple-200/15 dark-mode:bg-gold-500/10 rounded-full blur-sm"></div>
      <div className="float-element absolute w-14 h-14 bg-blue-300/15 dark-mode:bg-gold-500/10 rounded-full blur-sm"></div>
    </div>
  )
}

