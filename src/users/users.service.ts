import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly user : Repository<User>) {}
    async create(createUser : CreateUserDto) {
        // check if email existed
        let checkUser = await this.user.findOne({where:{email:createUser.email}})
        if (checkUser) {
            throw new ConflictException("Email already used")
        }
        const hashedPassword = await bcrypt.hash(createUser.password, 10);
        const user = this.user.create({
            ...createUser,
            password: hashedPassword,
        });
        return this.user.save(user);
    }



    async login(loginData : LoginDto) {
        // check user if existed
        let user = await this.user.findOne(
        {
            where:
            {
                email:loginData.email
            }
        })
        if (!user) {
            throw new UnauthorizedException("user not found or password not match")
        }
        // compare password
        let isMatch = await bcrypt.compare(loginData.password,user.password)
        if (!isMatch) {
            throw new UnauthorizedException("user not found or password not match")
        }
        return user
    }
    async findUser(id : number) {
        return this.user.findOne({where:{id}})
    }
    async update(id : number , data : UpdateUserDto) {
        let user = await this.findUser(id)
        if (!user) {
            throw new NotFoundException("User not found")
        }
        Object.assign(user , data)
        return this.user.save(user)
    }
    async deleteUser(id: number) {
        return this.user.delete(id);
    }
    getUserByEmail(email : string) {
        return this.user.findOne({where:{email} , relations:{teacher:true}})
    }
}
