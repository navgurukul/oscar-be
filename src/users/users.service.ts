import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) { }
  async create(createUserDto: Prisma.UserCreateInput) {
    const existingUser = await this.databaseService.user.findUnique({
      where: {
        email: createUserDto.email,
      },
    });
    if (existingUser) {      
      return {message:'User already exists'};
    }
    return await this.databaseService.user.create({
      data: createUserDto,
    });
  }

  findByEmail(email: string) {
    return this.databaseService.user.findUnique({
      where: { email },
    }); 
  }

  findAll(id: {}) {
    return this.databaseService.user.findMany({});
  }

  async findOne(id: number) {
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });
  
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  
    return user;
  }

  update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    return this.databaseService.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: number) {
    return this.databaseService.user.delete({
      where: { id },
    });
  }
}
