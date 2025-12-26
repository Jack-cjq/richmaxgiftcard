import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { publicApi } from '@/api/services'

interface ConversionConfig {
  rRate: number // R汇率（如：USD到CNY）
  serviceFeePercent: number // 服务费比例（如：0.03表示3%）
  ngnRate: number // 尼日利亚奈拉汇率（1 CNY = X NGN）
  ghcRate: number // 加纳塞地汇率（1 CNY = X GHC）
  cardCategories: Record<string, string[]> // 卡片类型对应的种类列表
  categoryRates: Record<string, Record<string, { rate: number; currency: string }>> // 汇率配置
}

interface SupportedCard {
  id: number
  name: string
  logoUrl?: string
  description?: string
  isActive: boolean
}

export default function ConversionCalculator() {
  const { t } = useTranslation()
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'GHC'>('NGN')
  const [selectedCardType, setSelectedCardType] = useState<string>('') // 卡片类型（从 supported_cards 获取）
  const [selectedCategory, setSelectedCategory] = useState<string>('') // 种类（如 Amazon US, Amazon UK）
  const [cardAmount, setCardAmount] = useState<string>('')
  const [config, setConfig] = useState<ConversionConfig | null>(null)
  const [supportedCards, setSupportedCards] = useState<SupportedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [calculatedValue, setCalculatedValue] = useState<number>(0)

  useEffect(() => {
    loadConfig()
    loadSupportedCards()
  }, [])

  const loadSupportedCards = async () => {
    try {
      const res = await publicApi.getSupportedCards()
      // 只获取激活的卡片
      const activeCards = (res.data || []).filter((card: SupportedCard) => card.isActive)
      setSupportedCards(activeCards)
    } catch (error) {
      console.error('加载支持的卡片失败:', error)
    }
  }

  // 根据选择的卡片类型获取可用的种类列表
  const getAvailableCategories = (): string[] => {
    if (!selectedCardType || !config?.cardCategories) return []
    return config.cardCategories[selectedCardType] || []
  }

  useEffect(() => {
    calculate()
  }, [cardAmount, selectedCurrency, selectedCardType, selectedCategory, config])

  const loadConfig = async () => {
    try {
      const res = await publicApi.getConversionConfig()
      setConfig(res.data)
      setLoading(false)
    } catch (error) {
      console.error('加载换算配置失败:', error)
      setLoading(false)
    }
  }

  const calculate = () => {
    if (!config || !cardAmount || parseFloat(cardAmount) <= 0 || !selectedCardType || !selectedCategory) {
      setCalculatedValue(0)
      return
    }

    const amount = parseFloat(cardAmount)
    const customerPercent = 1 - config.serviceFeePercent // 给客户的百分比（如：0.97）

    // 获取该卡片类型和种类对应的汇率
    const categoryRate = config.categoryRates?.[selectedCardType]?.[selectedCategory]
    if (!categoryRate) {
      setCalculatedValue(0)
      return
    }

    // 公式：商品价值 * 种类汇率 * 扣除服务费给客户百分比 * 客户地区货币汇率
    // categoryRate.rate 是该种类货币到CNY的汇率（如 USD到CNY）
    const step1 = amount * categoryRate.rate * customerPercent // 转换为CNY并扣除服务费
    const localRate = selectedCurrency === 'NGN' ? config.ngnRate : config.ghcRate
    const result = step1 * localRate

    // 去掉小数点（向下取整）
    setCalculatedValue(Math.floor(result))
  }

  const formatCurrency = (value: number) => {
    if (selectedCurrency === 'NGN') {
      return `₦${value.toLocaleString()}`
    } else {
      return `₵${value.toLocaleString()}`
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 shadow-2xl border border-blue-400/20 calculator-dark-bg">
        {/* 货币选择标签 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setSelectedCurrency('NGN')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all border ${
              selectedCurrency === 'NGN'
                ? 'bg-white dark-mode:bg-black text-blue-600 dark-mode:text-gold-500 dark-mode:font-bold shadow-lg border-transparent dark-mode:border-gold-500/50'
                : 'bg-white/20 dark-mode:bg-gold-500/30 text-white dark-mode:text-gold-400 hover:bg-white/30 dark-mode:hover:bg-gold-500/40 backdrop-blur-sm border-transparent dark-mode:border-gold-500/30'
            }`}
          >
            {t('calculator.currency.ngn')}
          </button>
          <button
            onClick={() => setSelectedCurrency('GHC')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all border ${
              selectedCurrency === 'GHC'
                ? 'bg-white dark-mode:bg-black text-blue-600 dark-mode:text-gold-500 dark-mode:font-bold shadow-lg border-transparent dark-mode:border-gold-500/50'
                : 'bg-white/20 dark-mode:bg-gold-500/30 text-white dark-mode:text-gold-400 hover:bg-white/30 dark-mode:hover:bg-gold-500/40 backdrop-blur-sm border-transparent dark-mode:border-gold-500/30'
            }`}
          >
            {t('calculator.currency.ghc')}
          </button>
        </div>

        {/* 表单 */}
        <div className="space-y-4">
          <div>
            <label className="block text-white dark-mode:text-gold-500 text-sm font-medium mb-2">
              {t('calculator.selectCardType')}
            </label>
            <select
              value={selectedCardType}
              onChange={(e) => {
                setSelectedCardType(e.target.value)
                setSelectedCategory('')
              }}
              className="w-full px-4 py-3 rounded-lg border border-transparent dark-mode:border-gold-500/30 bg-white dark-mode:bg-black focus:bg-white dark-mode:focus:bg-black focus:ring-2 focus:ring-blue-400 dark-mode:focus:ring-gold-500 focus:border-blue-400 dark-mode:focus:border-gold-500/50 text-neutral-700 dark-mode:text-gold-500 font-medium shadow-sm"
            >
              <option value="">{t('calculator.chooseCardType')}</option>
              {supportedCards.map((card) => (
                <option key={card.id} value={card.name}>
                  {card.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white dark-mode:text-gold-500 text-sm font-medium mb-2">
              {t('calculator.selectSubCategory')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-transparent dark-mode:border-gold-500/30 bg-white dark-mode:bg-black focus:bg-white dark-mode:focus:bg-black focus:ring-2 focus:ring-blue-400 dark-mode:focus:ring-gold-500 focus:border-blue-400 dark-mode:focus:border-gold-500/50 text-neutral-700 dark-mode:text-gold-500 font-medium shadow-sm"
              disabled={!selectedCardType || getAvailableCategories().length === 0}
            >
              <option value="">{t('calculator.chooseSubCategory')}</option>
              {getAvailableCategories().map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {selectedCardType && getAvailableCategories().length === 0 && (
              <p className="text-white/70 dark-mode:text-gold-500/70 text-xs mt-1">
                {t('calculator.noCategoryAvailable')}
              </p>
            )}
          </div>

          <div>
            <label className="block text-white dark-mode:text-gold-500 text-sm font-medium mb-2">
              {t('calculator.enterAmount')}
            </label>
            <div className="relative">
              <input
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                placeholder={t('calculator.enterAmount')}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-transparent dark-mode:border-gold-500/30 bg-white dark-mode:bg-black focus:bg-white dark-mode:focus:bg-black focus:ring-2 focus:ring-blue-400 dark-mode:focus:ring-gold-500 focus:border-blue-400 dark-mode:focus:border-gold-500/50 text-neutral-700 dark-mode:text-gold-500 font-medium shadow-sm"
                min="0"
                step="0.01"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col">
                <button
                  type="button"
                  onClick={() => setCardAmount(((parseFloat(cardAmount) || 0) + 1).toString())}
                  className="text-blue-400 dark-mode:text-gold-500 hover:text-blue-600 dark-mode:hover:text-gold-400 text-xs transition-colors"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => setCardAmount(Math.max(0, (parseFloat(cardAmount) || 0) - 1).toString())}
                  className="text-blue-400 dark-mode:text-gold-500 hover:text-blue-600 dark-mode:hover:text-gold-400 text-xs transition-colors"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          {/* 计算结果 */}
          <div className="mt-6 p-6 bg-white/10 dark-mode:bg-black/50 dark-mode:border dark-mode:border-gold-500/30 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="text-white/90 dark-mode:text-gold-500/90 text-sm font-medium mb-2">{t('calculator.cashValue')}</div>
            <div className="text-4xl font-bold text-white dark-mode:text-gold-500">
              {loading ? (
                <span className="text-white/70 dark-mode:text-gold-500/70">{t('calculator.calculating')}</span>
              ) : (
                <span className="text-green-50 dark-mode:text-gold-400 drop-shadow-lg">
                  {formatCurrency(calculatedValue)}
                </span>
              )}
            </div>
          </div>

          {/* 开始按钮 */}
          <button
            className="w-full py-4 bg-white dark-mode:bg-black border border-transparent dark-mode:border-gold-500/50 text-blue-600 dark-mode:text-gold-500 rounded-lg font-bold text-lg hover:bg-blue-50 dark-mode:hover:bg-gold-500/20 hover:shadow-xl transition-all shadow-lg mt-6 focus:ring-2 focus:ring-white dark-mode:focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-blue-600 dark-mode:focus:ring-offset-gold-600 focus:border-blue-400 dark-mode:focus:border-gold-500"
          >
            {t('common.getStarted')}
          </button>

          {/* 提示文字 */}
          <p className="text-white/80 dark-mode:text-gold-500/80 text-xs text-center mt-4">
            {t('calculator.amountHint')}
          </p>
        </div>
      </div>
    </div>
  )
}

