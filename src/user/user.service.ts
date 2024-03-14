import { compare, hash } from 'bcrypt';
import * as _ from 'lodash';
import { DataSource, Repository } from 'typeorm';

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { Role } from './types/userRole.type';
import PointHistory from 'src/pointhistory/entities/pointhistory.entity';
import { Reason } from './types/historyReason.type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(User)
    private pointHistoryRepository: Repository<PointHistory>,

    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findByNickname(nickname: string) {
    return await this.userRepository.findOne({
      where: { nickname },
    });
  }

  async signUp(signUpDto: SignUpDto) {
    const { email, userName, password, confirmPassword, nickname } = signUpDto;
    const existingUser = await this.findByEmail(email);
    const existingNickname = await this.findByNickname(nickname);

    if (existingUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
      );
    }

    if (existingNickname) {
      throw new ConflictException(
        '이미 해당 닉네임을 사용하는 회원이 있습니다.',
      );
    }

    if (password !== confirmPassword) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await hash(password, 10);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createUser = await queryRunner.manager.getRepository(User).save({
        email,
        userName,
        password: hashedPassword,
        nickname,
      });

      await queryRunner.manager.getRepository(PointHistory).save({
        userId: createUser.userId,
        point: 1000000,
        reason: Reason.Charge,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async adminSignUp(signUpDto: SignUpDto) {
    const { email, userName, nickname, password, confirmPassword } = signUpDto;
    const existingUser = await this.findByEmail(email);
    const existingNickname = await this.findByNickname(nickname);

    if (existingUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
      );
    }

    if (existingNickname) {
      throw new ConflictException(
        '이미 해당 닉네임을 사용하는 회원이 있습니다.',
      );
    }

    if (password !== confirmPassword) {
      throw new ConflictException('비밀번호가 일치하지 않습니다.');
    }

    const hashedPassword = await hash(password, 10);
    await this.userRepository.save({
      email,
      userName,
      password: hashedPassword,
      nickname,
      role: Role.Admin,
    });
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;
    const user = await this.userRepository.findOne({
      select: ['userId', 'email', 'password'],
      where: { email },
    });

    if (_.isNil(user)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const payload = { email, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(user: User) {
    // 사용자와 연결된 포인트 이력을 합산하여 총 포인트를 가져옵니다.
    const totalPointHistory = await this.dataSource
      .getRepository(PointHistory)
      .createQueryBuilder('pointHistory')
      .select('SUM(pointHistory.point)', 'totalPoint')
      .where('pointHistory.userId = :userId', { userId: user.userId }) // 포인트 이력의 userId 필드를 기준으로 필터링합니다.
      .getRawOne();

    // 총 포인트를 사용자 엔티티에 추가합니다.
    const myPoint = totalPointHistory.totalPoint;
    console.log(myPoint);
    return {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      createdAt: user.createdAt,
      phone: user.phone,
      address: user.address,
      myPoint: myPoint,
    };
  }
}
