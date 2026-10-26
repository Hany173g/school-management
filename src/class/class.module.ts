import { Module , forwardRef } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classes } from './class.entity';
import { StudentsModule } from '../students/students.module';
import { TeacherModule } from '../teacher/teacher.module';
import { UsersModule } from '../users/users.module';
@Module({
  imports:[
    TeacherModule,
     forwardRef(() => StudentsModule), // safe from Circular DI
    TypeOrmModule.forFeature([Classes]),
    UsersModule
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {}
