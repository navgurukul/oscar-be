import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class TranscriptionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createTranscriptionDto: Prisma.TranscriptionsCreateInput,
    userId: number,
  ) {
    return this.databaseService.transcriptions.create({
      data: {
        ...createTranscriptionDto,
        user: {
          connect: { id: 1 }, // Assuming `id` is the unique identifier for users
        },
      },
    });
  }

  findAll() {
    return this.databaseService.transcriptions.findMany({});
  }

  async findOne(id: number) {
    console.log(id, "id");

    try {
      const data = await this.databaseService.transcriptions.findUnique({
        where: { id },
      });

      if (!data) {
        console.log("Transcription not found");
        throw new NotFoundException("Transcription not found");
      }

      return data; // Return the found transcription
    } catch (err) {
      console.log(err);
      throw err; // Rethrow the error to be handled by the caller
    }
  }

  async update(
    id: number,
    updateTranscriptionDto: Prisma.TranscriptionsUpdateInput,
  ) {
    try {
      const updatedTranscription =
        await this.databaseService.transcriptions.update({
          where: { id },
          data: updateTranscriptionDto,
        });
      return updatedTranscription;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        // P2025 is the error code for "Record to update not found."
        throw new NotFoundException(`Transcription with ID ${id} not found`);
      }
      throw error; // Rethrow any other errors
    }
  }

  async remove(id: number) {
    try {
      const deletedTranscription =
        await this.databaseService.transcriptions.delete({
          where: { id },
        });
      return deletedTranscription;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        // P2025 is the error code for "Record to delete not found."
        throw new NotFoundException(`Transcription with ID ${id} not found`);
      }
      throw error; // Rethrow any other errors
    }
  }
}
