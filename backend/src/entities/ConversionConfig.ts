import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('conversion_config')
export class ConversionConfig {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('decimal', { precision: 10, scale: 4, default: 7.13 })
  rRate!: number // R汇率（USD到CNY）

  @Column('decimal', { precision: 5, scale: 4, default: 0.03 })
  serviceFeePercent!: number // 服务费比例（0.03表示3%）

  @Column('decimal', { precision: 10, scale: 4, default: 200 })
  ngnRate!: number // 尼日利亚奈拉汇率（1 CNY = X NGN）

  @Column('decimal', { precision: 10, scale: 4, default: 1.0 })
  ghcRate!: number // 加纳塞地汇率（1 CNY = X GHC）

  @Column('json', { nullable: true })
  cardCategories!: Record<string, string[]> // 卡片类型对应的种类列表，如 { "Xbox": ["Amazon US", "Amazon UK", "Amazon Canada"] }

  @Column('json', { nullable: true })
  categoryRates!: Record<string, Record<string, { rate: number; currency: string }>> // 汇率配置，如 { "Xbox": { "Amazon US": { rate: 7.2, currency: "USD" } } }

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

