import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Pagination-Total-Count'],
    preflightContinue: false,
  };

  app.enableCors(corsOptions);

  const PORT = configService.get<string>('BURLAMASK_PORT');
  await app.listen(PORT, () => console.log(`Server start at port ${PORT}`));

  const flaskPort = 5000; // Порт, на якому працює Flask сервер
  app.use(
    '/process_images',
    createProxyMiddleware({
      target: `http://localhost:${flaskPort}`,
      changeOrigin: true,
    }),
  );

  // Запуск сервера Flask
  const flaskProcess = spawn('python', ['app.py']);
  flaskProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  flaskProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
}

bootstrap();
