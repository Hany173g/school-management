import { Controller  , Get , UseInterceptors, Post   , ParseIntPipe, Patch , Delete , Param, Body, UseGuards, Query} from '@nestjs/common';
import { StudentsService } from './students.service';
import { PaginationDto } from '../dtos/pagination.dto';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { OperatorGuard } from '../guards/operator.guard';
import {StudentDto} from "./dtos/student.dto"
import { CreateStudentDto } from './dtos/create-student.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { AdminGaurd } from '../guards/admin.guard';
import { StudentTransferDto } from './dtos/student-transfer.dto';
@UseGuards(AuthGuard)
@Controller('students')
@UseInterceptors(new SerializeInterceptor(StudentDto)) // Use Global Interceptor to hide secert prop ^__^                                                                         

export class StudentsController {
    constructor(private readonly studentService : StudentsService) {}
    @UseGuards(OperatorGuard)
    @Post()
    create(@Body() body : CreateStudentDto) {
        return this.studentService.createStudent(body)
    }
    @Get(':id')
    getStudent(@Param('id' , ParseIntPipe) id : number) {
        return this.studentService.getStudent(id)
    }
    @Get()
    getStudents(@Query() query : PaginationDto ) {
        return this.studentService.getStudents(query.page,query.limit)
    }
    @UseGuards(OperatorGuard)
    @Patch(':id')
    updateStudent( @Param('id' , ParseIntPipe) id : number,@Body() body : UpdateUserDto ) {
        return this.studentService.updateStudentData(id , body)
    }
    @UseGuards(AdminGaurd)
    @Delete(':id')
    deleteStudent(@Param('id' , ParseIntPipe) id : number) {
        return this.studentService.deleteStudent(id)
    }
    @UseGuards(OperatorGuard)
    @Post('transfer/:id')
    StudentTransfer(@Param('id' , ParseIntPipe) id : number  , @Body() body : StudentTransferDto) {
        return this.studentService.studentTransfer(id , body.classId)
    }
}
