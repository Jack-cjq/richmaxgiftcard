import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('exchange_rates')
export class ExchangeRate {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  currency!: string

  @Column('varchar')
  symbol!: string

  @Column('decimal', { precision: 10, scale: 4 })
  rate!: number

  @Column('decimal', { precision: 10, scale: 4, default: 0 })
  change!: number

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  changePercent!: number

  @Column('boolean', { default: false })
  isPrimary!: boolean // 是否为主要货币（卡片显示）

  @Column('varchar', { nullable: true })
  apiSource!: string // API数据源标识

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

