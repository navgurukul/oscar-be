import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { TranscriptionsService } from "./transcriptions.service";
import { Prisma } from "@prisma/client";
import { ApiTags, ApiBody, ApiResponse, ApiConsumes } from "@nestjs/swagger";
import {
  CreateTranscriptionDto,
  UpdateTranscriptionDto,
  UplodeFileDto,
} from "./dto/transcriptions.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
// import { Multer } from "multer";
// import { Express } from "express";

@ApiTags("transcriptions")
@Controller({ path: "transcriptions", version: "1" })
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}

  @Post()
  @ApiBody({ type: CreateTranscriptionDto })
  @ApiResponse({
    status: 201,
    description: "The transcription has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  create(@Body() createTranscriptionDto: Prisma.TranscriptionsCreateInput) {
    return this.transcriptionsService.create(createTranscriptionDto, 1);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "The transcriptions have been successfully fetched.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  findAll() {
    return this.transcriptionsService.findAll();
  }

  @Get(":id")
  @ApiResponse({
    status: 200,
    description: "The transcription has been successfully fetched.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 404, description: "Transcription not found." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  findOne(@Param("id") id: string) {
    return this.transcriptionsService.findOne(+id);
  }

  @Patch(":id")
  // @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: "The transcription has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiResponse({ status: 404, description: "Transcription not found." })
  @ApiBody({ type: UpdateTranscriptionDto })
  update(
    @Param("id") id: string,
    @Body() updateTranscriptionDto: Prisma.TranscriptionsUpdateInput,
  ) {
    return this.transcriptionsService.update(+id, updateTranscriptionDto);
  }

  @Delete(":id")
  @ApiResponse({
    status: 200,
    description: "The transcription has been successfully deleted.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiResponse({ status: 404, description: "Transcription not found." })
  remove(@Param("id") id: string) {
    return this.transcriptionsService.remove(+id);
  }

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 201,
    description: "The file has been successfully uploaded in the server.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiBody({
    description: "File upload",
    type: UplodeFileDto,
  })
  @UseInterceptors(FileInterceptor("file"))
  fileUpload(@UploadedFile() file: any) {
    return this.transcriptionsService.fileUpload(file);
  }
}
