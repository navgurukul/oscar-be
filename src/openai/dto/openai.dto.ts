import { ApiProperty } from "@nestjs/swagger";

class PromptDto {
  @ApiProperty()
  user_input: string;

  @ApiProperty()
  device_tag: string;

  @ApiProperty()
  record_time: string;
}

export { PromptDto };
