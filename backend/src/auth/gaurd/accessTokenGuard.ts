import { ExecutionContext, ForbiddenException, HttpException, Injectable, InternalServerErrorException} from '@nestjs/common';
import { Request } from 'express';
  
  @Injectable()
  export class AccessTokenGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      try {
        const request: Request & { accessToken?: string } = context
          .switchToHttp()
          .getRequest();
        const accessToken: string = request['accessToken'];
        if (!accessToken) {
          throw new ForbiddenException(
            'Access denied ! - No Access Token ',
          );
        }
        return true;
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new InternalServerErrorException('Internal server error.');
      }
    }
  }