import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('company_images')
export class CompanyImage {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  title!: string // 图片标题

  @Column('varchar', { nullable: true })
  description?: string // 图片描述

  @Column('varchar')
  imageUrl!: string // 图片路径

  @Column('int', { default: 0 })
  sortOrder!: number // 排序顺序

  @Column('boolean', { default: true })
  isActive!: boolean // 是否激活显示

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

