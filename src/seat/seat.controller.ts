import { Controller, Param } from '@nestjs/common';
import { SeatService } from './seat.service';
import { Get } from '@nestjs/common';

@Controller('seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get(':performId')
  async ableToReserveSeat(@Param('performId') performId: number) {
    return this.seatService.ableToReserveSeat(performId);
  }
}
