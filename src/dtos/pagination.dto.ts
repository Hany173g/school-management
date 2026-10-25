import { Transform } from "class-transformer";
import { IsInt, IsOptional, Min, Max } from 'class-validator';


export class PaginationDto {
    @IsOptional()
    @Transform(({value}) => parseInt(value))
    @IsInt()
    @Min(10)
    @Max(50)
    limit : number = 10


    @IsOptional()
    @Transform(({value}) => parseInt(value))
    @IsInt()
    @Min(1)
    page : number = 1
}