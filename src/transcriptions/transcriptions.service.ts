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
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import path from "path";
import fs from "fs";
import { Readable } from "stream";

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
    const userExists = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const payload = {
      textFileUrl: createTranscriptionDto.textFileUrl,
      s3AssessKey: createTranscriptionDto.s3AssessKey,
      flag: createTranscriptionDto.flag,
      userTextInput: createTranscriptionDto.userTextInput,
      transcribedText: createTranscriptionDto.transcribedText,
      title: createTranscriptionDto.title,
      user: {
        connect: { id: userId },
      },
    };

    try {
      const create = await this.databaseService.transcriptions.create({
        data: payload,
      });
      create["message"] = "Transcription created successfully";
      create["transcribedText"] = JSON.parse(create.transcribedText);
      return create;
    } catch (error) {
      console.log(error, "---8**error");
      if (Key != undefined && Key != null && Key != "") {
        await this.deleteFileFromS3(Key);
      }
      throw new InternalServerErrorException("Failed to record transcription");
    }
  }

  async findAll(userId: number) {
    // return this.databaseService.transcriptions.findMany({});
    // I want to get the data from the database by user id.
    const resp = [];
    const data = await this.databaseService.transcriptions.findMany({
      where: { userId: userId },
    });

    for (const element of data) {
      let transcribedText = element.transcribedText;
      let userTextInput = element.userTextInput ? element.userTextInput : null;
      const repObj = {
        id: element.id,
        userId: element.userId,
        transcribedText: element.transcribedText,
        userTextInput: userTextInput,
        createdAt: element.createdAt,
        updatedAt: element.updatedAt,
      };
      if (element.flag === "S3") {
        const Key = element.s3AssessKey;
        const text = await this.readS3Object(Key);
        transcribedText = text;
        repObj["transcribedText"] = transcribedText;
      } else {
        repObj["transcribedText"] = JSON.parse(transcribedText);
      }
      resp.push(repObj);
    }
    return resp;
  }

  async findOne(id: number) {
    try {
      const data = await this.databaseService.transcriptions.findUnique({
        where: { id },
      });

      if (!data) {
        throw new NotFoundException(`Transcription not found`);
      }
      let transcribedText = data.transcribedText;
      let userTextInput = data.userTextInput ? data.userTextInput : null;
      const repObj = {
        id: data.id,
        userId: data.userId,
        transcribedText: data.transcribedText,
        userTextInput: userTextInput,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      if (data.flag === "S3") {
        const Key = data.s3AssessKey;
        const text = await this.readS3Object(Key);
        repObj["transcribedText"] = text;
      } else {
        repObj["transcribedText"] = JSON.parse(transcribedText);
      }

      return repObj; // Return the found transcription
    } catch (err) {
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
      if (!data) {
        throw new NotFoundException(`Transcription with ID ${id} not found`);
      }
      if (data.flag === "S3") {
        const Key = data.s3AssessKey;
        await this.deleteFileFromS3(Key);
        return await this.databaseService.transcriptions.delete({
          where: { id },
        });
      }
      const resp = await this.databaseService.transcriptions.delete({
        where: { id },
      });
      resp["message"] = "Transcription deleted successfully";
      return resp;
    } catch (err) {
      throw err;
    }
  }

  async readS3Object(Key: string) {
    try {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
      });
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: Key,
      });
      const response = await s3Client.send(command);

      const streamToString = (stream: Readable): Promise<string> =>
        new Promise((resolve, reject) => {
          const chunks: any[] = [];
          stream.on("data", (chunk) => chunks.push(chunk));
          stream.on("error", reject);
          stream.on("end", () =>
            resolve(Buffer.concat(chunks).toString("utf-8")),
          );
        });

      const data = await streamToString(response.Body as Readable);

      return data;
    } catch (err) {
      console.error("Error reading file from S3:", err);
    }
  }

  async fileUpload(text_string: string): Promise<{ url: string; Key: string }> {
    // Convert the text to a Buffer
    const buffer = Buffer.from(text_string, "utf-8");

    // Define the file path
    const filePath = path.join(__dirname, "output.bin");

    // Write the Buffer to a file in binary format
    fs.writeFileSync(filePath, buffer);

    try {
      const fileStream = fs.createReadStream(filePath);

      const Key = `${uuidv4()}-output.txt`;
      const uploadParams = {
        Bucket: process.env.S3_BUCKET,
        Key: Key,
        Body: fileStream,
        ContentType: "application/octet-stream", // Set the appropriate MIME type
        ContentDisposition: "inline", // Suggest displaying in browser
      };
      const command = new PutObjectCommand(uploadParams);
      const response = await this.s3Client.send(command);
      const s3Url = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`;

      console.log("File uploaded successfully:", s3Url);

      console.log("File uploaded successfully:");
      return {
        url: s3Url,
        Key: Key,
      };
    } catch (err) {
      console.error("Error uploading file:", err);
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
      throw err;
    }
  }
}
