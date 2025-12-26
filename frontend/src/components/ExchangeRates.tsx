import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { useAnimatedNumber } from '@/hooks/useNumberAnimation'

interface ExchangeRate {
  id: number
  currency: string
  symbol: string
  rate: number
  change: number
  changePercent: number
  updatedAt: string
  isPrimary?: boolean // 是否为主要货币
}

interface Props {
  rates: ExchangeRate[]
  loading: boolean
}

// 数字滚动组件
function AnimatedRate({ value }: { value: number }) {
  const numValue = typeof value === 'number' ? value : Number(value) || 0
  const displayValue = useAnimatedNumber(numValue, 4, 0.8)
  return <>{displayValue}</>
}

export default function ExchangeRates({ rates, loading }: Props) {
  const { t, i18n } = useTranslation()
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const tableRef = useRef<HTMLDivElement | null>(null)

  // 货币名称翻译映射（根据 symbol）
  const getCurrencyName = (symbol: string, fallback: string): string => {
    const currencyKey = `currencies.${symbol.toLowerCase()}`
    const translated = t(currencyKey)
    // 如果翻译存在且不是 key 本身，返回翻译；否则返回原始值
    return translated !== currencyKey ? translated : fallback
  }

  // 分离主要货币和其他货币
  const primaryRates = rates.filter((rate) => rate.isPrimary)
  const otherRates = rates.filter((rate) => !rate.isPrimary)

  useEffect(() => {
    // 主要货币卡片动画
    if (primaryRates.length > 0) {
      cardRefs.current.forEach((ref, index) => {
        if (ref) {
          gsap.fromTo(
            ref,
            {
              opacity: 0,
              y: 20,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              delay: index * 0.1,
              ease: 'power2.out',
            }
          )
        }
      })
    }

    // 表格动画
    if (tableRef.current && otherRates.length > 0) {
      gsap.fromTo(
        tableRef.current,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.5,
          ease: 'power2.out',
        }
      )
    }
  }, [rates, primaryRates.length, otherRates.length])

  if (loading) {
    return (
      <div>
        {/* 主要货币加载骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6 mb-4 md:mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-surface dark-mode:bg-black rounded-md p-4 md:p-6 shadow-card animate-pulse border border-silver-200 dark-mode:border-gold-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-silver-200 rounded w-1/2"></div>
                <div className="h-4 bg-silver-200 rounded w-16"></div>
              </div>
              <div className="h-10 bg-silver-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-silver-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (rates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-neutral-400 text-lg font-medium">{t('exchangeRates.noRates')}</div>
      </div>
    )
  }

  return (
    <div>
      {/* 主要货币 - 卡片显示 */}
      {primaryRates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6 mb-4 md:mb-8">
          {primaryRates.map((rate, index) => {
            const isPositive = Number(rate.change) >= 0
            return (
              <div
                key={rate.id}
                ref={(el) => (cardRefs.current[index] = el)}
                className="group card-item bg-surface dark-mode:bg-black rounded-md p-4 md:p-6 shadow-card hover:shadow-dialog transition-all duration-300 border border-silver-200 dark-mode:border-gold-500/30 hover:border-blue-500/50 dark-mode:hover:border-gold-500/50 transform hover:-translate-y-2 hover:scale-[1.02] cursor-pointer relative overflow-hidden"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    y: -8,
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out',
                  })
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    y: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out',
                  })
                }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/10 to-green-500/10 dark-mode:from-gold-500/20 dark-mode:to-gold-400/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <div className="text-xs md:text-sm font-semibold text-neutral-700 dark-mode:text-gold-500 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
                      {getCurrencyName(rate.symbol, rate.currency)}
                    </div>
                    <div className="text-[10px] md:text-xs font-medium text-neutral-500 dark-mode:text-gold-500/70 mt-0.5 md:mt-1">{rate.symbol}</div>
                  </div>
                  <div
                    className={`text-[10px] md:text-sm font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md ${
                      isPositive
                        ? 'text-green-700 dark-mode:text-green-400 bg-green-50 dark-mode:bg-green-500/30'
                        : 'text-danger dark-mode:text-red-400 bg-red-50 dark-mode:bg-red-500/30'
                    }`}
                  >
                    {isPositive ? '↑' : '↓'} {Math.abs(Number(rate.changePercent)).toFixed(2)}%
                  </div>
                </div>
                <div className="text-2xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-1.5 md:mb-2 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
                  <AnimatedRate value={Number(rate.rate)} />
                </div>
                <div className="text-[10px] md:text-xs font-medium text-neutral-500 dark-mode:text-gold-500/70">
                  {t('exchangeRates.updatedAt')} {new Date(rate.updatedAt).toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 其他货币 - 表格显示 */}
      {otherRates.length > 0 && (
        <div ref={tableRef} className="bg-surface dark-mode:bg-black rounded-md p-3 md:p-6 shadow-card border border-silver-200 dark-mode:border-gold-500/30">
          <h3 className="text-lg md:text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-3 md:mb-4">{t('exchangeRates.otherCurrencies')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-silver-200 dark-mode:border-gold-500/30">
                  <th className="text-left py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">{t('exchangeRates.currency')}</th>
                  <th className="text-left py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">{t('exchangeRates.symbol')}</th>
                  <th className="text-left py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">{t('exchangeRates.rate')}</th>
                  <th className="text-left py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">{t('exchangeRates.change')}</th>
                  <th className="text-left py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">{t('exchangeRates.changeRate')}</th>
                  <th className="text-left py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">{t('exchangeRates.updateTime')}</th>
                </tr>
              </thead>
              <tbody>
                {otherRates.map((rate) => {
                  const isPositive = Number(rate.change) >= 0
                  return (
                    <tr
                      key={rate.id}
                      className="border-b border-silver-100 dark-mode:border-gold-500/20 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-neutral-700 dark-mode:text-gold-500">{getCurrencyName(rate.symbol, rate.currency)}</td>
                      <td className="py-3 px-4 text-neutral-600 dark-mode:text-gold-500/80">{rate.symbol}</td>
                      <td className="py-3 px-4 font-bold text-neutral-700 dark-mode:text-gold-500">
                        {Number(rate.rate).toFixed(4)}
                      </td>
                      <td
                        className={`py-3 px-4 font-medium ${
                          isPositive ? 'text-green-600 dark-mode:text-green-400' : 'text-danger dark-mode:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {Number(rate.change).toFixed(4)}
                      </td>
                      <td
                        className={`py-3 px-4 font-medium ${
                          isPositive ? 'text-green-600 dark-mode:text-green-400' : 'text-danger dark-mode:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {Number(rate.changePercent).toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-500 dark-mode:text-gold-500/70">
                        {new Date(rate.updatedAt).toLocaleTimeString(i18n.language === 'zh' ? 'zh-CN' : i18n.language === 'es' ? 'es-ES' : i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 如果没有任何数据 */}
      {primaryRates.length === 0 && otherRates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-neutral-400 dark-mode:text-gold-500/70 text-lg font-medium">{t('exchangeRates.noRates')}</div>
        </div>
      )}
    </div>
  )
}
