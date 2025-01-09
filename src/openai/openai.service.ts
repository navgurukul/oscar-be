import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { InputType, TranscriptionStrategy, TRANSCRIPTION_STRATEGIES, classifyInput } from "./strategy/prompt.matrix";
import { TranscriptionsService } from "src/transcriptions/transcriptions.service";
require('dotenv').config();

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  private readonly logger = new Logger(OpenaiService.name);

  constructor(private configService: ConfigService, transcriptionsService: TranscriptionsService) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || this.configService.get("OPENAI_API_KEY"),
    });
  }

  async optimizeText(user_input: string): Promise<{ output: string; }> {
    const strategy = classifyInput(user_input);
    // console.log(strategy, 'strategy');

    const response = await this.openai.chat.completions.create({
      model: process.env.OPEN_AI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: strategy.prompt
        },
        {
          role: "user",
          content: user_input
        }
      ],
      max_tokens: strategy.maxTokens,
      temperature: strategy.temperature
    });
    // console.log(response, '--------response----------');
    const output = await this.parseTranscription(response.choices[0]?.message?.content);
    return output;
  }

  private parseTranscription(transcription: string): any {
    const parsedTrans = JSON.parse(transcription);
    console.log(parsedTrans, 'parsed-content');
    const result = {
      title: parsedTrans.title || null,
      transcript: parsedTrans.transcript,
    };
    return result;
  }


}