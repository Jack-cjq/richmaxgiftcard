import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('videos')
export class Video {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { nullable: true })
  title!: string

  @Column('text', { nullable: true })
  description!: string

  @Column('varchar')
  videoUrl!: string // 视频文件路径或URL

  @Column('varchar', { nullable: true })
  thumbnailUrl!: string // 缩略图路径（可选）

  @Column('varchar', { default: 'company' })
  type!: 'company' | 'business' // 视频类型：公司介绍或业务介绍

  @Column('int', { default: 0 })
  sortOrder!: number // 排序

  @Column('boolean', { default: true })
  isActive!: boolean // 是否激活

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

