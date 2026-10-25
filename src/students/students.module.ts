import { Module  ,forwardRef} from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { ClassModule } from '../class/class.module';
@Module({
  imports:[
    UsersModule,
    TypeOrmModule.forFeature([Student]),
    ClassModule
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports:[StudentsService]
})
export class StudentsModule {}
