import { Module } from '@nestjs/common';
import { S3MicroserviceController } from './s3-microservice.controller';
import { S3MicroserviceService } from './s3-microservice.service';
import { ConfigModule } from './config/config.module';
import { ProvidersModule } from '@lib/providers';

@Module({
  imports: [ConfigModule, ProvidersModule],
  controllers: [S3MicroserviceController],
  providers: [S3MicroserviceService],
})
export class S3MicroserviceModule {}
