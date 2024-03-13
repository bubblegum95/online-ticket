import Performance from 'src/performance/entities/performance.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'seat' })
export default class Seat {
  @PrimaryGeneratedColumn()
  seatId: number;

  @Column({ type: 'int', nullable: false })
  performId: number;

  @Column({ type: 'varchar', nullable: false })
  seatNumber: string;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  sale: boolean;

  @Column({ type: 'int', nullable: true })
  userId: number;

  @ManyToOne(() => Performance, (Performance) => Performance.seat)
  @JoinColumn({ name: 'performId' })
  performance: Performance;
}
