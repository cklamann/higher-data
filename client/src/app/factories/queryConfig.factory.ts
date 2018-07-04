import { intAggQueryConfig } from '../../../server/src/modules/AggQueryConfig.module';

export function newAggQueryConfig(): intAggQueryConfig {
	return {
		matches: [],
		groupBy: {
			aggFunc: null,
			variable: 'name'
		},
		inflationAdjusted: false,
		pagination: {
			page: 1,
			perPage: 10
		},
		sort: {
			field: '',
			direction: 'asc'
		},
		variable: ''
	}
}