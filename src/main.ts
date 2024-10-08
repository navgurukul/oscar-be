import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { VersioningType } from "@nestjs/common";
import helmet from "helmet";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  app.enableCors();

  app.setGlobalPrefix("api");

  // we are using the interceptor and filter globally
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle("Oscar API Documentation")
    .setDescription("Backend service for Oscar")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document, {
    customSiteTitle: "Oscar API Docs",
  });

  await app.listen(process.env.PORT || 3002);
  console.log(`Server is running on: ${await app.getUrl()}`);
}
bootstrap();
