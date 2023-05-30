import { Image } from '@lib/providers/image.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

@Injectable()
export class PhotoService {
	constructor(
		@Inject('S3_SERVICE') private s3Service: ClientProxy,
		@InjectRepository(Image) private readonly photoRepository: Repository<Image>
	){}

		

	async create(createPhotoDto: CreatePhotoDto, file: Express.Multer.File): Promise<Image>{
		const newRecord = { image_url: "", description: createPhotoDto.description}
		let image = this.photoRepository.create(newRecord)		
		image = await this.photoRepository.save(image)

		file.filename = this.processPhotoFile(file, image.id)
		const image_url$ = this.s3Service.send<string, Express.Multer.File>('upload', file)
		image.image_url = await lastValueFrom(image_url$)				
		
		return await this.photoRepository.save(image)
	}

	private processPhotoFile(file: Express.Multer.File, fileName: string): string {
		const fileExtension = file.originalname.split('.').pop();
	 
		// Проверка на формат файла (допустимы только расширения .jpg, .jpeg, .png)
		const allowedExtensions = ['jpg', 'jpeg', 'png'];
		if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
		  throw new HttpException("Wrong file extension. Must be: jpg, jpeg, png", HttpStatus.BAD_REQUEST, );
		}
	 
		const { size } = file
		if (size > 3 * 1024 * 1024) {
			throw new HttpException("The photo must be no larger than 3 MB", HttpStatus.BAD_REQUEST);
		}
	 
		// Формирование нового имени файла
		const newFileName = `${fileName}-photo.${fileExtension}`;
	 
		return newFileName;
	 }
}
