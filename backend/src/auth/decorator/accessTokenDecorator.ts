import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ZoomAccessToken = createParamDecorator(
  (data: null, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().accessToken;
  },
);