import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { S3MicroserviceModule } from './s3-microservice.module';

async function bootstrap() {
	const app = await NestFactory.create(S3MicroserviceModule);
	const configService = app.get(ConfigService)
	const user = configService.get('RABBITMQ_DEFAULT_USER')
	const password = configService.get('RABBITMQ_DEFAULT_PASS')
	const host = configService.get('RABBITMQ_HOST')
	const queue = configService.get('RABBITMQ_QUEUE_NAME')

	app.connectMicroservice<MicroserviceOptions>({
		transport: Transport.RMQ,
		options: {
			urls: [`amqp://${user}:${password}@${host}`],
			queue: queue,
			queueOptions: {
		   	durable: false,
			},
			noAck: false,
      	prefetchCount: 1,
		},

	});

	app.startAllMicroservices();
	const PORT = configService.get<string>("S3_MICROSERVICE_PORT")
	await app.listen(PORT, ()=> console.log(`Server start at port ${PORT}`));
}
bootstrap();
