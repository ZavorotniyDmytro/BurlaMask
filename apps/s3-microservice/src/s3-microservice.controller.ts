import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3MicroserviceService } from './s3-microservice.service';

@Controller()
export class S3MicroserviceController {
  	constructor(private readonly s3MicroserviceService: S3MicroserviceService) {}

	@MessagePattern('upload')
	async create(@Payload() file: Express.Multer.File, @Ctx() context: RmqContext): Promise<string> {	
		const url = this.s3MicroserviceService.uploadFileToS3(file);

		const channel = context.getChannelRef();
		const originalMsg = context.getMessage();
		channel.ack(originalMsg);

		return url
	}
}
