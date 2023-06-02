import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config/dist';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { bodyParser: true });
	const configService = app.get(ConfigService)

	const corsOptions: CorsOptions = {
		origin: 'http://localhost:3000', 
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
		exposedHeaders: ['Content-Length', 'X-Pagination-Total-Count', 'Access-Control-Allow-Origin'],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	};
	app.use(bodyParser.json({ limit: '10mb' }));
	app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
	app.enableCors(corsOptions);

	const PORT = configService.get<string>("BURLAMASK_PORT")
	await app.listen(PORT, ()=> console.log(`Server start at port ${PORT}`));
}
bootstrap();
