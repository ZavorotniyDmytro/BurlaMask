import { BadRequestException, Body, Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ExpressAdapter, FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { IDescriptionSearchBody } from '../search/types/descriptionSearchBody.interface';
import { IDescription } from './dto/description.dto';
import {ImageService} from './image.service';

@Controller('images')
export class ImageController {
	constructor(private readonly imageService: ImageService){}

	@Post('/description')
	findByPartDescription(@Body() data: IDescription): Promise<IDescriptionSearchBody[]>{
		return this.imageService.findByPartDescription(data)
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file'))
	upload(@Body() createImageDto: ICreateImageDto): Promise<string>{
		return this.imageService.update(createImageDto)
	}

	// @Post('/upload')
	// create(@Body() createImageDto: ICreateImageDto): Promise<string>{
	// 	console.log(createImageDto);
		
	// 	const parts = createImageDto.file.split(';base64,');
	// 	const mimeType = parts[0].split(':')[1];
	// 	const data = parts[1];
	// 	const buffer = Buffer.from(data, 'base64');
	//    const file: Express.Multer.File = {
	// 		fieldname: 'fieldname',
	// 		originalname: 'image1.jpg',
	// 		encoding: '7bit',
	// 		mimetype: mimeType,
	// 		buffer: buffer,
	// 		size: buffer.length,
	// 		stream: new Readable,
	// 		destination: '',
	// 		filename: '',
	// 		path: ''
	// 	}
	// 	return this.imageService.create(createImageDto, file)
	// }

	@Post('/swap')
	@UseInterceptors(
	FileFieldsInterceptor([
		{ name: 'images', maxCount: 2 },
	])
	)
	async swapFaces(
	@UploadedFiles() files: { images?: Express.Multer.File[] }
	) {
		if (!files || !files.images || files.images.length !== 2) {
			throw new BadRequestException('Two images are required.');
		}
		return this.imageService.swapFaces(files.images[0], files.images[1]);
	}
}
