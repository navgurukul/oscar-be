import { Module } from "@nestjs/common";
import { TranscriptionsService } from "./transcriptions.service";
import { TranscriptionsController } from "./transcriptions.controller";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [TranscriptionsController],
  providers: [TranscriptionsService],
  exports: [TranscriptionsService],
})
export class TranscriptionsModule {}
