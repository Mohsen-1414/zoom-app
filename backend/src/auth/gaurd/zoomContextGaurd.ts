import {BadRequestException,ExecutionContext,HttpException,Injectable,InternalServerErrorException,} from '@nestjs/common';
  
  import { Request } from 'express';
import { ZoomContext } from '../decorator/zoomContexDecorator';
  
  @Injectable()
  export class ZoomContextGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request: Request & { zoomContext?: ZoomContext } = context
          .switchToHttp()
          .getRequest();
        const zoomContext: ZoomContext = request['zoomContext'];
        if (!zoomContext) {
          throw new BadRequestException("App isn't opened in ZOOM");
        }
        return true;
      } catch (e) {
        if (e instanceof HttpException) {
          throw e;
        }
        throw new InternalServerErrorException('Internal server error.');
      }
    }
  }