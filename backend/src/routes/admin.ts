import { Router } from 'express'
import { AdminController } from '../controllers/AdminController.js'
import { ExchangeRateController } from '../controllers/ExchangeRateController.js'
import { ProductController } from '../controllers/ProductController.js'
import { TradeController } from '../controllers/TradeController.js'
import { ContentController } from '../controllers/ContentController.js'
import { StatsController } from '../controllers/StatsController.js'
import { SupportedCardController } from '../controllers/SupportedCardController.js'
import { CarouselController } from '../controllers/CarouselController.js'
import { SystemConfigController } from '../controllers/SystemConfigController.js'
import { ConversionConfigController } from '../controllers/ConversionConfigController.js'
import { CompanyImageController } from '../controllers/CompanyImageController.js'
import { VideoController } from '../controllers/VideoController.js'
import { SocialButtonController } from '../controllers/SocialButtonController.js'
import { authenticate } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { uploadCarousel } from '../middleware/uploadCarousel.js'
import { uploadProduct } from '../middleware/uploadProduct.js'
import { uploadCompanyImage } from '../middleware/uploadCompanyImage.js'
import { uploadVideo } from '../middleware/uploadVideo.js'
import {
  validatePagination,
  validateId,
  validateExchangeRate,
  validateProduct,
  validateTrade,
} from '../middleware/validator.js'

const router = Router()

// 登录（不需要认证）
router.post('/login', AdminController.login)

// 所有其他路由需要认证
router.use(authenticate)

// 统计数据 - 后端计算所有统计数据
router.get('/stats', StatsController.getStats)

// 汇率管理 - 后端处理所有数据逻辑
router.get('/exchange-rates', ExchangeRateController.getAll)
router.post('/exchange-rates', validateExchangeRate, ExchangeRateController.create)
router.put('/exchange-rates/:id', validateId, validateExchangeRate, ExchangeRateController.update)
router.delete('/exchange-rates/:id', validateId, ExchangeRateController.delete)
router.post('/exchange-rates/update', ExchangeRateController.updateRates) // 手动触发更新

// 产品管理 - 后端处理所有数据逻辑
router.get('/products', validatePagination, ProductController.getAll)
// 注意：uploadProduct 必须在 validateProduct 之前，因为 multer 需要先解析 multipart/form-data
router.post('/products', uploadProduct.array('images', 10), validateProduct, ProductController.create) // 支持最多10张图片
router.put('/products/:id', validateId, uploadProduct.array('images', 10), validateProduct, ProductController.update)
router.delete('/products/:id', validateId, ProductController.delete)

// 交易管理 - 后端处理所有数据逻辑
router.get('/trades', validatePagination, TradeController.getAll)
router.post('/trades', validateTrade, TradeController.create)
router.put('/trades/:id', validateId, validateTrade, TradeController.update)
router.delete('/trades/:id', validateId, TradeController.delete)

// 内容管理
router.get('/content', ContentController.get)
router.put('/content', ContentController.update)

// 支持的礼品卡管理
router.get('/supported-cards', SupportedCardController.getAll)
router.post('/supported-cards', SupportedCardController.create)
router.put('/supported-cards/:id', validateId, SupportedCardController.update)
router.delete('/supported-cards/:id', validateId, SupportedCardController.delete)
router.post('/supported-cards/upload', upload.single('image'), SupportedCardController.uploadImage) // 图片上传

// 轮播图管理
router.get('/carousels', CarouselController.getAll)
router.post('/carousels', uploadCarousel.single('image'), CarouselController.create)
router.put('/carousels/:id', validateId, uploadCarousel.single('image'), CarouselController.update)
router.delete('/carousels/:id', validateId, CarouselController.delete)

// 公司图片管理
router.get('/company-images', CompanyImageController.getAll)
router.post('/company-images', uploadCompanyImage.single('image'), CompanyImageController.create)
router.put('/company-images/:id', validateId, uploadCompanyImage.single('image'), CompanyImageController.update)
router.delete('/company-images/:id', validateId, CompanyImageController.delete)

// 系统配置管理
router.get('/config/base-currency', SystemConfigController.getBaseCurrency)
router.put('/config/base-currency', SystemConfigController.updateBaseCurrency)
router.get('/config', SystemConfigController.getAll)

// 换算配置管理
router.get('/conversion-config', ConversionConfigController.getAdmin)
router.put('/conversion-config', ConversionConfigController.update)

// 视频管理
router.get('/videos', VideoController.getAll)
router.post('/videos', uploadVideo.single('video'), VideoController.create)
router.put('/videos/:id', validateId, uploadVideo.single('video'), VideoController.update)
router.delete('/videos/:id', validateId, VideoController.delete)

// 社交按钮管理
router.get('/social-buttons', SocialButtonController.getAll)
router.post('/social-buttons', SocialButtonController.create)
router.put('/social-buttons/batch', SocialButtonController.updateBatch) // 必须在 /:id 路由之前
router.put('/social-buttons/:id', validateId, SocialButtonController.update)
router.delete('/social-buttons/:id', validateId, SocialButtonController.delete)

export default router

