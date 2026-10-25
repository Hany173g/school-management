import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';
@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService : UsersService) {}  
  async use(req: Request, res: Response, next: NextFunction) {
    const {userId} = req.session || {}
    if (userId) {
        let user = await this.usersService.findUser(userId)
        req.user = user
    }
    next();
  }
}