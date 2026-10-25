import { Expose , Type } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';

export class TeacherDto {
  @Expose()
  id: number;

  @Expose()
  @Type(() => UserDto)
  user: UserDto;
 
}