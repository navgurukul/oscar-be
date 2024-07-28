import { ApiProperty } from "@nestjs/swagger";

class AuthDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  profile: string;

  @ApiProperty()
  token: string;
}

export { AuthDto };