import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Reason } from '../../user/types/historyReason.type';
import { User } from '../../user/entities/user.entity';
//import Performance from 'src/performance/entities/performance.entity';

@Index('historyId', ['historyId'], { unique: true })
@Entity({
  name: 'pointHistory',
})
export class PointHistory {
  @PrimaryGeneratedColumn()
  historyId: number;

  @Column({ type: 'varchar', nullable: false })
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  reason: Reason;

  @Column({ type: 'int', nullable: false })
  point: number;

  @CreateDateColumn({ type: 'datetime', nullable: false })
  changedAt: Date;

  @ManyToOne(() => User, (User) => User.pointHistory)
  @JoinColumn({ name: 'userId' })
  user: User;
}
