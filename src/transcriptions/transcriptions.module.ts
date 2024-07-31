import { forwardRef, Module } from "@nestjs/common";
import { TranscriptionsService } from "./transcriptions.service";
import { TranscriptionsController } from "./transcriptions.controller";
import { AuthModule } from "src/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [forwardRef(() => AuthModule), ConfigModule, UsersModule],
  controllers: [TranscriptionsController],
  providers: [TranscriptionsService],
  exports: [TranscriptionsService],
})
export class TranscriptionsModule {}
