
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { Awss3Module } from './awss3/awss3.module';
import { ImageModule } from './image/image.module';
import { ProvidersModule } from '@lib/providers';
import { SearchModule } from './search/search.module';

@Module({
  imports: [ConfigModule, Awss3Module, ImageModule, ProvidersModule, SearchModule]
})
export class AppModule {}
