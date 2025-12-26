import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 ScrollTrigger 插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollRevealProps {
  children: ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'
  delay?: number
  duration?: number
  className?: string
}

/**
 * 滚动触发动画组件
 * 当元素进入视口时触发动画
 */
export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    let animationProps: gsap.TweenVars = {}

    // 根据方向设置初始状态
    switch (direction) {
      case 'up':
        animationProps = { y: 60, opacity: 0 }
        break
      case 'down':
        animationProps = { y: -60, opacity: 0 }
        break
      case 'left':
        animationProps = { x: 60, opacity: 0 }
        break
      case 'right':
        animationProps = { x: -60, opacity: 0 }
        break
      case 'fade':
        animationProps = { opacity: 0 }
        break
      case 'scale':
        animationProps = { scale: 0.8, opacity: 0 }
        break
    }

    // 设置初始状态
    gsap.set(element, animationProps)

    // 创建滚动触发动画
    const animation = gsap.to(element, {
      ...(direction === 'up' || direction === 'down' ? { y: 0 } : {}),
      ...(direction === 'left' || direction === 'right' ? { x: 0 } : {}),
      ...(direction === 'scale' ? { scale: 1 } : {}),
      opacity: 1,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom', // 元素顶部到达视口底部时触发（更容易触发）
        end: 'bottom top', // 元素底部离开视口顶部时结束
        toggleActions: 'play none none reverse',
      },
    })

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [direction, delay, duration])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

