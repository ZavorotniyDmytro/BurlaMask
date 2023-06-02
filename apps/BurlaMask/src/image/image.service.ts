import { Image } from '@lib/providers/image.entity';
import { HttpException, HttpStatus, Inject, Injectable, UploadedFile } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SearchService } from '../search/search.service';
import { IDescriptionSearchBody } from '../search/types/descriptionSearchBody.interface';
import { IDescription } from './dto/description.dto';
import axios from 'axios';
import * as FormData from 'form-data';


export interface ISwappedFaces{
	image1: Express.Multer.File;
	image2: Express.Multer.File;
}


@Injectable()
export class ImageService {
	constructor(
		@Inject('S3_SERVICE')
		private readonly s3Service: ClientProxy,
		@InjectRepository(Image)
		private readonly imageRepository: Repository<Image>,
		private readonly searchService: SearchService,
	) {}

	async findByPartDescription(
		data: IDescription,
	): Promise<IDescriptionSearchBody[]> {
		return await this.searchService.searchByPartDescription(data.description);
	}

	async create(
		createImageDto: ICreateImageDto,
		file: Express.Multer.File,
	): Promise<string> {
		const newRecord = {
			image_url: '',
			description: createImageDto.description,
		};
		let image = this.imageRepository.create(newRecord);
		image = await this.imageRepository.save(image);

		file.filename = this.processImageFile(file, image.id);
		const image_url$ = this.s3Service.send<string, Express.Multer.File>(
			'upload',
			file,
		);
		image.image_url = await lastValueFrom(image_url$);

		await this.searchService.indexImage(image);
		image = await this.imageRepository.save(image);
		return image.image_url;
	}

	async swapFaces(image1: Express.Multer.File, image2: Express.Multer.File): Promise<ISwappedFaces> {
		if (this.isImageFile(image1) && this.isImageFile(image2)) {
		  try {
			const formData = new FormData();
			formData.append('image1', image1.buffer, { filename: image1.originalname });
			formData.append('image2', image2.buffer, { filename: image2.originalname });

			const flaskResponse = await axios.post('http://localhost:5000/process_images', formData, {
			  headers: formData.getHeaders(),
			});

			// Повернення відповіді клієнту
			return flaskResponse.data;
		  } catch (error) {
			// Обробка помилки
			console.error(error);
		  }
		}
	}

	private processImageFile(
		file: Express.Multer.File,
		fileName: string,
	): string {

		if (!this.isImageFile(file)) {
			throw new HttpException(
			'Wrong file extension. Must be: jpg, jpeg, png',
			HttpStatus.BAD_REQUEST,
			);
		}

		const { size } = file;
		if (size > 3 * 1024 * 1024) {
			throw new HttpException(
			'The image must be no larger than 3 MB',
			HttpStatus.BAD_REQUEST,
			);
		}

		const newFileName = `${fileName}-image.${extname(file.originalname).toLowerCase()}`;

		return newFileName;
	}

	private isImageFile(file: Express.Multer.File): boolean {
		const allowedExtensions = ['.jpg', '.jpeg', '.png'];
		const fileExtension = extname(file.originalname).toLowerCase();
		return allowedExtensions.includes(fileExtension);
	}
}
