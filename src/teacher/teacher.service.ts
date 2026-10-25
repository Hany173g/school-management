import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Teacher } from './teacher.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from '../users/dtos/update-user.dto';
import { UserRole } from '../users/enums/user-role.enum';
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
}
