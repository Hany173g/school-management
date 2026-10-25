import { ConflictException, Injectable, NotFoundException , Inject , forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from './class.entity';
import { CreateClassDto } from './dtos/create-class.dto';
import { StudentsService } from '../students/students.service';
import { TeacherService } from '../teacher/teacher.service';
import { UpdateClassDto } from './dtos/update-class.dto';

@Injectable()
export class ClassService {
    constructor(
        @InjectRepository(Classes) private readonly classes : Repository<Classes>,
        private readonly teacherService : TeacherService
    ) {}
    async create(data : CreateClassDto) {
        let newClass = this.classes.create({name:data.name , capacity:data.capacity})
        const teacher = await this.teacherService.getTeacher(data.teacherId)
        newClass.teacher = teacher
        return this.classes.save(newClass)
    }
    async getClass(id : number) {
        const getClass = await this.classes.findOne({
            where:{id},
              relations:{teacher: {
                user:true
              }}
        })
        if (!getClass) {
            throw new NotFoundException("Class not found")
        }
        return getClass
    }
    async getClasses(page : number,limit : number) {
        const getClasses = await this.classes.find({
            take:limit,
            skip:(page - 1) * limit,
            relations:{teacher:{
                user:true
            }}
        })
        return getClasses
    }

    async update(id : number,data : UpdateClassDto) {
        let getClass = await this.getClass(id)
        
        Object.assign(getClass,data)
        return this.classes.save(getClass)
    }
    async checkCapacity(classId : number , countClassStudents : number) {
        let getClass = await this.getClass(classId)
        if (countClassStudents + 1 > getClass.capacity) {
            throw new ConflictException('Class is full')
        }
        return getClass
    }
    delete(id : number) {
        return this.classes.delete(id)
    }
        
}
