import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { ApiTags, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthDto } from "./dto/auth.dto";

@ApiTags("auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
  googleAuth(@Req() req) {}

  // if redirected to this route then it means that the user has successfully authenticated with Google.
  @Get("google/redirect")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: Request) {
    const user = req.user;
    const token = await this.authService.login(user);
    return {
      statusCode: 200,
      message: "Google Authentication successful.",
      user,
      token,
    };
  }

  // if client is sending the token directly to the server then this route can be used. It will create new use if not exists.
  @Post("login/google")
  // @ApiBody({type : {email: String, profile: String, token: String} })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: "User Login successfuly" })
  

  async googleCallback(
    @Body() body: { email: string; profile: string; token: string },
  ) {
    // const user = await this.authService.validateGoogleToken(body.token);
    // if (!user) {
    //     throw new UnauthorizedException('Invalid token');
    // }
    const jwt = await this.authService.login(body);
    return { user: { ...jwt } };
  }

  @Get("test")
  @UseGuards(JwtAuthGuard)
  getProtectedData(@Req() req: Request) {
    return { message: "This is a protected route." };
  }
}
