import { Image } from '@lib/providers/image.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Awss3Module } from '../awss3/awss3.module';
import { SearchModule } from '../search/search.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

@Module({
	imports: [Awss3Module, TypeOrmModule.forFeature([Image]), SearchModule],
	controllers: [ImageController],
	providers: [ImageService]
})
export class ImageModule {}
