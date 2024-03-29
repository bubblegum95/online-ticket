import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { User } from 'src/user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { PointHistory } from 'src/pointhistory/entities/pointhistory.entity';
import { Performance } from 'src/performance/entities/performance.entity';
import { Reservation } from './entities/reservation.entity';
import { Seat } from 'src/seat/entities/seat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Seat,
      Performance,
      User,
      PointHistory,
      Reservation,
    ]),
    UserModule,
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
