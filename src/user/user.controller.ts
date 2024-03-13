import { UserInfo } from 'src/utils/userInfo.decorator';
//import { History } from 'src/utils/pointHistory.decorator';

import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SignUpDto } from './dto/signUp.dto';
import { SignInDto } from './dto/signIn.dto';
import { User } from './entities/user.entity';
//import PointHistory from './entities/point.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.userService.signUp(signUpDto);
  }

  @Post('admin-sign-up')
  async adminSignUp(@Body() signUpDto: SignUpDto) {
    return await this.userService.adminSignUp(signUpDto);
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto, @Res() res) {
    const postUser = await this.userService.signIn(signInDto);

    res.cookie('authorization', `Bearer ${postUser.access_token}`);
    res.send('로그인에 성공하였습니다.');
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getUser(@UserInfo() user: User) {
    return {
      userId: user.userId,
      email: user.email,
      name: user.userName,
      role: user.role,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt,
    };
  }
}
