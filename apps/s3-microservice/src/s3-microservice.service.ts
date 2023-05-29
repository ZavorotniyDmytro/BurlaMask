import { Injectable } from '@nestjs/common';

@Injectable()
export class S3MicroserviceService {
  getHello(): string {
    return 'Hello World!';
  }
}
