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
import {
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from "@nestjs/swagger";
import { AuthDto } from "./dto/auth.dto";

@ApiTags("auth")
@Controller({ path: "auth", version: "1" })
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Get("google")
  // @UseGuards(AuthGuard("google"))
  // googleAuth(@Req() req) {}

  // if redirected to this route then it means that the user has successfully authenticated with Google.
  // @Get("google/redirect")
  // @UseGuards(AuthGuard("google"))
  // async googleAuthRedirect(@Req() req: Request) {
  //   const user = req.user;
  //   const token = await this.authService.login(user);
  //   return {
  //     statusCode: 200,
  //     message: "Google Authentication successful.",
  //     user,
  //     token,
  //   };
  // }

  // if client is sending the token directly to the server then this route can be used. It will create new use if not exists.
  @Post("login/google")
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 201, description: "User logged in successfully" })
  @ApiResponse({ status: 401, description: "Invalid token" })
  async googleCallback(@Body() body: { idToken: string }) {
    const user = await this.authService.validateGoogleToken(body.idToken);
    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }
    return user;
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiExcludeEndpoint()
  async profile(@Req() req: Request) {
    const user = req.user;
    return user;
  }
}
