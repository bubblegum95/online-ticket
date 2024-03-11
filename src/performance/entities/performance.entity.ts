import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../types/category.type';
import { SaleStatus } from '../types/salestatus.type';
import { User } from 'src/user/entities/user.entity';

@Index('performId', ['performId'], { unique: true })
@Entity({ name: 'performance' })
export default class Performance {
  @PrimaryGeneratedColumn()
  performId: number;

  @Column({ type: 'varchar', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  performName: string;

  @Column({ type: 'varchar', nullable: false })
  startDate: string;

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  content: string;

  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  @Column({ type: 'enum', enum: SaleStatus, nullable: false })
  sale: SaleStatus; // 판매 중이면 true, 아니면 false

  @CreateDateColumn({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ManyToOne(() => User, (User) => User.performance)
  @JoinColumn({ name: 'userId' })
  user: User;
}
