import { Controller , Post  , Body  , UnauthorizedException , UseInterceptors, Get, Res, Req} from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response  , Request} from 'express';
import { LoginDto } from './dtos/login.dto';
import {UserDto,LoginResDto} from "./dtos/user.dto"
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService ) {}
    @UseInterceptors(new SerializeInterceptor(LoginResDto))
    @Post('login')
    async Login(@Body() body : LoginDto , @Res({passthrough:true}) res : Response) {
        let user = await this.usersService.login(body)
        let accessToken = this.usersService.generateAccessToken(user.role,user.name,user.id)
        let refreshToken = this.usersService.generateRefreshToken(user.role,user.name,user.id)
         res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/users/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7D
        });
        return {accessToken,user};
    }
   @Post('refresh')
   async refreshToken(@Req() req: Request) {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing');
        }

        return this.usersService.refreshAccessToken(refreshToken);
    }
   
}
