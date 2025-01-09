import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";

class CreateTranscriptionDto {
  // @ApiProperty({ type: "string", format: "binary" })
  // file: any;
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  transcribedText: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  userTextInput: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  title: string;
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
