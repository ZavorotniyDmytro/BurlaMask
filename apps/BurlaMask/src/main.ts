import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config/dist';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService)

	const corsOptions: CorsOptions = {
		origin: 'http://localhost:3000', 
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		exposedHeaders: ['Content-Length', 'X-Pagination-Total-Count'], 
		preflightContinue: false,
	};

	app.enableCors(corsOptions);

	const PORT = configService.get<string>("BURLAMASK_PORT")
	await app.listen(PORT, ()=> console.log(`Server start at port ${PORT}`));
}
bootstrap();
