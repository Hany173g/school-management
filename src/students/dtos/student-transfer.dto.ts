import { IsInt } from "class-validator";





export class StudentTransferDto {
    @IsInt()
    classId : number
}