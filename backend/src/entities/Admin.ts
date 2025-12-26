import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number

  @Column('varchar', { unique: true })
  username!: string

  @Column('varchar')
  password!: string

  @CreateDateColumn()
  createdAt!: Date
}

