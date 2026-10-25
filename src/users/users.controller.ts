import { Controller , Post  , Body  , Session , UseInterceptors, Get} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { LoginDto } from './dtos/login.dto';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
@Controller('users')
export class UsersController {
    constructor(private readonly usersService : UsersService) {}
    @UseInterceptors(new SerializeInterceptor(UserDto))
    @Post('login')
    async Login(@Body() body : LoginDto , @Session() session : any) {
        let user = await this.usersService.login(body)
        console.log(user);
        session.userId = user.id
        return user;
    }
    @Get()
    me(@Session() session : any) {
        return this.usersService.findUser(session.userId)
    }
}
