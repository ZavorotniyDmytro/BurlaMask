import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3MicroserviceService {
	private readonly s3: AWS.S3;

	constructor(
		private readonly configService: ConfigService

	) {
		this.s3 = new AWS.S3({
			accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID'),
			secretAccessKey: this.configService.get<string>('S3_SECRET_ACCESS_KEY'),
			region: this.configService.get('AWS_REGION'),
		});
	}

	async uploadFileToS3(file): Promise<string> {
		file.buffer = Buffer.from(file.buffer.data)			
		const result = await this.s3
		  .upload({
			 Bucket: this.configService.get<string>('BUCKET_NAME'),
			 Key: file.filename,
			 Body: file.buffer,
			 ACL: 'public-read',
		  })
		  .promise();
		return result.Location;
	}
}
