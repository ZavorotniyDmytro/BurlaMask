import { Image } from '@lib/providers/image.entity';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { IDescriptionSearchBody } from './types/descriptionSearchBody.interface';

@Injectable()
export class SearchService {
	index = 'image'
	constructor(private readonly elasticsearchService: ElasticsearchService){}

	async indexImage(image: Image){
		return this.elasticsearchService.index<IDescriptionSearchBody>({
			index: this.index,
			document:{
				id: image.id,
				image_url: image.image_url,
				description: image.description
			}
		})
	}

	async searchByPartDescription(partDescription: string): Promise<IDescriptionSearchBody[]> {
		const body = await this.elasticsearchService.search<IDescriptionSearchBody>({
		  index: this.index,
		  body: {
			 query: {
				match: {
				  description: {
						query: partDescription,

						// fuzziness: {
						// 	fuzziness: 2,
						// 	prefix_length: 2,
						// 	max_expansions: 50,
						// }
						fuzziness: 'auto', 
				  },
				},
			 },
		  },
		});
	 
		const hits = body.hits.hits;
		const results = hits.map((hit) => hit._source);
	 
		return results;
	 }
}
