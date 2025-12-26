import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * 数字滚动动画 Hook
 * @param value 目标数值
 * @param decimals 小数位数
 * @param duration 动画时长（秒）
 * @returns 格式化后的数字字符串
 */
export function useAnimatedNumber(
  value: number,
  decimals: number = 4,
  duration: number = 1
): string {
  // 确保初始值是数字类型
  const numValue = typeof value === 'number' ? value : Number(value) || 0
  const [displayValue, setDisplayValue] = useState(numValue)
  const animationRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    // 确保目标值是数字类型
    const endValue = typeof value === 'number' ? value : Number(value) || 0
    const startValue = typeof displayValue === 'number' ? displayValue : Number(displayValue) || 0

    if (isNaN(endValue) || isNaN(startValue)) {
      setDisplayValue(endValue)
      return
    }

    if (Math.abs(endValue - startValue) < 0.0001) {
      // 数值变化太小，直接设置目标值
      setDisplayValue(endValue)
      return
    }

    if (animationRef.current) {
      animationRef.current.kill()
    }

    const obj = { value: startValue }
    animationRef.current = gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        const num = typeof obj.value === 'number' ? obj.value : Number(obj.value) || 0
        setDisplayValue(num)
      },
    })

    return () => {
      if (animationRef.current) {
        animationRef.current.kill()
      }
    }
  }, [value, duration])

  // 确保返回时是数字类型才能调用 toFixed
  const numDisplay = typeof displayValue === 'number' ? displayValue : Number(displayValue) || 0
  return isNaN(numDisplay) ? '0.0000' : numDisplay.toFixed(decimals)
}

