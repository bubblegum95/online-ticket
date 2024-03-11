import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../types/category.type';
import { SaleStatus } from '../types/salestatus.type';

@Index('performId', ['performId'], { unique: true })
@Entity({ name: 'performance' })
export default class Performance {
  @PrimaryGeneratedColumn()
  performId: number;

  @Column({ type: 'varchar', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  performName: string;

  @Column({ type: 'datetime', nullable: false })
  startDate: Date;

  @Column({ type: 'int', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'enum', nullable: false })
  category: Category;

  @Column({ type: 'enum', nullable: false })
  sale: SaleStatus; // 판매 중이면 true, 아니면 false

  @CreateDateColumn({ type: 'datetime', nullable: false })
  createdAt: Date;
}
