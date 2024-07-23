import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class TranscriptionsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createTranscriptionDto: Prisma.TranscriptionsCreateInput) {
    return this.databaseService.transcriptions.create({
      data: createTranscriptionDto,
    });
  }

  findAll() {
    return this.databaseService.transcriptions.findMany({});
  }

  findOne(id: number) {
    const data = this.databaseService.transcriptions.findUnique({
      where: { id },
    });
    data
      .then((res) => {
        if (!res) {
          console.log("Transcription not found");
        }
        return data;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  update(id: number, updateTranscriptionDto: Prisma.TranscriptionsUpdateInput) {
    return this.databaseService.transcriptions.update({
      where: { id },
      data: updateTranscriptionDto,
    });
  }

  remove(id: number) {
    return this.databaseService.transcriptions.delete({
      where: { id },
    });
  }
}
