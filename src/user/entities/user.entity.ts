import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { Role } from '../types/userRole.type';
import { PointHistory } from '../../pointhistory/entities/pointhistory.entity';
import { Performance } from 'src/performance/entities/performance.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ type: 'varchar', nullable: false })
  userName: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  nickname: string;

  @Column({ type: 'varchar', select: false, nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'int', nullable: true })
  phone: number;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.user, {
    onDelete: 'CASCADE',
  })
  pointHistory: PointHistory[];

  @OneToMany(() => Performance, (performance) => performance.user, {
    onDelete: 'CASCADE',
  })
  performance: Performance[];

  @OneToMany(() => Reservation, (reservation) => reservation.user, {
    onDelete: 'CASCADE',
  })
  reservation: Reservation[];
}
