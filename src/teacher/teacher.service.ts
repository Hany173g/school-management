import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { Column, Repository } from 'typeorm';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { UserRole } from '../users/enums/user-role.enum';
import {join} from "path"
import { readFile ,writeFile } from 'fs/promises';
import { isEmail } from 'class-validator';
import { parse } from 'csv-parse/sync'
import { randomBytes } from 'node:crypto';
import type {ParsedTeacherRecord} from "./types/parse.types"

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(Teacher) private readonly teacher : Repository<Teacher>,
        private readonly userService : UsersService) {}
    async create(data : CreateUserDto) {
        let teacher = this.teacher.create()
        data.role = UserRole.TEACHER
        let user = await this.userService.create(data)
        teacher.user = user
        return this.teacher.save(teacher)
    }
    async update(id : number , data : UpdateUserDto) {
        let teacher = await this.teacher.findOne(
            {
            where:{
                id
            },
            relations:{user:true}
        }
        )
        if (!teacher) {
            throw new NotFoundException("Teacher not found")
        }
        await this.userService.update(teacher.user.id,data)
        return this.getTeacher(id);
    }
    async getTeacher(id : number) : Promise<Teacher> {
        let teacher = await this.teacher.findOne({
            where:{id},
            relations:{user:true}
        })
        if (!teacher) {
            throw new NotFoundException("Teacher not found")
        }
        return teacher
    }
    async getTeachers(page : number , limit : number) {
       return this.teacher.find({
            take:limit,
            skip: (page - 1) * limit,
            relations:{user:true}
        })
    }
    async delete(id : number) {
        let teacher = await this.getTeacher(id)
        await this.userService.deleteUser(teacher.user.id)
    }
    async exportTeachersFromCsv() {
        const path = join(process.cwd(), 'data', 'teachers.csv');
        const content = await readFile(path, 'utf-8');
        const records = parse(content , {
            columns:true,
            skip_empty_lines:true,
            trim:true,
            info:true
        }) as ParsedTeacherRecord[]
        const emails = records.map(({ record }) => (record.email ?? '').toLowerCase());
        const users = await this.userService.getUsersByEmail(emails)
        const usersEmail = new Set(users.map(u => u.email)) // big o(1) to search
        const logData : Record<string,object[]> = {
            faild: [],
            success:[],
        }
        for (let {record , info} of records) {
            const l = info.lines
            const name = (record.name ?? '').trim()
            const email = (record.email ?? '').toLowerCase()
            
            if (!name) {
                logData.faild.push({reason:'name is empty' , line : l})
                continue
            } else if(!isEmail(email)) {
                logData.faild.push({reason:'email is invaild' , line:l})
                continue
            }
            if (usersEmail.has(email)) {
                logData.faild.push({reason:'email is duplicate',line:l})
                continue
            }
            usersEmail.add(email) // for duplicate email
            const password = randomBytes(16).toString('hex'); 
            const newUser = {
                name,
                role : UserRole.TEACHER,
                email,
                password
            }
            try {
                let user = await this.userService.create(newUser)
                if (!user) {
                    logData.faild.push({reason:'faild to create user' , line : l})
                    continue;
                }
                let newTeacher = await this.teacher.create({user})
                if (!newTeacher) {
                    logData.faild.push({reason:'faild to create teacher' , line : l})
                    continue;
                }
                await this.teacher.save(newTeacher)
                logData.success.push({reason:'success to create user and pass all validation' , line : l , userData :{password,email}})
            } catch(err : any) {
                 logData.faild.push({reason:err.message , line : l })
                 usersEmail.delete(email)
            }
        }
        const pathLogs = join(process.cwd(), 'teacher.json');
        const json = JSON.stringify(logData, null, 2);
        await writeFile(pathLogs, json, 'utf-8');
    }
}
