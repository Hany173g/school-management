import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([User]),
     JwtModule.registerAsync({
        inject:[ConfigService],
        useFactory :(configService : ConfigService) => ({
          secret:configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          signOptions:{
            expiresIn:'10m'
          }
        })
     })

  ], // let user module manage this entity
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService , JwtModule] // Export JwtModule to can access from middlewares 
})
export class UsersModule {}
