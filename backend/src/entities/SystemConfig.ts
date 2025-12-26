import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm'

@Entity('system_config')
export class SystemConfig {
  @PrimaryColumn('varchar')
  key!: string // 配置键，如 'base_currency'

  @Column('text')
  value!: string // 配置值，如 'CNY'

  @UpdateDateColumn()
  updatedAt!: Date
}

