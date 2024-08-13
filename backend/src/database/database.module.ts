import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user.entity';

@Module({
    imports:[ConfigModule, TypeOrmModule.forRoot({
        type: 'postgres',
        host: 'localhost',
        port: 5454,
        username: 'Admin',
        password: 'password',
        database: 'postdb',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),

]
})
export class DatabaseModule {}
