import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';

@Module({
  imports: [
	ConfigModule.forRoot({
		envFilePath: ['./libs/providers/.env'],	
	}),
	TypeOrmModule.forRootAsync({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get<string>('POSTGRES_HOST'),
		port: configService.get<number>('POSTGRES_PORT'),
		username: configService.get<string>('POSTGRES_USER'),
		password: configService.get<string>('POSTGRES_PASSWORD'),
		database: configService.get<string>('POSTGRES_DB'),
		entities: [__dirname + '/../**/*.entity{.ts,.js}', Image],
		// autoLoadEntities: true,
		synchronize: true,
	}),	
})],
})
export class ProvidersModule {}
