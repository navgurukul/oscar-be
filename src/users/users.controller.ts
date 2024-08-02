import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Prisma } from "@prisma/client";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ApiTags, ApiResponse, ApiBearerAuth, ApiBody, ApiExcludeEndpoint } from "@nestjs/swagger";
import { CreateUserDto, UpdateUserDto } from "./dto/create-user-dto";

@Controller({ path: "users", version: "1" })
@ApiTags("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiExcludeEndpoint()  // add this to hide api from swagger
  @ApiResponse({
    status: 201,
    description: "The user has been successfully created.",
  })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: Prisma.UserCreateInput) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiExcludeEndpoint()
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "The found records" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  findAll() {
    return this.usersService.findAll({});
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: "The found record" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  async findMe(@Req() req: Request) {
    const reqe = req as any;
    return reqe.user;
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
  @ApiBearerAuth()
  @ApiBody({ description: "User update", type: UpdateUserDto })
  @ApiResponse({ status: 200, description: "Updated user" })
  @ApiResponse({ status: 404, description: "Not Found" })
  @ApiResponse({ status: 500, description: "Internal Server Error." })
  async update(
    @Param("id") id: string,
    @Body() updateUserDto: Prisma.UserUpdateInput,
  ) {
    // Ensure the id is correctly converted to a number
    // return await this.usersService.update(+id, UpdateUserDto as any);
    const userId = +id;
    if (isNaN(userId)) {
      throw new BadRequestException("Invalid user ID");
    }
    return await this.usersService.update(userId, updateUserDto as any);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
