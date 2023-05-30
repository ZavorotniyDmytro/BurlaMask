import { Image } from '@lib/providers/image.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SearchService } from '../search/search.service';
import { IDescriptionSearchBody } from '../search/types/descriptionSearchBody.interface';
import { IDescription } from './dto/description.dto';

@Injectable()
export class ImageService {
	constructor(
		@Inject('S3_SERVICE') 
		private readonly s3Service: ClientProxy,
		@InjectRepository(Image) 
		private readonly imageRepository: Repository<Image>,
		private readonly searchService: SearchService
	){}

	async findByPartDescription(data: IDescription): Promise<IDescriptionSearchBody[]>{
		return await this.searchService.searchByPartDescription(data.description)
	}

	async create(createImageDto: ICreateImageDto, file: Express.Multer.File): Promise<Image>{
		const newRecord = { image_url: "", description: createImageDto.description}
		let image = this.imageRepository.create(newRecord)		
		image = await this.imageRepository.save(image)

		file.filename = this.processImageFile(file, image.id)
		const image_url$ = this.s3Service.send<string, Express.Multer.File>('upload', file)
		image.image_url = await lastValueFrom(image_url$)				
		
		await this.searchService.indexImage(image)
		return await this.imageRepository.save(image)
	}

	private processImageFile(file: Express.Multer.File, fileName: string): string {
		const fileExtension = file.originalname.split('.').pop();
	 
		const allowedExtensions = ['jpg', 'jpeg', 'png'];
		if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
		  throw new HttpException("Wrong file extension. Must be: jpg, jpeg, png", HttpStatus.BAD_REQUEST, );
		}
	 
		const { size } = file
		if (size > 3 * 1024 * 1024) {
			throw new HttpException("The image must be no larger than 3 MB", HttpStatus.BAD_REQUEST);
		}
	 
				const newFileName = `${fileName}-image.${fileExtension}`;
	 
		return newFileName;
	 }
}
