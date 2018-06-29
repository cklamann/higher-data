import { intQueryConfig } from '../../../server/src/types/types';

export function newQueryConfig(): intQueryConfig {
	return {
		matches: [],
		filters: {
			fieldName: '',
			values: []
		},
		groupBy: {
			aggFunc: null,
			variable: 'name'
		},
		inflationAdjusted: 'false',
		pagination: {
			page: 1,
			perPage: 10
		},
		sort: {
			field: '',
			direction: ''
		}
	}
}