import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { PointHistory } from './entities/pointhistory.entity';

@Injectable()
export class PointHistoryService {
  constructor(
    @InjectRepository(PointHistory)
    private readonly pointHistory: Repository<PointHistory>,
  ) {}

  async getPointHistory(user: User) {
    const { userId } = user;
    console.log(userId);
    return await this.pointHistory.find({ where: { userId } });
  }
}
