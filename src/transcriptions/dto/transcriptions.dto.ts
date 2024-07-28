import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

class CreateTranscriptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  textFileUrl: string;
}

class UpdateTranscriptionDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  textFileUrl: string;
}

class UplodeFileDto {
  @ApiProperty({ type: "string", format: "binary" })
  file: any;
}

export { CreateTranscriptionDto, UpdateTranscriptionDto, UplodeFileDto };