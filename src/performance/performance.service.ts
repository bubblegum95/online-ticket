import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostPerformDto } from './dto/postperform.dto';
import Performance from './entities/performance.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
    private readonly jwtService: JwtService,
  ) {}

  async findAllPerform() {
    return await this.performanceRepository.find();
  }

  async findOnePerform(performId: number) {
    return await this.performanceRepository.findOne({
      where: { performId },
    });
  }

  async createPerform(postPerformDto: PostPerformDto, user: User) {
    const postPerform = this.performanceRepository.create({
      userId: user.userId,
      ...postPerformDto,
    });

    return await this.performanceRepository.save(postPerform);
  }

  async updatePerform(performId: number, postPerformDto: PostPerformDto) {
    const { performName, startDate, address, content, category, sale } =
      postPerformDto;

    return await this.performanceRepository
      .createQueryBuilder()
      .update(Performance)
      .set({ performName, startDate, address, content, category, sale })
      .where('performId = :performId', { performId: performId })
      .execute();
  }

  async deletePerform(performId: number) {
    return await this.performanceRepository
      .createQueryBuilder()
      .delete()
      .from(Performance)
      .where('performId = :performId', { performId: performId })
      .execute();
  }
}
