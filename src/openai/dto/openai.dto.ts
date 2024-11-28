import { ApiProperty } from "@nestjs/swagger";

class PromptDto {
  @ApiProperty()
  user_input: string;

  @ApiProperty()
  device_tag: number;

  @ApiProperty()
  record_time: number;
}

export { PromptDto };
