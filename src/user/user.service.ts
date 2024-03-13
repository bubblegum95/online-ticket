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
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const { email, userName, password, confirmPassword } = signUpDto;
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
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
      });

      console.log(createUser);

      const chargePoint = await queryRunner.manager
        .getRepository(PointHistory)
        .save({
          userId: createUser.userId,
          changedPoint: 1000000,
          reason: Reason.Charge,
        });

      console.log(chargePoint);
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async adminSignUp(signUpDto: SignUpDto) {
    const { email, userName, password, confirmPassword } = signUpDto;
    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
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

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['pointHistory'],
    });
  }
}
