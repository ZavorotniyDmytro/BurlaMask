import { ProvidersModule } from '@lib/providers';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, ProvidersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
