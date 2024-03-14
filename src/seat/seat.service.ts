import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Seat from './entities/seat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  ableToReserveSeat(performId: number) {
    return this.seatRepository.find({ where: { performId, sale: true } });
  }
}
