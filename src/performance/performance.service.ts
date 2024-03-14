import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostPerformDto } from './dto/postperform.dto';
import Performance from './entities/performance.entity';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import Seat from 'src/seat/entities/seat.entity';
import { PutPerformDto } from './dto/putperform.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,

    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,

    private dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async findAllPerform() {
    return await this.performanceRepository.find();
  }

  async findOnePerform(performId: number) {
    const findPerform = await this.performanceRepository.findOne({
      where: { performId },
    });

    if (!findPerform) {
      throw new NotFoundException('해당 공연을 찾을 수 없습니다.');
    }
    const performance = await this.performanceRepository.findOne({
      relations: {
        seat: true,
      },
      where: {
        performId,
        seat: {
          sale: true,
        },
      },
      select: {
        seat: {
          seatId: true,
          seatNumber: true,
          price: true,
        },
      },
    });

    console.log(performance);
    return performance;
  }

  async searchPerform(performName: string) {
    return await this.performanceRepository.find({
      where: { performName },
    });
  }

  async createPerform(postPerformDto: PostPerformDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const postPerform = await queryRunner.manager
        .getRepository(Performance)
        .save({
          userId: user.userId,
          performName: postPerformDto.performName,
          thumbnail: postPerformDto.thumbnail,
          startDate: postPerformDto.startDate,
          address: postPerformDto.address,
          content: postPerformDto.content,
          category: postPerformDto.category,
          sale: postPerformDto.sale,
        });

      const { row, column, defaultPrice, priceLevel } = postPerformDto;
      const { performId } = postPerform;

      for (let i = 1; i <= row; i++) {
        const rowToAlphabet = String.fromCharCode(64 + i);
        const price = defaultPrice - (defaultPrice / 100) * priceLevel * i;

        for (let j = 1; j <= column; j++) {
          const seatNumber = rowToAlphabet + j;
          await queryRunner.manager.getRepository(Seat).save({
            performId,
            seatNumber,
            price,
          });
        }
      }

      await queryRunner.commitTransaction();

      return {
        performId: postPerform.performId,
        thumbnail: postPerform.thumbnail,
        category: postPerform.category,
        startDate: postPerform.startDate,
        address: postPerform.address,
        content: postPerform.content,
        sale: postPerform.sale,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async updatePerform(performId: number, putPerformDto: PutPerformDto) {
    const { performName, startDate, address, content, category, sale } =
      putPerformDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      return await this.performanceRepository
        .createQueryBuilder()
        .update(Performance)
        .set({ performName, startDate, address, content, category, sale })
        .where('performId = :performId', { performId: performId })
        .execute();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async deletePerform(performId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.manager
        .getRepository(Seat)
        .delete({ performId: performId });
      await queryRunner.manager.getRepository(Performance).delete(performId);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
