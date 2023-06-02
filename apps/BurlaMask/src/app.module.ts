
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { Awss3Module } from './awss3/awss3.module';
import { ImageModule } from './image/image.module';
import { ProvidersModule } from '@lib/providers';
import { SearchModule } from './search/search.module';
import { CorsMiddleware } from './cors.middleware';

@Module({
  imports: [ConfigModule, Awss3Module, ImageModule, ProvidersModule, SearchModule]
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
	  consumer.apply(CorsMiddleware).forRoutes('*');
	}
 }