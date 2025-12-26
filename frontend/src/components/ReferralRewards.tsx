import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gsap } from 'gsap'
import { useStatNumberAnimation } from '@/hooks/useStatNumberAnimation'
import { publicApi } from '@/api/services'

interface SocialButton {
  id: number
  type: string
  label: string
  url: string | null
  sortOrder: number
  isActive: boolean
}

export default function ReferralRewards() {
  const { t } = useTranslation()
  const leftRef = useRef<HTMLDivElement | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [username] = useState('JOHNDOE198')
  const [transactions] = useState(98500)
  const [years] = useState(8)
  const [support] = useState(100)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  // 数字动画
  const animatedTransactions = useStatNumberAnimation(transactions.toString(), 0)
  const animatedYears = useStatNumberAnimation(years.toString(), 0)
  const animatedSupport = useStatNumberAnimation(`${support}%`, 0)

  // 获取 WhatsApp 链接
  useEffect(() => {
    const loadWhatsAppUrl = async () => {
      try {
        const res = await publicApi.getSocialButtons()
        const buttons: SocialButton[] = res.data || []
        const whatsappButton = buttons.find(
          (btn) => btn.type === 'whatsapp' && btn.isActive && btn.url
        )
        if (whatsappButton && whatsappButton.url) {
          setWhatsappUrl(whatsappButton.url)
        }
      } catch (error) {
        console.error('加载 WhatsApp 链接失败:', error)
      }
    }

    loadWhatsAppUrl()
  }, [])

  useEffect(() => {
    // 左侧内容动画
    if (leftRef.current) {
      gsap.fromTo(
        leftRef.current,
        {
          opacity: 0,
          x: -30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
        }
      )
    }

    // 右侧卡片动画
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          x: 30,
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          delay: 0.2,
          ease: 'power2.out',
        }
      )
    }
  }, [])

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username)
    // 可以添加一个提示
  }

  const handleStartEarning = () => {
    // 跳转到 WhatsApp
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } else {
      console.warn('WhatsApp 链接未配置')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
      {/* 左侧：Earn Rewards 内容 */}
      <div ref={leftRef} className="flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-4 md:mb-6">
          {t('referralRewards.title')}
        </h2>
        <p className="text-base md:text-lg text-neutral-600 dark-mode:text-gold-500/80 mb-6 md:mb-8 leading-relaxed">
          {t('referralRewards.description')}
        </p>
        <button
          onClick={handleStartEarning}
          className="group relative inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 bg-black dark-mode:bg-black text-white dark-mode:text-gold-500 font-bold text-base md:text-lg rounded-lg md:rounded-xl shadow-card hover:shadow-dialog transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-2 border-black dark-mode:border-gold-500 hover:border-blue-500 dark-mode:hover:border-gold-400"
        >
          <span className="relative z-10 flex items-center gap-2">
            {t('referralRewards.startEarning')}
            <span className="text-xl dark-mode:text-gold-500">→</span>
          </span>
        </button>
      </div>

      {/* 右侧：用户资料卡片 */}
      <div ref={cardRef} className="bg-surface dark-mode:bg-black rounded-lg md:rounded-xl p-6 md:p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30 hover:shadow-dialog transition-all duration-300">
        {/* 用户名 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-neutral-700 dark-mode:text-gold-500">
            {username}
          </h3>
          <button
            onClick={handleCopyUsername}
            className="p-2 text-neutral-500 dark-mode:text-gold-500/70 hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors"
            aria-label="Copy username"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>

        {/* 推荐奖励信息框 */}
        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark-mode:from-gold-500/20 dark-mode:to-gold-400/20 rounded-lg md:rounded-xl p-4 md:p-6 mb-6 border border-blue-200/50 dark-mode:border-gold-500/30">
          <h4 className="text-lg md:text-xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-3">
            {t('referralRewards.earnRewards')}
          </h4>
          <p className="text-sm md:text-base text-neutral-600 dark-mode:text-gold-500/80 mb-4">
            {t('referralRewards.referDescription')}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 dark-mode:bg-gold-500 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-neutral-700 dark-mode:text-gold-500">
                {t('referralRewards.referralProgram')}
              </p>
              <p className="text-sm text-neutral-600 dark-mode:text-gold-500/80">
                {t('referralRewards.commission')}
              </p>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark-mode:text-gold-500 mb-1">
              {parseInt(animatedTransactions).toLocaleString()}
            </div>
            <div className="text-sm md:text-base text-neutral-600 dark-mode:text-gold-500/80">
              {t('referralRewards.transactions')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark-mode:text-gold-500 mb-1">
              {animatedYears}
            </div>
            <div className="text-sm md:text-base text-neutral-600 dark-mode:text-gold-500/80">
              {t('referralRewards.years')}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 dark-mode:text-gold-500 mb-1">
              {animatedSupport}
            </div>
            <div className="text-sm md:text-base text-neutral-600 dark-mode:text-gold-500/80">
              {t('referralRewards.support')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

