import { Expose, Type } from 'class-transformer';
import { TeacherDto } from '../../teacher/dtos/teacher.dto';

export class ClassDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  capacity: number;

  @Expose()
  @Type(() => TeacherDto)
  teacher: TeacherDto;
}