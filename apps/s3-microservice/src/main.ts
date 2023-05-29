import { NestFactory } from '@nestjs/core';
import { S3MicroserviceModule } from './s3-microservice.module';

async function bootstrap() {
  const app = await NestFactory.create(S3MicroserviceModule);
  await app.listen(3000);
}
bootstrap();
