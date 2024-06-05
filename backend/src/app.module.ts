import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccessTokenMiddleware, RefreshTokenMiddleware, ZoomContextMiddleware } from './auth/middleware/middleware';
import { AuthService } from './auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/entity/user.entity';

@Module({
  imports: [AuthModule, DatabaseModule, ConfigModule.forRoot({isGlobal:true}),TypeOrmModule.forFeature([User]),
],
  controllers: [AppController],
  providers: [AppService, AuthService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(ZoomContextMiddleware)
      .forRoutes(
        '/',
        '/context',
        '/quizzes',
        '/play-sessions',
        '/play-quiz',
        '/auth/me',
      );

    consumer.apply(AccessTokenMiddleware).forRoutes('/auth/me');

    consumer.apply(RefreshTokenMiddleware).forRoutes('/auth/refresh-token');
  }
}