import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { publicApi } from '../api/services'
import { format } from 'date-fns'
import zhCN from 'date-fns/locale/zh-CN'
import enUS from 'date-fns/locale/en-US'
import es from 'date-fns/locale/es'
import fr from 'date-fns/locale/fr'
import toast from 'react-hot-toast'

export default function Trades() {
  const { t, i18n } = useTranslation()
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
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

  useEffect(() => {
    loadTrades()
    loadConversionConfig()
  }, [page, limit])

  const loadConversionConfig = async () => {
    try {
      const res = await publicApi.getConversionConfig()
      setConversionConfig({
        ngnRate: res.data.ngnRate || 200,
        ghcRate: res.data.ghcRate || 1.0,
      })
    } catch (error) {
      console.error('加载汇率配置失败:', error)
      // 使用默认值
      setConversionConfig({
        ngnRate: 200,
        ghcRate: 1.0,
      })
    }
  }

  const loadTrades = async () => {
    try {
      setLoading(true)
      const res = await publicApi.getAllTrades(page, limit)
      setTrades(res.data.trades || [])
      setTotal(res.data.total || 0)
      setTotalPages(res.data.totalPages || 0)
      setLoading(false)
    } catch (error) {
      toast.error(t('common.error'))
      setLoading(false)
    }
  }

  const handleLimitChange = (newLimit: number) => {
    setSearchParams({ page: '1', limit: String(newLimit) })
  }

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

  return (
    <div className="min-h-screen bg-silver-50 dark-mode:bg-black">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8 text-center relative">
          <h1 className="section-title text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 inline-block relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('trades.title')}
          </h1>
          <div className="flex items-center gap-3 justify-center md:justify-end md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2 mt-6 md:mt-0 flex-wrap">
            {/* 货币切换 */}
            <div className="flex items-center gap-2 bg-white dark-mode:bg-black border border-silver-200 dark-mode:border-gold-500/30 rounded-md p-1">
              <button
                onClick={() => setSelectedCurrency('NGN')}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                  selectedCurrency === 'NGN'
                    ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                    : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
                }`}
              >
                ₦ NGN
              </button>
              <button
                onClick={() => setSelectedCurrency('GHC')}
                className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                  selectedCurrency === 'GHC'
                    ? 'bg-blue-600 text-white dark-mode:bg-gold-500 dark-mode:text-black'
                    : 'text-neutral-600 dark-mode:text-gold-500/70 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10'
                }`}
              >
                GH₵ GHC
              </button>
            </div>
            <label className="text-sm font-medium text-neutral-600 dark-mode:text-gold-500/80">{t('trades.itemsPerPage')}:</label>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="px-3 py-2 border border-silver-200 dark-mode:border-gold-500/30 bg-white dark-mode:bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark-mode:focus:ring-gold-500 focus:border-blue-600 dark-mode:focus:border-gold-500 text-sm font-medium text-neutral-700 dark-mode:text-gold-500"
            >
              {[10, 20, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value} {t('trades.records')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="bg-surface dark-mode:bg-black rounded-md p-6 shadow-card border border-silver-200 dark-mode:border-gold-500/30">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-16 bg-silver-100 dark-mode:bg-gold-500/20 rounded-md animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-surface dark-mode:bg-black rounded-md p-6 shadow-card border border-silver-200 dark-mode:border-gold-500/30 mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-silver-200 dark-mode:border-gold-500/30">
                      <th className="text-left py-4 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">
                        {t('trades.product')}
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">
                        {t('trades.amount')}
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">
                        {t('products.exchangeRate')}
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">
                        {t('trades.totalAmount')}
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">
                        {t('trades.updatedAt')}
                      </th>
                      <th className="text-left py-4 px-4 text-neutral-600 dark-mode:text-gold-500/80 font-semibold">
                        {t('trades.statusLabel')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-neutral-500 dark-mode:text-gold-500/70">
                          {t('trades.noTrades')}
                        </td>
                      </tr>
                    ) : (
                      trades.map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-b border-silver-100 dark-mode:border-gold-500/20 hover:bg-silver-50 dark-mode:hover:bg-gold-500/10 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold text-neutral-700 dark-mode:text-gold-500">
                            {trade.productName}
                          </div>
                          <div className="text-sm text-neutral-500 dark-mode:text-gold-500/70">
                            {trade.currency}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-neutral-700 dark-mode:text-gold-500 font-medium">
                          {Number(trade.amount).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-neutral-700 dark-mode:text-gold-500 font-medium">
                          {Number(trade.exchangeRate).toFixed(4)}
                        </td>
                        <td className="py-4 px-4 text-green-600 dark-mode:text-green-400 font-bold">
                          {getCurrencySymbol()}{getConvertedAmount(Number(trade.totalAmount)).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-neutral-500 dark-mode:text-gold-500/70 text-sm">
                          {format(new Date(trade.createdAt), 'yyyy-MM-dd HH:mm', {
                            locale: getLocale(),
                          })}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-3 py-1 rounded-md text-xs font-semibold ${
                              trade.status === 'completed'
                                ? 'bg-green-100 dark-mode:bg-green-500/30 text-green-700 dark-mode:text-green-400'
                                : 'bg-warning/20 dark-mode:bg-gold-500/30 text-warning dark-mode:text-gold-400'
                            }`}
                          >
                            {trade.status === 'completed' ? t('trades.status.completed') : t('trades.status.processing')}
                          </span>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 分页 */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setSearchParams({ page: String(page - 1), limit: String(limit) })}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border border-blue-500/30 dark-mode:border-gold-500/50 text-blue-600 dark-mode:text-gold-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark-mode:hover:bg-gold-500/20 transition-colors font-medium"
                >
                  {t('common.previous')}
                </button>
                <span className="px-4 py-2 text-neutral-600 dark-mode:text-gold-500/80 font-medium">
                  {t('trades.page')} {page} {t('trades.of')} {totalPages}, {t('trades.total')} {total} {t('trades.records')}
                </span>
                <button
                  onClick={() => setSearchParams({ page: String(page + 1), limit: String(limit) })}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-md border border-blue-500/30 dark-mode:border-gold-500/50 text-blue-600 dark-mode:text-gold-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50 dark-mode:hover:bg-gold-500/20 transition-colors font-medium"
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

