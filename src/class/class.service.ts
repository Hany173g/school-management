import { ConflictException, Injectable, NotFoundException , Inject , forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from './class.entity';
import { CreateClassDto } from './dtos/create-class.dto';
import { TeacherService } from '../teacher/teacher.service';
import { UpdateClassDto } from './dtos/update-class.dto';
import {join} from "path"
import {isEmail } from 'class-validator';
import {readFile,writeFile} from "fs/promises"
import { UsersService } from '../users/users.service';
@Injectable()
export class ClassService {
    constructor(
        @InjectRepository(Classes) private readonly classes : Repository<Classes>,
        private readonly teacherService : TeacherService,
        private readonly usersService : UsersService
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
    
    async exportStudentsToCsv() {
        const path = join(process.cwd() , 'data','classes.csv')
        const content = await readFile(path , 'utf8')
        const lines = content.split(/\r?\n/).map(line => line.trim())
        const data = lines.splice(1)
        const logData : Record<string,object[]> = {
            faild: [],
            success:[],
        }
        let l = 0
        for (let line of data) {
            l++
            const [name , capacity , teacher_name,rawEmail] = line.split(',').map(v => v.trim())
            const teacher_email = rawEmail ?? ''.toLowerCase()
             if (!name) {
                    logData.faild.push({reason:'name is empty' , line : l})
                    continue
                } else if(!teacher_email) {
                    logData.faild.push({reason:'teacher email is empty' , line : l})
                    continue;
                } else if(!isEmail(teacher_email)) {
                    logData.faild.push({reason:'email is invaild' , line:l})
                    continue
                } else if(!capacity) {
                    logData.faild.push({reason:'capacity is empty' , line:l})
                    continue
                }
                else if (!Number.isInteger(Number(capacity))) {
                    logData.faild.push({reason:'capacity not a intger type' , line:l})
                    continue
                }
                try {
                    let checkEmail = await this.usersService.getUserByEmail(teacher_email)
                    if (!checkEmail) {
                        logData.faild.push({reason:"teacher email not found" , line : l})
                        continue
                    }
                    if (!checkEmail.teacher) {
                        logData.faild.push({reason:"user not a teacher" , line:l})
                        continue
                    }
                    let getTeacher = await this.teacherService.getTeacher(checkEmail.teacher.id)
                    let newClass = this.classes.create({
                        name,
                        capacity: Number(capacity),
                         teacher: getTeacher,
                    })
                    await this.classes.save(newClass)
                    logData.success.push({reason:"success to create class and pass all validation" , line : l})
                } catch(err : any) {
                    logData.faild.push({reason:err.message , line : l})
                }
        }
         const pathLogs = join(process.cwd(), 'classes.json');
         const json = JSON.stringify(logData,null,2)
         await writeFile(pathLogs,json,'utf-8')
    }

    
        
}
