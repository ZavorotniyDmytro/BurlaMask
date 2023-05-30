
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { Awss3Module } from './awss3/awss3.module';
import { PhotoModule } from './photo/photo.module';
import { ProvidersModule } from '@lib/providers';

@Module({
  imports: [ConfigModule, Awss3Module, PhotoModule, ProvidersModule]
})
export class AppModule {}
