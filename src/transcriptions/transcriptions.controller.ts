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
  Req,
  UnauthorizedException,
} from "@nestjs/common";

import { TranscriptionsService } from "./transcriptions.service";
import { Prisma } from "@prisma/client";
import {
  ApiTags,
  ApiBody,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from "@nestjs/swagger";
import {
  CreateTranscriptionDto,
  UpdateTranscriptionDto,
  UplodeFileDto,
} from "./dto/transcriptions.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request } from "express";

@ApiTags("transcriptions")
@Controller({ path: "transcriptions", version: "1" })
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}
  @Post("upload-and-create")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 201,
    description:
      "The file has been successfully uploaded and the transcription has been created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiBody({
    description: "File upload and transcription creation",
    type: CreateTranscriptionDto,
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadAndCreate(
    @UploadedFile() file: any,
    @Body() createTranscriptionDto: Prisma.TranscriptionsCreateInput,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const userId = user.id;

    const uploadResult = await this.transcriptionsService.fileUpload(file);

    let textFileUrl = uploadResult.url;
    createTranscriptionDto.textFileUrl = textFileUrl;
    createTranscriptionDto.s3AssessKey = uploadResult.Key;
    let Key = uploadResult.Key;
    const createResult = await this.transcriptionsService.create(
      createTranscriptionDto,
      userId,
      Key,
    );
    return {
      createResult,
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "The transcriptions have been successfully fetched.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  findAll(@Req() req: Request) {
    const user = req.user as any;
    const userId = user.id;
    return this.transcriptionsService.findAll(userId);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 200,
    description: "The transcription has been successfully updated.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiResponse({ status: 404, description: "Transcription not found." })
  @ApiBody({ type: UpdateTranscriptionDto })
  update(
    @UploadedFile() file: any,
    @Param("id") id: string,
    @Body() updateTranscriptionDto: Prisma.TranscriptionsUpdateInput,
  ) {
    const updateFile = this.transcriptionsService.updateFileFromS3(file, id);
    return this.transcriptionsService.update(+id, updateTranscriptionDto, file);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
}
