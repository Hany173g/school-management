import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    req.user = null;
    const [bearer, token] = req.headers.authorization?.split(' ') ?? [];
    if (bearer !== 'Bearer' || !token) {
      return next();
    }
    try {
      req.user = this.jwtService.verify(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
    } catch(err : unknown) {
      req.user = null;
    }

    return next();
  }
}