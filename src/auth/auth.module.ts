import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { DatabaseService } from "src/database/database.service";
import { UsersModule } from "src/users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from "@nestjs/config";

// console.log('process.env.JWT_SECRET', process.env.JWT_SECRET);
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "mai-nhi-btaunga",
      signOptions: { expiresIn: "60m" },
    }),
    forwardRef(() => UsersModule),
    ConfigModule,
  ],
  providers: [AuthService, GoogleStrategy, JwtStrategy, DatabaseService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
