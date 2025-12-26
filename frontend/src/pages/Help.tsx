import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { publicApi } from '../api/services'
import toast from 'react-hot-toast'

export default function Help() {
  const { t } = useTranslation()
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const res = await publicApi.getContent()
      setFaqs(res.data?.faqs || [])
      setLoading(false)
    } catch (error) {
      toast.error(t('common.error'))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-silver-50 dark-mode:bg-black">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-neutral-800 dark-mode:text-gold-500 mb-12 text-center relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
          {t('help.title')}
        </h1>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-neutral-400 dark-mode:text-gold-500/70">{t('common.loading')}</div>
          ) : faqs.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 dark-mode:text-gold-500/70">{t('common.noData')}</div>
          ) : (
            faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-surface dark-mode:bg-black rounded-md p-6 shadow-card border border-silver-200 dark-mode:border-gold-500/30"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center text-left"
              >
                <h3 className="text-lg font-semibold text-neutral-800 dark-mode:text-gold-500">
                  {faq.question}
                </h3>
                <span className="text-primary dark-mode:text-gold-500 text-xl font-bold">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <p className="mt-4 text-neutral-700 dark-mode:text-gold-500/80 leading-relaxed font-medium">
                  {faq.answer}
                </p>
              )}
            </div>
            ))
          )}
        </div>

        <div className="mt-12 bg-surface dark-mode:bg-black rounded-md p-8 shadow-card border border-silver-200 dark-mode:border-gold-500/30 text-center">
          <h3 className="text-xl font-bold text-neutral-800 dark-mode:text-gold-500 mb-4">
            {t('help.needMoreHelp')}
          </h3>
          <p className="text-neutral-700 dark-mode:text-gold-500/80 mb-6 font-medium">
            {t('help.contactDescription')}
          </p>
          <button className="px-6 py-3 bg-blue-600 dark-mode:bg-gold-500 text-white dark-mode:text-black dark-mode:font-bold rounded-md hover:bg-blue-700 dark-mode:hover:bg-gold-600 transition-colors font-semibold focus:ring-2 focus:ring-blue-500 dark-mode:focus:ring-gold-500 focus:ring-offset-2">
            {t('help.contactButton')}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

