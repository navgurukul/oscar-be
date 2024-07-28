import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsDate } from "class-validator";

export class CreateTranscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  textFileUrl: string;
}

export class UpdateTranscriptionDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  textFileUrl: string;
}
