import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { TranscriptionsService } from "./transcriptions.service";
import { Prisma } from "@prisma/client";
import { ApiTags, ApiResponse } from "@nestjs/swagger";

@ApiTags("transcriptions")
@Controller({ path: "transcriptions", version: "1" })
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}

  @Post()
  create(@Body() createTranscriptionDto: Prisma.TranscriptionsCreateInput) {
    return this.transcriptionsService.create(createTranscriptionDto);
  }

  @Get()
  findAll() {
    return this.transcriptionsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.transcriptionsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateTranscriptionDto: Prisma.TranscriptionsUpdateInput,
  ) {
    return this.transcriptionsService.update(+id, updateTranscriptionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.transcriptionsService.remove(+id);
  }
}
