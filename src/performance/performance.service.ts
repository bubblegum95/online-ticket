import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostPerformDto } from './dto/postperform.dto';
import Performance from './entities/performance.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

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

  async createPerform(postPerformDto: PostPerformDto) {
    return await this.performanceRepository.save(postPerformDto);
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
