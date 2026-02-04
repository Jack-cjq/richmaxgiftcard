import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="px-4 py-12 bg-surface dark-mode:bg-black border-t border-silver-200 dark-mode:border-gold-500/30">
      <div className="max-w-7xl mx-auto">
        {/* Logo 和公司信息 */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-silver-200 dark-mode:border-gold-500/30">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img
              src="/images/logo/richmax-logo.png"
              alt="RichPlus Logo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <div>
              <div className="text-2xl font-bold text-blue-600 dark-mode:text-gold-500">
                RichPlus
              </div>
              <p className="text-sm text-neutral-500 dark-mode:text-gold-500/70 mt-1">{t('footer.tagline')}</p>
            </div>
          </div>
          
          {/* 快速链接 */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/" className="text-neutral-600 dark-mode:text-gold-500 font-medium hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">
              {t('header.home')}
            </Link>
            <Link to="/products" className="text-neutral-600 dark-mode:text-gold-500 font-medium hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">
              {t('home.exchangeHall')}
            </Link>
            <Link to="/trades" className="text-neutral-600 dark-mode:text-gold-500 font-medium hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">
              {t('footer.tradeRecords')}
            </Link>
            <Link to="/about" className="text-neutral-600 dark-mode:text-gold-500 font-medium hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">
              {t('header.about')}
            </Link>
            <Link to="/help" className="text-neutral-600 dark-mode:text-gold-500 font-medium hover:text-blue-600 dark-mode:hover:text-gold-400 transition-colors">
              {t('footer.helpCenter')}
            </Link>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center">
          <p className="text-neutral-600 dark-mode:text-gold-500/80 font-medium">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

