import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IDescriptionSearchBody } from '../search/types/descriptionSearchBody.interface';
import { IDescription } from './dto/description.dto';
import {ImageService} from './image.service';

@Controller('images')
export class ImageController {
	constructor(private readonly imageService: ImageService){}
	
	@Get()
	findByPartDescription(@Body() data: IDescription): Promise<IDescriptionSearchBody[]>{
		return this.imageService.findByPartDescription(data)
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file'))
	create(@UploadedFile() file: Express.Multer.File, @Body() createImageDto: ICreateImageDto){		
		return this.imageService.create(createImageDto, file)
	}
}
