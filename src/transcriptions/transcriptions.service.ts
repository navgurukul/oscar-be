import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { DatabaseService } from "src/database/database.service";
import { v4 as uuidv4 } from "uuid"; // For generating unique file names
import { config } from "dotenv";
config();

import AWS from "aws-sdk";

const S3Bucket = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  // BucketName: process.env.S3_BUCKET,
});

@Injectable()
export class TranscriptionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createTranscriptionDto: Prisma.TranscriptionsCreateInput,
    userId: number,
    Key: string,
  ) {
    try {
      return await this.databaseService.transcriptions.create({
        data: {
          ...createTranscriptionDto,
          user: {
            connect: { id: userId }, // Assuming `id` is the unique identifier for users
          },
        },
      });
    } catch (error) {
      await this.deleteFileFromS3(Key);
      throw new InternalServerErrorException("Failed to create transcription");
    }
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

  async fileUpload(file) {
    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION, // Optionally specify the region
    });

    const bucketName = process.env.S3_BUCKET;
    const key = `${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const data = await s3.upload(params).promise();

      return { url: data.Location, Key: data.Key };
    } catch (error) {
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  // write code for delelte file.
  async deleteFileFromS3(Key: string): Promise<void> {
    const s3 = new AWS.S3({
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION, // Optionally specify the region
    });

    const bucketName = process.env.S3_BUCKET;
    const params = {
      Bucket: bucketName,
      Key: Key,
    };

    try {
      await s3.deleteObject(params).promise();
      console.log(`Deleted file from S3: ${Key}`);
    } catch (error) {
      console.error("Error deleting object:", error);
      throw new InternalServerErrorException("Failed to delete file from S3");
    }
  }
}
