import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';
@UseGuards(AuthGuard('jwt'))
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post(':performId')
  async reserveTicket(
    @Body() seatId,
    @Param('performId') performId: number,
    @UserInfo() user: User,
  ) {
    return await this.reservationService.reserveTicket(seatId, user, performId);
  }

  @Get()
  async getMyTicket(@UserInfo() user: User) {
    const ticketInfo = await this.reservationService.getMyTicket(user);

    return ticketInfo;
  }

  @Delete(':reservationId')
  async deleteTicket(
    @UserInfo() user: User,
    @Param('reservationId') reservationId: number,
  ) {
    const ticketInfo = await this.reservationService.deleteTicket(
      user,
      reservationId,
    );

    return ticketInfo;
  }
}
