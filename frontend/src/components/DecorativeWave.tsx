import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface DecorativeWaveProps {
  color?: string
  direction?: 'up' | 'down'
}

/**
 * 装饰性波浪组件
 * 创建流动的波浪效果
 */
export default function DecorativeWave({ color = 'blue', direction = 'up' }: DecorativeWaveProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const path = svgRef.current.querySelector('path')
    if (!path) return

    // 创建波浪动画
    gsap.to(path, {
      attr: { d: 'M0,50 Q200,30 400,50 T800,50 L800,100 L0,100 Z' },
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
  }, [])

  const colorClass = color === 'blue' 
    ? 'text-blue-200/30 dark-mode:text-gold-500/20' 
    : 'text-green-200/30 dark-mode:text-gold-500/20'
  const isUp = direction === 'up'

  return (
    <div className={`absolute ${isUp ? 'top-0' : 'bottom-0'} left-0 right-0 w-full h-24 overflow-hidden pointer-events-none`}>
      <svg
        ref={svgRef}
        className={`w-full h-full ${colorClass}`}
        viewBox="0 0 800 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q200,30 400,50 T800,50 L800,100 L0,100 Z"
          fill="currentColor"
          transform={isUp ? 'scale(1, -1) translate(0, -100)' : ''}
        />
      </svg>
    </div>
  )
}

