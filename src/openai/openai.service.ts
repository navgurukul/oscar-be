import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { TranscriptionsService } from "src/transcriptions/transcriptions.service";

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  private readonly logger = new Logger(OpenaiService.name);

  constructor(private configService: ConfigService, transcriptionsService: TranscriptionsService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || this.configService.get("OPENAI_API_KEY"),
    });
  }

  public async optimizeText(input: string): Promise<string> {
    try {
      const command = process.env.PROMPT + input;

      const response = await this.openai.chat.completions.create({
        model: process.env.OPEN_AI_MODEL || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a highly skilled and detail-oriented language assistant. Your role is to meticulously optimize text by correcting spelling and grammatical errors while preserving the original structure, meaning, and tone. Avoid rephrasing, paraphrasing, or omitting any part of the text unless explicitly instructed."
          },
          {
            role: "user", 
            content: command
          }
        ],
        max_tokens: 100,
        temperature: 0.5,
        top_p: 1,
      });

      return response.choices[0]?.message?.content || "No response text available.";
      
    } catch (error) {
      console.error("Error ------", error);
      this.handleOpenAIError(error);
    }
  }

  private handleOpenAIError(error: any): void {
    if (error.response) {
      const { status, data } = error.response;
      this.logger.error(`OpenAI API Error: ${status} - ${data.error?.message}`);
      switch (status) {
        case 401:
          throw new Error("Invalid API key.");
        case 429:
          throw new Error("Rate limit exceeded. Try again later.");
        case 500:
          throw new Error("OpenAI server error. Please retry.");
        default:
          throw new Error(data.error?.message || "OpenAI API error.");
      }
    } else if (error.request) {
      this.logger.error("No response from OpenAI API.");
      throw new Error("OpenAI API is unreachable. Try again later.");
    } else {
      this.logger.error(`Unexpected error: ${error.message}`);
      throw new Error("An unexpected error occurred.");
    }
  }
}