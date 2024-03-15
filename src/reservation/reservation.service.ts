import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Reason } from 'src/user/types/historyReason.type';
import { Reservation } from './entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';
import { PointHistory } from 'src/pointhistory/entities/pointhistory.entity';
import { Performance } from 'src/performance/entities/performance.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,

    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,

    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,

    private readonly dataSource: DataSource,
  ) {}

  async reserveTicket(seat, user: User, performId: number) {
    const { seatId } = seat;
    console.log('seatId', seatId);

    const { userId } = user;
    let price = 0;
    const arr = [];
    let findSoldSeat;

    // 좌석을 배열로 받아와서 예약된 좌석인지 조회
    for (let i = 0; i < seatId.length; i++) {
      findSoldSeat = await this.seatRepository.findOne({
        where: { seatId: seatId[i] },
      });

      if (!findSoldSeat) {
        throw new BadRequestException(`${seatId}는 없는 좌석입니다.`);
      }

      if (!findSoldSeat.sale) {
        throw new ConflictException(`${seatId}는 이미 예약된 좌석입니다.`);
      }

      // 예약이 가능하다면 최종 금액을 계산
      price += findSoldSeat.price;
      // 좌석을 배열에 밀어넣기
      arr.push(findSoldSeat.seatId);
    }
    // reservation에 좌석을 JSON 형대로 넣어주기
    const stringfyArr = JSON.stringify(arr);

    // 잔액 조회하기
    const userPoint = await this.pointHistoryRepository.sum('point', {
      userId,
    });

    if (userPoint < price) {
      throw new BadRequestException('잔액이 부족합니다.');
    }

    // transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Seat에 sale status를 false로 변경하고 userId 밀어넣기
      for (let i = 0; i < seatId.length; i++) {
        await queryRunner.manager
          .getRepository(Seat)
          .update({ seatId: seatId[i] }, { sale: false, userId });
      }
      // 예약하기
      const reservePerform = await queryRunner.manager
        .getRepository(Reservation)
        .save({
          performId,
          userId,
          totalPrice: price,
          reservedSeat: stringfyArr,
        });
      // 결재하기
      await queryRunner.manager.getRepository(PointHistory).save({
        reason: Reason.Buy,
        point: price,
        userId,
      });
      // transaction 커밋
      await queryRunner.commitTransaction();

      return reservePerform;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getMyTicket(user: User) {
    const { userId } = user;
    console.log('userId', userId);
    return await this.reservationRepository.find({
      where: { userId },
      select: [],
    });
  }

  async deleteTicket(user: User, reservationId: number) {
    const foundTicket = await this.reservationRepository.findOne({
      where: { reservationId },
    });

    if (!foundTicket) {
      throw new NotFoundException('찾고 있는 예약이 존재하지 않습니다.');
    }

    const foundStartDate = await this.performanceRepository.findOne({
      where: { performId: foundTicket.performId },
      select: { startDate: true },
    });

    const today = new Date();
    const deadline = new Date(
      foundStartDate.startDate.getTime() + 3 * 60 * 60 * 1000,
    );

    if (deadline < today) {
      throw new BadRequestException('예약 취소 기간이 만료되었습니다.');
    }

    if (user.userId !== foundTicket.userId) {
      throw new UnauthorizedException('예약 취소 권한이 없습니다.');
    }

    const penalty = foundTicket.totalPrice * 0.6;

    console.log('penalty', penalty);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 환불하기 절차: 환불 금액 가져와서 히스토리에 포스팅 -> 예약 정보 삭제하기 -> 좌석에 아이디 빼주고 sale true로 변경

      queryRunner.manager.softDelete(Reservation, reservationId);

      await queryRunner.manager
        .getRepository(Reservation)
        .createQueryBuilder()
        .update()
        .set({ cancelledAt: today })
        .where('reservationId = :reservationId', {
          reservationId: reservationId,
        })
        .execute();

      const seatArr = JSON.parse(foundTicket.reservedSeat);

      for (let i = 0; i < seatArr.length; i++) {
        await queryRunner.manager
          .getRepository(Seat)
          .update({ seatId: seatArr[i] }, { sale: true, userId: null });
      }
      const refund = await queryRunner.manager
        .getRepository(PointHistory)
        .save({
          userId: user.userId,
          point: penalty,
          reason: Reason.Refund,
        });

      await queryRunner.commitTransaction();

      return refund;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
