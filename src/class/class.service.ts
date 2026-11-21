import { ConflictException, Injectable, NotFoundException , Inject , forwardRef, BadRequestException } from '@nestjs/common';
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
import { parse } from 'csv-parse/sync'
import { StudentsService } from '../students/students.service';
import type{ ParsedRecord } from './types/parsed.types';
import { ILike } from 'typeorm'
@Injectable()
export class ClassService {
    constructor(
        @InjectRepository(Classes) private readonly classes : Repository<Classes>,
        private readonly teacherService : TeacherService,
        private readonly usersService : UsersService,
        @Inject(forwardRef(() => StudentsService)) // for crucler DI
        private readonly studentsService: StudentsService,
    ) {}
    async create(data : CreateClassDto) {
        let checkClass = await this.classes.findOne({
            where:{
                name:data.name
            }
        })
        if (checkClass) {
            throw new ConflictException("Class name is already used")
        }

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
        if (data.name) {
            let checkClass = await this.classes.findOne({
                where:{
                    name:data.name
                    }
                })
            if (checkClass && checkClass.id !== getClass.id) {
                 throw new ConflictException("Class name is already used")
            }
        }
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
    async delete(id : number) {
        let countStudents = await this.studentsService.getCountClassStudents(id)
        if (countStudents > 0) {
            throw new ConflictException("Class has students , transfer they before delete")
        }
        return this.classes.delete(id)
    }
    
    async exportClassessFromCsv() {
        const path = join(process.cwd() , 'data','classes.csv')
        const content = await readFile(path , 'utf8')   
        const records = parse(content, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            info:true
        }) as ParsedRecord[]
    
        const logData : Record<string,object[]> = {
            faild: [],
            success:[],
        }
       
        for (const { record, info } of records) {
            const l = info.lines
            const name = (record.name ?? '').trim()
            const capacity = Number(record.capacity ?? '')
            const teacher_email = (record.teacher_email ?? '').toLowerCase()
             if (!name) {
                    logData.faild.push({reason:'name is empty' , line : l})
                    continue
                } else if(!teacher_email) {
                    logData.faild.push({reason:'teacher email is empty' , line : l})
                    continue;
                } else if(!isEmail(teacher_email)) {
                    logData.faild.push({reason:'email is invaild' , line:l})
                    continue
                }
                else if (!Number.isInteger(capacity) || capacity <= 0) {
                    logData.faild.push({reason:'capacity not a intger type' , line:l})
                    continue
                }
                try {
                     let checkClass = await this.classes.findOne({
                        where:{
                            name
                        }
                    })
                    if (checkClass) {
                        throw new ConflictException("Class name is already used")
                    }
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
                        capacity: capacity,
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



    getClassByName(name : string) {
        return this.classes.findOne({where:{name:ILike(name)}})
    }
    
        
}
