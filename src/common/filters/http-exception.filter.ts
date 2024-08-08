import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from "@nestjs/common";
import { Response as ExpressResponse } from "express";
import { ResponseWrapper } from "../interfaces/response-wrapper.interface";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      message = (exceptionResponse as any).message;
    } else {
      message = "An unexpected error occurred.";
    }

    const formattedResponse: ResponseWrapper<null> = {
      success: false,
      data: null,
      message: message,
      statusCode: status,
    };

    response.status(status).json(formattedResponse);
  }
}
