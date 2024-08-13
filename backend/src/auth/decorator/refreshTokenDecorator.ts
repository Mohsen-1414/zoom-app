import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ZoomRefreshToken = createParamDecorator(
  (data: null, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().refreshTokens;
  },
);