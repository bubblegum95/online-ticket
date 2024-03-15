import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../types/category.type';
import { SaleStatus } from '../types/salestatus.type';
import { User } from 'src/user/entities/user.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';
@Index('performId', ['performId'], { unique: true })
@Entity()
export class Performance {
  @PrimaryGeneratedColumn()
  performId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  performName: string;

  @Column({ type: 'datetime', nullable: false })
  startDate: Date;

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'enum', enum: Category, nullable: false })
  category: Category;

  @Column({ type: 'varchar', nullable: true })
  thumbnail: string;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    nullable: false,
    default: SaleStatus.Sale,
  })
  sale: SaleStatus; // 판매 중이면 true, 아니면 false

  @CreateDateColumn({ type: 'datetime', nullable: false })
  createdAt: Date;

  @ManyToOne(() => User, (User) => User.performance)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Reservation, (Reservation) => Reservation.performance)
  reservation: Reservation[];

  @OneToMany(() => Seat, (Seat) => Seat.performance, { onDelete: 'CASCADE' })
  seat: Seat[];
}
