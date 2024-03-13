import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Reservation from './entities/reservation.entity';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import Seat from 'src/seat/entities/seat.entity';
import PointHistory from 'src/pointhistory/entities/pointhistory.entity';
import { Reason } from 'src/user/types/historyReason.type';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,

    @InjectRepository(PointHistory)
    private readonly pointHistoryRepository: Repository<PointHistory>,

    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,

    private readonly dataSource: DataSource,
  ) {}

  async reserveTicket(seat, user: User, performId: number) {
    const { seatId } = seat;

    const { userId } = user;
    let price = 0;
    const arr = [];
    let findSoldSeat;

    // 좌석을 배열로 받아와서 예약된 좌석인지 조회
    for (let i = 0; i < seatId.length; i++) {
      findSoldSeat = await this.seatRepository.findOne({
        where: { seatId: seatId[i] },
      });

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
    const userPoint = await this.pointHistoryRepository.sum('changedPoint', {
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
        changedPoint: price,
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
}
