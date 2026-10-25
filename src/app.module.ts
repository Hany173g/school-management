import { Module , MiddlewareConsumer , NestModule} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { StudentsModule } from './students/students.module';
import { TeacherModule } from './teacher/teacher.module';
import { ClassModule } from './class/class.module';
import cookieSession from "cookie-session"
@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory: (config : ConfigService) => ({
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT'),
          username: config.get<string>('DB_USERNAME'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true,
      })
    }),
    StudentsModule,
    TeacherModule,
    ClassModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide:APP_PIPE,
      useValue: new ValidationPipe({
        whitelist:true,
        transform:true
      })
    }
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService : ConfigService) {}
  configure(consumer : MiddlewareConsumer) {
    consumer.apply(cookieSession({
      keys:[this.configService.get<string>('SESSION_SECRET') as string],
      httpOnly: true,
      secure:process.env.NODE_ENV === "production"
    })).forRoutes('*')
    consumer.apply(CurrentUserMiddleware).forRoutes('*')
  }
}
