import { IsString, IsInt, Min  , Max } from "class-validator";





export class CreateClassDto {
    @IsInt()
    teacherId : number;
    @IsString()
    name : string
    @IsInt()
    @Min(30)
    @Max(100)
    capacity : number
}