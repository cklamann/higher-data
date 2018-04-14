//base query config

export interface intQueryConfig {
	matches: object[];
	sort: intQuerySort;
	pagination: intPaginationArgs;
	inflationAdjusted: string;
	filters: intQueryFilter;
}

export interface intQuerySort {
	field: string,
	direction: "-" | "";
}

export interface intQueryFilter {
	fieldName: string,
	values: string[]
}

export interface intPaginationArgs {
	total?: number;
	page: number;
	perPage: number;
}