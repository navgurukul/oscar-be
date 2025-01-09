import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { DatabaseService } from "src/database/database.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";
import { TranscriptionsModule } from "src/transcriptions/transcriptions.module";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY || "mai-nhi-btaunga",
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || "15d" },
    }),
    forwardRef(() => UsersModule),
    forwardRef(() => TranscriptionsModule),
    ConfigModule,
  ],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtStrategy,
    DatabaseService,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
