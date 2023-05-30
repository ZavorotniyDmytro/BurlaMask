import { Image } from '@lib/providers/image.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Awss3Module } from '../awss3/awss3.module';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';

@Module({
	imports: [Awss3Module, TypeOrmModule.forFeature([Image])],
	controllers: [PhotoController],
	providers: [PhotoService]
})
export class PhotoModule {}
