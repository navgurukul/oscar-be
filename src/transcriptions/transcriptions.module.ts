import { Module } from "@nestjs/common";
import { TranscriptionsService } from "./transcriptions.service";
import { TranscriptionsController } from "./transcriptions.controller";

@Module({
  controllers: [TranscriptionsController],
  providers: [TranscriptionsService],
})
export class TranscriptionsModule {}
