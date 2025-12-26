import { DataSource } from 'typeorm'
import { ExchangeRate } from './entities/ExchangeRate.js'
import { Product } from './entities/Product.js'
import { Trade } from './entities/Trade.js'
import { Admin } from './entities/Admin.js'
import { Content } from './entities/Content.js'
import { SupportedCard } from './entities/SupportedCard.js'
import { Carousel } from './entities/Carousel.js'
import { SystemConfig } from './entities/SystemConfig.js'
import { ConversionConfig } from './entities/ConversionConfig.js'
import { CompanyImage } from './entities/CompanyImage.js'
import { Video } from './entities/Video.js'
import { SocialButton } from './entities/SocialButton.js'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'giftcardtrade',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [ExchangeRate, Product, Trade, Admin, Content, SupportedCard, Carousel, SystemConfig, ConversionConfig, CompanyImage, Video, SocialButton],
  migrations: ['src/migrations/**/*.ts'],
})

