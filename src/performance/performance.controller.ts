import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/user/types/userRole.type';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PostPerformDto } from './dto/postperform.dto';
import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';

@UseGuards(RolesGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  async findAll() {
    return await this.performanceService.findAllPerform();
  }

  @Get(':performId')
  async findOne(@Param('performId') performId: number) {
    return await this.performanceService.findOnePerform(performId);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() postPerformDto: PostPerformDto, @UserInfo() user: User) {
    const postPerform = await this.performanceService.createPerform(
      postPerformDto,
      user,
    );
    return postPerform;
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'))
  @Put(':performId')
  async update(
    @Param('performId') performId: number,
    @Body() postPerformDto: PostPerformDto,
  ) {
    await this.performanceService.updatePerform(performId, postPerformDto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard('jwt'))
  @Delete(':performId')
  async delete(@Param('performId') performId: number) {
    await this.performanceService.deletePerform(performId);
  }
}
