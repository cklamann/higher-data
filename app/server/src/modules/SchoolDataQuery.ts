import { get } from "lodash";

export interface Filter {
  comparator: "gt" | "lt" | "eq" | "in";
  value: any;
}

export interface StringSearch {
  field: string;
  q: string;
}

export interface SchoolDataQueryArgs {
  filters?: Record<string, Filter>;
  sort?: QuerySort;
  pagination?: PaginationArgs;
  inflationAdjusted?: boolean;
  search?: StringSearch;
}

export interface SchoolDataAggQueryArgs extends SchoolDataQueryArgs {
  groupBy?: GroupByArgs;
}

interface GroupByArgs {
  aggFunc: string;
  variable: string;
}

interface PaginationArgs {
  total?: number;
  page: number;
  perPage: number;
}

interface QuerySort {
  field: string;
  direction: "asc" | "desc";
}

export class SchoolDataQuery {
  protected query: SchoolDataQueryArgs;

  constructor(qConfig: SchoolDataQueryArgs) {
    this.query = {};
    this.query.filters = {};
    this.query.sort = { field: "_id", direction: "asc" };
    this.query.pagination = { page: 1, perPage: 20 };
    this.query = { ...this.query, ...qConfig };
  }

  public validate() {}

  public addFilter(variable: string, value: Filter) {
    this.query.filters[variable] = value;
  }

  public getPerPage() {
    return this.query.pagination.perPage;
  }

  public getMongoFilters() {
    const { filters } = this.query;
    if (!Object.keys(filters).length) return {} as Record<string, Filter>;
    return {
      $and: Object.keys(filters).map((filter) => {
        const operator = `$${filters[filter].comparator}`;
        return { [filter]: { [operator]: filters[filter].value } };
      }),
    };
  }

  public getSearchField() {
    return this.query;
  }

  public getPageOffset() {
    return this.getPage() * this.getPerPage() - this.getPerPage();
  }

  public getPage = () => this.query.pagination.page;

  public getSkipArg() {
    return this.getPageOffset();
  }

  public getSortArgs() {
    return { [this.getSortField()]: this.getSortDirection() };
  }

  public getSortDirection() {
    return this.query.sort.direction === "asc" ? 1 : -1;
  }

  public getSortField() {
    return this.query.sort.field;
  }

  public setInflationAdjusted(status: string) {
    this.query.inflationAdjusted = status === "true" ? true : false;
  }

  public setPage(page: number) {
    this.query.pagination.page = page;
  }

  public setPagination(page: number, perPage: number) {
    this.setPage(page);
    this.setPerPage(perPage);
  }

  public setPerPage(amount: number) {
    this.query.pagination.perPage = amount;
  }

  public setOrder(order: string) {
    this.query.sort.direction = order === "desc" ? "desc" : "asc";
  }

  public setSearchField(queryPart: string) {
    const parts = queryPart.split(":");
    if (parts.length != 2) return false;
    this.query.search.field = parts[0];
    this.query.search.q = parts[1];
  }

  public setSortField(field: string) {
    this.query.sort.field = field;
  }
}

export class SchoolDataAggQuery extends SchoolDataQuery {
  protected groupBy: GroupByArgs;
  protected query: SchoolDataAggQueryArgs;

  constructor(qConfig: SchoolDataAggQueryArgs) {
    super(qConfig);
    this.query.groupBy = qConfig.groupBy;
  }

  public getGroupByFunc() {
    return this.groupBy.aggFunc ? this.groupBy.aggFunc : "first";
  }

  public getGroupByField() {
    return this.groupBy.variable ? this.groupBy.variable : "name";
  }

  public setGroupBy(variable: string, aggFunc: string) {
    this.groupBy.aggFunc = aggFunc;
    this.groupBy.variable = variable;
  }
}
