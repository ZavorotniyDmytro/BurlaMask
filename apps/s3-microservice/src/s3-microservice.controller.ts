import { Controller, Get } from '@nestjs/common';
import { S3MicroserviceService } from './s3-microservice.service';

@Controller()
export class S3MicroserviceController {
  	constructor(private readonly s3MicroserviceService: S3MicroserviceService) {}

	
}
