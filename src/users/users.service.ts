import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { JwtService } from '@nestjs/jwt';
import { In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly user : Repository<User>,
        private readonly jwtService : JwtService,
        private readonly configService: ConfigService,
) {}
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
        if (data.email && data.email !== user.email) {
            const checkEmail = await this.user.findOne({
                where: { email: data.email },
            });

            if (checkEmail) {
                throw new ConflictException('This email already in use');
            }
        }
        if (data.password) {
            data.password = await bcrypt.hash(data.password , 10)
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
    generateAccessToken(role : string , name : string  , id : number) {
        return this.jwtService.sign({
            id,
            role,
            name
        }, { secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET' ,),expiresIn:'10m' },);
    } 
        generateRefreshToken(role : string , name : string , id : number) {
        const refreshToken = this.jwtService.sign({
            id,
            name,
            role
        }, {
            secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
            ),
            expiresIn: '7d',
        });
        return refreshToken
    }

    async refreshAccessToken(refreshToken: string) {
        let payload;
        try {
         payload =  this.jwtService.verify(refreshToken, {
             secret: this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
        ),
        });

        } catch(err : unknown) {
             throw new UnauthorizedException('Invalid refresh token');
        }
        const user = await this.findUser(payload.id)

        if (!user) {
            throw new UnauthorizedException('Invalid refresh token');
        }
     
        let accessToken = this.generateAccessToken(user.role,user.name,user.id)
        return {
            accessToken
        };}

    async getUsersByEmail(emails : string[] , select? : Record<string,boolean>) {
        const users = await this.user.find({
            where:{email:In(emails)},
            select
        })
        return users
    }
    
}



