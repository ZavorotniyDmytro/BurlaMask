import { IDescriptionSearchBody } from "./descriptionSearchBody.interface"

export interface IDescriptionSearchResponse {
	hits: {
		total: number;
		hits: Array<{
			_source: IDescriptionSearchBody;
		}>
	}
}