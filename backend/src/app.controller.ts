
import { Controller, Get, Inject, Req, Res, Session} from '@nestjs/common';
import { AppService } from './app.service';
import { Request, Response } from 'express';
import { Session as ExpressSession } from 'express-session';
import { contextHeader } from './auth/utility/cipher';
import { ZoomContext } from './auth/decorator/zoomContexDecorator';
  
  @Controller()
  export class AppController {
    constructor(
      private readonly appService: AppService,
    ) {}
  
    @Get()
    async homeRoute(@Req() req: Request, @Res() res: Response): Promise<void> {
      const context: string = req.header(contextHeader);
      res.redirect(process.env.REACT_APP_URI + `?context=${context}`);
    }
  
    @Get('/context')
    async contextRoute(
      @ZoomContext() zoomContext: ZoomContext,
    ): Promise<ZoomContext> {
      return zoomContext;
    }
  
    @Get('/install')
    async installRoute(
      @Res() res: Response,
      @Session() session: ExpressSession & { state: string; verifier: string },
    ): Promise<void> {
      const { url, state, verifier } = await this.appService.getInstallURL();
      session.state = state;
      session.verifier = verifier;
      res.redirect(url.href);
    }
  }
  