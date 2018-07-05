import * as _ from 'lodash';

export interface intSchoolDataQuery {
	matches: intMatch[];
	sort: intQuerySort;
	pagination: intPaginationArgs;
	inflationAdjusted: boolean;
}

export interface intSchoolDataAggQuery extends intSchoolDataQuery {
	groupBy: intGroupByArgs;
}

interface intGroupByArgs {
	aggFunc: string;
	variable: string;
}

interface intMatch {
	fieldName: string,
	valuesToMatch: string[]
}

interface intPaginationArgs {
	total?: number;
	page: number;
	perPage: number;
}

interface intQuerySort {
	field: string,
	direction: 'asc' | 'desc';
}

export class SchoolDataQuery {

	protected inflationAdjusted: boolean;
	protected matches: intMatch[];
	protected pagination: intPaginationArgs;
	protected sort: intQuerySort;

	constructor(qConfig: intSchoolDataQuery) {
		this.inflationAdjusted = qConfig.inflationAdjusted;
		this.matches = qConfig.matches;
		this.pagination = qConfig.pagination;
		this.sort = qConfig.sort;
	};

	public static createBase(): SchoolDataQuery {
		return new SchoolDataQuery({
			matches: [],
			sort: {
				field: 'name',
				direction: 'asc'
			},
			inflationAdjusted: false,
			pagination: {
				page: 1,
				perPage: 25
			}
		});
	}

	public validate() {

	}

	public addMatch(variable: string, value: string | string[]) {
		const values = _.isArray(value) ? value : [value];
		this.matches.push({ fieldName: variable, valuesToMatch: values });
	}

	public getLimitArgs() {
		return this.pagination.perPage;
	}

	public getMatchArgs() {
		return {
			'$and': this.matches.map(match => {
				return { [match.fieldName]: { "$in": match.valuesToMatch } };
			})
		};
	}

	public getPageLimit() {
		return this.pagination.perPage;
	}

	public getPageOffset() {
		return (this.pagination.page * this.pagination.perPage) - this.pagination.perPage;
	}

	public getSkipArgs() {
		return this.getPageOffset();
	}

	public getSortArgs() {
		return { [this.getSortField()]: this.getSortDirection() }
	}

	public getSortDirection() {
		return this.sort.direction === 'asc' ? -1 : 1;
	}

	public getSortField() {
		return this.sort.field;
	}

	public setInflationAdjusted(status: boolean) {
		this.inflationAdjusted = status;
	}

	public setPerPage(amount: number) {
		this.pagination.perPage = amount;
	}

	public setOrder(order: string) {
		const orderChecked = order === 'desc' ? 'desc' : 'asc';
		this.sort.direction = orderChecked;
	}

	public setSortField(field: string) {
		this.sort.field = field;
	}
}

export class SchoolDataAggQuery extends SchoolDataQuery {

	private groupBy: intGroupByArgs;

	constructor(qConfig: intSchoolDataAggQuery) {
		super(qConfig);
		this.groupBy = qConfig.groupBy;
	};

	public static createAgg(): SchoolDataAggQuery {
		return new SchoolDataAggQuery({
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
			pagination: {
				page: 1,
				perPage: 25
			}
		});
	}

	public getGroupByFunc() {
		return this.groupBy.aggFunc;
	}

	public getGroupByField() {
		return this.groupBy.variable;
	}

	public getMatchArgs(): any {
		return {
			"$match": {
				"$and": this.matches.map(match => {
					return { [match.fieldName]: { "$in": match.valuesToMatch } };
				})
			}
		};
	}

	public setGroupBy(variable: string, aggFunc: string) {
		this.groupBy.aggFunc = aggFunc;
		this.groupBy.variable = variable;
	}
}