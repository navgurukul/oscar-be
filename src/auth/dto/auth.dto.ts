import { ApiProperty } from "@nestjs/swagger";

class AuthDto {
  @ApiProperty()
  idToken: string;
}

class AuthRegisterDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  profilePicUrl: string;
}
export { AuthDto, AuthRegisterDto };
