import { Controller  , Post , UseInterceptors  , UseGuards,Get, Body, Param, ParseIntPipe, Query, Patch, Delete} from '@nestjs/common';
import { ClassService } from './class.service';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { AuthGuard } from '../guards/auth.guard';
import { ClassDto } from './dtos/class.dto';
import { CreateClassDto } from './dtos/create-class.dto';
import { PaginationDto } from '../dtos/pagination.dto';
import { UpdateClassDto } from './dtos/update-class.dto';
import { OperatorGuard } from '../guards/operator.guard';
import { AdminGaurd } from '../guards/admin.guard';
@ UseInterceptors(new SerializeInterceptor(ClassDto))
@UseGuards(AuthGuard)
@Controller('class')
export class ClassController {
    constructor(private readonly classService : ClassService) {}
    @UseGuards(OperatorGuard)
    @Post()
    createClass(@Body() body : CreateClassDto) {
        return this.classService.create(body)
    }    
    @Get(':id')
    getClass(@Param('id' , ParseIntPipe) id : number) {
        return this.classService.getClass(id)
    }
    @Get()
    getClasses(@Query() query : PaginationDto) {
        return this.classService.getClasses(query.page,query.limit)
    }
    @UseGuards(OperatorGuard)
    @Patch(':id') 
    updateClass(@Param('id' , ParseIntPipe) id : number , @Body() body : UpdateClassDto) {
        return this.classService.update(id , body)
    }
    @UseGuards(AdminGaurd)
    @Delete(':id')
    deleteClass(@Param('id' , ParseIntPipe) id : number) {
        return this.classService.delete(id)
    }
}
