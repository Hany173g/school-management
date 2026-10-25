import { CreateUserDto } from "../../users/dtos/create-user.dto";
import { IsInt } from "class-validator";






export class CreateStudentDto extends CreateUserDto{
    @IsInt()
    classId : number   
}