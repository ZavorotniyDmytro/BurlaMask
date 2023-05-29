import { ConfigService } from '@nestjs/config/dist';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService)

  const PORT = configService.get<string>("BURLAMASK_PORT")
  await app.listen(PORT, ()=> console.log(`Server start at port ${PORT}`));
}
bootstrap();
