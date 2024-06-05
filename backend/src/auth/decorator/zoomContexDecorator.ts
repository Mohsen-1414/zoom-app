import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ZoomContext = createParamDecorator(
  (data: null, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().zoomContext;
  },
);

export type ZoomContext = {
  aud: string;
  entitlements: Array<string>;
  exp: number;
  iss: string;
  theme: string;
  ts: number;
  typ: string;
  uid: string;
  mid?: string;
};