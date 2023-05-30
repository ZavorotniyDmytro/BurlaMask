import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotoService } from './photo.service';

@Controller('photo')
export class PhotoController {
	constructor(private readonly photoService: PhotoService){}
	// get
	@Post('/upload')
	@UseInterceptors(FileInterceptor('file'))
	async create(@UploadedFile() file: Express.Multer.File, @Body() createPhotoDto: CreatePhotoDto){		
		return this.photoService.create(createPhotoDto, file)
	}
	// put
	// delete
}
