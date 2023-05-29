import { Module } from '@nestjs/common';
import { S3MicroserviceController } from './s3-microservice.controller';
import { S3MicroserviceService } from './s3-microservice.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [DatabaseModule, ConfigModule],
  controllers: [S3MicroserviceController],
  providers: [S3MicroserviceService],
})
export class S3MicroserviceModule {}
