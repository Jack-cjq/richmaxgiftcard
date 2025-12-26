import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('content')
export class Content {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('text', { nullable: true })
  heroTitle!: string

  @Column('text', { nullable: true })
  heroSubtitle!: string

  @Column('json', { nullable: true })
  processSteps!: any[]

  @Column('json', { nullable: true })
  securityFeatures!: any[]

  @Column('json', { nullable: true })
  faqs!: any[]

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

