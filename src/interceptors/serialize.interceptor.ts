import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { ClassConstructor } from 'class-transformer';
import { plainToClass } from 'class-transformer';
import { map } from 'rxjs/operators';


@Injectable()

export class SerializeInterceptor implements NestInterceptor{
    constructor(private readonly dto : ClassConstructor<any>) {}
    intercept(context: ExecutionContext, next: CallHandler<any>) {
        return next.handle().pipe(
            map((data) => {
                return plainToClass(this.dto,data,{
                    excludeExtraneousValues:true
                })
            })
        )
    }
}