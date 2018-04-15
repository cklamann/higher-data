//base query config

export interface intQueryConfig {
	matches: object[];
	sort: intQuerySort;
	pagination: intPaginationArgs;
	inflationAdjusted: string;
	filters: intQueryFilter;
	groupBy: intGroupByArgs;
}

interface intGroupByArgs {
  aggFunc: string;
  variable: string;
}

interface intQuerySort {
	field: string,
	direction: "-" | "";
}

interface intQueryFilter {
	fieldName: string,
	values: string[]
}

interface intPaginationArgs {
	total?: number;
	page: number;
	perPage: number;
}