import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const History = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request);
    console.log(request.user);
    console.log(request.pointHistory);
    return request.pointHistory ? request.pointHistory : null;
  },
);
