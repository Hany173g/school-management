import { Student } from "../../students/student.entity";
import { Expose } from "class-transformer";





export class UserDto {
    @Expose()
    name : string;
    @Expose()
    role : string;
    @Expose()
    createdAt : string;
    @Expose()
    student : Student   
}