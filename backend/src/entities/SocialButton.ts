import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('social_buttons')
export class SocialButton {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar')
  type!: string // 按钮类型：'whatsapp', 'facebook', 'telegram', 'tiktok', 'instagram'

  @Column('varchar')
  label!: string // 按钮标签，如 'WhatsApp', 'Facebook'

  @Column('varchar', { nullable: true })
  url!: string // 链接地址

  @Column('varchar', { nullable: true })
  iconColor!: string // 图标颜色（CSS颜色值）

  @Column('varchar', { nullable: true })
  bgColor!: string // 背景颜色（CSS颜色值）

  @Column('int', { default: 0 })
  sortOrder!: number // 排序顺序

  @Column('boolean', { default: true })
  isActive!: boolean // 是否激活显示

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

