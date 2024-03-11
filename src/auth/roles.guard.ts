import { Role } from 'src/user/types/userRole.type';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    // canActivate: 실행 컨텍스트를 변수로 받으며 현재 request가 진행되어도 괜찮은지 boolean값을 반환함.
    const authenticated = await super.canActivate(context);
    if (!authenticated) {
      return false;
    }
    // reflector: 컨트롤러의 클래스 또는 메서드에 관한 정보를 검색.
    // getAllAndOverride: roles에 대한 모든 메타데이터를 가져옴. 메타데이터가 없으면 핸들러와 클래스에 대한 메타데이터를 반환함.
    // @Roles(Role.Admin)-> 'roles' -> [Role.Admin]
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // 지정된 값이 없으면 true를 반환
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
