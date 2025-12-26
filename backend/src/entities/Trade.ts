import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  productName!: string

  @Column('varchar')
  currency!: string

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number

  @Column('decimal', { precision: 10, scale: 4 })
  exchangeRate!: number

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount!: number

  @Column('varchar', { default: 'processing' })
  status!: 'completed' | 'processing'

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

