import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import zhCN from 'date-fns/locale/zh-CN'
import enUS from 'date-fns/locale/en-US'
import es from 'date-fns/locale/es'
import fr from 'date-fns/locale/fr'
import { publicApi } from '../api/services'

interface Trade {
  id: number
  productName: string
  amount: number
  exchangeRate: number
  totalAmount: number
  currency: string
  createdAt: string
  status: string
}

interface Props {
  trades: Trade[]
  loading: boolean
}

export default function RecentTrades({ trades, loading }: Props) {
  const { t, i18n } = useTranslation()
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'GHC'>('NGN')
  const [conversionConfig, setConversionConfig] = useState<{ ngnRate: number; ghcRate: number } | null>(null)
  
  const getLocale = () => {
    switch (i18n.language) {
      case 'zh': return zhCN
      case 'es': return es
      case 'fr': return fr
      default: return enUS
    }
  }

  // 加载汇率配置
  useEffect(() => {
    const loadConversionConfig = async () => {
      try {
        const res = await publicApi.getConversionConfig()
        setConversionConfig({
          ngnRate: res.data.ngnRate || 200,
          ghcRate: res.data.ghcRate || 1.0,
        })
      } catch (error) {
        console.error('加载汇率配置失败:', error)
        setConversionConfig({
          ngnRate: 200,
          ghcRate: 1.0,
        })
      }
    }
    loadConversionConfig()
  }, [])

  const getConvertedAmount = (totalAmount: number): number => {
    if (!conversionConfig) return totalAmount
    if (selectedCurrency === 'NGN') {
      return Math.floor(totalAmount * conversionConfig.ngnRate)
    } else {
      return Math.floor(totalAmount * conversionConfig.ghcRate)
    }
  }

  const getCurrencySymbol = (): string => {
    return selectedCurrency === 'NGN' ? '₦' : 'GH₵'
  }

  if (loading) {
    return (
      <div className="bg-surface dark-mode:bg-black rounded-md p-6 shadow-card border border-silver-200 dark-mode:border-gold-500/30">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-silver-200 dark-mode:bg-gold-500/20 rounded-md animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!Array.isArray(trades) || trades.length === 0) {
    return (
      <div className="bg-surface dark-mode:bg-black rounded-md p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30">
        <div className="text-center text-neutral-600 dark-mode:text-gold-500/80 font-medium py-12">
          {t('trades.noTrades')}
        </div>
      </div>
    )
  }

  // 移动端显示3条，桌面端显示5条
  const displayedTrades = trades.slice(0, 5)

  // 渲染单个交易卡片的函数
  const renderTradeCard = (trade: Trade, index: number) => {
    // 前3条（index 0, 1, 2）：移动端和桌面端都显示
    // 第4-5条（index 3, 4）：只在桌面端显示
    const isDesktopOnly = index >= 3
    
    return (
      <div
        key={trade.id}
        className={`group flex items-center justify-between p-3 md:p-5 bg-silver-50 dark-mode:bg-black border border-transparent dark-mode:border dark-mode:border-gold-500/30 rounded-md hover:bg-surface dark-mode:hover:bg-neutral-900 transition-all duration-300 hover:shadow-card hover:border-blue-200 dark-mode:hover:border-gold-500/50 hover:-translate-x-1 transform hover:scale-[1.01] relative overflow-hidden ${
          isDesktopOnly ? 'hidden md:flex' : ''
        }`}
        onMouseEnter={(e) => {
          const gsap = (window as any).gsap
          if (gsap) {
            gsap.to(e.currentTarget, {
              x: -4,
              scale: 1.01,
              duration: 0.3,
              ease: 'power2.out',
            })
          }
        }}
        onMouseLeave={(e) => {
          const gsap = (window as any).gsap
          if (gsap) {
            gsap.to(e.currentTarget, {
              x: 0,
              scale: 1,
              duration: 0.3,
              ease: 'power2.out',
            })
          }
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-green-500 dark-mode:from-gold-500 dark-mode:to-gold-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 flex-wrap">
            <span className="font-bold text-sm md:text-lg text-neutral-700 dark-mode:text-gold-500 group-hover:text-blue-600 dark-mode:group-hover:text-gold-400 transition-colors">
              {trade.productName}
            </span>
            <span className="text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 dark-mode:bg-gold-500/30 text-blue-700 dark-mode:text-gold-500 rounded-md font-semibold whitespace-nowrap">
              {trade.currency}
            </span>
          </div>
          <div className="text-xs md:text-sm font-medium text-neutral-500 dark-mode:text-gold-500/70">
            {format(new Date(trade.createdAt), 'yyyy-MM-dd HH:mm:ss', {
              locale: getLocale(),
            })}
          </div>
        </div>
        <div className="text-right mx-2 md:mx-4 min-w-[80px] md:min-w-[100px]">
          <div className="text-base md:text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-0.5 md:mb-1">
            {Number(trade.amount).toLocaleString()}
          </div>
          <div className="text-xs md:text-sm font-medium text-neutral-500 dark-mode:text-gold-500/70">
            {t('trades.amount')}: {Number(trade.exchangeRate).toFixed(4)}
          </div>
        </div>
        <div className="text-right min-w-[100px] md:min-w-[120px]">
          <div className="text-base md:text-xl font-bold text-green-600 dark-mode:text-green-400 mb-0.5 md:mb-1">
            {getCurrencySymbol()}{getConvertedAmount(Number(trade.totalAmount)).toLocaleString()}
          </div>
          <div
            className={`text-[10px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md inline-block ${
              trade.status === 'completed'
                ? 'bg-green-100 dark-mode:bg-green-500/30 text-green-700 dark-mode:text-green-400'
                : 'bg-warning/20 dark-mode:bg-gold-500/30 text-warning dark-mode:text-gold-400'
            }`}
          >
            {trade.status === 'completed' ? t('trades.status.completed') : t('trades.status.processing')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface dark-mode:bg-black rounded-md p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30">
      {/* 货币切换 */}
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="flex items-center gap-2 bg-white dark-mode:bg-black border border-silver-200 dark-mode:border-gold-500/30 rounded-md p-1">
          <button
            onClick={() => setSelectedCurrency('NGN')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base font-semibold transition-colors ${
              selectedCurrency === 'NGN'
                ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
            }`}
          >
            ₦ NGN
          </button>
          <button
            onClick={() => setSelectedCurrency('GHC')}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base font-semibold transition-colors ${
              selectedCurrency === 'GHC'
                ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
            }`}
          >
            GH₵ GHC
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {displayedTrades.map((trade, index) => renderTradeCard(trade, index))}
      </div>
    </div>
  )
}

