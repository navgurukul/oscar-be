import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { DatabaseModule } from "./database/database.module";
import { TranscriptionsModule } from "./transcriptions/transcriptions.module";
import { UsersModule } from "./users/users.module";
// import { StandardResponseModule } from 'nest-standard-response';
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ConfigModule } from "@nestjs/config";
import { LoggerMiddleware } from "./middleware/logger.middleware";
import { OpenaiService } from './openai/openai.service';
import { OpenaiController } from './openai/openai.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 5 * 60000, // 5 minutes
        limit: 100, // 50 requests
      },
    ]),
    DatabaseModule,
    TranscriptionsModule,
    UsersModule,
    AuthModule,
    // StandardResponseModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    OpenaiService,
  ],
  controllers: [OpenaiController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*"); // Apply to all routes or specify routes as needed
  }
}
