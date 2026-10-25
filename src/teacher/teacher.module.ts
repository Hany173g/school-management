import { Module } from '@nestjs/common';
import { TeacherController } from './teacher.controller';
import { TeacherService } from './teacher.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
@Module({
  imports:[
    UsersModule ,
    TypeOrmModule.forFeature([Teacher])
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports:[TeacherService]
})
export class TeacherModule {}
