import { Controller ,  Body,Get,Post,Patch,Delete,Query,Param,UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { TeacherService } from './teacher.service';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { TeacherDto } from './dtos/teacher.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { OperatorGuard } from '../guards/operator.guard';
import { AdminGaurd } from '../guards/admin.guard';

@UseInterceptors(new SerializeInterceptor(TeacherDto))
@UseGuards(AuthGuard)
@Controller('teacher')
export class TeacherController {
    constructor(private readonly teacherService : TeacherService){}
    @UseGuards(OperatorGuard)
    @Post()
    createTeacher(@Body() body : CreateUserDto) {
        return this.teacherService.create(body)
    }
    @Get(':id')
    getTeacher(@Param('id',ParseIntPipe) id : number) {
        return this.teacherService.getTeacher(id)
    }
    @Get()
    getTeachers(@Query() query : PaginationDto) {
        return this.teacherService.getTeachers(query.page,query.limit)
    }
    @UseGuards(OperatorGuard)
    @Patch(':id')
    updateTeacher(@Param('id' , ParseIntPipe) id : number , @Body() body : UpdateUserDto) {
        return this.teacherService.update(id , body)
    }
    @UseGuards(AdminGaurd)
    @Delete(':id')
    deleteTeacher(@Param('id' , ParseIntPipe) id : number) {
        return this.teacherService.delete(id)
    }
}
