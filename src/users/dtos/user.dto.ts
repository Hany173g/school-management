import { Student } from "../../students/student.entity";
import { Expose , Type } from "class-transformer";





export class UserDto {
    @Expose()
    id : number
    @Expose()
    name : string;
    @Expose()
    role : string;
    @Expose()
    createdAt : string;
    @Expose()
    student : Student   
}


export class LoginResDto {
    @Expose()
    accessToken : string
    @Expose()
    @Type(() => UserDto)
    user : UserDto
}