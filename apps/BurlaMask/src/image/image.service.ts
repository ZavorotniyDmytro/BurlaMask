import { Image } from '@lib/providers/image.entity';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { extname } from 'path';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { SearchService } from '../search/search.service';
import { IDescriptionSearchBody } from '../search/types/descriptionSearchBody.interface';
import { IDescription } from './dto/description.dto';

export interface ISwappedFaces{
	images: Express.Multer.File[];
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

	async swapFaces(images: Express.Multer.File[]): Promise<Express.Multer.File[]> {
		// await faceapi.nets.ssdMobilenetv1.loadFromDisk('models');

		// if (images.length < 2) {
		// 	throw new Error('Необходимо передать как минимум два изображения.');
		// }

		// const [image1, image2] = images;

		// const img1 = await loadImageFromUrl(URL.createObjectURL(image1));
  		// const img2 = await loadImageFromUrl(URL.createObjectURL(image2));

		// const detections1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
		// const detections2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

		// if (!detections1 || !detections2) {
		// 	throw new HttpException('Не удалось обнаружить лицо на одном из изображений.', HttpStatus.BAD_REQUEST);
		// }

		// const face1 = detections1.detection.box;
		// const face2 = detections2.detection.box;

		// const canvas1 = createCanvas(face1.width, face1.height);
		// const canvas2 = createCanvas(face2.width, face2.height);
		// const ctx1 = canvas1.getContext('2d');
		// const ctx2 = canvas2.getContext('2d');

		// ctx1.drawImage(img1, face1.x, face1.y, face1.width, face1.height, 0, 0, face1.width, face1.height);
		// ctx2.drawImage(img2, face2.x, face2.y, face2.width, face2.height, 0, 0, face2.width, face2.height);

		// // Создание новых экземпляров Express.Multer.File с обновленными данными изображений
		// const swappedImage1: Express.Multer.File = {
		// 	...image1,
		// 	buffer: await canvas2.toBuffer('image/jpeg'),
		// };

		// const swappedImage2: Express.Multer.File = {
		// 	...image2,
		// 	buffer: await canvas1.toBuffer('image/jpeg'),
		// };

		// // Удаление временных файлов исходных изображений
		// await fs.unlink(image1.path);
		// await fs.unlink(image2.path);

		// // Возвращение массива с обновленными изображениями
		// return [swappedImage1, swappedImage2];
		return [images[0], images[1]]
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
