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
  BadRequestException,
} from "@nestjs/common";

import { TranscriptionsService } from "./transcriptions.service";
import { PrismaClient, Prisma } from "@prisma/client";
import { Flag } from "@prisma/client";
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
import e, { Request } from "express";
import * as path from "path";
import * as fs from "fs";

@ApiTags("transcriptions")
@Controller({ path: "transcriptions", version: "1" })
export class TranscriptionsController {
  constructor(private readonly transcriptionsService: TranscriptionsService) {}
  @Post("add")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  // @ApiConsumes("multipart/form-data")
  @ApiResponse({
    status: 201,
    description:
      "The file has been successfully uploaded and the transcription has been created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        transcribedText: { type: "string" },
      },
      required: ["transcribedText"],
    },
  })
  // @UseInterceptors(FileInterceptor("file"))
  async uploadAndCreate(
    // @UploadedFile() file: any,
    @Body() createTranscriptionDto: Prisma.TranscriptionsCreateInput,
    @Req() req: Request,
  ) {
    const user = req.user as any;
    const userId = user.id;
    const { transcribedText } = req.body;
    if (transcribedText.length < 10) {
      throw new BadRequestException("Data not provided or too short");
    }
    const text_string = req.body.transcribedText;

    const bytes = new TextEncoder().encode(text_string).length;
    const megabytes = bytes / (1024 * 1024);

    let flag: Flag = "DB";
    let textFileUrl = null;
    let s3AssessKey = null;

    createTranscriptionDto.flag = flag;

    createTranscriptionDto.transcribedText = JSON.stringify(text_string);

    // 
    if (megabytes > 1.5) {
      const uploadResult = await this.transcriptionsService.fileUpload(
        text_string,
      );
      textFileUrl = uploadResult.url;
      createTranscriptionDto.textFileUrl = textFileUrl;
      createTranscriptionDto.s3AssessKey = uploadResult.Key;
      s3AssessKey = uploadResult.Key;
      createTranscriptionDto.flag = "S3";
      delete createTranscriptionDto.transcribedText;
    }

    const createResult = await this.transcriptionsService.create(
      createTranscriptionDto,
      userId,
      s3AssessKey,
    );
    return createResult;
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
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    const userId = user.id;
    // return await this.transcriptionsService.findAll(userId);
    let re = await this.transcriptionsService.findAll(userId);
    // console.log(re, "this is the response");
    return re;
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
