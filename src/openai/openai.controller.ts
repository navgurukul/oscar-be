import { Controller, Post, Body, UseGuards, Req, BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { OpenaiService } from "./openai.service";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { PromptDto } from "./dto/openai.dto";
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TranscriptionsService } from "../transcriptions/transcriptions.service";
import { Flag, Prisma } from "@prisma/client";



@Controller({ path: "optimize", version: "1" })
@ApiTags("optimize")
export class OpenaiController {
    constructor(
        private readonly openaiService: OpenaiService,
        private readonly transcriptionsService: TranscriptionsService
    ) {}    

    @Post("optimize-text")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiBody({ type: PromptDto })
    @ApiResponse({ status: 200, description: "transcription successfull" })
    @ApiResponse({ status: 429, description: "To many request or daily quota exceed" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @ApiResponse({ status: 500, description: "Internal Server Error." })
    async optimizeText(@Req() req: Request, @Body() createTranscriptionDto: Prisma.TranscriptionsCreateInput): Promise<{ output: string }> {
        const user = req.user as any;
        const userId = user.id;
        
        const { user_input, device_tag, record_time } = req.body;
        if (!user_input || user_input.length === 0) {
           throw new BadRequestException("Please provide a text to optimize.");
        }
        if (!device_tag) {
            throw new BadRequestException("Please provide a device tag.");
        }
        
        try {
            const output = await this.openaiService.optimizeText(user_input);

            const bytes = new TextEncoder().encode(output).length;
            const megabytes = bytes / (1024 * 1024);
            
            let flag: Flag = "DB";
            createTranscriptionDto.flag = flag;

            createTranscriptionDto.transcribedText = JSON.stringify(output);
            createTranscriptionDto.userTextInput = req.body?.user_input ? req.body.user_input : null;
            let textFileUrl = null;
            let s3AssessKey = null;

            if (megabytes > 1.5) {
                const uploadResult = await this.transcriptionsService.fileUpload(output);
                textFileUrl = uploadResult.url;
                console.log(uploadResult, 'uploadResult');
                createTranscriptionDto.textFileUrl = textFileUrl;
                createTranscriptionDto.s3AssessKey = uploadResult.Key;
                s3AssessKey = uploadResult.Key;
                createTranscriptionDto.flag = "S3";
                delete createTranscriptionDto.transcribedText;
            }
            
            const capture = await this.transcriptionsService.create(
                createTranscriptionDto,
                userId,
                s3AssessKey,
            );
            return { output, ...capture };
        } catch (error) {
            console.log(error, '----((error');
            return { output: `Error: ${(error as any).message}` };
        }
    }

    @Post("optimize-text2")
    @ApiBody({ type: PromptDto })
    @ApiResponse({ status: 200, description: "transcription successfull" })
    @ApiResponse({ status: 429, description: "To many request or daily quota exceed" })
    @ApiResponse({ status: 401, description: "Not a valid token" })
    @ApiResponse({ status: 500, description: "Internal Server Error." })
    async generateText2(@Body("user_input") user_input: string, @Body('device_tag') device_tag: string): Promise<{ output: string }> {
        try {
            if (Number(device_tag) !== 2) return { output: `Error: Invalid device tag` };
            const output = await this.openaiService.optimizeText(user_input);
            // output.status = 200;
            return { output };
        } catch (error) {
            return { output: `Error: ${(error as any).message}` };
        }
    }
}

