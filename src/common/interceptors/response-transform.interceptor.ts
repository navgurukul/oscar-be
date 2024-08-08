import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ResponseWrapper } from "../interfaces/response-wrapper.interface";

@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, ResponseWrapper<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseWrapper<T>> {
    return next.handle().pipe(
      map((data) => {
        return {
          success: true,
          data,
          message: data?.message ? data.message : "Request successful",
          statusCode: context.switchToHttp().getResponse().statusCode,
        };
      }),
    );
  }
}
