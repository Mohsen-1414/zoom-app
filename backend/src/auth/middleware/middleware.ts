
import { Injectable, NestMiddleware} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ZoomContext } from '../decorator/zoomContexDecorator';
import { contextHeader, getAppContext } from '../utility/cipher';
  
  @Injectable()
  export class AccessTokenMiddleware implements NestMiddleware {
    private authHeader = 'Authorization';
  
    async use(req: Request & { accessToken?: string }, res: Response, next:any): Promise<void> {
      try {
        const accessTokenHeader: string = req.header(this.authHeader);
  
        req['accessToken'] = null;
  
        if (accessTokenHeader) {
          const accessTokenBearer = accessTokenHeader.split(' ');
          if (accessTokenBearer[0] === 'Bearer') {
            req['accessToken'] = accessTokenBearer[1];
          }
        }
        next();
      } catch (e) {
        next();
      }
    }
  }
  // ------------------------------------------

  @Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  private refreshHeader = 'Refresh';

  async use( req: Request & { refreshToken?: string }, res: Response, next: NextFunction,): Promise<void> {
    try {
      const refreshToken = req.header(this.refreshHeader);

      req['refreshToken'] = null;

      if (refreshToken) {
        req['refreshToken'] = refreshToken;
      }
      next();
    } catch (e) {
      next();
    }
  }
}
// ---------------------------------------------

@Injectable()
export class ZoomContextMiddleware implements NestMiddleware {
  async use(
    req: Request & { zoomContext?: ZoomContext }, res: Response,  next: NextFunction ): Promise<void> {
      try {
        const header = req.header(contextHeader);
        const zoomContext = header && getAppContext(header);

        req['zoomContext'] = null;

        if (zoomContext) {
          req['zoomContext'] = zoomContext;
        }
        next();
      } catch (e) {
        next();
      }
  }
}
  