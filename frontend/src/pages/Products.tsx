import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductHall from '@/components/ProductHall'
import { publicApi } from '@/api/services'
import toast from 'react-hot-toast'

export default function Products() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [supportedCards, setSupportedCards] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, cardsRes] = await Promise.all([
        publicApi.getProducts(),
        publicApi.getSupportedCards(),
      ])
      setProducts(productsRes.data || [])
      setSupportedCards(cardsRes.data || [])
      setLoading(false)
    } catch (error) {
      toast.error(t('common.error'))
      setLoading(false)
    }
  }

  // 从 URL 参数获取分类筛选
  const categoryFromUrl = searchParams.get('category')

  return (
    <div className="min-h-screen bg-silver-50 dark-mode:bg-black">
      <Header />
      
      <section className="px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <h1 className="section-title text-4xl font-bold text-neutral-700 dark-mode:text-gold-500 mb-12 text-center relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-24 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent dark-mode:via-gold-500 rounded-full"></span>
            {t('home.exchangeHall')}
          </h1>
          <ProductHall 
            products={products} 
            loading={loading}
            supportedCards={supportedCards}
            maxDisplay={9999}
            mobileMaxDisplay={9999}
            initialCategory={categoryFromUrl || undefined}
          />
        </div>
      </section>
      <Footer />
    </div>
  )
}

