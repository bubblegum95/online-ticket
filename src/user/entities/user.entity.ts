import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { Role } from '../types/userRole.type';
import PointHistory from './point.entity';
import Performance from 'src/performance/entities/performance.entity';

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

  @OneToMany(() => PointHistory, (pointHistory) => pointHistory.user)
  pointHistory: PointHistory[];

  @OneToMany(() => Performance, (performance) => performance.user)
  performance: Performance[];
}
