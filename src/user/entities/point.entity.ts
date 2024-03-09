import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Reason } from '../types/historyReason.type';
import { User } from './user.entity';

@Index('historyId', ['historyId'], { unique: true })
@Entity({
  name: 'pointHistories',
})
export default class PointHistory {
  @PrimaryGeneratedColumn()
  historyId: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  reason: Reason;

  @Column({ type: 'int', nullable: false, default: 50000 })
  changedPoint: number;

  @Column({ type: 'datetime', nullable: false })
  changedAt: Date;

  @ManyToOne(() => User, (User) => User.pointHistory)
  @JoinColumn({ name: 'userId' })
  user: User;
}
