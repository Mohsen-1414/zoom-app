import {Controller, Get, Query, Res, Session, UseGuards,} from '@nestjs/common';
  import { Response } from 'express';
  import { Session as ExpressSession } from 'express-session';
  import { AuthService } from './auth.service';
import { ZoomRefreshToken } from './decorator/refreshTokenDecorator';
import { AccessTokenGuard } from './gaurd/accessTokenGuard';
import { ZoomAccessToken } from './decorator/accessTokenDecorator';
  
  @Controller('auth')
  export class AuthController { 
    constructor(private authService: AuthService) {} 
  
    @Get()
    async redirect( @Query() code: string, @Res() res: Response, @Session() session: ExpressSession & { state: string; verifier: string }): Promise<void> {
      const deeplink = await this.authService.getDeeplink(session, code);
      res.redirect(deeplink);
    }
  
    @Get('/token')
    async getToken(@Query() { code, verifier }: { code: string; verifier: string }): Promise<Record<string, string>> {
      return await this.authService.getToken(code, verifier, 'S256');
    }
  
    @Get('/refresh-token')
    async refreshToken(@ZoomRefreshToken() token: string,): Promise<Record<string, string>> {
      return await this.authService.refreshToken(token);
    }
  
    @UseGuards(AccessTokenGuard)
    @Get('/me')
    async getMe( @ZoomAccessToken() token: string ): Promise<Record<string, string>> {
      return await this.authService.getZoomUser(token);
    }
    
  } 