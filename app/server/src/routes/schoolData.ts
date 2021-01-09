import { SchoolDataSchema } from "../schemas/SchoolDataSchema";
import {
  Filter,
  SchoolDataQuery,
  SchoolDataAggQuery,
} from "../modules/SchoolDataQuery";
import { Router, Request } from "express";
import { get } from "lodash";

export interface SchoolQueryParams {
  filters?: string;
  inflationAdjusted?: string;
  order?: string;
  page?: string;
  perPage?: string;
  search?: string;
  sort?: string;
  type?: string;
}

export interface SchoolAggQueryParams extends SchoolQueryParams {
  gbField: "state" | "sector";
  gbFunc: "sum" | "average";
}

let router = Router();

type SchoolDataRequest<T> = Request<{ [key: string]: any }, any, any, T>;

router.get("/", function (
  req: SchoolDataRequest<SchoolQueryParams>,
  res,
  next
) {
  const query = transformQueryParams(req.query, new SchoolDataQuery({}));
  SchoolDataSchema.schema.statics
    .fetch(query)
    .then((resp: any) => res.json(resp))
    .catch((err: Error) => next(err));
});

router.get(
  "/aggregate",
  (req: SchoolDataRequest<SchoolAggQueryParams>, res, next) => {
    const query = transformAggQueryParams(
      req.query,
      new SchoolDataAggQuery({})
    );
    SchoolDataSchema.schema.statics
      .fetchAggregate(query)
      .then((resp: any) => res.json(resp))
      .catch((err: Error) => next(err));
  }
);

//todo: all these have to be tested

export const transformAggQueryParams = (
  args: SchoolAggQueryParams,
  query: SchoolDataAggQuery
) => {
  let qcF = transformQueryParams(args, query) as SchoolDataAggQuery;
  qcF.setGroupBy(args.gbField, args.gbFunc);
  return qcF;
};

export const transformQueryParams = (
  params: SchoolQueryParams | SchoolAggQueryParams,
  query: SchoolDataQuery | SchoolDataAggQuery
) => {
  //filters=name:gt:foo|value:eq:bar
  if (params.filters) {
    const filters = getFiltersFromQueryString(params.filters);
    Object.keys(filters).forEach((filter) => {
      query.addFilter(filter, filters[filter]);
    });
  }
  if (params.page) query.setPage(+params.page);
  if (params.perPage) query.setPerPage(+params.perPage);
  if (params.order) query.setOrder(params.order);
  if (params.sort) query.setSortField(params.sort);
  if (params.inflationAdjusted)
    query.setInflationAdjusted(params.inflationAdjusted);
  if (params.search) query.setSearchField(params.search);
  console.log(query);
  return query;
};

export const getFiltersFromQueryString = (stringPart: string) =>
  stringPart
    .split("|")
    .map((filter) => {
      const parts = filter.split(":");
      return {
        field: get(parts, "[0]"),
        comparator: get(parts, "[1]"),
        value: get(parts, "[2]"),
      };
    })
    .filter((v) => !!v.field && !!v.comparator && !!v.value)
    .reduce(
      (a, c) => ({
        [c.field]: {
          comparator: c.comparator,
          value: c.value,
        },
        ...a,
      }),
      {} as Record<string, Filter>
    );

module.exports = router;
