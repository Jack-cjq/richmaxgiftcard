import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Trades from '@/pages/Trades'
import Help from '@/pages/Help'
import About from '@/pages/About'
import ProductDetail from './pages/ProductDetail'
import Products from '@/pages/Products'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminExchangeRates from '@/pages/admin/AdminExchangeRates'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminSupportedCards from './pages/admin/AdminSupportedCards'
import AdminTrades from './pages/admin/AdminTrades'
import AdminContent from '@/pages/admin/AdminContent'
import AdminCarousels from './pages/admin/AdminCarousels'
import AdminCompanyImages from './pages/admin/AdminCompanyImages'
import AdminVideos from './pages/admin/AdminVideos'
import AdminConversionConfig from './pages/admin/AdminConversionConfig'
import AdminSocialButtons from './pages/admin/AdminSocialButtons'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* 用户端路由 */}
      <Route path="/" element={<Home />} />
      <Route path="/trades" element={<Trades />} />
      <Route path="/help" element={<Help />} />
      <Route path="/about" element={<About />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      
      {/* 后台路由 */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exchange-rates"
        element={
          <ProtectedRoute>
            <AdminExchangeRates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <AdminProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/supported-cards"
        element={
          <ProtectedRoute>
            <AdminSupportedCards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trades"
        element={
          <ProtectedRoute>
            <AdminTrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/content"
        element={
          <ProtectedRoute>
            <AdminContent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/carousels"
        element={
          <ProtectedRoute>
            <AdminCarousels />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/company-images"
        element={
          <ProtectedRoute>
            <AdminCompanyImages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/videos"
        element={
          <ProtectedRoute>
            <AdminVideos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/conversion-config"
        element={
          <ProtectedRoute>
            <AdminConversionConfig />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/social-buttons"
        element={
          <ProtectedRoute>
            <AdminSocialButtons />
          </ProtectedRoute>
        }
      />
      </Routes>
  )
}

export default App

