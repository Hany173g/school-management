import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity'
import {join} from "path"
import { readFile , writeFile } from 'fs/promises';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { parse } from 'csv-parse/sync'
import { ParsedTeacherRecord } from './types/parse.type';
import { ClassService } from '../class/class.service';
import { isEmail } from 'class-validator';
import { UserRole } from '../users/enums/user-role.enum';
import { randomBytes } from 'crypto';
import { DataSource } from 'typeorm';
@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student) private readonly student : Repository<Student>,
        private readonly usersService : UsersService,
        private readonly classService : ClassService  ,
        private readonly dataSource : DataSource
    ){}
    async createStudent(createStudentDto : CreateStudentDto) {
        return this.dataSource.transaction(async (manager) => {
            const { classId, ...userData  } = createStudentDto;
        // Check class capiacty
            await manager.query(`SET LOCAL lock_timeout = '5s'`);
            const countStudents = await this.student.count({
                where:{
                    classes:{id:classId}
                },
                lock:{
                    mode:'pessimistic_write'
                }   
            })
            let classEntity = await this.classService.checkCapacity(classId,countStudents)
            
            let user = await this.usersService.create(userData)
            let student =  this.student.create({})
            student.user = user
            student.classes = classEntity
            return this.student.save(student)
        })
    }
    async getStudent(id : number) {
        const student = await this.student.findOne({
            where:{
                id
            },
            relations:
            {
                user:true ,
                classes:true
            }
        })
        if (!student) {
            throw new NotFoundException("Student not found")
        }
        return student
    }
    async getStudents(page : number , limit : number) {
        let skip = (page - 1) * limit
        const students = await this.student.find({
            take:limit,
            skip,
            relations:
            {
                user:true,
                classes:true
            }
        })
        return students
    }
    async updateStudentData(id : number,data : UpdateUserDto) {
        let student = await this.student.findOne(
            {
                where:{
                    id
                },
                relations:{user:true}
            })
        if (!student) {
            throw new NotFoundException("Student not found")
        }
        await this.usersService.update(student.user.id , data)
        return this.getStudent(id);
    }
    async deleteStudent(id : number) {
       let student = await this.student.findOne(
            {
                where:{
                    id
                },
                relations:{user:true}
            })
        if (!student) {
            throw new NotFoundException("Student not found")
        }
        await this.usersService.deleteUser(student.user.id)
    }
    
    async studentTransfer(studentId : number , classId : number) {
        let getStudent = await this.getStudent(studentId)
        if (getStudent.classes.id === classId) {
            return getStudent
        }
        const countStudents = await this.student.count({
            where:{
                classes:{id:classId}
            }
        })
        let classEntity = await this.classService.checkCapacity(classId,countStudents)
        getStudent.classes = classEntity
        return this.student.save(getStudent)
    }
    async getCountClassStudents(classId : number) {
        let countStudents = await this.student.count({
            where:{
                classes:
                {
                    id:classId}
                }
            })
        return countStudents
    }
    async exportStudentsFromCsv() {
        const path = join(process.cwd(), 'data', 'students.csv');
        const content = await readFile(path, 'utf-8');
        const records = parse(content , {
            columns:true,
            skip_empty_lines:true,
            trim:true,
            info:true
        }) as ParsedTeacherRecord[]
        const emails = records.map(({ record }) => (record.email ?? '').toLowerCase());
        const users = await this.usersService.getUsersByEmail(emails)
        const usersEmail = new Set(users.map(u => u.email)) // big o(1) to search
        const logData : Record<string,object[]> = {
            faild: [],
            success:[],
        }
        for (const {record  , info} of records) {
            let l = info.lines
            const name = (record.name ?? '').trim()
            const email = (record.email ?? '').toLocaleLowerCase()
            const class_name  = (record.class_name ?? '').trim()
            if (!name) {
                logData.faild.push({reason:'name is empty' , line :l}) 
                continue             
            }
            else if (!email || !isEmail(email)) {
                logData.faild.push({reason:'email is invaild' ,line : l})
                continue
            }
            else if (usersEmail.has(email)) {
                logData.faild.push({reason:"email is duplicate" , line : l})
                continue
            }
            else if (!class_name) {
                logData.faild.push({reason:'class name is empty' , line:l})
                continue
            }
            usersEmail.add(email)
            const password = randomBytes(16).toString('hex');
            try {
                let checkClass = await this.classService.getClassByName(class_name)
                if (!checkClass) {
                    logData.faild.push({reason:'class not found' , line:l})
                    continue
                }
                const userBody =  {
                    password ,
                    email,
                    name,
                    role : UserRole.STUDENT
                }  
                let newUser = await this.usersService.create(userBody)
                if (!newUser) {
                    logData.faild.push({reason:'faild to create user' , line:l})
                    continue
                }
                this.student.create({user:newUser,classes:checkClass})
                logData.success.push({reason:'success to create a new student' , line:l , userData : {email,password}})
            } catch(err : any) {
                logData.faild.push({reason:err.message ,line:l})
            }
        }
         const pathLogs = join(process.cwd(), 'students.json');
        const json = JSON.stringify(logData,null,2)
        await writeFile(pathLogs,json,'utf-8')
    }
    
}
