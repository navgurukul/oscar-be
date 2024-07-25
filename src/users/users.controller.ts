import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiTags, ApiResponse, ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { CreateUserDto } from "./dto/create-user-dto";

@Controller({ path: "users", version: "1" })
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({
    status: 201,
    description: "The user has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiBody({type: CreateUserDto})
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // @ApiBearerAuth()
  findAll() {
    return this.usersService.findAll({});
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe() {
    return this.usersService.findAll({});
  }

  // @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiResponse({ status: 200, description: "The found record" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(
    @Param("id") id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
