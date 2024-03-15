import { Module } from '@nestjs/common';
import { PointHistoryController } from './pointhistory.controller';
import { PointHistoryService } from './pointhistory.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { PointHistory } from './entities/pointhistory.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([PointHistory, User]),
    UserModule,
  ],
  controllers: [PointHistoryController],
  providers: [PointHistoryService],
})
export class PointHistoryModule {}
