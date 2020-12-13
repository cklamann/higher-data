import * as _ from "lodash";

export interface SchoolDataQueryArgs {
  matches: Match[];
  sort: QuerySort;
  pagination: PaginationArgs;
  inflationAdjusted: boolean;
  nameFilter: NameFilter;
}

export interface SchoolDataAggQueryArgs extends SchoolDataQueryArgs {
  groupBy: GroupByArgs;
}

interface GroupByArgs {
  aggFunc: string;
  variable: string;
}

interface Match {
  fieldName: string;
  valuesToMatch: string[];
}

interface NameFilter {
  fieldName: string;
  value: string;
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
  protected inflationAdjusted: boolean;
  protected matches: Match[];
  protected pagination: PaginationArgs;
  protected sort: QuerySort;
  protected nameFilter: NameFilter;

  constructor(qConfig: SchoolDataQueryArgs) {
    this.inflationAdjusted = qConfig.inflationAdjusted;
    this.matches = qConfig.matches;
    this.pagination = qConfig.pagination;
    this.sort = qConfig.sort;
    this.nameFilter = qConfig.nameFilter;
  }

  public static createBase(): SchoolDataQuery {
    return new SchoolDataQuery({
      matches: [],
      sort: {
        field: "name",
        direction: "asc",
      },
      inflationAdjusted: false,
      pagination: {
        page: 1,
        perPage: 25,
      },
      nameFilter: {
        fieldName: "",
        value: "",
      },
    });
  }

  public validate() {}

  public addMatch(variable: string, value: string | string[]) {
    const values = _.isArray(value) ? value : [value];
    this.matches.push({ fieldName: variable, valuesToMatch: values });
  }

  public getLimitArgs() {
    return this.pagination.perPage;
  }

  public getMatchArgs(): object {
    let matches: any = {
      $and: this.matches.map((match) => {
        return { [match.fieldName]: { $in: match.valuesToMatch } };
      }),
    };
    if (this.nameFilter.value) {
      matches.$and.push(this.getNameFilterArgs());
    }
    return matches;
  }

  public getNameFilterArgs(): object {
    const val = this.nameFilter.value;
    const regex = `.+${val}.+|${val}+.|.+${val}|${val}`,
      arg = this.nameFilter.fieldName ? regex : `.+`;
    return { [this.nameFilter.fieldName]: { $regex: arg, $options: "is" } };
  }

  public getPageLimit() {
    return this.pagination.perPage;
  }

  public getPageOffset() {
    return (
      this.pagination.page * this.pagination.perPage - this.pagination.perPage
    );
  }

  public getSkipArgs() {
    return this.getPageOffset();
  }

  public getSortArgs() {
    return { [this.getSortField()]: this.getSortDirection() };
  }

  public getSortDirection() {
    return this.sort.direction === "asc" ? 1 : -1;
  }

  public getSortField() {
    return this.sort.field;
  }

  public setInflationAdjusted(status: string) {
    this.inflationAdjusted = status === "true" ? true : false;
  }

  public setNameFilter(field: string, val: string = ""): void {
    this.nameFilter.fieldName = field;
    this.nameFilter.value = val;
  }

  public setPage(page: number) {
    this.pagination.page = page;
  }

  public setPagination(page: number, perPage: number) {
    this.setPage(page);
    this.setPerPage(perPage);
  }

  public setPerPage(amount: number) {
    this.pagination.perPage = amount;
  }

  public setOrder(order: string) {
    this.sort.direction = order === "desc" ? "desc" : "asc";
  }

  public setSortField(field: string) {
    this.sort.field = field;
  }
}

export class SchoolDataAggQuery extends SchoolDataQuery {
  private groupBy: GroupByArgs;

  constructor(qConfig: SchoolDataAggQueryArgs) {
    super(qConfig);
    this.groupBy = qConfig.groupBy;
  }

  public static createAgg(): SchoolDataAggQuery {
    return new SchoolDataAggQuery({
      matches: [],
      sort: {
        field: "",
        direction: "asc",
      },
      groupBy: {
        aggFunc: "",
        variable: "",
      },
      inflationAdjusted: false,
      pagination: {
        page: 1,
        perPage: 25,
      },
      nameFilter: {
        fieldName: "",
        value: "",
      },
    });
  }

  public getGroupByFunc() {
    return this.groupBy.aggFunc ? this.groupBy.aggFunc : "first";
  }

  public getGroupByField() {
    return this.groupBy.variable ? this.groupBy.variable : "name";
  }

  public getMatchArgs(): object {
    let matches: any = {
      $match: {
        $and: this.matches.map((match) => {
          return { [match.fieldName]: { $in: match.valuesToMatch } };
        }),
      },
    };
    return matches;
  }

  //todo: this should be much simpler, test
  public getNameFilterRegex(): string {
    const val = this.nameFilter.value;
    if (val) {
      return `.+${val}.+|${val}+.|.+${val}|${val}`;
    } else return ".";
  }

  public setGroupBy(variable: string, aggFunc: string) {
    this.groupBy.aggFunc = aggFunc;
    this.groupBy.variable = variable;
  }
}
