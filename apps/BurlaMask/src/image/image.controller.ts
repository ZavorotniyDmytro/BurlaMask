import { Body, Controller, Get, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
	create(@UploadedFile() file: Express.Multer.File, @Body() createImageDto: ICreateImageDto): Promise<string>{		
		return this.imageService.create(createImageDto, file)
	}

	@Post('/swap')
	@UseInterceptors(
		FileFieldsInterceptor([
			{ name: 'images', maxCount: 2 },
		 ])
	)
	async swapFaces(
		@UploadedFiles() files: { images?: Express.Multer.File[] }
	) {
		return this.imageService.swapFaces(files.images[0], files.images[1])
	}
}
