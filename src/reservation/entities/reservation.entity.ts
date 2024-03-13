import { User } from 'src/user/entities/user.entity';
import Performance from 'src/performance/entities/performance.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'reservation' })
export default class Reservation {
  @PrimaryGeneratedColumn({ type: 'int' })
  reservationId: number;

  @Column({ type: 'int', nullable: false })
  performId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  reservedSeat: string;

  @Column({ type: 'int', nullable: false })
  totalPrice: number;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  reservedAt: Date;

  @DeleteDateColumn({ type: 'datetime', nullable: false })
  cancelledAt: Date;

  @ManyToOne(() => User, (User) => User.reservation)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Performance, (Performance) => Performance.reservation)
  @JoinColumn({ name: 'performId' })
  performance: Performance;
}
