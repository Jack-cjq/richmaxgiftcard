import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('carousels')
export class Carousel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  title!: string // 轮播图标题

  @Column('varchar', { nullable: true })
  subtitle?: string // 轮播图副标题

  @Column('varchar')
  imageUrl!: string // 图片路径

  @Column('varchar', { nullable: true })
  linkUrl?: string // 点击跳转链接（可选）

  @Column('int', { default: 0 })
  sortOrder!: number // 排序顺序

  @Column('boolean', { default: true })
  isActive!: boolean // 是否激活显示

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

