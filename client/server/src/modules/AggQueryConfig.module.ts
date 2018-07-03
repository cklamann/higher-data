export interface intAggQueryConfig {
	matches: object[];
	sort: intQuerySort;
	pagination: intPaginationArgs;
	inflationAdjusted: boolean;
	variable: string;
	groupBy: intGroupByArgs;
}

interface intGroupByArgs {
	aggFunc: string;
	variable: string;
}

interface intQuerySort {
	field: string,
	direction: 'asc' | 'desc';
}

interface intPaginationArgs {
	total?: number;
	page: number;
	perPage: number;
}

/*
	class's purpose is to create an aggregate query for the school_data table based on args passed through 
		the api

	todo: transform into AggregateQuery class
			-- should be composed, in part, of smaller query parts, like matches, sort, etc
			-- these will be pulled out of get request and bound up into object
			-- each one of these should have a fromQueryVar method that spins up the object
			-- but this can be down the line..., maybe...

*/

export class AggQueryConfig {

	private groupBy: intGroupByArgs;
	private inflationAdjusted: boolean;
	private matches: object[];
	private pagination: intPaginationArgs;
	private sort: intQuerySort;
	private variable: string;

	constructor(qConfig: intAggQueryConfig) {
		this.groupBy = qConfig.groupBy;
		this.inflationAdjusted = qConfig.inflationAdjusted;
		this.matches = qConfig.matches;
		this.pagination = qConfig.pagination;
		this.sort = qConfig.sort;
		this.variable = qConfig.variable;
	};

	public static create(): intAggQueryConfig {
		return {
			matches: [],
			sort: {
				field: '',
				direction: 'asc'
			},
			groupBy: {
				aggFunc: '',
				variable: ''
			},
			inflationAdjusted: false,
			variable: '',
			pagination: {
				page: 1,
				perPage: 25
			}
		}
	}

	public validate() {

	}

	public getGroupByFunc() {
		return this.groupBy.aggFunc;
	}

	public getGroupByField() {
		return this.groupBy.variable;
	}

	public getMatches() {
		return this.matches.filter(match => match);
	}

	public getPageLimit() {
		return this.pagination.perPage;
	}

	public getPageOffset() {
		return (this.pagination.page * this.pagination.perPage) - this.pagination.perPage;
	}

	public getSortDirection() {
		return this.sort.direction === 'asc' ? -1 : 1;
	}

	public getSortField() {
		return this.sort.field;
	}

	public getVariable() {
		return this.variable;
	}
}