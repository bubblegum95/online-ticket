import { Controller, Get, UseGuards } from '@nestjs/common';
import { PointHistoryService } from './pointhistory.service';
import { AuthGuard } from '@nestjs/passport';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('point-history')
export class PointHistoryController {
  constructor(private readonly pointHistoryService: PointHistoryService) {}

  @Get()
  async getPointHistory(@UserInfo() user: User) {
    return await this.pointHistoryService.getPointHistory(user);
  }
}
