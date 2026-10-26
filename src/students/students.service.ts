import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity'
import {join} from "path"
import { readFile , writeFile } from 'fs/promises';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dtos/create-student.dto';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { ClassService } from '../class/class.service';
@Injectable()
export class StudentsService {
    constructor(
        @InjectRepository(Student) private readonly student : Repository<Student>,
        private readonly usersService : UsersService,
        private readonly classService : ClassService  
    ){}
    async createStudent(createStudentDto : CreateStudentDto) {
        const { classId, ...userData  } = createStudentDto;
        // Check class capiacty
        const countStudents = await this.student.count({
            where:{
                classes:{id:classId}
            }
        })
        let classEntity = await this.classService.checkCapacity(classId,countStudents)
        // create user
        userData.role = UserRole.STUDENT
        let user = await this.usersService.create(userData)
        let student =  this.student.create({})
        student.user = user
        student.classes = classEntity
        return this.student.save(student)
    }
    async getStudent(id : number) {
        const student = await this.student.findOne({
            where:{
                id
            },
            relations:{user:true ,classes:true}
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
            relations:{user:true}
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
        return this.getStudent(id);
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
    
}
