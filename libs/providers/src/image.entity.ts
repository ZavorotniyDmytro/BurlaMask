import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SelectedCity {
	@PrimaryGeneratedColumn('uuid')
	id: number

	@Column({ type: 'varchar', length: 255 })
	image_url: string

	@Column({ type: 'varchar', length: 255 })
	description: string

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	created_at: Date
}