import { IsString,IsEnum,IsEmail } from "class-validator";



export class LoginDto {
    @IsEmail()
    email : string
    @IsString()
    password : string
}
