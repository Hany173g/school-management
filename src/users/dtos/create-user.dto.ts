import { IsString,IsEnum,IsEmail } from "class-validator";
import { UserRole } from "../enums/user-role.enum";
import { LoginDto } from "./login.dto";



export class CreateUserDto extends LoginDto {
    @IsEnum(UserRole)
    role : UserRole
    @IsString({})
    name : string
} 
