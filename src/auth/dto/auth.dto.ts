import { ApiProperty } from "@nestjs/swagger";

class AuthDto {
  @ApiProperty()
  idToken: string;
}

export { AuthDto };
