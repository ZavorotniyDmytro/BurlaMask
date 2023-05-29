import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { S3MicroserviceModule } from './s3-microservice.module';

async function bootstrap() {
  const app = await NestFactory.create(S3MicroserviceModule);
  const configService = app.get(ConfigService)

  const PORT = configService.get<string>("S3_MICROSERVICE_PORT")
  await app.listen(PORT, ()=> console.log(`Server start at port ${PORT}`));
}
bootstrap();
