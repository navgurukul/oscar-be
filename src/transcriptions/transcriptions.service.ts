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

import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";

@Injectable()
export class TranscriptionsService {
  private s3Client: S3Client;
  constructor(private readonly databaseService: DatabaseService) {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
    });
  }

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

  findAll(userId: number) {
    // return this.databaseService.transcriptions.findMany({});
    // I want to get the data from the database by user id.
    return this.databaseService.transcriptions.findMany({
      where: { userId: userId },
    });
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
    file: any,
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
    // first get the data from the database then get the key from the data and then delete the file from the s3 bucket and delete the data from the database.
    try {
      const data = await this.databaseService.transcriptions.findUnique({
        where: { id },
      });
      console.log(data, "data");
      if (!data) {
        throw new NotFoundException(`Transcription with ID ${id} not found`);
      }
      const Key = data.s3AssessKey;

      await this.deleteFileFromS3(Key);
      return await this.databaseService.transcriptions.delete({
        where: { id },
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async fileUpload(file: any): Promise<{ url: string; Key: string }> {
    const Key = `${uuidv4()}-${file.originalname}`;
    const uploadParams = {
      Bucket: process.env.S3_BUCKET,
      Key: Key,
      Body: file.buffer,
      ContentType: file.mimetype, // Set the appropriate MIME type
      ContentDisposition: "inline", // Suggest displaying in browser
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      const data: PutObjectCommandOutput = await this.s3Client.send(command);
      console.log(data, "Upload response");
      const region =
        typeof this.s3Client.config.region === "function"
          ? await this.s3Client.config.region()
          : this.s3Client.config.region;
      const s3Url = `https://${uploadParams.Bucket}.s3.${region}.amazonaws.com/${Key}`;
      return {
        url: s3Url,
        Key: Key,
      };
    } catch (err) {
      console.error("Error uploading file:", err);
      throw new Error("File upload failed");
    }
  }

  async deleteFileFromS3(key: string): Promise<DeleteObjectCommandOutput> {
    const deleteParams = {
      Bucket: process.env.S3_BUCKET,
      Key: key,
    };

    try {
      const command = new DeleteObjectCommand(deleteParams);
      const data: DeleteObjectCommandOutput = await this.s3Client.send(command);
      console.log("Delete response:", data);
      return;
    } catch (err) {
      console.error("Error deleting file:", err);
      throw new Error("File deletion failed");
    }
  }

  async updateFileFromS3(
    file: any,
    id: string,
  ): Promise<{ url: string; Key: string }> {
    try {
      const data = await this.databaseService.transcriptions.findUnique({
        where: { id: +id },
      });
      if (!data) {
        throw new NotFoundException(`Transcription with ID ${id} not found`);
      }
      const Key = data.s3AssessKey;
      await this.deleteFileFromS3(Key);
      return await this.fileUpload(file);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}
