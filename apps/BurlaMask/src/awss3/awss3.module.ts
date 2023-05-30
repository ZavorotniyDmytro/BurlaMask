import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

const S3Service = {
	provide: 'S3_SERVICE',
	useFactory: (configService: ConfigService) => {
		const user = configService.get('RABBITMQ_DEFAULT_USER')
		const password = configService.get('RABBITMQ_DEFAULT_PASS')
		const host = configService.get('RABBITMQ_HOST')
		const queue = configService.get('RABBITMQ_QUEUE_NAME')

		return ClientProxyFactory.create({
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
		 })
	},
	inject: [ConfigService],
	imports: [ConfigModule]   
}

@Module({
	providers: [S3Service],
	exports: [S3Service],
})
export class Awss3Module {}
