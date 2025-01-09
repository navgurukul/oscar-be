import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UsersService } from "src/users/users.service";
import { AuthService } from "src/auth/auth.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("No token provided");
    }

    try {
      const payload = await this.authService.validateToken(token);
      const userId = parseInt(payload.userId);
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }
      request.user = user;
    } catch (error) {
      console.error("JWT verification error:", error);
      if ((error as any).name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired. Please log in again.');
      } else if ((error as any).name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token. Please log in again.');
      } else {
        throw new UnauthorizedException('Authentication failed. Please log in again.');
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
