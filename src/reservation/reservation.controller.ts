import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(':performId')
  async reserveTicket(
    @Body() seatId,
    @Param('performId') performId: number,
    @UserInfo() user: User,
  ) {
    return await this.reservationService.reserveTicket(seatId, user, performId);
  }
}
