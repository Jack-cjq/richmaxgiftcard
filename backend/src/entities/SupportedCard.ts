import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('supported_cards')
export class SupportedCard {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  name!: string // 卡片名称，如 "Xbox", "iTunes"

  @Column('varchar', { nullable: true })
  logoUrl!: string // Logo图片URL

  @Column('varchar', { nullable: true })
  description!: string // 描述

  @Column('int', { default: 0 })
  sortOrder!: number // 排序顺序

  @Column('boolean', { default: true })
  isActive!: boolean // 是否激活显示

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

