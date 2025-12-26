import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  name!: string

  @Column('text')
  description!: string

  @Column('varchar')
  category!: string

  @Column('decimal', { precision: 10, scale: 4 })
  exchangeRate!: number

  @Column('decimal', { precision: 10, scale: 2 })
  minAmount!: number

  @Column('decimal', { precision: 10, scale: 2 })
  maxAmount!: number

  @Column('varchar', { default: 'active' })
  status!: 'active' | 'inactive'

  @Column('json', { nullable: true })
  images!: string[] // 产品图片数组，存储图片路径

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

