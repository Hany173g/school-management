import { Expose, Type } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';
import { ClassDto } from '../../class/dtos/class.dto';

export class StudentDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;

  @Expose()
  @Type(() => ClassDto)
  classes: ClassDto;
}