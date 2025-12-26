import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * 统计数字滚动动画 Hook（支持后缀，如 "100K+", "99%"）
 * @param targetValue 目标数值（字符串，如 "100K+", "50+", "99%"）
 * @param duration 动画时长（秒）
 * @param triggerRef 触发动画的元素引用（用于 ScrollTrigger）
 * @returns 格式化后的数字字符串（包含后缀）
 */
export function useStatNumberAnimation(
  targetValue: string,
  duration: number = 2,
  triggerRef?: React.RefObject<HTMLElement> | HTMLElement | null
): string {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  // 解析目标值，提取数字和后缀
  const parseValue = (value: string): { number: number; suffix: string } => {
    // 匹配数字和可能的单位（K, M, +, % 等）
    const match = value.match(/^([\d.]+)([K+M%]*\+?)$/)
    if (match) {
      const num = parseFloat(match[1])
      const suffix = match[2] || ''
      return { number: num, suffix }
    }
    // 如果没有匹配到，尝试直接解析数字
    const num = parseFloat(value)
    return { number: isNaN(num) ? 0 : num, suffix: '' }
  }

  const { number: targetNum, suffix } = parseValue(targetValue)

  useEffect(() => {
    if (hasAnimated) return

    const startAnimation = () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }

      const obj = { value: 0 }
      animationRef.current = gsap.to(obj, {
        value: targetNum,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          const num = typeof obj.value === 'number' ? obj.value : Number(obj.value) || 0
          setDisplayValue(num)
        },
        onComplete: () => {
          setDisplayValue(targetNum)
          setHasAnimated(true)
        },
      })
    }

    // 如果提供了 triggerRef，使用 ScrollTrigger
    const triggerElement = triggerRef && 'current' in triggerRef ? triggerRef.current : triggerRef
    if (triggerElement) {
      const scrollTrigger = ScrollTrigger.create({
        trigger: triggerElement,
        start: 'top bottom', // 元素顶部到达视口底部时触发（更容易触发，适合移动端）
        onEnter: () => {
          if (!hasAnimated) {
            startAnimation()
          }
        },
        once: true, // 只触发一次
      })

      return () => {
        scrollTrigger.kill()
        if (animationRef.current) {
          animationRef.current.kill()
        }
      }
    } else {
      // 如果没有 triggerRef，立即开始动画
      startAnimation()
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [targetNum, duration, hasAnimated, triggerRef])

  // 格式化显示值
  const formatNumber = (num: number): string => {
    // 如果目标值包含 "K"，显示整数
    if (suffix.includes('K')) {
      return Math.floor(num).toString()
    }
    // 如果是百分比，显示整数
    if (suffix.includes('%')) {
      return Math.floor(num).toString()
    }
    // 其他情况显示整数
    return Math.floor(num).toString()
  }

  return `${formatNumber(displayValue)}${suffix}`
}

